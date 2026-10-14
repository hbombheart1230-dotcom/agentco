/**
 * Samsung POP Status - Playwright Implementation
 *
 * Checks browser/login status by attaching to existing Edge instance via CDP.
 * NO profile cloning, NO navigation. NEVER returns raw page content, URLs, or snapshots.
 */

import { chromium } from 'playwright';

const ORIGIN = process.env.SAMSUNGPOP_ORIGIN || 'https://www.samsungpop.com/';
const PROFILE_DIR = process.env.BANKING_PROFILE_DIR;
const CDP_PORT = parseInt(process.env.CDP_PORT || '9222', 10);
const CDP_URL = `http://localhost:${CDP_PORT}`;

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

async function main() {
  let browser;
  try {
    if (!PROFILE_DIR) throw new Error('BANKING_PROFILE_DIR not set');

    // Try to attach to running browser via CDP
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

      const samsungPage = pages.find(p => p.url().startsWith(ORIGIN));

      if (!samsungPage) {
        // Browser running but not on Samsung POP
        console.log(JSON.stringify(sanitize({
          state: StateEnum.UNKNOWN, browser: BrowserEnum.RUNNING, site: SiteEnum.OTHER, auth: AuthEnum.UNKNOWN, error_code: ErrorCodeEnum.NONE
        })));
        await browser.close();
        return;
      }

      // Determine auth status using same logic as open
      const authStatus = await determineAuthStatus(samsungPage);

      const state = authStatus === AuthEnum.LOGGED_IN ? StateEnum.LOGGED_IN :
                    authStatus === AuthEnum.LOGGED_OUT ? StateEnum.LOGGED_OUT : StateEnum.OPEN;

      console.log(JSON.stringify(sanitize({
        state, browser: BrowserEnum.RUNNING, site: SiteEnum.SAMSUNGPOP, auth: authStatus, error_code: ErrorCodeEnum.NONE
      })));
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

async function determineAuthStatus(page) {
  try {
    // Check for logged-in indicators
    const loggedInSelectors = [
      '[data-testid="user-menu"]',
      '.user-profile',
      '#logout-button',
      'button:has-text("로그아웃")',
      'a:has-text("마이페이지")',
      '[class*="logged-in"]',
      '.header-user',
      '.user-name',
      '[data-user-id]',
    ];
    for (const sel of loggedInSelectors) {
      const el = await page.$(sel);
      if (el) return AuthEnum.LOGGED_IN;
    }

    // Check for logged-out indicators
    const loggedOutSelectors = [
      'button:has-text("로그인")',
      'a:has-text("로그인")',
      '#login-button',
      '[data-testid="login-button"]',
      '.login-btn',
      '.btn-login',
      'input[id*="login"i]',
      'form[action*="login"i]',
    ];
    for (const sel of loggedOutSelectors) {
      const el = await page.$(sel);
      if (el) return AuthEnum.LOGGED_OUT;
    }

    // Check cookies/storage as fallback
    const hasAuthData = await page.evaluate(() => {
      try {
        const cookies = document.cookie;
        if (cookies.includes('auth') || cookies.includes('session') || cookies.includes('token') || cookies.includes('login')) return true;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('auth') || key.includes('token') || key.includes('user') || key.includes('login'))) return true;
        }
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key.includes('auth') || key.includes('token') || key.includes('user') || key.includes('login'))) return true;
        }
        return false;
      } catch { return false; }
    }).catch(() => false);

    return hasAuthData ? AuthEnum.LOGGED_IN : AuthEnum.LOGGED_OUT;
  } catch {
    return AuthEnum.UNKNOWN;
  }
}

main();