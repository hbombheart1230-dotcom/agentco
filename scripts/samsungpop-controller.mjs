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
 * Edge is launched with CDP (--remote-debugging-port=9222) for status attachment.
 */

import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const SAMSUNGPOP_ORIGIN = 'https://www.samsungpop.com/';
const BANKING_PROFILE_DIR = resolve(process.env.USERPROFILE || process.env.HOME || '', '.agentco', 'browser-profile-banking');
const BANKING_OUTPUT_DIR = resolve(process.env.USERPROFILE || process.env.HOME || '', '.agentco', 'browser-output-banking');
const CDP_PORT = 9222;

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

function sanitizeStatus(raw) {
  const state = StateValues.includes(raw?.state) ? raw.state : StateEnum.UNKNOWN;
  const browser = BrowserValues.includes(raw?.browser) ? raw.browser : BrowserEnum.UNKNOWN;
  const site = SiteValues.includes(raw?.site) ? raw.site : SiteEnum.UNKNOWN;
  const auth = AuthValues.includes(raw?.auth) ? raw.auth : AuthEnum.UNKNOWN;
  const error_code = ErrorCodeValues.includes(raw?.error_code) ? raw.error_code : ErrorCodeEnum.UNKNOWN;
  return { state, browser, site, auth, error_code };
}

async function runPlaywrightScript(scriptName, args = [], options = {}) {
  const { waitForExit = true, timeoutMs = 60000 } = options;

  const scriptPath = resolve(__dirname, 'samsungpop-playwright', `${scriptName}.mjs`);

  return new Promise((resolvePromise) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      resolvePromise(sanitizeStatus({ error_code: ErrorCodeEnum.NAVIGATION_FAILED }));
    }, timeoutMs);

    const child = spawn(process.execPath, [scriptPath, ...args], {
      cwd: root,
      env: {
        ...process.env,
        BANKING_PROFILE_DIR,
        BANKING_OUTPUT_DIR,
        SAMSUNGPOP_ORIGIN,
        CDP_PORT: String(CDP_PORT),
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
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      signal: controller.signal,
    });

    let stdout = '';
    let stderr = '';
    let resolved = false;

    child.stdout?.on('data', (d) => {
      stdout += d.toString();
      // For open command, try to parse JSON as soon as it's available
      if (!waitForExit && !resolved) {
        const lines = stdout.trim().split('\n');
        for (const line of lines) {
          if (line.startsWith('{')) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.state && parsed.browser && parsed.site && parsed.auth && parsed.error_code) {
                resolved = true;
                clearTimeout(timer);
                // Don't kill the child - let browser keep running
                resolvePromise(sanitizeStatus(parsed));
                return;
              }
            } catch {}
          }
        }
      }
    });
    child.stderr?.on('data', (d) => { stderr += d.toString(); });

    child.on('error', (err) => {
      if (!resolved) {
        clearTimeout(timer);
        resolvePromise(sanitizeStatus({ error_code: ErrorCodeEnum.NAVIGATION_FAILED }));
      }
    });

    child.on('close', (code) => {
      if (resolved) return;
      clearTimeout(timer);
      try {
        const parsed = JSON.parse(stdout.trim());
        resolvePromise(sanitizeStatus(parsed));
      } catch {
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
  return runPlaywrightScript('status');
}

async function main() {
  const command = process.argv[2];
  let result;
  if (command === 'open') result = await cmdOpen();
  else if (command === 'status') result = await cmdStatus();
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

export { cmdOpen, cmdStatus, sanitizeStatus, StateEnum, BrowserEnum, SiteEnum, AuthEnum, ErrorCodeEnum, BANKING_PROFILE_DIR, CDP_PORT };