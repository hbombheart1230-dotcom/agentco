# Agentco Current Task

This is the single local Codex developer/executor task entrypoint. Follow `AGENTS.md`; read only this file and its active work-order section. Confirm clean branch/origin before work. Do not reread completed P0–P3 or rerun passed CLI tests.

## Current result — P3.4 partial real-model smoke

**P3.4 executor SHA `4d72b17`: PARTIAL PASS / KNOWN LIMITS (2026-10-12).** OpenRouter `nvidia/nemotron-3-super-120b-a12b:free` produced a Claude Code CLI 2.1.292 **basic text-only PASS**, `READY`, one reported CLI turn. Public model price $0, but actual OpenRouter billing and HTTP request count NOT VERIFIED; do not infer from Claude's unknown-basis client dollar estimate.

Codex Stable 0.162.1 and Hermes v0.21.7 each made **0 model calls**: both BLOCKED at their native no-tools/auxiliary safety checks, **not a model protocol failure**. Skill/Tool Calling/OS sandbox E2E NOT RUN, **WORKER READY = NO**. Existing source, settings, installed CLIs, runtime, Pi, two stashes, main and secrets preserved.

## ACTIVE — P3.4b approved offline native safety-gap review

**READ-ONLY/OFFLINE ONLY.** No key presence/value check; **do not open the repository `.env`** (the previous user-authorized targeted secret use is not needed now). **Zero model calls**; no provider account, cost, login, network-facing agent session, upgrades, Code/Hermes configurations, Skill edits or adapter development.

## Required context

- `AGENTS.md`
- `docs/work-orders/P3_FREE_MODEL_SMOKE.md` — **P3.4 review disposition and P3.4b — native Codex/Hermes safety-gap audit** and preceding resumed P3.4 outcomes only
- Git feature branch/status/origin and exact pinned installed CLI source/help when necessary

## Execute

1. Safely sync `C:\Agentco` `feature/p3-worker-harness-design`, preserving current user changes; STOP if branch dirty or diverged.
2. **Codex pinned 0.162.1:** offline exact-version help/schema/source check for actual all-built-in-tools disablement versus sandbox/read-only/MCP-only filtering.
3. **Hermes v0.21.7:** offline exact-version source/CLI inspection of oneshot empty toolset fallback, `safe-mode`, MCP initialization, secondary/fallback model calls and whether official native flags/config really suppress them.
4. No new scripts/wrappers/proxies. Determine one minimal safe next option per CLI: true native no-tools, or separately authorized **genuinely isolated synthetic normal-tool agent test**, or BLOCKED with exact missing capability. Treat absence of a feature as a factual result, not a reason to invent implementation.
5. Update only this file and `docs/work-orders/P3_FREE_MODEL_SMOKE.md` with brief verified matrix / NOT RUN. `git diff --check`, commit/push docs on feature branch only. Leave main/runtime/auth/PATH/stashes alone; don't repeat Claude's successful API call.

## Next handoff

GPT/user judge the native CLI limitations and choose a *bounded practical* synthetic agent E2E (or keep blocked). No automatic fallback, paid model, credential exposure, private repo uploads or claims of WORKER READY.
