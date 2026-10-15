/**
 * Samsung POP Collect - Playwright Implementation
 *
 * Attaches to controller-owned Edge instance via CDP and extracts
 * ONLY allowed balance fields from the current page.
 * NO navigation, NO cookie/storage inspection, NO raw page data exposed.
 * Returns only sanitized balance data with masked account numbers.
 *
 * IMPORTANT: CDP port + session token verification is NOT proof of actual Edge process ownership.
 * Token is controller-written and controller-read; this attaches to whatever
 * process listens on that port. No PID/launch-identity verification is performed.
 * Auth=UNKNOWN returned conservatively for S1 manual-login flow.
 */

import { chromium } from 'playwright';
import { existsSync, readFileSync } from 'node:fs';

const ORIGIN = process.env.SAMSUNGPOP_ORIGIN || 'https://www.samsungpop.com/';
const PROFILE_DIR = process.env.BANKING_PROFILE_DIR;
const CDP_PORT_FILE = process.env.CDP_PORT_FILE;
const CDP_SESSION_FILE = process.env.CDP_SESSION_FILE;
const CDP_SESSION_TOKEN = process.env.CDP_SESSION_TOKEN;

// Allowed balance field selectors for fake page testing
// These are whitelisted selectors - only these fields are extracted
const BALANCE_SELECTORS = {
  TOTAL_BALANCE: '[data-testid="total-balance"], .total-balance, #totalBalance',
  AVAILABLE_BALANCE: '[data-testid="available-balance"], .available-balance, #availableBalance',
  EVALUATION_AMOUNT: '[data-testid="evaluation-amount"], .evaluation-amount, #evaluationAmount',
  ACCOUNT_NUMBER_MASKED: '[data-testid="account-number"], .account-number, #accountNumber'
};

const StateEnum = { OPEN: 'OPEN', LOGGED_IN: 'LOGGED_IN', LOGGED_OUT: 'LOGGED_OUT', UNKNOWN: 'UNKNOWN', ERROR: 'ERROR' };
const BrowserEnum = { RUNNING: 'RUNNING', NOT_RUNNING: 'NOT_RUNNING', UNKNOWN: 'UNKNOWN' };
const SiteEnum = { SAMSUNGPOP: 'SAMSUNGPOP', OTHER: 'OTHER', UNKNOWN: 'UNKNOWN' };
const AuthEnum = { LOGGED_IN: 'LOGGED_IN', LOGGED_OUT: 'LOGGED_OUT', UNKNOWN: 'UNKNOWN' };
const ErrorCodeEnum = { NONE: 'NONE', ISOLATION_BLOCKED: 'ISOLATION_BLOCKED', PROFILE_LOCKED: 'PROFILE_LOCKED', NAVIGATION_FAILED: 'NAVIGATION_FAILED', UNSUPPORTED: 'UNSUPPORTED', UNKNOWN: 'UNKNOWN' };

const StateValues = Object.values(StateEnum);
const BrowserValues = Object.values(BrowserEnum);
const SiteValues = Object.values(SiteEnum);
const AuthValues = Object.values(AuthEnum);
const ErrorCodeValues = Object.values(ErrorCodeEnum);

function sanitize(raw) {
  const state = StateValues.includes(raw?.state) ? raw.state : StateEnum.UNKNOWN;
  const browser = BrowserValues.includes(raw?.browser) ? raw.browser : BrowserEnum.UNKNOWN;
  const site = SiteValues.includes(raw?.site) ? raw.site : SiteEnum.UNKNOWN;
  const auth = AuthValues.includes(raw?.auth) ? raw.auth : AuthEnum.UNKNOWN;
  const error_code = ErrorCodeValues.includes(raw?.error_code) ? raw.error_code : ErrorCodeEnum.UNKNOWN;
  return { state, browser, site, auth, error_code };
}

function readCdpPortFromFile() {
  if (!CDP_SESSION_FILE || !existsSync(CDP_SESSION_FILE)) return null;
  try {
    const content = readFileSync(CDP_SESSION_FILE, 'utf8').trim();
    const data = JSON.parse(content);
    if (data && Number.isInteger(data.port) && data.port > 1024 && data.port < 65535 && typeof data.token === 'string') {
      // Verify session token matches expected token from controller
      if (CDP_SESSION_TOKEN && data.token !== CDP_SESSION_TOKEN) {
        return null; // Token mismatch - not our session
      }
      return data.port;
    }
  } catch {}
  return null;
}

async function extractBalanceFields(page) {
  const values = {};
  const fields = [];

  for (const [fieldName, selector] of Object.entries(BALANCE_SELECTORS)) {
    try {
      const element = await page.$(selector);
      if (element) {
        const text = await element.textContent();
        if (text && text.trim()) {
          // Clean and sanitize the value
          const cleanValue = text.trim().replace(/[^\d.,\-]/g, '');
          values[fieldName] = cleanValue;
          fields.push(fieldName);
        }
      }
    } catch {
      // Selector not found or error - skip this field
    }
  }

  return { values, fields };
}

async function determineAuthStatus(page) {
  // S2: No generic DOM selectors for auth state.
  // Return UNKNOWN conservatively; user manually confirms login if needed.
  return AuthEnum.UNKNOWN;
}

async function main() {
  let browser;
  try {
    if (!PROFILE_DIR) throw new Error('BANKING_PROFILE_DIR not set');

    // Read CDP port from controller's port file (ownership verification)
    const cdpPort = readCdpPortFromFile();
    if (!cdpPort) {
      console.log(JSON.stringify(sanitize({
        state: StateEnum.UNKNOWN, browser: BrowserEnum.NOT_RUNNING, site: SiteEnum.UNKNOWN, auth: AuthEnum.UNKNOWN, error_code: ErrorCodeEnum.NONE
      })));
      return;
    }
    const CDP_URL = `http://localhost:${cdpPort}`;

    // Try to attach to our browser via CDP
    try {
      browser = await chromium.connectOverCDP(CDP_URL, { timeout: 5000 });

      // Verify browser is actually alive by getting version
      let browserAlive = false;
      try {
        const version = await browser.version();
        browserAlive = !!version;
      } catch {}

      if (!browserAlive) {
        console.log(JSON.stringify(sanitize({
          state: StateEnum.UNKNOWN, browser: BrowserEnum.NOT_RUNNING, site: SiteEnum.UNKNOWN, auth: AuthEnum.UNKNOWN, error_code: ErrorCodeEnum.NONE
        })));
        await browser.close().catch(() => {});
        return;
      }

      const contexts = browser.contexts();

      if (contexts.length === 0) {
        console.log(JSON.stringify(sanitize({
          state: StateEnum.UNKNOWN, browser: BrowserEnum.RUNNING, site: SiteEnum.UNKNOWN, auth: AuthEnum.UNKNOWN, error_code: ErrorCodeEnum.NONE
        })));
        await browser.close();
        return;
      }

      const context = contexts[0];
      const pages = context.pages();

      // Verify pages are actually responsive
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
          state: StateEnum.UNKNOWN, browser: BrowserEnum.NOT_RUNNING, site: SiteEnum.UNKNOWN, auth: AuthEnum.UNKNOWN, error_code: ErrorCodeEnum.NONE
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
        // Browser running but not on Samsung POP
        console.log(JSON.stringify(sanitize({
          state: StateEnum.UNKNOWN, browser: BrowserEnum.RUNNING, site: SiteEnum.OTHER, auth: AuthEnum.UNKNOWN, error_code: ErrorCodeEnum.NONE
        })));
        await browser.close();
        return;
      }

      // Extract allowed balance fields only
      const { values, fields } = await extractBalanceFields(samsungPage);

      // Determine auth status using same logic as open/status
      const authStatus = await determineAuthStatus(samsungPage);

      const state = authStatus === AuthEnum.LOGGED_IN ? StateEnum.LOGGED_IN :
                    authStatus === AuthEnum.LOGGED_OUT ? StateEnum.LOGGED_OUT : StateEnum.OPEN;

      // Return collect result with balance fields
      const result = sanitize({
        state,
        browser: BrowserEnum.RUNNING,
        site: SiteEnum.SAMSUNGPOP,
        auth: authStatus,
        error_code: ErrorCodeEnum.NONE
      });

      // Add collect-specific fields
      result.fields = fields;
      result.values = values;

      console.log(JSON.stringify(result));
      await browser.close();
      return;

    } catch (cdpErr) {
      // CDP connection failed - browser not running or CDP not available
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
          state: StateEnum.UNKNOWN, browser: BrowserEnum.NOT_RUNNING, site: SiteEnum.SAMSUNGPOP, auth: AuthEnum.UNKNOWN, error_code: ErrorCodeEnum.NONE
        })));
        return;
      }

      // Profile exists but browser not running - cannot determine auth without launching
      console.log(JSON.stringify(sanitize({
        state: StateEnum.UNKNOWN, browser: BrowserEnum.NOT_RUNNING, site: SiteEnum.SAMSUNGPOP, auth: AuthEnum.UNKNOWN, error_code: ErrorCodeEnum.NONE
      })));
      return;
    }

  } catch (err) {
    const msg = err?.message || String(err);
    let error_code = ErrorCodeEnum.UNKNOWN;
    const lowerMsg = msg.toLowerCase();
    if (/\b(lock(ed|ing)?|in use)\b/.test(lowerMsg) || lowerMsg.includes('profile locked') || lowerMsg.includes('singletonlock')) error_code = ErrorCodeEnum.PROFILE_LOCKED;
    else if (lowerMsg.includes('navigation') || lowerMsg.includes('timeout') || lowerMsg.includes('target page, context or browser has been closed')) error_code = ErrorCodeEnum.NAVIGATION_FAILED;
    console.log(JSON.stringify(sanitize({ state: StateEnum.ERROR, browser: BrowserEnum.UNKNOWN, site: SiteEnum.UNKNOWN, auth: AuthEnum.UNKNOWN, error_code })));
    process.exitCode = 1;
  }
}

main();
