/**
 * Samsung POP Browser Controller - Isolated from Model-Visible Tools
 *
 * This script runs OUTSIDE the MCP/codemode tool surface.
 * It is invoked ONLY by the Pi extension command handler via pi.exec().
 * The model NEVER sees this script, its tools, or its output directly.
 *
 * Returns ONLY fixed enums - no raw page content, URLs, snapshots, or storage.
 *
 * Uses a SINGLE persistent banking profile at ~/.agentco/browser-profile-banking
 * Each open generates a random CDP port for session ownership verification.
 * Status attaches ONLY to the controller-owned CDP endpoint via port file.
 *
 * IMPORTANT: CDP port + session token in file is NOT proof of actual Edge process ownership.
 * The token is controller-written and controller-read; status attaches to whatever
 * process listens on that port. No PID/launch-identity verification is performed.
 * For S1 manual-login flow, auth=UNKNOWN is returned conservatively.
 */

import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const SAMSUNGPOP_ORIGIN = 'https://www.samsungpop.com/';
const DEFAULT_BANKING_PROFILE_DIR = resolve(process.env.USERPROFILE || process.env.HOME || '', '.agentco', 'browser-profile-banking');
const DEFAULT_BANKING_OUTPUT_DIR = resolve(process.env.USERPROFILE || process.env.HOME || '', '.agentco', 'browser-output-banking');

// Backward-compat constant for tests that check exported BANKING_PROFILE_DIR
const BANKING_PROFILE_DIR = resolve(process.env.BANKING_PROFILE_DIR || DEFAULT_BANKING_PROFILE_DIR);
const BANKING_OUTPUT_DIR = resolve(process.env.BANKING_OUTPUT_DIR || DEFAULT_BANKING_OUTPUT_DIR);
const CDP_PORT_FILE = resolve(BANKING_PROFILE_DIR, 'cdp-port');
const CDP_SESSION_FILE = resolve(BANKING_PROFILE_DIR, 'cdp-session');

function getBankingProfileDir() {
  return resolve(process.env.BANKING_PROFILE_DIR || DEFAULT_BANKING_PROFILE_DIR);
}
function getBankingOutputDir() {
  return resolve(process.env.BANKING_OUTPUT_DIR || DEFAULT_BANKING_OUTPUT_DIR);
}
function getCdpPortFile() {
  return resolve(getBankingProfileDir(), 'cdp-port');
}
function getCdpSessionFile() {
  return resolve(getBankingProfileDir(), 'cdp-session');
}

function generateCdpPort() {
  // Use a random port in the dynamic range (49152-65535)
  return 49152 + (randomBytes(2).readUInt16BE(0) % 16384);
}

function generateSessionToken() {
  return randomBytes(16).toString('hex');
}

function writeCdpSession(port, token) {
  writeFileSync(getCdpSessionFile(), JSON.stringify({ port, token }), { mode: 0o600 });
}

function readCdpSession() {
  const sessionFile = getCdpSessionFile();
  if (!existsSync(sessionFile)) return null;
  try {
    const content = readFileSync(sessionFile, 'utf8').trim();
    const data = JSON.parse(content);
    if (data && Number.isInteger(data.port) && data.port > 1024 && data.port < 65535 && typeof data.token === 'string') {
      return data;
    }
  } catch {}
  return null;
}

function clearCdpSession() {
  try { unlinkSync(getCdpSessionFile()); } catch {}
}

const StateEnum = { OPEN: 'OPEN', LOGGED_IN: 'LOGGED_IN', LOGGED_OUT: 'LOGGED_OUT', UNKNOWN: 'UNKNOWN', ERROR: 'ERROR' };
const BrowserEnum = { RUNNING: 'RUNNING', NOT_RUNNING: 'NOT_RUNNING', UNKNOWN: 'UNKNOWN' };
const SiteEnum = { SAMSUNGPOP: 'SAMSUNGPOP', OTHER: 'OTHER', UNKNOWN: 'UNKNOWN' };
const AuthEnum = { LOGGED_IN: 'LOGGED_IN', LOGGED_OUT: 'LOGGED_OUT', UNKNOWN: 'UNKNOWN' };
const ErrorCodeEnum = { NONE: 'NONE', ISOLATION_BLOCKED: 'ISOLATION_BLOCKED', PROFILE_LOCKED: 'PROFILE_LOCKED', NAVIGATION_FAILED: 'NAVIGATION_FAILED', UNSUPPORTED: 'UNSUPPORTED', UNKNOWN: 'UNKNOWN' };
// S2 collect-specific codes
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
const ErrorCodeValues = Object.values(ErrorCodeEnum);
const CollectCodeValues = Object.values(CollectCodeEnum);

function sanitizeStatus(raw) {
  const state = StateValues.includes(raw?.state) ? raw.state : StateEnum.UNKNOWN;
  const browser = BrowserValues.includes(raw?.browser) ? raw.browser : BrowserEnum.UNKNOWN;
  const site = SiteValues.includes(raw?.site) ? raw.site : SiteEnum.UNKNOWN;
  const auth = AuthValues.includes(raw?.auth) ? raw.auth : AuthEnum.UNKNOWN;
  const error_code = ErrorCodeValues.includes(raw?.error_code) ? raw.error_code : ErrorCodeEnum.UNKNOWN;
  return { state, browser, site, auth, error_code };
}

function sanitizeCollect(raw) {
  const state = StateValues.includes(raw?.state) ? raw.state : StateEnum.UNKNOWN;
  const browser = BrowserValues.includes(raw?.browser) ? raw.browser : BrowserEnum.UNKNOWN;
  const site = SiteValues.includes(raw?.site) ? raw.site : SiteEnum.UNKNOWN;
  const auth = AuthValues.includes(raw?.auth) ? raw.auth : AuthEnum.UNKNOWN;
  const collect_code = CollectCodeValues.includes(raw?.collect_code) ? raw.collect_code : CollectCodeEnum.ERROR;
  return { state, browser, site, auth, collect_code };
}

function writeCdpPort(port) {
  writeFileSync(getCdpPortFile(), String(port), { mode: 0o600 });
}

function readCdpPort() {
  const portFile = getCdpPortFile();
  if (!existsSync(portFile)) return null;
  const content = readFileSync(portFile, 'utf8').trim();
  const port = parseInt(content, 10);
  return Number.isInteger(port) && port > 1024 && port < 65535 ? port : null;
}

function clearCdpPort() {
  try { unlinkSync(getCdpPortFile()); } catch {}
}

async function runPlaywrightScript(scriptName, args = [], options = {}) {
  const { waitForExit = true, timeoutMs = 60000 } = options;

  const scriptPath = resolve(__dirname, 'samsungpop-playwright', `${scriptName}.mjs`);
  let cdpPort;
  let sessionToken;
  if (scriptName === 'open') {
    // Ensure profile directory exists before writing session files
    try {
      const { mkdirSync } = await import('node:fs');
      mkdirSync(getBankingProfileDir(), { recursive: true });
    } catch {}

    // Check for existing valid session (duplicate open handling)
    const existingSession = readCdpSession();
    if (existingSession) {
      // Verify the existing session is still alive
      try {
        const { chromium } = await import('playwright');
        const browser = await chromium.connectOverCDP(`http://localhost:${existingSession.port}`, { timeout: 2000 });
        await browser.close();
        // Session is valid - reuse it, return success without spawning new Edge
        return sanitizeStatus({
          state: StateEnum.OPEN,
          browser: BrowserEnum.RUNNING,
          site: SiteEnum.SAMSUNGPOP,
          auth: AuthEnum.UNKNOWN,
          error_code: ErrorCodeEnum.NONE
        });
      } catch {
        // Stale session - generate new one
        cdpPort = generateCdpPort();
        sessionToken = generateSessionToken();
        writeCdpPort(cdpPort);
        writeCdpSession(cdpPort, sessionToken);
      }
    } else {
      cdpPort = generateCdpPort();
      sessionToken = generateSessionToken();
      writeCdpPort(cdpPort);
      writeCdpSession(cdpPort, sessionToken);
    }
  } else if (scriptName === 'status' || scriptName === 'collect') {
    const session = readCdpSession();
    if (!session) {
      return sanitizeStatus({ error_code: ErrorCodeEnum.NAVIGATION_FAILED });
    }
    cdpPort = session.port;
    sessionToken = session.token;
  } else {
    cdpPort = generateCdpPort();
    sessionToken = generateSessionToken();
    writeCdpPort(cdpPort);
    writeCdpSession(cdpPort, sessionToken);
  }

  return new Promise((resolvePromise) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      // Do NOT clear port/session on timeout for open - it persists for session ownership
      if (waitForExit) {
        clearCdpPort();
        clearCdpSession();
      }
      resolvePromise(sanitizeStatus({ error_code: ErrorCodeEnum.NAVIGATION_FAILED }));
    }, timeoutMs);

    const child = spawn(process.execPath, [scriptPath, ...args], {
      cwd: root,
      env: {
        ...process.env,
        BANKING_PROFILE_DIR: getBankingProfileDir(),
        BANKING_OUTPUT_DIR: getBankingOutputDir(),
        SAMSUNGPOP_ORIGIN,
        CDP_PORT: String(cdpPort),
        CDP_PORT_FILE: getCdpPortFile(),
        CDP_SESSION_FILE: getCdpSessionFile(),
        CDP_SESSION_TOKEN: sessionToken,
        SYSTEMROOT: process.env.SYSTEMROOT,
        WINDIR: process.env.WINDIR,
        COMSPEC: process.env.COMSPEC,
        PATH: process.env.PATH,
        PATHEXT: process.env.PATHEXT,
        TEMP: process.env.TEMP,
        TMP: process.env.TMP,
        LOCALAPPDATA: process.env.LOCALAPPDATA,
        APPDATA: process.env.APPDATA,
        PROGRAMDATA: process.env.PROGRAMDATA,
        'PROGRAMFILES': process.env['PROGRAMFILES'],
        'PROGRAMFILES(X86)': process.env['PROGRAMFILES(X86)'],
      },
      stdio: ['ignore', 'pipe', 'ignore'], // stderr discarded (no sensitive logs)
      windowsHide: true,
      signal: controller.signal,
    });

    let stdout = '';
    let resolved = false;

    child.stdout?.on('data', (d) => {
      stdout += d.toString();
      if (!resolved) {
        const lines = stdout.trim().split('\n');
        for (const line of lines) {
          if (line.startsWith('{')) {
            try {
              const parsed = JSON.parse(line);
              // Accept both status format and collect format
              if (parsed.state && parsed.browser && parsed.site && parsed.auth && (parsed.error_code || parsed.collect_code)) {
                resolved = true;
                clearTimeout(timer);
                // For open: don't clear CDP port/session - status needs it
                // For status/collect: do NOT clear on success - preserve for open->status->status
                // Only clear on error/stale session (handled in child.on close/error)
                if (parsed.collect_code) {
                  resolvePromise(sanitizeCollect(parsed));
                } else {
                  resolvePromise(sanitizeStatus(parsed));
                }
                return;
              }
            } catch {}
          }
        }
      }
    });

    child.on('error', (err) => {
      if (!resolved) {
        clearTimeout(timer);
        if (waitForExit) {
          clearCdpPort();
          clearCdpSession();
        }
        resolvePromise(sanitizeStatus({ error_code: ErrorCodeEnum.NAVIGATION_FAILED }));
      }
    });

    child.on('close', (code) => {
      if (resolved) return;
      clearTimeout(timer);
      try {
        const parsed = JSON.parse(stdout.trim());
        if (waitForExit) {
          clearCdpPort();
          clearCdpSession();
        }
        if (parsed.collect_code) {
          resolvePromise(sanitizeCollect(parsed));
        } else {
          resolvePromise(sanitizeStatus(parsed));
        }
      } catch {
        if (waitForExit) {
          clearCdpPort();
          clearCdpSession();
        }
        if (code !== 0) {
          resolvePromise(sanitizeStatus({ error_code: ErrorCodeEnum.NAVIGATION_FAILED }));
        } else {
          resolvePromise(sanitizeStatus({ error_code: ErrorCodeEnum.UNKNOWN }));
        }
      }
    });
  });
}

async function cmdOpen() {
  return runPlaywrightScript('open', [], { waitForExit: false });
}

async function cmdStatus() {
  return runPlaywrightScript('status', [], { waitForExit: false });
}

async function cmdCollect() {
  return runPlaywrightScript('collect', [], { waitForExit: false });
}

async function main() {
  const command = process.argv[2];
  let result;
  if (command === 'open') result = await cmdOpen();
  else if (command === 'status') result = await cmdStatus();
  else if (command === 'collect') result = await cmdCollect();
  else {
    result = sanitizeStatus({ error_code: ErrorCodeEnum.UNSUPPORTED });
  }
  console.log(JSON.stringify(result));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(() => {
    console.log(JSON.stringify(sanitizeStatus({ error_code: ErrorCodeEnum.UNKNOWN })));
    process.exitCode = 1;
  });
}

export { cmdOpen, cmdStatus, cmdCollect, sanitizeStatus, sanitizeCollect, StateEnum, BrowserEnum, SiteEnum, AuthEnum, ErrorCodeEnum, CollectCodeEnum, BANKING_PROFILE_DIR, BANKING_OUTPUT_DIR, CDP_PORT_FILE, CDP_SESSION_FILE, generateCdpPort, generateSessionToken, readCdpPort, writeCdpPort, clearCdpPort, readCdpSession, writeCdpSession, clearCdpSession, getBankingProfileDir, getBankingOutputDir, getCdpPortFile, getCdpSessionFile };