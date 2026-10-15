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
