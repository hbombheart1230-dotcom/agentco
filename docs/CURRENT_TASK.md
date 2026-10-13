# Agentco Current Task — P5.7 released; next work not assigned

**P5.7 CLOSED / PARTIAL PRODUCT ACCEPTANCE — 2026-10-13**

## What was accepted

- Independently reviewed SHA `850cf0b6d29838883d557d95d52ff796b90e309b` PASS. Added only `scripts/shared-env-native.test.mjs` and documentation. Four focused synthetic-fixture tests 4/4 PASS, no runtime code change, no real model/API inference.
- Canonical personal workspace `C:\Agentco`. Existing ignored root `C:\Agentco\.env` remained unmoved; on the reviewed PC, the root .env is the current effective source of `OPENROUTER_API_KEY` (system/user/process settings not set; boolean-only observation).
- Codex uses P5.6 OpenRouter child-only exact NVIDIA Super `:free` route and launch price=0 gate; provider settings are validated with synthetic fixtures. **Real model response NOT RUN**.
- Claude Code has no officially supported non-Claude NVIDIA gateway route; remains `CLAUDE_UNSUPPORTED`. Hermes' main OpenRouter flags exist, but title/compression/auxiliary/fallback safety remains `BLOCKED`. Existing native-default explicit access and its login/cost warning remain intact.
- Pi, P5.4 AUTO/Worker, P5.5 Main selector and P5.6 native access preserved unchanged. Browser and company internal work remain separate.

## Follow-ups requiring explicit scope

1. **Environment precedence difference:** The live whitelist loader prefers inherited nonempty `OPENROUTER_API_KEY` over root `.env`; the reviewer reproduced it with dummy fixtures. Thus `.env` is the current effective source **but not enforced as permanently authoritative**. A future user/machine environment setting could silently win. Fix/explicit warning needs a new bounded task and tests because this loader serves Pi as well as Codex.
2. **Hermes official free routing:** investigate native managed policy / auxiliary/fallback consumer coverage and fail-open behavior; do not inject the root key into an unverified default paid route. No vendor auth bypass.
3. **Codex true free inference:** only with separately authorized synthetic prompt, fresh exact public price check and no private code/data; TUI model display alone is not proof.
4. **Claude:** decide vendor-supported Claude models/account route versus preserve unsupported status. No fake NVIDIA gateway workaround.

No new implementation is assigned. For a new assignment, start with this file and a new task order; do not reread completed P3–P5.7 history or rerun old suites. GitHub origin/main remains source of truth; never overwrite local stash, credentials, native profile, browser profile or ignored results.
