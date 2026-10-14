/**
 * Samsung POP Open - Playwright Implementation
 *
 * Launches Edge directly with persistent banking profile and CDP enabled,
 * connects via CDP, navigates to Samsung POP, returns fixed enum status.
 * Browser stays running for CDP attachment by status command.
 * NEVER returns raw page content, URLs, or snapshots to parent.
 */

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const ORIGIN = process.env.SAMSUNGPOP_ORIGIN || 'https://www.samsungpop.com/';
const PROFILE_DIR = process.env.BANKING_PROFILE_DIR;
const OUTPUT_DIR = process.env.BANKING_OUTPUT_DIR;
const CDP_PORT = parseInt(process.env.CDP_PORT || '9222', 10);
const EDGE_PATH = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

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

function launchEdgeWithProfile() {
  const edgeArgs = [
    `--user-data-dir=${PROFILE_DIR}`,
    `--remote-debugging-port=${CDP_PORT}`,
    '--disable-blink-features=AutomationControlled',
    '--no-first-run',
    '--no-default-browser-check',
    ORIGIN,
  ];
  const edgeProcess = spawn(EDGE_PATH, edgeArgs, {
    detached: true,
    stdio: 'ignore',
    windowsHide: false,
  });
  edgeProcess.unref();
  return edgeProcess;
}

async function waitForCDP(port, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const browser = await chromium.connectOverCDP(`http://localhost:${port}`, { timeout: 2000 });
      await browser.close();
      return true;
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  return false;
}

async function main() {
  let browser;
  try {
    if (!PROFILE_DIR) throw new Error('BANKING_PROFILE_DIR not set');

    // Launch Edge directly with profile and CDP
    launchEdgeWithProfile();

    // Wait for CDP endpoint to be ready
    const cdpReady = await waitForCDP(CDP_PORT);
    if (!cdpReady) {
      console.log(JSON.stringify(sanitize({ state: StateEnum.ERROR, browser: BrowserEnum.UNKNOWN, site: SiteEnum.UNKNOWN, auth: AuthEnum.UNKNOWN, error_code: ErrorCodeEnum.NAVIGATION_FAILED })));
      return;
    }

    // Connect via CDP
    browser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`, { timeout: 10000 });

    const contexts = browser.contexts();
    const context = contexts[0] || await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = context.pages()[0] || await context.newPage();

    const response = await page.goto(ORIGIN, { waitUntil: 'domcontentloaded', timeout: 30000 });

    if (!response || response.status() >= 400) {
      console.log(JSON.stringify(sanitize({ state: StateEnum.ERROR, browser: BrowserEnum.RUNNING, site: SiteEnum.SAMSUNGPOP, auth: AuthEnum.UNKNOWN, error_code: ErrorCodeEnum.NAVIGATION_FAILED })));
      await browser.close();
      return;
    }

    const currentUrl = page.url();
    if (!currentUrl.startsWith(ORIGIN)) {
      console.log(JSON.stringify(sanitize({ state: StateEnum.ERROR, browser: BrowserEnum.RUNNING, site: SiteEnum.OTHER, auth: AuthEnum.UNKNOWN, error_code: ErrorCodeEnum.NAVIGATION_FAILED })));
      await browser.close();
      return;
    }

    // Wait for page to be interactive
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    // Determine login status using consistent logic
    const authStatus = await determineAuthStatus(page);

    const state = authStatus === AuthEnum.LOGGED_IN ? StateEnum.LOGGED_IN :
                  authStatus === AuthEnum.LOGGED_OUT ? StateEnum.LOGGED_OUT : StateEnum.OPEN;

    console.log(JSON.stringify(sanitize({
      state,
      browser: BrowserEnum.RUNNING,
      site: SiteEnum.SAMSUNGPOP,
      auth: authStatus,
      error_code: ErrorCodeEnum.NONE
    })));

    // Disconnect Playwright but leave browser running for CDP attachment
    await browser.close();

  } catch (err) {
    const msg = err?.message || String(err);
    let error_code = ErrorCodeEnum.UNKNOWN;
    const lowerMsg = msg.toLowerCase();
    const isProfileLock = /\b(lock(ed|ing)?|in use)\b/.test(lowerMsg) || lowerMsg.includes('profile locked') || lowerMsg.includes('singletonlock');
    const isNavigationFail = lowerMsg.includes('navigation') || lowerMsg.includes('timeout') || lowerMsg.includes('target page, context or browser has been closed');
    if (isProfileLock) error_code = ErrorCodeEnum.PROFILE_LOCKED;
    else if (isNavigationFail) error_code = ErrorCodeEnum.NAVIGATION_FAILED;
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