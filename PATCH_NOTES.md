# Agentco Patch Notes

This file records user-visible and architecture-significant changes to Agentco.

## Unreleased

### Project direction
- Defined Agentco as a personal cowork / companion agent, not a coding-agent fork.
- Adopted **Build Last**: prefer Pi built-ins, packages/extensions/skills, MCP/CLI, and mature OSS before custom development.
- Pi remains an upstream dependency; core modification is discouraged by default.
- Existing custom implementations are now subject to KEEP / REPLACE / REMOVE / DEFER review rather than being automatically carried forward.

### Process
- Established GPT / Claude / Codex division of responsibilities.
- Claude is the primary executor.
- Codex is the independent reviewer/verifier.
- GPT owns architecture and final technical decisions.
- Started Phase 0 workspace and capability audit before further feature development.

### GitHub
- Initialized the Agentco repository documentation.
- Added Phase 0 audit work orders for Claude and Codex.

## baseline-pi-1.0.2 — 2026-10-04

### Clean bootstrap
- Retired the previous pi-dev implementation from the active baseline. It is preserved only as history/reference under the annotated tag `archive/pi-dev-pre-rebootstrap` (commit `37b280c`); it is not merged into `main`.
- Rebootstrapped Agentco on pristine upstream **Pi 1.0.2** (`@earendil-works/pi-coding-agent`, tag `v1.0.2`, upstream commit `cd32f7725fdbddbaecdff5b1e68491563394e0ca`), installed as an exact-pinned npm dependency. Pi upstream modifications: **0**.
- Connected OpenRouter and Groq through Pi's built-in env-var auth (`OPENROUTER_API_KEY`, `GROQ_API_KEY` from the git-ignored `.env`); no custom provider code. A thin launcher (`scripts/pi.mjs`, `pi.cmd`) loads `.env` and points Pi at the repo-local `pi-home/`.
- Fixed the primary model: `openrouter` / `nvidia/nemotron-3-ultra-550b-a55b:free` (via `pi-home/settings.json`). No routing, no fallback, no `openrouter/free`. Groq `openai/gpt-oss-120b` is a secondary smoke-test provider only.
- Smoke test (`node scripts/smoke.mjs`): discovery, auth presence, text response, fixed-model check, session start/exit, `read` tool call, file content in answer — **7/7 PASS on OpenRouter and 7/7 PASS on Groq**.
- No custom extensions, skills, BrowserRuntime/BrowserExtension, memory, or model routing are installed or ported.
- Details: `docs/bootstrap/BASELINE.md`, `MODELS.md`, `SMOKE_TEST.md`.
