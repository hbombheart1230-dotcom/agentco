# P5.5 — Samsung POP Persistent Browser: local-only, read-only status

Status: **TASK SPEC / IMPLEMENTATION NOT STARTED** (2026-10-13)
Base: `main` = `cc6078fed3e1d9b4c0103a8de8d9c0a18ac1f37e`
Implementation branch: `feature/p5-5-samsungpop-readonly-browser`

## Objective and acceptance boundary

Reuse the personal Agentco M1/M2 browser implementation and/or official installed Playwright MCP with its **existing** persistent Edge profile. Implement only this **user-initiated local workflow**:

1. Start or attach to existing Agentco browser safely.
2. Navigate to `https://www.samsungpop.com/`.
3. User performs login manually (never automate credentials).
4. Determine browser/site/login state inside local isolated code.
5. Return ONLY fixed, sanitized enums to Pi; no bank-page content to a model.

No general browser Worker delegation, account extraction or autonomous trading. A model-visible bank session with raw browser-page tools enabled is unacceptable.

## Confirmed GitHub baseline; do not re-research P3–P5.4

- `pi-dev/mcp.json`: `@playwright/mcp@0.0.83`, Edge (`msedge`), persistent profile `~/.agentco/browser-profile`, output `~/.agentco/browser-output`, `exposure: codemode`, and DIRECT `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type`, `browser_evaluate`, `browser_wait_for`.
- `pi-dev/settings.json` lists general extensions and harness-delegation, not a separately named persistent-browser extension. Prior local M1/M2 work **may not be on main**.
- `scripts/pi.mjs` is a thin Pi launcher. Existing `permission-gate.ts` and `protected-paths.ts` are **not verified bank-page isolation mechanisms**.
- General Worker readiness = NO. Existing `/harness` routes support synthetic `add42` only. Leave unchanged.

## Phase A — local inventory, required before implementation

In canonical `C:\Agentco`:

- Inspect Git HEAD/branch and staged, tracked, untracked changes before switching branches; inspect stash *metadata only*. Preserve all existing work. Do not blindly checkout/reset/pull/stash.
- Locate actual tracked/local/ignored M1 runtime, M2 extension and startup entrypoints; determine whether implementation is in another local branch, another ignored installation, or absent. Inspect only relevant source and path metadata; do not reload historical phase documentation.
- Verify **existence only** of Edge runtime/profile/output locations. Do not open, print, hash, copy, back up, move, delete, archive, or upload contents of browser profiles, cookies, session stores, credentials, screenshots, traces, browser output, or account data.
- Inspect process/attach safety (avoid second Edge instance with a locked persistent profile). Leave OS/Edge loopback permissions unchanged.
- Determine whether bank page actions and local DOM predicates can occur **outside any model-visible browser tool/session/log**, while blocking direct MCP generic browser tools and other unrestricted model-origin tools from the active banking context.

Return short sanitized inventory: `M1_PATH`, `M2_PATH` (repository-relative source locations, or LOCAL_ONLY / NOT_FOUND), `PROFILE_EXISTS` yes/no/unknown, `RUNTIME`, `CAN_ISOLATE`.

**Stop gate:** If it is not possible to establish a real model-isolated bank workflow, report `BLOCKED / NO BANK SITE TEST` plus the least invasive remediation proposal. Do not run a bank browser tool merely to explore.

## Phase B — minimal implementation, only after safety gate

Reuse installed official or previous M1/M2 implementation first. Add the thinnest locally executed, **human-invoked** surface (prefer native Pi commands such as `/samsungpop open` and `/samsungpop status` if enforceable); a tiny local helper is acceptable, but not a new generic browser system/Skill adapter/orchestrator.

- Website navigation and state checks happen locally without any model-mediated browser tool. The only model/Pi-visible payload is a fixed allowlist like:
  `{"browser":"RUNNING|NOT_RUNNING|UNKNOWN","site":"SAMSUNGPOP|OTHER|UNKNOWN","auth":"LOGGED_IN|LOGGED_OUT|UNKNOWN"}`
- Messages, event details, stdout/stderr, exceptions, diagnostics, tests and logs may contain only the above enums or fixed safe error codes. Do not echo actual URLs with path/query/fragment, page DOM/text/title, screenshots, network data, cookies/tokens/storage or any account/user identifiers. Do not write bank snapshots, traces or unredacted `browser-output`.
- Use local deterministic login indicators. `LOGGED_IN` / `LOGGED_OUT` only when reliable, unambiguous positive evidence exists. Otherwise `UNKNOWN`. URL-only inference is invalid.
- User must authorize navigation and manually perform login in UI. Never automate credentials, orders, payments or account changes.
- The banking session must **actually enforce** blocking of generic model-facing browser tools (including snapshot/evaluate/click/type/navigate), model-origin shell/file access to bank page/profile/output and unfiltered tool-result propagation while the bank session is active. Prompt-only promises are not enforcement. If not enforceable, no live test and report `BLOCKED`.
- Avoid triggering an LLM turn from a Pi command; use `triggerTurn:false` or equivalent if supported.
- Fail closed for unclear runtime/profile owner, unsafe tool visibility, unknown DOM predicates, attach failures, unsupported browser, redirects to untrusted origins. Preserve existing auth, profiles, settings, stashes and runtime.

## Explicit exclusions

No real financial data retrieval, holdings/balance/orders, trading, transfers, account-setting changes. No forwarding any page/account/auth content to OpenRouter, Claude, Codex, Hermes, or other external models. Do not widen `/harness`, edit P5.4 Worker runtime, change upstream Pi, introduce a new common Skill adapter, install or reconfigure browser security, or automatically fall back to paid models.

## Focused acceptance (do NOT rerun P3–P5.4 suites)

A. **Inventory**: Actual M1/M2 location and tracking status, persistent profile existence and safe reuse/attach method; no protected contents inspected.

B. **Hard security gate**: Using only synthetic page fixtures and fake account-like sentinel strings, demonstrate that raw browser/tool/shell/file paths are blocked during bank mode and account-like strings never appear in Pi-visible message/results/stderr. No raw page or session values in logs. Failure paths yield `BLOCKED` / `UNKNOWN` only.

C. **Local status classifier**: Offline tests cover not running, wrong site, unknown login, positive and negative synthetic login indicators. Never infer logged-in from host/URL alone.

D. **Manual smoke**: User explicitly operates Edge and logs in. This cannot be claimed PASS without the human's presence and safe local observation. Mark `NOT RUN` or `BLOCKED` if applicable; no automatic live login.

E. **Scope preservation**: Run only tests for changed components. Do NOT rerun `add42`, old 14 smoke / 22 commander, or historical worker research unless relevant source changed. No gratuitous model calls.

## Git execution and handoff

1. Read `docs/CURRENT_TASK.md`, this work order, and minimal live files only.
2. Operate from `C:\Agentco` on assigned remote feature branch. Check dirty state before checkout; if unsafe to switch, STOP and report; no extra worktree without a documented reason.
3. Complete inventory and enforceable data isolation BEFORE any real bank site test. Implement only if gate passes. Mark MOCK/LIVE/NOT RUN/BLOCKED truthfully.
4. Commit and push only to `feature/p5-5-samsungpop-readonly-browser`, preserving all unrelated state and secrets. Do not merge main.
5. Report a compact handoff: `BASE_SHA`, `BRANCH`, `IMPLEMENTATION_SHA`, `M1_PATH`, `M2_PATH`, `PROFILE_EXISTS`, `SECURITY_GATE`, `STATUS_ENUMS`, `FOCUSED_TESTS`, `MANUAL_LOGIN`, `CHANGED_FILES`, `DEFERRED`, `PUSH`.
6. Claude independently verifies the exact implementation SHA, concentrating on *real enforcement* of the isolation boundary, result sanitization, fail-closed behavior and narrow diff. GPT/user authorize final PASS and merge; Codex must not merge.
