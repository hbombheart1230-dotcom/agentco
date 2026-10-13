import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { registerHarness, selectHarness } from '../pi-dev/extensions/harness-delegation.ts';
import { loadExtensions } from '../node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js';
import { claudeTextArgs,model } from './commander.mjs';
function host(invoke){const tools=new Map(),commands=new Map(),hooks=new Map(),messages=[];registerHarness({registerTool:t=>tools.set(t.name,t),registerCommand:(n,c)=>commands.set(n,c),on:(n,f)=>hooks.set(n,f),sendMessage:m=>messages.push(m)},invoke);return {tools,commands,hooks,messages};}
test('routing: installed Pi loads once with native subagent, no collision',async()=>{
 const r=await loadExtensions([resolve('node_modules/@earendil-works/pi-coding-agent/examples/extensions/subagent'),resolve('pi-dev/extensions/harness-delegation.ts')],process.cwd());
 assert.equal(r.errors.length,0);const names=r.extensions.flatMap(e=>[...e.tools.keys()]);assert.equal(names.filter(n=>n==='subagent').length,1);assert.equal(names.filter(n=>n==='agentco_delegate').length,1);assert.equal(r.extensions.flatMap(e=>[...e.commands.keys()]).filter(n=>n==='harness').length,1);
});
test('routing: auto/manual share native path; unready requests never fallback',async()=>{
 const calls=[];const h=host(async(job)=>{calls.push(job);return {harness:'claude',job,status:'PASS',output:'ADD42=42'};});
 const tool=h.tools.get('agentco_delegate');assert.equal(selectHarness('auto','add42'),'claude');await tool.execute('a',{harness:'auto',job:'add42'});
 await h.commands.get('harness').handler('claude add42',{});assert.equal(h.messages.at(-1).details.harness,'claude');assert.deepEqual(calls,['add42','add42']);
 for(const harness of ['codex','hermes']){const result=await tool.execute('b',{harness,job:'add42'});assert.equal(result.isError,true);assert.equal(result.details.harness,harness);assert.equal(result.details.status,'NOT_READY');await h.commands.get('harness').handler(`${harness} add42`,{});assert.equal(h.messages.at(-1).details.status,'NOT_READY');}
 assert.equal(calls.length,2);await h.commands.get('harness').handler('status',{});assert.match(h.messages.at(-1).details.codex,/NOT_READY/);
});
test('routing: unsupported/private job args reject before any worker',async()=>{
 let count=0;const h=host(async()=>{count++;});for(const args of [['other','add42'],['auto','C:/private.js'],['claude','secret task']])assert.throws(()=>selectHarness(...args));
 await h.commands.get('harness').handler('claude add42 private-token',{});assert.equal(h.messages.at(-1).details.status,'REJECTED');assert.equal(count,0);
 assert.equal(h.tools.get('agentco_delegate').parameters.additionalProperties,false);
 const args=claudeTextArgs('fixed');assert.equal(args[args.indexOf('--model')+1],model);assert.equal(args[args.indexOf('--tools')+1],'');assert.equal(args.includes('--fallback-model'),false);
});
test('routing: shutdown propagates cancellation and waits for owned worker',async()=>{
 let finished=false;const h=host((_job,{signal})=>new Promise((resolve)=>signal.addEventListener('abort',()=>setTimeout(()=>{finished=true;resolve({status:'FAIL'});},10),{once:true})));
 const pending=h.tools.get('agentco_delegate').execute('a',{harness:'auto',job:'add42'});await h.hooks.get('session_shutdown')();assert.equal(finished,true);await pending;
});

test('P5.3: named blocked lanes keep native reason and never invoke another worker',async()=>{
 let invocations=0;const h=host(async()=>{invocations++;return {harness:'wrong',status:'PASS',model:'paid',output:'ADD42=42'};});
 for(const harness of ['codex','hermes']){
  const r=await h.tools.get('agentco_delegate').execute('blocked',{harness,job:'add42'});
  assert.equal(r.details.harness,harness);assert.equal(r.details.status,'NOT_READY');assert.equal(r.details.fallback,false);assert.equal(r.details.output,undefined);assert.equal(r.isError,true);
  assert.match(r.details.reason,harness==='codex'?/split filesystem read restrictions/:/provider\/auxiliary isolation/);
  await h.commands.get('harness').handler(`${harness} add42`,{});assert.deepEqual(h.messages.at(-1).details,r.details);
 }
 assert.equal(invocations,0);
});
test('P5.3: auto excludes blocked lanes and unsupported jobs cannot reach CLI',async()=>{
 const calls=[];const h=host(async(job)=>{calls.push(job);return {harness:'claude',job,status:'PASS',output:'ADD42=42'};});
 for(const harness of ['codex','hermes'])await assert.rejects(h.tools.get('agentco_delegate').execute('bad',{harness,job:'private/source.js'}));
 assert.equal(calls.length,0);assert.equal(selectHarness('auto','add42'),'claude');
 // Mock only: accepted Claude is not called live again.
 const r=await h.tools.get('agentco_delegate').execute('auto',{harness:'auto',job:'add42'});assert.equal(r.details.harness,'claude');assert.deepEqual(calls,['add42']);
});
