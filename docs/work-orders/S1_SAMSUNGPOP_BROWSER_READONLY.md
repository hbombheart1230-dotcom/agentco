# S1 — Samsung POP local read-only browser status

**Status:** READY FOR LOCAL INVENTORY / IMPLEMENTATION NOT YET VERIFIED (2026-10-14)
**Base:** `origin/main` @ `c51b0a044ba8c6a303efc226ed44834d6a3b362e`
**Branch:** `feature/s1-samsungpop-readonly-20261014`
**Canonical Windows workspace:** `C:\Agentco`
**Scope:** Personal Agentco only. Not Samsung Display/OASIS and not Agentra.

## Purpose / bounded outcome

Make Agentco answer a user-initiated "삼성증권 열어줘 / 로그인 상태 알려줘" from a *local-only* browser operation. Prefer existing M1 persistent-browser, M2 browser extension and native Playwright integration. Do **not** build another browser stack, add general Worker delegation, or begin account reads (S3).

S1 success: Edge launches/attaches safely, opens the official Samsung POP site (`https://www.samsungpop.com/`), the user may log in **manually**, and Agentco reports only a fixed status. Opening the bank page is NOT permitted until the isolation gate below passes.

## Minimal context / known remote facts

Read this file and `docs/CURRENT_TASK.md` only, then inspect current relevant source and local runtime *metadata*. Do not re-read P0–P5.10 completed work orders. The older `feature/p5-5-samsungpop-readonly-browser` branch contains a **spec only**, created against obsolete `cc6078f`, and diverged from the current main; do not merge/cherry-pick it blindly.

Verified in current main: `pi-dev/mcp.json` exposes `@playwright/mcp@0.0.83` through Edge with `--user-data-dir ~/.agentco/browser-profile`, `exposure: codemode`, and direct generic browser navigation/snapshot/click/type/evaluate/wait tools. `docs/capabilities/HARNESS.md` records browser/localStorage process-to-process persistence with synthetic pages, **not authenticated banking**. The past user's direct login is historical, not proof of a current session. Tracked M1/M2 local implementation and present profile status remain unverified.

## Phase A — safe local inventory FIRST

1. At `C:\Agentco`, inspect `git status --short --branch`, `git branch --show-current`, `git fetch origin` and `git rev-parse origin/main`; inspect stash **count/metadata only**. Keep both existing stashes, dirty/untracked work, ignored runtime, auth and profiles untouched. No reset-hard, force push, stash pop/drop, blind checkout/pull. If switching is unsafe, STOP and explain.
2. Locate only pertinent tracked/ignored M1/M2 source entrypoints, installed extensions/MCP, and local Edge process/launch method. Report paths or NOT_FOUND; do **not** inspect profile contents or stored sessions. Check only whether `~/.agentco/browser-profile` exists. The GitHub connector cannot see this Windows runtime.
3. Establish how a dedicated **non-model-visible** local browser controller can own banking operations, prevent concurrent profile locks and safely reuse the existing profile. If an isolated profile is the only safe solution, propose it without copying cookies/credentials and obtain user approval before migrating the workflow.
4. Audit *actual enforced isolation*: model-visible Playwright MCP/codemode browser tools, shell/file tools and logs must have no path to active banking page/profile/output. A prompt instruction, model promise, or `protected-paths.ts` alone does not establish a hard boundary. Never allow raw bank-page content into OpenRouter, Pi, Claude, Codex, Hermes, subagents or any LLM tool results.

Required sanitized inventory: `BASE_SHA`, `LOCAL_BRANCH`, `DIRTY`, `STASH_COUNT`, `M1_PATH`, `M2_PATH`, `PROFILE_EXISTS`, `EDGE_STATE`, `ISOLATION=PASS|BLOCKED|UNKNOWN`. Do not print credentials, profile file listings, account numbers or browser URLs beyond the hard-coded public origin.

**Stop gate:** If the model/browser/profile isolation cannot be *enforced and shown by synthetic tests*, report `BLOCKED / LIVE_NOT_RUN` and the smallest remediation; do not open Samsung POP for investigation.

## Phase B — implement only after isolation PASS

- Reuse official/native components first. Prefer an explicit local command/entrypoint; if possible use `/samsungpop open` and `/samsungpop status` with no implicit LLM turn (`triggerTurn:false` if supported). Another minimal CLI/helper is acceptable when native integration cannot enforce isolation.
- Only user action initiates navigation; navigation is restricted to `https://www.samsungpop.com/` and its verified first-party login flow. Unknown redirect or ambiguous origin => safe error/unknown.
- All browser interaction, DOM predicates and auth decisions run inside the isolated local component. The operator performs sign-in manually; no automated password, OTP, cookie or session access.
- Expose only fixed enums, e.g. `{"state":"OPEN|LOGGED_IN|LOGGED_OUT|UNKNOWN|ERROR","browser":"RUNNING|NOT_RUNNING|UNKNOWN","site":"SAMSUNGPOP|OTHER|UNKNOWN","auth":"LOGGED_IN|LOGGED_OUT|UNKNOWN","error_code":"NONE|ISOLATION_BLOCKED|PROFILE_LOCKED|NAVIGATION_FAILED|UNSUPPORTED|UNKNOWN"}`. Resolve `OPEN` when verified public site is available but logged-in status is not proven. `LOGGED_IN/OUT` require deterministic independent positive indicators; URL alone is insufficient. Otherwise `UNKNOWN`.
- Never surface raw page text, titles, full URLs, snapshots, screenshots, network responses, storage, page source, identifiers, portfolio values, stdout/stderr diagnostics, stack traces or browser-output to an external model. No sensitive banking traces on disk. Fail closed.
- Keep the ordinary non-bank browser functionality intact without sharing an active bank session with model-visible browser MCP; prevent simultaneous ownership and verify clean release.
- Do not change unrelated harness, Worker `add42`, native provider/model defaults, Pi upstream, or machine-wide security/loopback settings. Native Main = Pi unless user explicitly selects another. Codex may assist coding; Claude verifies independently only if not an implementer.

## Focused acceptance / reporting

A. Offline synthetic bank-like fixture proves **enforced** isolation of generic browser/MCP and shell/file escape routes, including exceptions, tool results, stdout/stderr and logs. Model-facing outputs contain *only* fixed enums/error codes. Fake account sentinel strings never appear in an LLM-facing surface.

B. Status classifier synthetic cases: browser absent/locked, wrong site, public open, ambiguous auth, positive logged-in, positive logged-out, error/redirect. No false positive from host/URL alone.

C. Manual Edge/live login validation requires the actual user and isolation PASS. Until then mark `NOT_RUN`; the user's old successful login is not a current pass. Report state after relaunch truthfully; do not promise persistence.

D. Run only relevant changed-component tests; avoid historical 14/14 smoke and prior P5/P5.4 tests unless their code changes. No real transactions or account content.

E. Keep temporary test artifacts isolated under ignored session-scoped paths; auto-clean successful temp data, retain only bounded failure evidence, never sensitive browser/auth output.

## Delivery & independent review

Implementer: Pi or explicitly selected native Main (Codex optional coding support). Work on this feature branch after local Git safety check, implement/test/commit/push **only to this branch**. Use changed-files-only handoff; no automatic main merge. Claude independently reviews the exact implementation SHA when not the implementer; otherwise choose another independent verifier. GPT + user make PASS/main decision.

Report: `BASE_SHA`, `IMPLEMENTATION_SHA`, `BRANCH`, `CHANGED_FILES`, `M1_PATH`, `M2_PATH`, `PROFILE_EXISTS`, `ISOLATION_GATE`, `ENUM_TESTS`, `MANUAL_LOGIN`, `LIVE`, `MOCK`, `NOT_RUN`, `DEFERRED`, `PUSH`.

## Explicitly out of scope

S2 research extraction, S3 authenticated balances/holdings/transactions, S4 natural language financial analysis; buying/selling/canceling, transfer/withdrawal, order status mutation; MFA bypass, tokens/cookie copy, profile cloning, stealth automation, external raw financial-data exfiltration. Defer those to separately authorized work orders after S1.
