# Agentco — CURRENT_TASK (2026-10-15)

**State: NO ACTIVE IMPLEMENTATION TASK. S1 CLOSED / FUNCTIONAL PASS; next user-directed topic: S2 Samsung POP read-only information access design.**

## Assistant-first default
A greeting, general conversation or personal-assistant query is NOT permission to read repository docs, run Git, use workers, or access finance. Enter development mode only when the user explicitly requests development, review or a named project task. Follow root `AGENTS.md`. Canonical personal repo: `hbombheart1230-dotcom/agentco`; Windows workspace: `C:\Agentco`; remote `origin/main` is authoritative, but respect existing local work.

## Accepted milestones
- Existing P0/P1, P2, P5.1–P5.10 improvements remain in main. Some worker flows had **synthetic** PASS only: broad autonomous Pi→3 Workers is NOT a verified production feature.
- Pi CLI is default Main; **Codex CLI (local/native)** implements when delegated; **Claude Code CLI (local/native)** independently reviews changed SHA; **Hermes CLI (local/native)** is optional for targeted testing, not mandatory. CLI may use paid external-model API providers; local CLI does not mean zero credits. ChatGPT = architect/final technical judgment; user = product direction and approval.
- **S1 Samsung POP browser:** local Pi `/samsungpop open` and `/samsungpop status`; user manually logs in; status is fixed enum only, `auth=UNKNOWN` by design. User-supervised Pi local smoke PASS (open, two status calls, repeat open without new Edge, user login, two final statuses). Reported 41/41 offline isolated tests PASS. Claude Code CLI earlier CONDITIONAL_PASS, subsequent narrow auth cleanup independently diff-reviewed by GPT. Source implementation `3395c3910b94b54d51bed6c3d818825b4f78859a`; merged via [PR #3](https://github.com/hbombheart1230-dotcom/agentco/pull/3) at `14aa506ebd5499367eab6ba5ed29e437bf549445`. Detailed historical evidence: `docs/work-orders/S1_SAMSUNGPOP_BROWSER_READONLY.md`. **Do not reopen S1 or repeatedly reread old reviews without a newly observed failure.**
- Repo branch-history consolidation (legacy P3/P5.1/old POP design retained in ancestry without overwriting newer code): `docs/BRANCH_CONSOLIDATION_20261015.md`.

## Next topic: Samsung POP S2 (DESIGN ONLY until explicitly assigned)
Target: after user signs in manually in the dedicated Edge profile, user-approved **read-only** financial-information retrieval for the personal assistant. Begin with a thin scope: choose exact data fields (e.g. balances/positions), explicit user invocation, local-only extraction and a deliberately restricted JSON schema. Before accessing real account information, resolve CDP/browser-process ownership and secrets/PII handling, decide whether any data may reach external LLMs, and verify no orders/transfers/login automation. Make a new S2 work order only when user authorizes scope. Prefer native browser/extension/Skill/MCP, minimal custom code.

## First task when moving the local machine to the merged main
`C:\Agentco` was last reported checked out on `feature/s1-samsungpop-readonly-20261014`, with an existing user-modified `pi-dev/settings.json` and **three stashes**. GitHub consolidation only touched remote. The next local Pi/Codex action must inspect Git status, protect that change and the three stashes, then sync to `origin/main` safely. No blind `reset --hard`, `stash pop`, clean, force checkout, profile access, or overwrite. No automatic deletion of legacy remote branches.

## Context-budget rule
For a new S2 design request read **this file** and `docs/BRANCH_CONSOLIDATION_20261015.md` first, then only the S1 interfaces/extension directly relevant. Avoid completed history, repeated all-tests runs, model overdelegation and speculative architecture. Keep implementation and verification separately owned when code actually changes.
