# Agentco Current Task — main release baseline

**P5 Pi Commander -> Claude Code CLI -> Pi pipeline CLOSED / FINAL PASS (2026-10-13).**

Main is the stable promotion of two exact reviewed scripts from feature commit `dc56eb5`, not a merge of the P3 feature branch's 88 experimental/documentation commits. Detailed P3 experiments remain only on `feature/p3-worker-harness-design`; no four-harness worker readiness or native Skill/file-edit success is implied.

## Production entrypoint

- Existing Pi baseline is unchanged (`pi-dev`, pinned upstream Pi 1.0.4).
- `scripts/commander.mjs` is a standalone **synthetic-text-only** Pi -> Claude CLI -> Pi invocation, pinning OpenRouter `nvidia/nemotron-3-super-120b-a12b:free`. Requires preinstalled Node/dependencies and official Claude Windows CLI; default WinGet or process-only `AGENTCO_CLAUDE_CLI`.
- `node scripts/commander.mjs --check` checks local CLI prerequisites without API/key use. Do NOT send real private code, secrets, files or company content into this prototype.
- This implementation has independent Claude PASS after 18/18 focused offline tests; previously recorded Pi->Claude->Pi real inference output `HARDENED_PAYLOAD=137` was not re-run after final process-cleanup changes. `WORKER READY = NO` for native file editing and Skill invocation.

Historical release evidence and residual limitations: `docs/work-orders/P5_PIPELINE_MVP.md`.

## Next work

Use a separate feature branch and dedicated work order for **P5.1: native official Claude CLI file edits on disposable synthetic files through the working Pi pipeline**. Prioritize built-ins/official tools and no new framework or model/harness comparison. Do not execute development tasks on main without a new approved work order; preserve local sessions, runtime, auth and stashes.
