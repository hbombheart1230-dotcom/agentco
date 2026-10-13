# P5.7 — One Agentco root .env, native provider verification for Claude / Codex / Hermes

**Status:** BOUNDED VERIFICATION COMPLETE / PARTIAL - REVIEW PENDING (2026-10-13)
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


## Execution delta (2026-10-13)

BASE_SHA: 6120e89a7ea446fc3bfe4431ad822839cffec4df. Remote main baseline 7fcefb4bb6fe1a576ca42e93b7ca5b872a1f22aa. Fetched with clean original tree and safely created the tracking feature branch; no worktree/stash/reset/cleanup. Initial sanitized three-harness matrix was written before new tests in ignored results/p5-7/initial-matrix.json.

KEY_PRESENT_BOOL: true. Canonical file is ignored C:\Agentco\.env (not C:\Agentco.env). Existing opaque whitelist loader supplied only a presence boolean to this investigation. Original credential file was not moved/copied/hashed/displayed; no additional real key store was created. Existing loader precedence (inherited shell value before root file) is preserved rather than changing Pi/Codex policy; canonical-store management does not erase unrelated user credentials.

### Three-CLI truth matrix

| CLI_VERSION | OPENROUTER_CHILD_ENV | EXACT_FREE_MODEL | AUX_FALLBACK | NATIVE_TUI | VENDOR_LOGIN / reason | CHAT_TEST |
| --- | --- | --- | --- | --- | --- | --- |
| Claude Code 2.1.292 | NOT_USED | NOT_SUPPORTED for NVIDIA | UNPROVEN; free mode blocked before spawn | Preserved explicit native-default access; live NOT RUN | NATIVE-DEFAULT may show required onboarding/login. Root OpenRouter key is not an Anthropic credential by itself; no official NVIDIA gateway route | NOT_RUN |
| Codex 0.162.1 | CONNECTED: existing root loader / child-only path verified with dummy fixtures | VERIFIED configuration: nvidia/nemotron-3-super-120b-a12b:free; inference untested | Existing disabled/pinned child controls preserved, not re-certified through inference | Existing verified native route preserved; live NOT RUN | Custom provider requires_openai_auth=false; first-party login not needed for this configured API route, no new live login observation | NOT_RUN |
| Hermes 0.21.7 / upstream 41cd7b64 | BLOCKED: no repo-key injection into unsafe free mode | BLOCKED pending complete cost gate; official main flags supported | UNPROVEN across title/compression/other auxiliary and configured fallback chains | Preserved explicit native-default access; live NOT RUN | NATIVE-DEFAULT retains native setup/provider selection; a missing key or unspecified provider can leave vendor defaults in control. Consent is separate | NOT_RUN |

No claim of three working free chats. Claude/Hermes explicit native-default inherits existing ordinary caller env/profile and can require login or incur costs if the user later chats. It does not load the root key or select a provider automatically. Menu confirmation/default-cancel and exact --main claude|hermes --native-default form are unchanged.

### Official/install evidence and conditional decision

- Claude: [official gateway overview](https://code.claude.com/docs/en/llm-gateway) excludes non-Claude models; [gateway connection](https://code.claude.com/docs/en/llm-gateway-connect) uses ANTHROPIC_BASE_URL plus ANTHROPIC_AUTH_TOKEN/API_KEY. Neither certifies NVIDIA compatibility. Public OpenRouter metadata listed no anthropic/ model with both prompt and completion prices zero at this check; no officially supported, approved free Claude route was established. CLAUDE_UNSUPPORTED remains accurate independent of key presence. No unused key injection, model spoofing, subscription choice or credential-file inspection.
- Codex: existing nativeFreeMain implementation already centralizes the whitelist loader and child-only OpenRouter Responses provider/model/price gate. No duplicate implementation or runtime code edit. The new isolated fixtures execute byte-copied existing env.mjs/native-free-main.mjs with their DEFAULT key-loading callback, mocked pricing and only newly generated dummy data. They prove root-file present/absent behavior, exact model selection, no token in argv, unchanged parent env, and no unrelated root secret injection. No original .env or native profile is copied into fixtures.
- Hermes: installed --help confirms --provider openrouter and -m; [official providers](https://hermes-agent.nousresearch.com/docs/integrations/providers) supports API-key routing. But [official fallback documentation](https://hermes-agent.nousresearch.com/docs/user-guide/features/fallback-providers) explicitly has no environment override for the primary fallback chain; changes use config.yaml or hermes fallback. [Official configuration](https://hermes-agent.nousresearch.com/docs/user-guide/configuration) puts title disabling and compression/auxiliary choices in YAML. Installed hermes_cli/cli_config_load.py:102 exposes only vision/approval auxiliary env mapping; :199 defaults compression enabled; load_cli_config:258 loads native-home config and bundled defaults. --ignore-user-config is not an all-auxiliary disable switch. hermes_constants.py:get_config_path resolves native home/config.yaml. No supported standalone main flags were found that disable every cost-bearing side route while preserving native user state.
- A further official alternative was checked: [managed scope](https://hermes-agent.nousresearch.com/docs/user-guide/managed-scope) supports HERMES_MANAGED_DIR relocation. Installed hermes_cli/managed_scope.py:get_managed_dir honors the existing directory; _cached_read explicitly fails open on parse failures. This is NOT recorded as nonexistent or generally unsupported. Official native Windows managed locations remain outside v1's scope, and relocated policy coverage across all native CLI/auxiliary consumers has not been certified here. Repointing policy without proving full consumer coverage and fail-closed activation would not satisfy this work order; no policy directory/config or runtime change was deployed. This is the concrete unverified candidate for any separately scoped follow-up, not proof of a safe route today.

[Public unauthenticated metadata](https://openrouter.ai/api/v1/models) confirmed the exact NVIDIA Super :free prompt and completion prices both zero. Existing Codex launch gate is untouched. No model/API inference or account query was performed; public metadata GET is not a chat test. Native network behavior is not re-measured or represented as zero HTTP traffic.

### Focused validation / preservation

Four new focused offline tests PASS in scripts/shared-env-native.test.mjs:

1. Existing default Codex loader reads only a dummy fixture-root key, matches the exact free model, keeps it out of argv and parent environment, and does not forward unrelated fixture secrets.
2. Missing fixture-root key fails closed before pricing/provider requests.
3. Unsupported Claude and unproven Hermes never invoke root-key/pricing callbacks or spawn a default paid provider.
4. All four menu routes and explicit native-default argv/env inheritance remain intact without repo-key loading on unapproved native routes.

Fixtures are newly generated under ignored results/p5-7/dummy-root-*; only source code is copied and only synthetic .env files are created. Original ignored runtime/results and user files remain untouched; fixtures are retained. No old suite, live TUI, model call, native auth/profile read, provider setup or consent acceptance. Installed --version/--help are metadata-only. Syntax, diff, UTF-8/line-ending and exact file-scope checks PASS; .env is ignored/untracked by Git. Pi, Worker/AUTO, launcher, native-free configuration/price gate, env loader, native-default implementation, batch entry and Skills have zero Git delta.

Changed files: scripts/shared-env-native.test.mjs, docs/CURRENT_TASK.md, this work order. Sanitized evidence: results/p5-7/initial-matrix.json and results/p5-7/execution.json (ignored). Runtime implementation was deliberately preserved because automatic Hermes activation did not meet the conditional safety criteria. Feature-only commit/push; main and stashes unchanged.

NEXT: Claude independent new-SHA/delta review. GPT/user decide the truthful PARTIAL result. Hermes needs native relocated-policy/consumer coverage and failure-path proof before any key injection or automatic free launch; no full-HOME replacement/proxy/vendor patch is authorized. Claude needs an officially supported approved zero-priced Claude-compatible route; unsupported NVIDIA mapping is not an option. Any Codex live synthetic inference still requires separate approval and current zero pricing.
