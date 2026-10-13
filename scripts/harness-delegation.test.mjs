import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve, join } from 'node:path';
import { existsSync, readdirSync } from 'node:fs';
import { registerHarness, selectHarness, readiness } from '../pi-dev/extensions/harness-delegation.ts';
import { loadExtensions } from '../node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js';
import {
  claudeTextArgs, model, codexArgs, codexDisabledFeatures, validateCodexRun, hermesArgs, hermesConfigYaml, validateHermesRun,
  runSyntheticCodex, runSyntheticHermes, resolveCodexPath, resolveHermesPath,
} from './commander.mjs';
import { mockResponses, mockChat } from './harness-mock-servers.mjs';

function host(invoke) {
  const tools = new Map(), commands = new Map(), hooks = new Map(), messages = [];
  registerHarness({ registerTool: t => tools.set(t.name, t), registerCommand: (n, c) => commands.set(n, c), on: (n, f) => hooks.set(n, f), sendMessage: m => messages.push(m) }, invoke);
  return { tools, commands, hooks, messages };
}
const pass = harness => async (job) => ({ harness, job, status: 'PASS', output: 'ADD42=42', model });

test('routing: installed Pi loads once with native subagent, no collision', async () => {
  const r = await loadExtensions([resolve('node_modules/@earendil-works/pi-coding-agent/examples/extensions/subagent'), resolve('pi-dev/extensions/harness-delegation.ts')], process.cwd());
  assert.equal(r.errors.length, 0);
  const names = r.extensions.flatMap(e => [...e.tools.keys()]);
  assert.equal(names.filter(n => n === 'subagent').length, 1);
  assert.equal(names.filter(n => n === 'agentco_delegate').length, 1);
  assert.equal(r.extensions.flatMap(e => [...e.commands.keys()]).filter(n => n === 'harness').length, 1);
});

test('routing: auto and manual share the native path; named Codex/Hermes run only their own CLI', async () => {
  const calls = [];
  const rec = harness => async (job) => { calls.push(harness); return { harness, job, status: 'PASS', output: 'ADD42=42', model }; };
  const h = host({ claude: rec('claude'), codex: rec('codex'), hermes: rec('hermes') });
  const tool = h.tools.get('agentco_delegate');
  assert.equal(selectHarness('auto', 'add42'), 'claude');
  await tool.execute('a', { harness: 'auto', job: 'add42' });
  await h.commands.get('harness').handler('claude add42', {});
  assert.equal(h.messages.at(-1).details.harness, 'claude');
  for (const harness of ['codex', 'hermes']) {
    const r = await tool.execute('b', { harness, job: 'add42' });
    assert.equal(r.isError, false); assert.equal(r.details.harness, harness); assert.equal(r.details.status, 'PASS');
    await h.commands.get('harness').handler(`${harness} add42`, {});
    assert.equal(h.messages.at(-1).details.harness, harness);
  }
  assert.deepEqual(calls, ['claude', 'claude', 'codex', 'codex', 'hermes', 'hermes']);
  await h.commands.get('harness').handler('status', {});
  assert.deepEqual(Object.keys(h.messages.at(-1).details).sort(), ['claude', 'codex', 'hermes']);
});

test('routing: wrong-identity, non-PASS or throwing worker fails closed without fallback or substitution', async () => {
  let calls = [];
  const h = host({
    claude: pass('claude'),
    codex: async (job) => { calls.push('codex'); return { harness: 'claude', job, status: 'PASS', output: 'ADD42=42' }; },
    hermes: async (job) => { calls.push('hermes'); throw Error('boom'); },
  });
  const tool = h.tools.get('agentco_delegate');
  for (const harness of ['codex', 'hermes']) {
    const r = await tool.execute('x', { harness, job: 'add42' });
    assert.equal(r.isError, true); assert.equal(r.details.status, 'FAIL'); assert.equal(r.details.harness, harness); assert.equal(r.details.fallback, false); assert.equal(r.details.output, undefined);
  }
  assert.deepEqual(calls, ['codex', 'hermes']);
  const missing = host({ claude: pass('claude') });
  const r = await missing.tools.get('agentco_delegate').execute('x', { harness: 'codex', job: 'add42' });
  assert.equal(r.details.status, 'NOT_READY'); assert.equal(r.details.fallback, false);
});

test('routing: unsupported/private job args reject before any worker', async () => {
  let count = 0;
  const h = host(async () => { count++; });
  for (const args of [['other', 'add42'], ['auto', 'C:/private.js'], ['claude', 'secret task'], ['codex', 'C:/private.js'], ['hermes', 'secret task']]) assert.throws(() => selectHarness(...args));
  await h.commands.get('harness').handler('codex add42 private-token', {});
  assert.equal(h.messages.at(-1).details.status, 'REJECTED');
  assert.equal(count, 0);
  assert.equal(h.tools.get('agentco_delegate').parameters.additionalProperties, false);
  const args = claudeTextArgs('fixed');
  assert.equal(args[args.indexOf('--model') + 1], model); assert.equal(args[args.indexOf('--tools') + 1], ''); assert.equal(args.includes('--fallback-model'), false);
});

test('routing: shutdown propagates cancellation and waits for owned worker', async () => {
  let finished = false;
  const h = host((_job, { signal }) => new Promise(resolveRun => signal.addEventListener('abort', () => setTimeout(() => { finished = true; resolveRun({ status: 'FAIL' }); }, 10), { once: true })));
  const pending = h.tools.get('agentco_delegate').execute('a', { harness: 'codex', job: 'add42' });
  await h.hooks.get('session_shutdown')();
  assert.equal(finished, true); await pending;
});

test('P5.4 Codex: native config disables the actual view_image Feature and every I/O feature, exact route only', () => {
  const args = codexArgs();
  const cfg = args.filter((a, i) => args[i - 1] === '-c');
  assert.ok(cfg.includes('features.view_image=false'));
  assert.equal(cfg.some(c => c.startsWith('tools.')), false);
  for (const f of ['shell_tool', 'unified_exec', 'multi_agent', 'apps', 'browser_use', 'computer_use', 'skill_search']) assert.ok(codexDisabledFeatures.includes(f) && cfg.includes(`features.${f}=false`));
  assert.ok(cfg.includes(`model="${model}"`)); assert.ok(cfg.includes('sandbox_mode="read-only"')); assert.ok(cfg.includes('approval_policy="never"'));
  assert.ok(cfg.includes('model_providers.agentco.base_url="https://openrouter.ai/api/v1"'));
  assert.ok(cfg.includes('model_providers.agentco.request_max_retries=0'));
  for (const flag of ['--ignore-user-config', '--ignore-rules', '--strict-config', '--ephemeral']) assert.ok(args.includes(flag));
  assert.equal(args.some(a => /dangerously|yolo|full-access|bypass/i.test(a)), false);
});

test('P5.4 Codex: result judged on structured events, never exit code alone', () => {
  const ev = (...xs) => xs.map(x => JSON.stringify(x)).join('\n');
  const answer = { type: 'item.completed', item: { id: 'i', type: 'agent_message', text: 'ADD42=42' } };
  const noise = { type: 'item.completed', item: { id: 'n', type: 'error', message: 'Model metadata for `x` not found. Defaulting to fallback metadata.' } };
  const done = { type: 'turn.completed', usage: {} };
  assert.equal(validateCodexRun(0, ev({ type: 'thread.started' }, noise, { type: 'turn.started' }, answer, done)).ok, true);
  assert.equal(validateCodexRun(0, ev(answer)).ok, false);                                   // no completed turn
  assert.equal(validateCodexRun(0, ev(answer, done, { type: 'turn.failed' })).ok, false);      // failed turn despite exit 0
  assert.equal(validateCodexRun(1, ev(answer, done)).ok, false);                              // nonzero exit
  assert.equal(validateCodexRun(0, ev({ ...answer, item: { ...answer.item, text: 'ADD42=43' } }, done)).ok, false);
  assert.equal(validateCodexRun(0, ev({ type: 'item.completed', item: { type: 'command_execution' } }, answer, done)).ok, false);
  assert.equal(validateCodexRun(0, ev({ type: 'item.completed', item: { type: 'error', message: 'sandbox refused' } }, answer, done)).ok, false);
});

test('P5.4 Hermes: child config pins custom provider, zero toolsets, no auxiliary/memory/fallback; false exit0 and extra calls rejected', () => {
  const yaml = hermesConfigYaml();
  assert.match(yaml, /provider: custom/); assert.match(yaml, /base_url: https:\/\/openrouter\.ai\/api\/v1/); assert.match(yaml, /platform_toolsets:\n {2}cli: \[\]/);
  assert.match(yaml, /title_generation:\n {4}enabled: false/); assert.match(yaml, /memory_enabled: false/); assert.match(yaml, /fallback_providers: \[\]/);
  assert.equal(/api_key/.test(yaml), false);                                                  // key stays in child env only
  const a = hermesArgs('u.json');
  assert.deepEqual([a[0], a.includes('--ignore-rules'), a[a.indexOf('-m') + 1], a[a.indexOf('--provider') + 1]], ['-z', true, model, 'custom']);
  const usage = { completed: true, failed: false, partial: false, interrupted: false, provider: 'custom', model, api_calls: 1, auxiliary: { by_task: {} } };
  assert.equal(validateHermesRun(0, 'ADD42=42\n', usage).ok, true);
  assert.equal(validateHermesRun(0, 'ADD42=42\n', { ...usage, completed: false, failed: true }).ok, false);   // exit 0 alone is not success
  assert.equal(validateHermesRun(2, 'ADD42=42\n', usage).ok, false);
  assert.equal(validateHermesRun(0, 'ADD42=42\n', { ...usage, api_calls: 2 }).ok, false);
  assert.equal(validateHermesRun(0, 'ADD42=42\n', { ...usage, auxiliary: { by_task: { title_generation: { api_calls: 1 } } } }).ok, false);
  assert.equal(validateHermesRun(0, 'ADD42=42\n', { ...usage, provider: 'openrouter' }).ok, false);
  assert.equal(validateHermesRun(0, 'ADD42=42\n', null).ok, false);
});

test('P5.4 Codex loopback: real pinned CLI sends exact model to /api/v1/responses with only non-I/O tool; forced I/O calls are unsupported', { skip: !existsSync(join(resolve('results/p3/tools/codex/0.162.1'), 'codex.exe')) }, async () => {
  const m = await mockResponses({ calls: [{ name: 'view_image', args: { path: 'C:/agentco-p5-4-synthetic-canary.png' } }, { name: 'shell', args: { command: ['cmd', '/c', 'echo x'] } }, { name: 'apply_patch', args: { input: 'x' } }] });
  try {
    const r = await runSyntheticCodex('add42', { baseUrl: `http://127.0.0.1:${m.port}/api/v1`, key: 'dummy-not-a-key', skipPricing: true });
    assert.equal(r.status, 'PASS'); assert.equal(r.harness, 'codex'); assert.equal(r.toolItems, 0);
    const posts = m.requests.filter(x => x.method === 'POST');
    assert.equal(posts.length, 2);
    for (const p of posts) { assert.equal(p.path, '/api/v1/responses'); assert.equal(p.model, model); assert.equal(p.authPresent, true); assert.deepEqual(p.tools, ['request_user_input']); }
  } finally { await m.close(); }
});

test('P5.4 Codex loopback: failed provider response is a FAIL, never PASS', { skip: !existsSync(join(resolve('results/p3/tools/codex/0.162.1'), 'codex.exe')) }, async () => {
  const m = await mockResponses({ fail: 401 });
  try { await assert.rejects(runSyntheticCodex('add42', { baseUrl: `http://127.0.0.1:${m.port}/api/v1`, key: 'dummy-not-a-key', skipPricing: true }), /failed/); }
  finally { await m.close(); }
});

test('P5.4 Hermes loopback: installed venv CLI honors custom base_url with zero tools and no auxiliary call; provider failure rejected', { skip: (() => { try { resolveHermesPath(); return false; } catch { return true; } })() }, async () => {
  const ok = await mockChat();
  try {
    const r = await runSyntheticHermes('add42', { baseUrl: `http://127.0.0.1:${ok.port}/v1`, key: 'dummy-not-a-key', skipPricing: true });
    assert.equal(r.status, 'PASS'); assert.equal(r.harness, 'hermes'); assert.equal(r.provider, 'custom'); assert.equal(r.apiCalls, 1);
    const chats = ok.requests.filter(x => x.method === 'POST' && /chat\/completions$/.test(x.path));
    assert.equal(chats.length, 1); assert.equal(chats[0].model, model); assert.deepEqual(chats[0].tools, []); assert.equal(chats[0].authPresent, true);
  } finally { await ok.close(); }
  const bad = await mockChat({ fail: 401 });
  try { await assert.rejects(runSyntheticHermes('add42', { baseUrl: `http://127.0.0.1:${bad.port}/v1`, key: 'dummy-not-a-key', skipPricing: true }), /failed/); }
  finally { await bad.close(); }
});

test('P5.4 readiness reports each lane from real executable resolution, not a hard-coded verdict', () => {
  const saved = process.env.OPENROUTER_API_KEY;
  try {
    delete process.env.OPENROUTER_API_KEY;
    for (const v of Object.values(readiness())) assert.match(v, /blocked: OPENROUTER_API_KEY unavailable|UNAVAILABLE/);
    process.env.OPENROUTER_API_KEY = 'dummy';
    const s = readiness();
    for (const [lane, v] of Object.entries(s)) assert.match(v, /^(available|UNAVAILABLE)/, lane);
  } finally { if (saved === undefined) delete process.env.OPENROUTER_API_KEY; else process.env.OPENROUTER_API_KEY = saved; }
});
