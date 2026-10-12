import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { model, validatePipeline, resolveClaudePath, runBounded, killTree } from './commander.mjs';

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
function treeCode(area, flood = false) {
  const grandchild = 'setInterval(()=>{},1000)';
  const child = `const {spawn}=require('node:child_process');const fs=require('node:fs');const g=spawn(process.execPath,['-e',${JSON.stringify(grandchild)}],{windowsHide:true,stdio:'ignore'});fs.writeFileSync(${JSON.stringify(join(area, 'grand.pid'))},String(g.pid));setInterval(()=>{},1000);`;
  return `const {spawn}=require('node:child_process');const fs=require('node:fs');const c=spawn(process.execPath,['-e',${JSON.stringify(child)}],{windowsHide:true,stdio:'ignore'});fs.writeFileSync(${JSON.stringify(join(area, 'child.pid'))},String(c.pid));${flood ? "setTimeout(()=>process.stdout.write('x'.repeat(8192)),700);" : ''}setInterval(()=>{},1000);`;
}
for (const mode of ['timeout', 'abort', 'output limit']) test(`known nested process tree is cleaned on ${mode}; unrelated control survives`, async () => {
  const area = mkdtempSync(join(tmpdir(), 'agentco-tree-check-'));
  const control = spawn(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { windowsHide: true, stdio: 'ignore' });
  const controller = new AbortController(); let rootPid, abortTimer;
  try {
    const pending = runBounded(process.execPath, ['-e', treeCode(area, mode === 'output limit')], {
      timeout: 1600, maxBuffer: 1024, signal: controller.signal,
      onSpawn: pid => { rootPid = pid; if (mode === 'abort') abortTimer = setTimeout(() => controller.abort(), 1100); }
    });
    await assert.rejects(pending, mode === 'timeout' ? /timed out/ : mode === 'abort' ? /aborted/ : /output limit/);
    assert.ok(existsSync(join(area, 'grand.pid')), 'fixture reached grandchild before termination');
    const pids = [rootPid, Number(readFileSync(join(area, 'child.pid'), 'utf8')), Number(readFileSync(join(area, 'grand.pid'), 'utf8'))];
    for (let i = 0; i < 20 && pids.some(alive); i++) await sleep(50);
    assert.ok(pids.every(pid => !alive(pid)), 'owned parent/child/grandchild all stopped');
    assert.ok(alive(control.pid), 'unrelated control was not terminated');
  } finally {
    clearTimeout(abortTimer);
    for (const name of ['grand.pid', 'child.pid']) if (existsSync(join(area, name))) await killTree(Number(readFileSync(join(area, name), 'utf8')));
    await killTree(rootPid); await killTree(control.pid);
  }
});
test('already aborted launch starts no process and failed executable errors are bounded', async () => {
  const controller = new AbortController(); controller.abort();
  await assert.rejects(runBounded(process.execPath, ['-e', 'throw Error()'], { signal: controller.signal }), /before launch/);
  await assert.rejects(runBounded(join(tmpdir(), 'agentco-nonexistent.exe'), [], { timeout: 500 }), /launch failed/);
});
test('nonzero parent exit cleans the separately tracked Worker tree without touching control', async () => {
  const area = mkdtempSync(join(tmpdir(), 'agentco-error-check-'));
  const control = spawn(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { windowsHide: true, stdio: 'ignore' });
  try {
    const code = treeCode(area) + 'setTimeout(()=>process.exit(1),900);';
    const result = await runBounded(process.execPath, ['-e', code], { timeout: 3000 });
    assert.equal(result.status, 1);
    const worker = Number(readFileSync(join(area, 'child.pid'), 'utf8'));
    const grandchild = Number(readFileSync(join(area, 'grand.pid'), 'utf8'));
    await killTree(worker); // Same known-Worker cleanup as main's finally after Pi exits.
    for (let i = 0; i < 20 && (alive(worker) || alive(grandchild)); i++) await sleep(50);
    assert.ok(!alive(worker) && !alive(grandchild)); assert.ok(alive(control.pid));
  } finally {
    for (const name of ['grand.pid', 'child.pid']) if (existsSync(join(area, name))) await killTree(Number(readFileSync(join(area, name), 'utf8')));
    await killTree(control.pid);
  }
});
test('stream decoding preserves a Unicode character split across chunks', async () => {
  const r = await runBounded(process.execPath, ['-e', "const b=Buffer.from('\\uD55C');process.stdout.write(b.subarray(0,1));setTimeout(()=>process.stdout.write(b.subarray(1)),30)"], { timeout: 2000 });
  assert.equal(r.stdout, '\uD55C');
});
