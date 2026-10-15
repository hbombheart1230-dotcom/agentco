# Agentco S2 — Claude-verified final corrective patch

**Date:** 2026-10-16
**Status:** IMPLEMENTATION AUTHORIZED FOR THIS EXACT SCOPE ONLY; NOT FULL S2 PASS.
**Repo:** hbombheart1230-dotcom/agentco (personal Agentco, not Samsung Display Cowork CLI / Agentra)
**Source code reviewed:** `e4817d52cfb07d051d539ea11582cbda309dbe1b` — frozen target of independent Claude read-only review.
**Remote branch:** `feature/s2-samsungpop-read-save-20261015`; fetch its **current** SHA before work. Docs added after source SHA, so source SHA is **not** the current branch head.
**Workspace:** `C:\Agentco` (dirty, never overwrite).
**Result desired:** a single implementation SHA containing the following narrowly scoped fixes, mock evidence, then separate independent verification. NO live bank, NO merge main.

## Why this patch — independently reproduced failures

Claude independently verified the exact e4817d5 snapshot on a *separate extracted copy*, and reported:
- Real fixture totals/3 holdings + production Controller→Child **success** = PASS.
- `writeSnapshot` `renameSync(tempPath, filepath)` replaced an existing final `.json` when filename collision was deliberately forced on Windows/NTFS = FAIL, original bytes changed. It is NOT `O_EXCL`.
- `unlinkSync` used but not imported; rename failure leaks `.tmp`.
- `collect.mjs` calls `main()` **unconditionally during import**; imported module prints error JSON, sets `process.exitCode=1`, causing node test *file-level* FAIL despite 8 inner assertions passing. It might attach CDP on import.
- Controller→Child `SAVED` E2E test writes into default production snapshots tree (test's `SNAPSHOT_DIR` env does nothing to `main()->writeSnapshot(snapshot)`). Canary was in unrelated temp dir; no real snapshot isolation proof.
- Controller timer returns status-shaped error, though current child abort event frequently masks it by resolving collect-shaped error first (fragile).
- Pi Extension independently validates too little metadata; collect errors are normalized but path and counts not consistently constrained.

**STOP:** Do not execute the existing full `scripts/samsungpop-collect.test.mjs` or old S2 sequence tests on `C:\Agentco` before isolating the writer. Do not delete or change existing `results/samsungpop/snapshots` files, even if some look like synthetic test data.

## 0. Git safe-start

0.1. In `C:\Agentco`, inspect only `git status --short --branch`, `git stash list` metadata, `git worktree list --porcelain`; do not inspect credential/profile contents. `git fetch origin`; record `git rev-parse origin/feature/s2-samsungpop-read-save-20261015`.
0.2. Preserve: existing dirty `pi-dev/settings.json`, three stashes, banking profile/cookies, existing ignored result JSON, old local `cd04aca` and previous temp worktrees. Do not claim local SHA equal to remote; do not rebase canonical dirty workspace.
0.3. Create a **new unique detached temp worktree** from the remote S2 head; confirm its `HEAD`. One implementing agent is the only writer; no concurrent worktree/Git changes.
0.4. Read **this file only**, plus the 4 source files enumerated below and the fake fixture (for selector inputs). Do not revisit S1 history or the long preceding S2 work order.
0.5. Forbidden: `reset --hard`, `git clean`, `git stash pop/drop`, `--force`/`--force-with-lease`, checkout over dirty settings, any main merge, actual Samsung POP browsing, browser-profile cloning, broad agents/security architecture.

## 1. Exact files and edits

### File A — `scripts/samsungpop-playwright/collect.mjs`

A1. **No-clobber write:** `writeSnapshot(data, outputDir = DEFAULT_SNAPSHOT_DIR)`. Fix `renameSync()` = non-exclusive publication. Create a **unique exclusive temporary file in outputDir** (`flag:'wx'` or equivalent) and publish **without replacing existing destination**. Prefer `linkSync(temporaryFile, finalFile)` on NTFS/same-volume file system, which raises `EEXIST` rather than overwriting; unlink *only this call's temporary file* after successful linking. If filesystem does not support safe publication, fail closed (return null/fixed ERROR); do not fall back to non-exclusive rename or remove an existing final file. Import `linkSync` and `unlinkSync` explicitly. Do not treat `Math.random`+timestamp as uniqueness proof; use `randomUUID`/`randomBytes` for names where appropriate. The only acceptable cleanup target is the exact known temporary path from that invocation. No wildcard unlink, no delete of final path, no writes outside outputDir. Test on Windows/NTFS behavior, not just comments. Snapshot content remains the existing `schema_version/source/captured_at/currency/totals/positions/capture_status` schema.
A2. **Import safe:** Replace unconditional terminal `main();` with an entrypoint guard like Controller's `if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();`. `import('./collect.mjs')` must produce **zero stdout/stderr, zero CDP connection attempts, process.exitCode untouched**, and no real snapshot file.
A3. **Synthetic E2E output-dir path:** Production main MUST always save only to project `results/samsungpop/snapshots`. Allow E2E to redirect only when a test-specific env (e.g. `SAMSUNGPOP_TEST_SNAPSHOT_DIR`) is set **and** synthetic test mode is explicitly validated (disposable profile, fixture `file://` origin pointing to the tracked `fixtures/samsungpop-fake-balance.html`, and a test-owned temp output dir). Do NOT allow arbitrary production `SNAPSHOT_DIR` override or a model-facing configurable path; don't change regular `/samsungpop collect` UX. If a strict test-only origin/session gate cannot be achieved, make a pure injectable `runCollect({page, snapshotDir})` for test and report full child E2E NOT_RUN; never test against production output tree.
A4. Keep whitelisted only 4 totals and 5 fields per position, nulls for truly missing data, raw credentials/cookies/URLs not returned. Current selectors based on fake fixture are not proven against real site. Do not touch actual account.

### File B — `scripts/samsungpop-controller.mjs`

B1. Timeout branch in `runPlaywrightScript`: when `scriptName==='collect'`, always resolve `sanitizeCollect({collect_code:ERROR})`, *independent* of `AbortController.abort()` event ordering. All exits (no session, child error, malformed JSON, timeout, nonzero exit) must yield collect-shaped enum; no raw values/stderr.
B2. Only for **strict test-owned local fixture session**, child env may include test-only output-dir signal from A3. Confirm production default origin stays `https://www.samsungpop.com/` and production output path cannot be changed by ordinary user/model request. Preserve `open|status` existing logic.
B3. Don't let child stdout/stderr accumulate without limit. Set a bounded maximum, abort/return enum on overflow; do not echo raw stderr or balance values. Avoid race/double-resolve in timeout/close/error. This is a small local correction, not a new process manager.

### File C — `pi-dev/extensions/samsungpop.ts`

C1. Maintain existing `open|status|collect` commands, with collect never returning missing `collect_code`.
C2. In Extension `sanitizeCollect`, duplicate the Controller/Child **strict** relative path validation (match `results/samsungpop/snapshots/samsungpop-[A-Za-z0-9_-]+.json`; block traversal, control chars, absolute paths) and integer count bounds 0..10, 0..100. Bad values must be discarded, not echoed. Format only status, saved relative path, two counts. Do not show holdings values, account identifiers or data in `pi.sendMessage`.
C3. Do not claim this offers hard Windows-process isolation. No other extension/MCP changes.

### File D — `scripts/samsungpop-collect.test.mjs`

D1. Correctly test `import` isolation: spawn clean Node importer with no BANKING_* env; verify exit code 0, stdout/stderr empty and no created snapshots. Assert import does not launch network/browser.
D2. Fixture parser tests: retain exact expected 4 totals = `52345678,2345678,4.68,10000000`; 3 positions: `삼성전자` quantity50 valuation3500000 pl250000 rate7.69; `SK하이닉스` quantity20 valuation2800000 pl-120000 rate-4.11; `NAVER` quantity5 valuation1200000 pl85000 rate7.62.
D3. Snapshot tests **must** call actual production `writeSnapshot(data, testSnapshotDir)` with OS temp directory and confirm absolute location containment. Before and after, assert the real `results/samsungpop/snapshots` directory's filenames and size metadata unchanged; never read or delete user JSON contents. Existing canary must be placed **in the same test-owned write target** and preexisting contents checked after test.
D4. Deterministic collision probe: force the exact final filename to an existing file without altering production data; assert `writeSnapshot` returned failure/null, existing target bytes unchanged, own temp removed. Also force failed publish (e.g. failure to link) and check no final-file damage. Do not fake collision using two random filenames.
D5. **True Controller→Child SAVED** with disposable headless Chromium + fixture (or test-scoped Edge only if needed), synthetic profile/session, fixture origin, and **test-only outputDir successfully passed into child**. Assert `collect_code==='SAVED'`, `totals_count===4`, `positions_count===3`, and the actual JSON at temp target contains exact fields/values. Do not accept `SCHEMA_CHANGED`, `NOT_ON_BALANCE_PAGE` or any `PARTIAL` as success. Never launch a live bank tab or use user profile. If full open sequence requires running Edge and cannot be guaranteed bank-host-safe, skip sequence with `SESSION_SEQUENCE=NOT_RUN` instead of false PASS.
D6. Failure paths: no session, malformed stdout, nonzero, timeout always collect-shaped. For real timeout, inject a synthetic hung child with a shortened test-only timer (no 60s wait necessary) **without** weakening production timeout; assert no undefined `collect_code`.
D7. File-level test runner exit status matters. Report command and whole-process `exit code == 0` in addition to inner N/N. Run `node --test scripts/samsungpop-collect.test.mjs` only after A1/A2/A3 and D3 corrected. Never claim N/N PASS while test process exits 1.
D8. Test `SAMSUNGPOP_ORIGIN` fixture **effective origin** end to end: verify it is the intended fixture and that no `samsungpop.com` navigation occurs. Do not label general network-offline PASS without a network trace; distinguish `BANK_HOST_CONTACT=NONE_VERIFIED` from `GENERAL_NETWORK_OFFLINE=NOT_VERIFIED`.
D9. Use `await rm(..., {recursive:true,force:true})` for test-owned temp dirs after each suite. No unlink/wildcards in real results. Preserve `scripts/samsungpop-collect.test.mjs` history; no extra .bak.

## 2. Required gates: all of these are separately reported

| Gate | Required observed proof |
|---|---|
| IMPORT_CLEAN | Module imported without stdout, CDP, process.exitCode and Node test file exits 0 |
| NO_CLOBBER | Forced name collision: preexisting final bytes identical; returned error, no temp leftovers |
| WRITER_ISOLATION | 100% synthetic JSON in test-only dir, production result directory metadata unchanged |
| MOCK_PARSER | 4 exact totals, 3 exact holdings and signed values |
| CONTROLLER_CHILD_SAVED | Real production Controller→Child returns SAVED, counts 4/3, stored JSON correct |
| COLLECT_TIMEOUT_SHAPE | Forced synthetic timeout returns collect_code, no status-only response |
| PI_METADATA | Strict path/count filtering; Pi UI host full E2E if available, otherwise NOT_RUN |
| OFFLINE_BANK_HOST | Confirm fixture origin, zero verified real-bank navigation; general background traffic separate |
| SNAPSHOT_CANARY | Existing sentinel in test-owned write dir unchanged |
| SESSION_SEQUENCE | PASS only for real successful synthetic open/status/status/collect/status; otherwise NOT_RUN |
| S1_BEHAVIORAL | Existing 18/19 known static check separate, no sweeping false PASS |
| LIVE | NOT_RUN |
| CDP_OWNERSHIP | NOT_VERIFIED |

**Always report PASS/FAIL/NOT_RUN; not executed != PASS.**

## 3. Git & delivery rules

- Do not touch actual Samsung POP or credentials; no account/order/transfer, no Windows new user/ACL, finance MCP, broker platform, SQLite, cloud transmissions or historical replay.
- Before commit: inspect only changed source/test filenames, `git diff --check`, no real snapshots modified, no newly staged data or credentials.
- Commit/push to remote **S2 feature branch only**, use fast-forward only after checking latest remote tip. If tip moved, STOP to reconcile; never force.
- If any failure gate, do not claim S2 complete; report blocker and stop further feature work. No broad refactoring.
- Clean temporary worktree **only after** clean/committed and pushed, with no active child processes; do not remove prior unknown worktree folders.
- No automatic main merge. Request a single separate Claude independent verification at new implementation SHA after push; GPT+user final PASS gate.

## 4. Required compact final report

`BASE_REMOTE_SHA`
`FINAL_SHA`
`CHANGED_FILES`
`RUN_TEST_COMMAND_AND_EXIT_CODE`
`IMPORT_CLEAN`
`NO_CLOBBER`
`WRITER_ISOLATION`
`SNAPSHOT_CANARY`
`MOCK_PARSER`
`CONTROLLER_CHILD_SAVED`
`COLLECT_TIMEOUT_SHAPE`
`PI_METADATA`
`PI_UI_E2E`
`OFFLINE_BANK_HOST`
`GENERAL_NETWORK_OFFLINE`
`SESSION_SEQUENCE`
`S1_BEHAVIORAL`
`LIVE`
`CDP_OWNERSHIP`
`PUSH_RESULT`
`PRESERVED_LOCAL_SETTINGS_AND_STASHES`
`WORKTREE_CLEANUP`
`BLOCKERS`

**Most important:** original snapshots unchanged, no-clobber collision reproduced as failure, mock actual SAVED E2E, whole-test-process exit 0.
