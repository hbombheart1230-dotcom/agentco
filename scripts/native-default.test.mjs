import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {menuEntry,parseEntry,mainPlan,mainEnvironment,launchNative} from './agentco.mjs';
import {nativeFreeMain} from './native-free-main.mjs';
const noAccess=()=>{throw Error('Key/pricing must not be accessed.');};
test('native-default: menu 2/4 warn and cancel by default or ambiguous answer',async()=>{
 for(const choice of ['2','4'])for(const answer of ['','n','no','ok','true']){
  const prompts=[],answers=[choice,answer];const entry=await menuEntry(async p=>{prompts.push(p);return answers.shift();});
  assert.deepEqual(entry,{kind:'cancel'});assert.equal(prompts.length,2);
  for(const warning of ['not guaranteed','login','charges','[y/N]'])assert.ok(prompts[1].includes(warning));
 }
});
test('native-default: explicit yes selects native Claude/Hermes, 1/3 remain ordinary',async()=>{
 for(const [choice,main] of [['2','claude'],['4','hermes']])for(const answer of ['y','YES',' yes ']){
  const answers=[choice,answer];assert.deepEqual(await menuEntry(async()=>answers.shift()),{kind:'main',main,args:[],nativeDefault:true});
 }
 for(const [choice,main] of [['','pi'],['1','pi'],['3','codex']]){let count=0;const entry=await menuEntry(async()=>{count++;return choice;});assert.deepEqual(entry,{kind:'main',main,args:[]});assert.equal(count,1);}
 await assert.rejects(menuEntry(async()=> '5'));await assert.rejects(menuEntry(async()=>{throw Error('aborted');}));
});
test('native-default: non-TTY needs exact opt-in form and does not route Pi/Codex/Workers',()=>{
 for(const main of ['claude','hermes']){
  assert.deepEqual(parseEntry(['--main',main],false),{kind:'main',main,args:[]});
  assert.deepEqual(parseEntry(['--main',main,'--native-default','--version'],false),{kind:'main',main,args:['--version'],nativeDefault:true});
 }
 for(const main of ['pi','codex'])assert.throws(()=>parseEntry(['--main',main,'--native-default'],false));
 assert.deepEqual(parseEntry(['--delegate','claude','add42'],false),{kind:'delegate',target:'claude',job:'add42'});
});
test('native-default: Claude/Hermes diagnostics independent of key, never default fallback',async()=>{
 for(const [main,status] of [['claude','CLAUDE_UNSUPPORTED'],['hermes','BLOCKED']])for(const key of [()=>'',()=> 'fixture',noAccess]){
  const r=await nativeFreeMain({main,file:'fixture.exe',args:[]},{},{key,pricing:noAccess});
  assert.equal(r.plan.status,status);assert.equal(r.plan.file,undefined);assert.ok(r.plan.reason.includes(`--main ${main} --native-default`));
 }
 // An opt-in cannot bypass Codex's missing-key gate even if a caller sets the internal flag.
 assert.equal((await nativeFreeMain({main:'codex',file:'fixture.exe',args:['--no-daemon']},{},{nativeDefault:true,key:()=>'',pricing:noAccess})).plan.status,'CONFIG_REQUIRED');
});
test('native-default: identical trusted plan, native args/env/stdio/cwd and exits; no injected key/prompt',async()=>{
 for(const main of ['claude','hermes']){
  const args=['--version','argument with spaces'],p=mainPlan(main,args,{[main]:()=>`C:/native ${main}.exe`});
  const inherited={HOME:'existing',USERPROFILE:'existing',NATIVE:'keep'},env=mainEnvironment(main,inherited);
  const r=await nativeFreeMain(p,env,{nativeDefault:true,key:noAccess,pricing:noAccess});
  assert.equal(r.plan,p);assert.equal(r.env,env);assert.equal(r.plan.args,args);assert.deepEqual(env,{...inherited,AGENTCO_MAIN:main});
  const signals=new EventEmitter(),child=new EventEmitter();let seen;
  const exit=launchNative(r.plan,r.env,(file,argv,options)=>{seen={file,argv,options};return child;},signals);
  assert.equal(seen.file,p.file);assert.equal(seen.argv,args);assert.equal(seen.options.env,env);assert.equal(seen.options.stdio,'inherit');assert.equal(seen.options.shell,false);assert.ok(seen.options.cwd);
  signals.emit('SIGINT');child.emit('exit',23);assert.equal(await exit,23);assert.equal(signals.listenerCount('SIGINT'),0);
 }
});
