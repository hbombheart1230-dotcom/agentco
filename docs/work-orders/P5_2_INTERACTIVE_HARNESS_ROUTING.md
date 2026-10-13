# P5.2 - Pi interactive Commander: automatic and explicit harness dispatch

**IMPLEMENTATION PASS (Claude minimum) / THREE-HARNESS PARTIAL / REVIEW PENDING (2026-10-13).** The user explicitly requests BOTH (a) automatic Worker selection and execution in a normal Pi session, and (b) naming a specific harness to execute. This is a real runtime integration task, not a design-only phase. Execute one substantial Codex batch, then one Claude independent review; avoid repeated micromanaged approval gates.

## Grounded baseline (do not repeat)

- Stable released main: `bb1ccc71a5b72446c93022c01876f0a24e9ac135`. P5 Pi -> Claude CLI -> Pi synthetic text PASS; P5.1 native Claude Read/Edit in a fabricated JS project + trusted Node test + Pi final correspondence PASS. P5.1 independently checked 22/22 offline tests; final implementation artifact was selectively promoted. Accepted files: `scripts/commander.mjs`, `scripts/commander.test.mjs`.
- Actual everyday Pi launcher: `node scripts/pi.mjs`, with `PI_CODING_AGENT_DIR=<repo>/pi-dev` from `scripts/env.mjs`. Current `pi-dev/settings.json` includes official Pi `subagent`, plan-mode, project security extensions, canonical shared Skill path, default OpenRouter NVIDIA Ultra `:free`. Do NOT mutate its default model/provider, package pins, existing Extension/Skill settings except one scoped new extension registration.
- Installed Windows CLIs: official Claude 2.1.292, stable Codex CLI 0.162.1 in ignored `results/p3/tools/codex/0.162.1/codex.exe`, Hermes v0.21.7 under its official user-scope install. Installation PASS != actual Worker/Skill/sandbox readiness. Codex/Hermes provider+isolation/auxiliary-free execution remains UNKNOWN/PARTIAL. Don't import P3 experimental source or assume tested tool editing on them.
- Architecture policy: **native feature first; own as little code as possible**. Common portable Skill contents under `shared/skills`; each harness independently uses its official native discovery/invocation. **NO common Skill execution adapter**. The shipped official Pi subagent tool launches Pi-based agents, NOT another Claude/Codex/Hermes CLI. Preserve it and use a DISTINCT route/tool name.
- Official Pi extension APIs (verify installed 1.0.4 definitions): `pi.registerTool()` for model-callable delegation and `pi.registerCommand()` for user-directed slash command. Docs: https://pi.dev/docs/latest/extensions . First check if an already-installed trusted Pi extension supports the exact named external CLIs, auth isolation and free-only routing without conflicting with official `subagent`; if not, use ONE minimal native Pi extension. No new manager, SDK fork, agent process daemon or skill loader.
- Repo security: main, existing runtime, sessions, stash (both entries), personal/vendor configuration, auth and user's changes MUST survive. Do not transmit personal/project/company code, AGENTS.md, session transcripts, or credentials to external free models.

## Product surface — must be real Pi, not standalone command simulation

From `C:\Agentco`, start **ordinary Pi session** via `node scripts/pi.mjs`. New Pi-native registration should offer TWO equivalent entrypoints:

**Natural auto delegation**: ask Pi to delegate the fixed fabricated add42 job automatically and return the result. Pi invokes agentco_delegate with harness=auto and job=add42 in the same session.

**Explicit harness selection** (not ignored): `/harness auto add42`, `/harness claude add42`, `/harness codex add42`, `/harness hermes add42`. Optionally `/harness claude edit42` to connect existing fixed toy edit if no recursive Commander launch is needed. User-provided direct command must execute the named installed CLI when eligible, not merely tell the Commander to try that route. No silent choice override, alias confusion or automatic switch to Claude if the user explicitly picked Codex/Hermes.

`/harness status` should succinctly show `available|blocked|unverified` per harness based on proven route, not installed-version inference. `auto` may select **only verified-ready capabilities**; initially Claude for synthetic text and toy edit, and add Codex/Hermes to the auto eligible set only AFTER genuine native smoke/safety gates pass. Deterministic capability policy first, not a second LLM router or added model prompt for role selection. If a Worker is unverified, an explicit request returns a clear **NOT_READY/UNAVAILABLE** with exactly why and next missing check, no fallback and no provider call. No "auto = choose everything at random."

The job interface in THIS milestone must be restricted to **owned fabricated job tokens**, e.g. `add42` and optionally `edit42`. Use only fixed, publicly innocuous test inputs for external calls. Do NOT forward free-form Pi task text, open file contents, user project paths, session context, tool traces, credentials or model-supplied shell commands to an external CLI. An arbitrary private-source coding Worker is a LATER stage with separate local/trusted auth and workspace boundary approval. If in doubt, refuse and list supported synthetic jobs. This user expects future general delegation; report the limitation explicitly, do not imply production-general readiness.

## Implementation — one thin extension and official worker CLIs

### A. Pi interactive registration and Claude: REQUIRED

1. Prefer one small official-compatible `pi-dev/extensions/harness-delegation.ts` (or similarly named single-file extension) and ONE additive path in `pi-dev/settings.json`. Register `agentco_delegate` (distinct from existing upstream `subagent`) and `/harness` command. Both use the exact same local route/validation function, return truthful harness/mode/job/status/result metadata, no duplicated logic. Natural-language auto uses the model-callable tool; explicit command dispatches directly to the chosen harness. Preserve all existing extensions (security, checkpoint, official subagent), packages, Skill path, default provider/model and interactive behavior.
2. Reuse the proven P5/P5.1 worker invocation and safety pieces in `scripts/commander.mjs` (e.g. export a narrowly scoped callable function or minimally extract a shared *pure* subprocess helper). Avoid executing `node scripts/commander.mjs` from the Pi tool if that would spawn an **extra nested Pi Commander**; the installed Claude CLI must be directly invoked by the active Pi session and its result returned to that same session. Keep legacy `commander.mjs` text/`--toy-edit` launch commands working untouched or through a measured tiny shared-helper extraction. No vendor Pi modifications or new npm packages.
3. Child workers: owned off-repo ephemeral toy cwd and child-only homes/config. Text/no tools for `add42`; only previously validated native file-tool subset for an opt-in `edit42` fixture. Strict bounded cancellation/timeout, stdout limits, known-child termination and sanitized error handling. Never print secrets or persist auth in traces. Do not give native Pi's general filesystem tools to external workers.
4. Verify the real interactive tool and slash command can coexist with the upstream `subagent`; no tool/command collision, malformed settings or surprising multiple registration. Do not write a new broad permissions framework. For Pi's default Ultra `:free`, **keep default model unchanged** and do not assume it is the same as Claude Worker's pinned Super `:free`. Free-model/public pricing and exact route must be checked before live calls; zero-cost status is not proof of provider invoice.

### B. Codex / Hermes named external routes: TRY IN THIS SAME BATCH, but no unsafe fallback

5. Inspect **installed** native CLI help plus relevant provider/tool/config controls exactly once, offline. Confirm each can run a bounded **text-only** synthetic `add42` from an owned disposable cwd, with a child-only config/home, exact OpenRouter `nvidia/nemotron-3-super-120b-a12b:free`, no paid/auto auxiliary/fallback provider or unexpected model, no real repo/session/skills/tool access, and no login/profile rewrite. For Codex, preserve its exact independently installed binary and existing VS Code Codex. For Hermes, disable auxiliary memory/title/smart routing, terminal/web/skills and any other toolsets through supported native flags/config. No WSL, containers, Windows feature installs or global changes. Vendor docs should be consulted rather than inventing flags or assuming OpenAI account subscriptions.
6. If all safety gates for a named harness can be verified, wire its thin native invocation to `/harness codex add42` or `/harness hermes add42`, and run ONE truthful synthetic call. Save observed model/result and then enable that capability in `auto`. If any gate is unknown, **do not run the model**, do not reuse paid auth/provider as fallback, do not patch vendor source. Return explicit `NOT_READY` (including /harness status). This may result in partial three-worker coverage without blocking the required interactive Claude path. No fake PASS for installed-only CLI.
7. Keep harness-specific Skill invocation syntax native. Do not add shared Skill adapters, auto-copied files, symlink migrations or specialized `hermes-dev/` / `codex-cli-dev/` placeholder directories during this phase.

### C. Acceptance, evidence and handoff

8. Offline test real extension registration against installed Pi 1.0.4 + mocked route invocations; verify `auto` selects only READY, `claude` stays Claude, explicit `codex/hermes` NEVER silently becomes Claude, unknown modes/jobs reject, secrets/private args blocked, auto does not randomly choose models. Verify original `commander.mjs --check` still passes; don't rerun the 22 accepted P5.1 lifecycle tests solely to accumulate counts. No new package installs.
9. ONE real everyday Pi session case with **automatic** `agentco_delegate` tool call and real installed Claude CLI synthetic `add42` result returned into SAME session; ONE explicit `/harness claude add42` native command case. Bound **at most 8 newly started top-level CLI model prompts TOTAL** across Pi and available Workers including any safe Codex/Hermes smoke; keep the count and per-harness events. Never claim physical HTTP usage equals prompts. Avoid repeating a working case for timing stats. If CLI command itself can be exercised through Pi extension host without LLM, prefer that.
10. Optional `/harness claude edit42`: reuse exact frozen P5.1 byte-verified toy edit and host Node test where it is a straightforward thin reuse. Do NOT gate the two required text routes on it, do not reopen arbitrary repo write permission, and never simulate editing through host if the actual native Claude edit is not invoked.
11. Evidence only under ignored `results/p5-2/`: manifest of synthetic job, actual worker executable/route identifiers without machine-private paths, observed exact model, dispatch/return correlation, structured PASS/NOT_READY/FAIL, safe test result, and sanitized error/status. No raw prompts from real conversations, secrets, proprietary source, private paths, auth, sessions or worker full environment in committed changes.
12. Touch only the needed small Pi Extension, one settings registration, minimal shared reuse change to `scripts/commander.mjs`/tests if unavoidable, `docs/CURRENT_TASK.md`, this P5.2 work order and tiny targeted test. Avoid changes to README/AGENTS/WORK_PLAN and past P3/P5 work orders unless strictly required. Run `git diff --check`, minimal syntax/extension-load tests, staged secret/path check; one feature-only commit/push and short Korean result. **Do not merge main**. Preserve stash, user/local ignored runtime and feature histories.
13. One final Claude independent review of the implementation SHA and ignored synthetic evidence, **zero new provider calls**, then GPT/user decide acceptance/main promotion. If Codex/Hermes remain blocked, report exactly which verified capabilities work and one concrete missing native security/provider condition each, not an endless audit. No more micro-gates for already verified Claude.

## Success semantics

- **P5.2 interactive routing PASS (minimum)**: in an ordinary existing Pi session, real Pi natural auto delegation invokes real external Claude Worker and incorporates the result; explicit `/harness claude add42` actually executes that CLI; explicit Codex/Hermes never misroute or silently use paid models; `/harness status` honestly distinguishes unavailable vs verified.
- **P5.2 full three-worker routing PASS**: above PLUS real, observed, safe same-free-model text-only `add42` smoke for both Codex and Hermes and explicit `/harness codex`/`hermes` execution; otherwise label three-worker coverage PARTIAL, regardless of overall interactive-Claude PASS.
- Never claim arbitrary private repo edit, true general Worker READY, native Skill execution, Linux portability, model benchmark or UI implementation. Existing P5 and P5.1 stay FINAL PASS and unchanged.

## Execution result (2026-10-13)

Minimum interactive-Claude routing PASS; full three-worker coverage PARTIAL; independent review PENDING. Clean safe fetch/new tracking branch at 970d87f60364ebafe86e0e6757b497bc6e50857e. No reset, stash mutation, main merge, worktree or installation.

### Native implementation

Installed Pi 1.0.4 loader/API and [official extension contracts](https://pi.dev/docs/latest/extensions) inspected. Installed upstream subagent launches Pi agents, not named external CLIs; installed LSP/Skill authoring packages do not supply this route. One thin harness-delegation.ts extension and ONE additive settings entry are necessary. Existing packages/security/subagent/Skill settings, default Ultra free model and hideThinkingBlock unchanged.

agentco_delegate and /harness share deterministic routing. Only auto|claude|codex|hermes plus literal add42 accepted; no private text/path/session/source forwarded. Auto chooses verified Claude only. Unsupported named Workers preserve identity and return NOT_READY, fallback=false, no provider call. Slash command invokes Claude directly, then appends a visible same-session custom result with triggerTurn=false; no nested Pi or router model. Schema rejects extra properties.

commander.mjs exports the accepted native text argument list and a narrowly fixed synthetic invocation. P5 text reuses the same flags; toy-edit and all accepted lifecycle/correspondence implementations unchanged. Worker has off-repo cwd/child home, narrow inherited env plus opaque auth, bare/restricted/no tools/settings/MCP/session. Exact Super free model and auxiliary aliases pinned; no retries/fallback. Bounded public zero-price gate, exact ADD42=42 and observed model required before PASS. Tool cancellation and shutdown abort/await owned invocations. No framework/packages/common Skill adapter.

### Harness results

| Harness | Result | Evidence / missing gate |
| --- | --- | --- |
| Claude | PASS | Actual model-selected auto and explicit direct native text execution; same-session return; exact Super free |
| Codex | NOT_READY | Installed 0.162.1 exec help once: isolated-home/ephemeral/config/read-only controls exist, no explicit no-tools allowlist. Shell disabling alone cannot prove all file-reading tools removed; exact free Responses route unverified. No model call |
| Hermes | NOT_READY | Native hermes.exe chat --help once, isolated home/no auth: exit 1. Installed oneshot mirrors normal rules/memory/skills, config toolsets, provider fallback and auxiliary title accounting; isolated no-tools/auxiliary-free route not established. No model call or repair/install |

Sources: [Codex configuration](https://developers.openai.com/codex/config-reference/) documents Responses-only protocol and shell-tool feature control, but does not prove the required complete Windows no-tools boundary or this Nemotron route. [Hermes toolsets](https://hermes-agent.nousresearch.com/docs/reference/toolsets-reference) and [configuration](https://hermes-agent.nousresearch.com/docs/user-guide/configuration) describe tool bundles/profiles/auxiliary models. Installed source: hermes_cli/oneshot.py explicit-toolset validation, runtime fallback and auxiliary title accounting; cli.py toolset defaults. Hermes version baseline reused, not reconfirmed by failed isolated help. No real credentials/config/session contents inspected. Next missing gate: supported isolated native no-tools/auxiliary-free execution; installation PASS is insufficient.

### Focused checks and real session

Four new offline tests PASS: installed Pi loader registers one native subagent/agentco_delegate/harness without errors/collision; auto/manual share path and Codex/Hermes never fallback; private/unsupported args reject and exact-free/no-tool flags; shutdown cancellation waits for owned cleanup. Initial loading failed on obsolete TypeBox import; changed to installed official example's typebox, then four passed. Original commander --check PASS. Old 22-case process/P5.1 suite NOT RUN.

One actual node scripts/pi.mjs RPC session, ordinary pi-dev settings, fresh off-repo cwd, --no-session, no context files/skills/templates/MCP, synthetic system prompt and only agentco_delegate exposed to model. Normal extensions still loaded; default/settings not rewritten. Official RPC automates the actual session and slash dispatcher. TUI drawing/keyboard interaction NOT RUN.

1. /harness status, codex add42 and hermes add42 append truthful status/NOT_READY with no model calls.
2. Natural synthetic request produces one real agentco_delegate call, harness=auto/job=add42. Installed Claude returns ADD42=42; successful toolResult reaches SAME session and Pi final includes ADD42=42.
3. /harness claude add42 executes actual Claude directly via SAME route; PASS custom message appended, no extra Pi model turn.

Observed Commander only NVIDIA Ultra free; Worker only NVIDIA Super free; public prompt/completion prices zero for both before smoke. New top-level CLI prompts: 3 total (Pi 1, Claude 2, Codex/Hermes 0), within 8. Each Claude one turn. HTTP/model request count may exceed prompt count; physical requests/provider invoice unobserved/unverified. No paid fallback/account lookup/real project data sent.

Ignored evidence: results/p5-2/session-evidence.json, worker-1791858140984.json, worker-1791858145889.json, implementation-summary.json. Only fixed job/tool IDs/status/model/output, no raw session log/env/key/private path. Local session-smoke.mjs is an ignored acceptance fixture, not product code.

Checks: syntax/extension loading, UTF-8/line endings, additive-only settings equality, unchanged accepted lifecycle/validation, diff-check, scope/secret review, unchanged main/history/two stashes. Six intended files only; runtime/auth/session/PATH/Skills preserved. One feature commit/push; no main merge.

### Use / handoff

From C:\Agentco: node scripts/pi.mjs. Ask to delegate fixed fabricated add42 automatically. Commands: /harness status; /harness auto add42; /harness claude add42; /harness codex add42; /harness hermes add42. Last two explicitly NOT_READY. Only add42 supported; arbitrary text/private paths and optional edit42 rejected. Existing standalone text/--toy-edit preserved.

Freeze feature for one independent Claude diff/evidence review, zero new provider calls; GPT/user gates acceptance/release. General private-project Worker, native Skills, optional edit42, TUI rendering and other-PC/Linux portability NOT RUN. Three-harness coverage PARTIAL.
