# Agentco Current Task

Start with `AGENTS.md`, this file, and ONLY `docs/work-orders/P5_PIPELINE_MVP.md`. Use live Git/status/files for facts; do not reread completed P0-P3 histories or failed E2E tests. Canonical workspace: `C:\Agentco`, current feature branch `feature/p3-worker-harness-design`.

## Current proven baseline

P0/P1 environment and governance PASS; P2 shared canonical Skill source and Pi native discovery PASS/merged to main. P3 installed Codex 0.162.1, Claude Code CLI 2.1.292 and Hermes v0.21.7 and registered native Pi/Codex/Claude Skill views. Pi and Claude OpenRouter NVIDIA Super :free synthetic text/code inference PASS. Claude now exposes Read/Write/Skill tool names when its simple-mode filter is removed, but native Skill invocation and actual file writes have NOT passed. Pi/Codex/Hermes tool execution and host containment remain unproven. Overall WORKER READY = NO. Existing main, two stashes, user auth/profiles/runtime and source links preserved.

**P3 round-two docs have verified literal ? encoding damage** at previous feature commit `ac8d389`; repair archive as part P5 job, not by retranslating missing bytes.

## ACTIVE - P5 Commander MVP: real Pi -> Claude pipeline, APPROVED

User explicitly prioritized **the first usable end-to-end pipeline** above more detailed harness comparisons, exhaustive security proofs and model evaluations. Build last: examine community/native Pi Extension support for external Claude Code CLI delegation first (preferred pinned candidate `pi-subagents@0.77.0` in a disposable environment); avoid conflicting with already installed official subagent. If an external CLI adapter cannot use exact OpenRouter free-model routing, use a minimal Pi native-command -> `claude -p` handoff, at most one transparent thin helper if unavoidable. **Do not create a manager/framework.**

Acceptance: from one user request, actual Pi Commander triggers installed Claude Code CLI Worker in an owned external synthetic workspace, receives the worker artifact, and presents the result **back through Pi**, with reproducible user command and sanitized execution evidence. Model calls use only the exact approved `nvidia/nemotron-3-super-120b-a12b:free`, no paid/auxiliary fallback; <=5 new CLI prompt attempts. Text/artifact handoff is enough for **P5 PIPELINE MVP PASS**; **WORKER READY stays NO** until real file tools/Skill invocation. Don't let old P3 Write/Skill blockers stop this P5 text/structured handoff.

Also repair the confirmed corrupted appended P3 status section accurately in plain English from existing evidence, ensure UTF-8/non-corrupt output, preserve original history and don't touch existing Skill code. No harness benchmark comparisons, model swaps, Hermes/Codex Worker E2E, sandbox infrastructure, custom Skill adapter, dashboard or background service.

Codex executor: safe Git sync (no dirty overwrite), follow active work order A/B/C fully in one session, one commit/push feature branch, no main merge. Claude independent reviews the single commit and sanitized evidence at end. **All human-facing reports in Korean.** Do not interrupt for intermediate approvals within this scope.
