# Agentco Current Task — Samsung POP S1 local read-only browser

**ACTIVE DEVELOPMENT TASK: S1 Samsung POP local browser status — inventory first (2026-10-14).**

## Personal assistant by default

For greetings, everyday conversation, general advice, finance/travel planning, explanations or research, **do not automatically read this file**, inspect Git, execute tests or start a coding workflow. Follow root `AGENTS.md` (canonical shared policy) and native `pi-dev/AGENTS.md` / `CLAUDE.md` as applicable. Presence of this repository or a greeting does not authorize development operations.

When the user **explicitly requests Agentco implementation, debugging, testing, review, or continuing a named development task**, use this file as the development entrypoint and only the minimum context linked to that new work order. Never preload old completed phase reports. Standard handoff is user/GPT direction → Pi or user-selected Main implementation/test/commit/push (Codex available for coding) → independent verifier, preferably Claude when not implementer → GPT/user release. Follow Git-first and preserve dirty/untracked local work, stash, sessions and secrets. On Pi, automatic Git checkpoint is OFF by default and optional with `agentco --main pi --agentco-checkpoints`.

## Accepted baselines

- **Assistant-first behavior**: Claude reviewed `2879522c69a5ed8f8e03859519a0be911acaf9ce`, PASS (4/4 focused offline tests). Native instruction routing and opt-in checkpoint implementation merged. See `docs/capabilities/INTERACTION.md`. Actual greeting-model adherence NOT independently tested by that review.
- **P5.10 — persistent native Ultra defaults**: Claude reviewed `cd803da21c52d1b49117eca0557bf286c2d3ccfc`, PASS (6/6 machine-local profile checks, SKIP 0). Requested **exact model** is `nvidia/nemotron-3-ultra-550b-a55b:free`, including `:free`; the user's original request explicitly included the suffix. Pi already uses it; Codex native model is Ultra; Hermes main + 13 auxiliary task pins + auxiliary reference + delegation are Ultra (16 fields); Claude initial model and 6 supported role aliases are Ultra (7 fields). Actual user-local settings/backups remain on the original Windows machine, not in Git. No live Claude NVIDIA protocol/alias-resolution confirmation by this review, and no guarantee of continued free pricing. See `docs/work-orders/P5_10_ULTRA_NATIVE_DEFAULTS.md` for scoped evidence and limitations.
- **Previously accepted P5.9 native launcher**: one-choice 4-Main menu, no custom free-price/compatibility gate, no redundant `-c` model overrides. P5.4 synthetic AUTO/Worker and Pi/Agentra/browser remain unchanged.

## Active S1 work (explicit user assignment)

1. Read only this pointer, [S1 Samsung POP work order](work-orders/S1_SAMSUNGPOP_BROWSER_READONLY.md), and current relevant source.
2. Origin/main baseline: `c51b0a044ba8c6a303efc226ed44834d6a3b362e`; assigned branch `feature/s1-samsungpop-readonly-20261014`.
3. Inventory local M1/M2/Edge/profile path metadata and Git safety first. Model-isolated banking boundary must PASS synthetic tests before any live bank-page test. Otherwise STOP as BLOCKED.
4. Preserve the two local stashes, runtime, auth and ignored profile without inspecting contents. No main merge until independent verification and user approval. No old work-order reread or gratuitous model calls.
5. Implementer is Pi or selected Main. Claude independent verification only when Claude did not implement; otherwise use another independent reviewer.



## Latest S1 review — rework required, no live banking (2026-10-14)

GPT reviewed `0656d1a9be26cb18ed630a8d0506de14cab625e1` directly against GitHub source: stable profile and profile-copy removal are improvements, but reported 8/8 source-pattern tests do NOT prove enforced isolation. Status: **ISOLATION_GATE=BLOCKED, LIVE=NOT_RUN, MAIN_MERGE=NO**. Still open: same-user model tool access to bank profile/CDP, global unverified CDP :9222 owner, cookie/storage heuristic false login statuses, browser owner lifecycle, and real production behavioral tests.

For next narrowly scoped rework, read only **the final section** of `docs/work-orders/S1_SAMSUNGPOP_BROWSER_READONLY.md` ("GPT static review — latest 0656d1a9") and directly relevant current S1 code. No historical-phase reread. If no enforceable separate Windows process/account/profile access boundary is feasible, report BLOCKED rather than opening Samsung POP. Do not expose raw page/profile data to any OpenRouter-powered Main, Worker or generic tool. No live bank site/login/account data, package changes, model calls, profile copying, global taskkill or branch merge. Preserve main, the two stashes and all existing auth/browser state.


## S1 product direction updated — user-operated login first (2026-10-14)

The user reaffirmed the original approach: **open Samsung POP in Edge → user manually logs in → local non-sensitive status check**. Do not build an OS-level multi-user isolation platform as a prerequisite to this modest interactive workflow. The **latest** section of `docs/work-orders/S1_SAMSUNGPOP_BROWSER_READONLY.md` ("User product clarification — manual-login-first S1") is the governing scope, overriding earlier notes that blocked even local browser opening until hard sandbox proof. For implementation read only this latest scope plus relevant live S1 code; preserve two stashes, browser/credentials and all other native Main work.

Keep login credentials, bank-page content and raw financial data OUT of normal model-visible tools, external LLM context and logs. The initial user-initiated local open/login is not equivalent to claiming enforced isolation or authenticating accounts programmatically. `auth=UNKNOWN` unless real bank-specific evidence can be verified; no cookie/storage heuristics or arbitrary CDP 9222 connections. Focused real-code behavior tests, then implementer feature-only push and independent review; **no main merge yet**.
