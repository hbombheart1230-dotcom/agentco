/**
 * Samsung POP Status - Playwright Implementation
 *
 * Runs in isolated child process. Checks browser/login status WITHOUT navigation.
 * Attaches to existing Edge instance via CDP if available, or launches headless check.
 * NEVER returns raw page content, URLs, or snapshots to parent.
 */

import { chromium } from 'playwright';

const ORIGIN = process.env.SAMSUNGPOP_ORIGIN || 'https://www.samsungpop.com/';
const PROFILE_DIR = process.env.BANKING_PROFILE_DIR;

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
  let context;
  try {
    if (!PROFILE_DIR) throw new Error('BANKING_PROFILE_DIR not set');

    try {
      browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 5000 });
      const contexts = browser.contexts();
      if (contexts.length > 0) {
        context = contexts[0];
        const pages = context.pages();
        const samsungPage = pages.find(p => p.url().startsWith(ORIGIN));

        if (samsungPage) {
          let authStatus = AuthEnum.UNKNOWN;
          try {
            const loggedInSelectors = [
              '[data-testid="user-menu"]', '.user-profile', '#logout-button',
              'button:has-text("로그아웃")', 'a:has-text("마이페이지")', '[class*="logged-in"]'
            ];
            for (const sel of loggedInSelectors) {
              const el = await samsungPage.$(sel);
              if (el) { authStatus = AuthEnum.LOGGED_IN; break; }
            }
            if (authStatus === AuthEnum.UNKNOWN) {
              const loggedOutSelectors = [
                'button:has-text("로그인")', 'a:has-text("로그인")', '#login-button', '[data-testid="login-button"]'
              ];
              for (const sel of loggedOutSelectors) {
                const el = await samsungPage.$(sel);
                if (el) { authStatus = AuthEnum.LOGGED_OUT; break; }
              }
            }
          } catch { authStatus = AuthEnum.UNKNOWN; }

          const state = authStatus === AuthEnum.LOGGED_IN ? StateEnum.LOGGED_IN :
                        authStatus === AuthEnum.LOGGED_OUT ? StateEnum.LOGGED_OUT : StateEnum.OPEN;

          console.log(JSON.stringify(sanitize({
            state, browser: BrowserEnum.RUNNING, site: SiteEnum.SAMSUNGPOP, auth: authStatus, error_code: ErrorCodeEnum.NONE
          })));
          return;
        }
      }
      console.log(JSON.stringify(sanitize({
        state: StateEnum.UNKNOWN, browser: BrowserEnum.RUNNING, site: SiteEnum.OTHER, auth: AuthEnum.UNKNOWN, error_code: ErrorCodeEnum.NONE
      })));
      return;
    } catch {
      // No CDP connection
    }

    const fs = await import('node:fs');
    const path = await import('node:path');
    const os = await import('node:os');
    
    // Check if profile directory exists and has content
    const profileExists = fs.existsSync(PROFILE_DIR);
    let hasContent = false;
    if (profileExists) {
      try {
        const entries = fs.readdirSync(PROFILE_DIR);
        hasContent = entries.length > 0;
      } catch { hasContent = false; }
    }
    
    if (!profileExists || !hasContent) {
      // No profile data yet - browser may have been opened but no login info available
      console.log(JSON.stringify(sanitize({
        state: StateEnum.UNKNOWN, browser: BrowserEnum.NOT_RUNNING, site: SiteEnum.SAMSUNGPOP, auth: AuthEnum.UNKNOWN, error_code: ErrorCodeEnum.NONE
      })));
      return;
    }

    const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'samsungpop-status-'));
    await fs.promises.cp(PROFILE_DIR, tmpDir, { recursive: true });

    context = await chromium.launchPersistentContext(tmpDir, {
      channel: 'msedge',
      headless: true,
      viewport: { width: 1280, height: 720 },
    });
    browser = context.browser();
    const page = context.pages()[0] || await context.newPage();

    const hasAuthCookie = await page.evaluate(() => {
      return document.cookie.includes('auth') || document.cookie.includes('session') || document.cookie.includes('token');
    }).catch(() => false);

    const hasAuthStorage = await page.evaluate(() => {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('auth') || key.includes('token') || key.includes('user'))) return true;
        }
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key.includes('auth') || key.includes('token') || key.includes('user'))) return true;
        }
        return false;
      } catch { return false; }
    }).catch(() => false);

    let authStatus = hasAuthCookie || hasAuthStorage ? AuthEnum.LOGGED_IN : AuthEnum.LOGGED_OUT;
    const state = authStatus === AuthEnum.LOGGED_IN ? StateEnum.LOGGED_IN : StateEnum.LOGGED_OUT;

    console.log(JSON.stringify(sanitize({
      state, browser: BrowserEnum.NOT_RUNNING, site: SiteEnum.SAMSUNGPOP, auth: authStatus, error_code: ErrorCodeEnum.NONE
    })));

    await context.close();
    await fs.promises.rm(tmpDir, { recursive: true, force: true });

  } catch (err) {
    const msg = err?.message || String(err);
    let error_code = ErrorCodeEnum.UNKNOWN;
    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes('lock') || lowerMsg.includes('profile locked') || lowerMsg.includes('in use')) error_code = ErrorCodeEnum.PROFILE_LOCKED;
    else if (lowerMsg.includes('navigation') || lowerMsg.includes('timeout') || lowerMsg.includes('target page, context or browser has been closed')) error_code = ErrorCodeEnum.NAVIGATION_FAILED;
    console.log(JSON.stringify(sanitize({ state: StateEnum.ERROR, browser: BrowserEnum.UNKNOWN, site: SiteEnum.UNKNOWN, auth: AuthEnum.UNKNOWN, error_code })));
    process.exitCode = 1;
  }
}

main();