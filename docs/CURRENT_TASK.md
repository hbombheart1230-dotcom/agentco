# Agentco Current Task

This is the sole default entrypoint for Codex/Claude. Follow `AGENTS.md`, inspect live Git status and read only the current P3.3b2b work-order section; do not reread completed phases.

## Active execution

**P3.3b2b native Codex Skill registration — APPROVED (2026-10-12).** Previous P3.3b2a ignored fixture PASS at `f1c0b204d27e04f77ce1cb954fb1b3509f455731`: symlink/reference/source identity and safe unlink PASS; Pi root/nested canonical dedup 3 skills/0 diagnostics PASS. Codex model-based discovery is NOT RUN. **WORKER READY = NO** until separate model/provider/auth/permission E2E.

## Required context

- `AGENTS.md`
- `docs/work-orders/P3_LOCAL_RUNTIME_ROUTES.md` — **P3.3b2b — APPROVED native Codex Skill registration** only, plus relevant P3.3b2a evidence if needed
- live Git branch/status/origin

## Codex instruction

1. Safely fast-forward/synchronize canonical `C:\Agentco` on `feature/p3-worker-harness-design`; if dirty, diverged or ownership conflicts appear, STOP and preserve user work.
2. Create exactly **one** repo-local per-skill native directory symlink: `.agents/skills/agentco-delta-handoff` -> `../../shared/skills/agentco-delta-handoff`, after checking for conflicts. No copied Skill bodies, custom loader, wrapper, extension, global links or profile changes.
3. Verify symlink source/reference resolution and safe Git mode `120000` with clean-checkout Windows portability. If Git materializes plain text instead of a real symlink or needs privileged/surprising changes, STOP and document the limitation. Do not force index mode, escalate, modify global Git config or create a fallback sync implementation.
4. Check Pi root/nested canonical dedup against the new repo-local view without re-running completed full doctor/smoke suites. Codex native discovery: use only a verifiably non-model/non-mutating installed-version supported command if one exists; otherwise mark **NOT RUN**. No Codex `exec`, login/auth/status, OpenRouter/model calls, sandbox activation, user profile or PATH changes.
5. Modify/commit only the approved owned repo symlink and brief findings in `docs/CURRENT_TASK.md` and `docs/work-orders/P3_LOCAL_RUNTIME_ROUTES.md`. `git diff --check`, commit/push feature branch; no main merge. Save sanitized evidence only in ignored `results/p3/`, preserve all installs, Pi, sessions, runtime and stashes. Report delta, blockers and explicit NOT RUN.

## Next handoff

**Claude independent verification required** after Codex's actual registration commit: link/target identity, Git portability, Pi dedup, rollback safety and no unauthorized writes. GPT/user determine P3.3b2b final PASS, then separately authorize the simplest OpenRouter free-only synthetic-data model E2E and independent CLI setup for Claude/Hermes.
