# P5 — Agentco Pi Commander -> Claude Worker: first working pipeline

**ACTIVE / APPROVED (2026-10-12).** User decision: **make the pipeline work FIRST; evaluate harnesses/models, polish security proof and unify remaining Skills LATER**. Execute in one batch, no micro-gates. GPT defines the job, Codex implements/tests/pushes, Claude independently reviews once, GPT/user accept. Work only in personal Agentco, never Samsung corporate materials.

## Canonical environment and already-proven baseline

- Local workspace `C:\Agentco`, branch `feature/p3-worker-harness-design` at initial head `ac8d389`; freeze origin while Codex runs.
- Pi 1.0.4 pinned. Existing upstream `subagent` example (scout -> worker), file tools, prompt templates, Pi extensions and 14/14 smoke were functionally tested in the historical harness baseline. Do not redo them.
- Claude Code CLI 2.1.292 is installed; OpenRouter `nvidia/nemotron-3-super-120b-a12b:free` was verified for text inference; Claude native Read/Write/Skill **visibility** now works without the `--bare` simple-mode filter, but actual Write and Skill **invocation** have NOT passed E2E.
- Three native Skill views already exist: canonical `shared/skills`, Codex project link, Claude project link. Preserve them; no duplicate canonical Skill bodies. Hermes remains deferred.
- `docs/CURRENT_TASK.md` and the appended Round 2 outcome in `docs/work-orders/P3_WORKER_E2E_BATCH.md` contain literal replacement `?` characters from damaged Korean encoding; repair that documentation **once** as prescribed below rather than reproducing it.

## Deliver ONE vertical slice, not another comparison project

The definition of a *functional pipeline* for this task is:

```text
Human -> Pi (Commander) -> bounded task dispatch -> Claude Code CLI (Worker)
      -> machine-readable result/artifact -> Pi receives result -> Human
```

Use only toy/fabricated task data for all model calls. Example: ask Claude to produce a minimal Python `mean` function or calculate `7+11+24=42` from a fabricated input. Actual source edits, agent-level Skill use, full Worker readiness and multi-harness routing are **separate later gates**. A successful text/artifact handoff is a legitimate **PIPELINE MVP PASS**; do not falsely label file-edit/Skill E2E PASS.

### A — Reuse an existing delegation Extension FIRST

1. Reuse already-installed Pi's official `subagent` example for Pi-native handoffs as the baseline. **It may only launch another Pi session; do not falsely claim it natively launches Claude.**
2. Inspect **one or two credible ready-made Pi Extensions** for external Claude Code CLI dispatch, using exact versions and maintained sources. Preferred candidate: community `pi-subagents@0.77.0` ([package](https://pi.dev/packages/pi-subagents), [Claude Code runner docs](https://github.com/nicobailon/pi-subagents/blob/main/docs/agents.md)). It exposes built-in `claude-code` / `claude-code-writer` adapters, but requires verified Windows CLI compatibility and its documented user-auth assumptions must NOT override our OpenRouter free-only requirement. Smaller alternative `pi-cli-subagent` is a possible candidate, but verify maintenance/security before adopting; it is not an official Pi built-in.
3. **Important duplication rule:** do NOT load two competing `subagent` tools (existing official example vs package) in production simultaneously. In an **isolated, throwaway Pi agent directory**, inspect/adopt the community Extension if it can safely route the exact approved free model without changing Claude user auth/global config, accessing private paths, installing broad unwanted dependencies or invoking hidden paid auxiliary models. Pin exact version if accepted; do not auto-upgrade. Reject and document in one line if it cannot.
4. If a ready-made Extension is unavailable or incompatible, use **only the smallest existing Pi-native tool and official `claude -p` mechanism** to perform a no-file-tools synthetic text handoff. One thin transparent repo-local launcher/config (<~100 lines if required) is permissible **only after** demonstrating no off-the-shelf route fits and must not become a manager, daemon, adapter framework, source copier or SDK fork. Prefer zero new code. Do not endlessly evaluate packages.

### B — Make the real Pi -> Claude response path work in one session

- Accept one user-level request in Pi, dispatch it to the actual locally installed Claude Code CLI and return its result **to Pi in the same workflow**, not via manually copying output or having Codex call Pi and Claude separately. Observe distinct Commander and Worker execution events and a final response that includes evidence from the Worker result.
- Use a newly owned ignored `results/p5/pipeline-*/` area and off-repo isolated **synthetic** model cwd (like a fresh owned temporary toy directory); never run free-model agents with private Agentco repository context. Caller must not leak `AGENTS.md`, private source, secrets, memory or real user files into free-model prompts.
- Both model routes **pin the exact same OpenRouter NVIDIA Super `:free`** for this MVP; no paid fallback, auto mapping or other auxiliary models. Do not change global Pi's current Ultra default; override only in this isolated pipeline test. Model calls limited to **<=5 CLI prompt attempts for the whole batch**. No model-selection benchmarking, tool-call scoring or repeat of previous text-test rubrics solely to collect timings.
- Use native model/tool/no-session options and the **least powerful delegation profile** (text-only, or Read-only of fabricated input). Claude writer tools can be tried on fully disposable toy files **only if an enforceable boundary is already supported and demonstrably safe**; otherwise skip file-edit, still complete text handoff. Never disable security checks or grant arbitrary shell/Bash access. No user profile, persistent login, PATH, main, stash or real runtime modifications.
- If an off-the-shelf adapter cannot use our exact free-model provider without real vendor login, switch immediately to the approved minimal native CLI approach instead of blocking the entire P5 pipeline. Never use an existing paid subscription or brand new token as an implicit fallback.
- Output one unambiguous practical start command using existing `agentco` / `node scripts/pi.mjs` and a copyable demonstration request. Avoid extra launch steps/user interaction except explicit local key availability and normal native confirmation prompts. An actual user can reproduce the Pi -> Claude roundtrip in a toy project.

### C — Preserve project, repair corrupted docs, and hand off

- **Repair confirmed encoding corruption**: rewrite `docs/CURRENT_TASK.md` cleanly to point at this task; in `docs/work-orders/P3_WORKER_E2E_BATCH.md`, replace ONLY the corrupt appended `## Round 2 ?? ??` outcome block with a short accurate **ASCII-English** historical summary based on existing validated report and ignored evidence. Keep previous intact sections, preserve original bad bytes in Git history, and don't invent lost prose. Windows writes must be UTF-8; automated integrity check should reject runs of three consecutive question marks, replacement U+FFFD in changed docs. Future status reports **Korean only**.
- Minimal code/config only if essential for a user-operable pipeline. Prefer a small native extension setting/prompt to custom source. Keep canonical Skill source/link untouched; metadata may be reused and basic Skill injection is optional, never gate pipeline on prior synthetic Skill invocation failures.
- 1 compact evidence/report: `Pi started? | Claude CLI actually invoked? | exact model | Worker output returned into Pi? | final Pi response | new files/config | actual tool/file E2E NOT RUN`. Save sanitized logs only under ignored `results/p5/`.
- Normal `git diff --check`, focused startup/smoke plus reproducible pipeline test, stage only intended files, **one commit/push** to feature branch. Preserve user `.env`, existing sessions/runtime/PATH, all stashes, main, VS Code versions. Do not run a full regression or re-audit old P3 gates.
- Claude independent reviewer performs **one end-of-batch diff+evidence review**, no repeated model/API calls; user reports and handoff **in Korean**. No intermediate Git edits by GPT while Codex is executing.

## Success/fail semantics and next scope

- **P5 PIPELINE MVP PASS**: human request processed by real Pi, real Claude Code CLI invoked under pinned free route, nonempty Worker result observed by Pi and included in final Commander response, startup command and evidence reproducible.
- **P5 PIPELINE MVP PARTIAL**: one component not wired (say exactly which), even if Pi and Claude each work separately; preserve any functional progress and include *one shortest remaining action*.
- **WORKER READY = NO** until genuine native Skill invocation/file-edit/security E2E passes. No P4 harness comparison, Ultra vs Super comparisons, Hermes/Codex integration, P6 routing, background daemon, UI, browser or new paid models in this phase.


## Execution result (2026-10-12): P5 PIPELINE MVP PASS

Base `e433b37` / feature/p3-worker-harness-design; clean fast-forward synchronization. One real user request -> Pi Commander -> installed Claude Code CLI -> Worker JSON artifact -> Pi tool result -> final Pi answer completed. This is text/artifact delegation, not real file-edit or native Skill invocation PASS. **WORKER READY remains NO.**

### Native-first selection and minimal implementation

The already-installed official subagent example spawns Pi, not Claude; it was inspected but never changed/retested. Community `pi-subagents@0.77.0` official npm tarball and published runner docs were inspected under ignored `results/p5/pipeline-mvp/`, with SHA512 integrity verification, no dependency installation/execution. Its Claude adapter forces `--setting-sources user` and its env allowlist omits default Opus/Sonnet/Haiku/Fable/subagent-model pins. This violates this task's isolated no-user-settings/exact-free-all-roles contract without vendor patching, so it was rejected. No second competing subagent tool or production package/settings were installed.

Fallback is one transparent **82-line** `scripts/commander.mjs`, using Pi's existing native Extension API and official `claude -p`, not a manager/daemon/SDK fork. It creates one ephemeral `claude_worker` Extension in an owned external toy directory, starts upstream pinned Pi with only that tool, and lets the actual Commander model dispatch the Worker. The official Pi subagent/package/default settings remain untouched. The Worker process is launched only by the Commander tool execution, not separately by the executor. A single-dispatch guard prevents multiple workers per run. Tool inputs are bounded synthetic task text; no arbitrary executable/path/shell parameter is exposed.

Helper derives paths from its own repository location, resolves the existing WinGet Claude CLI, checks the exact free model's public zero prices, reads only the authorized OPENROUTER_API_KEY entry into memory if not inherited, and builds an OS-variable whitelist plus that key for the child. No key in argv/config/prompts/logs. Fresh Pi/Claude homes, no existing profiles, external model cwd, no ancestor AGENTS.md/CLAUDE.md, no session persistence. Pi disables discovery of extensions/Skills/context/MCP/themes/prompts and explicitly loads only the temporary Worker tool; there are no built-in file/shell tools. Claude uses official `--bare --restricted --tools "" --disallowedTools *`, strict MCP, empty settings/sources, no Chrome/session, one turn and 256 requested output tokens; all model roles pin the same free slug. No login/provider subscriptions/paid fallback or global environment/PATH change. Upstream retry disabled for Pi and retry 0 requested for Claude; internal HTTP counts remain unobserved.

The helper creates sanitized Worker JSON in its owned toy area and retains sanitized evidence under ignored results. Worker process timeout 30s / Pi pipeline timeout 60s / bounded buffers; Worker errors are converted to a fixed message without raw stderr/auth details, no retries/fallback. The helper is deliberately synthetic/text-only; do not supply real project/company/private data. It does not turn the source repo into a model workspace.

### Reproduce

From `C:\Agentco` (or invoke this script by absolute path from another cwd):

```powershell
node scripts/commander.mjs --check
node scripts/commander.mjs "Delegate this synthetic task to Claude: calculate 13+29 and return exactly PIPELINE_P5_RESULT=42. Return the worker result to me."
```

Use the already authorized local key source; the script never displays it and does not install anything. This is a single user request and one reproducible launch, with no manual result copying. Existing `node scripts/pi.mjs` remains unchanged for ordinary Pi operation.

| Acceptance | Observed result |
| --- | --- |
| Real Pi Commander started | PASS: upstream 1.0.4 CLI, exact free model in assistant events |
| Real Claude CLI Worker invoked | PASS: native claude_worker execFile dispatch, one Worker JSON result / one reported turn |
| Exact same free route | PASS: public prompt/completion price 0; both observed model lists contain only nvidia/nemotron-3-super-120b-a12b:free |
| Result returned into Pi | PASS: native toolResult contains Worker output PIPELINE_P5_RESULT=42 |
| Pi final answer | PASS: PIPELINE_P5_RESULT=42 |
| Whole run | Exit 0, 8.119 seconds; 1 Commander prompt + 1 Worker prompt = 2 new CLI attempts, below <=5 cap |
| Actual file-edit / Skill / full Worker readiness | NOT RUN / NO; no inflated P3 claim |

Evidence: `results/p5/pipeline-1791794810224/evidence.json`, `worker.json`; candidate/provenance and damaged archive backup in `results/p5/pipeline-mvp/`. Selected Commander tool calls/tool results/final answer and observed Worker model/turns are retained; no raw sessions/env/auth logs. Actual HTTP count and individual provider billing NOT VERIFIED. No account-limit polling or repeated prior P3 benchmarks.

### Encoding repair and checks

Replaced only the literal-damaged appended Round 2 outcome in P3_WORKER_E2E_BATCH with a short ASCII historical summary based on accepted ignored artifacts. Prefix bytes of earlier intact sections were checked unchanged; original damaged bytes remain in Git and ignored backup. CURRENT_TASK rewritten as clean ASCII English current handoff. All changed docs decode as UTF-8 and reject consecutive question-mark runs/U+FFFD. No guessing/retranslation of missing Korean prose; user-facing execution report is Korean.

`node --check`, focused `--check` startup, real pipeline acceptance, Worker JSON/toolResult/final equivalence, exact observed model checks, package SHA512, archive-prefix equality, UTF-8 integrity, local evidence links and `git diff --check` PASS. No broad regression/doctor/reinstall/Skill benchmark was run. Only one helper and three scoped docs changed; canonical Skill/link/Pi settings/main/two stashes/runtime/sessions/user auth/PATH preserved. One feature commit/push, no main merge.

Next: Claude independent delta/evidence review of the single implementation SHA without repeating models; GPT/user accept the P5 text/artifact vertical slice. Native Skill/file-edit readiness and harness comparisons remain deferred, not prerequisites for this MVP.


## P5 hardening: independently reviewed MVP corrections (2026-10-12)

**STATUS: APPROVED, one Codex implementation/test/push batch.** This is the ONLY active follow-up. The underlying **Pi -> Claude CLI -> Pi text/artifact pipeline succeeded** in executor commit `bf94451`; a separate Claude independent review classified the *overall delivery PARTIAL* because of three practical operational defects, with no model call/Git changes in the review. Preserve all passed evidence; do NOT revisit previous P3 Skills/sandbox research, model benchmarks, Codex/Hermes CLI comparison, or architect a framework.

### Existing verified PASS versus defects

- Real Pi 1.0.4 dispatched real Claude Code CLI 2.1.292 and received a nonempty real Worker result through a tool event; Pi replied `PIPELINE_P5_RESULT=42` on exact OpenRouter NVIDIA Super `:free`; elapsed 8.119 s, two CLI prompts. This is **pipeline routing PASS**, not file tools, Skill execution or complete Worker readiness.
- The 82-line `scripts/commander.mjs` is minimal, but its final exit-condition only checks whether Pi's final answer is nonempty. A wrong or fabricated Commander answer **could exit 0**. The previous single run's content matched; the validator itself is deficient.
- The parent uses synchronous Pi process termination/timeout, and Pi launches Claude as a descendant. On parent timeout/maxBuffer/process abort, **descendant Claude cleanup is unproven**; cannot claim every process is stopped.
- Claude executable hardcoded to Windows WinGet `%LOCALAPPDATA%\Microsoft\WinGet\Links\claude.exe`. Installation default worked, but other Windows installs/local laptop paths cannot be explicitly selected.
- Evidence sanitization, use of exact pinned free model and UTF-8 repair passed reviewer checks. No existing auth, runtime or main/stash mutations observed, but reviewer did not take independent pre/post snapshots of every OS setting, so do not claim an independently proven global no-change guarantee.

### Execute A+B+C in ONE Codex batch, no mid-review approvals

**A — Fix correctness first in the existing small helper.**

1. Define a clear, deterministic **worker-result-to-final-answer correspondence contract**. For the current exact synthetic task, normalize only harmless whitespace and require Pi final to contain the full nonempty Worker result verbatim (or stronger, exact equality for `return exactly` tasks) and also verify the distinct `claude_worker` toolResult carries that same full Worker output. Mere nonempty Pi prose, a matching filename, fabricated result, or the existence of `worker.json` alone is NOT success. If the Commander paraphrases, explicitly classify semantic correspondence `NOT VERIFIED` and fail closed rather than using an LLM judge. Do not overfit only the literal number `42`; a second toy payload with different expected content should be evaluable.
2. Ensure one actual Worker dispatch, exact observed Commander/Worker model only, successful Worker exit and Pi exit, and validated nonempty structured Worker output. On mismatch, error or model drift **nonzero exit** and sanitized failure diagnostics, no raw auth stderr. Evidence must state `pipelineSuccess` and validated result content relationship, not only report process exit 0.
3. Add focused **offline/zero-model** negative tests proving a wrong Pi final and a missing/failed Worker toolResult cannot PASS. Tests can use mocked event JSON and small pure helpers; do not build a test framework or add dependencies.

**B — Parent/descendant lifecycle and portable CLI resolution.**

1. Replace blocking `spawnSync` orchestration as needed with Node built-in process/AbortController primitives, keeping one simple launch command. Implement bounded timeout, abort, output limit and Ctrl+C handling with **best-effort guaranteed process-tree cleanup** on Windows, targeting **only known child PIDs** (e.g. native `taskkill /PID ... /T /F` with bounded error handling). Ensure both Pi and any Claude descendants are not left running after timeout/mismatch/error; never kill arbitrary user PIDs. If platform semantics prevent absolute termination guarantees, report exactly what was tested rather than claiming universal guarantee. Avoid runaway retry/daemon/background processes.
2. Use supported optional `AGENTCO_CLAUDE_CLI` or another clearly documented opt-in executable path for other Windows installations; default to the current verified WinGet link. Validate explicit path exists/is a file and never permit model output/prompt to select an executable. A single nonsecret `--check` can show whether dependencies/path resolve, without reading keys or starting providers. Don't change User/Machine PATH, vendor login, npm pinned package or global settings. Non-Windows support is a future portability task, not part of this fix.
3. Prove negative timeout cleanup **offline** with an owned mock parent->child->grandchild process fixture and a short abort/timeout; verify target mock descendant exits and unrelated test/control process survives. No live model calls for kill-tree testing. Do not leave detached mock children.

**C — Small live acceptance and preservation.**

1. Run `node --check`, `--check`, two offline negative response-validation tests, offline nested-process timeout/cancel test, and one real **toy** Pi->Claude->Pi request if safety gates are still intact. Budget <=2 NEW CLI model prompt attempts (1 Commander + 1 Worker), no repeat of model-quality benchmarks. Same exact published $0 `nvidia/nemotron-3-super-120b-a12b:free` model for both, zero paid/provider/auxiliary fallback, limited synthetic-only inputs. Inherit only already-authorized key source; never print or persist value. No private Agentco or company source may be supplied to free models.
2. Keep new code localized to `scripts/commander.mjs` and at most a tiny dedicated offline test file if truly necessary. No third-party packages, new Pi Extensions in production, new Skill loaders, sidecars, custom commander framework, browser/daemon or UI.
3. Update `docs/CURRENT_TASK.md` and this active work order with **short Korean or clean ASCII-English** status (avoid the prior encoding `???` corruption). Keep `docs/DECISIONS.md` and `docs/WORK_PLAN.md` unchanged unless vital. Save sanitized evidence under ignored `results/p5/` and report portable launch example with optional Claude CLI override. `git diff --check`, check no secret artifacts staged, one commit/push on feature branch only. Preserve root `.env`, profiles, PATH, Claude Desktop, Pi settings, both stashes, main and runtime.
4. One Claude independent review at the end, **한국어 보고**, no repeated model/API tests. Before review say `P5 pipeline operation PASS; final hardening independent review PENDING`. No P5 main merge until GPT/user accepts post-hardening evidence.

**Acceptance:** healthy synthetic pipeline PASS; fake/mismatched final answer FAIL; missing toolResult/failed Worker FAIL; induced timeout cleans the known fixture process tree; installation-path override works without global modifications; exact-free-model routing unchanged. This is **P5 PIPELINE MVP hardening**, **not** full file-edit/Skill/Worker READY proof. Upon closure prioritize extending the already working Pi -> Claude pipeline to a toy file-edit task, separately from Codex/Hermes benchmarks.
