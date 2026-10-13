import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {menuEntry,parseEntry,mainPlan,mainEnvironment,launchNative} from './agentco.mjs';
test('P5.9: four native menu choices need exactly one question, no approval or price call',async()=>{
 const previous=globalThis.fetch;globalThis.fetch=()=>{throw Error('No API metadata request allowed.');};
 try{for(const [choice,main] of [['','pi'],['1','pi'],['2','claude'],['3','codex'],['4','hermes']]){let questions=0;assert.deepEqual(await menuEntry(async()=>{questions++;return choice;}),{kind:'main',main,args:[]});assert.equal(questions,1);}}
 finally{globalThis.fetch=previous;}
});
test('P5.9: native arguments preserved, no injected model/provider or prompt; alias and Worker parse preserved',()=>{
 for(const main of ['claude','codex','hermes']){
  const args=['--model','user-choice','--cd','path with spaces'];const plan=mainPlan(main,args,{[main]:()=> 'fixture.exe'});
  assert.deepEqual(plan.args,main==='codex'?['--no-daemon',...args]:args);assert.equal(args.length,4);assert.equal(plan.args.includes('-c'),false);
  assert.deepEqual(mainPlan(main,[],{[main]:()=> 'fixture.exe'}).args,main==='codex'?['--no-daemon']:[]);
 }
 for(const main of ['claude','hermes'])assert.deepEqual(parseEntry(['--main',main,'--native-default','--version'],false),{kind:'main',main,args:['--version'],nativeDefault:true});
 assert.deepEqual(parseEntry(['--delegate','claude','add42'],false),{kind:'delegate',target:'claude',job:'add42'});
});
test('P5.9: child-only key hydration and Claude bearer/base mapping; Pi unchanged',()=>{
 const parent={HOME:'existing',OPENROUTER_API_KEY:'old-shell',ANTHROPIC_AUTH_TOKEN:'old-auth',ANTHROPIC_API_KEY:'old-api'};
 for(const main of ['claude','codex','hermes']){
  const env=mainEnvironment(main,parent,()=>({OPENROUTER_API_KEY:'fixture-root',GROQ_API_KEY:'do-not-copy'}));
  assert.equal(env.OPENROUTER_API_KEY,'fixture-root');assert.equal(env.HOME,parent.HOME);assert.equal(env.GROQ_API_KEY,undefined);
  if(main==='claude'){assert.equal(env.ANTHROPIC_BASE_URL,'https://openrouter.ai/api');assert.equal(env.ANTHROPIC_AUTH_TOKEN,'fixture-root');assert.equal(env.ANTHROPIC_API_KEY,'');}
  else{assert.equal(env.ANTHROPIC_AUTH_TOKEN,'old-auth');assert.equal(env.ANTHROPIC_API_KEY,'old-api');}
 }
 assert.equal(parent.OPENROUTER_API_KEY,'old-shell');assert.equal(parent.ANTHROPIC_AUTH_TOKEN,'old-auth');assert.equal(parent.ANTHROPIC_API_KEY,'old-api');
 assert.deepEqual(mainEnvironment('pi',parent,()=>{throw Error();}),{...parent,AGENTCO_MAIN:'pi'});
});
test('P5.9: missing key is a configuration error, not a vendor or model fallback',()=>{
 for(const main of ['claude','codex','hermes'])assert.throws(()=>mainEnvironment(main,{},()=>({})),/OpenRouter key unavailable/);
});
test('P5.9: original native terminal, cwd, signal and exit transport preserved',async()=>{
 const signals=new EventEmitter(),child=new EventEmitter();let seen;
 const plan=mainPlan('hermes',[],{hermes:()=> 'fixture.exe'}),env=mainEnvironment('hermes',{},()=>({OPENROUTER_API_KEY:'fixture'}));
 const run=launchNative(plan,env,(file,args,options)=>{seen={file,args,options};return child;},signals);
 assert.equal(seen.file,plan.file);assert.deepEqual(seen.args,[]);assert.equal(seen.options.env,env);assert.equal(seen.options.stdio,'inherit');assert.equal(seen.options.shell,false);assert.ok(seen.options.cwd);
 signals.emit('SIGINT');child.emit('exit',23);assert.equal(await run,23);assert.equal(signals.listenerCount('SIGINT'),0);
});
