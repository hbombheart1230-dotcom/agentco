# Agentco Current Task

This is the sole default Codex/Claude task entrypoint. Follow `AGENTS.md`, check current Git branch/origin/status, and read only the active P3.3b2c section. Do not reread completed phases.

## Active task — APPROVED P3.3b2c (2026-10-12)

**Windows relative symlink portability diagnosis; ignored-fixture-only.** P3.3b2b repo registration STOPPED at Windows WinError 123; new link safely removed, source/Pi/sessions/runtime/main and stashes preserved. User explicitly approved this narrowly scoped next experiment. **Worker readiness = NO.**

## Required context

- `AGENTS.md`
- `docs/work-orders/P3_LOCAL_RUNTIME_ROUTES.md` — **P3.3b2c — APPROVED Windows link-target diagnostic** section only; refer to P3.3b2b failure evidence only when necessary
- actual Git status, branch, remote

## Codex execution

1. Safely synchronize branch `feature/p3-worker-harness-design` in canonical `C:\Agentco`; STOP for dirty/divergent work. Do not modify main or existing user's work.
2. In a **new, owned, ignored `results/p3/` fixture only**, reproduce forward-slash relative symlink failure and compare native Windows backslash relative symlink read/identity and safe unlink. Isolate a toy Git repo + clean checkout inside the fixture; inspect true link Git mode/blob and Windows checkout behavior, and report POSIX portability only if genuinely verified. Use normal Git settings without privilege escalation, index manipulation or global config change.
3. Do not create a real `.agents/skills` link or modify `shared/skills`, Pi, profiles, PATH, Git global settings, installed CLI, sessions, stashes or runtime. No Skill loader, copier, bootstrap, extension, launcher, Codex discovery, auth/status/login, model/sandbox invocation or OpenRouter traffic.
4. Document focused PASS/FAIL/NOT RUN matrix, explain whether there is a single portable link. Update only this work order and `docs/CURRENT_TASK.md`; `git diff --check`, commit/push **feature branch only**. Sanitize findings and retain evidence under ignored `results/p3/`; report delta only. No main merge.

## Next handoff

GPT/user review diagnostic and decide whether to approve a new actual-registration strategy. Claude independent verification applies to any later code/config/Skill registration. P3.3b3 auth/provider/model tests remain gated.
