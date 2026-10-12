import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { model, validatePipeline, resolveClaudePath, runBounded, killTree, getProcessIdentity, writeOwner } from './commander.mjs';

function evidence(output = 'SECOND_PAYLOAD=137') {
  const worker = { output, model, observedModels: [model], exitCode: 0 };
  return { exitCode: 0, commanderModels: [model], worker, commanderCalls: [{ name: 'claude_worker' }],
    returnedToolResults: [{ name: 'claude_worker', isError: false, content: [{ type: 'text', text: JSON.stringify(worker) }] }], final: output };
}
test('correspondence accepts arbitrary payload/outer whitespace, rejects false success', () => {
  const e = evidence(); assert.equal(validatePipeline(e), true);
  e.final = ' \nSECOND_PAYLOAD=137\r\n'; assert.equal(validatePipeline(e), true);
  e.final = 'Made up result'; assert.equal(validatePipeline(e), false);
  e.final = e.worker.output; e.returnedToolResults = []; assert.equal(validatePipeline(e), false);
  const failed = evidence(); failed.returnedToolResults[0].isError = true; assert.equal(validatePipeline(failed), false);
  const fabricated = evidence(); fabricated.returnedToolResults[0].content[0].text = JSON.stringify({ ...fabricated.worker, output: 'FORGED' }); assert.equal(validatePipeline(fabricated), false);
  const drift = evidence(); drift.commanderModels = ['paid-model']; assert.equal(validatePipeline(drift), false);
  const badExit = evidence(); badExit.worker.exitCode = 1; assert.equal(validatePipeline(badExit), false);
});
test('trusted executable override supports spaces and rejects missing/directory paths', () => {
  const area = mkdtempSync(join(tmpdir(), 'agentco-path-check-'));
  const exe = join(area, 'Claude test.exe'); writeFileSync(exe, 'offline path fixture, never executed');
  assert.equal(resolveClaudePath(exe), exe);
  assert.throws(() => resolveClaudePath(join(area, 'missing.exe')));
  const dir = join(area, 'directory.exe'); mkdirSync(dir); assert.throws(() => resolveClaudePath(dir));
});
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function alive(pid) { try { process.kill(pid, 0); return true; } catch { return false; } }
async function ownedControl() {
  const child = spawn(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { windowsHide:true, stdio:'ignore' });
  const owner = {state:'active',pid:child.pid,identity:await getProcessIdentity(child.pid)};
  child.once('exit', () => { owner.state='closed'; owner.pid=null; owner.identity=null; });
  assert.equal(owner.identity.status,'found'); return {child,owner};
}
function treeCode(area, error = false) {
  const child = `const {spawn}=require('node:child_process');const fs=require('node:fs');const g=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{windowsHide:true,stdio:'ignore',detached:${error}});fs.writeFileSync(${JSON.stringify(join(area,'grand.pid'))},String(g.pid));setInterval(()=>{},1000);`;
  return `const {spawn}=require('node:child_process');const fs=require('node:fs');const c=spawn(process.execPath,['-e',${JSON.stringify(child)}],{windowsHide:true,stdio:'ignore',detached:${error}});fs.writeFileSync(${JSON.stringify(join(area,'child.pid'))},String(c.pid));${error?'setTimeout(()=>process.exit(1),4000);':''}setInterval(()=>{},1000);`;
}
test('PID safety: normal close retires metadata and never queries/kills a completed PID', async () => {
  let owner, retired; const marker=join(mkdtempSync(join(tmpdir(),'agentco-retired-')),'worker-process.json');
  const result=await runBounded(process.execPath,['-e','process.stdout.write("done")'],{onSpawn:(pid,r)=>{owner=r;writeOwner(marker,r);},onIdentity:r=>writeOwner(marker,r),onRetire:r=>{retired=JSON.parse(JSON.stringify(r));writeOwner(marker,r);}});
  assert.equal(JSON.parse(readFileSync(marker,'utf8')).state,'closed');assert.equal(JSON.parse(readFileSync(marker,'utf8')).pid,null);
  assert.equal(result.status,0); assert.equal(owner.state,'closed');assert.equal(retired.pid,null);assert.equal(retired.identity,null);
  let queries=0,kills=0;
  assert.equal(await killTree({...retired,pid:12345},{readIdentity:async()=>{queries++;},terminate:async()=>{kills++;}}),'retired');
  assert.equal(queries,0);assert.equal(kills,0);
});
test('PID safety: simulated reused PID and unverifiable identity never terminate unrelated control', async () => {
  const {child,owner}=await ownedControl();let kills=0;
  try {
    const stale={state:'active',pid:owner.pid,identity:{...owner.identity,started:'obsolete-creation-time'}};
    await assert.rejects(killTree(stale,{terminate:async()=>{kills++;}}),/stale or unverifiable/);
    await assert.rejects(killTree({...owner,identity:null},{terminate:async()=>{kills++;}}),/unverifiable/);
    await assert.rejects(killTree({...owner},{readIdentity:async()=>({status:'unknown'}),terminate:async()=>{kills++;}}),/unverifiable/);
    assert.equal(kills,0);assert.ok(alive(child.pid));
  } finally {await killTree(owner);}
});
for(const mode of ['timeout','abort','parent error','output limit']) test(`PID safety: active-owned tree ${mode} and unrelated control survival`,async()=>{
  const area=mkdtempSync(join(tmpdir(),'agentco-pid-safe-'));const control=await ownedControl();let rootOwner;
  const controller=new AbortController();let children=[];
  const pending=runBounded(process.execPath,['-e',treeCode(area,mode==='parent error')+(mode==='output limit'?"setTimeout(()=>process.stdout.write('x'.repeat(8192)),5000);":'')],{timeout:6500,maxBuffer:1024,signal:controller.signal,onSpawn:(pid,o)=>rootOwner=o});
  // Attach rejection handling immediately while collecting owned fixture identities.
  const outcome=pending.then(value=>({value}),error=>({error}));
  try {
    for(let i=0;i<100&&!existsSync(join(area,'grand.pid'));i++)await sleep(20);
    for(const name of ['child.pid','grand.pid']){
      const pid=Number(readFileSync(join(area,name),'utf8'));const identity=await getProcessIdentity(pid);assert.equal(identity.status,'found');children.push({state:'active',pid,identity});
    }
    if(mode==='abort')controller.abort();
    const result=await outcome;
    if(mode==='parent error'){assert.equal(result.value.status,1);await killTree(children[0]);}
    else assert.match(result.error.message,mode==='abort'?/aborted/:mode==='output limit'?/output limit/:/timed out/);
    for(let i=0;i<20&&children.some(o=>alive(o.pid));i++)await sleep(50);
    assert.ok(children.every(o=>!alive(o.pid)));assert.equal(rootOwner.state,'closed');assert.ok(alive(control.child.pid));
    // Observed exited fixtures are retired before any final cleanup.
    for(const o of children){o.state='closed';o.pid=null;o.identity=null;}
  } finally {
    for(const o of children)try{await killTree(o);}catch{}
    try{await killTree(rootOwner);}catch{}
    await killTree(control.owner);
  }
});

test('already aborted launch starts no process and failed executable errors are bounded', async () => {
  const controller = new AbortController(); controller.abort();
  await assert.rejects(runBounded(process.execPath, ['-e', 'throw Error()'], { signal: controller.signal }), /before launch/);
  await assert.rejects(runBounded(join(tmpdir(), 'agentco-nonexistent.exe'), [], { timeout: 500 }), /launch failed/);
});
test('stream decoding preserves a Unicode character split across chunks', async () => {
  const r = await runBounded(process.execPath, ['-e', "const b=Buffer.from('\\uD55C');process.stdout.write(b.subarray(0,1));setTimeout(()=>process.stdout.write(b.subarray(1)),30)"], { timeout: 2000 });
  assert.equal(r.stdout, '\uD55C');
});
