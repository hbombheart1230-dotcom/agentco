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
