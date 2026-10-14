# P5.9 — Native configs first; remove Agentco model/cost blockers

**Status: CLOSED / PASS REVIEW — PARTIAL MODEL-INTEROPERABILITY ACCEPTANCE (2026-10-14)**
**Base:** `main` `19dbd92ac17f7943c434adbab68e88f25d97ae64`
**Branch:** `feature/p5-9-native-config-simple-launch`
**Workspace:** `C:\Agentco` (personal ONLY; never use corporate internal/OASIS credentials/endpoints)

## What the user actually wants

Treat Pi / Claude Code / Codex CLI / Hermes as existing independently installed native TUIs. Set real persistent defaults in their native local config files and launch them **without our own elaborate free-price/model compatibility blocks, repeated prompts, or duplicate `-c` configuration**. The user **explicitly waives Agentco's free-only launch-time blocking policy** and accepts that model compatibility or billing can fail/occur at the vendor/OpenRouter level. Never secretly send a model prompt. The model desired as *initial* default is exactly `nvidia/nemotron-3-super-120b-a12b:free`. Any subsequent native model choice remains user controlled.

- Codex real user `config.toml` **already** has OpenRouter Responses provider, env_key name, exact NVIDIA `:free` default (P5.8). KEEP it. Do not reimplement it in launcher args or query public prices on every start.
- Hermes effective Windows native `%LOCALAPPDATA%\hermes\config.yaml` **already** has provider OpenRouter, exact NVIDIA default, title/compression and auxiliary settings (P5.8). KEEP it. No price/aux/fallback fail-closed gate in *Agentco*. But do not claim native vendor side tasks cannot use credits.
- Claude Code installed user's `~/.claude/settings.json` does NOT have a configured OpenRouter gateway. OpenRouter **officially documents its Claude Code Anthropic-compatible route** using `ANTHROPIC_BASE_URL=https://openrouter.ai/api`, `ANTHROPIC_AUTH_TOKEN=<OpenRouter token>`, `ANTHROPIC_API_KEY=""`. Reference: https://openrouter.ai/docs/cookbook/coding-agents/claude-code-integration and https://code.claude.com/docs/en/llm-gateway . Set nonsecret native settings (base URL, initial NVIDIA model via installed supported field / ANTHROPIC_MODEL) with **existing root .env token injected only into child env**. Claude Code **and OpenRouter both do not guarantee/support the non-Claude NVIDIA model as a native Claude-compatible upstream**. **User explicitly wants best-effort launch, not a premature CLAUDE_UNSUPPORTED execution blocker**: attempt the documented OpenRouter gateway configuration and report unsupported-model failures from the native CLI honestly. No model ID spoofing, private proxy, API translator, OAuth tricks or forced acceptance of initial legal/theme/login screens. Do not claim functioning NVIDIA chat until actually verified.
- Native user auth or previously accepted consent must remain intact. Use existing `C:\Agentco\.env` as root token source; do NOT print/log/commit its value.

## Minimal implementation approach

1. Ensure safe local Git state and sync ONLY feature. Start `docs/CURRENT_TASK.md` and this work order; inspect small live `scripts/agentco.mjs`, `scripts/native-free-main.mjs`, directly relevant tests and installed native config schema help. **No replay of prior P3–P5.8 reports.**
2. **Only minimal launcher delta:** simplify Agentco entry to native executable, inherited stdin/stdout/cwd/exit, with one child-only credential hydration from root env where needed. **Remove/disable invocation of `nativeFreeMain` free-price/API metadata/unsupported/aux guard and Codex redundant `-c` overrides.** Do not add a new compatibility/fallback framework. Menu 1/2/3/4 should select native TUIs directly in one choice; eliminate second Claude/Hermes `[y/N]` price warning/auto block per user's explicit new policy. Retain `--main` and prior `--native-default` as nonbreaking alias if feasible. Preserve Codex `--no-daemon` and TERM fix and P5.4 `--delegate ... add42` synthetic workers untouched.
3. **Actual persistent files, local only:** preserve current Codex + Hermes model/provider defaults. Edit only Claude user-level native settings with the OpenRouter gateway URL and initial exact NVIDIA model using real installed-supported fields. Any keys must remain local/secret; prefer root .env passed through child environment, NOT a plaintext `settings.json` token. For Claude pass `ANTHROPIC_AUTH_TOKEN` equal to root `OPENROUTER_API_KEY` and `ANTHROPIC_API_KEY=""` **only to its child**. `ANTHROPIC_BASE_URL=https://openrouter.ai/api` likewise. Existing cached vendor login, obligatory onboarding/theme may still appear; do not clear logout/session or accept anything on user's behalf.
4. Hermes has an existing native-home `.env` with its own `OPENROUTER_API_KEY` variable; installed Hermes overrides child env with it. Resolve this **without inventing another runtime interception layer**: after secure local-only backup, surgically synchronize **only** that one existing Hermes-native key entry with the canonical root `C:\Agentco\.env` key *without disclosing or committing either value*. Leave other native `.env` entries, permissions and authentication/session data untouched. This local duplicate is explicitly documented as a vendor implementation limitation; do not claim one physical key store after sync. If preservation/sync cannot be done safely with existing tools, report PARTIAL, but don't reintroduce the model-price gates or write a complex loader. Parent process env must remain untouched.
5. Codex key may come from the Agentco launcher child env, which reads the root key. **Standalone Codex** still requires `OPENROUTER_API_KEY` in that shell's environment; no OS-global/user secret-variable mutation in this task. The goal is an easy `agentco` menu. Similarly direct standalone Claude may not receive Agentco root key without a prepared shell; report this distinction, don't add OS registry copies.
6. Don't change the native TUI, models in Git, global application binaries, packages, Agentra, Pi settings, P5.4 Worker/AUTO, ignored runtime files, browser profile or worktrees. Make local-only backup of a local config before any edit and verify safe parsing, nonsecret selective differences, correct location and effective provider/model, with no credential or auth content echoed.
7. Focused tests: four Main choices open/resolve original executable with no secondary warning, Pi untouched, Codex no duplicated `-c` and keeps `--no-daemon`/TERM, Hermes inherits native persisted provider/model (not CLI overrides), Claude base URL/token mapping in child env and nonsecret native model setting, no API metadata/price checks, key absent -> a clear configuration error **rather than a vendor fallback** where possible, `--delegate` untouched. Limit to offline fake keys/mocks and no-prompt TUI inspect/start/exit. **No user model prompts, no paid inference or OAuth flow without separate user approval.** First-run consent remains user's responsibility.
8. Run only changed focused tests; old gate-related tests may now encode intentionally obsolete policy. Update/relabel tests minimally rather than retaining contradictory expectations. Commit/push only feature scripts/tests/docs (NO native config, backup, secret). Claude reviews diff and sanitized results independently. No main merge.

## Truthful reporting

`SHA`, `CHANGED_REPO_FILES`, `LOCAL_NATIVE_CONFIG_CHANGED`, `MODEL_DEFAULTS`, `AGENTCO_MENU_1_2_3_4`, `CLAUDE_OPENROUTER_GATEWAY`, `HERMES_KEY_SOURCE`, `NO_LIVE_INFERENCE`, `TESTS`, `MAIN_UNCHANGED`, `LIMITATIONS`.

**No more self-imposed free-price/compatibility guards; no inference auto-call; compatibility and costs are a user-visible caveat, not a claim of guaranteed free operation.**


## Execution delta (2026-10-14)

BASE_SHA: 0e168ab72799fe60e8fb56147862080a24a4fc23. Baseline origin/main 19dbd92ac17f7943c434adbab68e88f25d97ae64. Clean original checkout safely fetched/switched to the prepared tracking feature branch. No worktree/reset/stash/cleanup or main merge.

### Minimal runtime change

- Removed nativeFreeMain invocation, native-free-main.mjs and its obsolete gate tests. No native launch pricing GET, provider/model -c override, NVIDIA compatibility blocker, auxiliary guard or automatic alternative model. P5.4 synthetic Worker pricing/validation remains frozen.
- All four menu choices now return a native entry after exactly one question. Empty input still means Pi. --main and the existing Claude/Hermes --native-default parser alias continue working; alias no longer changes launch policy. Native args preserve original order/content; empty starts have no prompt appended. Codex alone retains --no-daemon (without duplicate) and child TERM fallback.
- Existing piEnv whitelist loader hydrates a single OpenRouter key into each non-Pi child's env; its established OS-env-before-root-file precedence is retained. On this PC the inherited OS key is absent, so canonical root .env supplies it. Parent env unchanged. Missing key is a clear local configuration error, not a paid vendor fallback; no new cost/compatibility gate is involved.
- Claude child receives ANTHROPIC_BASE_URL=https://openrouter.ai/api, ANTHROPIC_AUTH_TOKEN from the same root OpenRouter key, and ANTHROPIC_API_KEY empty. No token in argv or persistent JSON. Native inherited terminal/cwd/exit/SIGINT transport remains unchanged. No proxy, API translator, model ID alias/spoofing, install or logout.

### Local native state / secure backups

Codex C:\Users\mush2\.codex\config.toml and Hermes C:\Users\mush2\AppData\Local\hermes\config.yaml are NOT edited in P5.9. Existing persistent OpenRouter / nvidia/nemotron-3-super-120b-a12b:free defaults and Hermes side-task settings are preserved. Launcher no longer overrides those model/provider choices or claims their costs are locked.

Two machine-local changes, neither tracked/uploaded:

1. C:\Users\mush2\AppData\Local\hermes\.env: exclusive-create secure backup, then only the OPENROUTER_API_KEY entry reconciled to canonical root key. Equality was already true before sync and true afterwards; only that line's representation could change. All other dotenv bytes/comments/newlines were compared in memory and preserved. This is an explicitly authorized vendor duplicate store, not a claim of one physical credential file. Existing auth/session files untouched. Future root-key rotation needs corresponding local sync; no interception layer added.
2. C:\Users\mush2\.claude\settings.json: backed up, persisted exact initial model nvidia/nemotron-3-super-120b-a12b:free and nonsecret env ANTHROPIC_BASE_URL / blank ANTHROPIC_API_KEY; no ANTHROPIC_AUTH_TOKEN persisted. Existing unrelated JSON settings preserved semantically. Before model was unspecified. No consent/cache/login modification.

Backups are beside originals, UTC-stamped (the local work date is 2026-10-14):

- .env.agentco-p5-9-2026-10-13T22-39-59-584Z.bak in the Hermes native directory.
- settings.json.agentco-p5-9-2026-10-13T22-39-59-584Z.bak in the Claude native directory.

Backup ACL inheritance removed; current user and SYSTEM only. Backup bytes verified locally. Existing original permissions maintained by in-place writes; no overwrite/deletion of prior backups. Hermes backup contains credentials and remains private/local; never output/read into reviewer context or stage it. Root .env is not moved, copied into Git, hashed or displayed. Local synchronization operated on tokens only in memory and emitted paths/booleans, not values/lengths/hashes. No OS registry/global env change.

### Official Claude route and actual startup outcomes

[OpenRouter Claude integration](https://openrouter.ai/docs/cookbook/coding-agents/claude-code-integration) documents the Anthropic-compatible endpoint and bearer-token/blank-API-key combination. It only guarantees Anthropic first-party compatibility. The requested NVIDIA initial model was attempted as its exact honest ID; no behavesAs/modelOverrides mapping or native catalog enforcement bypass was used. User accepts best-effort native launch; this is not a claim of supported NVIDIA chat.

All smoke tests used actual bin/agentco.cmd menu selection, without provider/model overrides, extra cost warning or model prompt:

| Menu / native CLI | Result | Exit / limitation |
| --- | --- | --- |
| 1 / Pi 1.0.4 | Original TUI, unchanged NVIDIA Ultra :free | Ctrl+D exit 0, terminal restored |
| 2 / Claude Code 2.1.292 | Original TUI/onboarding opened, exact NVIDIA initial ID loaded | Native catalog warning: requested ID is not described by this installed catalog; assumes 200k context. Theme/onboarding remains; no acceptance/login/model prompt. Cancel keys did not cleanly close this PTY instance; verified foreground smoke child alone was stopped, outer exit 1 |
| 3 / Codex 0.162.1 | Original TUI showed persisted exact NVIDIA Super :free | No injected -c; no subscription/model picker; Ctrl+D exit 0 |
| 4 / Hermes 0.21.7 | Original TUI showed persisted NVIDIA Super | No provider/Nous subscription picker; no launcher compatibility/cost block; Ctrl+D Goodbye, exit 0 |

Claude was not preblocked; the actual native warning/onboarding is preserved as observed. Cancellation cleanup verified exact child PID, creation time and parent launcher identity before terminating that newly launched foreground child; no preexisting Claude session/process was targeted. No process-management code was changed to hide this result. Gateway authentication and NVIDIA Messages API inference were NOT tested because no model call is authorized. First-run human action and native PTY cancellation remain independent limitations.

MODEL_PROMPTS=0; no inference or authenticated account API query; no public price check in this batch. Background native networking unmeasured. Existing browser/Agentra/runtime/stash/session state preserved; native new startup artifacts retained. Pi startup changed only lastChangelogVersion; after comparing all other fields equal, that startup-only settings delta was restored to exact original bytes. Pi source/settings have no final delta.

### Focused checks / changed files / handoff

11 focused offline tests PASS: seven current P5.9 menu/args/env/transport/dummy-root checks and four narrow existing native-plan/tag/daemon/TERM cases adjusted for child credential plumbing. No broad P3-P5.8 suite, P5.4 live Worker/model test or new dependency. Dummy fixtures contain only generated dummy keys and source code, never real .env or native profile data.

Checks cover one menu question for all four Mains, no metadata fetch, no appended prompt/-c/model choice, preserved aliases/Worker parsing, child-only Claude endpoint/bearer mapping, Pi unchanged, missing key configuration error, native stdio/cwd/signal/exit, actual root-loader present/absent fixtures and no token in argv. Local checks separately verify only Hermes key entry changed, Claude unrelated settings equal and no token persisted. Syntax, diff, UTF-8/scope, frozen Worker/AUTO/exit-transport and secret-pattern scans PASS. Obsolete fail-closed/confirmation tests were replaced or removed instead of retaining contradictory policy.

CHANGED_REPO_FILES: scripts/agentco.mjs, scripts/agentco.test.mjs, scripts/native-default.test.mjs, scripts/shared-env-native.test.mjs, docs/CURRENT_TASK.md, this work order; removed scripts/native-free-main.mjs and scripts/native-free-main.test.mjs. No native configs/dotenv/backups in Git. Sanitized evidence: results/p5-9/local-profile-result.json / execution.json (ignored). Existing docs/test histories remain in Git; no old work-order rewrite. Feature commit/push only; main/stashes unchanged.

NEXT: Claude independent new-SHA/delta and sanitized evidence review. GPT/user release decision. Standalone Codex/Claude still need a prepared environment for the root key; normal Agentco supplies it. Native users can change models and incur charges; neither startup nor saved :free identifiers guarantee compatibility or future cost. Any actual inference needs separate approval. No further protective framework or auth workaround introduced.


## Final independent review and bounded release — 2026-10-14

- **Reviewed implementation SHA:** `e35191fedfc2c8b4ab670a087b22daa3df4f9aec`. Claude independently verified **PASS** for the requested native-config-first simplification. **15/15 associated offline tests rerun PASS**, no model/API/login calls, no key values or raw private config exposed. Reviewer: no critical findings, no required code fixes; origin feature HEAD equals reviewed implementation prior to documentation closure.
- **Released scope:** One-question native menu starts Pi/Claude/Codex/Hermes without Agentco's old pricing GET, compatibility blocker or second opt-in. Installed native persistent provider/model config determines defaults. Codex retains `--no-daemon` / child TERM repair; Hermes has no injected provider/model args; Claude receives OpenRouter's officially documented Anthropic gateway env mapping in its **child only**, with exact NVIDIA model requested. P5.4 AUTO/Worker, Pi and native process transport unchanged; no other live framework added.
- **Local files:** Codex/Hermes persisted native settings retain their models. Claude user settings have only nonsecret endpoint and exact NVIDIA model; literal bearer token never persisted. Hermes-native .env key was aligned to root key with local secure backup and sanitized equality checks; an **additional local credential copy still exists** and root rotations require resynchronization. The reviewer relied on sanitized evidence and did not inspect actual secret values.
- **Known limitations:** Claude TUI still shows first-run theme/onboarding, and unknown NVIDIA catalog entry / assumed context warning; **no live inference or protocol compatibility claim**. Claude native PTY cancellation produced outer exit 1 in implementation smoke after targeted smoke-child termination. Hermes/Codex TUI startup likewise does not certify successful chat, tool/auxiliary behavior or charges. No prompt was sent by implementation or review. Removing cost gates is an **intentional user-requested product decision**, not proof of zero cost.
- **Specific Claude auxiliary billing risk to mitigate before first live Claude chat:** The new Claude child env pins the gateway token/base, but does NOT pin `ANTHROPIC_DEFAULT_HAIKU_MODEL`, `ANTHROPIC_DEFAULT_SONNET_MODEL`, `ANTHROPIC_DEFAULT_OPUS_MODEL`, `CLAUDE_CODE_SUBAGENT_MODEL` (and possibly version-specific fast/small aliases). Claude Code may route secondary calls using vendor-default Claude IDs, potentially to billable OpenRouter models. Reviewer recommends **small follow-up using native-supported nonsecret persistent settings wherever possible**, all pointing to exact `nvidia/nemotron-3-super-120b-a12b:free`, and one child-only override if native environment is unavoidable. This is NOT a request to reinstate Agentco free-price/model execution blocks, but it should be addressed before actual Claude model prompting. Even all aliases pinned does not guarantee that non-Claude NVIDIA is supported or cost cannot change.
- **Other optional cleanups:** `--help`/`--version` require key currently; keeping `--native-default` as parser compatibility alias is intentional. No new change required for this review.
- **Release instructions:** Fast-forward feature into origin/main only if main remains previous approved SHA `19dbd92ac17f7943c434adbab68e88f25d97ae64` and only docs have changed since reviewed SHA. Preserve local stashes/profiles/browser/ignored files. Do not silently run a live chat or touch another account.
