# Agentco Current Task

Start here, follow `AGENTS.md`, check current Git status/origin, then read **only** the active work order. Avoid reopening completed phase histories. Canonical workspace `C:\Agentco`.

## Current status

**P3.3c1 Claude Code CLI + Hermes native Windows installation: FINAL PASS / CLOSED (2026-10-12).** Executor SHA `9033375b8e813f9ab8b9aa3b490dc8939d59507e` independently verified by Claude, clean HEAD=origin. Claude Code CLI `2.1.292` official WinGet/signature verified; Hermes `v0.21.7` pinned official source build verified. Existing installed routes, main, two stashes, Pi/Codex/Claude Desktop and shared Skill link preserved. **Correction:** the installation removed two pre-existing empty User PATH entries, while preserving order/spelling of all 13 nonempty prior entries; no functioning command shadow observed. No PATH restoration task; new shell may be needed for `claude`. **WORKER READY = NO.**

## ACTIVE P3.4 — NVIDIA OpenRouter free-only minimal native CLI smoke: APPROVED

**P3.4 BLOCKED: OPENROUTER_API_KEY absent from the executing process environment.** Codex, Claude and Hermes each made 0 model requests; no fallback, provider/config change, external synthetic home or source transmission. Installation versions are preserved; inference/tool compatibility NOT RUN and WORKER READY = NO. Evidence and STOP outcome are recorded in the active work order.

## Required context for Codex

- `AGENTS.md`
- `docs/work-orders/P3_FREE_MODEL_SMOKE.md` — current P3.4 gate ONLY
- live feature Git status/remote and installed CLI entrypoints as necessary

## Execute

Credential-presence gate completed; live execution stopped as required. Commit/push only this task and P3_FREE_MODEL_SMOKE result documentation. Do not inspect other credential sources, log in, configure a provider or start a CLI/model while the key is absent. Preserve existing settings, sessions/runtime, installations, source Skill, PATH, stashes and main.

## Next handoff

GPT/user arrange inherited environment-key availability without exposing the value, then resume the bounded synthetic-only/free-only gate after native safety prechecks. Claude can independently review this zero-request STOP. Skill/tool/sandbox integration and worker readiness remain separate and unproven.
