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
import { mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const FAKE_BALANCE_PAGE = resolve(root, 'fixtures', 'samsungpop-fake-balance.html');

let testBrowser;
let testPage;
let snapshotDir;

describe('Samsung POP Collect - Fake Page Extraction & Persistence Tests', () => {
  before(async () => {
    testBrowser = await chromium.launch({ headless: true });
    testPage = await testBrowser.newPage();
    await testPage.goto('file:///' + FAKE_BALANCE_PAGE.replace(/\\\\/g, '/'));
    
    snapshotDir = resolve(root, 'results', 'samsungpop', 'snapshots');
    mkdirSync(snapshotDir, { recursive: true });

    console.log(`Fake page: ${FAKE_BALANCE_PAGE}`);
    console.log(`Snapshot dir: ${snapshotDir}`);
  });

  after(async () => {
    try { await testBrowser.close(); } catch {}
    // Clean up test snapshots
    try { 
      if (existsSync(snapshotDir)) {
        const files = readdirSync(snapshotDir);
        for (const f of files) {
          if (f.startsWith('samsungpop-') && f.endsWith('.json')) {
            rmSync(resolve(snapshotDir, f), { force: true });
          }
        }
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
    
    const result = await writeSnapshot(snapshot);
    assert.ok(result, 'writeSnapshot should return result');
    assert.ok(result.path, 'Should have path');
    assert.ok(result.path.startsWith('results/samsungpop/snapshots/'), 'Path should be relative to results');
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
    
    const result1 = await writeSnapshot(snapshot1);
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
    
    const result2 = await writeSnapshot(snapshot2);
    assert.ok(result2.path);
    assert.notStrictEqual(result1.path, result2.path, 'Should create distinct files');
    
    const snap1 = JSON.parse(await readFile(resolve(root, result1.path), 'utf8'));
    const snap2 = JSON.parse(await readFile(resolve(root, result2.path), 'utf8'));
    assert.notStrictEqual(snap1.captured_at, snap2.captured_at);
    
    console.log('PASS: Second writeSnapshot creates distinct file (no overwrite)');
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
    const result = await writeSnapshot(snapshot);
    const content = await readFile(resolve(root, result.path), 'utf8');
    assert.ok(!content.includes('123-456-789012'));
    assert.ok(!content.toLowerCase().includes('account'));
    
    console.log('PASS: No account number extraction anywhere');
  });
});

describe('Samsung POP Controller Integration Tests', () => {
  test('controller module loads and exports all required functions', async () => {
    const controllerUrl = 'file:///' + resolve(root, 'scripts', 'samsungpop-controller.mjs').replace(/\\\\/g, '/');
    const controller = await import(controllerUrl);
    assert.ok(typeof controller.cmdCollect === 'function', 'cmdCollect exported');
    assert.ok(typeof controller.cmdOpen === 'function', 'cmdOpen exported');
    assert.ok(typeof controller.cmdStatus === 'function', 'cmdStatus exported');
    assert.ok(typeof controller.CollectCodeEnum === 'object', 'CollectCodeEnum exported');
    assert.ok(typeof controller.sanitizeCollect === 'function', 'sanitizeCollect exported');
    console.log('PASS: controller module loads with all exports');
  });
});
