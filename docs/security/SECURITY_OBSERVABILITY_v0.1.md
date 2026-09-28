# Security Observability v0.1 (Phase 4A)

**Phase**: Pi Dev Architecture v0.4 — Phase 4A
**Status**: Implemented and runtime-verified. Observability only — no policy, no enforcement.
**Depends on**: [SECURITY_NATIVE_AUDIT_v0.1.md](SECURITY_NATIVE_AUDIT_v0.1.md) (Phase 4) — this document validates that the `tool_call`/`tool_result` mechanism confirmed there can produce a stable, normalized event stream a future policy engine could consume.

**Question this phase answers**:
> Pi native `tool_call` / `tool_result` interception을 이용해 향후 Security Policy Engine이 소비할 수 있는 normalized security event를 안정적으로 생성할 수 있는가?

Answer: **Yes**, confirmed by source review and real runtime tests (DEV, via `external/pi`'s own bundle, and USER, via the self-contained `pi-dev-user` bundle with vendored `jiti`).

---

## Purpose

`pi-dev-security-observer` listens to every `tool_call`/`tool_result` extension event Pi fires and converts each into a `SecurityObservation` record held in a small session-local, in-memory ring buffer. It never returns `block: true`, never mutates `event.input`, and never rewrites a `tool_result`. It exists to prove the *mechanism* and *shape* of security-relevant observation — not to make any allow/confirm/deny decision. That is explicitly deferred to a future Phase 4B.

## Architecture

```
Pi tool_call event  ──┐
                       ├─→ normalizeToolCall() ─→ classifyTool() ─→ resolveWorkspaceRelation()
Pi tool_result event ─┘         │                                          │
                                 ▼                                          ▼
                          SecurityObservation ──────────────────────→ in-memory ring buffer (max 50)
                                                                              │
                                                                              ▼
                                                              /security-observations command
                                                                  (ctx.ui.notify, on demand)
```

No policy engine exists yet. Nothing downstream of "push into the ring buffer" exists in this phase — this is deliberately a dead-end pipeline, matching the OBSERVE-BEFORE-ENFORCE principle.

## Pi Native Events Used

Both confirmed real and source-grounded in Phase 4 (`SECURITY_NATIVE_AUDIT_v0.1.md` §2-3):
- `pi.on("tool_call", handler)` — fires before every tool executes, for built-in, extension, and SDK custom tools uniformly. Handler receives `(event, ctx)`; `event.toolCallId`, `event.toolName`, `event.input` (typed per built-in tool; `Record<string, unknown>` for custom tools).
- `pi.on("tool_result", handler)` — fires after every tool executes. `event.toolCallId`, `event.toolName`, `event.isError`, plus `content`/`details`/`usage` (deliberately **not read** by this extension — see Privacy/Redaction below).

Both handlers return nothing (`undefined`) in every code path — no `block`, no input mutation, no result rewrite.

## Normalized SecurityObservation Schema

Implemented (not a TypeScript `interface` at runtime, since the shipped file is import-free plain JS/TS — documented via JSDoc `@typedef` in-file):

```ts
type SecurityObservation = {
  event: "tool_call" | "tool_result";
  tool: string;
  category: "filesystem" | "shell" | "search" | "extension" | "other";
  operation?: string;
  workspaceRelation?: "inside" | "outside" | "unknown";
  targetPath?: string;       // resolved absolute path, filesystem/search tools only
  command?: string;          // sanitized, length-capped preview only — never raw/full
  cwd?: string;
  status?: "ok" | "error";   // tool_result only
  callId?: string;           // = native toolCallId, correlates tool_call ↔ tool_result
  timestamp: string;         // ISO 8601
};
```

**Explicitly not frozen.** This is the schema Phase 4A validated the *shape* of, not a committed public API — a future policy-engine phase may reshape it based on what turns out to be actually needed.

`callId` uses Pi's own `toolCallId` (present on both `ToolCallEvent` and `ToolResultEvent` per `extensions/types.ts:889-1021`) — no new correlation subsystem was built, per instruction.

## Workspace Boundary Classification

Uses `path.resolve`/`path.relative`/`path.isAbsolute` (Node builtin `node:path`), never string-prefix matching:

```js
const resolved = path.resolve(workspaceRoot, rawPath);
const relative = path.relative(workspaceRoot, resolved);
const inside = relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
```

This correctly handles the Windows cases named in the task brief: `C:\repo` vs `C:\repo2` (sibling directory) is **not** misclassified as inside despite the string-prefix match a naive `startsWith` would produce, and a different-drive path is `outside` because `path.relative()` across drives returns the target path unchanged (itself absolute), which the `!path.isAbsolute(relative)` check catches. Verified empirically in the runtime tests below, not just by source reading.

**Tool-specific path extraction** (field names confirmed from actual Pi source, not assumed):
- `read`, `edit`, `write` → `input.path` (always present, per `readSchema`/`editSchema`/`writeSchema` in `core/tools/{read,edit,write}.ts`)
- `ls`, `find`, `grep` → `input.path` (optional; when absent, the tool's own documented default is "current directory," so this extension falls back to `ctx.cwd`, which is unambiguously `inside`)
- `bash`/`powershell` → **no `path` field at all** in their input schema (`{command, timeout?}` per `core/tools/bash.ts:42-45`); `workspaceRelation` is set to `"unknown"` for shell tools rather than guessed
- Any tool not in the known set (including unrecognized custom tools) → `workspaceRelation: "unknown"`, `category: "other"` — never guessed, never throws

## Privacy / Redaction Behavior

- `tool_result.content`/`details`/`usage` are **never read**. Only `toolName` and `isError` are extracted from a `tool_result` event — matches the brief's "no full tool result logging" requirement exactly.
- `write`'s `content` field (full file body) and `edit`'s `edits[].oldText`/`newText` are never touched — only `path` is extracted from either.
- PowerShell/bash `command` is captured as a **sanitized preview only**: whitespace-collapsed, capped at 200 characters, with `...(truncated)` appended when cut. The full raw command is never stored anywhere — the schema field itself only ever holds the capped preview (not "cap it on display" — cap it at the point of extraction), which is a stricter guarantee than the brief technically required.
- No `process.env`, no credential values, no `Authorization` headers, no file content of any kind ever appears in a `SecurityObservation`.
- Nothing is ever written to a file, database, or network endpoint — the ring buffer is a plain in-memory array, gone when the process exits.

## Commands Added

**One**: `/security-observations` — dumps the current in-memory buffer (most-recent-last, capped at 50 entries) via `ctx.ui.notify()`, one compact line per observation. No new custom tool was registered — the brief explicitly asked not to expand model-accessible capability unnecessarily, and a command alone was sufficient for validation. `--tools` allowlist is therefore unaffected by this extension (it registers zero tools).

## DEV Runtime Result

Confirmed via `discoverAndLoadExtensions()` (model-free, `external/pi`'s own built dist) with both `pi-dev-info.ts` and `pi-dev-security-observer.ts` loaded together:
```
errors: []
pi-dev-security-observer.ts → tools: [] , commands: ["security-observations"], handlers: ["tool_call", "tool_result"]
```
Then confirmed via a real end-to-end CLI run (`external/pi/packages/coding-agent/dist/bundle/cli.js`, `--mode json -p`, OpenRouter/`z-ai/glm-5.3-flash`) executing the full Test Matrix A–F in one session (see below) — every expected observation appeared on stderr (temporarily instrumented for this verification only — the shipped file has no debug output; see Packaging Notes), and the trajectory's `tool_execution_end` events show unmodified tool results throughout.

## USER Runtime Result

Confirmed via a real end-to-end CLI run against the actual self-contained `pi-dev-user` bundle (`runtime\node\node.exe` + `runtime\pi\dist\bundle\cli.js`, `PI_PACKAGE_DIR` set), loading both extensions with `--extension` twice. Exit code 0, both extensions active, `tool_call`/`tool_result` observations captured correctly (read + `get_pi_dev_environment`), no extension load errors reported in the session output. Confirms the already-vendored `jiti` (Phase 3) handles **two** TypeScript extension files loading together with no new dependency added.

## Test Matrix

| Test | Setup | Result |
|---|---|---|
| A — inside-workspace read | `read allowed.txt` from fixture `workspace/` | `category: filesystem`, `workspaceRelation: inside`, correct resolved `targetPath` |
| B — outside-workspace read | `read ../outside/blocked-test.txt` from `workspace/` | `workspaceRelation: outside` (correctly classified despite traversal); **read still succeeded normally** — observer did not block it, confirming pure observability |
| C — workspace write/edit | `write allowed.txt` with new content, inside fixture | `workspaceRelation: inside`; write succeeded normally, content unmodified |
| D — PowerShell safe command | `powershell` running `Get-Location` | `category: shell`, `command: "Get-Location"` captured verbatim (under the 200-char cap) |
| E — extension custom tool | `get_pi_dev_environment` (Phase 3 tool) | `category: extension` for both `tool_call` and `tool_result` — confirms the observer sees extension-registered tools identically to built-ins, not just a built-in-only path |
| F — failed tool result | `read does-not-exist.txt` | `tool_result` observation with `status: error`; native tool result carried the real `ENOENT` message unmodified in the actual trajectory (observer didn't touch it) |

All six ran in fixture directories only (`security-observer-fixture/{workspace,outside}/`, deleted after verification) — no real user home, credential, or system file was touched. All six passed exactly as expected, on both DEV (via `external/pi`'s own bundle) and, for a representative subset (A, E), USER (via the self-contained bundle).

## Tool Behavior Regression

Checked directly against the `--mode json` trajectory, not assumed:
- `tool_execution_end` for the outside-workspace `read` returned the real file content (`"blocked-test content, outside workspace fixture"`) — unmodified, unblocked.
- `tool_execution_end` for `write` returned the normal `"Successfully wrote to allowed.txt"` success message.
- `tool_execution_end` for `get_pi_dev_environment` returned its normal Phase 3 JSON payload, unmodified.
- `tool_execution_end` for the failing `read` returned the real Node `ENOENT` error message, `isError: true` — the natural failure, not something the observer manufactured or altered.
- Total `tool_execution_start`/`tool_execution_end` pairs in the trajectory (6) matched exactly the 6 tool calls issued — no extra, no missing, no duplicated executions.

No blocking, no confirmation prompt, no input mutation, no result rewrite occurred anywhere in either extension's presence.

## Packaging Notes

- **Single source, zero divergence**: `internal/pi-dev/config/extensions/pi-dev-security-observer.ts` and `internal/pi-dev-user/config/extensions/pi-dev-security-observer.ts` are byte-identical (verified with `diff`). No DEV/USER logic split was needed this time, unlike the earlier `pi-dev-info.ts` situation where USER's copy diverged (zero-import rewrite) — this observer was written import-free from the start (following the same proven pattern), avoiding any need for two versions.
- **No new dependency**: only Node's built-in `node:path` is imported, plus the already-vendored `jiti` (Phase 3, `internal/pi-dev-user/runtime/pi/node_modules/jiti`) continues to be reused as the TS-extension loader — nothing new was added to either package.
- **Verification-only instrumentation**: to observe the ring-buffer contents during headless (`-p`/`--mode json`) testing — where `ctx.ui.notify()` renders nothing, the same limitation documented in Phase 3 — a temporary debug copy of the extension with `console.error(JSON.stringify(...))` added inside the handlers was used from the session scratchpad directory only, run via explicit `--extension <scratch-path>`, and deleted immediately after verification. **The shipped files in `internal/pi-dev/` and `internal/pi-dev-user/` contain no debug output of any kind.**

## Known Limitations

- **No symlink/junction realpath enforcement** — workspace-relation classification is purely lexical (`path.resolve`/`relative`), not `fs.realpath`-based; a symlink pointing outside the workspace would currently classify by its lexical path, not its real target.
- **No PowerShell semantic interpretation** — `command` is an opaque, truncated string preview; the observer does not parse or understand PowerShell syntax at all (same structural limit documented in the Phase 4 audit).
- **No command security guarantee of any kind** — this is observation, not policy; nothing here classifies risk.
- **No persistent audit log** — the ring buffer is session-local, in-memory, capped at 50 entries, and lost on process exit. Persistence is explicitly out of scope (a Phase 4E candidate, not this phase).
- **No extension sandbox** — this extension, like any other, runs as plain Node code with full privileges; nothing about Phase 4A changes the Phase 4 finding that Pi has no extension sandboxing.
- **No non-disableable enforcement** — `--no-extensions` removes this observer exactly as easily as any other extension (Phase 4 finding, unchanged).
- **No network containment** — the observer has no visibility into what a PowerShell-spawned process does over the network; only the initiating command string is captured.
- **No credential containment** — this extension does not scrub or filter environment variables passed to subprocesses (that's the separate, already-implemented `BashSpawnHook`/`scrub-powershell-credentials.js` pattern, a different mechanism entirely, not touched by this observer).

## Phase 4A Verdict

**PASS**

All eight PASS criteria from the task brief are met:
- ✅ built-in filesystem tool observed (Test A/B/C — `read`/`write`)
- ✅ PowerShell observed (Test D)
- ✅ extension custom tool observed (Test E — `get_pi_dev_environment`)
- ✅ inside/outside workspace classified correctly, including a real path-traversal case (Test B)
- ✅ `tool_result` success/error observed (Test F)
- ✅ no tool behavior changed (Tool Behavior Regression section — verified against actual trajectory, not assumed)
- ✅ USER runtime works (confirmed via the real self-contained bundle, zero new dependencies)
- ✅ no sensitive result logging (tool_result content/details never read; command captured as a capped preview only; no env/credential values anywhere)

## Next One Action

Phase 4B (not started, not authorized by this document): design — still design only, no `ALLOW`/`CONFIRM`/`DENY` implementation — a workspace-boundary policy layer that consumes exactly the `SecurityObservation.workspaceRelation` field this extension already produces, since that is the one classification Phase 4 identified as both fully native-observable *and* having zero native enforcement today (`SECURITY_NATIVE_AUDIT_v0.1.md` §14, gap #1). Do not begin implementation until that design is reviewed, per the Phase 4/4A stop conditions.
