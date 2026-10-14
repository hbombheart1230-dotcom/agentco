/**
 * Samsung POP Open - Playwright Implementation
 *
 * Runs in isolated child process. Launches Edge with dedicated banking profile,
 * navigates to Samsung POP, and returns fixed enum status.
 * NEVER returns raw page content, URLs, or snapshots to parent.
 */

import { chromium } from 'playwright';

const ORIGIN = process.env.SAMSUNGPOP_ORIGIN || 'https://www.samsungpop.com/';
const PROFILE_DIR = process.env.BANKING_PROFILE_DIR;
const OUTPUT_DIR = process.env.BANKING_OUTPUT_DIR;

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

    context = await chromium.launchPersistentContext(PROFILE_DIR, {
      channel: 'msedge',
      headless: false,
      viewport: { width: 1280, height: 720 },
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--no-default-browser-check',
      ],
      ignoreDefaultArgs: ['--enable-automation'],
      recordVideo: { dir: OUTPUT_DIR || undefined },
    });

    browser = context.browser();
    const page = context.pages()[0] || await context.newPage();

    const response = await page.goto(ORIGIN, { waitUntil: 'domcontentloaded', timeout: 20000 });

    if (!response || response.status() >= 400) {
      console.log(JSON.stringify(sanitize({ state: StateEnum.ERROR, browser: BrowserEnum.RUNNING, site: SiteEnum.SAMSUNGPOP, auth: AuthEnum.UNKNOWN, error_code: ErrorCodeEnum.NAVIGATION_FAILED })));
      return;
    }

    const currentUrl = page.url();
    if (!currentUrl.startsWith(ORIGIN)) {
      console.log(JSON.stringify(sanitize({ state: StateEnum.ERROR, browser: BrowserEnum.RUNNING, site: SiteEnum.OTHER, auth: AuthEnum.UNKNOWN, error_code: ErrorCodeEnum.NAVIGATION_FAILED })));
      return;
    }

    await page.waitForTimeout(2000);

    let authStatus = AuthEnum.UNKNOWN;
    try {
      const loggedInSelectors = [
        '[data-testid="user-menu"]',
        '.user-profile',
        '#logout-button',
        'button:has-text("로그아웃")',
        'a:has-text("마이페이지")',
        '[class*="logged-in"]',
      ];
      for (const sel of loggedInSelectors) {
        const el = await page.$(sel);
        if (el) { authStatus = AuthEnum.LOGGED_IN; break; }
      }
      if (authStatus === AuthEnum.UNKNOWN) {
        const loggedOutSelectors = [
          'button:has-text("로그인")',
          'a:has-text("로그인")',
          '#login-button',
          '[data-testid="login-button"]',
        ];
        for (const sel of loggedOutSelectors) {
          const el = await page.$(sel);
          if (el) { authStatus = AuthEnum.LOGGED_OUT; break; }
        }
      }
    } catch {
      authStatus = AuthEnum.UNKNOWN;
    }

    const state = authStatus === AuthEnum.LOGGED_IN ? StateEnum.LOGGED_IN :
                  authStatus === AuthEnum.LOGGED_OUT ? StateEnum.LOGGED_OUT : StateEnum.OPEN;

    console.log(JSON.stringify(sanitize({
      state,
      browser: BrowserEnum.RUNNING,
      site: SiteEnum.SAMSUNGPOP,
      auth: authStatus,
      error_code: ErrorCodeEnum.NONE
    })));

    await new Promise(() => {});

  } catch (err) {
    const msg = err?.message || String(err);
    let error_code = ErrorCodeEnum.UNKNOWN;
    if (msg.includes('lock') || msg.includes('profile') || msg.includes('in use')) error_code = ErrorCodeEnum.PROFILE_LOCKED;
    else if (msg.includes('navigation') || msg.includes('timeout')) error_code = ErrorCodeEnum.NAVIGATION_FAILED;
    console.log(JSON.stringify(sanitize({ state: StateEnum.ERROR, browser: BrowserEnum.UNKNOWN, site: SiteEnum.UNKNOWN, auth: AuthEnum.UNKNOWN, error_code })));
    process.exitCode = 1;
  }
}

main();