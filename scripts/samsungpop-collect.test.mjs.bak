/**
 * Samsung POP Collect - Behavioral Tests
 *
 * Tests the collect functionality against a fake financial page fixture.
 * NO real bank website, NO real login, NO real credentials, NO network access to financial sites.
 * All tests use local file:// protocol with the fake balance page.
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtemp, rm } from 'node:fs/promises';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const SAMSUNGPOP_ORIGIN = 'https://www.samsungpop.com/';
const FAKE_BALANCE_PAGE = resolve(root, 'fixtures', 'samsungpop-fake-balance.html');

let testProfileDir;
let testOutputDir;
let controllerPath;
let collectPath;

function generateCdpPort() {
  return 49152 + (randomBytes(2).readUInt16BE(0) % 16384);
}

function generateSessionToken() {
  return randomBytes(16).toString('hex');
}

async function writeCdpSession(profileDir, port, token) {
  const sessionFile = resolve(profileDir, 'cdp-session');
  writeFileSync(sessionFile, JSON.stringify({ port, token }), { mode: 0o600 });
}

function runController(subcommand, env = {}) {
  return new Promise((resolvePromise) => {
    const fakeOrigin = 'file:///' + FAKE_BALANCE_PAGE.replace(/\\/g, '/');
    const child = spawn(process.execPath, [controllerPath, subcommand], {
      cwd: root,
      env: {
        ...process.env,
        BANKING_PROFILE_DIR: testProfileDir,
        BANKING_OUTPUT_DIR: testOutputDir,
        SAMSUNGPOP_ORIGIN: fakeOrigin,
        ...env
      },
      stdio: ['ignore', 'pipe', 'ignore'],
      windowsHide: true,
    });

    let stdout = '';
    child.stdout?.on('data', (d) => { stdout += d.toString(); });

    child.on('close', (code) => {
      try {
        const lines = stdout.trim().split('\n');
        for (const line of lines) {
          if (line.startsWith('{')) {
            const parsed = JSON.parse(line);
            if (parsed.state && parsed.browser && parsed.site && parsed.auth && parsed.error_code) {
              resolvePromise({ code, ...parsed });
              return;
            }
          }
        }
        resolvePromise({ code, error_code: 'PARSE_FAILED', raw: stdout });
      } catch {
        resolvePromise({ code, error_code: 'PARSE_FAILED', raw: stdout });
      }
    });

    child.on('error', (err) => {
      resolvePromise({ code: -1, error_code: 'SPAWN_ERROR', error: err.message });
    });
  });
}

describe('Samsung POP Collect - Fake Page Tests', () => {
  before(async () => {
    testProfileDir = await mkdtemp(resolve(tmpdir(), 'samsungpop-test-profile-'));
    testOutputDir = await mkdtemp(resolve(tmpdir(), 'samsungpop-test-output-'));
    controllerPath = resolve(root, 'scripts', 'samsungpop-controller.mjs');
    collectPath = resolve(root, 'scripts', 'samsungpop-playwright', 'collect.mjs');

    mkdirSync(testProfileDir, { recursive: true });

    console.log(`Test profile: ${testProfileDir}`);
    console.log(`Fake page: ${FAKE_BALANCE_PAGE}`);
  });

  after(async () => {
    try { rm(testProfileDir, { recursive: true, force: true }); } catch {}
    try { rm(testOutputDir, { recursive: true, force: true }); } catch {}
  });

  test('collect returns NAVIGATION_FAILED when no valid session exists', async () => {
    const result = await runController('collect');
    assert.strictEqual(result.error_code, 'NAVIGATION_FAILED');
    console.log('PASS: collect without session returns NAVIGATION_FAILED');
  });

  test('collect returns valid status structure with session', async () => {
    const cdpPort = generateCdpPort();
    const sessionToken = generateSessionToken();
    await writeCdpSession(testProfileDir, cdpPort, sessionToken);

    const result = await runController('collect', {
      CDP_PORT: String(cdpPort),
      CDP_PORT_FILE: resolve(testProfileDir, 'cdp-port'),
      CDP_SESSION_FILE: resolve(testProfileDir, 'cdp-session'),
      CDP_SESSION_TOKEN: sessionToken,
    });

    assert.ok(result.state !== undefined, 'Should have state');
    assert.ok(result.browser !== undefined, 'Should have browser');
    assert.ok(result.site !== undefined, 'Should have site');
    assert.ok(result.auth !== undefined, 'Should have auth');
    assert.ok(result.error_code !== undefined, 'Should have error_code');

    console.log(`Collect result: ${JSON.stringify(result)}`);
    console.log('PASS: collect returns valid status structure');
  });

  test('collect sanitizes output - only allowed fields present', async () => {
    const cdpPort = generateCdpPort();
    const sessionToken = generateSessionToken();
    await writeCdpSession(testProfileDir, cdpPort, sessionToken);

    const result = await runController('collect', {
      CDP_PORT: String(cdpPort),
      CDP_PORT_FILE: resolve(testProfileDir, 'cdp-port'),
      CDP_SESSION_FILE: resolve(testProfileDir, 'cdp-session'),
      CDP_SESSION_TOKEN: sessionToken,
    });

    const outputStr = JSON.stringify(result);
    assert.ok(!outputStr.includes('samsungpop.com'), 'Should not contain real URL');
    assert.ok(!outputStr.includes('password'), 'Should not contain password');
    assert.ok(!outputStr.includes('cookie'), 'Should not contain cookie');
    assert.ok(!outputStr.includes('localStorage'), 'Should not contain localStorage');
    assert.ok(!outputStr.includes('sessionStorage'), 'Should not contain sessionStorage');

    if (result.fields) {
      const allowedFields = ['TOTAL_BALANCE', 'AVAILABLE_BALANCE', 'EVALUATION_AMOUNT', 'ACCOUNT_NUMBER_MASKED'];
      for (const field of result.fields) {
        assert.ok(allowedFields.includes(field), `Field ${field} should be in allowed list`);
      }
    }

    console.log('PASS: collect output sanitized - no sensitive data');
  });

  test('collect with invalid session token returns error', async () => {
    const cdpPort = generateCdpPort();
    const sessionToken = generateSessionToken();
    await writeCdpSession(testProfileDir, cdpPort, 'different-token');

    const result = await runController('collect', {
      CDP_PORT: String(cdpPort),
      CDP_PORT_FILE: resolve(testProfileDir, 'cdp-port'),
      CDP_SESSION_FILE: resolve(testProfileDir, 'cdp-session'),
      CDP_SESSION_TOKEN: sessionToken,
    });

    assert.ok(result.error_code !== 'NONE' || result.browser === 'NOT_RUNNING');
    console.log('PASS: collect with invalid token rejected');
  });
});

describe('Samsung POP Collect - Controller Integration', () => {
  before(async () => {
    testProfileDir = await mkdtemp(resolve(tmpdir(), 'samsungpop-test-profile-'));
    testOutputDir = await mkdtemp(resolve(tmpdir(), 'samsungpop-test-output-'));
    controllerPath = resolve(root, 'scripts', 'samsungpop-controller.mjs');
    mkdirSync(testProfileDir, { recursive: true });
  });

  after(async () => {
    try { rm(testProfileDir, { recursive: true, force: true }); } catch {}
    try { rm(testOutputDir, { recursive: true, force: true }); } catch {}
  });

  test('controller main recognizes collect subcommand', async () => {
    const result = await runController('collect');
    assert.ok(result.error_code !== 'UNSUPPORTED', 'collect should be supported');
    console.log('PASS: collect subcommand recognized by main');
  });

  test('controller module loads without error', async () => {
    // Test that the controller file can be loaded as a module
    const controllerUrl = 'file:///' + controllerPath.replace(/\\/g, '/');
    const controller = await import(controllerUrl);
    assert.ok(typeof controller.cmdCollect === 'function', 'cmdCollect should be exported');
    assert.ok(typeof controller.cmdOpen === 'function', 'cmdOpen should be exported');
    assert.ok(typeof controller.cmdStatus === 'function', 'cmdStatus should be exported');
    console.log('PASS: controller module loads with all commands');
  });
});
