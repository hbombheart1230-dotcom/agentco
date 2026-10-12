# Agentco Current Task

This file is the sole default task entrypoint for Codex/Claude. Follow `AGENTS.md`; inspect Git/status directly, read only the referenced task context, and never preload old completed phases.

## Current action

**P3.1 — Worker Harnesses architecture / scope proposal (2026-10-12).** P2 is CLOSED / PASS and merged into main at `1f928974c3fcfc70456fa06bc03064576a9fd51d`. Proposal branch: `feature/p3-worker-harness-design`. **P3.2 preflight and P3.3 installs are NOT APPROVED.**

## Required context

- `AGENTS.md` (common rules)
- `docs/work-orders/P3_WORKER_HARNESSES.md` (the active proposal)
- D-010 in `docs/DECISIONS.md` only if architectural decision context is needed
- current Git status/branch/origin

## Current authorization

**Documentation/design review only.** No harness install, shared-skill link creation, user-profile edits, credential reads, model calls, integration tests, worktree changes or modification of Pi. If the proposal needs refinement, edit documentation on the feature branch only after GPT/user approval and before Codex is dispatched.

## Next handoff

User/GPT decide P3 scope and authorize a **read-only P3.2 environment inventory** (separate gate). After P3.2, name exact harness versions and approve each P3.3 installation/integration separately. Claude independently reviews implementation after Codex finishes; GPT/user final PASS/main merge.
