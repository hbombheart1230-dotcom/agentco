# Agentco Current Task

This file is the sole default entrypoint for Codex/Claude. Follow `AGENTS.md`, inspect live Git/status and read only the required current context. Do not reread P0–P2 history.

## Current action

**P3.2 inventory CLOSED / PASS (2026-10-12). P3.3a Codex standalone worker setup PROPOSED — user approval pending.** The preflight found a signed `0.162.0-alpha.2` Codex binary embedded in VS Code, but no separately owned Codex distribution on checked routes; Claude Code/Hermes not detected. The current feature branch is `feature/p3-worker-harness-design`. Main P2 baseline remains `1f928974c3fcfc70456fa06bc03064576a9fd51d`.

## Required context

- `AGENTS.md`
- `docs/work-orders/P3_WORKER_HARNESSES.md` — **P3.2 inventory findings** and **P3.3a proposed standalone Codex setup** only
- actual Git branch/remote/status before any subsequent action

## Current authorization

**Design review and approval gate only.** No P3.3a execution: no Codex installation/upgrade, no PATH changes, no authentication, model calls, profile writes, skill links/junctions or CLI runtime changes. Preserve existing signed VS Code bundle, pinned Pi, ignored results, credentials and all stashes. A user/GPT-approved update to this Git work order is required before Codex implements P3.3a.

## Next handoff

User decides whether to authorize an **isolated, pinned, official stable Codex CLI installation**, with no login/model use, followed by installation-only validation and a fresh independent Claude review later. Claude Code and Hermes have separate future opt-in install gates. Do not merge main for P3 yet.
