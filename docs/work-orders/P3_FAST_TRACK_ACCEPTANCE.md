# P3 Fast Track — four harnesses, common Skills and free-model mini-benchmark

**ACTIVE / USER APPROVED: larger work units, batch execution (2026-10-12).**
**Workspace:** `C:\Agentco` / `feature/p3-worker-harness-design`.
**Operator:** local Codex implements, validates and pushes; Claude makes **one combined independent review at the end**; GPT closes based on evidence. No repeated approval between small subtasks.

## Objective

In **one execution** reach the most usable native-only baseline for **Pi 1.0.4 / Codex 0.162.1 / Claude CLI 2.1.292 / Hermes v0.21.7**:

1. Common Skill views, one canonical source, no copying of skill contents.
2. Harness-native CLI/model routing to OpenRouter **NVIDIA `:free` only**, ideally same `nvidia/nemotron-3-super-120b-a12b:free` for fair comparison.
3. A few identical **synthetic toy benchmarks** with pass/fail, completion time, requests where observable; do not build a benchmark framework.
4. Harness-specific official Extension/hook/plugin inventory **as-is**, no new custom Extension.

**Reuse completed results rather than revalidate:** Pi 3 Skills/0 diagnostics and registered Codex `.agents/skills` link both PASS; official CLI installations all independently verified; Claude Code free-model plain-text `READY` PASS (one CLI turn, actual provider billing unobserved). Codex and Hermes 0-call state is a safety preflight BLOCKED, **not** evidence that their models fail. Current branch HEAD baseline `9504669fdd1cab55083801adf27517800b62cda6`.

## Work batch (one Codex session, no intermediate user questions)

### A — Native common Skills, no loader

- Leave current Pi + Codex Skill configuration untouched; do not rerun full doctor or symlink test suite.
- For Claude, use documented **repo-local** `.claude/skills/agentco-delta-handoff` native Skill discovery if supported by installed 2.1.292. Create exactly one relative directory symlink to `shared/skills/agentco-delta-handoff` using **Windows-native backslashes in `os.symlink`**; Git stores normalized mode `120000` blob. Check actual `SKILL.md` read, source identity, native discovery if a safe official check exists, and Pi dedup (only a *focused* count, no repeated broad tests). Do not touch user-global `~/.claude` or copy Skill bodies. If native discovery/symlink is unsupported, skip that lane with one-line BLOCKED; continue.
- For Hermes, inspect only documented native external Skill source/config. **Do not attach writable `skills.external_dirs` to the real shared Skill source** without a proven read-only OS boundary; don't change source ACL. If no safe native read-only view is available, classify **Hermes common Skill BLOCKED**, continue with model/CLI trials. No copier, skill loader, bootstrap or custom security shim.
- List harness-owned official Extensions/hooks/plugins already present only; do not invent/install new ones in this batch.

### B — Free model compatibility, normal native operation

- Reuse Claude's previous one-turn `READY` success; no repeated model request just to confirm it.
- Reuse the user's previously authorized *narrow local key handoff*, preferably already-inherited `OPENROUTER_API_KEY`; if needed, access **only the previously approved exact key entry**, inject into child env opaquely, never dump/print/commit/embed into prompt or config. Do not inspect other keys, auth stores or private files. If credential genuinely unavailable, skip *only online lanes*; finish Skill/inventory tasks.
- **All online agent launches run with cwd in a fresh toy-only workspace outside `C:\Agentco`** (and outside private user workspaces), with synthetic files only and no inherited project instructions. Never send real Agentco source/Samsung/personal content to free endpoints. Use vendor CLI native flags, child-scoped ephemeral configurations and minimal official sandbox/read-only/no-tools settings that actually exist; preserve all user's profiles and sessions.
- Avoid over-constraining every CLI to tool-less mode: if an installed harness **requires its normal tools**, allow a tiny synthetic coding/tool task **only when a verifiable native or OS-level restriction prevents access to real private files, credentials and unrelated write locations**. Read-only approval flags alone do not constitute isolation. If not available, run safe text-only if supported; otherwise mark *that lane* BLOCKED and move on. **Do not** build wrappers, patch vendors or spend another round investigating source internals.
- Provider/model pin: exact OpenRouter free slug `nvidia/nemotron-3-super-120b-a12b:free`, no auto/premium/fallback/auxiliary paid model. Check public $0 metadata before first call; stop that harness if native config cannot rule out paid fallback. Rate limits may cause BLOCKED, not retry loops.
- Bounded budget: at most **two synthetic CLI prompt attempts per newly tested harness**, max ~8 prompt attempts total for the entire batch, with reasonable short timeouts and small output limits. No manual retries, no automated extensive test harness. Count actual requests/cost only when independently observable; don't equate CLI turns with HTTP calls or client estimates with provider charges.

### C — Mini benchmark and summary

- Run the same **two tiny synthetic tasks** on each safe working harness:
  1. Text-only: summarize a fake technical incident in 2 sentences (deterministic rubric: required facts).
  2. Coding: produce a minimal change to a **toy** function or unified diff; use file tools only if the tool boundary is verifiably safe, otherwise use a text-only code response and mark mode explicitly.
- **Skip passed duplicate tests:** Claude prior `READY` counts toward reachability, but new benchmark prompts are optional under above total cap. Pi can join if existing supported isolated route permits it; otherwise record `NOT RUN`.
- Make a compact Markdown table: `Pi / Codex / Claude / Hermes` × `installed / Skill usable / text API / tool task / elapsed / calls / fallback / status`. State `PASS / PARTIAL / BLOCKED / NOT RUN` without conflation. Include an actionable **one-line blocker** per unavailable lane and a suggested next action, not another long multi-phase plan.
- Save toy benchmarks and sanitized results only in an owned ignored `results/p3/` area or the new external temporary toy workspace; no generated binaries, keys or private paths in Git.

## Fast-execution rules

- **Do not create P3.4c / P3.5a / P3.5b for each little obstacle.** One work order, one execution, one delta commit/push, **one final Claude verification** for substantive changes.
- At most one narrow investigation per failing lane; record blocker then continue independent lanes. Don't turn optional checks (POSIX, Git global PATH, billing provider account, repeated installs, full regression) into blockers.
- Preserve pinned Pi, stable Codex and VS Code extension paths, Claude Desktop, Hermes, user PATH/keys/sessions/runtime, main and two stashes. Don't upgrade/reinstall.
- Do not enable autonomous service, browser actions, external Skills with write access to canonical source, login, paid fallback, credentials disclosure or broad source scanning.
- Require a clean branch/safe origin sync before changes; no hard reset, force push, stash clean or main merge. Actual source changes allowed: **one Claude repo-local native Skill link if proven** and minimal documentation only. No custom product code.
- Close out by updating `docs/CURRENT_TASK.md` and **this** work order, `git diff --check`, commit/push on feature branch. If a given lane is BLOCKED, continue other lanes and commit actual partial results.
- Claude independent verifier then checks this single new implementation SHA and only changed surface; GPT judges final. This batch may produce partial readiness; never claim full Worker READY before real tools/security evidence.


## Interrupted P3.4b recovery and one-batch continuation (2026-10-12)

**Background:** Codex was executing the earlier P3.4b when GPT's `9504669` -> `5f1082f` origin update introduced the new Fast Track. Codex correctly STOPPED under repository concurrent-write policy, **not a CLI/model FAIL**. Two local **uncommitted** documentation edits remain (`docs/CURRENT_TASK.md`, `docs/work-orders/P3_FREE_MODEL_SMOKE.md`); no commit/push, API calls, credentials or runtime modifications occurred. Preserve these exact edits and import only their new factual conclusions before the Fast Track batch. This section explicitly authorizes the safe reconciliation; no need for another micro-task or user confirmation.

**Preserved investigation findings:** Codex native complete tool removal remains unverified. Hermes installed native source supports empty-tool selection in some paths and title/fallback control, but **full auxiliary request elimination is still not proven**. These are targeted known gaps. Do not restart the entire P3.4b audit, repeat the Claude `READY` model test, or equate either gap with actual provider protocol failure.

**One-time Git reconciliation, BEFORE any new implementation:**

1. Fetch remote metadata only, verify feature local HEAD is ancestor of remote and remote Fast Track SHA/path set matches expected. Inspect `git status --porcelain=v1` and exact **staged + unstaged** changes, focusing only on the two known P3.4b docs. Never `git pull` on a dirty tree, hard reset, force-push, broadly clean files or alter either existing stash. **If unexpected dirty/staged changes or divergent ancestry appear: STOP and report, with all files untouched.**
2. Preserve both entire locally edited documents **byte-for-byte**, plus full binary Git diffs and recorded SHA256 values, under a newly owned **ignored** `results/p3/p3-4b-interrupted-recovery/` directory. Verify snapshots equal current originals and patch/data are recoverable; do not put credentials/private source in this evidence. These two are documentation-only; no secret contents expected, but STOP if unexpected sensitive data is found.
3. Only **after verified recovery copies and user-scoped authorization here**, surgically restore **only the exact two named local documentation paths** to the old HEAD, leaving all other user files, installed runtime, ignored evidence and stash refs unchanged. No `git reset` or deletion of backup. Fetch/fast-forward `feature/p3-worker-harness-design` safely to remote using a **fast-forward-only** operation. Verify HEAD/origin and clean tracked state. If fast-forward fails, do not improvise; keep recovery copies and stop.
4. Extract P3.4b's **new factual findings only** from the saved document snapshots and append a concise paragraph to **this active Fast Track work order**, rather than restoring the obsolete P3.4b task pointer or reactivating another work order. Preserve both original snapshots ignored for future audit.
5. Then proceed through **all Fast Track batches A/B/C** in this same Codex session, continuing unaffected lanes. If a known safety blocker lacks a proven native/OS containment solution within one focused check, mark that CLI lane BLOCKED and move on; **don't re-run P3.4b from scratch**. No extra approval rounds.
6. Commit/push **only** one validated native Claude project Skill symlink if supported, `docs/CURRENT_TASK.md` and this active work order; leave the original `docs/work-orders/P3_FREE_MODEL_SMOKE.md` unchanged at remote version. Include the short recovery disposition and exact saved evidence directory in the final delta report.

**Concurrency rule:** GPT will not make any further feature-branch Git writes until the Codex batch ends. Codex should not request intermediate GPT documentation edits; finish one batch and push once.


## Execution delta (2026-10-12)

**Base:** `ee0073cb1c6f54acfd78cc4a69ea08fe9d2a5d00`; feature branch only. **Batch outcome: PARTIAL**, completed approved independent lanes; no main merge or new custom product code.

### Interrupted-work recovery: PASS

Saved both full dirty documents byte-for-byte, a full binary Git patch and SHA256 manifest at ignored `results/p3/p3-4b-interrupted-recovery/20261012-163312/`. Verified each copy equals its original, hashes match and `git apply --reverse --check` accepts the preserved patch against the interrupted tree. Confirmed only the two expected unstaged paths, no staged/untracked changes, and local HEAD ancestry. Restored only those two named paths after verification, then fast-forwarded `9504669` to `ee0073c`. Backups remain; neither existing stash was modified. `docs/work-orders/P3_FREE_MODEL_SMOKE.md` remains identical to the remote baseline; its obsolete task pointer was not restored.

**Imported P3.4b findings, without rerunning that audit:** Codex complete native tool removal remains unproven from pinned help, and matching local source/schema was unavailable. Hermes native `platform_toolsets.cli: []` supports empty selection, whereas empty CLI `--toolsets` falls back; title generation and main fallback chains have individual controls. However full auxiliary/final-tool suppression remains unproven. Fresh config homes and read-only flags do not provide private-file/network containment. Accordingly Codex/Hermes live lanes remain BLOCKED; no renewed deep source investigation, wrapper or patched CLI was used.

### A: common Skill and existing extension inventory

Created exactly one Windows directory symlink: `.claude/skills/agentco-delta-handoff` -> native `..\..\shared\skills\agentco-delta-handoff`. Official [Claude Skills documentation](https://code.claude.com/docs/en/skills) confirms project Skill paths and symlinked folders. Link identity, actual SKILL.md bytes, all canonical Skill file SHA256 values before/after the batch and Git index mode **120000**/blob `../../shared/skills/agentco-delta-handoff` PASS. No source copied or changed. Runtime Claude discovery/invocation **NOT RUN**: benchmark bare mode intentionally disables Skills, and no verified non-model discovery-only command was used. Filesystem registration PASS is not an invocation PASS.

Focused Pi native `loadSkills` on only `shared/skills`, `.agents/skills`, `.claude/skills` returned **one `agentco-delta-handoff`, diagnostics 0**; no duplicate from the new link. This targeted check did not reload global settings or repeat the full three-Skill suite. Existing Pi 3-Skill baseline and Codex native registration PASS were reused. Hermes common Skill **BLOCKED**: no read-only OS boundary for writable external Skill views; no pointer, ACL or configuration change was made.

As-is inventory from repository settings/tracked files and reused installation evidence: Pi configured upstream subagent/plan-mode example extensions, repo `permission-gate`, `protected-paths`, `git-checkpoint` extensions, and packages `pi-lsp@0.8.0`/`pi-skill-creator@0.3.4`; none changed. Codex existing official VS Code extension route and standalone CLI preserved; no new MCP/plugin/hook configuration. Claude has the new project Skill view, no repo hook/plugin files found in the focused tracked-path inventory. Hermes installed native plugin/MCP facilities preserved, no new plugin installed. Global private harness settings/plugin inventories were not inspected; absence globally is not asserted.

### B/C: identical synthetic benchmark, free-only text mode

Public unauthenticated [OpenRouter metadata](https://openrouter.ai/api/v1/models) rechecked exact `nvidia/nemotron-3-super-120b-a12b:free`, input/output pricing both **0** before the first call. Only the previously authorized target key was read locally when needed and passed opaquely through child environment; no value, length, prefix/hash, other key or auth-file contents were exposed or stored. No key appeared in argv, prompt, config, evidence or Git. Existing settings/auth/sessions/PATH were untouched.

Each prompt ran once in a separate owned external temporary toy workspace, with fresh config/home, no ancestor AGENTS.md/CLAUDE.md and no real project data. Both safe harnesses received identical incident and coding prompts, with the neutral system instruction `Respond only to the synthetic user prompt.` Pi uses native `--no-tools --no-extensions --no-mcp --no-skills --no-prompt-templates --no-context-files --no-themes --no-session`, explicit provider/model, thinking off, JSON print mode, child PI_CODING_AGENT_DIR, native model override maxTokens 256 and retry disabled. Its installed args/main/SDK confirm no-tools restricts all tools. Claude uses the previously proven native `--bare --restricted`, empty tools, deny all tools, strict MCP, empty setting sources/settings, no session persistence, no Chrome, max-turns 1; all model roles pinned to the same slug, requested max output 256, retry limit 0 and nonessential traffic disabled in child env. No auto permission bypass, tool, subagent, Skill invocation, auxiliary paid model or manual retry was used. Claude's earlier READY test was **not repeated**.

Rubrics: incident must have exactly two sentences and Aurora/HTTP503/12-minute/pool-exhaustion/restart-at-09:12/no-data-loss facts. Coding must return corrected `mean` code, with `mean([])==0`, `mean([2,4])==3`, `mean([-2,2])==0`. Generated toy code was checked against an AST allowlist, then evaluated locally with only sum/len and empty builtins; no model-supplied file/network action or product test code was added. Both incident rubrics and all six coding assertions PASS. Coding is **text-only code generation**, not file-edit/tool PASS.

| Harness | Installed / Skill usable | Text API | Toy coding / actual tools | Elapsed incident / coding | New prompt attempts / HTTP calls | Fallback / status |
| --- | --- | --- | --- | --- | --- | --- |
| Pi 1.0.4 | Reused PASS / reused PASS; new dedup PASS | PASS, incident rubric PASS | Code-response PASS / tools NOT RUN | 11.47s / 1.75s | 2 / independently unobserved | Exact free model observed, 0 tool calls; PARTIAL Worker readiness |
| Codex 0.162.1 | Reused PASS / reused registration PASS | BLOCKED, no attempt | NOT RUN / NOT RUN | ? / ? | 0 / 0 from this lane | Native all-tools-off and OS containment unproven; BLOCKED |
| Claude 2.1.292 | Reused PASS / link integrity PASS, runtime Skill NOT RUN | Prior reachability reused; new incident PASS | Code-response PASS / tools NOT RUN | 2.39s / 1.58s | 2 / independently unobserved | Exact free model only in model usage, 0 spawned subagents; PARTIAL Worker readiness |
| Hermes v0.21.7 | Reused PASS / common Skill BLOCKED | BLOCKED, no attempt | NOT RUN / NOT RUN | ? / ? | 0 / 0 from this lane | Full auxiliary suppression and safe writable Skill view unproven; BLOCKED |

**Total: 4 new synthetic CLI prompt attempts**, two per working harness, no retry or duplicate READY, below batch cap. Pi reported 146/56 and 145/24 input/output tokens and cost estimate 0; Claude reported 153/220 and 155/85 (output includes thinking), one turn each, local cost estimates $0.006265 and $0.0029. Claude estimates have unknown basis for this non-Anthropic slug; neither CLI estimate verifies provider billing. Physical HTTP request count and actual provider account cost remain **NOT VERIFIED**. No paid model was configured or observed; no provider billing/account query was made. Timing is single-run wall time including startup and network, not a statistically meaningful harness ranking.

Evidence: ignored `results/p3/fast-track-ee0073c/skill-link.json`, `pricing.json`, `benchmarks.json` (exact synthetic prompts, selected sanitized outputs/usage/rubrics; no raw session/env/auth logs). No persistent benchmark framework/script, new installer, loader, proxy or adapter. Existing generated runtime and recovery evidence retained.

### Checks and single final handoff

Recovery byte/hash/patch validation, safe FF, Claude link/source integrity, Git 120000 normalized target, focused Pi dedup/diagnostics, four deterministic text/code rubrics, obsolete work-order unchanged, intended three-file scope, local reference checks and `git diff --check` PASS. Fresh checkout, full doctor/smoke, repeat install/Skill baseline, real file tools, common Skill invocation, OS sandbox E2E and independent Claude review **NOT RUN**. Main and both stash SHAs unchanged. **WORKER READY remains NO** for all lanes pending actual Skill/tool/security E2E.

One-line next actions: Codex needs a proven native tool restriction or real OS containment; Hermes needs proven auxiliary suppression and a read-only Skill boundary. Claude/Pi can next validate Skills/tools only under established containment. These are one combined review/follow-up backlog, not new micro-phase work orders. Claude independently reviews the single new commit and changed surface without repeating inference; GPT/user adjudicate final status. No further live task is started by this report.
