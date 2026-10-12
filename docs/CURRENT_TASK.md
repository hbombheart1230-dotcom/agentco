# Agentco Current Task

Default Codex/Claude entrypoint. Follow `AGENTS.md`, verify actual Git branch/origin/clean status, read only the active P3.3b2a section.

## Current action

**P3.3b2a — APPROVED (2026-10-12): Codex native Shared Skill link feasibility, disposable fixture only.** User accepted the simplified P3 architecture: official Pi / Codex CLI / Claude Code CLI / Hermes CLI, native behavior before custom code, one shared Skill authoring source and harness-specific Extensions. Target future model connection is **OpenRouter NVIDIA free-only**, subject to per-harness protocol/tool support and confidential-data safeguards. **No model calls or new CLI installs in this subtask.**

## Required context

- `AGENTS.md`
- `docs/work-orders/P3_LOCAL_RUNTIME_ROUTES.md` — **P3.3b2a approved next gate** and **User-confirmed P3 architecture and OpenRouter provider policy** sections only
- live Git status, branch and origin

## Codex execution

1. Safely synchronize `feature/p3-worker-harness-design` (stop on dirty work or diverged branch). Preserve user's existing VS Code Codex, Claude Desktop/Code, Pi, both stashes, main, private profiles and sessions.
2. Perform ONLY the five P3.3b2a checks: native per-skill discovery design and a reversible Windows symlink/link feasibility probe in an **owned ignored `results/p3/` fixture** pointing at `shared/skills/agentco-delta-handoff`; verify `SKILL.md`, reference resolution, link safety and Pi discovery collision risk. Avoid actual repo `.agents/skills` and `.claude/skills` registration. Describe the pinned Codex 0.162.1 explicit-path process contract **without implementing a launcher**.
3. Do not install/upgrade/login, touch PATH or profiles, create extension code or new adapter files, invoke a model, start new Claude/Codex sessions, enable sandbox, or send source to OpenRouter. If native link is unsafe or unsupported, STOP and report rather than copy Skill bodies or elevate privileges.
4. Update only `docs/CURRENT_TASK.md` and `docs/work-orders/P3_LOCAL_RUNTIME_ROUTES.md` with sanitized findings, `git diff --check`, commit/push **feature branch only** and report delta (PASS/FAIL/NOT RUN). Avoid rerunning completed P2/P3 checks.

## Next handoff

GPT/user approve separate minimal CLI setup / Skill registration and synthetic OpenRouter-free model tests. Claude independently verifies substantive executable/config changes; D-010 high-level design is accepted but downstream gates remain separate.
