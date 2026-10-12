# Agentco Current Task

This file is the sole default entrypoint for Codex/Claude. Follow `AGENTS.md`, inspect live Git/status and read only the listed current context. Do not reread P0–P2 history.

## Current action

**P3.2 findings awaiting GPT/user P3.3 approval.** Read-only inventory complete: signed VS Code-bundled Codex CLI 0.162.0-alpha.2 detected; Claude Code and Hermes not detected on PATH/checked default routes. Authentication, worker readiness, sandbox and Windows link E2E remain UNKNOWN/NOT RUN. D-010 remains PROPOSED; installation/configuration/model calls are NOT APPROVED. Main baseline remains `1f928974c3fcfc70456fa06bc03064576a9fd51d`.

## Required context

- `AGENTS.md` — common rules
- `docs/work-orders/P3_WORKER_HARNESSES.md` — **P3.2 inventory findings**, its next approval gates and approved inspection boundary only
- actual `git status`, branch, remote HEAD and local CLI metadata

## Codex action

The inventory and sanitized evidence summary are recorded in the P3 work order. Only this task and that work order were updated. No installs, upgrades, logins, model calls, link creation, profile changes, service starts or Pi changes are authorized by completion of this inventory. Retain ignored `results/p3/`, runtime, auth, all stashes and user work; do not merge main. Await GPT/user decisions before any P3.3 setup or independent verification.

## Next handoff

GPT/user review P3.2 findings, choose exact versions/install channels and approve each P3.3 worker setup separately. The architecture and worker Skill adapters remain unapproved until then.
