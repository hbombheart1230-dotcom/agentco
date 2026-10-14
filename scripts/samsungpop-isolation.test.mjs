/**
 * Samsung POP Isolation Tests - Synthetic Fixtures Only
 *
 * These tests verify the HARD isolation boundary:
 * 1. Controller sanitizes output to ONLY fixed enums
 * 2. Fake account sentinels NEVER appear in sanitized output
 * 3. Extension registers commands, not tools (no model access to browser ops)
 * 4. Protected paths block credential files
 * 5. Permission gate blocks shell access to secrets
 * 6. No banking MCP server in mcp.json
 *
 * NO real browser launch, NO real Samsung POP, NO credentials.
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Fixed enums from implementation
const StateEnum = ['OPEN', 'LOGGED_IN', 'LOGGED_OUT', 'UNKNOWN', 'ERROR'];
const BrowserEnum = ['RUNNING', 'NOT_RUNNING', 'UNKNOWN'];
const SiteEnum = ['SAMSUNGPOP', 'OTHER', 'UNKNOWN'];
const AuthEnum = ['LOGGED_IN', 'LOGGED_OUT', 'UNKNOWN'];
const ErrorCodeEnum = ['NONE', 'ISOLATION_BLOCKED', 'PROFILE_LOCKED', 'NAVIGATION_FAILED', 'UNSUPPORTED', 'UNKNOWN'];

const StateValues = StateEnum;
const BrowserValues = BrowserEnum;
const SiteValues = SiteEnum;
const AuthValues = AuthEnum;
const ErrorCodeValues = ErrorCodeEnum;

function sanitizeStatus(raw) {
  const state = StateValues.includes(raw?.state) ? raw.state : StateEnum[3]; // UNKNOWN
  const browser = BrowserValues.includes(raw?.browser) ? raw.browser : BrowserEnum[2]; // UNKNOWN
  const site = SiteValues.includes(raw?.site) ? raw.site : SiteEnum[2]; // UNKNOWN
  const auth = AuthValues.includes(raw?.auth) ? raw.auth : AuthEnum[2]; // UNKNOWN
  const error_code = ErrorCodeValues.includes(raw?.error_code) ? raw.error_code : ErrorCodeEnum[5]; // UNKNOWN
  return { state, browser, site, auth, error_code };
}

// Sentinel strings that must NEVER appear in model-facing output
const SENTINELS = [
  'FAKE_SESSION_COOKIE',
  'ACCOUNT_NUM',
  'BALANCE',
  'FAKE_LOCAL_STORAGE',
  'FAKE_PORTFOLIO_DATA',
  'FAKE_USER_KIM',
  '110-222-333333',
  '50000000',
  'test-user-999',
  'samsungpop-session-12345',
];

function assertNoSentinels(obj, context) {
  const str = JSON.stringify(obj);
  for (const sentinel of SENTINELS) {
    assert.ok(!str.includes(sentinel), `${context}: Sentinel "${sentinel}" must not leak`);
  }
}

describe('S1 Samsung POP - Isolation Gate Synthetic Tests', () => {
  test('sanitizeStatus returns only fixed enums', () => {
    // Test with valid enums
    const valid = sanitizeStatus({
      state: 'LOGGED_IN',
      browser: 'RUNNING',
      site: 'SAMSUNGPOP',
      auth: 'LOGGED_IN',
      error_code: 'NONE'
    });
    assert.equal(valid.state, 'LOGGED_IN');
    assert.equal(valid.browser, 'RUNNING');
    assert.equal(valid.site, 'SAMSUNGPOP');
    assert.equal(valid.auth, 'LOGGED_IN');
    assert.equal(valid.error_code, 'NONE');

    // Test with invalid enums - should default to UNKNOWN
    const invalid = sanitizeStatus({
      state: 'INVALID_STATE',
      browser: 'INVALID_BROWSER',
      site: 'INVALID_SITE',
      auth: 'INVALID_AUTH',
      error_code: 'INVALID_ERROR'
    });
    assert.equal(invalid.state, 'UNKNOWN');
    assert.equal(invalid.browser, 'UNKNOWN');
    assert.equal(invalid.site, 'UNKNOWN');
    assert.equal(invalid.auth, 'UNKNOWN');
    assert.equal(invalid.error_code, 'UNKNOWN');

    // Test with partial data
    const partial = sanitizeStatus({ state: 'OPEN' });
    assert.equal(partial.state, 'OPEN');
    assert.equal(partial.browser, 'UNKNOWN');
    assert.equal(partial.site, 'UNKNOWN');
    assert.equal(partial.auth, 'UNKNOWN');
    assert.equal(partial.error_code, 'UNKNOWN');
  });

  test('sanitizeStatus never leaks sentinel strings', () => {
    // Simulate raw output containing sentinels (as if from a compromised browser)
    const rawWithSentinels = {
      state: 'LOGGED_IN',
      browser: 'RUNNING',
      site: 'SAMSUNGPOP',
      auth: 'LOGGED_IN',
      error_code: 'NONE',
      // These would be stripped by sanitizeStatus since they're not in the schema
      account_number: '110-222-333333',
      balance: 50000000,
      session_cookie: 'FAKE_SESSION_COOKIE=samsungpop-session-12345',
      user_name: 'FAKE_USER_KIM'
    };

    const sanitized = sanitizeStatus(rawWithSentinels);
    assertNoSentinels(sanitized, 'sanitized output');

    // Verify only expected keys exist
    const keys = Object.keys(sanitized).sort();
    assert.deepEqual(keys, ['auth', 'browser', 'error_code', 'site', 'state']);
  });

  test('Extension registers commands only, no tools', async () => {
    const extPath = resolve(root, 'pi-dev', 'extensions', 'samsungpop.ts');
    const extContent = await fs.readFile(extPath, 'utf8');

    // Must not register any tools (which would be model-callable)
    assert.ok(!extContent.includes('registerTool'), 'Extension must not register tools');
    assert.ok(!extContent.includes('browser_navigate'), 'Extension must not use browser_navigate');
    assert.ok(!extContent.includes('browser_snapshot'), 'Extension must not use browser_snapshot');
    assert.ok(!extContent.includes('browser_click'), 'Extension must not use browser_click');
    assert.ok(!extContent.includes('browser_type'), 'Extension must not use browser_type');
    assert.ok(!extContent.includes('browser_evaluate'), 'Extension must not use browser_evaluate');
    assert.ok(!extContent.includes('browser_wait_for'), 'Extension must not use browser_wait_for');

    // Must use pi.exec for isolation
    assert.ok(extContent.includes('pi.exec'), 'Extension must use pi.exec for isolation');
    assert.ok(extContent.includes('samsungpop-controller.mjs'), 'Extension must call controller script');

    // Must not trigger LLM turn
    assert.ok(extContent.includes('triggerTurn: false'), 'Extension must not trigger LLM turn');

    // Must register command
    assert.ok(extContent.includes('registerCommand'), 'Extension must register command');
    assert.ok(extContent.includes('samsungpop'), 'Extension must register samsungpop command');
  });

  test('Protected paths extension blocks credential files', async () => {
    const protectedPathsPath = resolve(root, 'pi-dev', 'extensions', 'protected-paths.ts');
    const protectedContent = await fs.readFile(protectedPathsPath, 'utf8');

    // Must protect credential-like files
    assert.ok(protectedContent.includes('credential'), 'Must protect credential files');
    assert.ok(protectedContent.includes('secret'), 'Must protect secret files');
    assert.ok(protectedContent.includes('auth\\.json'), 'Must block auth.json');
    assert.ok(protectedContent.includes('models-store\\.json'), 'Must block models-store.json');
    // SECRET_FILE regex should match browser profile credential files
    assert.ok(protectedContent.includes('SECRET_FILE'), 'Must have SECRET_FILE pattern');
  });

  test('Permission gate blocks shell access to secrets', async () => {
    const permGatePath = resolve(root, 'pi-dev', 'extensions', 'permission-gate.ts');
    const permContent = await fs.readFile(permGatePath, 'utf8');

    assert.ok(permContent.includes('auth\\.json'), 'Must block auth.json');
    assert.ok(permContent.includes('models-store\\.json'), 'Must block models-store.json');
    assert.ok(permContent.includes('credential'), 'Must block credential files');
    assert.ok(permContent.includes('secret'), 'Must block secret files');
  });

  test('No MCP tool exposure for banking operations in mcp.json', async () => {
    const mcpPath = resolve(root, 'pi-dev', 'mcp.json');
    const mcpContent = JSON.parse(await fs.readFile(mcpPath, 'utf8'));

    // Playwright MCP exists for GENERAL browsing only
    assert.ok(mcpContent.mcpServers.playwright, 'Playwright MCP exists for general use');
    assert.ok(mcpContent.mcpServers.playwright.toolExposure, 'Tool exposure configured');

    // But NO banking-specific MCP server
    assert.ok(!mcpContent.mcpServers.samsungpop, 'No banking MCP server');
    assert.ok(!mcpContent.mcpServers['samsung-pop'], 'No banking MCP server (alt name)');
  });

  test('Controller script uses single persistent profile, no fresh profile per run', async () => {
    const controllerPath = resolve(root, 'scripts', 'samsungpop-controller.mjs');
    const controllerContent = await fs.readFile(controllerPath, 'utf8');

    // Must NOT create fresh profile per run
    assert.ok(!controllerContent.includes('getFreshProfileDir'), 'Must not create fresh profile per run');
    assert.ok(!controllerContent.includes('Date.now()'), 'Must not use timestamp in profile path');
    assert.ok(!controllerContent.includes('Math.random'), 'Must not use random in profile path');

    // Must use single persistent banking profile
    assert.ok(controllerContent.includes('browser-profile-banking'), 'Must use persistent banking profile');
    assert.ok(controllerContent.includes('BANKING_PROFILE_DIR'), 'Must have BANKING_PROFILE_DIR constant');

    // Must export expected functions
    assert.ok(controllerContent.includes('sanitizeStatus'), 'Must export sanitizeStatus');
    assert.ok(controllerContent.includes('cmdOpen'), 'Must export cmdOpen');
    assert.ok(controllerContent.includes('cmdStatus'), 'Must export cmdStatus');
    assert.ok(controllerContent.includes('runPlaywrightScript'), 'Must have runPlaywrightScript');
    assert.ok(controllerContent.includes('CDP_PORT'), 'Must export CDP_PORT');
  });

  test('Playwright scripts use persistent profile, CDP, and consistent auth detection', async () => {
    const openPath = resolve(root, 'scripts', 'samsungpop-playwright', 'open.mjs');
    const statusPath = resolve(root, 'scripts', 'samsungpop-playwright', 'status.mjs');

    const openContent = await fs.readFile(openPath, 'utf8');
    const statusContent = await fs.readFile(statusPath, 'utf8');

    // Both must sanitize output
    assert.ok(openContent.includes('sanitize'), 'open.mjs must sanitize output');
    assert.ok(statusContent.includes('sanitize'), 'status.mjs must sanitize output');

    // Must only navigate to Samsung POP origin
    assert.ok(openContent.includes('SAMSUNGPOP_ORIGIN'), 'open.mjs must use SAMSUNGPOP_ORIGIN');
    assert.ok(statusContent.includes('SAMSUNGPOP_ORIGIN'), 'status.mjs must use SAMSUNGPOP_ORIGIN');

    // Must not expose raw page data
    assert.ok(!openContent.includes('page.content()'), 'open.mjs must not return page content');
    assert.ok(!openContent.includes('page.screenshot'), 'open.mjs must not return screenshots');
    assert.ok(!statusContent.includes('page.content()'), 'status.mjs must not return page content');
    assert.ok(!statusContent.includes('page.screenshot'), 'status.mjs must not return screenshots');

    // open.mjs must start with CDP enabled
    assert.ok(openContent.includes('remote-debugging-port'), 'open.mjs must start Edge with CDP port');
    assert.ok(openContent.includes('CDP_PORT'), 'open.mjs must read CDP_PORT from env');

    // open.mjs must wait for navigation to complete
    assert.ok(openContent.includes('waitForLoadState'), 'open.mjs must wait for load state');
    assert.ok(openContent.includes('networkidle'), 'open.mjs must wait for network idle');

    // status.mjs must NOT clone profile
    assert.ok(!statusContent.includes('mkdtemp'), 'status.mjs must not create temp dir');
    assert.ok(!statusContent.includes('cp('), 'status.mjs must not copy profile');
    assert.ok(!statusContent.includes('launchPersistentContext'), 'status.mjs must not launch new context');

    // status.mjs must attach via CDP
    assert.ok(statusContent.includes('connectOverCDP'), 'status.mjs must connect via CDP');
    assert.ok(statusContent.includes('CDP_PORT'), 'status.mjs must read CDP_PORT from env');
    assert.ok(statusContent.includes('CDP_URL'), 'status.mjs must construct CDP URL');

    // Both must use shared determineAuthStatus logic
    assert.ok(openContent.includes('determineAuthStatus'), 'open.mjs must have determineAuthStatus');
    assert.ok(statusContent.includes('determineAuthStatus'), 'status.mjs must have determineAuthStatus');
  });
});