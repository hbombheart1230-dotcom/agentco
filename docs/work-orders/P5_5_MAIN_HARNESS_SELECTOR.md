# P5.5 - Select Main Harness + explicit named delegation

**Status:** user-directed TUI activation correction pending; prior scoped Claude review PASS at c167989 (2026-10-13)
**Base main:** `cc6078fed3e1d9b4c0103a8de8d9c0a18ac1f37e`
**Assigned feature:** `feature/p5-5-main-harness-selector`

## User intent (authoritative)

The user wants **minimal additive work** and strongly prefers keeping existing implementation untouched:
- `agentco` opens a lightweight menu: `1 Pi [default] / 2 Claude Code / 3 Codex CLI / 4 Hermes`. Enter chooses Pi. **The selection MUST immediately open that existing official CLI's native interactive TUI**, not just `--version`/`--help`.
- Explicitly saying "ask Pi to do X", "have Codex verify X", "use Claude", "delegate to Hermes" should be supportable from the selected Main using the **smallest official-native means** to reach the named other CLI. No silent substitution to another CLI.
- **If no target harness is named, do NOT invent routing or modify the old AUTO policy.** The selected Main behaves as before; any already-supported AUTO mechanism is used unchanged. Do not turn AUTO into round-robin or reimplement the P5.4 dispatcher.
- Keep the installed native CLI appearance/features; do not create a common chat UI or orchestrator.

### Accurate current boundary (avoid promises)

The existing `pi-dev/extensions/harness-delegation.ts` routes `/harness auto add42` deterministically to Claude and named routes to Claude/Codex/Hermes for **`add42` only**. A normal arbitrary job, freeform prompt, browser work, or universal 4-Main handoff has **not** been verified. There is no general automatic worker rotation already proven. It is forbidden to silently treat `add42` as a general-worker PASS. Existing P5.4 source, mock fixtures, CLI synthetic runtime isolation, result schemas, free-only price gate and AUTO choice are **frozen** in this phase.

## Scope A — launcher (mandatory)

Read only relevant live files: `bin/agentco.cmd`, `pi.cmd`, `scripts/pi.mjs`, `scripts/env.mjs`, and minimal names/resolver functions in `scripts/commander.mjs`. Inspect local official CLI startup commands/versions and environment by executable path/metadata, **not** auth contents.

- Implement a minimal Windows `agentco` entry/menu (PowerShell/Node/Batch, choose the smallest reliable option). It must launch Pi/Claude/Codex/Hermes as **native** process, with actual inherited interactive stdin/stdout/stderr; propagate exit codes and Ctrl+C, restore original working directory and terminal behavior. No nested Pi around non-Pi CLI.
- `agentco` (interactive, no args) shows menu and Enter selects Pi; 1/2/3/4 select corresponding Main. Invalid selection repeats or safely errors. If no TTY, do not block in a menu; preserve legacy Pi behavior or fail with explicit usage when ambiguous.
- `agentco --main pi|claude|codex|hermes` offers deterministic/scriptable choice without menu. Keep existing `agentco --version`, `agentco [Pi args]`, `pi.cmd`, `node scripts/pi.mjs` functional and backwards-compatible. Use argument forwarding without broken quoting/paths with spaces.
- Locate native executables from trusted paths/installed local config. Do not use P5.4 synthetic child-only TEMP HOME/config as Main; those are for fixed isolated `add42`, not general interactive sessions. Avoid modifying/exposing existing native profiles, local auth, secrets, stashes or installed files. **Do not block launching the installed native interactive TUI merely because the Main's model/provider cost profile has not been verified; the previous metadata-only `CONFIG_REQUIRED` gate was an incorrect interpretation of the user requirement.** TUI process start is not proof of free-model chat readiness. Never automatically submit a model prompt, reconfigure provider, or silently select a paid model/fallback; if free-only routing is unverified, surface this honestly as a warning/known gap without blocking an otherwise safe native TUI launch. If an actual startup action would itself incur an unverified paid call, fail closed for that specific documented case.
- Pi default must preserve current exact-pinned v1.0.4 and model/settings/extension load. Other Mains use native supported configuration and existing install; no automatic installs/upgrades.

## Scope B — minimal explicit named delegation (must investigate and implement what is safely supported, not a rewrite)

**Order:** Get Scope A working first. Inspect whether each native Main supports an **official extension/skill/tool/hook or CLI subcommand** sufficient to invoke a named CLI. Prefer the existing supported native mechanisms and thin connector(s) over custom infrastructure. Don't modify the P5.4 `harness-delegation.ts` nor `scripts/commander.mjs`; use additive files only.

- Provide one simple explicit named-handoff contract available to all 4 Mains where supported. Examples: "Codex로 검증해" on Pi/Claude/Hermes should call real Codex; "Pi한테 확인시켜" on another Main should invoke real Pi. Honor named target, pass only explicitly scoped task/context, and return the true target's result with identity. Target equals current Main -> execute locally, not spawn self.
- The native chat **must not silently pretend** to have delegated. When natural-language tool invocation cannot reliably be supported through a particular Main's official mechanism, offer a deterministic explicit command or documented invocation for that Main and report `PARTIAL`. Do not implement a broad Korean/English regex conversational parser or an invented generic chat shell.
- User may explicitly request a simple sequential handoff ("Claude implements, Codex reviews"). Use native workflow mechanisms if supported. Do **not** create a queue/scheduler/router framework or automatic chains to meet this.
- Named delegation must be opt-in per request. No implicit handoffs; untargeted messages retain existing Main behavior/AUTO. Preserve `/harness auto add42`, all `/harness {name} add42` and present Worker policy exactly as is. No new `auto` algorithm.
- For useful scoped real tasks, don't reuse fixed `add42` child's zero-tool configs as if they were general-capable. Introduce **separate explicit-task** invocation only if it can be isolated, bounded, and configured without touching P5.4, with exact free model/provider selection verified (prompt/completion price 0) and no paid fallback. Default to read-only / synthetic or scoped repo fixture; file modifications only with an explicit user permission gate and a separate safe working-tree contract. Check official CLI permission/sandbox flags rather than defeating built-in protections. Never send private data, bank pages/auth/profile contents, secrets or other unrelated files to external free models.
- A failed/missing target is `NOT_READY` or `FAIL`, no silent alternate Worker. Budget/timeouts/abort/result limits; treat user text as data not shell code; no `shell=true`, injection, unchecked arbitrary path or unfiltered stderr. No new shared Skill execution adapter, custom agent framework, or generic common-UI abstraction.
- If the narrow additive implementation can't satisfy bounded safety, implement Scope A only and report Scope B as `PARTIAL/BLOCKED` with precise reason, rather than rewriting already accepted code.

## Git, local-state and isolation rules

- Personal Agentco only. Never consult or move company/cowork-cli source, configurations, credentials or documents.
- Remote `main` is authoritative. Existing separate `feature/p5-5-samsungpop-readonly-browser` branch is **parked/unchanged**; don't merge it or work on finance/browser code. The browser phase can be renumbered when resumed.
- Canonical workspace `C:\Agentco`; check `git status` / branch / remotes / local changes and stash metadata **before** checkout. If checkout would disturb tracked/untracked user work, stop and report rather than stash/reset/clean/force-push. No second worktree without a concrete reason.
- Only current work order plus minimal live source. No re-reading P3-P5.4 reports or rerunning their model/API tests.
- Do not modify `AGENTS.md` global role policy unless a very specific new durable rule is absolutely necessary and separately explained.
- Codex implements, runs narrow tests, commits/pushes feature only. Claude independently verifies exact implementation SHA and scoped diff. GPT/user decide merge.

## Acceptance — focused, honest evidence

1. **Launcher unit/offline:** menu default/1..4/invalid input, no-TTY path; previous `agentco --version` and Pi args still work. Mock process-launch arguments and env, Windows quoting, path-with-spaces, exit-code propagation, Ctrl+C/TTY handoff. No dependency installs or paid model calls in tests.
2. **Native CLI smoke:** user-local no-prompt interactive startup, then clean exit, for all **four real native TUIs** (or report a truthful per-CLI environment failure). Native startup must not be gated on a new profile. Verify model route is free **before any live inference prompt**, not as a prerequisite to opening a TUI. Label `LIVE / MOCK / NOT RUN / BLOCKED`, and distinguish TUI-open success from free-provider chat success.
3. **Explicit named delegation:** offline test proves requested identity is invoked, task is scoped/sanitized, failure has no fallback, no-target leaves same Main/default-AUTO, and P5.4 `add42` implementation was unchanged. For each Main, report **NATIVE-CHAT VERIFIED / EXPLICIT-COMMAND ONLY / NOT_READY**. Never claim natural language recognition works without a live authorized test.
4. **Regression boundary:** narrow tests only; old P5.4 suites do not need rerun if files unchanged. Verify P5.4 core files unchanged with Git diff. No browser/finance code diff.
5. **Handoff**: show `BRANCH`, `BASE_SHA`, `IMPLEMENTATION_SHA`, `MAIN_LAUNCH_MATRIX`, `EXPLICIT_DELEGATION_MATRIX`, `AUTO_UNCHANGED`, `MODEL_COST_GATE`, `TESTS_LIVE_VS_MOCK`, `CHANGED_FILES`, `KNOWN_GAPS`, `PUSH`. NEVER mark a capability PASS merely because the command exists.

## Execution result (2026-10-13)

BRANCH: feature/p5-5-main-harness-selector. BASE_SHA: 031391225edfbe2adc6fc438d7c9dc183a1dd66c (prepared feature), released main cc6078fed3e1d9b4c0103a8de8d9c0a18ac1f37e. Clean safe fetch/switch; no stash/reset/force/worktree/browser branch change. IMPLEMENTATION_SHA is the feature commit reported at handoff. **Overall PARTIAL**, with implemented selector and bounded explicit fixed-job connector; no claim of four general Main-ready profiles.

### Native entry / model readiness

bin/agentco.cmd now launches scripts/agentco.mjs, still pushd repository root/popd caller, using setlocal to preserve caller environment and native exit code. TTY/no-argument menu: 1 Pi default, 2 Claude, 3 Codex, 4 Hermes. Enter chooses Pi; invalid input repeats; cancellation exits without spawning. No-TTY defaults to legacy Pi without blocking. --main pi|claude|codex|hermes selects explicitly; legacy --version and Pi args stay Pi. Argument arrays, shell=false and inherited stdin/stdout/stderr preserve native CLI surfaces, without a common chat UI or nested Pi. Native Main Ctrl+C is delivered through the shared console; parent waits rather than separately killing a recycled PID. Native TUI terminal modes are restored on exit.

Trusted existing resolver functions locate exact installed CLIs. Pi launches the same upstream bundle with piEnv and existing model/settings. Other CLIs support native --help/--version metadata, but general conversation is fail-closed CONFIG_REQUIRED until a separate general Main free-only profile/context boundary is verified. No existing native auth/profile contents inspected or edited to bypass that gate. This implementation deliberately cannot enable arbitrary non-Pi Main conversations merely by installing their executable. No paid/default model guessed, no fallback, no synthetic TEMP Worker profile presented as Main.

| MAIN_LAUNCH_MATRIX | Metadata | General conversation |
| --- | --- | --- |
| Pi | LIVE 1.0.4; legacy agentco --version exit 0 | LIVE TTY: Enter opens native Pi, existing NVIDIA Ultra free footer; no model prompt; Ctrl+D clean exit 0 |
| Claude Code | LIVE 2.1.292 | CONFIG_REQUIRED; native general free-only profile/context not verified |
| Codex CLI | LIVE 0.162.1 | CONFIG_REQUIRED; native general free-only profile/context not verified |
| Hermes | LIVE 0.21.7 | CONFIG_REQUIRED; native general free-only profile/context not verified |

TTY menu selection 2 correctly reports Claude CONFIG_REQUIRED without another Main. TTY menu Ctrl+C cancels without child; outer PowerShell reports exit 1, while mocked native signal propagation maps SIGINT to 130. Pi TUI Ctrl+C is left to Pi (clear/interrupt behavior); Ctrl+D exits and restores terminal. This is not a claim of full Ctrl+C behavior across three gated native conversations.

Pi startup itself updated lastChangelogVersion 1.0.2 -> 1.0.4 and removed settings EOF newline. Verified this was the only settings semantic change, then restored the baseline bytes. Existing settings/model/policy remain unchanged. The new empty smoke session is retained; no session/runtime cleanup. Startup update notice was not acted on.

### Explicit named contract / native investigation

New deterministic external invocation: agentco --delegate claude|codex|hermes add42. Existing P5.4 runSynthetic functions are called directly, with their exact free pricing/native provider/sandbox/timeout/Abort/result gates, no nested Commander or copied worker code. Only literal add42 accepted; extra/private task text and arbitrary paths rejected. Returned identity/status/output must match requested harness, otherwise FAIL; no alternate helper/model. CLI cancellation forwards to existing safe execution. Child Pi Main gets a process-local AGENTCO_MAIN tag; known self-target requests refuse self-spawn and direct local native handling. External Pi Worker is NOT_READY because no verified additional scoped Pi path was added.

This fixed synthetic connector is **not** generalized explicit-task execution or natural-language recognition. No real source task, model-driven chain, native Skill adapter, new hooks/plugins or regex parser. Existing Pi /harness commands remain the native in-chat fixed-job route; no configuration changes are necessary. In other native Mains, the deterministic invocation is documented for the terminal or an already available native shell facility, not automatically installed as an in-chat command.

| EXPLICIT_DELEGATION_MATRIX (new surface) | Result |
| --- | --- |
| Pi Main | EXPLICIT-COMMAND ONLY for new entry; existing /harness fixed-job interface unchanged |
| Claude / Codex / Hermes Main | EXPLICIT-COMMAND ONLY outside chat; general Main blocked, native-chat recognition NOT RUN |
| Named Claude/Codex/Hermes add42 | MOCK wiring/identity PASS; existing frozen native route reused; new entry live inference NOT RUN |
| Pi external target / known self-target | NOT_READY/local handling; no self-spawn or substitute |
| Arbitrary task / sequential chain | NOT_READY / unsupported; no safe general scope contract added |

Official capability references inspected: [Pi Extension API](https://pi.dev/docs/latest/extensions), [Claude CLI](https://code.claude.com/docs/en/cli-reference), [Codex CLI](https://developers.openai.com/codex/cli/reference/), [Hermes CLI](https://hermes-agent.nousresearch.com/docs/reference/cli-commands). They expose native extension/tool/command mechanisms, but their existence does not prove a universal safe named free-task bridge. Installing hooks/Skills or replacing contexts/permissions would require a separate scoped configuration/integration; no such claim or change here. Scope B therefore PARTIAL, following the work order's permitted safe narrow outcome.

AUTO_UNCHANGED: frozen harness-delegation.ts/commander.mjs, settings, Skill files, pi.cmd and scripts/pi.mjs/env.mjs have no Git diff. New explicit --delegate branch never runs for untargeted input. Existing AUTO remains Claude for add42; no rotation or algorithm.

### Tests / cost / handoff

Five focused new tests PASS: menu/default/four choices/invalid/no-TTY/legacy args; exact resolver/readiness gates and argument forwarding; inherited terminal/shell=false/mock exit and Ctrl+C; fixed named identity/failure/no fallback/self guard; actual Windows batch fixture with spaces/quoted argv/exit 23/caller cwd. Initial Windows fixture driver quoted cmd.exe incorrectly; added Windows verbatim argument handling to that test only, then reran that failed case PASS. No old suite/model test repeated.

TESTS_LIVE_VS_MOCK: LIVE four native versions, real agentco --version, TTY menu/Claude gate/cancel/Pi native UI/clean exit, three CONFIG_REQUIRED no-prompt guards, Windows cmd fixture. MOCK invocation identity, fake/wrong Worker outputs, exit/signal forwarding, menu mapping and no-TTY choice. NOT RUN: new connector provider inference, arbitrary delegation, non-Pi conversational TUI, natural-language recognition or chains.

MODEL_COST_GATE: no model prompt or authenticated inference in this batch. Non-Pi general Main does not launch unverified model/profile; the explicit fixed-job connector keeps the unchanged P5.4 immediate public-zero pricing gates. No new live price check was needed/performed. Main Pi model unchanged, no private data sent. Native help/version UI startup is not model readiness or provider billing proof.

CHANGED_FILES: bin/agentco.cmd; scripts/agentco.mjs; scripts/agentco.test.mjs; docs/CURRENT_TASK.md; this work order. Evidence only ignored results/p5-5/implementation-summary.json, no raw UI/session/auth/env output. UTF-8/line endings, syntax, diff-check, frozen-source comparison, intended five-file scope, stash/main/history/browser preservation and secret/path review checked. One feature commit/push; no main merge.

KNOWN_GAPS: three non-Pi general Main profiles need separately verified free provider/auxiliary/context boundaries and launcher activation; broad natural-language/scoped real tasks need official native integrations and a safe task contract. Current connector is only add42, external Pi/self-target is not implemented as a worker. Review these exact limitations, not the completed P5.4 tests.

Next: one Claude independent exact-SHA code/evidence review, no fresh model/API calls; GPT/user acceptance/release decision. Freeze feature until review; parked browser branch untouched.


## User correction after scoped review — applies over earlier implementation assumptions (2026-10-13)

**The user explicitly clarified: “4개다 CLI/TUI에서 동작하면 된다.”** They intended a selector that chooses an already-installed native interactive TUI, preserving all existing CLI features and P5.4 behavior. The previous implementation `c167989e727e633e2ca8f0810636ceb48ccccfe9` passes its narrow Claude review, **but fails the intended 4-TUI experience** because `mainPlan()` gates every non-Pi no-argument start as `CONFIG_REQUIRED`.

**New scope is deliberately tiny and takes precedence over any older statement suggesting CONFIG_REQUIRED for non-Pi TUI launch:**

1. Remove metadata-only `CONFIG_REQUIRED` blocking for existing trusted Claude Code, Codex CLI and Hermes executables. `agentco` → 2/3/4 must actually start the corresponding installed native interactive TUI, just like 1 launches Pi. Support `agentco --main claude|codex|hermes`. Preserve native stdio/TTY, working directory, ordinary native arguments and process exits. Do not emulate UI or create proxy chats.
2. Use each native CLI's existing installed user configuration/identity, with no new temporary Worker HOME, no forced synthetic P5.4 settings, no auto-install/login/reconfiguration, and no automatic startup prompts. **Do not confuse TUI startup (which should work) with validated free-model messaging (which may require later configuration).** If a specific CLI opens but its provider is not usable, report that separately.
3. Cost handling: never auto-send an inference prompt or silently switch to a paid/default model. If safe local **non-sensitive model metadata** can be determined without reading credentials, report effective model/provider and whether known free; otherwise report **UNVERIFIED**, without treating lack of evidence as TUI startup failure. Do not run paid or unverified model prompts for testing. Respect the user's existing free-only preference; do not edit their CLI profile or secret files.
4. Pass `AGENTCO_MAIN` for whichever Main is selected (only harmless process metadata); maintain the existing fixed `--delegate add42` self-target guard. Do **not** touch `pi-dev/extensions/harness-delegation.ts`, `scripts/commander.mjs`, P5.4 AUTO choice, or existing Worker runtime. General chat natural-language delegation remains a separate unmet feature, not a new requirement of this correction.
5. Focus tests on 4× no-argument `mainPlan`, all 4 TUI launches with inherited stdio and accurate exit/cancel, and regression of `--version`, legacy Pi args, `--delegate add42`, AUTO immutability. User-local live tests must not send prompts, access secrets, or incur inference. No historical P5.4 reruns.
6. Commit/push a minimal implementation correction on **the same feature branch**, then have Claude independently verify only the new SHA/delta. **Do not merge main until this correction is reviewed**; earlier PASS was accurate for the wrong narrower UX boundary.

Existing documented Execution result is historical evidence for SHA `c167989`, not the final user-facing TUI acceptance.
