# P5.8 — Configure actual native CLI defaults (not just Agentco launcher overrides)

**Status:** LOCAL DEFAULTS SAVED / PARTIAL - INDEPENDENT REVIEW PENDING (2026-10-13)
**Base:** origin/main `4107000453feb4e5e9880cf2df27d5d288d02a23`
**Remote feature:** `feature/p5-8-native-cli-default-profiles`
**Canonical local workspace:** `C:\Agentco` (personal Agentco only; exclude Samsung internal CLI work)

## User's authoritative correction

> Don't just keep inspecting or reading `C:\Agentco\.env` and setting command-line launch overrides. Each installed **Claude Code / Codex CLI / Hermes** has *its own initial/persistent native settings file*: locate the real installed-version settings file and **write native defaults there once**: provider OpenRouter, initial NVIDIA `:free` model, and other required startup settings. Key originates in `C:\Agentco\.env`. The purpose is to avoid repeated provider/model selection or Nous/OpenAI subscription dialogs. Leave each CLI's original native TUI intact.

This explicit task **authorizes carefully controlled edits of LOCAL user-level native CLI settings**, overriding the earlier read-only profile-preservation restriction for non-secret settings only. Do not confuse a persistent vendor config with project-launch argv overrides. Never claim all three can run the free NVIDIA model if a vendor officially cannot.

### Discovered official paths (verify installed versions & actual effective scope before editing)

- **Codex CLI (installed v0.162.1)**: `%USERPROFILE%\.codex\config.toml`, TOML. Pin native user default `model = "nvidia/nemotron-3-super-120b-a12b:free"` and `model_provider = "agentco_openrouter"` (use unique provider ID and preserve other settings), with provider `name`, `base_url = "https://openrouter.ai/api/v1"`, `wire_api = "responses"`, `env_key = "OPENROUTER_API_KEY"` and `requires_openai_auth = false` only as confirmed for installed version. Reference: `https://developers.openai.com/codex/config-reference`, `https://openrouter.ai/blog/tutorials/codex-cli-openrouter/`. Keep existing P5.6 child-only safety settings and `--no-daemon` fallback working. Do not insert an API key value or a token-returning `auth.command` in config. Don't overwrite unrelated TOML tables/settings.
- **Hermes Agent (installed v0.21.7)**: `%USERPROFILE%\.hermes\config.yaml`, YAML. Installed Hermes's official config uses `model.provider: openrouter` and `model.default: nvidia/nemotron-3-super-120b-a12b:free` (check exact current schema and aliases with native `hermes config` metadata / installed source). Docs: `https://hermes-agent.nousresearch.com/docs/user-guide/configuration` and `https://hermes-agent.nousresearch.com/docs/integrations/providers`. For secrets Hermes normally uses `%USERPROFILE%\.hermes\.env`; user's **single source** is `C:\Agentco\.env`. Do NOT copy literal key to YAML or create a second divergent real-key store. A CLI config `key_env` reference to `OPENROUTER_API_KEY`, if supported, plus a very thin existing Agentco child-env load from root is acceptable **only as credential plumbing**; provider/model must be actually persisted in native config. If Hermes requires its own .env, investigate safe canonical path resolution without replacing/moving/merging credentials or silently making a symlink to an existing profile file. Don't rely only on launcher flags and falsely report native defaults updated.
- **Claude Code (installed v2.1.292)**: `%USERPROFILE%\.claude\settings.json`, JSON user settings, plus optional project-local ignored settings. Official docs `https://code.claude.com/docs/en/settings` and `https://code.claude.com/docs/en/llm-gateway`. Claude Code **officially does not support non-Claude models through LLM gateways**. Its API gateway may use `ANTHROPIC_BASE_URL` and `ANTHROPIC_AUTH_TOKEN` for **supported Claude models only**, so setting an OpenRouter NVIDIA free model in Claude settings would be misleading/unsupported. Do not fake model IDs, intercept login, enroll OAuth, select a paid Claude model or write an unused/incorrect key; report `CLAUDE_UNSUPPORTED` as an explicit hard limitation if no official compatible *zero-priced* Claude model is verified. Do not needlessly edit the native Claude profile just to make three files look symmetrical. Separate mandatory consent/theme from subscription authentication.

## Secret source / path semantics (important)

`C:\Agentco\.env` is ignored canonical source and already contains `OPENROUTER_API_KEY` (presence observed previously). **Never inspect, echo, copy, hash, print, commit, log or expose its value.** Native settings should contain only key **names**/references (such as `env_key = "OPENROUTER_API_KEY"`), endpoint URLs and exact model slugs. Existing Agentco `piEnv()` can feed approved native child environment; scripts may access key in memory but never write its literal content to another file. Root loader currently prefers inherited OS env to `.env`; this PC previously had no OS key, but note the precedence in sanitized output. Preserve Pi behavior unless a new, explicit root precedence task is approved.

**Persistent native config is a local-machine artifact, not Git source:** do not upload actual `~/.codex`, `~/.hermes`, `~/.claude` files or backups to private Git. Commit only safe scripts/tests/docs if necessary. Do not copy auth/session files or modify any OAuth/consent state. Keep local snapshots of only the files being edited, in same native config area, with strict local-only access and no backup overwrite. No reset/stash/clean. If an existing file has unanticipated sensitive keys or complex schema, parse/edit in place without raw content being sent to model; output only sanitized keys and booleans.

## Implementation order — minimize complexity

1. Validate `git status`, ensure local feature branch safe. Start `docs/CURRENT_TASK.md`, read THIS work order only plus minimal live config/launcher tests. Don't re-read old P3–P5.7 reports. Discover installed path precedence via `--help`/official metadata and file existence, without raw secret reading/output.
2. **Report effective before state**: for each CLI, file path, non-secret provider ID/model ID if determinable, whether key is available (bool), whether native first-run/login is pending. No raw config dumps.
3. **Make local persistent native config edits** for Codex and Hermes as above; edit minimal keys/sections preserving any unrelated settings, comments when practical, existing session state and permissions. Back up before editing, verify syntax/schema with no-prompt native inspect commands. The exact free model should be the original `nvidia/nemotron-3-super-120b-a12b:free`. Do not switch to paid or alternative models. For Hermes prioritize disabling title generation (documented `auxiliary.title_generation.enabled: false`), pinning all enabled side tasks to the same OpenRouter `:free` model or disabling them via supported config, and ensuring `fallback_providers`/`fallback_model`/per-task `fallback_chain` do not route to Nous, Codex OAuth or paid defaults. If complete auxiliary/fallback control can't be established, configure the main native OpenRouter/free default if it does not itself trigger a request, but clearly mark `HERMES_FREE_CHAT_BLOCKED` and leave the P5.6 guarded launch unchanged. Do not introduce false free-only assurances.
4. **Distinguish persistent defaults from Agentco override**: Codex already has P5.6 `-c` launcher overrides. Persistent user config should make the default provider/model correct for **standalone native Codex** too; Agentco safety overrides may remain, but no duplicate contradictory models. Hermes may require narrow child-env plumbing to take the root key, **in addition to** persisted `config.yaml` provider/model. Do not change native default model with only an Agentco argv flag.
5. **Claude**: no forced NVIDIA config, no subscription or account login. If no officially supported free-Claude route, explain in the final matrix and preserve explicit `--native-default` optional native startup. No workaround that spoofs a Claude-compatible vendor model. Do not inject an OpenRouter key solely to suppress a required first-run UI.
6. Run only targeted **config syntax, no-prompt TUI start/exit and offline tests**. No model prompts, account verification, paid API calls, new auth/login or new installs. Price metadata GET without credential allowed; do not claim model inference works. If native standalone CLI opens with no key (e.g. inherited shell lacks env), report the limitation and verify Agentco child env separately.
7. If using any local integration to allow the Hermes TUI to receive root key, keep source change tiny and preserve Pi, Codex cost gate, P5.4 AUTO/Worker, P5.5 Main selector and P5.6 native-default user consent. Default free-only Hermes route must still fail closed until all auxiliary/fallback cost paths are demonstrably safe; permission to edit config does NOT authorize calls to non-free models.
8. On successful local safe edits, commit/push only in-scope repo tests/doc/tooling changes on **feature branch**. If actual change is only local native config, make a sanitized docs/test commit (no secret files), with a clear machine-local result. **No main merge**. Claude independent checks new code and sanitized evidence only, not raw native config/auth files. GPT/user accepts final.

## Expected result report

`IMPLEMENTATION_SHA` (if repo commit), `LOCAL_NATIVE_FILES_CHANGED` (paths only), `LOCAL_BACKUPS_PRESENT_BOOL`, `NATIVE_DEFAULT_PROVIDER/MODEL` (3 CLIs), `ROOT_ENV_REFERENCE` (provider key *name* only), `HERMES_AUX_FALLBACK_SAFETY`, `CLAUDE_UNSUPPORTED` / compatible route, `NOUS_PORTAL_PROMPT` (observed/not run), `MODEL_PROMPTS=0`, `TEST_PASS`, `MAIN_UNCHANGED`, `FURTHER_STEPS`.

**Acceptance:** Actual native defaults exist where the vendors read them; legitimate missing support must be reported, never emulated or hidden. Existing native TUI capabilities remain intact.


## Execution delta (2026-10-13)

BASE_SHA: 74f0db8631f96c914ce5007b504bef0082a4350b; baseline origin/main 4107000453feb4e5e9880cf2df27d5d288d02a23. Clean original tree fetched and switched safely to the prepared tracking feature. No stash/reset/worktree, installation or main merge.

### Actual persistent files / before-after

| CLI | Actual effective native config | Before provider / configured model | After provider / configured model | Local change |
| --- | --- | --- | --- | --- |
| Codex 0.162.1 | C:\Users\mush2\.codex\config.toml | openai (implicit) / unspecified | agentco_openrouter (OpenRouter) / nvidia/nemotron-3-super-120b-a12b:free | Saved and independently parsed |
| Hermes 0.21.7 | C:\Users\mush2\AppData\Local\hermes\config.yaml | openrouter / anthropic/claude-opus-5.5 | openrouter / nvidia/nemotron-3-super-120b-a12b:free | Saved and native config check exit 0 |
| Claude Code 2.1.292 | C:\Users\mush2\.claude\settings.json | model unspecified / no configured gateway base URL in this file | Unchanged | CLAUDE_UNSUPPORTED; no unnecessary backup/edit |

Important actual-state correction: Hermes's installed Windows get_config_path() / native `hermes config path` resolves AppData\Local\hermes, NOT the illustrative %USERPROFILE%\.hermes path. Neither CODEX_HOME nor HERMES_HOME overrides were present in this execution. Claude before metadata does not imply absence of existing authentication; auth/session stores were not inspected.

Only the two modified nonsecret configs were backed up in their respective native directories before edits:

- C:\Users\mush2\.codex\config.toml.agentco-p5-8-20261013T132600005480Z.bak
- C:\Users\mush2\AppData\Local\hermes\config.yaml.agentco-p5-8-20261013T132600005480Z.bak

LOCAL_BACKUPS_PRESENT_BOOL: true. Exclusive-create backups were byte-verified locally and ACL inheritance removed, granting current user and SYSTEM only. Originals' ACLs were retained by in-place writes; no backup overwrite. No raw config/backups/auth/session files enter the repository or reviewer context. Preparatory local checks refused nonempty literal credential fields, duplicate YAML keys, unexpected schema and concurrent content changes. Existing comments/unrelated settings were preserved using installed tomlkit round-trip and YAML node-span edits; before/after semantic comparisons verified only intended settings changed. Existing host parsing libraries were reused; no package installation.

### Persisted values and official basis

Codex native provider table agentco_openrouter now contains the documented OpenRouter endpoint, Responses protocol, env_key="OPENROUTER_API_KEY", requires_openai_auth=false and supports_websockets=false. No token-returning command, literal token, or user auth replacement. Model/provider defaults are stored in USER config, not in new project overrides. [Official provider reference](https://developers.openai.com/codex/config-reference/) and installed CLI support the fields. Existing Agentco P5.6 price/key/config/daemon/TERM overrides are unchanged and agree with the persisted exact :free model. The installed standalone still needs --no-daemon for its packaging environment.

Hermes actual native YAML now has model.provider=openrouter and model.default equal to the exact :free model. [Official configuration](https://hermes-agent.nousresearch.com/docs/user-guide/configuration) and installed schema were used:

- compression.enabled=false; auxiliary.title_generation.enabled=false and model_upgrade_enabled=false.
- auxiliary.free_only=true and auxiliary.openrouter_model pinned to the same :free slug (installed auxiliary_client supports these).
- Thirteen named auxiliary tasks (approval, background_review, compression, curator, kanban_decomposer, mcp, profile_describer, skills_hub, title_generation, triage_specifier, tts_audio_tags, vision, voice_chat) pinned to OpenRouter/same exact model/endpoint, with api_key=${OPENROUTER_API_KEY} reference and empty fallback_chain. No literal credentials written. This is persisted configuration, not proof every runtime consumer honors all pins.
- fallback_providers=[] AND legacy fallback_model=[]; delegation provider/model pinned to the same free route with fallback_providers=[]. [Official fallback documentation](https://hermes-agent.nousresearch.com/docs/user-guide/features/fallback-providers) explains legacy and current chains and per-task resolution. Memory/user-profile learning disabled to avoid unnecessary automatic calls.
- Full auxiliary/tool/vendor behavior remains UNPROVEN without a separate scoped runtime audit. HERMES_FREE_CHAT_BLOCKED is retained: default guarded Agentco free route is unchanged; explicit acknowledged --native-default remains available. No claim of safe arbitrary free chat, voice/image support or paid fallback immunity after user changes settings.

Claude: [official gateways](https://code.claude.com/docs/en/llm-gateway) do not support non-Claude models. Existing JSON was inspected locally for selected nonsecret model/base-URL presence only and left untouched. No fake NVIDIA mapping, Anthropic key injection, OAuth or paid Claude selection. Mandatory native theme/onboarding is distinct from API compatibility.

### Canonical credential boundary / no-prompt startup results

Canonical C:\Agentco\.env is unmoved/uncopied/unhashed and ignored; root key exists. No global env/profile/credential-file changes. Codex references OPENROUTER_API_KEY by NAME; Hermes builtin OpenRouter uses that variable and auxiliary YAML contains only ${OPENROUTER_API_KEY}. No real-key second store or env symlink created.

For startup verification only, ignored results/p5-8/native-smoke.mjs called the existing opaque piEnv() loader and passed OPENROUTER_API_KEY into the selected native child's environment, preserving normal native HOME/profile. It added NO provider/model flags and no prompt. Codex received only the existing needed --no-daemon and child TERM fallback. Hermes received no CLI args. Thus the observed model comes from the persistent user config, not an Agentco provider override.

| Native restart | First provider/model/login screen | Exit / observation |
| --- | --- | --- |
| Codex | No provider/model picker or subscription login shown | Correct exact :free footer; Ctrl+D exit 0, terminal restored |
| Hermes | No first-run provider prompt or Nous portal login shown | NVIDIA model native input TUI opened immediately; Ctrl+D Goodbye, exit 0 |
| Claude via existing explicit native-default | Theme/onboarding remains | No theme/login/consent accepted; Ctrl+C native cancellation then Windows batch termination, outer exit 1 |

MODEL_PROMPTS=0. No inference or authenticated API/account query. [Public metadata](https://openrouter.ai/api/v1/models) showed exact :free prompt/completion both zero; native background networking is unmeasured. No existing session/runtime/browser cleanup; startup artifacts retained.

Remaining credential-plumbing limitation is explicit: native settings do not make standalone CLIs auto-read C:\Agentco\.env. This shell had no OS OpenRouter key; normal native startup requires the key in its child environment. Installed Hermes env_loader.py loads its native-home .env with override=True, ahead of source-checkout .env fallback; existing native secret-store values were NOT inspected or changed, so root-only effective-key provenance inside Hermes is not certified. No secret-source precedence change was made. Existing Agentco Hermes native-default does not add a repo key; default Hermes free launch remains blocked. A later narrowly approved credential-plumbing decision may be needed; current task did not change the launcher.

### Validation / Git boundary / next

Four focused machine-local tests PASS before and again after TUI checks (repeat justified by possible native startup rewrites). They validate actual saved model/provider/env-key references; disabled title/compression/root fallback; auxiliary pins/reference-only credentials; verified backups and unrelated before/after semantics. Tests read nonsecret config snapshots locally and assert booleans rather than print values on failure; reviewer should use sanitized evidence, not execute raw-profile checks. Test requires existing Python + PyYAML and ignored execution evidence; missing machine evidence is SKIP/NOT CHECKED, not PASS. No old full suite rerun.

Native Hermes config check exit 0 with no warning. Initial Codex --strict-config features list inspection returned exit 1 because that flag is unsupported for the features subcommand; it was NOT a TOML defect. Corrected supported --no-daemon features list exit 0 and actual native TUI loaded the persisted provider/model. This failed inspection attempt is retained honestly. TOML/YAML syntax and semantic preservation, Git diff/UTF-8/scope and syntax checks PASS.

LOCAL_NATIVE_FILES_CHANGED: only the two paths above. Repo changed files: scripts/native-profile-check.test.py, docs/CURRENT_TASK.md, this work order. Sanitized machine evidence is results/p5-8/local-config-result.json / execution.json (ignored); raw profiles and backups never staged. Pi, menu, native-default, price gate, env loader, P5.4 Worker/AUTO and shared Skills all have zero source delta. Main/stashes preserved; feature-only commit/push.

NEXT: Claude independent new-SHA safe-delta / sanitized evidence review only. GPT/user final decision. Persistent defaults are complete for Codex/Hermes; inference, fully free Hermes auxiliary operation and single-source standalone credential hydration remain PARTIAL, not silently solved. Restore only the corresponding local backup if the user requests rollback; preserve other state and never auto-reset auth.
