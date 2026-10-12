# Agentco Current Task

Canonical Windows workspace `C:\Agentco`, feature branch `feature/p3-worker-harness-design`. Follow `AGENTS.md` and read ONLY **"Final P5 hardening fix — PID identity and lifecycle"** at the end of `docs/work-orders/P5_PIPELINE_MVP.md`; inspect current `scripts/commander.mjs` and `scripts/commander.test.mjs` directly. No old P3 history, repeated installs, benchmarks, completed quality tests or paid/model probes.

## Baseline and final independent review

Real Pi Commander -> installed Claude CLI Worker -> Pi text-artifact pipeline PASS under exact NVIDIA Super OpenRouter free model, hardened implementation at `1a84e8a`. The Claude independent verifier confirmed 6/7 dimensions PASS, including matching Worker/toolResult/final, offline tests, normal live run, CLI override, key protection and repository preservation. No model calls or Git edits during review.

**One REQUIRED remaining issue:** `main.finally` can blindly kill the Worker PID read from a stale `worker.pid` file after Windows assigns the PID to another unrelated process. `process.kill(pid,0)` only checks existence, not identity. Until corrected and verified, overall **P5 Hardening = PARTIAL**. Existing Worker Skill/file-edit readiness also remains NO.

## ACTIVE — focused PID identity-safe cleanup, one batch approved

Codex makes **one** tightly scoped correction and offline regression:

- Retire completed Worker lifecycle/marker immediately when the native child closes; never kill completed Worker based on PID.
- For abnormal Pi termination/orphans, verify owned process identity before any cross-process `taskkill`; if stale, mismatched or unverifiable, skip killing, fail with sanitized warning/status instead of risking unrelated processes. Avoid claiming a PID lookup has mathematically zero race.
- Offline simulate a stale/reused PID and prove unrelated control survives, plus active-owned nested tree timeout and parent-error cleanup. No live model/API/account requests; no elaborate infrastructure or third-party dependencies.
- Correct minor test count narrative and warn on user-supplied `AGENTCO_CLAUDE_CLI` override receiving auth. Do not alter default WinGet installation, model, key behavior, existing production settings or project files.
- Touch only helper, its offline test and two active docs; no main merge; one feature commit/push after focused checks. UTF-8 docs and report in Korean. Preserve runtime, sessions, PATH, source, canonical Skills, auth and both stashes.

After Codex push, one independent Claude review of the exact delta and sanitized evidence, without inference. Only then decide P5 hardening PASS and main merge. Later work: real toy file-edit Worker through same Pi->Claude pipeline, not Codex/Hermes comparisons.
