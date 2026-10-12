# Agentco Current Task

Sole local Codex task entrypoint. Read `AGENTS.md`, this file and **only the active P3.3c1 work-order section**. Verify clean feature branch/origin before any work. No P0–P3 retrospective rereads or redundant full tests.

## Active task — P3.3c1 official Claude/Hermes Windows CLI install: APPROVED (2026-10-12)

Previous P3.3c preflight at `04131c426a18054503dd65871091bb0f79bb3145` stopped **before installation** because two official installers make User PATH changes outside the original narrow limit. User has already approved sequential native CLI installations and wants subsequent prompts without reconfirming each small gate. **GPT now authorizes exactly the below narrow User PATH changes**, while keeping all prior prohibitions on models, login, private config, and unrelated system changes.

## Required context

- `AGENTS.md`
- `docs/work-orders/P3_LOCAL_RUNTIME_ROUTES.md` — **P3.3c1 — APPROVED exact User PATH scope and official CLI installation**, and preceding pre-install evidence only if needed
- Git branch/status/origin

## Codex execution

1. Safely sync `C:\Agentco` on `feature/p3-worker-harness-design`; stop on dirty/divergent state. Reuse the previous public installer/WinGet manifest audit; compare known SHA/version/side-effect evidence rather than reviewing all history.
2. **Claude first:** reuse if already healthy, otherwise official per-user portable `winget install --id Anthropic.ClaudeCode --exact --scope user` if vendor manifest supports it. Permit *only* missing WinGet user Links directory **appended** to User PATH. Verify `claude --version`/passive `--help` by explicit installed path or safe alias; no interactive execution. Keep existing Claude Desktop and its Code runtime untouched. Native bootstrap fallback is not approved.
3. **Hermes second:** reuse if already healthy, otherwise execute **downloaded, source-hash-checked official pinned** Windows `install.ps1` with `-NonInteractive -SkipBrowser -SkipComputerUse` (no Desktop/gateway/onboarding). Permit *only* its absent vendor Hermes bin **prepended** to User PATH, preserving all prior entries/order. Vendor managed dependencies are permitted only in approved user-scoped installation dirs; no unrelated system package upgrades or changes to existing auth/config. Check no existing CLI command is shadowed. Do not use streaming `irm | iex` or modify vendor script.
4. Compare ordered User PATH and Machine PATH before/after: only two approved insertions, no removals, no reorder, no surprise duplicate. Check executable resolution, versions, install origin, existing Pi/Codex/Claude Desktop/shared Skill/stashes/main preserved. Do not inspect user secrets, private conversations or process arguments. On any unexpected side effect, STOP; report BLOCKED, do not patch/repair or auto-uninstall arbitrary existing state.
5. Record concise `CLAUDE/HERMES/PATH/PRESERVED/NOT RUN` results only in this file and the active work order. Keep installer evidence ignored under `results/p3/`, `git diff --check`, commit/push documentation only on the feature branch, no main merge. No new product code, Skill adapters, extensions or tests from completed phases.

## Strictly NOT RUN

Login, auth/status/credential inspection, `claude -p`, Hermes chat, model/OpenRouter/NVIDIA traffic, sandbox activation, Skill link registration for these tools, new gateway/service/scheduler/browser setup, benchmarking or hidden background updates. **WORKER READY = NO** even if both CLIs install cleanly.

## Next handoff

Claude independent verifier checks actual installation files/versions, PATH scope, ownership and preserved runtime. GPT judges installation PASS and opens separate minimal native Skills/provider compatibility steps as needed.
