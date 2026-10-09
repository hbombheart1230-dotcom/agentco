# P0/P1 Verification Work Order — Agentco workspace normalization

Role: **Claude = independent verifier/reviewer**
Executor under review: Codex
Architecture owner: GPT + user

Do not implement fixes unless explicitly instructed. Review the exact Codex commit/branch produced from `docs/work-orders/P0_P1_CODEX.md`.

## Required review

1. Read:
   - root `AGENTS.md`
   - `README.md`
   - `docs/DECISIONS.md`
   - `docs/WORKER_ROLES.md`
   - `docs/WORK_PLAN.md`
   - `docs/capabilities/HARNESS.md`
   - `PATCH_NOTES.md`
   - Codex P0/P1 final report
2. Compare the Codex branch against the original baseline `3a27a7d60b9e6305bc538bab4b2dedacc15d302c`.
3. Independently verify that role governance is now Codex=developer, Claude=verifier, GPT=architect/final technical authority.
4. Verify the `pi-home/` → `pi-dev/` migration preserves all tracked functionality/history and every active path/config reference is updated.
5. Search for hard-coded `C:\Agentco`, user-profile paths, stale active `pi-home` references, leaked secrets, credentials, runtime state, and accidental generated artifacts.
6. Verify fresh-clone portability assumptions.
7. Run/inspect:
   - dependency install behavior
   - Pi version
   - Pi launcher
   - 14/14 baseline smoke
   - relevant harness regression: extensions, plan/subagent, safety/protected paths, git-checkpoint, LSP, browser/MCP, resume
   - `scripts/bootstrap.ps1`
   - `scripts/doctor.ps1`
8. Confirm P1 did **not** install or custom-build Hermes, Claude Code, Codex CLI, Harbor, or Commander.
9. Confirm shared-skill architecture is documented but P2 work has not been unnecessarily pulled into P1.
10. Review docs for consistency: historical Pi 1.0.2 evidence may stay historical, while current-state docs must not incorrectly claim that 1.0.2 is current.

## Review classification

Classify every finding:
- BLOCKER — unsafe, data-loss risk, broken migration, leaked secret, non-reproducible baseline, failed regression
- MAJOR — material architecture/documentation/portability defect
- MINOR — cleanup or clarity issue that does not invalidate P0/P1
- NOTE — observation only

Do not approve merely because tests pass; inspect implementation and Git diff independently.

## Final report

```text
REVIEWED BRANCH:
REVIEWED COMMIT:
BASELINE:

REQUIREMENTS MATCH:
ROLE GOVERNANCE:
PI MIGRATION:
PORTABILITY:
BOOTSTRAP:
DOCTOR:
SMOKE:
HARNESS REGRESSION:
SECRET / RUNTIME HYGIENE:
DOC CONSISTENCY:
SCOPE CONTROL:

BLOCKERS:
MAJOR:
MINOR:
NOTES:

INDEPENDENT VERDICT:
PASS / PASS_WITH_MINOR / FAIL

RECOMMENDED CODEX REWORK:
<only if needed>
```

### Canonical workspace follow-up

Also verify the P0/P1 follow-up in `P0_P1_CODEX.md`:

- canonical development workspace is `C:\Agentco`;
- routine per-phase sibling worktrees are no longer the default;
- the temporary `C:\Agentco-p0-p1` worktree was removed safely;
- pre-existing README/settings/bin user state was preserved or intentionally reconciled;
- root operating rules state that extra worktrees require a concrete isolation/parallelism reason;
- doctor and smoke were re-run from the canonical workspace;
- the branch has **not** been merged to main before this independent review.
