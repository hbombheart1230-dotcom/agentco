/**
 * Samsung POP Open - Playwright Implementation
 *
 * Launches Edge detached with persistent banking profile and random CDP port,
 * connects via CDP to navigate to Samsung POP, reports fixed status, exits.
 * Browser stays running (detached) for user manual login.
 * NO profile cloning, NO cookie/storage inspection, NO raw page data exposed.
 */

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const ORIGIN = process.env.SAMSUNGPOP_ORIGIN || 'https://www.samsungpop.com/';
const PROFILE_DIR = process.env.BANKING_PROFILE_DIR;
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

async function determineAuthStatus(page) {
  try {
    // Only explicit positive UI indicators count
    const loggedInSelectors = [
      '[data-testid="user-menu"]', '.user-profile', '#logout-button',
      'button:has-text("로그아웃")', 'a:has-text("마이페이지")',
      '.header-user', '.user-name', '[data-user-id]',
    ];
    for (const sel of loggedInSelectors) {
      try {
        const el = await page.$(sel);
        if (el) return AuthEnum.LOGGED_IN;
      } catch {}
    }

    const loggedOutSelectors = [
      'button:has-text("로그인")', 'a:has-text("로그인")',
      '#login-button', '.login-btn', '.btn-login',
    ];
    for (const sel of loggedOutSelectors) {
      try {
        const el = await page.$(sel);
        if (el) return AuthEnum.LOGGED_OUT;
      } catch {}
    }

    // No cookie/localStorage inference; ambiguous => UNKNOWN
    return AuthEnum.UNKNOWN;
  } catch {
    return AuthEnum.UNKNOWN;
  }
}

function launchEdgeDetached(cdpPort) {
  const edgeArgs = [
    `--user-data-dir=${PROFILE_DIR}`,
    `--remote-debugging-port=${cdpPort}`,
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
    if (!PROFILE_DIR) {
      console.log(JSON.stringify(sanitize({ state: StateEnum.ERROR, browser: BrowserEnum.UNKNOWN, site: StateEnum.UNKNOWN, auth: AuthEnum.UNKNOWN, error_code: ErrorCodeEnum.UNSUPPORTED })));
      process.exitCode = 1;
      return;
    }

    const cdpPort = parseInt(process.env.CDP_PORT || '9222', 10);

    // Launch Edge detached with our profile and CDP port
    launchEdgeDetached(cdpPort);

    // Wait for CDP endpoint to be ready
    const cdpReady = await waitForCDP(cdpPort);
    if (!cdpReady) {
      console.log(JSON.stringify(sanitize({ state: StateEnum.ERROR, browser: BrowserEnum.UNKNOWN, site: StateEnum.UNKNOWN, auth: AuthEnum.UNKNOWN, error_code: ErrorCodeEnum.NAVIGATION_FAILED })));
      return;
    }

    // Connect via CDP to navigate and verify
    browser = await chromium.connectOverCDP(`http://localhost:${cdpPort}`, { timeout: 10000 });

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
    let isSameOrigin = false;
    try {
      const url = new URL(currentUrl);
      isSameOrigin = url.origin === new URL(ORIGIN).origin;
    } catch {}
    if (!isSameOrigin) {
      console.log(JSON.stringify(sanitize({ state: StateEnum.ERROR, browser: BrowserEnum.RUNNING, site: SiteEnum.OTHER, auth: AuthEnum.UNKNOWN, error_code: ErrorCodeEnum.NAVIGATION_FAILED })));
      await browser.close();
      return;
    }

    // Wait for page to be interactive
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    // Determine login status using shared logic
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

    // Disconnect Playwright but leave browser running (detached) for CDP attachment
    await browser.close();

  } catch (err) {
    const msg = err?.message || String(err);
    let error_code = ErrorCodeEnum.UNKNOWN;
    const lowerMsg = msg.toLowerCase();
    const isProfileLock = /\b(lock(ed|ing)?|in use)\b/.test(lowerMsg) || lowerMsg.includes('profile locked') || lowerMsg.includes('singletonlock');
    const isNavigationFail = lowerMsg.includes('navigation') || lowerMsg.includes('timeout') || lowerMsg.includes('target page, context or browser has been closed');
    if (isProfileLock) error_code = ErrorCodeEnum.PROFILE_LOCKED;
    else if (isNavigationFail) error_code = ErrorCodeEnum.NAVIGATION_FAILED;
    console.log(JSON.stringify(sanitize({ state: StateEnum.ERROR, browser: BrowserEnum.UNKNOWN, site: StateEnum.UNKNOWN, auth: AuthEnum.UNKNOWN, error_code })));
    process.exitCode = 1;
  }
}

main();