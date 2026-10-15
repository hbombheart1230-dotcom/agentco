/**
 * Samsung POP Collect - Playwright Implementation
 *
 * Attaches to controller-owned Edge instance via CDP and extracts
 * ONLY allowed balance/holdings fields from the current page.
 * Writes a timestamped JSON snapshot to results/samsungpop/snapshots/.
 * NO navigation, NO cookie/storage inspection, NO raw page data exposed.
 * Returns only bounded metadata (status, count, relative path).
 *
 * IMPORTANT: CDP port + session token verification is NOT proof of actual Edge process ownership.
 * Token is controller-written and controller-read; this attaches to whatever
 * process listens on that port. No PID/launch-identity verification is performed.
 * Auth=UNKNOWN returned conservatively for S1 manual-login flow.
 */

import { chromium } from 'playwright';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', '..');

const ORIGIN = process.env.SAMSUNGPOP_ORIGIN || 'https://www.samsungpop.com/';
const PROFILE_DIR = process.env.BANKING_PROFILE_DIR;
const CDP_PORT_FILE = process.env.CDP_PORT_FILE;
const CDP_SESSION_FILE = process.env.CDP_SESSION_FILE;
const CDP_SESSION_TOKEN = process.env.CDP_SESSION_TOKEN;
const SNAPSHOT_DIR = resolve(root, 'results', 'samsungpop', 'snapshots');

// S2 whitelisted fields for holdings extraction
// These selectors must be validated against live Samsung POP during user-supervised session
const HOLDING_SELECTORS = {
  name: '[data-testid="holding-name"], .holding-name, .stock-name, td.name',
  quantity: '[data-testid="holding-qty"], .holding-qty, .quantity, td.qty',
  valuation: '[data-testid="holding-valuation"], .holding-valuation, .valuation, td.valuation',
  pl: '[data-testid="holding-pl"], .holding-pl, .pl, td.pl',
  returnRate: '[data-testid="holding-return"], .holding-return, .return-rate, td.return'
};

// Top-level totals selectors
const TOTAL_SELECTORS = {
  totalValuation: '[data-testid="total-valuation"], .total-valuation, .total-valuation-value',
  totalPL: '[data-testid="total-pl"], .total-pl, .total-pl-value',
  totalReturnRate: '[data-testid="total-return"], .total-return, .total-return-value',
  cashBalance: '[data-testid="cash-balance"], .cash-balance, .cash-balance-value'
};

const StateEnum = { OPEN: 'OPEN', LOGGED_IN: 'LOGGED_IN', LOGGED_OUT: 'LOGGED_OUT', UNKNOWN: 'UNKNOWN', ERROR: 'ERROR' };
const BrowserEnum = { RUNNING: 'RUNNING', NOT_RUNNING: 'NOT_RUNNING', UNKNOWN: 'UNKNOWN' };
const SiteEnum = { SAMSUNGPOP: 'SAMSUNGPOP', OTHER: 'OTHER', UNKNOWN: 'UNKNOWN' };
const AuthEnum = { LOGGED_IN: 'LOGGED_IN', LOGGED_OUT: 'LOGGED_OUT', UNKNOWN: 'UNKNOWN' };
// S2 collect-specific result codes
const CollectCodeEnum = { 
  SAVED: 'SAVED', 
  PARTIAL: 'PARTIAL', 
  LOGIN_REQUIRED: 'LOGIN_REQUIRED', 
  NOT_ON_BALANCE_PAGE: 'NOT_ON_BALANCE_PAGE', 
  SCHEMA_CHANGED: 'SCHEMA_CHANGED', 
  BROWSER_UNAVAILABLE: 'BROWSER_UNAVAILABLE', 
  ERROR: 'ERROR' 
};

const StateValues = Object.values(StateEnum);
const BrowserValues = Object.values(BrowserEnum);
const SiteValues = Object.values(SiteEnum);
const AuthValues = Object.values(AuthEnum);
const CollectCodeValues = Object.values(CollectCodeEnum);

function sanitize(raw) {
  const state = StateValues.includes(raw?.state) ? raw.state : StateEnum.UNKNOWN;
  const browser = BrowserValues.includes(raw?.browser) ? raw.browser : BrowserEnum.UNKNOWN;
  const site = SiteValues.includes(raw?.site) ? raw.site : SiteEnum.UNKNOWN;
  const auth = AuthValues.includes(raw?.auth) ? raw.auth : AuthEnum.UNKNOWN;
  const collect_code = CollectCodeValues.includes(raw?.collect_code) ? raw.collect_code : CollectCodeEnum.ERROR;
  // Preserve bounded metadata only (no raw financial values)
  const saved_path = typeof raw?.saved_path === 'string' && raw.saved_path.startsWith('results/samsungpop/snapshots/') ? raw.saved_path : undefined;
  const totals_count = Number.isInteger(raw?.totals_count) && raw.totals_count >= 0 && raw.totals_count <= 10 ? raw.totals_count : undefined;
  const positions_count = Number.isInteger(raw?.positions_count) && raw.positions_count >= 0 && raw.positions_count <= 100 ? raw.positions_count : undefined;
  return { state, browser, site, auth, collect_code, saved_path, totals_count, positions_count };
}

function parseKRW(text) {
  if (!text) return null;
  const cleaned = text.replace(/[^\d.\-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parsePercent(text) {
  if (!text) return null;
  const cleaned = text.replace(/[^\d.\-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseIntSafe(text) {
  if (!text) return null;
  const cleaned = text.replace(/[^\d\-]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

async function extractTotals(page) {
  const totals = {};
  for (const [key, selector] of Object.entries(TOTAL_SELECTORS)) {
    try {
      const element = await page.$(selector);
      if (element) {
        const text = await element.textContent();
        if (text && text.trim()) {
          if (key === 'totalReturnRate') {
            totals[key] = parsePercent(text.trim());
          } else {
            totals[key] = parseKRW(text.trim());
          }
        }
      }
    } catch {
      // Selector not found - leave as undefined
    }
  }
  return totals;
}

async function extractHoldings(page) {
  const positions = [];
  try {
    // Try to find holding rows - table rows or list items
    const rows = await page.$$('.holding-row, tr.holding, .position-row, [data-testid="holding-row"]');
    for (const row of rows) {
      const position = {};
      for (const [key, selector] of Object.entries(HOLDING_SELECTORS)) {
        try {
          const element = await row.$(selector);
          if (element) {
            const text = await element.textContent();
            if (text && text.trim()) {
              if (key === 'quantity') {
                position[key] = parseIntSafe(text.trim());
              } else if (key === 'returnRate') {
                position[key] = parsePercent(text.trim());
              } else if (key === 'valuation' || key === 'pl') {
                position[key] = parseKRW(text.trim());
              } else {
                position[key] = text.trim();
              }
            }
          }
        } catch {}
      }
      // Only add if has at least name and one numeric field
      if (position.name && (position.valuation !== undefined || position.quantity !== undefined)) {
        positions.push(position);
      }
    }
  } catch {}
  return positions;
}

async function determineAuthStatus(page) {
  // S2: No generic DOM selectors for auth state.
  // Return UNKNOWN conservatively; user manually confirms login if needed.
  return AuthEnum.UNKNOWN;
}

async function determinePageType(page) {
  try {
    const url = new URL(page.url());
    const pathname = url.pathname.toLowerCase();
    // Korean/English balance page keywords - must be validated against live Samsung POP
    if (pathname.includes('balance') || pathname.includes('holding') || pathname.includes('account') || pathname.includes('asset') ||
        pathname.includes('잔고') || pathname.includes('보유') || pathname.includes('계좌') || pathname.includes('자산')) {
      return 'BALANCE_PAGE';
    }
    // Also allow if page has financial table markers
    const hasFinancialMarkers = await page.evaluate(() => {
      const text = document.body.innerText || '';
      return /총\s*평가|총\s*손익|총\s*수익률|예수금|보유종목|종목명|수량|평가금액|손익|수익률/.test(text);
    });
    if (hasFinancialMarkers) return 'BALANCE_PAGE';
  } catch {}
  return 'OTHER';
}

async function writeSnapshot(data) {
  try {
    mkdirSync(SNAPSHOT_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filename = `samsungpop-${timestamp}-${randomSuffix}.json`;
    const filepath = resolve(SNAPSHOT_DIR, filename);
    const tempPath = filepath + '.tmp';
    // Atomic write: write to temp, then rename
    writeFileSync(tempPath, JSON.stringify(data, null, 2), { mode: 0o600 });
    const { renameSync } = await import('node:fs');
    renameSync(tempPath, filepath);
    return { path: `results/samsungpop/snapshots/${filename}`, absolute: filepath };
  } catch (err) {
    console.error('Snapshot write failed:', err.message);
    return null;
  }
}

function readCdpPortFromFile() {
  if (!CDP_SESSION_FILE || !existsSync(CDP_SESSION_FILE)) return null;
  try {
    const content = readFileSync(CDP_SESSION_FILE, 'utf8').trim();
    const data = JSON.parse(content);
    if (data && Number.isInteger(data.port) && data.port > 1024 && data.port < 65535 && typeof data.token === 'string') {
      if (CDP_SESSION_TOKEN && data.token !== CDP_SESSION_TOKEN) {
        return null; // Token mismatch - not our session
      }
      return data.port;
    }
  } catch {}
  return null;
}

async function main() {
  let browser;
  try {
    if (!PROFILE_DIR) throw new Error('BANKING_PROFILE_DIR not set');

    const cdpPort = readCdpPortFromFile();
    if (!cdpPort) {
      console.log(JSON.stringify(sanitize({
        state: StateEnum.UNKNOWN, browser: BrowserEnum.NOT_RUNNING, site: SiteEnum.UNKNOWN, auth: AuthEnum.UNKNOWN, collect_code: CollectCodeEnum.BROWSER_UNAVAILABLE
      })));
      return;
    }
    const CDP_URL = `http://localhost:${cdpPort}`;

    try {
      browser = await chromium.connectOverCDP(CDP_URL, { timeout: 5000 });

      let browserAlive = false;
      try {
        const version = await browser.version();
        browserAlive = !!version;
      } catch {}

      if (!browserAlive) {
        console.log(JSON.stringify(sanitize({
          state: StateEnum.UNKNOWN, browser: BrowserEnum.NOT_RUNNING, site: SiteEnum.UNKNOWN, auth: AuthEnum.UNKNOWN, collect_code: CollectCodeEnum.BROWSER_UNAVAILABLE
        })));
        await browser.close().catch(() => {});
        return;
      }

      const contexts = browser.contexts();
      if (contexts.length === 0) {
        console.log(JSON.stringify(sanitize({
          state: StateEnum.UNKNOWN, browser: BrowserEnum.RUNNING, site: SiteEnum.UNKNOWN, auth: AuthEnum.UNKNOWN, collect_code: CollectCodeEnum.BROWSER_UNAVAILABLE
        })));
        await browser.close();
        return;
      }

      const context = contexts[0];
      const pages = context.pages();

      let hasLivePage = false;
      for (const page of pages) {
        try {
          await page.evaluate(() => 1);
          hasLivePage = true;
          break;
        } catch {}
      }

      if (!hasLivePage) {
        console.log(JSON.stringify(sanitize({
          state: StateEnum.UNKNOWN, browser: BrowserEnum.NOT_RUNNING, site: SiteEnum.UNKNOWN, auth: AuthEnum.UNKNOWN, collect_code: CollectCodeEnum.BROWSER_UNAVAILABLE
        })));
        await browser.close();
        return;
      }

      const samsungPage = pages.find(p => {
        try {
          const url = new URL(p.url());
          return url.origin === new URL(ORIGIN).origin;
        } catch {
          return false;
        }
      });

      if (!samsungPage) {
        console.log(JSON.stringify(sanitize({
          state: StateEnum.UNKNOWN, browser: BrowserEnum.RUNNING, site: SiteEnum.OTHER, auth: AuthEnum.UNKNOWN, collect_code: CollectCodeEnum.NOT_ON_BALANCE_PAGE
        })));
        await browser.close();
        return;
      }

      // Check if on a balance/holdings page
      const pageType = await determinePageType(samsungPage);
      if (pageType !== 'BALANCE_PAGE') {
        console.log(JSON.stringify(sanitize({
          state: StateEnum.OPEN, browser: BrowserEnum.RUNNING, site: SiteEnum.SAMSUNGPOP, auth: AuthEnum.UNKNOWN, collect_code: CollectCodeEnum.NOT_ON_BALANCE_PAGE
        })));
        await browser.close();
        return;
      }

      // Extract totals and holdings
      const totals = await extractTotals(samsungPage);
      const positions = await extractHoldings(samsungPage);

      const hasTotals = Object.keys(totals).some(k => totals[k] !== null && totals[k] !== undefined);
      const hasPositions = positions.length > 0;

      if (!hasTotals && !hasPositions) {
        // No financial data found - selector drift or login page
        console.log(JSON.stringify(sanitize({
          state: StateEnum.OPEN, browser: BrowserEnum.RUNNING, site: SiteEnum.SAMSUNGPOP, auth: AuthEnum.UNKNOWN, collect_code: CollectCodeEnum.SCHEMA_CHANGED
        })));
        await browser.close();
        return;
      }

      const authStatus = await determineAuthStatus(samsungPage);
      const state = authStatus === AuthEnum.LOGGED_IN ? StateEnum.LOGGED_IN :
                    authStatus === AuthEnum.LOGGED_OUT ? StateEnum.LOGGED_OUT : StateEnum.OPEN;

      const collectCode = (hasTotals && hasPositions) ? CollectCodeEnum.SAVED : CollectCodeEnum.PARTIAL;

      // Build snapshot data
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
        capture_status: collectCode
      };

      const snapshotResult = await writeSnapshot(snapshot);
      if (!snapshotResult) {
        console.log(JSON.stringify(sanitize({
          state, browser: BrowserEnum.RUNNING, site: SiteEnum.SAMSUNGPOP, auth: authStatus, collect_code: CollectCodeEnum.ERROR
        })));
        await browser.close();
        return;
      }

      // Return bounded metadata only - NO raw values
      const result = sanitize({
        state,
        browser: BrowserEnum.RUNNING,
        site: SiteEnum.SAMSUNGPOP,
        auth: authStatus,
        collect_code: collectCode
      });
      result.saved_path = snapshotResult.path;
      result.totals_count = Object.keys(totals).filter(k => totals[k] !== null).length;
      result.positions_count = positions.length;

      console.log(JSON.stringify(result));
      await browser.close();
      return;

    } catch (cdpErr) {
      const fs = await import('node:fs');
      const profileExists = fs.existsSync(PROFILE_DIR);
      let hasContent = false;
      if (profileExists) {
        try {
          const entries = fs.readdirSync(PROFILE_DIR);
          hasContent = entries.length > 0;
        } catch { hasContent = false; }
      }

      if (!profileExists || !hasContent) {
        console.log(JSON.stringify(sanitize({
          state: StateEnum.UNKNOWN, browser: BrowserEnum.NOT_RUNNING, site: SiteEnum.SAMSUNGPOP, auth: AuthEnum.UNKNOWN, collect_code: CollectCodeEnum.BROWSER_UNAVAILABLE
        })));
        return;
      }

      console.log(JSON.stringify(sanitize({
        state: StateEnum.UNKNOWN, browser: BrowserEnum.NOT_RUNNING, site: SiteEnum.SAMSUNGPOP, auth: AuthEnum.UNKNOWN, collect_code: CollectCodeEnum.BROWSER_UNAVAILABLE
      })));
      return;
    }

  } catch (err) {
    const msg = err?.message || String(err);
    let collect_code = CollectCodeEnum.ERROR;
    const lowerMsg = msg.toLowerCase();
    if (/\b(lock(ed|ing)?|in use)\b/.test(lowerMsg) || lowerMsg.includes('profile locked') || lowerMsg.includes('singletonlock')) collect_code = CollectCodeEnum.ERROR;
    else if (lowerMsg.includes('navigation') || lowerMsg.includes('timeout') || lowerMsg.includes('target page, context or browser has been closed')) collect_code = CollectCodeEnum.ERROR;
    console.log(JSON.stringify(sanitize({ state: StateEnum.ERROR, browser: BrowserEnum.UNKNOWN, site: SiteEnum.UNKNOWN, auth: AuthEnum.UNKNOWN, collect_code })));
    process.exitCode = 1;
  }
}

// Export extraction functions for direct testing
export { parseKRW, parsePercent, parseIntSafe, extractTotals, extractHoldings, determinePageType, writeSnapshot, sanitize, StateEnum, BrowserEnum, SiteEnum, AuthEnum, CollectCodeEnum, HOLDING_SELECTORS, TOTAL_SELECTORS };

main();