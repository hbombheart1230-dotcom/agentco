# P3 Worker E2E — single large batch, native-first

**Status: APPROVED FOR EXECUTION** (2026-10-12). User requested large work units, no intermediate approvals for routine steps. One Codex execution + one final Claude independent review. **Do not create micro-phases.**
**Workspace:** `C:\Agentco`, `feature/p3-worker-harness-design`.
**Baseline HEAD:** `ec36a5c` (Fast Track executor SHA, remote confirmed).

## Closure — Fast Track independent verification, PARTIAL accepted

Claude independent reviewer verified exact `ec36a5c` / origin / clean worktree, no changes or model calls during review. **Acceptance of completed subset: PASS**:

- Repo-local Claude Skill link is genuine native Windows directory symlink to the single unchanged canonical `shared/skills/agentco-delta-handoff`. Git mode `120000`, canonical POSIX slash blob; Pi native loader discovers exactly 3 Skills and zero diagnostics from root and nested working directories, with no duplicate skill. Codex's prior link is retained.
- Recovered interrupted P3.4b documents were backed up byte-for-byte, original SHA256 verified; prior `P3_FREE_MODEL_SMOKE.md` restored to remote baseline. Main `1f92897`, both stashes, Pi, settings, runtime, user auth preserved.
- Four benchmark results `Pi/Claude × incident summary/toy mean code` match ignored `benchmarks.json`: 2/2 PASS each, same exact OpenRouter free model `nvidia/nemotron-3-super-120b-a12b:free`, zero tool calls/subagents. **These are text/code-response tests only; no file-edit/Skill runtime PASS.** Claude free-model local cost estimate may show $0.006 but **it is not provider billing evidence**; physical HTTP request count and account-level charge unobserved.
- Codex 0.162.1: no model calls, complete builtin-tool disablement or safe OS containment unproven. Hermes v0.21.7: no model calls, source indicates empty tool selection requires native config not empty CLI flag; suppressing auxiliary/final calls and a read-only shared Skill view still unproven. **BLOCKED safety, not model quality/compatibility failure.**
- No unreviewed regression/test rerun needed. **All four overall WORKER READY = NO** until actual permitted tools/Skills execution is verified.

## Target end-state in ONE batch

Practical answer for **Pi 1.0.4, Codex 0.162.1, Claude Code CLI 2.1.292, Hermes v0.21.7**:

1. Which runs a genuine isolated **synthetic file read + edit + test** through native agent tools on the exact NVIDIA OpenRouter free model?
2. Which discovers/invokes **native Skill** correctly? Keep canonical shared skill immutable; do not expose any confidential repo content to free endpoints.
3. Which is BLOCKED by a *specific native feature or containment requirement*; and what's the shortest official fix?
4. Can the OpenRouter key's **free daily requests remaining** and price/usage metadata be obtained safely, without confusing client estimates with actual billing?

Do not build a custom harness manager or repeated benchmark framework.

## Batch — proceed A/B/C/D without asking for intermediate approvals

### A. Quick native safety decision (Codex + Hermes, one focused check per lane)

- Reuse prior P3.4b findings. Inspect only installed relevant native flags/source/settings, **no deep source archaeology**.
- Codex: determine whether the native Windows sandbox or a supported tool allowlist/denial mode can restrict file/network access in practice; `--sandbox read-only` is not by itself "all tools disabled". A model-facing shell/file tool must not have access to private source or credential stores on host.
- Hermes: verify installed native child-scoped setting such as `platform_toolsets.cli: []` for tool selection, native external-skill handling and suppression of title/fallback/compression/memory/finalization auxiliary models. **Never presume that CLI `--toolsets ""` works**. Do not install a writable external Skill view pointing to canonical repo source.
- **If the model requires regular tools**, prefer existing OS isolation rather than forced no-tools. Check whether **Windows Sandbox is already installed and usable**, without enabling Windows optional features or admin/system changes. If used, configure a disposable local sandbox with **no host folder mapping, clipboard sharing disabled, and no host secrets mounted**. Network may be required for OpenRouter but is ON by default; state that enabling network is not an egress firewall. Do not assert URL-only egress restriction. Avoid copying existing secrets, private repo or user home. If a sandbox with only synthetic inputs and a scoped test key cannot be prepared safely using native/documented facilities, **do not launch a tool-capable agent; mark that lane BLOCKED and continue**. Official Microsoft Windows Sandbox config: https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-configure-using-wsb-file
- No custom CLI patch, proxy, sandbox shim, security loader or tool adapter. A precise BLOCKED result is useful but should take **one investigation, not another round trip**.

### B. Actual native Skill and Tool E2E — independent lanes

- Preserve existing **single canonical shared Skill** and Pi/Codex/Claude project registrations. Validate native runtime metadata/discovery where offline commands exist. **Model execution cwd must not be C:\Agentco**, since canonical source/other private project contents must not reach free-model context.
- For live Skill instruction/invocation, use a separate disposable **synthetic project** with a tiny fabricated test Skill and fixture, not the user's private canonical Skill text. This temporary fixture is test data, not a second editable product Skill. Distinguish disposable synthetic Skill runtime PASS from existing canonical link filesystem PASS.
- For each harness with demonstrable isolation, run a single native bounded toy file operation: read `numbers.txt`, create `result.txt` with the computed sum, then verify externally without executing model-generated shell code. Exact paths scoped to synthetic workspace. Use vendor-native Skill discovery and native tools, no imported user rules/plugins/extensions unless already safely scoped.
- **Pi and Claude first** as their text inference already passed. **Codex and Hermes next** if A established safe native limits and OpenRouter exact-free provider pin (otherwise mark blocked and move on). Distinguish `SKILL DISCOVERY`, `SKILL INVOCATION`, `TOOL FILE-EDIT` and `SANDBOX` individually; PASS only when observed.
- For Hermes native shared Skill registration: read-only source must be OS-enforced and no direct writable mapping or symlink of the canonical source. If unavailable, retain BLOCKED without attaching the source.
- Use only child-scoped vendor config, no user/home auth/config/profile changes, no startup services. **No model should see or operate on user auth keys, source, company data, personal sessions or host filesystem beyond synthetic area**. A working directory in temp, or a read-only-approval prompt, **is not itself an OS containment guarantee**. If full tool isolation cannot be demonstrated, skip that live tool probe but finish other lanes.

### C. Billing, cost and free-only checks (low overhead)

- Exact model fixed `nvidia/nemotron-3-super-120b-a12b:free`, public OpenRouter input/output unit price `0` confirmed before any request. No `auto` routing, provider subscriptions, paid-model/auxiliary fallback, tool-based web browsing or background model tasks. Use one previously authorized exact local OpenRouter key source **only via process/child environment, never expose values**; if not available, skip online lanes.
- If safe **official** OpenRouter `GET /api/v1/key` is accessible with this key, inspect/report **only sanitized** `free_model_daily_requests` limit/remaining and broad account spending status without logging token/key, raw account payload, request headers or personal identifiers. A daily usage counter is **not** individual inference billing proof; if a safe separate official charge report isn't obtainable with existing artifacts, label actual provider billed cost NOT VERIFIED. Do not add unapproved purchases or keys.
- Bound **new free-model CLI prompt attempts to <=6 total for this whole batch**, max 2 per newly functional harness; no automatic manual retries, no extra benchmarking of already-PASS text output. Budget/timeouts/output small. If any model or auxiliary fallback could charge, stop that lane. Count/report prompts separately from actual HTTP requests.

### D. One summary and Git handoff

Provide a concise table `Pi / Claude / Codex / Hermes` × `native Skill discovery | synthetic Skill invocation | real tool file edit | OS confinement | free exact model | elapsed/calls | PASS/PARTIAL/BLOCKED`. State why each tool/Skill test passed or did not run; provide at most one targeted next action per blocked lane, not another dozen planning subtasks. Do not conflate installed/text-pass with end-to-end Worker readiness.
Save sanitized evidence to one owned ignored `results/p3/` directory. No persistent framework/scripts, product tool code, installers, global config/profile/extension changes. Modify at most this work order and `docs/CURRENT_TASK.md`; optionally a **single** documented, safe native project Skill registration only if demonstrably read-only and specifically necessary (but never writable Hermes canonical view). `git diff --check`, commit/push feature only; preserve main, stashes, runtime, code, original links, credentials, existing sessions and user PATH.

**One final Claude independent review** after Codex pushes. Claude checks only new delta plus summarized evidence, no repeated model/API requests. GPT final acceptance. Don't interrupt the batch for noncritical questions or a new gate.

## Strict STOP exceptions

Secrets in tool-visible environment or model context; uncontrolled paid/auxiliary fallback; tool access to non-synthetic host data; host modifications or system feature enablement; destructive source/setting changes; unreviewed dependency installation; unexpected remote Git changes. Stop affected lane, and stop whole batch if global state is endangered.

**Unverified ≠ failed:** If no safe isolation is currently possible, accurately record no live tool calls. Completion of the batch with partial E2E is preferable to creating new infrastructure merely to get a PASS.


## Execution delta (2026-10-12): PARTIAL native Read / BLOCKED Worker E2E

**Execution base:** `ef12a54837f9b63ae3ee5100aa38602d382acb6d`, clean feature branch, fast-forward only. All A/B/C/D lanes processed; no repeated installation, canonical link test or passed text benchmark. Only this work order and CURRENT_TASK change. Existing canonical Skills/links, user auth/config/PATH/sessions/runtime, Pi/Codex/Claude Desktop/Hermes, main and both stashes retained.

### Native safety and functional results

One focused installed-surface check per unavailable lane reused the known safety findings. Expected `%WINDIR%/System32/WindowsSandbox.exe` is absent, so no usable installed Windows Sandbox route was established. Optional-feature enablement/admin inspection, sandbox launch and system changes NOT RUN. No claim that a different VM/container is installed or safe. Pi installed CLI has no confirmed host-path file-tool confinement flag; Codex pinned help's read-only sandbox/generic feature switches do not prove private-file read isolation; Hermes known empty-tool/title/fallback controls do not establish full auxiliary suppression or a read-only canonical Skill view. Those live tool lanes were skipped, not retried or replaced with custom infrastructure.

Claude 2.1.292 has an official [restricted native file-tool boundary](https://code.claude.com/docs/en/cli-reference): built-in file tools confined to working directories, command/code/WebFetch tools excluded unless individually re-enabled, existing user/project settings bypassed. The test exposed only an explicit native file/Skill allowlist, never Bash/Agent/network/MCP, and used bare mode/fresh child config. Thus no model tool could query process environment or credentials. This is **native file-tool enforcement, not an OS sandbox/egress firewall**. Synthetic outside-root canaries contained public toy data only; no private path or real source was probed. No existing auth/config contents or canonical Skill text was sent to the model.

| Harness | Native synthetic Skill discovery | Synthetic invocation | Actual file read/write/verification | Isolation | Exact free model / new prompts / elapsed | Result |
| --- | --- | --- | --- | --- | --- | --- |
| Pi 1.0.4 | PASS: native loader found fresh `toy-sum`, diagnostics 0; canonical baseline reused | NOT RUN | NOT RUN | Host-path confinement unproven; no Windows Sandbox executable | Previous text PASS reused / 0 / ? | BLOCKED Worker E2E |
| Claude 2.1.292 | BLOCKED: native init did not advertise `toy-sum` in either run | BLOCKED: required Skill tool unavailable | `numbers.txt` Read PASS; Write unavailable, `result.txt` absent; no file-edit PASS | Actual outside-root Read denied; canary intact. Write restriction not independently exercised because Write was disabled. OS sandbox NOT RUN | Exact slug in both native model-usage results / 2 / 63.97s + 3.34s | PARTIAL Read; BLOCKED Worker E2E |
| Codex 0.162.1 | Existing canonical registration reused; new runtime NOT RUN | NOT RUN | NOT RUN | Private-file/tool isolation not proven | Model NOT RUN / 0 / ? | BLOCKED |
| Hermes v0.21.7 | Shared view remains BLOCKED; new runtime NOT RUN | NOT RUN | NOT RUN | Auxiliary suppression and read-only source boundary not proven | Model NOT RUN / 0 / ? | BLOCKED |

Pi offline metadata used only a newly fabricated Skill in an owned external toy directory and the installed native `loadSkills`, explicit fixture path, defaults disabled. No canonical source copied, no global profile loaded and no model request. This is loader recognition, not invocation.

Claude first attempt used a new external synthetic project containing `numbers.txt` with integers 7, 11, 24 and fabricated `.claude/skills/toy-sum/SKILL.md`; fresh child HOME/USERPROFILE/CLAUDE_CONFIG_DIR was outside the allowed project. Skill instructions called for native Read, sum, Write of `result.txt`, Read verification and a synthetic marker. No repo/source/user rules were included. Ancestor instruction-file checks passed. Only previously authorized target key was passed opaquely through child env, never argv/config/prompt/logs. All model role defaults were pinned to `nvidia/nemotron-3-super-120b-a12b:free`; no auto model/fallback/subagent/paid auxiliary route was selected. Bare mode suppressed discovered user hooks/plugins/MCP/memory; no services or auth changes.

Native flags: `--bare --restricted --add-dir <same-toy-project>`, explicit Read/Write/Skill tools and allowed tools, denied Bash/Agent/WebFetch/WebSearch/MCP, strict MCP config, fresh settings `{}`, no Chrome/session persistence, manual/default permission mode and unanswered prompts denied. First run used a comma tool list and empty setting sources. Native init actually exposed **only Read**. Trace showed outside-root Read rejected specifically by `--restricted`, in-root `numbers.txt` read with actual content, unavailable Write and invented skill calls rejected, and `result.txt` missing. Final prose described a hypothetical 42; **that is not an actual successful Skill/file operation**. Exit 0 likewise is not E2E PASS.

A single bounded correction (second and final allowed prompt for Claude) used variadic native tool names and `--setting-sources project` for only the fresh toy project, preserving the same restriction. It again exposed only Read, advertised no toy Skill and returned `BLOCKED` without tool calls. No further debug/model attempts. The exact cause of installed native tool/Skill filtering was not established; this is not a claim of NVIDIA tool incompatibility or that Write is universally unsupported by Claude. No boundary relaxation, bypass permissions or vendor modification was attempted.

**Observed totals:** 2 new synthetic CLI prompt attempts (under <=6 cap), both Claude; native results report 10 and 1 turns, respectively. First run made a real Read and controlled rejected calls, second made none. No actual tool write, external write or canonical Skill mutation. First run output usage was 13146 input / 3733 output including 3234 thinking; second 704 / 280 including 274 thinking. Requested small per-response cap was 512, process bounds 75s/60s and model timeouts 20s; turn caps 12/6. A CLI prompt can produce multiple tool/model turns; physical HTTP counts remain independently unobserved. Requested retry limit 0, no manual replay/retry loop; second run is the explicitly documented focused configuration correction, not a repeated text benchmark. Client estimates $0.160199 and $0.01052 have unknown non-Anthropic cost basis and **are not provider charges**.

### Free-only and sanitized account check

Before live inference, unauthenticated public [OpenRouter model metadata](https://openrouter.ai/api/v1/models) confirmed exact slug with prompt/completion unit prices **0**. No paid model configured or observed. Official authenticated [key metadata endpoint](https://openrouter.ai/docs/api_reference/authentication), `GET /api/v1/key`, was queried locally before/after the two attempts; only approved sanitized counters and a broad daily-spending-positive boolean retained, no raw account payload/header/key/identity. `free_model_daily_requests`: **before used 88 / limit 1000 / remaining 912; after used 98 / limit 1000 / remaining 902**. These are response-time key-wide daily counts; delta 10 is **not independently attributable physical request count** for this batch and remaining is not an inference-cost receipt. Broad daily spending was positive before this run, so it cannot establish a new paid charge here. Actual individual provider billing **NOT VERIFIED**; no separate charge-report query, purchase or new key.

### Evidence, checks and next action

Ignored `results/p3/worker-e2e-ef12a54/`: `summary.json`, `pi-metadata.json`, `pricing.json`, `account-sanitized.json`, `account-after-sanitized.json`, `claude-e2e.json`, `claude-e2e-second.json`. Claude artifacts contain selected sanitized native init/tool/result fields, with owned fixture paths redacted; raw stdout/stderr/session/env logs and secret-bearing configs were not stored. No persistent executable/framework/security shim or product code created. Owned toy fixtures retained; no cleanup of runtime/stashes/user files.

Checks: safe FF, expected doc-only scope, local evidence references, `git diff --check`, no source/link/config changes, unchanged main/stash SHAs PASS. Native Claude private-path Read denial and in-root synthetic Read PASS; write/Skill/runtime E2E BLOCKED or NOT RUN as table. **WORKER READY = NO for all four**. No model/Skill PASS inferred from prose, existing link or installation.

One next action per lane: Pi needs an existing enforceable file-tool/OS boundary; Claude needs an officially supported restricted mode exposing Write + Skill before another E2E; Codex needs verified private-read containment in its native/OS sandbox; Hermes needs both auxiliary-free execution and a read-only Skill boundary. These remain a combined follow-up, not new infrastructure or micro-work orders. Claude independent reviewer checks this single delta and summarized artifacts without inference/account reruns; GPT/user decide the next batch and final status.


## Round 2 — consolidated native-tool recovery and four-lane E2E (2026-10-12)

**STATUS: APPROVED / ONE LARGE BATCH.** User directed fast, broad execution without micro-approvals; this section replaces the completed Round 1 task as the active execution. Claude independently reviewed `c113c0b` as **PARTIAL** and confirmed factual consistency without model/API calls or Git writes. No full worker readiness claim. Reporter unexpectedly wrote Chinese; future reports MUST be **entirely in Korean**, with exact technical flags/paths retained verbatim.

### Key independent-review conclusions

- Claude 2.1.292 actually Read toy `numbers.txt` and denied toy outside-root reads with `--restricted`. In two invocations the native `system/init` tool list contained only `Read`; `Write` and `Skill` absent and `result.txt` never created. Tool availability issue remains **unexplained**, not proven an inherent `--bare --restricted` limitation.
- Pi toy Skill metadata PASS, invocation NOT RUN. Codex full built-in tool removal / private file read containment remains unproven. Hermes auxiliary/final-call suppression and writable external Skill boundary remain unproven. All four `WORKER READY = NO`.
- Previously measured OpenRouter free daily remaining `902/1000` is a historical snapshot, **not current capacity**, nor proof of actual per-request spending. Claude CLI cost estimates are not provider billing. Existing evidence/installed versions/links are accepted and must not be rerun.

### Execute together: A → B → C → final report

**A. Resolve the concrete Claude native tool visibility issue FIRST, without writing product code.**

1. Use vendor's installed `claude --help` / exact-version native tool initialization and published official docs. Current official guidance: [CLI reference](https://code.claude.com/docs/en/cli-reference) explicitly distinguishes `--tools` (**available tool set**) from `--allowedTools` (**permission preapproval**); `--restricted` confines built-in file tools to working/additional directories and excludes command/code/WebFetch tools unless explicitly named. [Headless/bare](https://code.claude.com/docs/en/headless) says `--bare` skips automatic Skills discovery/reminders, yet may load Skills from an explicitly passed `--add-dir` project folder. [Skills](https://code.claude.com/docs/en/skills) notes project settings source and additional-directory loading nuances. **Do not assume changing `--allowedTools` can surface an unavailable `Write` or `Skill`.**
2. First use **local offline/non-model help + existing traces** to identify the precise cause of the earlier `system/init tools=[Read]` result: argument tokenization/list, restrictive default, `--bare` Skill visibility, `--setting-sources`, `--restricted`, version-specific behavior. If needed, make **at most two fresh synthetic Claude invocations** with actual `system/init` tool list capture; explicitly pass `--tools` with `Read,Write,Edit,Skill` as supported in installed version, and only pre-approve toy-scoped file operations. Keep `--restricted`, toy cwd, fresh child config and disallow command/Bash/network/MCP/subagents. Never bypass permission checks or load real global settings; `--add-dir` may point only to another owned fabricated toy project. If different flags would expose user settings, STOP that lane.
3. For a successful exposed tool set, run one complete **actual** synthetic Skill invocation (check for real Skill tool use, not model prose), Read `numbers.txt`, Write `result.txt` containing `42`, Read back, and verify on host. Also verify **outside-root Read denial** and test outside-root Write denial only with a throwaway public canary (do not probe any private path); preserve file hashes. Tool visibility with no actual calls is PARTIAL, not E2E PASS.
4. If native `--bare` provides Skill content but removes model-visible Skill tool, distinguish direct `/<toy-skill>` invocation from actual `Skill` tool calls. A valid direct Skill flow may PASS as native Skill invocation if objectively observed; don't fake invocation by prompting with content. If no safe combination, mark Claude BLOCKED with exact option/observed init and continue.

**B. Process independent Pi / Codex / Hermes lanes in same batch.**

- **Pi:** prior text 2/2 and metadata PASS accepted. Check the simplest vendor-supported file tool allowlist with an enforceable read/write boundary; use only external owned toy files and child-scoped settings. If host private-file confinement remains unproven, run offline metadata only and label tool E2E BLOCKED. Don't demand a brand new generic security framework.
- **Codex:** inspect exact pinned 0.162.1 OS/native sandbox containment once, not an entire architecture study. Existing Codex Skill registration is PASS; use a disposable synthetic project and official sandbox if it actually confines host reads/writes. Read-only sandbox alone is not proof of read confinement. If isolation cannot be shown, block actual tool-capable model run; report one-line official next fix.
- **Hermes:** prefer installed native child-scoped `platform_toolsets.cli: []` for auxiliary-free preflight and individually disable title/fallback/memory/compression if supported. Do not attach writable `skills.external_dirs` to the real shared Skill. If exact isolated toy Skill access or auxiliary-free bounded routing cannot be demonstrated, label BLOCKED and continue; no adapter/SDK patch/secret/profile migration.
- No Windows optional-feature enablement, WSL/container installation, OS permission changes, global PATH/env/profile updates or paid/model fallback. Prioritize native zero-custom-code features. One focused safety check per still-blocked lane, then move on.

**C. Free-only bounded verification and output.**

- Exact OpenRouter `nvidia/nemotron-3-super-120b-a12b:free` only; publicly verify $0 price. Use only previously authorized narrow local key handling, never echo/record key, never send real source, user/company data, auth paths, or user conversations to providers. Synthetic workspace outside `C:\Agentco` for all model invocations. Tool sessions must have an actual **enforced access boundary**, not merely a toy cwd.
- Budget **at most 6 NEW CLI prompt attempts total**, max 2 per harness; don't repeat prior `READY`/text rubric. Any safety problem blocks only its affected lane; avoid extra manual retry loops and preserve other work. Note model prompt attempts `!=` actual HTTP requests; client-side estimates `!=` billed charge.
- Return **one short table** `Pi/Claude/Codex/Hermes × Tool inventory | synthetic Skill invocation | real Read+Write | out-of-root denial | free-model routing | PASS/PARTIAL/BLOCKED` plus actual observed artifact paths, at most one clear next action per blocked lane. Avoid speculative success claims. Document observed free usage only if collected through an approved sanctioned endpoint; don't perform repeated account polling.
- Changes limited to `docs/CURRENT_TASK.md` and this active work order plus at most a documented safe native repo-local Skill link if absolutely required and nonwritable (never copy canonical Skills). Evidence in owned ignored `results/p3/`. `git diff --check`, feature branch commit/push ONCE; no main merge; preserve all existing config, sessions, runtime, main and 2 stashes.
- Finish with **one Claude independent review** at end. It must respond **한국어로만**, verify exact implementation SHA and delta, no repeated API or chargeable tests, no mid-batch GPT/user approval on already authorized operations.

**Completion expectation:** at least establish *why* Claude's original tools list showed only Read, and achieve native toy file write+Skill PASS if official installed options permit it. A truthful PARTIAL with a narrow reproduced limitation is acceptable; avoid turning this into another microgate.


## Round 2 ?? ?? (2026-10-12): PARTIAL / Worker E2E BLOCKED

**?? ??:** `33c6ec38e05b0d247c7d33cf601c3cb4aa20a273`. clean feature ????? fast-forward? ?????. ????? ????? ??? ??????? ?? ??? ???? ???. ?? ??? CURRENT_TASK? ? ???? ? ?????.

### Claude Read? ??? ?? ? ?? ?? ??

??? ?? Claude 2.1.292 ?? ??? ?? JavaScript? ?? ?? mmap?? ?? ????. `var yD=(e,r)=>{if(a.CLAUDE_CODE_SIMPLE&&!r?.skipSimpleModeFilter)` ??? ?? ?? ?? ????? ???? ?? ??? ?? ??? ????. `--bare` ?? ??? `process.env.CLAUDE_CODE_SIMPLE="1"`? ????, ?? ??? ?? child ??? ????. ? ?? ??? restricted? ?? ?? ??? ?? ???? ?? Read-only inventory? ???. `--tools`? ?? ?? ??? ???? ???, comma/variadic ?? ??? ?? ??? ????. ?? ?? ?? ??? ?? ? ?? init? ?? ??? ????, ?? ?? ???? bare? ?? ??? ????? ???? ?? ???.

?? `--bare`? ???? **child ???? CLAUDE_CODE_SIMPLE ?? ??? ??**??. ?? shell/??? ??? ????? ??? `0`?? ???? ???. `--restricted`? `--tools Read,Write,Skill`, ?? ??? ?? ??, Bash/PowerShell/Agent/WebFetch/WebSearch/MCP ??? ????. ?? ??? ?? ? ?? HOME/USERPROFILE/CLAUDE_CONFIG_DIR? ????, child `--settings`? `disableAllHooks=true`, `autoMemoryEnabled=false`, ? enabledPlugins? ????. strict MCP, no Chrome/session persistence, ??/default permission mode, ??? permission prompt ??? ????. bypassPermissions? ?? ?? ??? ????? ???. ? ?? ??? ?? ?? ????????? ???? ???.

? ? ?? ?? native `system/init`? **Read, Skill, Write**? ????. ??? **?? ?? inventory ?? ?? PASS**?. ? ??? ?? Read? Write ??? ?? ?? canary ??? ?? ???? ???? ??? ?? `--restricted`?? ????. canary ??? numbers.txt? ????? outside-write.txt? ???? ???. Write? ?? ???? ?? ?? ?? ?? ?? ?? ??? ????. **?? Read/Write ?? PASS**??, ?? ???? ?? ?? ???? OS sandbox ?? URL egress firewall ??? ???.

??? ?? Skill ??? ???. ? ??? ?? toy project? `--add-dir`? ????? `toy-sum`? ???? ?? BLOCKED? ???? in-root ??? ?? ???. ? ???? ??? ????? ?? `project/skill-view/.claude/skills/toy-sum`? ???? ?? ????? ???? native CLI prompt `/toy-sum`? ????. ?? ??? ??? prompt? ?? ?? ???. ?? toy-sum ?? ??? ??? ??? ?? slash command? ???? ???? ????. ?? Skill ??/?? marker? ???? ??? ?? Skill/tool ??? ???. **Skill ?? ?? PASS? Skill ??/?? PASS? ??**?. ? ?? ??? ??? ??? ?? ?????. ???? bare/restricted ??? ??? ????? ? ?? ??? ?? ???.

### 4? ??? ???

| ??? | Tool inventory | ?? Skill ?? | ?? Read+Write | ?? ?? ?? | ?? ?? / ? prompt ?? | ?? |
| --- | --- | --- | --- | --- | --- | --- |
| Claude 2.1.292 | Read/Write/Skill ?? ?? PASS | ?? ??? BLOCKED; ?? `/toy-sum`? ??? | ?? in-root ???????? NOT RUN; result.txt ??. ?? in-root Read PASS? ??? | ?? ?? Read/Write ?? PASS | ??? NVIDIA Super :free? ? ??? ?? / 2 | PARTIAL, Worker E2E BLOCKED |
| Pi 1.0.4 | ?? ?? ?? ?? ???; native read/write? ??? resolve? ? fs ?? | ?? ?? metadata PASS ???, ?? NOT RUN | ??? ?? ?? ?? ????? NOT RUN | ??? | ?? ?? PASS ??? / 0 | BLOCKED |
| Codex 0.162.1 | pinned help? sandbox/feature ?? ??? | ?? ?? PASS ???, runtime NOT RUN | ??? host read ?? ????? NOT RUN | ??? | ?? ?? NOT RUN / 0 | BLOCKED |
| Hermes v0.21.7 | installed oneshot? toolset/MCP/fallback ??? focused ?? | ?? ?? canonical view?runtime NOT RUN | ?? ?? ??/?? ?? ????? NOT RUN | ??? | ?? ?? NOT RUN / 0 | BLOCKED |

Pi? installed `dist/core/tools/read.js`? `write.js`?? cwd ?? ?? resolve ? native fs ??? ????. ?? ?? allowlist? host ?? ??? ???. Codex? ?? exact-version help? read-only sandbox? private read? ????? ???? ???. Hermes? installed `hermes_cli/oneshot.py`? MCP ??? ? fallback_model ??? ?? ?????, ? toolset ????? ?? ?? ??? ??? ???? ???. WindowsSandbox ?? ??? ??? ???. Windows ??/WSL/container ???OS ?? ???? adapter/shim ?? ?? ? lane? ?? BLOCKED? ?????. ?? PASS? Skill metadata?????? ??? ?? ???? ???.

### ?????????? ??

?? OpenRouter metadata?? ??? `nvidia/nemotron-3-super-120b-a12b:free` ??/?? ?? 0? ?? ? ????. ?? ??? target key? ???? ???? ??? child env? ?????, ? ?/??/hash/?? ?/?? ?? ??? ??????? ???. ?? auth store? ??? ????? ???. ?? model role ???? ?? free slug? ????? ?? fallback/auto/subagent? ???? ???. ? init MCP ?? 0, ? ?? subagent 0??. ?? ?????canonical Skill???? ??? ?? ??? ???? ???.

?? ?? cwd? ? ?? ?? project?. ?? ???? ??? AGENTS.md/CLAUDE.md? ??? ????, fresh child home? ??? project ?? ???. ?? ??? ???? ??? environment? key? ?? ?? ??? ???? ???. prompt? Skill? ???? ?? ?? ????. ?? numbers.txt? `7, 11, 24`?? ?? result? `42\n`???, **result.txt? ? ? ?? ???? ?? ???? ???? ???**.

?? ? CLI prompt ?? **2?**, ?? Claude, lane? ?? 2/?? ?? 6 ???. ? ?? 11.11??4 reported turns, ? ?? 13.80??2 turns. ? token usage input 9837/output 1086(thinking 951), ? ?? 6624/717(thinking 621). ??? per-response ?? cap 512, model timeout 20?, process bounds 90/75?, turn bounds 10/8??. reported total output? ?? turn ???? cap ??? ?? HTTP ??? ??? ???? ???. retry limit 0? ???? ?? ??? ?? ?? ? ??? ??? Skill ??/direct invocation ???? ????. client ??? $0.078623 / $0.051045? ?? OpenRouter ???? ???. **?? HTTP ????? ??? ???**. ?? ??/?? ?? polling? ?? ???? ?? 902/1000? ??? ?????? ????.

Ignored ??: `results/p3/worker-e2e-r2-33c6ec3/claude-native-filter.json`(?? vendor ??? ?? ?? ???byte offset), `pricing.json`, `claude-r2.json`, `claude-r2-direct-skill.json`, `summary.json`. native init/tool/result? ??? ??? ???? ?? ??/env/auth ??? ???? ???. ?? ?? ??? redaction??. ?? ?? ????, SDK, wrapper, proxy, ?? ?? ?? loader? ???? ???.

### ?????

?? ?? ?? ? ? init inventory, ?? Read/Write ?? trace, ?? canary/?? ?? ??, result ??, ?? JSON/??, ?? ? ? scope, `git diff --check`, main/? stash ?? ?? PASS. ?? ??/Skill/source/PATH/??/runtime/session ?? ??; ?? fixture? ??? ????. **?? WORKER READY? NO**?? ??? ??/Skill E2E? ??? BLOCKED?.

?? ?? ??? ??? ??? ???: Claude? `--restricted`?? ?? directory? ?? Skill? ???? ?? ??? ???? ?? ??? ???? in-root ??/?? Skill ??? ????. Pi/Codex? ?? ?? ??? ?? ?? ??? ??? ?? ????, Hermes? ?? ?? ??? ?? ?? Skill ??? ?? ????. ? ???/?? fallback/?? ?? ??? ?? ??? ???? ???. Claude ????? ? commit? delta? ??? ?? ??/API? ????? ???, ??? ???? ????.
