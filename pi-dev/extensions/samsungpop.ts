/**
 * Samsung POP Extension - Isolated Browser Commands
 *
 * Registers `/samsungpop open` and `/samsungpop status` commands.
 * These commands invoke the standalone controller script via pi.exec(),
 * keeping ALL browser automation OUTSIDE the model-visible tool surface.
 *
 * The model NEVER sees: browser tools, page content, URLs, snapshots, storage.
 * Only fixed enum status is returned via sendMessage(triggerTurn: false).
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', '..');

const StateEnum = ['OPEN', 'LOGGED_IN', 'LOGGED_OUT', 'UNKNOWN', 'ERROR'] as const;
const BrowserEnum = ['RUNNING', 'NOT_RUNNING', 'UNKNOWN'] as const;
const SiteEnum = ['SAMSUNGPOP', 'OTHER', 'UNKNOWN'] as const;
const AuthEnum = ['LOGGED_IN', 'LOGGED_OUT', 'UNKNOWN'] as const;
const ErrorCodeEnum = ['NONE', 'ISOLATION_BLOCKED', 'PROFILE_LOCKED', 'NAVIGATION_FAILED', 'UNSUPPORTED', 'UNKNOWN'] as const;

const StatusSchema = Type.Object({
  state: Type.Union(StateEnum.map(e => Type.Literal(e))),
  browser: Type.Union(BrowserEnum.map(e => Type.Literal(e))),
  site: Type.Union(SiteEnum.map(e => Type.Literal(e))),
  auth: Type.Union(AuthEnum.map(e => Type.Literal(e))),
  error_code: Type.Union(ErrorCodeEnum.map(e => Type.Literal(e))),
}, { additionalProperties: false });

type Status = {
  state: typeof StateEnum[number];
  browser: typeof BrowserEnum[number];
  site: typeof SiteEnum[number];
  auth: typeof AuthEnum[number];
  error_code: typeof ErrorCodeEnum[number];
};

/** Sanitize - only allow fixed enum values */
function sanitizeStatus(raw: any): Status {
  const state = StateEnum.includes(raw?.state) ? raw.state : 'UNKNOWN';
  const browser = BrowserEnum.includes(raw?.browser) ? raw.browser : 'UNKNOWN';
  const site = SiteEnum.includes(raw?.site) ? raw.site : 'UNKNOWN';
  const auth = AuthEnum.includes(raw?.auth) ? raw.auth : 'UNKNOWN';
  const error_code = ErrorCodeEnum.includes(raw?.error_code) ? raw.error_code : 'UNKNOWN';
  return { state, browser, site, auth, error_code };
}

/** Format status for user display */
function formatStatus(status: Status): string {
  const icons = {
    state: { OPEN: '🌐', LOGGED_IN: '✅', LOGGED_OUT: '🚪', UNKNOWN: '❓', ERROR: '❌' },
    browser: { RUNNING: '🟢', NOT_RUNNING: '🔴', UNKNOWN: '⚪' },
    auth: { LOGGED_IN: '🔓', LOGGED_OUT: '🔒', UNKNOWN: '❓' },
  };
  return `Samsung POP Status:
  State:     ${icons.state[status.state]} ${status.state}
  Browser:   ${icons.browser[status.browser]} ${status.browser}
  Site:      ${status.site}
  Auth:      ${icons.auth[status.auth]} ${status.auth}
  Error:     ${status.error_code}`;
}

export default function (pi: ExtensionAPI) {
  const controllerPath = resolve(root, 'scripts', 'samsungpop-controller.mjs');

  /** Execute controller command and return sanitized status */
  async function runController(subcommand: 'open' | 'status'): Promise<Status> {
    const result = await pi.exec(process.execPath, [controllerPath, subcommand], {
      cwd: root,
      timeout: 60000,
    });
    if (result.code !== 0) {
      return sanitizeStatus({ error_code: 'NAVIGATION_FAILED' });
    }
    try {
      return sanitizeStatus(JSON.parse(result.stdout.trim()));
    } catch {
      return sanitizeStatus({ error_code: 'UNKNOWN' });
    }
  }

  /** /samsungpop open - Launch Edge with banking profile, open Samsung POP */
  pi.registerCommand('samsungpop', {
    description: 'open | status — Samsung POP local browser (isolated, no model access)',
    handler: async (args, ctx) => {
      const parts = args.trim().split(/\s+/);
      const sub = parts[0]?.toLowerCase();

      let status: Status;
      if (sub === 'open') {
        status = await runController('open');
        // Send result without triggering LLM turn
        pi.sendMessage({
          customType: 'samsungpop-status',
          content: formatStatus(status),
          display: true,
          details: status,
        }, { triggerTurn: false });
      } else if (sub === 'status') {
        status = await runController('status');
        pi.sendMessage({
          customType: 'samsungpop-status',
          content: formatStatus(status),
          display: true,
          details: status,
        }, { triggerTurn: false });
      } else {
        const usage = `Usage: /samsungpop open | status
  open   — Launch Edge with isolated banking profile, open https://www.samsungpop.com/
  status — Check browser/login status without navigation
  
  Both commands return ONLY fixed enums. No page content ever reaches the model.`;
        pi.sendMessage({
          customType: 'samsungpop-status',
          content: usage,
          display: true,
          details: { error_code: 'UNSUPPORTED' },
        }, { triggerTurn: false });
      }
    },
  });
}