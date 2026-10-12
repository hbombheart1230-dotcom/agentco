# Agentco Current Task

Default entrypoint. Follow `AGENTS.md` and read only this file and the referenced active proposal. Preserve all completed phase history and existing local runtime.

## Current state

**P3.3b2d native Codex Skill registration: FINAL PASS / CLOSED (2026-10-12).** Implementation `099cb2661ecb3469af57bdd1320387432cbdbb61` was independently verified by Claude: Git-owned symlink mode `120000`, valid target/reference, Windows fresh checkout at the final SHA, Pi root/nested 3 Skills/0 diagnostics, clean working tree and preserved main/stashes. **Codex live Skill discovery/model execution and POSIX checkout NOT RUN; WORKER READY = NO.**

**Known portability limitation:** a Windows clone with `core.symlinks=false` renders the Skill view as a plain text file rather than a linked directory. Future fresh-machine checks must report this loudly. Prefer a small check in the existing doctor under a future separately approved change; no new loader, copier or auto-repair program.

## Next proposed task

**Native Claude Code CLI + Hermes CLI installation, reuse existing installations: PROPOSED / NOT YET APPROVED.** Existing Claude Desktop Code continues as the independent reviewer, separate from the future supported `claude -p` CLI route. The official native installers can affect per-user directories, dependencies or User PATH; installation needs explicit user permission.

## Required context

- `AGENTS.md`
- `docs/work-orders/P3_LOCAL_RUNTIME_ROUTES.md` — **P3.3b2d — final independent PASS** and **P3 next: official Claude Code CLI + Hermes CLI on native Windows — proposal** only
- current feature Git status/origin when the next scope is approved

## Authorization boundary

No new CLI installations/updates, credential reads, login, OpenRouter/NVIDIA model calls, code/config/Skill changes, sandbox activation, global settings changes or main merge are currently authorized by this closure. Future installation should be one CLI at a time, native-first, official-only, minimal code, with Claude independent verification. Model E2E will be separately gated and must use sanitized synthetic tasks and NVIDIA free-only without paid fallback.

## Next handoff

User approves (or revises) the small installation-only plan; GPT then activates the work order and supplies the short Codex prompt. All other work remains frozen.
