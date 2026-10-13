import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,copyFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {nativeFreeMain} from './native-free-main.mjs';
import {menuEntry,parseEntry,mainPlan,mainEnvironment} from './agentco.mjs';

// Only source code is copied. The canonical .env is never read/copied by this test.
// Retain isolated, dummy-only fixture outputs under the ignored results directory.
function rootFixture(present) {
 mkdirSync('results/p5-7',{recursive:true});const area=mkdtempSync(join(process.cwd(),'results/p5-7/dummy-root-'));
 mkdirSync(join(area,'scripts'));
 for(const name of ['env.mjs','native-free-main.mjs'])copyFileSync(join('scripts',name),join(area,'scripts',name));
 if(present)writeFileSync(join(area,'.env'),'OPENROUTER_API_KEY="fixture-root-only"\nUNRELATED_SECRET=fixture-not-whitelisted\n');
 writeFileSync(join(area,'runner.mjs'),`import {nativeFreeMain,freeMainModel} from './scripts/native-free-main.mjs';
 const before=process.env.OPENROUTER_API_KEY;let prices=0;
 const result=await nativeFreeMain({main:'codex',file:'fixture.exe',args:['--no-daemon']},{HOME:'native'}, {pricing:async()=>{prices++;}});
 console.log(JSON.stringify({status:result.plan.status??'CONNECTED',keyMatchesFixture:result.env.OPENROUTER_API_KEY==='fixture-root-only',unrelatedNotInjected:result.env.UNRELATED_SECRET===undefined,parentUnchanged:process.env.OPENROUTER_API_KEY===before,tokenNotInArgv:!JSON.stringify(result.plan).includes('fixture-root-only'),exactModel:result.plan.args?.includes('model="'+freeMainModel+'"')??false,prices}));`);
 const env={...process.env};for(const key of ['OPENROUTER_API_KEY','OPENROUTER_BASE_URL','GROQ_API_KEY','GROQ_BASE_URL'])delete env[key];
 return JSON.parse(execFileSync(process.execPath,[join(area,'runner.mjs')],{cwd:area,env,encoding:'utf8',timeout:10000}));
}
test('P5.7: existing default Codex loader reads dummy root .env only into child, never argv',()=>{
 assert.deepEqual(rootFixture(true),{status:'CONNECTED',keyMatchesFixture:true,unrelatedNotInjected:true,parentUnchanged:true,tokenNotInArgv:true,exactModel:true,prices:1});
});
test('P5.7: missing root key blocks Codex before price/provider requests',()=>{
 assert.deepEqual(rootFixture(false),{status:'CONFIG_REQUIRED',keyMatchesFixture:false,unrelatedNotInjected:true,parentUnchanged:true,tokenNotInArgv:true,exactModel:false,prices:0});
});
test('P5.7: unapproved Claude/Hermes never load/inject canonical key or send provider calls',async()=>{
 for(const [main,status] of [['claude','CLAUDE_UNSUPPORTED'],['hermes','BLOCKED']]){
  const forbidden=()=>{throw Error('No key/provider access permitted.');};
  const result=await nativeFreeMain({main,file:'fixture.exe',args:[]},{},{key:forbidden,pricing:forbidden});
  assert.equal(result.plan.status,status);assert.equal(result.plan.file,undefined);assert.equal(result.env.OPENROUTER_API_KEY,undefined);
 }
});
test('P5.7: four menu routes and acknowledged native env remain unchanged without key loading',async()=>{
 for(const [choice,main] of [['1','pi'],['2','claude'],['3','codex'],['4','hermes']]){
  const answers=[choice,'yes'];const entry=await menuEntry(async()=>answers.shift());assert.equal(entry.main,main);
  if(['claude','hermes'].includes(main)){
   const args=['--version'];const parsed=parseEntry(['--main',main,'--native-default',...args],false);
   const plan=mainPlan(main,parsed.args,{[main]:()=> 'fixture.exe'}),env=mainEnvironment(main,{HOME:'existing',NATIVE:'keep'});
   const result=await nativeFreeMain(plan,env,{nativeDefault:parsed.nativeDefault,key:()=>{throw Error();},pricing:()=>{throw Error();}});
   assert.equal(result.plan,plan);assert.equal(result.env,env);assert.deepEqual(result.plan.args,args);assert.equal(env.OPENROUTER_API_KEY,undefined);
  }else assert.equal(entry.nativeDefault,undefined);
 }
});
