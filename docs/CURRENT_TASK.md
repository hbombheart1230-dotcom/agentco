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

P0/P1 — root folder hygiene follow-up.

### Required context

- `AGENTS.md`
- the **latest "Root folder hygiene follow-up" section only** in `docs/work-orders/P0_P1_CODEX.md`
- current Git status / branch / root directory inventory

### Do not reread by default

- earlier P0/P1 implementation sections
- previous validation reports
- historical Pi 1.0.2 baseline docs
- already-completed single-workspace migration details

### Completion

Perform the current follow-up, validate, commit, push, and report only the new delta/results.
