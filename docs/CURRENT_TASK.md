# Agentco Current Task

Canonical Windows workspace: `C:\Agentco`, branch `feature/p3-worker-harness-design`. Follow `AGENTS.md` and read ONLY the new **"P5 hardening: independently reviewed MVP corrections"** section near the end of `docs/work-orders/P5_PIPELINE_MVP.md`. Inspect `scripts/commander.mjs` directly; do not reload old P3 reports or run the previous model benchmarks.

## Verified baseline and independent review

Executor `bf94451` genuinely completed human request -> Pi 1.0.4 Commander -> official Claude Code CLI Worker -> toolResult -> Pi final answer `PIPELINE_P5_RESULT=42`, observed same exact OpenRouter NVIDIA Super free model; 2 CLI prompt attempts, 8.119 sec. One 82-line `scripts/commander.mjs` helper, with no external adapter package or production config change. Existing Skill/file-edit Worker E2E remains NOT RUN / WORKER READY = NO.

Claude independent review confirmed actual routing and artifact, but **classified overall delivery PARTIAL** because (1) nonempty final responses can falsely pass without matching Worker output, (2) timeout may orphan Claude descendants, and (3) Claude's executable path is fixed to one WinGet install location. No provider calls or repo writes were made during that review.

## ACTIVE — one P5 hardening batch APPROVED

In ONE Codex execution, implement three narrow corrections in the existing helper:

1. Enforce deterministic Pi final **correspondence to actual Worker toolResult and Worker output**, correct nonzero failures and sanitized evidence; offline mismatched/missing-result negative tests.
2. Handle Pi/Claude descendant process cancellation/timeouts, with Windows process-tree cleanup aimed at known child PIDs; offline mock nested-child timeout test without actual models. Avoid broad PID termination.
3. Support explicit trusted local Claude executable path override while preserving present working WinGet default. Local preflight must not need API access or read secrets.
4. Run focused offline checks and **at most one** fresh end-to-end synthetic Pi->Claude->Pi workflow (<=2 CLI model prompt attempts total) using exact free NVIDIA slug, zero paid fallback, no private source or credential exposure; no benchmark comparisons.
5. Commit/push feature branch one time, update only current task, active P5 work order and minimal helper/test. One Claude independent review of final commit **without model rerun**.

Continue using vendor CLIs/native Pi APIs; no new adapter framework, paid integration, Skill loader, Linux portability work, Codex/Hermes benchmarking or main merge. Preserve main, both stashes, personal profiles/runtime/auth/PATH. Write clean UTF-8 docs (no literal replacement `???`). Report only final delta in Korean.

## Handoff

After Codex push: Claude reviews new implementation + offline/live evidence once; GPT/user judge the P5 hardened pipeline. Next useful product milestone is a **real synthetic file-editing Worker using this same pipeline**; do not reopen P3 four-harness gating as an MVP blocker.
