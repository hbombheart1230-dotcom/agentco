/**
 * Samsung POP Extension - Isolated Browser Commands
 *
 * Registers `/samsungpop open`, `/samsungpop status`, and `/samsungpop collect` commands.
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
const CollectCodeEnum = ['SAVED', 'PARTIAL', 'LOGIN_REQUIRED', 'NOT_ON_BALANCE_PAGE', 'SCHEMA_CHANGED', 'BROWSER_UNAVAILABLE', 'ERROR'] as const;

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

const CollectSchema = Type.Object({
  state: Type.Union(StateEnum.map(e => Type.Literal(e))),
  browser: Type.Union(BrowserEnum.map(e => Type.Literal(e))),
  site: Type.Union(SiteEnum.map(e => Type.Literal(e))),
  auth: Type.Union(AuthEnum.map(e => Type.Literal(e))),
  collect_code: Type.Union(CollectCodeEnum.map(e => Type.Literal(e))),
  saved_path: Type.Optional(Type.String()),
  totals_count: Type.Optional(Type.Number()),
  positions_count: Type.Optional(Type.Number()),
}, { additionalProperties: false });

type CollectStatus = {
  state: typeof StateEnum[number];
  browser: typeof BrowserEnum[number];
  site: typeof SiteEnum[number];
  auth: typeof AuthEnum[number];
  collect_code: typeof CollectCodeEnum[number];
  saved_path?: string;
  totals_count?: number;
  positions_count?: number;
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

function sanitizeCollect(raw: any): CollectStatus {
  const state = StateEnum.includes(raw?.state) ? raw.state : 'UNKNOWN';
  const browser = BrowserEnum.includes(raw?.browser) ? raw.browser : 'UNKNOWN';
  const site = SiteEnum.includes(raw?.site) ? raw.site : 'UNKNOWN';
  const auth = AuthEnum.includes(raw?.auth) ? raw.auth : 'UNKNOWN';
  const collect_code = CollectCodeEnum.includes(raw?.collect_code) ? raw.collect_code : 'ERROR';
  return { 
    state, browser, site, auth, collect_code,
    saved_path: raw?.saved_path,
    totals_count: raw?.totals_count,
    positions_count: raw?.positions_count
  };
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

/** Format collect result for user display - NO raw financial values */
function formatCollectResult(status: CollectStatus): string {
  const icons = {
    SAVED: '✅',
    PARTIAL: '⚠️',
    LOGIN_REQUIRED: '🔒',
    NOT_ON_BALANCE_PAGE: '📄',
    SCHEMA_CHANGED: '🔄',
    BROWSER_UNAVAILABLE: '🔴',
    ERROR: '❌'
  };
  const icon = icons[status.collect_code as keyof typeof icons] || '❓';
  
  let msg = `Samsung POP Collect: ${icon} ${status.collect_code}`;
  if (status.saved_path) {
    msg += `\n  Saved: ${status.saved_path}`;
  }
  if (status.totals_count !== undefined) {
    msg += `\n  Totals fields: ${status.totals_count}`;
  }
  if (status.positions_count !== undefined) {
    msg += `\n  Holdings: ${status.positions_count}`;
  }
  return msg;
}

export default function (pi: ExtensionAPI) {
  const controllerPath = resolve(root, 'scripts', 'samsungpop-controller.mjs');

  /** Execute controller command and return sanitized status */
  async function runController(subcommand: 'open' | 'status' | 'collect'): Promise<Status | CollectStatus> {
    const result = await pi.exec(process.execPath, [controllerPath, subcommand], {
      cwd: root,
      timeout: 60000,
    });
    if (result.code !== 0) {
      return sanitizeStatus({ error_code: 'NAVIGATION_FAILED' });
    }
    try {
      const parsed = JSON.parse(result.stdout.trim());
      if (parsed.collect_code) {
        return sanitizeCollect(parsed);
      }
      return sanitizeStatus(parsed);
    } catch {
      return sanitizeStatus({ error_code: 'UNKNOWN' });
    }
  }

  /** /samsungpop open - Launch Edge with banking profile, open Samsung POP */
  pi.registerCommand('samsungpop', {
    description: 'open | status | collect — Samsung POP local browser (isolated, no model access)',
    handler: async (args, ctx) => {
      const parts = args.trim().split(/\s+/);
      const sub = parts[0]?.toLowerCase();

      let status: Status | CollectStatus;
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
      } else if (sub === 'collect') {
        status = await runController('collect');
        pi.sendMessage({
          customType: 'samsungpop-collect',
          content: formatCollectResult(status),
          display: true,
          details: status,
        }, { triggerTurn: false });
      } else {
        const usage = `Usage: /samsungpop open | status | collect
  open    — Launch Edge with isolated banking profile, open https://www.samsungpop.com/
  status  — Check browser/login status without navigation
  collect — Extract balance/holdings from visible page, save JSON snapshot
  \n  All commands return ONLY fixed enums/metadata. No page content or raw values reach the model.`;
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