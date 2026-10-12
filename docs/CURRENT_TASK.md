# Agentco Current Task

This file is the sole default entrypoint for Codex/Claude. Follow `AGENTS.md`, verify actual Git/status and read only the minimum required context. Do not reread completed P0–P2 history.

## Current action

**P3.3a install-only verification PASS; Claude narrow independent review pending.** Official stable Codex CLI 0.162.1 is isolated at `<repo>/results/p3/tools/codex/0.162.1/codex.exe`; explicit-path version/help, official digests and OpenAI signature checks passed. Existing VS Code alpha and environment are preserved. WORKER READY remains NO / NOT TESTED; D-010 stays PROPOSED. Login, auth/status, model calls, adapters, sandbox activation, other installs and P3.3b remain unapproved.

## Required context

- `AGENTS.md`
- `docs/work-orders/P3_WORKER_HARNESSES.md` — **P3.3a installation findings** and approved P3.3a boundaries only
- actual branch/status and origin, relevant installed executable metadata and official package metadata necessary to verify the chosen stable artifact

## Codex action

Installation and focused checks are complete; findings/provenance/isolation/rollback are recorded in the work order. Only this task and the work order changed in Git; artifact, executable and sanitized evidence remain ignored under `results/p3/`. No login, auth/status or model test was performed. Retain the isolated install, existing runtime/results/stashes and main; await independent review and separately approved P3.3b scope.

## Next handoff

Claude performs narrow installation/integrity/scope independent verification after Codex's push; GPT/user gate P3.3b (auth, permissions, shared-skill integration and paid model tests) separately. No P3 main merge or other harness installation yet.
