# Agentco Current Task

This is the **only default execution entrypoint** for Codex/Claude. Follow `AGENTS.md` for shared policy. Read only the context below; never reread completed work orders or historical validation by default.

## Current action

**P2.2: first shared skill implemented and validated; joint Claude review pending.** P2.1 architecture direction accepted; do **one combined Claude independent verification of P2.1 design + P2.2 implementation after Codex finishes**. Do not run a separate P2.1 verification now.

## Required context

- `AGENTS.md`
- `docs/work-orders/P2_SHARED_SKILLS.md` — **Approved P2.2 execution order**, P2.2 acceptance criteria and rollback; consult other sections only to resolve a specific dependency
- `docs/DECISIONS.md` — D-009 only if decision details are needed
- Actual current Git status, tracked `pi-dev/settings.json` and the installed Pi loader as needed for implementation

## Codex completion

Recovery reconciled with approved origin task edits. Canonical root/nested native discovery, actual invocation and bundled-reference reads passed; doctor 28 PASS and final smoke 14/14 are reused because executable/configuration state matches the tested recovery snapshot. See the P2.2 implementation evidence in the work order. Final pushed-SHA fresh-clone/bootstrap results are recorded in the handoff and ignored `results/p2-2/`.

Implement only the approved P2.2 scope, run the specified checks (label any unrun check NOT RUN), commit/push on `feature/p2-shared-skills-design`, leave `main` untouched. Report only changed paths, HEAD/origin, skill discovery, existing skills, root/nested reference invocation, doctor, smoke, portability, blockers and next Claude verification. Preserve secrets, credentials, runtime, stash and user changes.

## Next handoff

After Codex pushes, Claude independently verifies **P2.1 + P2.2 together** against the exact implementation SHA and acceptance criteria in the work order. Read-only verification; no merge. GPT/user then determine final PASS/rework and whether to merge `main`.
