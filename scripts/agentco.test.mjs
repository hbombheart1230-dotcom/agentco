import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtempSync,mkdirSync,writeFileSync,readFileSync,copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { mains,menuChoice,parseEntry,mainPlan,mainEnvironment,namedJob,launchNative } from './agentco.mjs';

test('selector: default, four choices, invalid, no-TTY and legacy Pi args',()=>{
 assert.equal(menuChoice(''),'pi');for(let i=1;i<=4;i++)assert.equal(menuChoice(String(i)),mains[i-1]);
 for(const bad of ['0','5','claude','1; echo nope'])assert.throws(()=>menuChoice(bad));
 assert.equal(parseEntry([],true).kind,'menu');assert.deepEqual(parseEntry([],false),{kind:'main',main:'pi',args:[]});
 assert.deepEqual(parseEntry(['--version'],true),{kind:'main',main:'pi',args:['--version']});
 assert.equal(parseEntry(['--main','codex','--help'],true).main,'codex');assert.throws(()=>parseEntry(['--main','unknown'],false));
});
test('TUI correction: all native empty/ordinary args launch without profile override',()=>{
 for(const main of mains.slice(1)){
  const lookup={[main]:()=>`C:/Installed tools/${main}.exe`};
  assert.equal(mainPlan(main,['--version'],lookup).file,lookup[main]());
  assert.equal(mainPlan(main,[],lookup).file,lookup[main]());assert.deepEqual(mainPlan(main,[],lookup).args,main==='codex'?['--no-daemon']:[]);
  const ordinary=['--help','argument with spaces'];assert.deepEqual(mainPlan(main,ordinary,lookup).args,main==='codex'?['--no-daemon',...ordinary]:ordinary);
  assert.equal(mainPlan(main,['--version'],{[main]:()=>{throw Error();}}).status,'NOT_READY');
 }
 const args=['--system-prompt','two words "quoted"','C:/path with spaces/x.js'];assert.deepEqual(mainPlan('pi',args).args.slice(1),args);
});
test('selector: inherited terminal, shell false, exit and Ctrl+C handoff',async()=>{
 const signals=new EventEmitter(),child=new EventEmitter();let seen;
 const run=launchNative({file:'C:/A B/cli.exe',args:['two words','"quoted"']},{SAFE:'fixture'},(file,args,options)=>{seen={file,args,options};return child;},signals);
 assert.equal(seen.options.stdio,'inherit');assert.equal(seen.options.shell,false);assert.equal(seen.options.windowsHide,false);assert.equal(seen.options.env.SAFE,'fixture');
 signals.emit('SIGINT');assert.equal(signals.listenerCount('SIGINT'),1);child.emit('exit',null,'SIGINT');assert.equal(await run,130);assert.equal(signals.listenerCount('SIGINT'),0);
 const other=new EventEmitter();const exit=launchNative({file:'cli',args:[]},{},()=>other,signals);other.emit('exit',23);assert.equal(await exit,23);
});
test('delegate: named identity, failures/no fallback, fixed-only and no self-spawn',async()=>{
 const calls=[];const invokers=Object.fromEntries(mains.slice(1).map(h=>[h,async(job)=>{calls.push(h);return {harness:h,job,status:'PASS',output:'ADD42=42'};}]));
 for(const h of mains.slice(1)){const r=await namedJob(h,'add42',undefined,invokers,'other');assert.equal(r.harness,h);assert.equal(r.fallback,false);}
 assert.deepEqual(calls,['claude','codex','hermes']);
 assert.equal((await namedJob('codex','add42',undefined,{codex:async()=>({harness:'claude',status:'PASS',output:'ADD42=42'})},'other')).status,'FAIL');
 await assert.rejects(namedJob('codex','private.js',undefined,invokers));assert.equal((await namedJob('pi','add42',undefined,invokers,'other')).status,'NOT_READY');
 assert.equal((await namedJob('claude','add42',undefined,invokers,'claude')).status,'NOT_READY');assert.equal(calls.length,3);
 assert.throws(()=>parseEntry(['--delegate','claude','add42','private extra'],false));
});
test('selector: Windows batch argv with spaces, status and caller cwd preserved',()=>{
 if(process.platform!=='win32')return;
 const area=mkdtempSync(join(tmpdir(),'agentco menu with spaces '));mkdirSync(join(area,'bin'));mkdirSync(join(area,'scripts'));
 copyFileSync('bin/agentco.cmd',join(area,'bin','agentco.cmd'));
 writeFileSync(join(area,'scripts','agentco.mjs'),"import {writeFileSync} from 'node:fs';writeFileSync('argv.json',JSON.stringify({args:process.argv.slice(2),cwd:process.cwd()}));process.exitCode=23;");
 const caller=process.cwd();const r=spawnSync(process.env.COMSPEC,['/d','/s','/c',`""${join(area,'bin','agentco.cmd')}" --main pi "two words" "C:\\path with spaces\\x.js""`],{cwd:caller,encoding:'utf8',windowsHide:true,windowsVerbatimArguments:true});
 assert.equal(r.status,23,r.stderr);const got=JSON.parse(readFileSync(join(area,'argv.json'),'utf8'));assert.deepEqual(got.args,['--main','pi','two words','C:\\path with spaces\\x.js']);assert.equal(got.cwd,area);assert.equal(process.cwd(),caller);
});

test('TUI correction: all four Main tags preserve inherited native environment',()=>{
 const inherited={HOME:'existing home',USERPROFILE:'existing profile',NATIVE_SETTING:'keep',AGENTCO_MAIN:'old'};
 for(const main of mains){const env=mainEnvironment(main,inherited);assert.deepEqual(env,{...inherited,AGENTCO_MAIN:main,...(main==='codex'?{TERM:'xterm-256color'}:{})});assert.equal(inherited.AGENTCO_MAIN,'old');}
});

test('Codex menu fix: native default and custom options are preserved without duplicate flag',()=>{
 const lookup={codex:()=> 'C:/pinned codex/codex.exe'};
 assert.deepEqual(mainPlan(menuChoice('3'),[],lookup).args,['--no-daemon']);
 const custom=['--no-daemon','--model','user-choice','--cd','C:/path with spaces'];assert.deepEqual(mainPlan('codex',custom,lookup).args,custom);assert.equal(custom.length,5);
 assert.deepEqual(mainPlan('codex',['--','--no-daemon'],lookup).args,['--no-daemon','--','--no-daemon']);
});
test('Codex menu fix: TERM fallback is child-only and valid native TERM remains',()=>{
 for(const term of [undefined,'','dumb','xterm-256color','vt100']){
  const inherited={TERM:term,HOME:'native home'};const env=mainEnvironment('codex',inherited);assert.equal(env.TERM,!term||term==='dumb'?'xterm-256color':term);assert.equal(inherited.TERM,term);
  for(const main of ['pi','claude','hermes'])assert.equal(mainEnvironment(main,inherited).TERM,term);
 }
});
