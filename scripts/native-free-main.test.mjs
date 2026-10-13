import test from 'node:test';
import assert from 'node:assert/strict';
import {nativeFreeMain,freeMainPricing,freeMainModel} from './native-free-main.mjs';
const plan=main=>({main,file:'fixture.exe',args:main==='codex'?['--no-daemon']:[]});
test('P5.6: absent key fails closed for all non-Pi and does not check prices',async()=>{
 for(const main of ['claude','codex','hermes']){let calls=0;const result=await nativeFreeMain(plan(main),{}, {key:()=>'',pricing:async()=>calls++});assert.equal(result.plan.status,'CONFIG_REQUIRED');assert.equal(calls,0);}
});
test('P5.6: unsupported Claude and unresolved Hermes never launch a paid default',async()=>{
 for(const [main,status] of [['claude','CLAUDE_UNSUPPORTED'],['hermes','BLOCKED']]){const r=await nativeFreeMain(plan(main),{}, {key:()=> 'fixture',pricing:()=>{throw Error();}});assert.equal(r.plan.status,status);assert.equal(r.env.OPENROUTER_API_KEY,undefined);assert.equal(r.plan.file,undefined);}
});
test('P5.6: Codex exact provider/model child settings, original args/env and no argv token',async()=>{
 const p=plan('codex');p.args.push('--cd','folder with spaces');const env={TERM:'vt100',HOME:'existing'};
 const r=await nativeFreeMain(p,env,{key:()=> 'fixture-secret',pricing:async()=>{}});
 assert.deepEqual(r.plan.args.slice(0,3),p.args);assert.equal(p.args.length,3);assert.deepEqual(env,{TERM:'vt100',HOME:'existing'});
 assert.equal(r.env.OPENROUTER_API_KEY,'fixture-secret');assert.equal(JSON.stringify(r.plan).includes('fixture-secret'),false);
 for(const setting of [`model="${freeMainModel}"`,`review_model="${freeMainModel}"`,'model_provider="agentco_free_main"','model_providers.agentco_free_main.requires_openai_auth=false','features.multi_agent=false','features.realtime_conversation=false','mcp_servers={}'])assert.ok(r.plan.args.includes(setting));
});
test('P5.6: provider overrides, prompts and resumed sessions blocked without calls',async()=>{
 for(const args of [['-m','paid'],['-c','model="paid"'],['--profile','old'],['resume'],['a prompt'],['--remote','ws://other']]){const r=await nativeFreeMain({...plan('codex'),args}, {},{key:()=> 'fixture',pricing:()=>{throw Error();}});assert.equal(r.plan.status,'CONFIG_REQUIRED');}
});
test('P5.6: metadata price exact zero only; failure prevents native launch',async()=>{
 for(const pricing of [{prompt:'0',completion:'1'},{prompt:'1',completion:'0'},{}])await assert.rejects(freeMainPricing(async()=>({ok:true,json:async()=>({data:[{id:freeMainModel,pricing}]})})));
 await freeMainPricing(async()=>({ok:true,json:async()=>({data:[{id:freeMainModel,pricing:{prompt:'0',completion:'0'}}]})}));
 const r=await nativeFreeMain(plan('codex'),{}, {key:()=> 'fixture',pricing:async()=>{throw Error();}});assert.equal(r.plan.status,'BLOCKED');
});
test('P5.6: Pi and metadata commands preserve exact native plan and environment',async()=>{
 for(const p of [plan('pi'),{...plan('codex'),args:['--no-daemon','--version']}]){const env={KEEP:'native'};const r=await nativeFreeMain(p,env,{key:()=>{throw Error();},pricing:()=>{throw Error();}});assert.equal(r.plan,p);assert.equal(r.env,env);}
});
