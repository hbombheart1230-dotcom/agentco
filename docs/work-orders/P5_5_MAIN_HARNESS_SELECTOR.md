# P5.5 — Select Main Harness + explicit named delegation (preserve existing AUTO)

**Status:** task specification, implementation pending (2026-10-13)
**Base main:** `cc6078fed3e1d9b4c0103a8de8d9c0a18ac1f37e`
**Assigned feature:** `feature/p5-5-main-harness-selector`

## User intent (authoritative)

The user wants **minimal additive work** and strongly prefers keeping existing implementation untouched:
- `agentco` opens a lightweight menu: `1 Pi [default] / 2 Claude Code / 3 Codex CLI / 4 Hermes`. Enter chooses Pi. That selection becomes Main; the existing official native CLI is used for the conversation.
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
- Locate native executables from trusted paths/installed local config. Do not use P5.4 synthetic child-only TEMP HOME/config as Main; those are for fixed isolated `add42`, not general interactive sessions. Avoid modifying/exposing existing native profiles, local auth, secrets, stashes or installed files. Never change or silently select a paid model. If selected Main's free-only model/profile isn't verified/usable, show a concise `NOT_READY` or `CONFIG_REQUIRED` with no fallback instead of launching unknown paid model. Distinguish executable present from general Main-ready.
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
2. **Native CLI smoke:** user-local explicit checks launch the correctly named **real** Pi/Claude/Codex/Hermes or report accurate NOT_READY; verify Main model route is free before any live prompt. Label each `LIVE / MOCK / NOT RUN / BLOCKED`. Do not claim general worker readiness from executable presence.
3. **Explicit named delegation:** offline test proves requested identity is invoked, task is scoped/sanitized, failure has no fallback, no-target leaves same Main/default-AUTO, and P5.4 `add42` implementation was unchanged. For each Main, report **NATIVE-CHAT VERIFIED / EXPLICIT-COMMAND ONLY / NOT_READY**. Never claim natural language recognition works without a live authorized test.
4. **Regression boundary:** narrow tests only; old P5.4 suites do not need rerun if files unchanged. Verify P5.4 core files unchanged with Git diff. No browser/finance code diff.
5. **Handoff**: show `BRANCH`, `BASE_SHA`, `IMPLEMENTATION_SHA`, `MAIN_LAUNCH_MATRIX`, `EXPLICIT_DELEGATION_MATRIX`, `AUTO_UNCHANGED`, `MODEL_COST_GATE`, `TESTS_LIVE_VS_MOCK`, `CHANGED_FILES`, `KNOWN_GAPS`, `PUSH`. NEVER mark a capability PASS merely because the command exists.
