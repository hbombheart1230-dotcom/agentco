# S2 — Samsung POP Read & Save (thin vertical)

**Date:** 2026-10-15
**State:** APPROVED FOR IMPLEMENTATION, subject to scoped local gates below. No live account access without user present.
**Base:** origin/main @ `0a6e8bdb956da188845aededbd6347abe1578751`
**Branch:** `feature/s2-samsungpop-read-save-20261015`
**Workspace:** `C:\Agentco` (personal Agentco only — NOT Samsung Display or Agentra)

## Why / product intent

Agentco is a personal assistant, not a brokerage trading platform. Samsung POP is the first source of a reusable **open → manually sign in → read a visible page → save local structured data** pattern. Hotel/flight/shopping sites come *later*, not in this feature. Prioritize actual useful read & save, small code, low model credits.

User specifically chose a lightweight, user-supervised collection workflow over a separate Windows bank account, general security broker platform, finance-only MCP, or elaborate 3-Worker workflow. Do not add those. Also do **not** claim the same-Windows-user architecture enforces hard isolation from model-accessible shell/process tools; document that trade-off honestly.

## Expected UX (initial scope)

Existing `/samsungpop open` and `/samsungpop status` remain available. Add one narrow explicit command: `/samsungpop collect` (or `balance` alias if trivial). The user manually signs in and navigates to the **visible** account overview/holdings page. Command performs read-only extraction of fields present on that page and saves a timestamped local JSON snapshot. It displays a short status and saved relative path without displaying raw account data in model output, tool results or logs. No background polling or automatic refresh.

No login automation, password/MFA reading, cookie/localStorage inspection, order/transfer/button clicks, accounts discovery, or mutating form submissions. Do not fabricate authentication state: keep `auth=UNKNOWN` until an actual verified signal exists, which is not required in S2.

S2 success: user can issue the command in Pi, and see a truthful local collection result + a saved JSON snapshot; a later ordinary local command can load it for user-approved analysis. Do **not** implicitly feed holdings or balances to third-party model APIs. User may explicitly request analysis of selected saved data in a future task, with notice that cloud-backed models may receive it.

## Baseline and local Git gate (do FIRST)

Start at `docs/CURRENT_TASK.md` and this work order; read only the directly relevant files:
`pi-dev/extensions/samsungpop.ts`, `scripts/samsungpop-controller.mjs`, `scripts/samsungpop-playwright/{open,status}.mjs`, `pi-dev/mcp.json`, and paths needed to implement/test. Do not read the old S1 work order/history or rerun old full smoke without a concrete regression.

Previously observed local state: feature S1 branch HEAD `3395c3910b94b54d51bed6c3d818825b4f78859a`, `pi-dev/settings.json` dirty, 3 stashes. `origin/main` is authoritative at the SHA above. Fetch, compare local changes, preserve all dirty/untracked/ignored data and the 3 stashes. Switch to updated local main and then the S2 branch **only if safe**. No `reset --hard`, `clean`, blind `pull`, force checkout, `stash pop/drop` or overwriting user settings, profiles or auth. If unsafe, STOP and report exact blocker; do not work on the old feature S1 branch. Keep branch/repo writes single-writer.

## Minimum design: reuse first

1. Reuse the current S1 `samsungpop` Pi Extension and banking Edge profile; do not create another extension/MCP/browser framework or modify the ordinary Playwright MCP tools for other sites. Minimal helper in `scripts/samsungpop-playwright/` is acceptable. Reuse Playwright already installed; no new dependencies unless justified.
2. Use the existing user-opened banking session, never clone browser profiles, cookies or session state. Controller must reject ambiguous/unowned CDP endpoints and avoid wrong-browser attachment. Fix **only** open/status/collect lifecycle defects that block this flow. Evaluate whether current detached-Edge + CDP pattern can be safely attached to; if not, prefer an equally thin **single owner Playwright persistent-context** pattern rather than PID/port/token checklists or a new security service. Maintain S1 open/status compatibility.
3. Prefer DOM extraction from the selected *visible* account/holdings page. No arbitrary crawling or account auto-navigation. Start with fake local page fixtures to define selectors and field parsing, then inspect/validate site-specific selectors only during a user-supervised local live session. Do not guess that fake selectors match the actual bank site.
4. In local extraction, whitelist only: total valuation, total P/L, total return rate, and for visible holdings: name, quantity, evaluated value, P/L, return rate, optional currency. Missing/ambiguous values are `null` or produce `SCHEMA_CHANGED`/`PARTIAL`; never silently return false zeros. Do not collect account identifiers, address, personal IDs, account numbers, credentials, cookie/storage, network payload dumps, or screenshots.
5. Save *locally* under ignored `results/samsungpop/snapshots/` in a timestamped JSON file, atomically when possible. No DB yet: simple JSON snapshots are the MVP; later cross-site storage can be designed after S2 works. Include `schema_version`, `source`, ISO capture time, `currency` if determinable, `totals`, `positions` and `capture_status`. Disallow overwrite or accidentally committing results; path derives from project root, not arbitrary model input. Restrict file permissions to the degree practical for the current user context.
6. Pi command responds with bounded fixed local status: `SAVED|PARTIAL|LOGIN_REQUIRED|NOT_ON_BALANCE_PAGE|SCHEMA_CHANGED|BROWSER_UNAVAILABLE|ERROR` and a relative saved-path/status count as appropriate, **no extracted values** by default. Ensure only recognized fields reach local JSON. No raw DOM, errors, stdout, screenshots, URLs, page titles or credential-bearing data in model-facing surfaces.
7. Explicit user command = approval to read/save visible page. No additional repetitive popups required. Show a short warning once in docs/first-use UX that same-user local agent processes are not a hard security boundary; external/cloud-model input requires separate user action.
8. Do not promise a safety property not actually enforced. No extra Windows account, RunAs, ACL provisioning, named-pipe service or financial MCP. No unauthorized website-security bypass or changes to machine settings.

## Suggested minimal changed files (reduce further if existing code suffices)

- MODIFY `pi-dev/extensions/samsungpop.ts` — add collect command to existing slash handler.
- MODIFY `scripts/samsungpop-controller.mjs` — collect dispatch + bounded status/saved-path, lifecycle corrections only where needed.
- ADD `scripts/samsungpop-playwright/collect.mjs` — local page extractor/JSON writer (or equivalent tiny helper).
- ADD `scripts/samsungpop-collect.test.mjs` and a fake fixture only as needed.
- MODIFY `docs/CURRENT_TASK.md` after implementation to report its actual state.

No extra balance extension, no new broker framework, no generic scraping engine, no SQLite or cloud syncing in S2. Keep assistant-first default.

## Safety and acceptance

**OFFLINE / MOCK gate, required before live:**
- Fake account page: correct conversion of formatted KRW amounts, percentages, negative values, zero/empty/missing fields, multi-row holdings, dates.
- `open → status → status` reuse behavior; no deletion of successful session metadata; wrong/unowned CDP endpoint fails closed; active profile not cloned.
- Navigation mismatch, expiry/sign-in screen, selector drift, empty page, tab absence and browser failure return explicit bounded status; no success when nothing was parsed.
- Fake sentinel string resembling account numbers, tokens/passwords, raw DOM/errors must not appear in command output, logs or remote-model-facing tool results; they must not be persisted in snapshot. Use actual production functions in tests, not source-regex-only tests.
- All test data synthetic; no network requests to the real bank, no installed security settings changes, no account orders. Targeted tests only.

**LIVE / USER-SUPERVISED gate:**
- Only after offline gates pass and the user is present to manually log in and display the correct balance page.
- Confirm site origin and that it is the intended user-opened Edge/profile/session before attaching; if uncertain do not read. Do not click account actions or submit forms. If source selectors are unknown, report blocked-by-selector and document a narrow local-only way to validate.
- Collect only the whitelisted visible data, save locally, report masked/count/status output only. No sensitive data sent to GitHub/ChatGPT/Claude/Codex/third-party API.
- If user is not currently present, report `LIVE=NOT_RUN` and finish with mock evidence rather than claiming a live PASS.

Independent verification: Pi (Main) may implement directly or call **local** Codex CLI for the narrow coding changes. Claude Code CLI independently verifies the exact implementation commit SHA only after push; Hermes not required. Don't dispatch multiple workers unnecessarily.

## Handoff/report

Implement/test/commit/push **feature branch only**. No automatic main merge. Freeze task-doc writes while implementer runs; GPT/user review actual SHA and evidence before merge.

Return concise:
`BASE_SHA`, `BRANCH`, `IMPLEMENTATION_SHA`, `SYNC_RESULT`, `PRESERVED_LOCAL_CHANGES`, `CHANGED_FILES`, `MOCK_TESTS`, `LIVE`, `SAVE_PATH_PATTERN`, `DATA_EXPOSURE`, `KNOWN_LIMITATIONS`, `PUSH`.

Stop on local Git conflict or any unforeseen sensitive-data exposure rather than weakening the safety check.


---

## GPT code review — 2026-10-15, implementation `16ae48930d9e4e46d480a3268040c24d95cb90d0`

**Verdict: REWORK REQUIRED.** Remote push/cherry-pick OK; S2 "Read & Save" functional acceptance is NOT met. Review is static GitHub source review; no real banking site or local runtime was accessed. Reported 6/6 tests only establish status/dispatch behavior, not real fixture extraction or JSON persistence.

### Observed code gaps (fix only these; do not reopen full S1)

1. `scripts/samsungpop-playwright/collect.mjs` extracts at most four synthetic top-level fields, then emits `values` over child stdout. **It never writes a JSON snapshot**, never collects positions, P/L or yield and has no successful/partial schema criteria. Its selectors are fake/guessed: not verified against live Samsung POP.
2. `scripts/samsungpop-controller.mjs` calls `sanitizeStatus(parsed)`, dropping `fields` and `values`; `pi-dev/extensions/samsungpop.ts` calls `sanitizeStatus` again and drops them. `formatCollectResult` consequently cannot display data; Pi must instead display **only status, count, relative saved path**, with no amounts/account IDs or raw page values. Sensitive data should not travel by stdout: write the snapshot within the local child, emit bounded metadata only.
3. The field named `ACCOUNT_NUMBER_MASKED` currently retains account digits with punctuation removed. **Delete this field entirely from extraction, output and snapshot.** Account numbers are not required by S2 and masked output is not presently implemented. Explicit fake sentinel tests must prove no account identifiers, credentials or raw page data enter output/saved snapshot.
4. `cmdStatus()` and `cmdCollect()` currently use the default `waitForExit:true`, allowing some success/close/failure paths to remove session files, breaking repeated status/collect. Fix lifecycle in a minimal way; distinguish successful child output vs errors/timeouts. Do not launch/kill unrelated Edge processes or remove user profiles/sessions.
5. The fake-page 6/6 tests never assert actual browser extraction from the fixture or saving correct balances. Replace/add behavioral tests that exercise **production extractor and snapshot writer** with fake DOM (can use real Playwright against local fixture or directly pass a fixture-owned Playwright page to an exported production extractor). Verify parsed totals and multi-row positions, negative values, currency and missing/empty fields, create **two distinct timestamped ignored snapshots** and re-read JSON to check equality/schema. Test no snapshot on selector drift, login-like page, wrong origin and uncertain browser ownership.
6. The current S1 attached browser PID/CDP ownership remains unverified. The same-user model tools also have access to local processes; do **not** misrepresent `triggerTurn:false` or Pi hooks as hard security isolation. For the lightweight user-supervised design, fail closed for ambiguous CDP session/wrong browser, keep all raw results local, and explicitly report remaining exposure. No OS accounts/ACL, new MCP, generalized broker or remote LLM calls. If reliable browser identity cannot be validated with existing code, stop **LIVE=BLOCKED** and report minimal fix.

### Targeted acceptance gates

- Keep exactly the existing `/samsungpop open|status|collect` command family and existing project dependencies; change only relevant S2 source/tests/fake fixture (plus minimal S1 lifecycle fix).
- Structured snapshot: `schema_version`, `source`, `captured_at`, `totals` (valuation, P/L, return rate, cash if truly visible), `positions` (name, quantity, valuation, P/L, return rate), `capture_status`; missing numbers must be null, not fake zero. Use a stable simple JSON format, locally and atomically written under git-ignored `results/samsungpop/snapshots/`. Unique filenames, no overwrite, no credentials/account identifiers. If there are no verified financial fields, **do not save a success snapshot**.
- Pi and controller result shape: enum `SAVED|PARTIAL|LOGIN_REQUIRED|NOT_ON_BALANCE_PAGE|SCHEMA_CHANGED|BROWSER_UNAVAILABLE|ERROR`, plus only relative path, field/position count. No balances in stdout/stderr or model-facing response, no arbitrary output paths from model input.
- Test `open→status→status→collect→status` with synthetic controlled session, including close/error/timeout; don't blindly force a `waitForExit:false` flag without ensuring child completion/error handling.
- Mock success must prove **real extraction + local persistence** and that no fake account-number sentinel leaks. Tests must not reach real Samsung POP or copy/access user browser profile.
- No actual account read or live browser interaction until explicit separate user-attended test. Status by branch: `MOCK=PASS|FAIL`, `LIVE=NOT_RUN|BLOCKED`, `PERSISTENCE=PASS|FAIL`, `OWNERSHIP=VERIFIED|UNKNOWN`.
- After fix: implement/test/commit/push to same S2 feature branch only, no main merge. Use temporary worktree at latest origin S2 tip if the canonical dirty branch diverges; preserve `pi-dev/settings.json`, 3 stashes, local commit `cd04aca`, profiles and ignored files. Absolutely no hard reset or force push.
- Small cost: one implementer (Pi or local Codex CLI) and one independent Claude review after implementation SHA. No extra workers/old test suites without relevant changed code.

Do not state S2 is finished until a local JSON snapshot from actual fixture data is verified.

---

## GPT review — 2026-10-15, rework commit 6f9b0f9 (small final correction)

**Static source verdict: REWORK REQUIRED, LIVE=NOT_RUN.** Remote fast-forward push verified. The new `collect.mjs` includes totals/holdings extraction and direct JSON file write, but source does not substantiate the claimed end-to-end data/persistence verification.

### Must-fix, strictly minimal

1. **Keep returned metadata across both adapters.** `collect.mjs` emits `saved_path`, `totals_count`, `positions_count`, but `scripts/samsungpop-controller.mjs:sanitizeCollect` returns only five enums and drops all three. Add bounded, validated optional metadata there (relative snapshots path only; integers with reasonable limits), and keep the Pi extension formatter metadata-only. Missing session/failed child in collect must return a **collect-shaped ERROR/BROWSER_UNAVAILABLE**, not a status object with undefined `collect_code`. No financial amounts in logs or command results.
2. **Replace old collect tests with real assertions.** `scripts/samsungpop-collect.test.mjs` was not changed in 6f9b0f9 and still asserts obsolete `error_code` and old `ACCOUNT_NUMBER_MASKED`; tracked `scripts/samsungpop-collect.test.mjs.bak` merely duplicates the obsolete test. Remove the tracked `.bak` after ensuring the original test is preserved in Git history, replace original test with fixture-backed tests of the actual production parser and writer, not just command dispatch/no-session. Assert concrete four totals and three positions, positive/negative parsing, nulls, no account-number sentinel, two distinct saved JSON files read back, and metadata through controller→Pi. Do not claim fixture extraction/PERSISTENCE PASS without executing those tests.
3. **Page detection must work with the real site.** `determinePageType()` currently depends solely on English words `balance|holding|account|asset` in URL pathname. This cannot be presumed true of Samsung POP; allow a deliberate user-visible current tab whose page structure has validated financial markers. Do not save on unrelated homepage or random banking page, or attach to another browser. If actual selectors are unknown, mark live `SCHEMA_CHANGED/NOT_ON_BALANCE_PAGE` and stop; first local live validation is user-supervised and no account details go to model.
4. **Snapshot integrity.** `writeSnapshot()` currently writes directly (not atomically) to an ISO millisecond filename (collisions possible); update to unique no-overwrite, temporary-write + atomic rename/replace discipline appropriate for Windows. Log only fixed sanitized error codes. Maintain ignored `results/samsungpop/snapshots`, data schema, no account identifiers, no raw data in model/tool output.
5. **Honest runtime behavior.** `waitForExit:false` avoids session-file deletion but does not by itself prove success/error/timeout semantics. Verify `open→status→status→collect→status` with synthetic session. Existing S1 behavioral source-pattern assertion can be updated *after* behavior is proven; do not mislabel 18/19 as a complete regression pass.

### Scope and reporting

No new architecture, OS accounts, separate MCP, SQL, cloud API, site-wide crawling, trading, login automation, or historical regression marathon. No real bank site access until mock tests prove saved JSON and user is present. Mark `CDP_OWNERSHIP=NOT_VERIFIED` until reliable process/session association is achieved, and do not claim a hard security boundary for same-user processes. Preserve canonical dirty `pi-dev/settings.json`, stash 3, profiles, local `cd04aca`, and the stuck temporary worktree; clean the temporary worktree only after proving no valuable changes and closing its processes.

Do not reset hard or force push. Work on latest remote S2 feature branch, commit/push only this branch. Report `IMPLEMENTATION_SHA`, `RUN_TEST_COMMANDS`, `MOCK_EXTRACT`, `SNAPSHOT_REOPEN`, `CONTROLLER_METADATA`, `SESSION_SEQUENCE`, `LIVE=NOT_RUN`, `PUSH`. Independent Claude review after implementation, then GPT/user main gate.


---

## Execution contract — exact S2 final-fix implementation instructions (2026-10-15)

**Read this section as an executable checklist, not high-level guidance. No improvisation beyond this bounded task.** Current inspected source baseline is `6f9b0f9c127e6e0dde3e1181e2caccb3dc2ba856` and latest documented branch tip before this addendum was `957d8e46cc8606f45970ea9a06afb21d0fc4d711`. Run exactly one implementer. No live bank.

### Phase 0 — Git safety (STOP if failing)

- Run `git -C C:\Agentco status --short --branch`, `git -C C:\Agentco stash list` (metadata only), `git -C C:\Agentco fetch origin`, and read `git rev-parse origin/feature/s2-samsungpop-read-save-20261015`. Confirm the fetched remote contains this execution contract; if head changed unexpectedly and overlaps the task, STOP before writing.
- Never check out over local modified `pi-dev/settings.json`, pop/drop the three stashes, move user browser profiles, or lose the existing local `cd04aca` implementation commit.
- Create a *new, unique* temporary, detached Git worktree from fetched `origin/feature/s2-samsungpop-read-save-20261015`. Do not reuse or blindly remove `C:\agentco-s2-rework`; inspect its Git status and any active processes first. Do not use `reset --hard`, `clean`, `--force` or `--force-with-lease`.
- Do not modify the task specification while implementation is running. Keep all code changes inside the new temporary worktree, and push only a fast-forward to `feature/s2-samsungpop-read-save-20261015` when tests pass.

### Phase 1 — concrete source-code patches

**A. `scripts/samsungpop-controller.mjs`**

1. `sanitizeCollect(raw)` currently returns only `state/browser/site/auth/collect_code`, silently removing `saved_path/totals_count/positions_count`. Validate and allow these *three and only these three* metadata properties when supplied:
   - `saved_path`: repository-relative, must match the expected `results/samsungpop/snapshots/samsungpop-*.json` location, with no `..`, absolute path, escape, newlines or control characters.
   - `totals_count`, `positions_count`: finite nonnegative integer, bounded to sensible maxima. Invalid metadata => safe `ERROR`, not arbitrary echoed text.
   - Do not send `totals`, `positions`, account identifiers, raw DOM or monetary values to stdout/Pi.
2. `cmdCollect` early-return if no session currently produces a status-shaped `error_code`, causing the Pi collect formatter to see `collect_code=undefined`. Ensure all `collect` success/failure paths produce a valid collect-shaped result with one of `SAVED|PARTIAL|LOGIN_REQUIRED|NOT_ON_BALANCE_PAGE|SCHEMA_CHANGED|BROWSER_UNAVAILABLE|ERROR`.
3. Keep `cmdStatus` and `cmdCollect` session metadata intact on successful queries; handle child error, timeout, malformed response and exit without reporting `SAVED` unless child actually completed a snapshot. Do not use the mere `waitForExit:false` setting as proof. Test the sequence repeatedly using a test-owned session.
4. No uncontrolled stdout memory growth or child error detail leakage into model-facing response; cap/parse the single expected JSON result and use sanitized error codes.

**B. `pi-dev/extensions/samsungpop.ts`**

1. `runController('collect')` must normalize *all* paths (including nonzero exit, JSON parse failure and exceptions) into a valid `CollectStatus` with `collect_code=ERROR` or `BROWSER_UNAVAILABLE`, instead of returning a `Status` object missing `collect_code`.
2. `sanitizeCollect` independently validate the same bounded, allowlisted metadata; `formatCollectResult` displays only `collect_code`, relative `saved_path`, `totals_count`, `positions_count`. No currency amounts or holding names in Pi output. Do not touch existing `/samsungpop open` and `status` behavior except a documented needed compatibility fix.
3. Do not claim `triggerTurn:false` or a separate `pi.exec` child establishes OS-level isolation. Preserve normal non-bank browser MCP functionality.

**C. `scripts/samsungpop-playwright/collect.mjs`**

1. Preserve extraction allowlist: totals `total_valuation,total_pl,total_return_rate,cash_balance`; positions `name,quantity,valuation,pl,returnRate`. Never read/store account number, personal identifiers, cookies, localStorage, sessionStorage, credential fields, network response payloads or full DOM.
2. Extract only from one explicitly identified, user-visible balance/holdings page under the approved origin in production; the current English substring pathname check `balance|holding|account|asset` is not sufficient. Fake fixture should be identifiable by *validated financial DOM structure* within a synthetic test setup. Distinguish wrong page vs selector drift; if uncertain, do not save misleading data. Do not guess real Samsung POP selectors are correct.
3. Ensure parsers correctly handle fixture inputs including `52,345,678`, `+2,345,678`, `+4.68%`, `10,000,000`; three rows: Samsung Electronics 50/3,500,000/+250,000/+7.69%, SK Hynix 20/2,800,000/-120,000/-4.11%, NAVER 5/1,200,000/+85,000/+7.62%. Assert corresponding actual fixture names, not English-translated hardcoding: `삼성전자`, `SK하이닉스`, `NAVER`.
4. Missing values become `null`, never accidental zero; no silently skipped malformed rows or falsely perfect `SAVED`. Only `SAVED` if required fields are present/valid; `PARTIAL` only when some valid content genuinely persisted. No snapshot success if no financial fields found.
5. `writeSnapshot` currently writes directly and is not atomic. Implement no-overwrite unique filename (timestamp + random suffix if needed), write a unique temporary file exclusively in the ignored snapshot directory and atomically rename to a unique target where supported, ensuring no existing file is replaced. On error, clean only the temp file from the current operation and emit only bounded failure metadata (no raw exception).
6. A successful snapshot JSON has `schema_version=1`, `source='samsungpop'`, valid `captured_at`, `currency='KRW'` only when evidenced for the captured fields, `totals`, `positions`, and `capture_status`. Relative path fixed under `results/samsungpop/snapshots/`. Verify after save by reopening in mock tests.
7. CDP port + stored token alone does NOT authenticate Edge ownership. Never attach to ambiguous/non-owned sessions or claim ownership VERIFIED; mark `CDP_OWNERSHIP=NOT_VERIFIED` unless a concrete check is implemented and actually tested. No broad security redesign is authorized; if this prevents safe live read, mark live BLOCKED rather than bypass.

**D. `scripts/samsungpop-collect.test.mjs` and fixture**

1. Replace the existing obsolete 6-test checks which inspect status shape and old `ACCOUNT_NUMBER_MASKED` behavior. Do not just rename or duplicate them. Remove tracked `scripts/samsungpop-collect.test.mjs.bak` once verified it adds no unique content (Git preserves history).
2. Use actual exported production parser/writer or a test-owned local Playwright page to load `fixtures/samsungpop-fake-balance.html`. Test *actual* selector extraction, saved JSON and controller/Pi metadata propagation; no mock that re-implements the production parser.
3. Required assertions, all executable:
   - exact four `totals` values: 52345678, 2345678, 4.68, 10000000;
   - exactly 3 positions; the three fixture names, quantities, valuations, signed P/L, and signed rates above;
   - `schema_version`, source, valid time and status, and the saved path existing under ignored snapshot root;
   - two successive collects create **different** paths and both JSON payloads remain readable with their respective values;
   - missing/invalid amount => `null` or explicit `PARTIAL`, *not* silently 0 or `SAVED`;
   - empty/wrong/login-like page and wrong/unowned CDP session never yield `SAVED`;
   - fake identifier sentinel e.g. `S2_ACCOUNT_SENTINEL_987654321` placed outside allowed finance fields does **not** appear in snapshot, stdout, logs or Pi message;
   - `open → status → status → collect → status` retains test session, and timeout/error return defined error result, never undefined `collect_code`;
   - controller and Pi do not expose raw holdings/totals; only bounded metadata.
4. If actual browser-based mock E2E is unavailable on the Windows machine, say `MOCK_E2E=NOT_RUN` and explain why. Do **not** relabel a unit test as full E2E success.
5. Run only relevant updated S2 tests and targeted S1 status/collect tests. The existing 18/19 S1 behavior suite contains a static/source-string failure; report it separately, do not hide, spoof, or overfocus on it.

### Phase 2 — completion gates and Git delivery

- Before commit, prove `MOCK_EXTRACT=PASS`, `SNAPSHOT_REOPEN=PASS`, `METADATA_END_TO_END=PASS`, `SESSION_SEQUENCE=PASS`, `NO_ACCOUNT_SENTINEL_LEAK=PASS`; otherwise report FAIL/NOT_RUN and STOP, no claim of S2 completion.
- `LIVE=NOT_RUN`. Do not launch Samsung POP, ask for bank login, inspect actual balances, order/trade, install Windows accounts, modify Windows permissions/MCP or call cloud APIs with finance data.
- `git diff --check`; inspect changed filenames. No profile/auth/settings/stash modification. Commit/push **only** code/tests/fixture narrowly required, against current S2 feature remote fast-forward. If remote changed during work, STOP and reconcile without force.
- Cleanup temporary worktree only if clean, no running process, and all code pushed; if cleanup hits permission error, preserve it and report, do not delete blindly.
- Report exactly: `BASE_REMOTE_SHA`, `IMPLEMENTATION_SHA`, `CHANGED_FILES`, `TEST_COMMANDS_AND_RESULTS`, `MOCK_EXTRACT`, `SNAPSHOT_REOPEN`, `METADATA_END_TO_END`, `SESSION_SEQUENCE`, `NO_ACCOUNT_SENTINEL_LEAK`, `LIVE`, `CDP_OWNERSHIP`, `PUSH`, `LOCAL_CHANGES_PRESERVED`, `STASH_COUNT`, `WORKTREE_CLEANUP`, `BLOCKERS`.
- Independent Claude Code CLI review of pushed SHA is a **separate** phase; Pi should not self-award PASS or merge main.


---

## GPT independent static review — implementation `4e65ec51afb4250a5a070038a85c8c1c2a19712d` (2026-10-15)

**Decision: CONDITIONAL / QA BLOCKED, not full S2 PASS.** Repo HEAD independently confirmed. Eight reported mock tests include actual Playwright fixture extraction and direct JSON readback; this is meaningful progress, but **not** Controller→Pi end-to-end, and one test has potentially destructive cleanup. The assistant did not run tests or access the live finance site.

### Stop-the-line issue — user snapshots can be deleted by tests

`scripts/samsungpop-collect.test.mjs`:
- `before()` sets `snapshotDir=resolve(root,'results','samsungpop','snapshots')`;
- `after()` loops over **every** file named `samsungpop-*.json` and `rmSync` deletes it.
- Real user snapshots under the ignored local results directory would be deleted. **Do not run this test again in a workspace containing user snapshots** until this is corrected.

**Required fix:** Run snapshot tests in a *unique temporary fixture-only directory*, separate from live `results/samsungpop/snapshots`; ensure writer has a test-only dependency-injection mechanism or pure output-root parameter that the live `/samsungpop collect` command cannot set. Cleanup may remove **only files created by this test** in the isolated directory; `rm -rf` of the real snapshots tree or wildcard deletion is forbidden. Add canary test: create an unrelated pre-existing snapshot sentinel in a second directory, run writer/tests and verify canary content untouched. Do not delete or overwrite existing user snapshots. Preserve local worktrees, stashes and browser profiles.

### Required minimal corrections (same files; no architectural expansion)

1. **Complete collect-shape error paths.** `scripts/samsungpop-controller.mjs`: `cmdCollect()` with no CDP session, child error/timeout/invalid stdout and controller top-level failure currently return `sanitizeStatus` (no `collect_code`). `pi-dev/extensions/samsungpop.ts:runController` nonzero exit and parse failure likewise return status. Make all collect invocations return `collect_code=BROWSER_UNAVAILABLE|ERROR` (appropriate status enums), not a blank/undefined result. Add tests for no session, timeout, nonzero exit, malformed JSON, and successful collect. Do not alter S1 open/status semantics.
2. **Do not emit raw stderr in normal operation.** Controller now captures child stderr and executes `console.error('DEBUG: Child stderr:', d.toString().trim())`. Remove verbatim stderr logging and unbounded stdout/stderr accumulation. Catch and return fixed codes (no raw page URLs, HTML, account values or secrets in command output/logs). Child `writeSnapshot` also logs raw `err.message`; replace with fixed error code. Test with synthetic `SECRET_SENTINEL` in subprocess stderr and prove it is absent from output.
3. **Strict bounded metadata path.** `sanitizeCollect` in controller and `sanitize` in collector currently only use `saved_path.startsWith('results/samsungpop/snapshots/')`; that admits traversal-like strings and newline characters. Validate the entire expected basename/suffix pattern; reject `..`, backslash, control characters, absolute paths, suspicious encodings and anything outside the intended relative directory. Match Pi formatter sanitization to the same contract; count fields integer and bounded.
4. **No fake complete integration PASS.** Eight mock tests call exported `extractTotals`, `extractHoldings` and `writeSnapshot` directly. The single controller test checks exported functions only, not actual controller→child→Pi command. Add one **synthetic end-to-end mock using the actual production command handlers** (with test-owned browser/session/profile, zero real-bank network access), verifying `collect_code`, saved relative path and counts reach the user-facing Pi output. If Pi hosting is infeasible, separately report `PI_UI_E2E=NOT_RUN`; at minimum run real controller→child end-to-end and explain limitations. Explicitly cover `open→status→status→collect→status` semantics and do not report it PASS merely from unit tests.
5. **Browser/read guard (targeted only).** Current `determinePageType` accepts any page whose body contains broad words like `수량` or `수익률`; this is not evidence that a specific intended visible balance page is selected. Limit recognition to an actual combination of financial fields/holding table rather than a single generic word. When current page is ambiguous, return `NOT_ON_BALANCE_PAGE|SCHEMA_CHANGED` without saving. All real Samsung POP selectors remain unverified and live data collection is still NOT_RUN.
6. **No new platform/security work.** The user deliberately chose a lightweight read/save assistant. Do NOT add Windows accounts, ACL provisioning, broker service, separate finance MCP, SQLite, order/trade features or external LLM transmission. Continue to record `CDP_OWNERSHIP=NOT_VERIFIED` accurately and fail closed if browser identity is ambiguous. Future live selector validation requires manual user login and visible confirmation, NOT unsupervised browser access.
7. **Other minor:** Verify snapshot no-overwrite semantics with an existing target file (platform-specific `rename` may replace destination); clean only the temporary file created by failed writes. Avoid unnecessary refactoring or repeatedly reading S1 history.

### Required acceptance matrix

- `TEST_ISOLATION=PASS`: test-created files only; existing real snapshot/canary preserved.
- `MOCK_EXTRACTION=PASS`: 4 totals + 3 actual fixture positions, signed amounts/rates verified.
- `PERSISTENCE=PASS`: two unique local test files, re-read exact data, no overwrite, null/partial cases.
- `CONTROLLER_CHILD_E2E=PASS`: real production controller dispatch receives collect status and bounded metadata from synthetic test-owned session.
- `PI_UI_E2E=PASS|NOT_RUN`: don't confuse schema unit test with UI run.
- `FAILURE_PATHS=PASS`: no session, timeout, malformed payload, process exit always collect-shaped.
- `NO_RAW_LOGS=PASS`: synthetic account/token sentinel not in stderr/stdout/command display/results.
- `SESSION_SEQUENCE=PASS|NOT_RUN`: real sequence evidence, not source comments.
- `LIVE=NOT_RUN`, `CDP_OWNERSHIP=NOT_VERIFIED`.

**Git and roles:** Fetch latest remote S2 branch; do changes in a fresh temporary worktree because canonical workspace is dirty and divergent. Do not use `reset --hard`, `git clean`, force push, `stash pop/drop`, or delete old worktrees blindly. One Pi/Codex implementer only; implement, run focused tests, push fast-forward to S2 feature branch. Then Claude Code CLI must independently check pushed SHA and return PASS/REWORK with exact observed tests. GPT+user decide merge to main. No live financial data until then.

### Exact delivery report

`FINAL_SHA`
`BASE_REMOTE_SHA`
`CHANGED_FILES`
`TEST_COMMANDS`
`TEST_ISOLATION`
`MOCK_EXTRACTION`
`PERSISTENCE`
`CONTROLLER_CHILD_E2E`
`PI_UI_E2E`
`FAILURE_PATHS`
`NO_RAW_LOGS`
`SESSION_SEQUENCE`
`LIVE`
`CDP_OWNERSHIP`
`PUSH`
`PRESERVED_LOCAL_STATE`
`WORKTREE_CLEANUP`
`BLOCKERS`

Stop if a test attempts to access/delete real snapshot files, or if the implementation cannot produce truthful integration evidence. Do not claim overall PASS on partial green unit tests.


---

## GPT HARD STOP review — `21c2152a90aded31d14239cc3f652c6768eed428` (2026-10-16)

**Status: QA FAIL / DO NOT RUN THE CURRENT TESTS IN THE USER'S CANONICAL WORKSPACE / NO LIVE TEST.** GitHub remote branch SHA confirmed. This supersedes previous "final" PASS claims. The following issues were confirmed by direct inspection of that exact commit, not inferred from logs. A passing `node:test` count does not establish production readiness.

### Concrete blockers, ordered by risk

**BLOCKER 1 — mock snapshots still write into production output tree.**
- In `scripts/samsungpop-playwright/collect.mjs`, top-level `const SNAPSHOT_DIR = resolve(root,'results','samsungpop','snapshots')` is constant and **does not consult** `process.env.SNAPSHOT_DIR` or a test argument.
- In `scripts/samsungpop-collect.test.mjs`, tests set `process.env.SNAPSHOT_DIR = testSnapshotDir`, import `writeSnapshot` again, and assume it redirects the output. It does NOT. Even `writeSnapshot(snapshot)` used by direct tests writes to the real `results/.../snapshots` location of the checked-out worktree.
- Its canary is stored in another independent temp directory and is never at risk, so canary PASS is meaningless evidence that real snapshot files were isolated. Old wildcard cleanup was removed, but synthetic JSON **pollution** and accidental modification risks remain.
- **Do not rerun 14 current S2 tests before fixing writer injection.** Inspect existing `results/samsungpop/snapshots` metadata for synthetic contamination without reading/printing actual financial values or deleting anything automatically. If synthetic and real data cannot be distinguished, report and preserve all files.

**Fix contract:** `writeSnapshot(data, options?)` takes an optional output directory *only when directly invoked by tests*. Production `main()` always calls its unoverridden default; no CLI, model/user-supplied path or exposed argument for the production command. Tests call `writeSnapshot(snapshot, { outputDir: testSnapshotDir })` (or equivalent tightly scoped injected dependency), and re-read the **actual absolute returned test file** under `testSnapshotDir`. At test end, delete only the uniquely created temporary test tree; do not touch `root/results`. Assert `relative(resolve(testSnapshotDir, filename), testSnapshotDir)`/realpath containment appropriately. Check that the production snapshot tree's filenames/count and an existing canary file in that tree remain unchanged across the mock test (metadata only; avoid real file contents).

**BLOCKER 2 — `writeSnapshot` can unlink an existing destination.**
- When `renameSync(tempPath, filepath)` fails, the fallback calls `unlinkSync(filepath)` before retrying rename. This can delete an unrelated preexisting snapshot on any rename failure. The random suffix is not a correctness proof.
- Use collision-safe **no-clobber** finalization, ideally a unique temporary file and atomic same-volume `linkSync(tempPath, newFinalPath)` then unlink **only your own temporary file**, or a proven Windows-appropriate exclusive-create alternative. On `EEXIST`, choose a new filename; on unsupported finalization fail without touching preexisting files. Never unlink a final destination. Use `crypto.randomUUID()`/randomBytes rather than Math.random if convenient. A test must precreate a target collision and assert its exact original bytes preserved. No silent partial writes or falsely returning SAVED.

**BLOCKER 3 — purported offline session E2E can open real Samsung POP.**
- Controller sets `const SAMSUNGPOP_ORIGIN='https://www.samsungpop.com/'`, then child environment always overrides `SAMSUNGPOP_ORIGIN` with that constant (after `...process.env`).
- Test helper supplies a fake `SAMSUNGPOP_ORIGIN` pointing to a `file://` fixture, but controller discards it. `cmdOpen()` launches Edge using `scripts/samsungpop-playwright/open.mjs`, which passes ORIGIN to Edge and calls `page.goto(ORIGIN)`. Therefore the test's `open→status→...` may contact the *real* Samsung POP home page, contrary to "no real bank website" report.
- Disable old session/open E2E tests until a **test-only bank-like local fixture** is actually used end-to-end and assert no page/tab navigates to `samsungpop.com`. Never use the real bank profile. A test-only origin override must be narrowly gated to synthetic fixture with a disposable test profile, and must not weaken production origin checks. If true offline full sequence cannot be proven, report `SEQUENCE=NOT_RUN` and rely on the previously user-observed S1 functional open/status evidence instead of claiming a false PASS.

### Additional bounded issues (only fix where needed by S2 acceptance)

4. `pi-dev/extensions/samsungpop.ts:runController` still returns **status-shaped** `sanitizeStatus` for collect command when `pi.exec` exits nonzero or JSON parsing fails; `formatCollectResult` then receives undefined `collect_code`. Add branch-specific error normalization and tests for the Pi handler through a thin injected/host stub, or report `PI_UI_E2E=NOT_RUN`. Never leak raw values.
5. `scripts/samsungpop-controller.mjs` stores child `stdout` and `stderr` in unbounded in-memory buffers (verbatim stderr no longer echoed); cap both, discard/abort excess, return fixed error enum. No logging of raw child exceptions. Do not change supported `/samsungpop open|status` UI beyond genuine necessary compatibility.
6. Real Samsung POP selectors have never been validated and generic table marker detection is not a verified live account page. A mock passing does NOT mean live readiness. No live bank session access, screenshots, account data inspection or real click automation in this patch; do not add a financial broker/Windows account or bank MCP.

### Concrete acceptance tests (run in disposable worktree only AFTER fixes)

- `WRITER_ISOLATION`: before/after production results directory entries unchanged; all synthetic snapshots are written to the test-owned directory and validated there. It must be impossible for test `writeSnapshot` to silently fall back to production directory.
- `NO_CLOBBER`: pre-existing final file byte-for-byte unchanged under forced filename collision and simulated rename/finalization failure. Failed write returns null/ERROR, no SAVE status.
- `OFFLINE_NO_BANK_NETWORK`: fake origin stays local for entire test; even `open` never navigates to `https://www.samsungpop.com/`. If not reliably enforceable, omit open E2E, mark `SEQUENCE=NOT_RUN`.
- `PARSER_FIXTURE`: exact 4 totals, signed amounts, 3 holdings and null-missing cases from real production extractor over fake page.
- `METADATA`: controller child status/path/count survive sanitizers, and Pi collect command error path always has `collect_code`.
- `NO_RAW`: no synthetic credential/account sentinel in stdout/stderr/Pi output or local snapshots.
- `S1_REGRESSION`: only targeted basic open/status where safe, no full history marathon.
- `LIVE=NOT_RUN`, `CDP_OWNERSHIP=NOT_VERIFIED` until separate user-attended live validation.

**Git/roles:** `origin/feature/s2-samsungpop-read-save-20261015` at commit `21c2152...` was verified before this review was appended. The branch SHA after this addendum is different; fetch it first. Work in a fresh disposable Git worktree; preserve canonical dirty `pi-dev/settings.json`, 3 stashes, local `cd04aca`, profiles, any existing snapshots and previous worktrees. NEVER `reset --hard`, `clean`, `--force`, stash pop/drop, delete unknown snapshots, or merge main. Only one Pi/Codex implementer, with a separately assigned independent Claude review at resulting SHA. If any blocker isn't testable, STOP and report not verified rather than self-certify.

**Report exactly:** `NEW_SHA`, `CHANGED_FILES`, `WRITER_ISOLATION`, `NO_CLOBBER`, `OFFLINE_NO_BANK_NETWORK`, `PARSER_FIXTURE`, `METADATA`, `PI_UI_E2E`, `NO_RAW`, `SEQUENCE`, `LIVE=NOT_RUN`, `CDP_OWNERSHIP=NOT_VERIFIED`, `PUSH`, `PRESERVED`, `BLOCKERS`. Report the actual test command and use PASS/FAIL/NOT_RUN, not narrative assertions.
