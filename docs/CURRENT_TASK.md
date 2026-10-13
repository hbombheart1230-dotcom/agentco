# Agentco Current Task — P5.5 Samsung POP local browser

**Active scope: P5.5 task specification / implementation pending (2026-10-13).**

## Required context — read only these before working

1. This file
2. [P5.5 Samsung POP isolated browser work order](work-orders/P5_5_SAMSUNGPOP_BROWSER_READONLY.md)
3. Only the **current live files** the work order names and **relevant local M1/M2 code** discovered on the canonical machine.

Do **not** reread P3–P5.4 historical work orders, baseline reviews or tests. The accepted base is upstream Pi 1.0.4 with P5.4 synthetic 3-Worker `add42` PASS only; no general Worker readiness.

## Assignment

- Base remote main SHA: `cc6078fed3e1d9b4c0103a8de8d9c0a18ac1f37e`.
- Working branch: `feature/p5-5-samsungpop-readonly-browser`. GPT-created task files are already on this branch.
- Canonical checkout: `C:\Agentco`. Preserve all local tracked/untracked state, auth, runtime, session profiles and stashes; check before switching branch.
- First **inventory actual local M1/M2 and profile existence**; do not assume older work landed on main.
- Critical: tracked `pi-dev/mcp.json` directly exposes Playwright browser tools to Pi/codemode with a persistent Edge profile. **Do not expose any bank page to this ordinary model-visible route.** First prove a hard local-only isolation boundary or report BLOCKED without a bank-site test.
- If and only if isolation can be enforced, implement minimal user-invoked open/manual-login/status with fixed, safe enums. No bank/account/auth data or raw browser page to any external model; no trade, transfer or account modification.
- Codex: implement + focused tests + commit/push feature branch only; Claude: independent exact SHA review; GPT/user: final gate and main merge decision.

The work order is the only task specification. Keep final results **delta-only**, with MOCK/LIVE/NOT RUN clearly distinguished.
