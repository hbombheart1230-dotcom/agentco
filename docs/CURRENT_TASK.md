# Agentco Current Task

This file is the **only default execution entrypoint** for Codex/Claude.

## Rule

- Read this file first.
- Read only the files explicitly listed under **Required context**.
- Do **not** reread completed work-order sections, old validation reports, historical decisions, or prior phase notes unless this file explicitly asks for them.
- Git and the actual working tree remain the source of truth.
- If a referenced fact can be verified cheaply from Git/status/files, verify it directly instead of loading large historical documents.
- Keep responses and reports concise; do not restate already-completed work.

## Current action

P2 entry — await GPT/user approval of the shared-skills scope and work order. P0/P1 is complete; P2 implementation is not yet authorized.

### Required context

- `AGENTS.md`
- the P2 scope in `docs/WORK_PLAN.md`
- the new approved P2 work order, when provided
- current Git status / branch

### Do not reread by default

- earlier P0/P1 implementation sections
- previous validation reports
- historical Pi 1.0.2 baseline docs
- already-completed single-workspace migration details

### Completion

Confirm the next P2 scope and acceptance criteria when the owner provides them. Begin implementation only after explicit approval; do not create shared-skill assets or install additional harnesses while awaiting it.
