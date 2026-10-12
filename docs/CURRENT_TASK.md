# Agentco Current Task

Start here and follow `AGENTS.md`. Read only the active result in `docs/work-orders/P3_FREE_MODEL_SMOKE.md`; completed setup remains archival.

## Current state

P3.4 resumed on 2026-10-12 from `92cd8213b866a3b94e0b3bb0af33b8ceacb3b065`. Latest user instruction authorized presence-only access to the repository-local `.env` target key, superseding the earlier process-injection-only source restriction. `KEY_PRESENT=true`; no secret value entered agent context, evidence or Git. Existing credential files were not modified.

- Codex 0.162.1: BLOCKED before inference; native complete no-tools isolation not established, 0 prompt attempts.
- Claude Code 2.1.292: PASS for basic text inference only; 1 synthetic prompt, 1 reported turn, `READY`, exact `nvidia/nemotron-3-super-120b-a12b:free` in model usage, no spawned subagents. Public input/output pricing is zero. CLI estimate `$0.00098` has unknown cost basis; provider billing and independent HTTP request count were not observed.
- Hermes v0.21.7: BLOCKED before inference; oneshot no-tools/auxiliary suppression not established, 0 prompt attempts.

Only documentation changes are authorized for closure. No further model requests, login, settings changes, adapter development or main merge. Existing installations, user settings/auth/sessions/runtime/PATH, Pi, source Skill and two stashes remain preserved. **WORKER READY = NO**; Skill/tool/sandbox E2E NOT RUN.

## Next handoff

Claude independent review of this factual partial result without repeating model calls. GPT/user decide whether to approve a separate native safety investigation for Codex/Hermes and the subsequent Skill/tool/sandbox gate. No additional implementation is currently approved.
