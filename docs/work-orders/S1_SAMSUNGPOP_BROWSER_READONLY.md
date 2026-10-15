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


## GPT static review — 2026-10-14 (REWORK REQUIRED)

Reviewed implementation SHA: `ec339de7989859c39f287f9f3a8ce20b4723ca23` via GitHub source, not a local runtime execution. The reported `8/8 synthetic PASS` is **not accepted as an enforced isolation gate**, and live banking/manual login remains **NOT_RUN / DO NOT RUN** until the mandatory corrections and independent review.

### Mandatory P0 fixes

1. **Stable, single banking session:** `scripts/samsungpop-controller.mjs` calls `getFreshProfileDir()` independently for `open` and `status`, so status cannot access the browser opened by the preceding command. Replace with a stable, dedicated banking-profile location and explicit single-owner lifecycle/attach strategy. Do not reuse or alter the general model-visible Playwright MCP profile. Existing historic bank login is NOT migrated; new manual sign-in may be necessary. Avoid a second Edge process on a locked profile, distinguish stopped from detached startup, and prevent infinite accumulation of generated directories.
2. **No profile copying:** `scripts/samsungpop-playwright/status.mjs` calls `fs.promises.cp(PROFILE_DIR,tmpDir,{recursive:true})` and launches Edge on the clone, contrary to the prohibition on copying credentials, cookies or session material. Remove the entire clone/headless cookie/storage inference branch. No temp auth copies, cookies, tokens, screenshots, traces, or banking dumps; no cleanup-only mitigation.
3. **Enforced model/data isolation:** General MCP `browser_navigate/snapshot/click/type/evaluate` remain available in `pi-dev/mcp.json`; `protected-paths.ts` handles only certain `read/write/edit` paths and `permission-gate.ts` checks narrow dangerous shell command patterns. Neither blocks arbitrary profile access using shell, `node -e`, codemode, subagents or future generic tools. A standalone controller plus `triggerTurn:false` is insufficient proof. Define and demonstrate actual restrictions preventing all model-origin file/shell/browser access to active banking profile/page/output and error/log results, or mark `ISOLATION=BLOCKED` and STOP without any live banking navigation. Never weaken general browse functionality silently.

### Mandatory P1 correctness fixes

4. `status.mjs` attempts a global unauthenticated CDP attach at `localhost:9222` without verifying the browser owner, profile, or target identity. Never connect to an unrelated process/port. Prefer explicit ownership-scoped IPC or a verified fixed-endpoint/nonce with a confined local process; if none, report `UNKNOWN`, not fabricated status.
5. Cookie/localStorage **key names** are not evidence of authentication. Remove positive `LOGGED_IN/OUT` inference from keys or URL. Generic speculative CSS selectors are not validated Samsung POP indicators. Require unambiguous, locally evaluated positive evidence for either state; otherwise `UNKNOWN`.
6. `cmdOpen` returns `OPEN/RUNNING` after 3 seconds without verifying child readiness, navigation success or same-origin. Add a bounded readiness result containing fixed enums, and honest fail-closed errors. Avoid unbounded detached lifecycle (`await new Promise(() => {})`) without ownership/shutdown semantics.
7. Detached `browser-logs` currently receive raw child stdout/stderr. Remove raw log capture for banking paths or allowlist strictly sanitized code-only events (including failures); keep no sensitive residual output.
8. Do not add stealth/anti-bot flags or machine security-setting changes as a workaround. Avoid work outside S1.

### Acceptance tests (behavior, not source-string checks)

- Current `scripts/samsungpop-isolation.test.mjs` largely searches source text and duplicates sanitizer implementation; this is **not** proof of runtime enforcement. Exercise actual exported sanitizer/controller and representative mocked Pi tool dispatch (read, bash, codemode, MCP browser, subagent) against fake profile/page/credential sentinel fixtures; assert the operations are blocked rather than merely their results sanitized.
- Test `open → status → status → close/reopen` using the **same** test-owned fake persistent profile/owner; assert a wrong CDP endpoint is rejected, lock or startup failure never returns `OPEN`, and auth remains `UNKNOWN` without positive evidence.
- Assert no `fs.cp`/storage cloning, that child exceptions and stdout/stderr do not persist raw strings, and that all model-facing events/returned objects contain only fixed enums/codes. Include failure and cleanup paths.
- No real bank website, user login, account reads, or network/model calls until required isolation is demonstrated and an independent reviewer accepts the scoped changes. Tests not run must be labeled NOT_RUN.
- Implementer commits/pushes the minimal fix on the existing feature branch. Return exact SHA, focused tests (MOCK versus LIVE), changed files, true isolation verdict, and remaining blockers. GPT/user gate merge; Claude independently reviews the implementation SHA when it was not the implementer.


## GPT static review — blockers (2026-10-14)

Static source review only; Windows runtime, local stashes and the live Samsung POP site were NOT tested by GPT. Last inspected implementation commit: `ec339de7989859c39f287f9f3a8ce20b4723ca23`. The prior 8/8 tests are shallow synthetic/source-pattern tests and do NOT prove hard isolation. **S1 ISOLATION_GATE=BLOCKED; LIVE=NOT_RUN until separately established.**

Required delta work before live testing (keep design minimal; do not re-read past phase reports):

1. `samsungpop-controller.mjs` creates a different random profile for each `open` and `status` call. Existing `~/.agentco/browser-profile` is not reused, and status cannot reliably observe the just-opened session. Inventory original M1/M2 local implementations and choose a consistent, explicitly owned profile/session without copying auth artifacts. Preserve existing profiles.
2. Detached `open` unconditionally claims `OPEN/RUNNING/SAMSUNGPOP` after three seconds; implement a real bounded readiness handshake and return `UNKNOWN` or `ERROR` on failure. A confirmed browser process is not proof of navigation or authentication.
3. `status.mjs` attaches indiscriminately to `localhost:9222` and may inspect unrelated Edge contexts. Prove owner identity or use a controller-owned local IPC channel; no attach to arbitrary debugging endpoints.
4. `status.mjs` recursively copies the browser profile into a temporary directory and infers login from cookie/storage-name presence. Remove the profile cloning and cookie/storage heuristics entirely. Define deterministic, bank-specific positive UI evidence; ambiguous status => `UNKNOWN`. No authentication tokens may be read or exposed.
5. Model-facing Pi shell/read/codemode and general Playwright MCP are still available. Current `protected-paths.ts`/`permission-gate.ts` regexes and a `triggerTurn:false` command are **not** an enforced bank boundary. Demonstrate a genuine process/tool/file-access boundary with synthetic adversarial tests for all available model-origin paths. If the current Windows security context cannot enforce the boundary, STOP as BLOCKED and propose the smallest safe separate-process/identity design; do not open the real bank page.
6. Do not redirect arbitrary Playwright stdout/stderr to persistent banking logs. Prevent leaks from exceptions, child process diagnostics, uncaught rejects and test artifacts; outputs to Pi/model must contain only the fixed status schema. Ensure deterministic cleanup without touching historical profile/session data.
7. Rewrite focused tests to exercise actual production code and runtime behavior, not copied sanitizer logic or static string searches alone. Cover startup failure, profile ownership, wrong target, ambiguous/positive auth, session restart, tool/IPC failures and fake banking sentinels. Report MOCK/PASS and LIVE/NOT_RUN separately.

Acceptance order: safe local Git inventory -> local M1/M2 discovery -> enforceable isolation PASS -> actual session ownership/status tests -> only then user-initiated live browser login. Preserve two stashes, local dirty state and secrets. Pi is the default implementer; push feature branch only. Independent Claude review on exact implementation SHA before any main merge.


## GPT static review — latest 0656d1a9 (2026-10-14): REWORK REQUIRED

**Review SHA:** `0656d1a9be26cb18ed630a8d0506de14cab625e1`. GitHub confirmed this is `origin/feature/s1-samsungpop-readonly-20261014` HEAD at review time. Only 4 source/test files changed from the preceding static-reviewed work. **Static source review, not local Windows execution; reported 8/8 synthetic tests were NOT independently run by GPT.** The report's `ISOLATION_GATE=PASS` is **NOT ACCEPTED** as enforceable isolation. **S1 ISOLATION=BLOCKED, LIVE_BANKING=NOT_RUN, MAIN_MERGE=NO**.

### Improvements accepted narrowly

- The controller now uses a stable `~/.agentco/browser-profile-banking` path rather than per-call random directories.
- `status.mjs` removed the profile-cloning/headless read branch. User credentials/profile were not touched by this GitHub-only review.
- A browser-open success report now originates from a Playwright child instead of an unconditional 3-second controller timer. This does not prove the endpoint belongs to the launched browser or that all errors are handled correctly.

### Remaining release blockers

1. **Enforced bank/model security boundary not implemented:** Native `pi-dev/mcp.json` still exposes generic Playwright actions (including `browser_evaluate`), and native model tools permit shell/codemode/file access under the same Windows user as the bank profile. A separate folder, `pi.exec`, `triggerTurn:false`, allowlist-formatted status response, or regex-based tool blocker alone **cannot** prevent a model-accessible tool/process reading that bank profile or attaching to its debugging endpoint. Either implement a demonstrable OS/process identity boundary and narrowly scoped local IPC under a separate protected user/security context, or report `ISOLATION_BLOCKED` and STOP. Do not weaken unrelated general browser tools silently, and do not assume a user-mode JS gate is an OS security boundary. Consider a standalone local banking app, entirely outside model-exposed agent tools, as an alternative if separate identity isolation is disproportionate.
2. **Unowned global CDP port:** `open.mjs` launches Edge `--remote-debugging-port=9222` but `waitForCDP` and `status.mjs` attach to any process listening there. Checking `browser.version()`, successful `page.evaluate`, or Samsung POP page URL proves only responsiveness, not owner PID/creation identity, profile ownership or origin integrity. An existing listener can be falsely accepted, especially given the reported Windows zombie port. Must use verified single-owner session/IPC and refuse unverified endpoints. Never globally kill `msedge.exe`, other users' sessions or unknown PIDs; no OS port cleanup workaround without verified ownership.
3. **False login detection & sensitive storage inspection:** Both `determineAuthStatus(page)` copies remain distinct, not actually shared. Both inspect `document.cookie` and local/sessionStorage key names, and return `LOGGED_OUT` when no heuristic matches. A cookie/storage-name match does NOT prove successful authentication, and lack of one does NOT prove logout. Remove ALL storage/cookie inference and inspection. Until verified bank-specific positive DOM indicators are known through approved local-only UI validation, report `auth=UNKNOWN` and `state=OPEN/UNKNOWN` rather than assuming logged in or logged out. Generic speculative selectors such as `a:has-text("마이페이지")` or `.user-name` cannot be treated as bank-certified. Verify exact final page origin with parsed hostname/HTTPS, not `url.startsWith`.
4. **Runtime error/ownership lifecycle:** `open.mjs` still uses `detached:true` + `unref()`, a fixed port and no persisted trusted owner identity/shutdown protocol; errors and lock/stale endpoints can be misreported. `runPlaywrightScript` collects child stdout/stderr without a hard cap and accepts first JSON status, even if a later child failure occurs. Remove bank-specific raw diagnostics and expose code-only errors through a bounded handshake with independently verified owner. Do not add stealth/anti-bot flag `--disable-blink-features=AutomationControlled` or machine security-setting changes.
5. **Behavior tests required, NOT just source-string checks:** The 8 tests use source-pattern assertions and a duplicate local `sanitizeStatus`, so they do not demonstrate model-origin blocking. Mock production dispatch for read/shell/codemode/MCP/subagents with fake profile/page/token sentinels, exercise actual controller production functions and child outputs on success/failure, verify wrong-owner/zombie port refusal, and test open→status→status→close/reopen state continuity without a live bank. Explicitly demonstrate credential/page contents cannot reach *any* model-facing tool result/log. If actual OS isolation cannot be proven in current Windows environment, report BLOCKED and recommend the narrowest architecture without pretending tests passed.

### Next implementation boundary

- **No live bank page, login, account reads, model/API calls, OS-level taskkill, profile/cookie copying, auth bypass or secrets inspection.** Existing user login may be expired; never manufacture a status from old history.
- Focus on the smallest enforceable local boundary and safe owner-attached browser lifecycle first. Stop and truthfully report BLOCKED if it needs a separate Windows user/process permission that cannot be provisioned within scope. A runnable fake-only status controller plus local user UI is acceptable as partial progress; do not call it bank-isolated if tools can still access the banking runtime.
- Commit/push changes on **this feature only** when implementation has finished; preserve main, two stashes, local auth/browser profiles and Pi native model settings. Claude independent review of exact new SHA required before release.


## User product clarification — manual-login-first S1 (2026-10-14; latest governing scope)

**This latest section supersedes prior S1 instructions to block even opening the bank website until a complex same-PC OS-account security boundary is implemented.** User explicitly confirmed that the originally working experience was: Agentco opens an Edge window; the USER personally signs in to Samsung POP; Agentco checks basic status. Do not turn S1 into a Windows multi-identity/sandbox infrastructure project.

### Deliver a small, honest user-controlled flow first

1. **Open:** The user types `/samsungpop open` (or uses a tiny local CLI if Pi command dispatch is unsuitable). Open the official `https://www.samsungpop.com/` URL in an identifiable Edge window using existing local/browser support with no model prompt/LLM-tool invocation. Prefer an existing functioning M1 persistent-browser integration, but never copy/migrate cookies or interfere with an active personal profile. A dedicated banking profile is acceptable only as a usability detail, not a mandatory new isolation platform; it may require a fresh human login.
2. **Manual login:** Explicitly display "삼성증권 브라우저를 열었습니다. 직접 로그인한 후 상태 확인을 요청하세요." The agent does not type/ask for passwords, certificates, OTPs, or download/copy cookies. No automated login, no trading or transfers. The user controls the interactive browser.
3. **Status:** The user types `/samsungpop status`. Report actual local browser/site state; until a **known, verified site-specific UI signal** is available, set `auth=UNKNOWN` (not falsely `LOGGED_IN` or `LOGGED_OUT`). A simple user confirmation of being logged in can be reported as user-confirmed and **must not** be misrepresented as an independently verified browser-auth state.
4. **Operational privacy for this initial smoke:** Do not invoke normal model-visible Playwright MCP, browser snapshots, shell/codemode browser evaluation, or external OpenRouter model calls *on the bank page or banking profile*. Do not pass raw DOM, cookie/storage, financial information, login traces, stack output, pages or account details to model context, Git or persistent logs. Treat this as a **local operator-initiated browser step**, not a claim of a hard security boundary against all tools with the same OS user rights. If a future model-visible automated account-read workflow is desired, design a scoped data-minimization/access boundary as a separate milestone.
5. **Fix only blocking correctness issues for this flow:** Never blindly connect to an unrelated `localhost:9222` or treat a zombie port as proof of browser ownership; avoid fixed global CDP when native supported profile/window launch is simpler. Never broadly kill Edge. Remove cookie/localStorage auth heuristics and stealth/anti-bot flags, and make browser/open errors truthful. Keep profile storage nonduplicated and all existing user state intact.
6. **Focused validation:** Test the real launch/status code against fake or blank content and verify no unowned CDP attach, no token/profile cloning, no false `LOGGED_IN/OUT` for ambiguous cases, and bounded user-visible enum/status. Unlike previous "8/8" source grep tests, report genuinely exercised behavior. User may then manually run the local browser/login smoke; `LIVE` is `NOT_RUN` until they actually do it. The interactive login should not be held hostage to an unrelated full OS sandbox build; privacy tradeoffs should be stated accurately.

### Boundaries and handoff

- This clarification **does not authorize** external LLM processing of authenticated bank data, reading balances/holdings, or weakening account safety. It authorizes the modest user-operated browser/manual-login workflow and honest non-sensitive status.
- Preserve current S1 feature branch, other Mains, stashes, profiles, credentials, native model settings. Implement/test/push feature only; independent review before main release. No automatic live login attempt by the implementer.
- This is a product-scope adjustment, **not evidence that the old 8/8 tests proved isolation**; replace unsupported `ISOLATION_GATE=PASS` claims with `MANUAL_FLOW` results and privacy limitations.


## GPT implementation review — c3ba873 (2026-10-15)

**Latest implementation:** `c3ba873b97631fe7e5e0d08365ab3b27f0e8da91`. Pi reported **9/9 local tests PASS**, stash count **3**. GPT inspected the GitHub four-file diff (not a Windows runtime test). **Review: REWORK for correctness; no main merge yet.** The latest governing product scope remains **manual Edge open → user signs in → local non-sensitive status**; no large OS sandbox prerequisite. Do not claim same-user hard isolation is proven by 9 source/enum tests.

**Codex sole implementer — narrow delta, edit only directly necessary files:**

1. `scripts/samsungpop-controller.mjs`: `runPlaywrightScript` writes hard-coded `9222` to `cdp-port` for BOTH open and status, then status/timeout may erase it. This is **not** ownership proof. Eliminate self-asserted file trust and unowned global 9222 attachment; choose the smallest consistent native browser/verified session ownership mechanism. Test a preexisting wrong listener and restart. Do not kill unrelated Edge processes.
2. `scripts/samsungpop-playwright/open.mjs`: currently sets `site: StateEnum.SAMSUNGPOP` or `StateEnum.OTHER` in some error paths, but these are NOT StateEnum values, yielding unexpected UNKNOWN. Use proper SiteEnum and test real error/status output. Avoid introducing model-visible bank contents.
3. `open.mjs` holds `await new Promise(() => {})` with no owned close, graceful shutdown or duplicate-start policy. Implement simple deterministic open→status→status→close/reopen behavior, bounded readiness/errors, no orphan child, no profile copy or log of raw page data. Keep actual manual interactive Edge window open for the user. Avoid a second browser stack.
4. `open.mjs` / `status.mjs`: no cookie/storage-based auth inference. Until site-specific **reliably verified** indicators are established, `auth=UNKNOWN`; don't falsely assert login from generic DOM selectors. Keep `https://www.samsungpop.com/` first-party navigation checked by parsed URL origin. Do not add stealth/browser anti-bot flags or repeat paid model tests.
5. **Focused behavioral tests, not string grep:** using production controller and mocked browser adapter/session, verify correct open/status statuses, site enum on navigation error, wrong-CDP-owner refusal or CDP-free path, absent/stale browser, duplicate open, closed browser, restart, UNKNOWN ambiguous login, redaction of fake account sentinels. If implementation cannot reliably attach/confirm identity, return UNKNOWN/ERROR, not a false PASS.

**Execution:** Starting from currently pushed S1 feature (including this note), Codex alone implements and commits/pushes to feature only. Preserve existing local dirty work, all **3** stashes, browser profiles and auth. No live Samsung POP/test login, account access, payment/trade, settings reset, broad refactor, generic Worker system, or main merge. After narrow code/test completion, independent **Claude** reviews exact new SHA, limited to changed files + this paragraph. If CDP ownership is infeasible, prefer simpler native launch + honest status degradation instead of building a new OS sandbox. **Report:** SHA, changed files, MOCK test count, OPEN→STATUS ownership result, LIVE_NOT_RUN, blockers. No repeated completed phase rereads.


## GPT focused static review — 1f23c7c9 (2026-10-15; latest)

**Implementation:** `1f23c7c9aa94299694c5617cb5759e8e29051652`, reported 9/9 synthetic tests PASS, not independently executed here. GitHub source inspection finds **REWORK** before Claude, live login, or main merge. User's latest product direction is simple **local Edge open → user manually signs in → repeatable local status**; no full OS sandbox as S1 prerequisite. Do not claim hard isolation from unrelated same-user agent tools.

**Five scoped blockers, Codex-only fix then one Claude review:**

1. **Persistent status:** `scripts/samsungpop-controller.mjs` clears `cdp-port` when `status` child closes (`waitForExit=true`). This breaks `open→status→status`. Status must not delete valid active session metadata; clear it only on verified owned shutdown/stale-session handling, without touching an unrelated listener.
2. **Fresh profile startup:** `writeCdpPort` runs before any code creates `~/.agentco/browser-profile-banking`. Handle profile-directory absent/first use safely, preserving existing profiles and Windows ACLs. Avoid uncontrolled profile cloning.
3. **Site enum bug:** `open.mjs` error paths still use `site: StateEnum.SAMSUNGPOP/OTHER` rather than `SiteEnum`. Correct exact enum and test navigation and malformed-origin failures. Site validation should use URL parsing and HTTPS origin, not loose `startsWith`.
4. **Browser ownership and duplicate open:** Random TCP port plus a user-writable port file is **not** independent ownership validation; port collision, stale/zombie listener and duplicate `open` can attach to or orphan the wrong browser. Refuse unverified listener, track trusted launched process/session, and make second `open` idempotent or return a truthful owned-session error. Do not globally kill Edge. If attaching securely is overcomplicated for S1, simplify to a native user-opened local window and return `auth=UNKNOWN` without CDP instead of building a new framework.
5. **Tests:** Replace string-only assertions for these behaviors with focused tests calling production controller / a minimal injected browser-launch or CDP adapter using fake sessions, no real bank. Verify open→status→status, first-run nonexistent directory, malformed origin, wrong/stale endpoint, duplicate open, child launch failure, status after close/reopen, output enum-only + no raw bank data. Keep `LIVE_NOT_RUN` until user performs actual manual login. Unsupported speculative login DOM selectors should return UNKNOWN.

**Process:** Pi coordinates, Codex is sole source editor; preserve three existing stashes, user profiles, tokens, local dirty state and browser. Commit/push S1 feature only. Claude conducts a **single independent review of final implementation SHA** after Codex reports focused tests, without rereading old phase notes or running paid inference. No main merge or automated account read/order.


## GPT gate review — 9dd51b7c (2026-10-15)

**Report:** Pi/Codex reports 21/21 tests PASS; local tests and live Samsung POP not independently run here. **Static GitHub source gate: REWORK**, **LIVE_NOT_RUN**, **MAIN_MERGE=NO**. Avoid spending Claude Code CLI model tokens on obvious deterministic failures until fixed.

**Minimum Codex CLI follow-up — no extra architecture:**

1. `scripts/samsungpop-controller.mjs` still runs `clearCdpPort(); clearCdpSession();` in `runPlaywrightScript('status')` close/catch/timeout paths because `waitForExit=true`. This **destroys the active session metadata after the first status**, so the required `open→status→status` cannot reliably succeed. Status must be read-only with respect to an active owned session; cleanup only on a verified owned-close or explicitly confirmed stale session, and never delete a newer session's metadata.
2. `generateSessionToken()` and a `cdp-session` file are **not proof of browser/CDP identity**. The `status` child receives the token and file path from the *same controller*, compares them to the same file, then attaches to the port with no browser-side token verification. It does not attest Edge PID, launch identity/profile or process ownership. Do not label this `CDP_OWNERSHIP=PASS`. Either add cheap owner verification using actual locally launched process/creation metadata **and fail closed**, or simplify initial manual-login S1 to independent native Edge opening and `auth=UNKNOWN` when ownership cannot be determined. No full OS sandbox required for user-controlled manual login.
3. Fresh `~/.agentco/browser-profile-banking` startup still writes `cdp-port` and `cdp-session` before ensuring the target folder exists; and a second `open` overwrites the first session's metadata/spawns another Edge. Handle first-run and duplicate open safely without replacing or deleting existing profiles. Validate status after browser close/reopen.
4. The 12 new `samsungpop-behavioral.test.mjs` tests are mostly static text checks, fake JSON-file comparisons or pure sanitizer calls. Defined `createMockBrowserAdapter()` is not injected into `open.mjs` or `status.mjs`; no test actually drives production `open→status→status→close/reopen`. Add a small focused production-behavior test that **fails with current implementation and passes after fix**, proves repeated statuses, wrong/stale listener refusal, initial missing directory, duplicate open, child errors and enum-only output. Avoid using real financial pages or copying tokens. Random-port tests must not assume two samples can never collide.
5. Continue `auth=UNKNOWN` for ambiguous login; generic unverified selectors are not proof of actual Samsung POP authentication. Keep bank contents, credentials and raw diagnostics out of LLM tool responses/logs.

**Roles and release:** Codex CLI (local native, sole code editor) does one minimal fix+offline tests+feature push. Pi CLI coordinates only; Hermes CLI unnecessary for a simple local Node test. Once behavior is **actually** verified, Claude Code CLI (local native, independent source/test review at exact SHA, no source edits) reviews **once**. GPT/user gate main. Preserve three local stashes and all ignored profiles, sessions, auth; no live bank login by automated agent, no global Edge kill, no main merge.
