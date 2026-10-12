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
