# Agentco Current Task — P5.6 native Main free-only routing / recurring login screens

**ACTIVE / ASSIGNED (2026-10-13)**

## Minimum required context

1. This file.
2. `docs/work-orders/P5_6_NATIVE_FREE_MAIN_LOGIN.md`.
3. Only the live launcher/environment and current focused test code pointed to by the work order, plus minimal installed CLI nonsecret help/config metadata.

Do **not** reread P3–P5.5 completed history or rerun historical full suites.

## Current scope and safety

- Workspace: `C:\Agentco` (personal only). Base remote `main` is `1ed95a3ff0432ca1b94e16d6d14506db0d710bac`.
- Assigned remote branch: `feature/p5-6-native-free-main`. GPT has committed this spec and pointer there.
- User symptom: selecting Claude/Codex/Hermes native TUI may route to sign-in/first-run provider screens. They want **existing OpenRouter free model** via each installed official native CLI, **without** unnecessary subscription OAuth. No novel frontend, global config reset, auth bypass or provider login automation.
- First diagnose each native CLI locally using non-secret metadata only. Root `.env` may not reach non-Pi sessions today because launcher only uses `piEnv()` for Pi; confirm rather than assume.
- Apply the smallest official-supported child-only provider/model setup if safely possible. Preserve Pi default Ultra free, existing P5.4 Worker/AUTO and P5.5 menu/Codex no-daemon/TERM.
- Claude Code's official docs do not support non-Claude model use behind gateways, so an incompatible login/provider setup may remain **PARTIAL/BLOCKED**. Do not bypass required onboarding.
- Fix exact model/provider, no paid fallbacks or auxiliary model drift; no live model calls without specific user approval. If no safe route can be proven, report BLOCKED rather than pretending the CLI is usable.
- Preserve dirty files, creds, stash, runtime, native profiles, browser profile and independent Samsung POP branch; **never inspect or print secret values**.
- Codex: implement/test/commit/push only feature. Claude: independent review of actual implementation SHA. GPT/user: final PASS and main decision.

P5.6 is separate from cross-harness natural-language delegation, which remains deferred.
