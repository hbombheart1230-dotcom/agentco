# Agentco — CURRENT_TASK (2026-10-15)

**State: S2 REWORK REQUIRED (reviewed 6f9b0f9, 2026-10-15).** Collector now has JSON snapshot and holdings source code; remote push confirmed, but controller loses saved-path/count metadata, 6/6 tests are the unchanged obsolete dispatch/no-session tests, and live DOM matching is unverified. Read the latest **GPT review — 2026-10-15, rework commit 6f9b0f9** at the bottom of `docs/work-orders/S2_SAMSUNGPOP_READ_SAVE.md`. No live finance account access yet.

## Assistant-first default
A greeting, general conversation or personal-assistant query is NOT permission to inspect Git, start workers or access financial data. Enter development mode only for an explicitly requested task. Follow root `AGENTS.md`. Personal repo: `hbombheart1230-dotcom/agentco`; canonical Windows workspace: `C:\Agentco`. Personal Agentco is separate from Samsung Display and Agentra.

## Current development task (READ ONLY THESE FIRST)
- Work order: `docs/work-orders/S2_SAMSUNGPOP_READ_SAVE.md`.
- Assigned branch: `feature/s2-samsungpop-read-save-20261015`, based on authoritative `origin/main` at `0a6e8bdb956da188845aededbd6347abe1578751`.
- Intent: fix `/samsungpop collect` to read visible balance/holdings data, save timestamped local JSON under ignored `results/samsungpop/snapshots/`, and return only status/path by default. Reuse S1 browser and Pi Extension. This is the first example of a future cross-site read/save assistant (hotel/air/shops later, **not now**).
- Explicitly lightweight: no new Windows user, finance MCP, generalized broker platform, SQLite, 3-Worker orchestration, auto login or transactions. Current same-Windows-user approach is **not hard OS isolation**; do not claim otherwise. No credentials/cookies/identifiers collected or raw financial data sent to cloud LLM automatically.
- Current authority: GPT writes design/work order; Pi local Main implements; optional local Codex implements if Pi delegates; Claude independently verifies exact pushed code SHA; GPT/user gate merge.

## Local sync FIRST — preserve user changes
Last local inventory: `feature/s1-samsungpop-readonly-20261014` @ `3395c3910b94b54d51bed6c3d818825b4f78859a`; dirty `pi-dev/settings.json`; **3 stashes** (p5-10, p2, main). Remote `main` currently `0a6e8bdb956da188845aededbd6347abe1578751`. GitHub creation of S2 feature branch does not update `C:\Agentco`.
- Fetch; inspect local main and diff before switching; protect dirty/untracked/ignored work/settings/three stashes/profile; use only safe fast-forward branch updates.
- No `reset --hard`, `git clean`, force switch, blind pull, stash pop/drop, profile/auth reads, or overwrites. If switching unsafe, STOP and report, do not code in old branch.
- After safe sync, switch to fetched `origin/feature/s2-samsungpop-read-save-20261015`, read the linked S2 work order and only source files it identifies. Existing completed S1 work order/history and full smoke suite are not required.

## Accepted prior milestones (do not re-open)
- P0/P1, P2, P5.1–P5.10 live in main; broad Pi→3-Worker automation is not a verified production feature.
- S1: `/samsungpop open` and `status`, manual Edge login, status `auth=UNKNOWN`; user-supervised functional smoke PASS, no finance reads. Merged via PR #3, baseline feature SHA `3395c3910b94b54d51bed6c3d818825b4f78859a`. No need to re-test S1 except targeted S2 integration regressions.
- Branch consolidation log `docs/BRANCH_CONSOLIDATION_20261015.md`. No remote branch deletion.

## Context budget
Read `CURRENT_TASK.md` + active S2 work order and only changed components it names; skip old S1 review histories, repeated full tests, redundant worker calls. When implemented, update task state based on evidence; report mock vs live separately.
## Immediate rework handoff
- First read the appended GPT review in `docs/work-orders/S2_SAMSUNGPOP_READ_SAVE.md` (commit `ddd9831`); fix collector→JSON writer, lost result fields, unmasked account digits, and session close handling, with real fake-fixture extraction/persistence tests.
- Use feature S2 branch current remote HEAD, never force push or reset the user's divergent dirty local branch. A temporary worktree is preferred. Preserve settings, all stashes, existing profile/auth and local `cd04aca` commit.
- Implement/test/commit/push ONLY the S2 feature branch; no actual finance site, no auto login/trading. Then independently review new SHA.

## Next exact action (no old history)
- Source-of-truth remote S2 feature branch; newly appended task review commit `504802b`. Preserve current local `settings.json`, all 3 stashes, banking profile, divergent local implementation commit, and inspect retained temporary worktree before removal.
- One implementer fixes collect metadata loss, collect-shaped error, replaces obsolete tests with actual fixture parse→save→readback and two snapshots, page detection, small atomic file write. Then focused tests, commit/push this branch only; no main merge and no actual bank browsing.
- On passing mocks, run independent reviewer once, then plan first user-supervised live validation separately. Do not claim Windows account/ACL or MCP isolation; those are not approved work in this lightweight scope.
