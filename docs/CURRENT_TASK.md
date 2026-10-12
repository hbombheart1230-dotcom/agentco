# Agentco Current Task

This is the sole default entrypoint for Codex/Claude. Follow `AGENTS.md` and inspect live Git/status; read only this phase's required context.

## Current action

**P3.3a standalone Codex CLI: FINAL PASS / CLOSED (2026-10-12).** Codex installed and checked official stable Codex CLI `0.162.1` at `<repo>/results/p3/tools/codex/0.162.1/codex.exe` (ignored); Claude independently verified SHA256, OpenAI signature, version, isolation, preserved VS Code bundle/stashes and the exact reviewed SHA `fc47bd0ce4e420a597dc4f432bef4fb0b0ad32f3`. No implementation issue blocks closure. **WORKER READY remains NO / NOT TESTED.**

**Next: P3.3b runtime/Skill integration is a PROPOSAL, NOT AUTHORIZED.** Suggested gates: b1 read-only inventory of both VS Code extension binaries/paths; b2 isolated shared-Skill discovery and sandbox setup (requires separate approval); b3 login/model smoke with explicit user-approved limits (requires separate approval). No login, model calls, sandbox activation, Skill link, CLI/profile changes, installs or benchmarks may start until a specific substage is approved. D-010 overall remains PROPOSED; main still holds the P2 baseline.

## Required context

- `AGENTS.md`
- `docs/work-orders/P3_WORKER_HARNESSES.md` — **P3.3a installation findings** and remaining approval gates only
- Current Git branch/status/remote for future execution

## Next handoff

GPT/user choose the narrowly scoped **P3.3b1 metadata-only runtime plan** or prioritize Claude Code Worker installation next. Any substantive Codex integration is implemented by Codex, independently verified by Claude and adjudicated by GPT/user before main merge. No action is authorized merely by publishing this proposal.
