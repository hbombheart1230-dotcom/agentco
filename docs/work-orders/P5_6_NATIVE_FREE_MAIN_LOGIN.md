# P5.6 — Four native Main TUIs: OpenRouter free-only routing and login/onboarding diagnosis

**Status:** ASSIGNED / IMPLEMENTATION PENDING — 2026-10-13
**Base:** `main` `1ed95a3ff0432ca1b94e16d6d14506db0d710bac`
**Feature:** `feature/p5-6-native-free-main`
**Canonical workspace:** `C:\Agentco`, existing checkout, single workspace.
**Important:** This is strictly personal Agentco, NOT a company project.

## User request (authoritative)

When `agentco` launches a chosen Pi / Claude Code / Codex CLI / Hermes as its **existing native interactive TUI**, it should use the user's already available **OpenRouter free-only model setup** instead of repeatedly directing the user to external subscription/sign-in/onboarding screens. User wants minimal change, not another frontend, new account, new orchestration engine or P5.4 rewrite. Recognize the distinction between:
1. OS/browser login/first-run consent or theme screen (may require human interaction and cannot be bypassed via hacks).
2. CLI inference provider/API-key selection (can use supported native configuration and child environment, without subscription/OAuth login).
3. Official vendor/API incompatibility (report BLOCKED/PARTIAL, do not claim solved).

The aim is native TUI + selected existing OpenRouter account/API **without** compulsory Claude/OpenAI/Nous OAuth where a supported API route exists. **No unauthorized bypass of a vendor login, required consent, licensing or first-use activation.**

## Grounded baseline

- P5.5 accepted and released; `scripts/agentco.mjs` launches 4 native TUIs. Pi uses `piEnv()`; non-Pi currently inherit only `process.env` plus `AGENTCO_MAIN`. Thus repo-local `.env`, loaded only by Pi, may not reach non-Pi TUI. Do not assert it is the *only* cause before local checks.
- Pi default stays `nvidia/nemotron-3-ultra-550b-a55b:free`; synthetic P5.4 workers fixed `nvidia/nemotron-3-super-120b-a12b:free`.
- Existing Codex Main launches with installed supported `--no-daemon` and child-only `TERM` fix; preserve.
- Existing P5.4 named `add42` and AUTO=Claude frozen and not relevant to debugging native Main login.
- Last local evidence: Claude opens native first-run onboarding, Codex native TUI shows an unverified non-free-model slug, Hermes opens native TUI but provider unset. **TUI launch PASS != free-model chat PASS.**
- Source requirements: `docs/CURRENT_TASK.md` (this work order linked), `scripts/agentco.mjs`, `scripts/env.mjs`, current focused launcher tests, and only installed local CLI command/help metadata. No historical P3–P5.4 reread.

## Trusted documentation / compatibility constraints (recheck on installed versions)

- Claude Code official gateway docs `https://code.claude.com/docs/en/llm-gateway-connect` support `ANTHROPIC_BASE_URL` + gateway credential `ANTHROPIC_AUTH_TOKEN` or `ANTHROPIC_API_KEY`. Official gateway overview `https://code.claude.com/docs/en/llm-gateway` explicitly **does not support non-Claude models behind gateways**. P5.4 synthetic add42 success with a free non-Claude model is not proof of native interactive support. Never fake successful authentication or claim official support. Do not modify/delete `~/.claude.json` or accepted user settings/auth; no forced OAuth/logout.
- Codex official config docs `https://developers.openai.com/codex/config-reference/` support custom providers with `base_url`, `wire_api="responses"`, `env_key` (or supported command-auth), and specific provider/model selection. OpenRouter `https://openrouter.ai/blog/tutorials/codex-cli-openrouter/` says provider selection should be user-level. On installed v0.162.1 first check whether native CLI `-c` configuration overrides or existing local provider profile are officially sufficient for child-only use; do not assume project-local file changes apply, and do not overwrite global user config.
- Hermes native CLI docs `https://hermes-agent.nousresearch.com/docs/user-guide/cli` and provider docs `https://hermes-agent.nousresearch.com/docs/integrations/providers` support an explicit OpenRouter provider/model and `OPENROUTER_API_KEY`, `hermes model` for native setup. Verify flags against **installed 0.21.7** before applying; newer public docs may differ. Never force proprietary Nous/Anthropic/OAuth.
- Use the exact documented free model `nvidia/nemotron-3-super-120b-a12b:free` for non-Pi Main *only when compatible and exact model/provider can be pinned*. Free listing `https://openrouter.ai/nvidia/nemotron-3-super-120b-a12b:free` may change: verify **current prompt and completion unit prices BOTH zero** via public metadata before even a user-approved live test. `:free` suffix by itself is not conclusive. No automatic model fallback, auxiliary paid calls, default subscription model, or silent switch.
- **Security note:** NVIDIA/OpenRouter explicitly warns that the free endpoint should not receive confidential or personal data; do not transmit project private code, secrets, account/financial pages, or private documents. Synthetic trivial prompt only, and only after user approval.

## Phase A — sanitized, no-model-call diagnosis (must finish before implementation)

Use `C:\Agentco`. Confirm git status, remote/base and local machine-only changes; preserve staged/unstaged/untracked/stashes. If a branch switch would disturb user data, STOP rather than stash/reset/force/clean/worktree.

For each selected Main record **sanitized metadata only**:
- Trusted installed CLI executable/version, first-run UI type (vendor OAuth, theme consent, API provider picker), supported documented flags/environment/config precedence and expected API format.
- Is `OPENROUTER_API_KEY` present via existing Agentco shell or ignored root `.env`? **Only yes/no**, no key length, prefix, token, characters, partial hash, printing/env dump or screenshots.
- Which **non-secret** provider/model identifiers would be used before any chat. Check effective model, provider, and any auxiliary/fallback paths by reading config **structure with local redaction only**, never surfacing raw config/credential files or auth state.
- Does native TUI open *with no login flow* on correct model route when started via ephemeral child process overrides? No prompts/LLM inference to test. If an onboarding agreement or vendor login is unavoidable, label precisely and do not bypass.

## Phase B — thin login-free native provider activation (conditional)

Modify only additive/very narrow launcher environment/config code and focused tests. Prefer official CLI flags and ephemeral **child-only** env/config overrides for Agentco invocation, leaving global native user settings/credentials unchanged. Do not reimplement CLI, patch vendor packages, introduce proxies/adapters/new framework, or use P5.4 synthetic temporary homes for interactive Main.

- Pi: exactly preserve existing working free Ultra model, `piEnv` and P5.4.
- Claude: investigate official gateway bearer token + base URL + exact model remapping on existing native CLI. **Non-Claude model is not officially supported**; if startup/auth or mandatory model calls cannot operate reliably without unsupported workarounds, report `CLAUDE_UNSUPPORTED` or `FIRST_RUN_REQUIRED` and leave its native settings untouched. No hijacking consent, no account creation and no unknown-priced fallback.
- Codex: child receives existing OpenRouter key and **specific verified free model + custom provider using native supported config** (Responses). Preserve `--no-daemon` and TERM. Ensure built-in/default model cannot issue a call; with ambiguous config use `CONFIG_REQUIRED` rather than OAuth/paid fallback. Do not mutate `~/.codex/config.toml` blindly, print tokens via shell, or let key appear in argv/logs. Test native argv/config precedence using no-key fixtures.
- Hermes: select native OpenRouter provider and exact free model with installed supported flags or local ephemeral machine-only configuration. All auxiliary/summarization/title/fallback model settings must either be demonstrably disabled/same exact free route or clearly blocked before user prompts. Do not overwrite existing `~/.hermes` auth/config or redirect into unrelated vendor OAuth.
- In all Mains, if an existing provider/login fallback is **not** avoidable by officially supported options, display a short safe status and leave the native CLI otherwise intact. Never synthesize authentication or claim session established.
- Keep user's existing credentials in ignored `.env` / native stores; **do not commit API keys, token-bearing files, auth/session data, shell dumps, screenshots or unredacted traces**. Project scripts may read keys at runtime into child env; never print them or provide content to the model/Claude reviewer.
- No unsolicited model call, no paid request, no key-to-third-party endpoint beyond explicitly selected approved OpenRouter target. No API key visible in CLI arguments, code, logs, tests, evidence, Git, chat messages.

## Focused acceptance

1. `agentco` menu Pi/Claude/Codex/Hermes still launches original native TUI (or clearly reports genuine vendor first-run/provider limitation), while preserving normal Pi launch and Codex daemon/TERM workaround.
2. With key **present** vs **absent**, each non-Pi Main gets only its own official provider settings. Missing key fails closed **before any model request**, never silently launches paid/default route.
3. Only the exact `nvidia/nemotron-3-super-120b-a12b:free` can be used in non-Pi free-mode requests (where technically supported) with exact price=0 check prior to an authorized call. No paid fallbacks, auxiliary models, or subscription use. Tests mock price/provider metadata; no token use.
4. Verify no native auth/profile/global config/`AGENTS.md`/`pi-dev/settings.json`/P5.4 Worker source was modified and no URL/login bypass tricks, no private data to free endpoints.
5. Tests must be **focused offline MOCK plus no-prompt TUI smoke**. Do not run any live model inference without explicit separate user approval; mark `LIVE PROMPT NOT RUN`. Don't rerun older P3–P5.5 full suites.
6. True matrix per Main: `TUI_OPEN`, `FIRST_RUN_UI`, `FREE_PROVIDER_CONFIG`, `DEFAULT_MODEL_BLOCKED`, `AUX/FALLBACK_BLOCKED`, `CHAT_TEST` (NOT RUN), `LIMITATIONS`. Distinguish fully working from vendor-hosted auth/setup limitation and unverified routing.

## Development and reviewer handoff

- Codex implements after checking its canonical local Git state; use feature branch `feature/p5-6-native-free-main` that GPT prepared. If local cannot cleanly switch, STOP and describe exact blocker; never reset, stash or overwrite existing work.
- Strictly read `docs/CURRENT_TASK.md` and this work order. No reread of old history or another expensive model research cycle.
- Code only scoped launcher/settings/test additions, then focused tests and sanitized local evidence, commit/push feature branch. **No main merge.**
- Claude independently reviews **implementation SHA and only changed delta**, verifies the no-paid/no-leak boundary and clearly labels unsupported login/onboarding, with no fresh model calls. Reviewer has no authority to rewrite implementation.
- GPT/user final acceptance; do not promote partial work to `main` as full four-Main chat readiness. Report `PASS / PARTIAL / BLOCKED` truthfully.

**Report:** `BASE_SHA`, `FEATURE_SHA`, `CHANGED_FILES`, `MAIN_TUI_MATRIX`, `KEY_PRESENT_BOOL`, `FREE_ONLY_GATE`, `LOGIN_SCREEN_ROOT_CAUSE_PER_CLI`, `FOCUSED_TESTS`, `LIVE_MODEL_CALLS=0`, `PUSH`, `FOLLOWUP`. No key values, raw config or private paths.

## Explicit exclusions

Natural-language/general cross-harness delegation, P5.4 AUTO changes, Samsung POP browser, financial data, Skill adapter, account signup, auto login/OAuth flow, auth cache reset, repo-wide refactor, updating installed CLI versions, changing free model without approval.
