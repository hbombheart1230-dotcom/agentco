# P5.7 — One Agentco root .env, native provider verification for Claude / Codex / Hermes

**Status:** ASSIGNED / IMPLEMENTATION PENDING (2026-10-13)
**Base:** `main` at `7fcefb4bb6fe1a576ca42e93b7ca5b872a1f22aa`.
**Branch:** `feature/p5-7-shared-env-native-providers`.
**Workspace:** `C:\Agentco`; private personal Agentco project ONLY (not company cowork-cli).

## Authoritative clarified request

The user confirms the one true API credential source is **`C:\Agentco\.env`**; the requirement applies to **Claude Code, Codex CLI, AND Hermes**, not just Hermes. Preserve existing native interactive TUIs and use officially supported native API/provider routes, not browser-based Nous/Claude/OpenAI subscription login whenever a legitimate direct API-key route exists. Do not copy credentials into multiple global CLI profiles or force sign-in. `.env` is ignored and must **never** be committed, echoed, hashed, or displayed. Key presence may be reported as true/false, no more.

**Crucial factual distinctions:**
- A path alone does not make installed vendor CLIs read this project's `.env`; load centrally through existing `scripts/env.mjs` / `piEnv()` and pass whitelisted secrets **only to approved child CLI endpoints**, in child env. The chosen model/provider must also be explicitly selected through native supported CLI config.
- **Codex:** P5.6 already does this for OpenRouter Responses via child-only settings and exact `nvidia/nemotron-3-super-120b-a12b:free`. Preserve existing `nativeFreeMain` launch price=0 gate, `--no-daemon`, child TERM, and no existing config file edits. Existing no-prompt TUI PASS is not a live inference PASS.
- **Hermes:** default vendor authentication dialog can be a Nous subscription path, but Hermes officially supports `OPENROUTER_API_KEY` and `--provider openrouter` with a model flag. Upstream docs `https://hermes-agent.nousresearch.com/docs/user-guide/cli`, `https://hermes-agent.nousresearch.com/docs/integrations/providers`, `https://hermes-agent.nousresearch.com/docs/user-guide/configuration`, `https://hermes-agent.nousresearch.com/docs/user-guide/features/fallback-providers`. Beware auxiliary title/compression/vision/summarization and fallback chains may call different, paid providers even if Main model is free. Verify the **installed 0.21.7** capabilities and resolve using native-supported child-only args/env; block automated free-mode unless every triggered auxiliary/fallback route can be certified free or disabled without global profile changes. **No creating a new proxy, custom adapter or overriding whole user HOME.** If not feasible, report BLOCKED and preserve `--native-default` user opt-in. Do not bypass vendor consent.
- **Claude Code:** `OPENROUTER_API_KEY` alone is not a supported Anthropic authentication variable. Official `https://code.claude.com/docs/en/llm-gateway` clearly states **non-Claude models are NOT supported through gateways**; `https://code.claude.com/docs/en/llm-gateway-connect` documents Claude-compatible gateway credentials with `ANTHROPIC_BASE_URL` and `ANTHROPIC_AUTH_TOKEN`, but that does **not** certify NVIDIA Super `:free` or legal/technical compatibility. Do not workaround policy via spoofing Claude models or convert free NVIDIA into faux Claude. If no **officially supported and user-approved exact free Claude model/provider route** is demonstrated, keep `CLAUDE_UNSUPPORTED` and existing explicit native-default opt-in, with honest login/cost warning.
- **Pi:** existing working Ultra `:free` untouched. **P5.4:** frozen add42 AUTO/Worker untouched; no general delegation, browser, financial or workplace changes.

## Scope / approach

1. Before coding, confirm safe local Git state. Switch to prepared feature branch only when cleanly possible; never stash/reset/clean/overwrite ignored files. Start `docs/CURRENT_TASK.md` and this order, then read minimal live `scripts/env.mjs`, `scripts/agentco.mjs`, `scripts/native-free-main.mjs` and only directly relevant tests. Avoid past P3–P5.6 reports and test suites.
2. Write compact **three-harness truth matrix** first: `ROOT_KEY_EXISTS_BOOL`; `CLI_VERSION`; `NATIVE_SUPPORTED_PROVIDER_ROUTE`; `EFFECTIVE_PROVIDER/MODEL`; `LOGON_REASON`; `AUX/FALLBACK_COST_GATE`; `TUI_OPEN`; `LIVE_INFERENCE_NOT_RUN`. No raw auth file reads, API key values, private terminal captures or secrets.
3. **Do not duplicate** already working Codex provider/key handling merely to achieve textual symmetry. Verify child receives correct root .env key with fake fixture tests and that command args carry no token; reuse implementation unchanged except strictly necessary repairs. Do not force Claude/Hermes down Codex's Responses API path.
4. For Hermes, prefer its official `--provider openrouter` + exact free `-m`/`--model` where installed help confirms. Inject existing root `OPENROUTER_API_KEY` only to Hermes child and only for the verified free route. Preserve prior free-price gate and compare exact prompt/completion zero; fail closed if metadata unavailable. Explicitly disable all aux/compression/title/fallback paths **only if verified official child-only native controls exist**; if not, do not activate automatic Hermes free chat and do not claim compatibility based on a TUI footer alone. Keep existing consent flow and user auth unchanged.
5. For Claude, investigate whether *legitimately supported* gateway + Claude model pricing can satisfy free-only constraints. If not, simply document incompatibility. The project root `.env` can still be the **canonical store**, but do not put an unused OpenRouter key into Claude child env, or falsely remove its onboarding/login using unsupported tricks. **Do not replace an existing valid Anthropic login or force a paid Claude API key.**
6. Default free-only launch is **fail closed** for unsupported/unproven Main. Existing P5.6 interactive explicit-yes native-default for Claude/Hermes and `agentco --main claude|hermes --native-default` must continue to work unchanged with warnings and existing inherited user env. Explicit native-default remains **not guaranteed free**; never auto-send a prompt, accept auth or select a paid model for the user.
7. No unapproved API/model inference. A public unauthenticated price metadata GET is okay; distinguish it from actual inference and do not claim no background networking. The free endpoint must not receive private repository code, financial data or credentials. Any live synthetic call requires separate explicit user approval.
8. Focused OFFLINE unit/launcher tests only, including root .env present vs absent, secret non-exposure, model and aux/fallback gates, no default paid/subscription fallback, approved native argv/env, preservation of all old main routes, metadata only, and explicit opt-in. No changes to `pi-dev/`, `scripts/commander.mjs`, `bin/agentco.cmd`, `scripts/env.mjs` (unless a narrow actual bug demands it), or native global user profiles.
9. Codex implements/tests/commits/pushes **feature branch only**, no main merge. Claude independent reviewer inspects only new SHA/diff, no additional inference, no code edits. GPT/user final PASS/PARTIAL decision and release.

## Acceptance / reporting

Provide concise:
`BASE_SHA` / `IMPLEMENTATION_SHA` / `KEY_PRESENT_BOOL` (only one bool; no secrets) /
per-Claude, Codex, Hermes status:
- `NATIVE_TUI` OPEN/BLOCKED;
- `OPENROUTER_CHILD_ENV` CONNECTED/NOT_USED/BLOCKED;
- `EXACT_FREE_MODEL` VERIFIED/BLOCKED/NOT_SUPPORTED;
- `AUX_FALLBACK` DISABLED/VERIFIED_FREE/UNPROVEN;
- `VENDOR_LOGIN` REQUIRED/NATIVE-DEFAULT/NOT_OBSERVED;
- `CHAT_TEST` NOT_RUN;
- `LIMITATIONS`.
`FOCUSED_TESTS` / `CHANGED_FILES` / `PUSH` / `MAIN_UNCHANGED`.

**Never claim three working free native chats from just an .env path.** Preserve the P5.6 accepted bounded release; separate feature and reviewer gate. No paid/default inference or stealth login.
