# Agentco Current Task

Start here, follow `AGENTS.md`, check current Git status/origin, then read **only** the active work order. Avoid reopening completed phase histories. Canonical workspace `C:\Agentco`.

## Current status

**P3.3c1 Claude Code CLI + Hermes native Windows installation: FINAL PASS / CLOSED (2026-10-12).** Executor SHA `9033375b8e813f9ab8b9aa3b490dc8939d59507e` independently verified by Claude, clean HEAD=origin. Claude Code CLI `2.1.292` official WinGet/signature verified; Hermes `v0.21.7` pinned official source build verified. Existing installed routes, main, two stashes, Pi/Codex/Claude Desktop and shared Skill link preserved. **Correction:** the installation removed two pre-existing empty User PATH entries, while preserving order/spelling of all 13 nonempty prior entries; no functioning command shadow observed. No PATH restoration task; new shell may be needed for `claude`. **WORKER READY = NO.**

## ACTIVE P3.4 — NVIDIA OpenRouter free-only minimal native CLI smoke: APPROVED

User priority: official CLI features first, zero custom integration/loader, one canonical shared Skill and harness-specific Extensions. Provider target exactly `nvidia/nemotron-3-super-120b-a12b:free` on OpenRouter. **Never send private Agentco/Samsung/user data to free model providers.**

## Required context for Codex

- `AGENTS.md`
- `docs/work-orders/P3_FREE_MODEL_SMOKE.md` — current P3.4 gate ONLY
- live feature Git status/remote and installed CLI entrypoints as necessary

## Execute

Run the work order's **bounded, synthetic-only, free-model** test sequence for the **independent pinned Codex 0.162.1 CLI**, **Claude 2.1.292 WinGet CLI**, and **Hermes v0.21.7**. Working directory for all model calls must be a newly owned external synthetic directory **outside `C:\Agentco`**. No repo reading by remote models, no model-accessible tools/subagents. Exact NVIDIA `:free` slug only; disable/avoid any auxiliary or paid fallback. Inherited `OPENROUTER_API_KEY` presence only; do NOT inspect or copy secrets. If absent, document BLOCKED and stop all model calls. Prioritize official per-run flags and child-scoped isolated homes, not global profile configuration. If a CLI is unsupported/unsafe, leave that one BLOCKED rather than improvise.

Read-only prechecks and at most one short `READY` text-only call per CLI. Avoid redundant P2/installer tests, custom scripts/adapters, paid models, sandbox bypass, authentication changes, main merge or changes to existing sessions. Record exact PASS/FAIL/BLOCKED/NOT RUN and distinguish basic text inference from **Worker READY = NO**. Update only this file and the active work order, `git diff --check`, commit/push docs on current feature branch; keep sanitized evidence ignored.

## Next handoff

Claude independently verifies factual config/provider/free-only evidence and preserved state without rerunning model calls. GPT/user close the gate. Native shared Skill exposure for Claude/Hermes and tools/sandbox/E2E then follow based on proven compatibility; Hermes external Skill directories remain disconnected from writable canonical Skill source pending a real read-only boundary.
