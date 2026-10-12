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

P2.1 Shared Skills Architecture — design proposal ready for GPT/user review. P2.2 implementation remains unapproved.

### Required context

- `AGENTS.md`
- `docs/work-orders/P2_SHARED_SKILLS.md`
- D-009 (PROPOSED) in `docs/DECISIONS.md`, only if decision context is needed
- current Git status / branch

### Do not reread by default

- earlier P0/P1 implementation sections
- previous validation reports
- historical Pi 1.0.2 baseline docs
- already-completed single-workspace migration details

### Completion

Await GPT/user approval of the proposed architecture, initial skill and P2.2 scope. Record requested design revisions as documentation changes. Do not install, copy, move or delete skills, change Pi configuration, or begin P2.2 before explicit approval.
