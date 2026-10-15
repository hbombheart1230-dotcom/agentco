# Agentco — CURRENT_TASK (2026-10-16)

**Status: S2 final corrective patch REQUIRED. Independent Claude verification of code SHA `e4817d52cfb07d051d539ea11582cbda309dbe1b` = REWORK.**

## Only read this first

`docs/work-orders/S2_CLAUDE_VERIFIED_FINAL_REWORK.md`

This standalone work order specifies **exact files/functions, synthetic inputs and expected outputs, real process exit requirements, no-clobber tests, off-line E2E, and Git safeguards.** Follow it verbatim; do **not** reread old S1 history or earlier huge S2 work orders. The original reviewed source commit `e4817d5` remains ancestor of current origin S2 branch; remote HEAD will be newer because task docs were committed after source code. Fetch and base new worktree on the **latest remote S2 feature HEAD**, not the old app-code SHA.

## Decision and rules

- Personal Agentco only, repo `hbombheart1230-dotcom/agentco`, canonical workspace `C:\Agentco`, origin authoritative.
- Main = Hermes/Pi as configured locally; single implementation worker (optional local Codex), Claude independently verifies once after push. Avoid multiple workers, redundant full tests and credit-heavy backreading.
- Product scope: **user-supervised Samsung POP Read → Save as a thin model for future hotel/flight/shopping sources**. Not brokerage trading; no orders/transfers/autologin; no separate Windows bank account, ACL provisioning, finance MCP or new broker architecture.
- **NO test executions** in canonical workspace until test output isolation is repaired. Preserve existing `results/samsungpop/snapshots/` files, bank profile/session, dirty `pi-dev/settings.json`, 3 stashes, old local `cd04aca`, and unknown old worktrees. No hard reset, clean, stash pop/drop or force push.
- Independent Claude reproduced: `renameSync` overwrote an existing snapshot on Windows; `collect.mjs` import calls `main()` and makes test file exit 1; controller-path synthetic E2E writes production result directory; timeout reply has latent status-shaped branch. Fix strictly those plus small Pi metadata validation and test expectations.
- Live banking selector validation and Pi UI E2E are NOT_RUN. Current CDP ownership is NOT_VERIFIED. Do not claim runtime/OS isolation or live success.
- Implementer may commit/push only the S2 **feature branch** if focused acceptance gates pass. No automatic main merge. After one independent review, GPT+user decide next.

## Reporting

Report only deltas and the acceptance matrix in `S2_CLAUDE_VERIFIED_FINAL_REWORK.md`; mark unexecuted checks NOT_RUN. Success requires preserved old snapshots, deterministic collision test, module import zero side effects, actual fixture Controller→Child SAVED with 4/3 metadata and correct JSON, and test process exit code 0.
