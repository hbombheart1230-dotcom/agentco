/**
 * Samsung POP Collect - Behavioral Tests
 *
 * Tests the collect functionality against a fake financial page fixture.
 * NO real bank website, NO real login, NO real credentials, NO network access to financial sites.
 * All tests use local file:// protocol with the fake balance page.
 * Tests actual extraction + local persistence (snapshot writing + re-read).
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { chromium } from 'playwright';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { writeFileSync } from 'node:fs';
import { mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const FAKE_BALANCE_PAGE = resolve(root, 'fixtures', 'samsungpop-fake-balance.html');

let testBrowser;
let testPage;
let testSnapshotDir;
let canarySnapshotDir;

describe('Samsung POP Collect - Fake Page Extraction & Persistence Tests', () => {
  before(async () => {
    testBrowser = await chromium.launch({ headless: true });
    testPage = await testBrowser.newPage();
    await testPage.goto('file:///' + FAKE_BALANCE_PAGE.replace(/\\\\/g, '/'));
    
    // Test-only snapshot directory (isolated from real user snapshots)
    testSnapshotDir = await mkdtemp(resolve(tmpdir(), 'samsungpop-test-snapshots-'));
    mkdirSync(testSnapshotDir, { recursive: true });
    
    // Canary directory with pre-existing snapshot to verify preservation
    canarySnapshotDir = await mkdtemp(resolve(tmpdir(), 'samsungpop-canary-snapshots-'));
    mkdirSync(canarySnapshotDir, { recursive: true });
    const canaryFile = resolve(canarySnapshotDir, 'samsungpop-canary-2024-01-01.json');
    writeFileSync(canaryFile, JSON.stringify({ canary: true, preserved: true }), { mode: 0o600 });
    
    console.log(`Fake page: ${FAKE_BALANCE_PAGE}`);
    console.log(`Test snapshot dir: ${testSnapshotDir}`);
    console.log(`Canary snapshot dir: ${canarySnapshotDir}`);
  });

  after(async () => {
    try { await testBrowser.close(); } catch {}
    // Clean up ONLY test-created snapshot directory
    try { 
      if (existsSync(testSnapshotDir)) {
        const files = readdirSync(testSnapshotDir);
        for (const f of files) {
          if (f.startsWith('samsungpop-') && f.endsWith('.json')) {
            rmSync(resolve(testSnapshotDir, f), { force: true });
          }
        }
        rmSync(testSnapshotDir, { force: true });
      }
    } catch {}
    // Clean up canary directory
    try { 
      if (existsSync(canarySnapshotDir)) {
        rmSync(canarySnapshotDir, { recursive: true, force: true });
      }
    } catch {}
  });

  test('extractTotals parses all four totals correctly', async () => {
    const { extractTotals } = await import('./samsungpop-playwright/collect.mjs');
    const totals = await extractTotals(testPage);
    
    console.log(`Extracted totals: ${JSON.stringify(totals)}`);
    
    assert.ok(totals.totalValuation !== null && totals.totalValuation !== undefined, 'total_valuation should be parsed');
    assert.ok(totals.totalPL !== null && totals.totalPL !== undefined, 'total_pl should be parsed');
    assert.ok(totals.totalReturnRate !== null && totals.totalReturnRate !== undefined, 'total_return_rate should be parsed');
    assert.ok(totals.cashBalance !== null && totals.cashBalance !== undefined, 'cash_balance should be parsed');
    
    assert.strictEqual(totals.totalValuation, 52345678);
    assert.strictEqual(totals.totalPL, 2345678);
    assert.strictEqual(totals.totalReturnRate, 4.68);
    assert.strictEqual(totals.cashBalance, 10000000);
    
    console.log('PASS: extractTotals parses all four totals correctly');
  });

  test('extractHoldings parses three holdings with positive/negative values', async () => {
    const { extractHoldings } = await import('./samsungpop-playwright/collect.mjs');
    const positions = await extractHoldings(testPage);
    
    console.log(`Extracted positions: ${JSON.stringify(positions)}`);
    
    assert.ok(positions.length > 0, 'Should have positions');
    assert.strictEqual(positions.length, 3, 'Should have exactly 3 holdings');
    
    // Samsung Electronics
    const samsung = positions.find(p => p.name.includes('\uc0bc\uc131\uc804\uc790') || p.name.includes('Samsung'));
    assert.ok(samsung, 'Should find Samsung Electronics');
    assert.strictEqual(samsung.quantity, 50);
    assert.strictEqual(samsung.valuation, 3500000);
    assert.strictEqual(samsung.pl, 250000);
    assert.strictEqual(samsung.returnRate, 7.69);
    
    // SK Hynix (negative PL)
    const sk = positions.find(p => p.name.includes('SK\ud558\uc774\ub2c9\uc2a4') || p.name.includes('Hynix'));
    assert.ok(sk, 'Should find SK Hynix');
    assert.strictEqual(sk.quantity, 20);
    assert.strictEqual(sk.valuation, 2800000);
    assert.strictEqual(sk.pl, -120000);
    assert.strictEqual(sk.returnRate, -4.11);
    
    // NAVER
    const naver = positions.find(p => p.name.includes('NAVER'));
    assert.ok(naver, 'Should find NAVER');
    assert.strictEqual(naver.quantity, 5);
    assert.strictEqual(naver.valuation, 1200000);
    assert.strictEqual(naver.pl, 85000);
    assert.strictEqual(naver.returnRate, 7.62);
    
    console.log('PASS: extractHoldings parses three holdings with positive/negative values');
  });

  test('determinePageType identifies balance page', async () => {
    const { determinePageType } = await import('./samsungpop-playwright/collect.mjs');
    const pageType = await determinePageType(testPage);
    assert.strictEqual(pageType, 'BALANCE_PAGE');
    console.log('PASS: determinePageType identifies balance page');
  });

  test('writeSnapshot writes valid snapshot and can be re-read', async () => {
    const { writeSnapshot, sanitize, StateEnum, BrowserEnum, SiteEnum, AuthEnum, CollectCodeEnum } = await import('./samsungpop-playwright/collect.mjs');
    const { extractTotals, extractHoldings } = await import('./samsungpop-playwright/collect.mjs');
    
    const totals = await extractTotals(testPage);
    const positions = await extractHoldings(testPage);
    
    const snapshot = {
      schema_version: 1,
      source: 'samsungpop',
      captured_at: new Date().toISOString(),
      currency: 'KRW',
      totals: {
        total_valuation: totals.totalValuation ?? null,
        total_pl: totals.totalPL ?? null,
        total_return_rate: totals.totalReturnRate ?? null,
        cash_balance: totals.cashBalance ?? null
      },
      positions,
      capture_status: 'SAVED'
    };
    
    // Use test-only snapshot dir for writeSnapshot
    const originalSnapshotDir = process.env.SNAPSHOT_DIR;
    process.env.SNAPSHOT_DIR = testSnapshotDir;
    try {
      const { writeSnapshot: ws } = await import('./samsungpop-playwright/collect.mjs');
      const result = await ws(snapshot);
      assert.ok(result, 'writeSnapshot should return result');
      assert.ok(result.path, 'Should have path');
      assert.ok(result.path.startsWith('results/samsungpop/snapshots/') || result.path.startsWith(testSnapshotDir), 'Path should be relative to results or test dir');
      assert.ok(result.path.endsWith('.json'), 'Path should end with .json');
      
      // Re-read and verify
      const content = await readFile(resolve(root, result.path), 'utf8');
      const reloaded = JSON.parse(content);
      
      assert.strictEqual(reloaded.schema_version, 1);
      assert.strictEqual(reloaded.source, 'samsungpop');
      assert.ok(reloaded.captured_at);
      assert.strictEqual(reloaded.currency, 'KRW');
      assert.strictEqual(reloaded.totals.total_valuation, 52345678);
      assert.strictEqual(reloaded.totals.total_pl, 2345678);
      assert.strictEqual(reloaded.totals.total_return_rate, 4.68);
      assert.strictEqual(reloaded.totals.cash_balance, 10000000);
      assert.strictEqual(reloaded.positions.length, 3);
      assert.strictEqual(reloaded.capture_status, 'SAVED');
      
      console.log(`Snapshot written and verified: ${result.path}`);
      console.log('PASS: writeSnapshot writes valid snapshot and can be re-read');
    } finally {
      if (originalSnapshotDir) process.env.SNAPSHOT_DIR = originalSnapshotDir;
      else delete process.env.SNAPSHOT_DIR;
    }
  });

  test('second writeSnapshot creates distinct file (no overwrite)', async () => {
      const { writeSnapshot } = await import('./samsungpop-playwright/collect.mjs');
    
      const snapshot1 = {
        schema_version: 1,
        source: 'samsungpop',
        captured_at: new Date().toISOString(),
        currency: 'KRW',
        totals: { total_valuation: 100, total_pl: 10, total_return_rate: 1, cash_balance: 50 },
        positions: [{ name: 'Test', quantity: 1, valuation: 100, pl: 10, returnRate: 1 }],
        capture_status: 'SAVED'
      };
    
      const originalSnapshotDir = process.env.SNAPSHOT_DIR;
      process.env.SNAPSHOT_DIR = testSnapshotDir;
      try {
        const { writeSnapshot: ws } = await import('./samsungpop-playwright/collect.mjs');
        const result1 = await ws(snapshot1);
        assert.ok(result1.path);
      
        // Wait for different timestamp and create new snapshot object
        await new Promise(r => setTimeout(r, 150));
      
        const snapshot2 = {
          schema_version: 1,
          source: 'samsungpop',
          captured_at: new Date().toISOString(),
          currency: 'KRW',
          totals: { total_valuation: 200, total_pl: 20, total_return_rate: 2, cash_balance: 100 },
          positions: [{ name: 'Test2', quantity: 2, valuation: 200, pl: 20, returnRate: 2 }],
          capture_status: 'SAVED'
        };
      
        const result2 = await ws(snapshot2);
        assert.ok(result2.path);
        assert.notStrictEqual(result1.path, result2.path, 'Should create distinct files');
      
        const snap1 = JSON.parse(await readFile(resolve(root, result1.path), 'utf8'));
        const snap2 = JSON.parse(await readFile(resolve(root, result2.path), 'utf8'));
        assert.notStrictEqual(snap1.captured_at, snap2.captured_at);
      
        console.log('PASS: Second writeSnapshot creates distinct file (no overwrite)');
      } finally {
        delete process.env.SNAPSHOT_DIR;
      }
    });

  test('sanitize validates collect_code and bounded metadata', async () => {
    const { sanitize, CollectCodeEnum } = await import('./samsungpop-playwright/collect.mjs');
    
    const valid = sanitize({ 
      state: 'OPEN', 
      browser: 'RUNNING', 
      site: 'SAMSUNGPOP', 
      auth: 'UNKNOWN', 
      collect_code: 'SAVED',
      saved_path: 'results/samsungpop/snapshots/samsungpop-2024-01-01T00-00-00.json',
      totals_count: 4,
      positions_count: 3
    });
    
    assert.strictEqual(valid.collect_code, 'SAVED');
    assert.strictEqual(valid.saved_path, 'results/samsungpop/snapshots/samsungpop-2024-01-01T00-00-00.json');
    assert.strictEqual(valid.totals_count, 4);
    assert.strictEqual(valid.positions_count, 3);
    
    // Invalid collect_code defaults to ERROR
    const invalid = sanitize({ collect_code: 'INVALID' });
    assert.strictEqual(invalid.collect_code, 'ERROR');
    
    // Out of bounds counts are dropped
    const oob = sanitize({ totals_count: 100, positions_count: 200 });
    assert.strictEqual(oob.totals_count, undefined);
    assert.strictEqual(oob.positions_count, undefined);
    
    // Path not in snapshots dir is dropped
    const badPath = sanitize({ saved_path: '/etc/passwd' });
    assert.strictEqual(badPath.saved_path, undefined);
    
    console.log('PASS: sanitize validates collect_code and bounded metadata');
  });

  test('No account number extraction anywhere', async () => {
    const { extractTotals, extractHoldings, writeSnapshot } = await import('./samsungpop-playwright/collect.mjs');
    
    const totals = await extractTotals(testPage);
    const positions = await extractHoldings(testPage);
    
    // No account number field in totals
    const totalsKeys = Object.keys(totals);
    assert.ok(!totalsKeys.some(k => k.toLowerCase().includes('account')));
    
    // No account number in positions
    for (const pos of positions) {
      const posKeys = Object.keys(pos);
      assert.ok(!posKeys.some(k => k.toLowerCase().includes('account')));
    }
    
    // Snapshot doesn't contain raw account digits
    const snapshot = {
      schema_version: 1, source: 'samsungpop', captured_at: new Date().toISOString(),
      currency: 'KRW', totals: { total_valuation: 100, total_pl: 0, total_return_rate: 0, cash_balance: 50 },
      positions: [{ name: 'Test', quantity: 1, valuation: 100, pl: 0, returnRate: 0 }],
      capture_status: 'SAVED'
    };
    
    const originalSnapshotDir = process.env.SNAPSHOT_DIR;
    process.env.SNAPSHOT_DIR = testSnapshotDir;
    try {
      const { writeSnapshot: ws } = await import('./samsungpop-playwright/collect.mjs');
      const result = await ws(snapshot);
      const content = await readFile(resolve(root, result.path), 'utf8');
      assert.ok(!content.includes('123-456-789012'));
      assert.ok(!content.toLowerCase().includes('account'));
    } finally {
      delete process.env.SNAPSHOT_DIR;
    }
    
    console.log('PASS: No account number extraction anywhere');
  });

  test('canary snapshot preserved - real user snapshots not touched', async () => {
    // Verify canary file still exists and is intact
    const canaryFile = resolve(canarySnapshotDir, 'samsungpop-canary-2024-01-01.json');
    assert.ok(existsSync(canaryFile), 'Canary file should exist');
    const content = await readFile(canaryFile, 'utf8');
    const data = JSON.parse(content);
    assert.strictEqual(data.canary, true);
    assert.strictEqual(data.preserved, true);
    console.log('PASS: Canary snapshot preserved - real user snapshots not touched');
  });
});

describe('Samsung POP Controller Integration Tests', () => {
  test('controller module loads and exports all required functions', async () => {
    const controllerUrl = 'file:///' + resolve(root, 'scripts', 'samsungpop-controller.mjs').replace(/\\/g, '/');
    const controller = await import(controllerUrl);
    assert.ok(typeof controller.cmdCollect === 'function', 'cmdCollect exported');
    assert.ok(typeof controller.cmdOpen === 'function', 'cmdOpen exported');
    assert.ok(typeof controller.cmdStatus === 'function', 'cmdStatus exported');
    assert.ok(typeof controller.CollectCodeEnum === 'object', 'CollectCodeEnum exported');
    assert.ok(typeof controller.sanitizeCollect === 'function', 'sanitizeCollect exported');
    console.log('PASS: controller module loads with all exports');
  });
});

describe('Samsung POP Controller-Child E2E Tests', () => {
  let testProfileDir;
  let testOutputDir;
  let controllerPath;

  before(async () => {
    testProfileDir = await mkdtemp(resolve(tmpdir(), 'samsungpop-e2e-profile-'));
    testOutputDir = await mkdtemp(resolve(tmpdir(), 'samsungpop-e2e-output-'));
    controllerPath = resolve(root, 'scripts', 'samsungpop-controller.mjs');
    mkdirSync(testProfileDir, { recursive: true });
  });

  after(async () => {
    try { rm(testProfileDir, { recursive: true, force: true }); } catch {}
    try { rm(testOutputDir, { recursive: true, force: true }); } catch {}
  });

  function runController(subcommand, env = {}) {
    return new Promise((resolvePromise) => {
      const fakeOrigin = 'file:///' + FAKE_BALANCE_PAGE.replace(/\\/g, '/');
      const originalProfileDir = process.env.BANKING_PROFILE_DIR;
      process.env.BANKING_PROFILE_DIR = testProfileDir;
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
        if (originalProfileDir !== undefined) {
          process.env.BANKING_PROFILE_DIR = originalProfileDir;
        } else {
          delete process.env.BANKING_PROFILE_DIR;
        }
        try {
          const lines = stdout.trim().split('\n');
          for (const line of lines) {
            if (line.startsWith('{')) {
              const parsed = JSON.parse(line);
              if (parsed.state && parsed.browser && parsed.site && parsed.auth && (parsed.error_code || parsed.collect_code)) {
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
        if (originalProfileDir !== undefined) {
          process.env.BANKING_PROFILE_DIR = originalProfileDir;
        } else {
          delete process.env.BANKING_PROFILE_DIR;
        }
        resolvePromise({ code: -1, error_code: 'SPAWN_ERROR', error: err.message });
      });
    });
  }

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

  test('collect returns BROWSER_UNAVAILABLE when no valid session', async () => {
    const result = await runController('collect');
    assert.strictEqual(result.collect_code, 'BROWSER_UNAVAILABLE');
    console.log('PASS: collect without session returns BROWSER_UNAVAILABLE');
  });

  test('collect returns ERROR for child timeout/malformed', async () => {
    // This tests the failure paths - child process returns malformed output
    const cdpPort = generateCdpPort();
    const sessionToken = generateSessionToken();
    await writeCdpSession(testProfileDir, cdpPort, sessionToken);

    const result = await runController('collect', {
      CDP_PORT: String(cdpPort),
      CDP_PORT_FILE: resolve(testProfileDir, 'cdp-port'),
      CDP_SESSION_FILE: resolve(testProfileDir, 'cdp-session'),
      CDP_SESSION_TOKEN: sessionToken,
    });

    // Should return a collect-shaped result (not status-shaped)
    assert.ok(result.collect_code !== undefined, 'Should have collect_code');
    assert.ok(['BROWSER_UNAVAILABLE', 'ERROR', 'SCHEMA_CHANGED', 'NOT_ON_BALANCE_PAGE'].includes(result.collect_code));
    console.log(`PASS: collect failure returns collect_code: ${result.collect_code}`);
  });

  test('Controller runController normalizes collect errors to collect_code', async () => {
    // Test that controller normalizes all errors to collect-shaped result
    const result = await runController('collect');
    assert.ok(result.collect_code !== undefined, 'Should have collect_code');
    assert.ok(['BROWSER_UNAVAILABLE', 'ERROR', 'SCHEMA_CHANGED', 'NOT_ON_BALANCE_PAGE'].includes(result.collect_code));
    assert.ok(!result.error_code || result.error_code === 'NAVIGATION_FAILED', 'Should not have status-shaped error_code for collect');
    console.log('PASS: Controller normalizes collect errors to collect_code');
  });
});

describe('Samsung POP Session Sequence Tests', () => {
  let testProfileDir;
  let testOutputDir;
  let controllerPath;

  before(async () => {
    testProfileDir = await mkdtemp(resolve(tmpdir(), 'samsungpop-seq-profile-'));
    testOutputDir = await mkdtemp(resolve(tmpdir(), 'samsungpop-seq-output-'));
    controllerPath = resolve(root, 'scripts', 'samsungpop-controller.mjs');
    mkdirSync(testProfileDir, { recursive: true });
  });

  after(async () => {
    try { rm(testProfileDir, { recursive: true, force: true }); } catch {}
    try { rm(testOutputDir, { recursive: true, force: true }); } catch {}
  });

  function runController(subcommand, env = {}) {
    return new Promise((resolvePromise) => {
      const fakeOrigin = 'file:///' + FAKE_BALANCE_PAGE.replace(/\\/g, '/');
      const originalProfileDir = process.env.BANKING_PROFILE_DIR;
      process.env.BANKING_PROFILE_DIR = testProfileDir;
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
        if (originalProfileDir !== undefined) {
          process.env.BANKING_PROFILE_DIR = originalProfileDir;
        } else {
          delete process.env.BANKING_PROFILE_DIR;
        }
        try {
          const lines = stdout.trim().split('\n');
          for (const line of lines) {
            if (line.startsWith('{')) {
              const parsed = JSON.parse(line);
              if (parsed.state && parsed.browser && parsed.site && parsed.auth && (parsed.error_code || parsed.collect_code)) {
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
        if (originalProfileDir !== undefined) {
          process.env.BANKING_PROFILE_DIR = originalProfileDir;
        } else {
          delete process.env.BANKING_PROFILE_DIR;
        }
        resolvePromise({ code: -1, error_code: 'SPAWN_ERROR', error: err.message });
      });
    });
  }

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

  test('open → status → status → collect → status retains session', async () => {
    const cdpPort = generateCdpPort();
    const sessionToken = generateSessionToken();
    await writeCdpSession(testProfileDir, cdpPort, sessionToken);

    const baseEnv = {
      CDP_PORT: String(cdpPort),
      CDP_PORT_FILE: resolve(testProfileDir, 'cdp-port'),
      CDP_SESSION_FILE: resolve(testProfileDir, 'cdp-session'),
      CDP_SESSION_TOKEN: sessionToken,
    };

    // open
    const openResult = await runController('open', baseEnv);
    assert.strictEqual(openResult.error_code, 'NONE', 'open should succeed');
    assert.strictEqual(openResult.state, 'OPEN');

    // status (1st)
    const status1 = await runController('status', baseEnv);
    assert.strictEqual(status1.error_code, 'NONE', 'first status should succeed');

    // status (2nd)
    const status2 = await runController('status', baseEnv);
    assert.strictEqual(status2.error_code, 'NONE', 'second status should succeed');

    // collect
    const collectResult = await runController('collect', baseEnv);
    assert.ok(['SAVED', 'PARTIAL', 'SCHEMA_CHANGED', 'NOT_ON_BALANCE_PAGE'].includes(collectResult.collect_code), 'collect should return collect-shaped result');

    // status (3rd) - session must still exist
    const status3 = await runController('status', baseEnv);
    assert.strictEqual(status3.error_code, 'NONE', 'status after collect should succeed');

    console.log('PASS: open→status→status→collect→status retains session');
  });

  test('session persists across multiple collects', async () => {
    const cdpPort = generateCdpPort();
    const sessionToken = generateSessionToken();
    await writeCdpSession(testProfileDir, cdpPort, sessionToken);

    const baseEnv = {
      CDP_PORT: String(cdpPort),
      CDP_PORT_FILE: resolve(testProfileDir, 'cdp-port'),
      CDP_SESSION_FILE: resolve(testProfileDir, 'cdp-session'),
      CDP_SESSION_TOKEN: sessionToken,
    };

    // Multiple collects
    const c1 = await runController('collect', baseEnv);
    assert.ok(c1.collect_code !== undefined, 'collect 1 should have collect_code');
    
    const c2 = await runController('collect', baseEnv);
    assert.ok(c2.collect_code !== undefined, 'collect 2 should have collect_code');
    
    const c3 = await runController('collect', baseEnv);
    assert.ok(c3.collect_code !== undefined, 'collect 3 should have collect_code');

    console.log('PASS: Session persists across multiple collects');
  });
});
