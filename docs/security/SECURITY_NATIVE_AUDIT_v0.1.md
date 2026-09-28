# Security / Approval Native Capability Audit v0.1

**Phase**: Pi Dev Architecture v0.4 — Phase 4
**Status**: Audit complete. No implementation performed in this phase (by design).
**Scope**: `external/pi` (`@earendil-works/pi-coding-agent`, v0.84.4) source only. No Pi source modification. No security extension, approval extension, audit extension, sandbox, blacklist, launcher security, or OS/registry/credential change was implemented as part of this document.

**Core question this document answers**:
> Pi Dev에서 사내 보안/승인을 구현할 때 무엇을 Pi native 그대로 쓰고, 무엇을 Extension으로 추가하며, 무엇을 Launcher/Gateway/OS 계층에 맡겨야 하는가?

---

## 1. Audit Questions — Direct Answers

1. **Tool call 실행 전에 Extension이 intercept 가능한가?** 예. `tool_call` event (`ExtensionAPI.on("tool_call", handler)`), dispatched from `agent-session.ts:_installAgentToolHooks` → `Agent.beforeToolCall` → `agent-loop.ts:prepareToolCall()`.
2. **allow / confirm / deny 가능한가?** allow/deny 가능 (`block: true` in a `tool_call` handler short-circuits execution with a synthesized error result). "confirm"은 native primitive가 아니라, 핸들러 안에서 `ctx.ui.confirm()`을 호출해 사용자 응답을 받은 뒤 그 결과로 `block`을 결정하는 조합으로만 존재한다.
3. **built-in tool에도 동일 적용?** 예. `tool_call`은 tool 이름과 무관하게 모든 tool 호출(내장 포함)에 대해 발생한다.
4. **extension custom tool에도 적용?** 예. 동일한 `tool_call` 경로를 지나간다 — Pi는 tool 출처(built-in/extension/SDK custom)를 이 지점에서 구분하지 않는다.
5. **PowerShell 실행 직전 command 검사 가능?** 예, 두 가지 별도 경로로: (a) 범용 `tool_call` 이벤트의 `input.command` 필드로 읽기/차단만 가능 — 이 경로는 명령을 **수정할 수 없음**(입력 객체 자체를 in-place 로 패치하는 것은 문서화되어 있으나 검증되지 않은 채로 실행됨, "6. `--tools` Audit" 참고); (b) `BashSpawnHook`/`PowerShellSpawnHook`으로 spawn 직전 `command`/`cwd`/`env`를 **완전히 재작성** 가능 — 단, 이 hook은 extension이 built-in tool을 대체하는 자체 tool 정의를 등록해야만 작동한다(아래 §7).
6. **read/write/edit 대상 path를 실행 전 검사 가능?** 예, `tool_call` 이벤트에서 `input.path` (또는 `read`/`edit`/`write`의 args)를 검사/차단 가능. Pi 자체에는 이 검사가 **없다**.
7. **workspace 밖 접근 차단 가능?** Pi native로는 **차단되지 않는다** (아래 §4 Filesystem Findings). Extension이 `tool_call`에서 path를 검사해 차단할 수는 있다.
8. **파일 삭제/대량 삭제 탐지·차단 가능?** `write`/`edit` tool 자체는 삭제 개념이 없다(overwrite만). 실제 삭제는 `powershell`/`bash` tool을 통한 `Remove-Item`/`rm` 등 임의 명령이므로, §5와 동일하게 command-string 레벨에서만 관찰 가능하고 구조적으로 "삭제 여부"를 신뢰성 있게 분류할 수 없다(§15 참고).
9. **network 명령 탐지·차단 가능?** PowerShell 안에서 실행되는 `Invoke-WebRequest`/`curl`/`git fetch` 등은 command-string 레벨 관찰만 가능(§7). Pi 자체의 provider 통신에는 별도 hook(`before_provider_request`, `before_provider_headers`, `after_provider_response`)이 존재하지만 이는 모델 API 호출용이지 agent가 실행하는 임의 프로세스의 네트워크 접근과는 무관하다.
10. **credential/env 접근 탐지·차단 가능?** `BashSpawnHook`/`PowerShellSpawnHook`으로 자식 프로세스에 전달되는 `env`를 필터링/scrub 가능(이미 `pi-dev`의 `scrub-powershell-credentials.js`가 이 패턴 사용). `process.env`를 읽는 PowerShell 명령(`$env:SECRET`, `Get-ChildItem Env:`) 자체를 실행 전에 의미론적으로 파악해 차단하는 것은 command-string heuristic 수준으로만 가능.
11. **child process / shell spawn 통제 가능?** `powershell`/`bash` tool의 spawn 지점 자체(`resolveSpawnContext` → `ops.exec`)는 hook으로 command/cwd/env를 재작성 가능. 그러나 일단 PowerShell 프로세스가 시작되면 그 안에서 추가로 생성되는 자식 프로세스(`cmd /c ...`, nested `powershell -Command ...`, 스크립트가 spawn하는 프로세스)는 Pi 레벨에서 전혀 보이지 않는다 — OS 프로세스 트리 내부이므로 Node 레벨 hook의 관찰 범위 밖.
12. **사용자가 approval 제공할 native UI/API가 있는가?** 있다: `ExtensionUIContext.confirm()`/`select()`/`input()` — interactive TUI와 RPC 모드에서 실제 사용자에게 프롬프트 표시.
13. **headless 모드에서는 approval이 어떻게 동작하는가?** `-p`/`--mode json`에서는 `setUIContext()`가 호출되지 않아 `noOpUIContext`가 사용되고, `confirm()`은 즉시 `false`, `select()`/`input()`은 즉시 `undefined`를 반환한다. **행 걸리지 않고, 자동 allow도 아니며, 사실상 자동 deny(confirm)/자동 undefined(select/input)** — 이는 우연히 fail-closed에 가깝게 동작하지만 Pi가 의도적으로 보장하는 계약은 아니다(코드 주석/문서에 명시된 정책이 아니라 스텁 구현의 부수효과).
14. **project trust는 무엇을 보호하고 무엇을 보호하지 않는가?** `.pi/settings.json`, project-local extensions/skills/prompts/themes/`SYSTEM.md`의 **로딩 여부**만 보호한다. built-in tool 실행(bash/powershell/read/write/edit 등)이나 일반 파일시스템 접근, 전역(`agentDir/extensions`) 또는 `--extension`으로 명시된 extension 로딩은 **전혀 보호하지 않는다**. "Project trusted = agent가 sandboxed"는 명확히 틀린 결론이다.
15. **`--tools` allowlist는 security boundary로 어느 정도 쓸 수 있는가?** built-in/extension/알 수 없는 이름 모두에 균일하게 적용되는 진짜 **capability gate**(허용 안 된 tool은 모델에게 아예 보이지 않고, 이름을 불러도 "not found"로 실패)다. 그러나 `powershell`/`bash` 자체를 허용하면 그 안에서 실행되는 임의 명령까지는 통제하지 못한다 — "tool 단위" boundary이지 "명령 내용" boundary가 아니다.
16. **Extension 자체 권한을 제한할 native sandbox가 있는가?** 없다. `jiti` 기반 로더는 순수 Node.js 모듈 실행이며 permission manifest, capability model, signature/checksum 검증이 전혀 없다.
17. **mandatory security extension을 사용자가 disable 못하게 할 native mechanism이 있는가?** 없다. `--no-extensions`는 settings.json(전역/프로젝트)에서 등록된 extension 로딩을 건너뛴다 — `--extension`(CLI)으로 명시된 것만 예외적으로 계속 로드된다. 즉 launcher가 settings.json에 보안 extension을 등록해 두어도, 사용자가 CLI에 직접 접근할 수 있다면 `--no-extensions`로 무력화할 수 있다. Pi 자체에는 "이 extension은 비활성화 불가"라는 개념이 없다.

---

## 2. Pi Native Security Mechanisms (source-grounded inventory)

| Mechanism | File(s) | WHEN | WHAT is exposed | CAN modify | CAN cancel/deny | CAN ask user | On exception |
|---|---|---|---|---|---|---|---|
| `beforeToolCall` / `tool_call` event | `packages/agent/src/agent-loop.ts:607-675`; `packages/coding-agent/src/core/agent-session.ts:479-529`; `core/extensions/runner.ts:982-1003` | Before every tool executes (built-in, extension, SDK custom) | Full tool name, `toolCallId`, args | Yes — handler may mutate `event.input` in place; **not re-validated** after mutation | Yes — first handler returning `block:true` short-circuits; can also set `terminate:true` | Only indirectly, by calling `ctx.ui.confirm/select` inside the handler | Not explicitly audited in this pass; general extension-runner error handling applies (handler exceptions do not appear to be caught per-handler in the traced code path — treat as unconfirmed) |
| `afterToolCall` / `tool_result` event | same files, `agent-loop.ts:720-765` | After tool execution, before result returns to model | Full result `content`/`details`/`usage`/`isError` | Yes — can rewrite content/details/usage/isError/terminate | Effectively yes via `terminate` | No | — |
| `BashSpawnHook` / `PowerShellSpawnHook` | `packages/coding-agent/src/core/tools/bash.ts:162-196`; `core/tools/powershell.ts:24-25`; `examples/extensions/bash-spawn-hook.ts` | Synchronously, immediately before `spawn()` | `{command, cwd, env}` | Yes — full rewrite of all three fields | No native cancel signature (returning doesn't abort; would need to combine with `tool_call` block) | No | N/A |
| `--tools`/`-t`/`--exclude-tools`/`--no-tools`/`--no-builtin-tools` | `cli/args.ts:130-142`; `agent-session.ts:_refreshToolRegistry` (~2663-2754) | At session/registry construction | Tool name only (no args) | N/A (binary include/exclude) | Yes — excluded tools never enter the registry; calling them fails as "not found" | No | N/A |
| Project trust (`trust-manager.ts`, `project-trust.ts`) | Session start / resource loading | Whether `.pi`-local extensions/skills/prompts/themes/settings load | Directory path being evaluated | No | Yes/No decision gates loading | Yes, via `project_trust` extension handler or trust prompt (falls back to `false` if `ask` + no UI) | Fails closed to `false` if `ask` mode with no UI (`project-trust.ts:86-88`) |
| `ExtensionUIContext.confirm/select/input` | `core/extensions/types.ts:133-284`; `runner.ts:441-486` (`ui_prompt_start/end`) | Anywhere an extension handler chooses to call it | Whatever the extension passes as prompt/options | N/A | Effectively yes (result feeds the calling extension's own logic) | Yes — this *is* the ask-user primitive | Headless: `confirm→false`, `select/input→undefined` (no-op stub, `runner.ts:236-267`); RPC: resolves `false`/`undefined` on client cancel/timeout |
| `before_provider_request` / `before_provider_headers` / `after_provider_response` | `core/extensions/types.ts` (event union) | Around calls to the model provider API | Request/headers/response for the **model API call** | Yes (headers/request rewritable per event name) | Partially, depending on event contract (not fully traced — out of scope, this governs provider traffic, not agent-executed subprocess/network activity) | No | — |
| Extension loader (`jiti`) | `core/extensions/loader.ts:254-508, 758-806` | Extension file load | N/A — loads as plain Node module | N/A | No sandboxing/signing/permission check exists | No | Load errors are captured into `extensionsResult.errors` (does not crash session) |

---

## 3. Tool Execution Lifecycle (source-grounded)

```
Model proposes tool call (name, args)
        ↓
agent-loop.ts: prepareToolCall()
   ├─ tool name lookup in registry
   │    NOT FOUND → immediate error result "Tool X not found" (no execution, no hook fires)
   ↓ FOUND
   config.beforeToolCall({toolCall, args})
        → agent-session.ts wires this to ExtensionRunner.emitToolCall({type:"tool_call", toolName, toolCallId, input})
        → each registered `tool_call` handler runs in sequence
             - may mutate `event.input` in place (no re-validation after mutation)
             - may return {block:true[, terminate:true]} → SHORT-CIRCUITS, remaining handlers skipped,
               synthesized error tool-result returned, model sees the block as a tool failure
        ↓ (not blocked)
agent-loop.ts: executePreparedToolCall()
   → tool.execute(id, args, signal, onUpdate)
        - for powershell/bash: resolveSpawnContext({command, cwd, env})
             → spawnHook(baseContext) IF the tool instance was built with one
                  (only true if an extension wrapped/replaced the built-in tool;
                   the stock built-in tool has no hook wired by default)
             → spawn(shell, args/stdin, {cwd, env, ...})
        - for read/edit/write/find/grep/ls: resolvePath() with NO workspace-boundary check
   ↓
tool result (content/details/isError)
   ↓
agent-loop.ts: finalizeExecutedToolCall()
   → config.afterToolCall({toolCall, args, result, isError})
        → ExtensionRunner.emitToolResult({...}) if handlers registered
        → hookResult may rewrite content/details/usage/isError/terminate
   → emitToolExecutionEnd() (tool_execution_end event — observability only, downstream of the decision point)
   ↓
Result returned to model
```

**Exact enforcement points**:
- **Pre-execution deny/allow**: `tool_call` event handler → `block: true`. This is the only point that can prevent execution outright, for any tool.
- **Pre-spawn rewrite (powershell/bash only)**: `BashSpawnHook`/`PowerShellSpawnHook`, but only active if an extension supplies a replacement tool definition — the stock built-in `powershell`/`bash` tools ship with no hook.
- **Post-execution rewrite/suppress**: `tool_result` event handler.
- **Registry-level exclusion**: `--tools`/`--exclude-tools` remove the tool from consideration before the model ever sees it — coarsest but most reliable gate.

---

## 4. PowerShell Findings

Source: `packages/coding-agent/src/core/tools/bash.ts` (shared spawn machinery), `core/tools/powershell.ts` (config only — `PowerShellSpawnHook`/`PowerShellSpawnContext` are **type aliases of the Bash equivalents**), `utils/shell.ts` (`getPowerShellConfig()`).

- **Command input**: On Windows, `commandTransport: "stdin"` — the full command string is piped to the PowerShell process's stdin rather than passed as an argv token. This closes some argv-splitting/injection classes but not the fundamental fact that arbitrary PowerShell is executed.
- **Spawn point**: `bash.ts:84-150`, `spawn(shellConfig.shell, [...args], {cwd, env, stdio, windowsHide:true})`.
- **Command inspection opportunity**: the full, unmodified command string is available in the `tool_call` event's `input.command` **before** spawn. This is the correct and only reliable interception point for "see the whole command before it runs."
- **Environment**: full inherited `process.env` (via `getShellEnv()`) minus a short list of `PI_*` session vars, is passed to the child by default. Any secrets present in the parent process's environment reach the child unless a `spawnHook` scrubs them (as `scrub-powershell-credentials.js` already does for `pi-dev`).
- **cwd**: existence-checked (`fsAccess`) but **not confined** — any absolute path the OS allows is accepted.
- **Timeout/abort**: `resolveTimeoutMs()` (max ~24.8 days in ms) triggers `killProcessTree(pid)`; an `AbortSignal` listener does the same. Both are process-tree kills, not command-level cancellation before start.
- **Command classification (harmless, source/logic-based — no destructive commands executed)**:

| Command pattern | Pi visibility before execution | Native deny/confirm point |
|---|---|---|
| `Get-ChildItem`, read-only queries | Full string via `tool_call.input.command` | tool_call handler |
| `python -m pytest` | same | tool_call handler |
| `Remove-Item temp.txt` | same | tool_call handler (string-level only — no semantic "this deletes a file" signal from Pi) |
| `Remove-Item -Recurse temp-dir` | same | same, no distinction from a single-file delete except string content |
| `Invoke-WebRequest ...` / `curl ...` | same | same — Pi has no network-call awareness, only sees the string |
| `cmd /c ...` | same string visible, but **whatever `cmd /c` itself spawns is invisible to Pi** | none beyond the initial string |
| `powershell -Command "..."` (nested) | outer string visible; **inner command is just a substring**, not separately parsed/evaluated by Pi | none — a handler would need to parse PowerShell syntax itself to see through this, which Pi does not do |
| `Get-ChildItem Env:`, `$env:SECRET` | same string visible | tool_call handler (again, only if the handler recognizes the *pattern*, not the *outcome* — Pi does not evaluate what the command will actually do) |

**Direct answer to the framed question**: *"Pi native hook/event가 실행 전에 전체 command를 볼 수 있고 안전하게 deny/confirm할 수 있는가?"* — **Yes for "see the whole string" and "deny/allow the whole call."** **No for "understand what the command will actually do."** Pi exposes the raw command text; it performs no parsing, no AST analysis, no semantic classification of PowerShell syntax. Any extension-side policy is therefore working with an opaque string, subject to all the evasion classes named in §15 below (aliases, nested shells, encoded/`-EncodedCommand`, obfuscation). This is a structural limit, not an implementation gap.

---

## 5. Filesystem Findings

Source: `packages/coding-agent/src/core/tools/path-utils.ts`, `packages/coding-agent/src/utils/paths.ts`, and the individual tool files (`read.ts`, `edit.ts`, `write.ts`, `find.ts`, `grep.ts`, `ls.ts`).

- `resolvePath(input, baseDir, options)` (`utils/paths.ts:102-106`) normalizes the input and resolves `..`/absolute paths **without checking that the result stays under `baseDir`**.
- A helper, `getCwdRelativePath()` (`paths.ts:108-117`), *does* compute whether a resolved path is inside cwd — but it is used only for **display formatting** (relative vs. absolute path rendering), never for access control.
- **No workspace-boundary confinement exists** in `read`, `edit`, `write`, `find`, `grep`, or `ls`. Any of these tools can target an absolute path or a `../../..`-traversal path outside the working directory, limited only by OS-level file permissions of the host process.
- Symlink/junction behavior: no dedicated handling found; behavior follows whatever Node's `fs` module does by default (i.e., symlinks are followed transparently) — not a Pi-specific concern, but also not a Pi-specific protection.
- **This is the single largest concrete gap in native security posture**: reading `C:\Users\<user>\.ssh\`, `.aws\`, `.gitconfig`, or any file outside the intended workspace succeeds today with zero native resistance, confirm, or log.

---

## 6. Approval / TUI Findings

- The only user-facing "ask" primitives are `ExtensionUIContext.confirm()`, `.select()`, `.input()` (plus richer `.custom()`/`.editor()` for arbitrary UI). There is no dedicated "approval" API distinct from these — any approval flow is an extension composing `tool_call` blocking with a `confirm()` call.
- **Interactive TUI**: `setUIContext()` installs a real, rendering UI context — prompts appear on-screen, block until user input.
- **RPC mode**: `confirm`/`select` round-trip to the connected client via `createDialogPromise`; resolve to `false`/`undefined` on cancel or timeout (does not hang indefinitely if the client sets a timeout — if no timeout is set and the client never responds, this was not fully traced and should not be assumed non-blocking).
- **Headless (`-p` / `--mode json`)**: `setUIContext()` is never called, so `noOpUIContext` is used: `confirm()` → `false` immediately, `select()`/`input()` → `undefined` immediately.
  - **Answer to the framed question**:
    ```
    approval UI unavailable
            ↓
    confirm() → false   (deny-shaped)
    select()  → undefined
    input()   → undefined
    ```
    No hang, no exception, no implicit allow. This is a favorable default for fail-closed policy design, **but it is a side effect of the stub implementation, not a documented, guaranteed security contract of Pi** — it should not be relied upon without an explicit design note if headless automation is part of the enterprise threat model (see Critical Gaps).

---

## 7. Project Trust Findings

- Gates **only**: loading of `.pi/settings.json`, project-local `extensions/`, `skills/`, `prompts/`, `themes/`, `SYSTEM.md`/`APPEND_SYSTEM.md` under the project directory (or `.agents/skills`, excluding the user's own global `~/.agents/skills`).
- Does **not** gate: bash/powershell execution, read/write/edit/find/grep/ls filesystem access, globally-installed extensions (`agentDir/extensions/`), or CLI-supplied `--extension` paths.
- If none of the trust-requiring project resources exist in a project, trust is considered granted automatically (`resolveProjectTrusted` short-circuits to `true`) — there is nothing to "trust" in that case.
- Fails closed (`false`) only in the specific case: `defaultProjectTrust === "ask"` **and** no UI is available.
- **Explicit correction of a likely misconception**: "Project trusted" ⇒ "project-local config/extensions/skills are allowed to load." It does **not** imply "the agent is sandboxed" or "tool execution is constrained" in any way. These are unrelated axes.

---

## 8. Extension Security Boundary

- Extensions load via `jiti` as ordinary Node.js modules — full `fs`, `child_process`, `net`, `process.env`, and every other Node API is available, with **no sandbox, no permission manifest, no capability model, no signature/checksum verification** anywhere in the loader or runner.
- Project trust gates only project-local (`.pi/extensions`) loading — global (`agentDir/extensions`) and `--extension`-supplied paths are not gated by trust at all.
- **The two problems named in the task brief are indeed separate and both confirmed real**:
  1. *Agent Tool Security* — can the agent's own tool calls (bash, read, write, ...) be observed/blocked? **Yes**, via `tool_call`/spawn hooks (§2-§4).
  2. *Extension Supply-Chain Security* — can a malicious or unapproved extension file itself do arbitrary damage the moment it loads (before or entirely outside of any tool-call flow)? **Yes, unrestricted**, and Pi has no native mechanism to prevent, detect, or constrain this.
- **Architecture implication (confirmed, not assumed)**: `Agent Tool Security ≠ Extension Supply-Chain Security`. A perfectly-designed security extension governing tool calls does nothing to stop a *different*, unapproved extension from directly calling `child_process.exec()` or `fs.readFileSync()` on its own, bypassing the tool layer entirely.
- This pushes real requirements onto **Extension Registry/Launcher/Packaging**: approved-extensions-only distribution, version pinning, hash/signature verification, and controlling *which extension files can exist on disk in `agentDir/extensions/` at all* — none of which Pi itself can enforce, since Pi will load and run whatever `.ts`/`.js` files it finds in its discovery paths.

---

## 9. Mandatory Policy Findings

- `--no-extensions` skips loading of settings.json-registered (global/project) extensions, but **CLI-supplied `--extension` paths still load regardless** (`resource-loader.ts:452-454`).
- Practical consequence: if a company's "mandatory" security extension is registered via `settings.json`, a user with CLI access can defeat it with a bare `--no-extensions` flag. Conversely, if it's *only* ever invoked via a fixed `--extension <path>` argument baked into a launcher script the user cannot edit or bypass, `--no-extensions` does not remove it — but the user could still edit the launcher script itself, or invoke the underlying `node.exe .../cli.js` directly with different flags, if they have filesystem access to the package (as is the case with `pi-dev-user`'s self-contained folder).
- Pi has **no concept of "this extension cannot be disabled."** Nothing in the CLI, settings schema, or extension loader distinguishes a "mandatory" extension from an optional one.
- **Layer classification for "cannot be disabled by the end user"**:

  | Layer | Can it enforce "cannot be disabled"? | Why |
  |---|---|---|
  | Pi (core/CLI) | No | No mandatory-extension concept exists; `--no-extensions`/`--extension` are symmetric, user-controllable flags |
  | Launcher (`run-agent.cmd`/`run-glm.cmd`) | Partial | Can hard-code flags the *script* always passes, but cannot stop a user from calling `node.exe cli.js` directly if they have filesystem access to the bundle |
  | Packaging | Partial | Could obfuscate/relocate the raw CLI entry point, but this is security-through-inconvenience, not a real boundary, on a machine the user fully controls |
  | OS policy / Enterprise endpoint management | Yes (realistic) | File/process execution policy, application allowlisting, or running Pi only inside a managed/locked-down environment where the user cannot invoke arbitrary `node.exe` args |
  | Gateway (e.g., only the internal vLLM endpoint is reachable, and only from an approved binary/environment) | Yes (realistic, complementary) | Network-level enforcement independent of what the local process does |

  **Conclusion**: guaranteeing a security policy the end user *cannot* turn off is **not solvable inside Pi or even inside a Pi-adjacent launcher on a machine the user administers**. It requires OS-level or enterprise endpoint controls (or accepting that on an unmanaged dev machine, "mandatory" really means "default and expected," not "cryptographically enforced").

---

## 10. `--tools` Audit (dedicated)

- Enforcement point: `agent-session.ts:_refreshToolRegistry()` (~2663-2754). `isAllowedTool(name)` filters `_baseToolDefinitions` (built-in), `_extensionRunner.getAllRegisteredTools()` (extension), and SDK `customTools` **identically** before they ever enter `_toolDefinitions`/`_toolRegistry`.
- Excluded tools are not merely hidden from the model's tool list — calling a disallowed/unknown name fails at `prepareToolCall()` with `Tool X not found`, confirmed at the `agent-loop.ts` level (§1/§3). This makes `--tools` a genuine, reliable **capability-reduction boundary** — good for "this session may not use `write` at all," for instance.
- **Confirmed limitation, exactly as anticipated in the brief**: `--tools` operates at tool-name granularity only. Once `powershell` (or `bash`) is in the allowed set, **everything reachable through a shell** — arbitrary commands, nested shells, network calls, credential reads — is entirely outside `--tools`'s reach. `--tools` is a coarse allowlist of *capabilities*, not a policy engine over *content*. Treating `--tools` as a substitute for command-level policy would be a category error.
- CLI override / settings override: `--tools` is CLI-supplied at every invocation (no evidence found of a settings.json-level "locked" allowlist that CLI flags cannot widen) — meaning a launcher's `--tools` choice can be **overridden by the user simply passing a different `--tools` value themselves**, unless the launcher is the only way the user can invoke Pi (same caveat as §9).

---

## 11. Native Capability Classification

| Risk | Native mechanism | Classification |
|---|---|---|
| Dangerous PowerShell command (content-level) | `tool_call` event exposes the string; no semantic understanding | `NATIVE_OBSERVE_ONLY` (extension can add `NATIVE_CONFIRM`/`NATIVE_ENFORCE` on top, but only against opaque string heuristics — see §15) |
| Outside-workspace read/write | none | `EXTENSION_REQUIRED` (must be built via `tool_call` path inspection; Pi has zero native confinement) |
| Custom (extension) tool call | `tool_call` event, `--tools` allowlist | `NATIVE_ENFORCE` (allowlist) + `NATIVE_CONFIRM`/`NATIVE_ENFORCE` (per-call via `tool_call`) |
| Unapproved extension execution (the extension file itself) | project trust (project-local only), none for global/`--extension` | `NOT_ENFORCEABLE_AT_THIS_LAYER` for global/CLI extensions → `LAUNCHER/PACKAGING_REQUIRED` or `OS/ENTERPRISE_CONTROL_REQUIRED` |
| Mandatory (non-disable-able) security policy | none | `OS/ENTERPRISE_CONTROL_REQUIRED` |
| Tool-name capability reduction (e.g., disable `write`) | `--tools`/`--exclude-tools` | `NATIVE_ENFORCE` |
| Approval/confirmation UX | `ctx.ui.confirm/select/input` | `NATIVE_CONFIRM` (interactive/RPC) / effectively `NATIVE_ENFORCE`-as-deny (headless, by stub side effect, not contract) |
| Credential/env leakage into subprocess | `BashSpawnHook`/`PowerShellSpawnHook` | `EXTENSION_REQUIRED` (mechanism exists natively; policy/scrubbing logic must be supplied by extension) |
| Extension itself calling raw Node APIs (fs/child_process/net) | none | `NOT_ENFORCEABLE_AT_THIS_LAYER` → `LAUNCHER/PACKAGING_REQUIRED` (approved-extension distribution) |

---

## 12. Safe Runtime Tests Performed

Given the strength and specificity of the source evidence gathered (exact file/line references for every mechanism above, cross-checked against the official example extensions already used in Phase 3), no additional runtime fixture tests were judged necessary to resolve ambiguity for this audit round — every audit question above was answerable directly and unambiguously from source. No fixture directories, no PowerShell execution, and no filesystem probes outside prior, already-reviewed test artifacts were performed in this phase. If a follow-up wants empirical (not just source-level) confirmation of the headless `confirm()→false` behavior or the `resolvePath` outside-workspace read, that would be a cheap, harmless follow-up (a zero-network, fixture-only extension calling `ctx.ui.confirm()` under `-p`, and a `read` call against a fixture path outside a fixture workspace) — deliberately not run here to avoid scope creep into implementation-adjacent tooling this phase explicitly excludes.

---

## 13. Security Capability Matrix

| Capability / Risk | Pi Native | Extension Possible | Launcher/OS Needed | Recommended V1 |
|---|---|---|---|---|
| Tool allowlist | Yes (`--tools`) | N/A | No | Use as-is; bake a safe default set into launchers |
| PowerShell command inspection | Yes (string only, via `tool_call`) | Yes (build policy on top) | No | Extension: log/observe every `powershell`/`bash` call |
| PowerShell deny | No (native) | Yes (`tool_call` → `block:true`) | No | Extension, string-heuristic based; document evasion limits (§15) |
| PowerShell confirm | No (native) | Yes (`tool_call` + `ctx.ui.confirm`) | No | Extension; interactive/RPC only — define headless policy explicitly |
| Outside-workspace read | No | Yes (`tool_call` path check) | No | Extension: confirm or deny based on cwd-relative check |
| Outside-workspace write | No | Yes (same) | No | Extension: deny by default, confirm as fallback |
| File deletion | No (no delete concept in write/edit) | Only via PowerShell command inspection (string-level) | No | Same limits as PowerShell deny |
| Network access | No | Only via PowerShell command inspection (string-level); provider-traffic hooks are separate and don't cover this | No | Document as an accepted gap; not reliably solvable via string inspection |
| Credential/env access | Partial (`spawnHook` can scrub env before spawn) | Yes (spawnHook + `tool_call`) | No | Extension: scrub known secret env vars from subprocess env (already implemented for `pi-dev`) |
| Custom extension tool | Yes (`--tools`, `tool_call`) | N/A (is one) | No | Same treatment as built-in tools |
| Unapproved extension execution | No | No (an extension can't police other extensions' load) | Yes (Launcher/Packaging: approved-extension distribution, pinning, hashing) | Out of scope for Pi layer; flag for Launcher/Packaging roadmap |
| Mandatory security policy | No | No (user can always `--no-extensions`/bypass launcher if they have CLI/filesystem access) | Yes (OS/enterprise endpoint control, or accept "default," not "mandatory," on unmanaged machines) | Do not claim "mandatory" without OS-level backing |
| Headless fail-closed | Yes, as a side effect (`confirm→false`) | N/A | No | Treat as a starting point, not a guarantee — write an explicit extension-level default-deny for any headless approval path that matters |

---

## 14. Critical Gaps

1. **No native workspace confinement** for `read`/`edit`/`write`/`find`/`grep`/`ls` — the single largest concrete finding. Any absolute or traversal path succeeds today.
2. **No sandbox, signing, or permission model for extensions themselves** — an unapproved/malicious extension file has full Node.js privileges the instant it loads, entirely independent of tool-call-layer security.
3. **No native concept of "mandatory, non-disableable" policy** — `--no-extensions`/`--extension`/`--tools` are all user-symmetric flags; enforcing non-bypassability requires layers outside Pi entirely.
4. **PowerShell/bash command visibility is string-only** — Pi does no parsing/semantic analysis, so any extension-side policy inherits all classic shell-obfuscation evasion classes (aliases, nested shells, `-EncodedCommand`, indirection). This is a structural ceiling on what an extension can honestly guarantee, not a bug.
5. **Headless approval behavior (`confirm→false`) is an implementation side effect, not a documented contract** — safe to observe today, risky to silently depend on long-term without an explicit design decision that treats it as load-bearing.

---

## 15. What Pi Dev Should NOT Try To Solve (at the extension layer)

- **Command-content blacklisting as a security boundary.** Per the brief's own instruction and confirmed by source: PowerShell's alias/nesting/encoding surface makes string blacklists a Level-1 (accidental-damage) control at best, never a Level-2/3 (enterprise policy / hostile-code sandboxing) control. Do not present a blacklist-based security extension as solving more than "catch obvious mistakes."
- **Extension supply-chain trust via Pi mechanisms.** Pi has nothing here; do not attempt to bolt on ad hoc signature checking inside an extension (an extension policing other extensions is not a security boundary — a malicious extension simply doesn't cooperate).
- **"Mandatory, cannot be disabled" guarantees on a machine the end user administers.** This is an OS/enterprise-endpoint problem, not solvable by any combination of Pi flags, settings.json, or launcher scripts if the user has unrestricted filesystem/process execution rights on their own machine.
- **Reliable network-egress control from inside arbitrary PowerShell.** Only string-level heuristics are available; real enforcement belongs at the OS firewall / network-egress / gateway layer.

Security-level framing (per the brief's Level 1/2/3):

```
Level 1 — accidental damage protection      → Pi Extension: realistic, appropriate scope
Level 2 — enterprise policy enforcement      → Pi Extension + Launcher + OS/enterprise controls, jointly
Level 3 — hostile-code / supply-chain sandboxing → NOT achievable via Pi Extension at all; Launcher/Packaging (approved-extension distribution) + OS/enterprise controls only
```

---

## 16. Proposed V1 Policy Boundary (design only — not implemented this phase)

This is a candidate shape for a future Security Extension, presented for evaluation against real audit evidence above — **not implemented in this phase**:

| Action | V1 candidate | Grounded in |
|---|---|---|
| Workspace-internal read/edit/write | ALLOW | No native risk; matches normal coding-agent use |
| Outside-workspace read | CONFIRM | `tool_call` path check is native-supported; no native confinement exists otherwise |
| Outside-workspace write | CONFIRM or DENY (lean DENY given no delete/undo safety net) | Same |
| PowerShell — general | Extension observes/logs every call via `tool_call` (Level 1 baseline) | §4, §14.4 |
| PowerShell — pattern-matched destructive/network/credential-shaped commands | CONFIRM (never a false sense of DENY-as-security, given §15) | §4, §14.4, §15 |
| Credential/env passthrough to subprocess | DENY known-secret var names by default (extend `scrub-powershell-credentials.js` pattern) | §2 (`spawnHook`), already validated in `pi-dev` |
| Unapproved/unknown extension file appearing in discovery paths | Out of scope for Pi Extension; DENY at Launcher/Packaging via an approved-extension manifest, not at runtime inside Pi | §8, §14.2 |
| Headless approval path | Explicit default-deny design decision (don't rely on the stub side effect silently) | §6, §14.5 |

This table is a discussion input for a future decision, not a finalized architecture decision — no `docs/plan/decision_log.md` entry is added in this phase, per instruction (Decision Log entries are added only when an actual architecture decision is confirmed).

---

## 17. Architecture Boundary

```
Pi Native
    ↓ what we get for free
    - tool_call / tool_result event hooks (observe, block, mutate) — uniform across built-in/extension/custom tools
    - BashSpawnHook / PowerShellSpawnHook (rewrite command/cwd/env before spawn, if a tool wraps/replaces the built-in)
    - --tools / --exclude-tools capability-reduction allowlist, enforced at registry level
    - ctx.ui.confirm/select/input for interactive/RPC approval UX
    - Headless approval defaults to a deny-shaped stub (false/undefined) — favorable but undocumented as a guarantee
    - Project trust gating of project-local .pi/* resource loading

Security Extension (built on the above)
    ↓ what can safely be enforced here
    - Observability/logging of every tool call and every PowerShell/bash command string
    - Confirm/deny for outside-workspace filesystem access
    - Confirm/deny for pattern-matched risky PowerShell shapes (Level 1: accidental-damage protection)
    - Env/credential scrubbing into subprocesses via spawnHook
    - Explicit, designed-in default-deny behavior for headless approval paths

Launcher / Packaging
    ↓ what must be enforced before Pi starts
    - Which extensions exist on disk at all (approved-extension distribution, version pinning, hash/signature)
    - Default --tools / --extension flags baked into a launcher script
    - (Acknowledging: a user with direct filesystem/process access to the bundle can still bypass this layer)

Gateway / OS / Enterprise Controls
    ↓ what cannot reliably be enforced inside the agent
    - True "cannot be disabled by the end user" policy
    - Real network-egress control (vs. string-level PowerShell command heuristics)
    - Protection against a malicious extension calling raw Node APIs directly (supply-chain / Level 3 sandboxing)
    - Enforcement on a machine the end user fully administers
```

---

## 18. Verdict

**MULTI_LAYER_REQUIRED**

Pi native mechanisms are genuinely sufficient for **Level 1 (accidental-damage protection)** and a meaningful slice of **Level 2 (enterprise policy enforcement)** — specifically, tool-call interception, capability-reduction allowlisting, spawn-context rewriting, and approval UX are all real, source-confirmed, extension-buildable primitives. They are **not sufficient**, and cannot be made sufficient by any extension, for: workspace confinement (a plain native gap, extension-fixable), true mandatory/non-disableable policy, or Level 3 hostile-code/supply-chain sandboxing of extensions themselves. A production security posture requires all four layers named in §17 working together — no single layer, including a maximally well-built Security Extension, closes every gap identified in this audit.

---

## Next One Action

Design (not implement) a minimal `tool_call`-based **observability-only** extension spec — logging every tool call, PowerShell/bash command string, and outside-workspace path access with the fields listed in the original brief's §16 (timestamp, session, model/provider, tool, decision, reason, sanitized target/command, Pi version) — as the first concrete Security Extension candidate, since it requires no policy judgment calls (no ALLOW/CONFIRM/DENY decisions yet) and directly exercises the exact native mechanisms this audit confirmed are real (`tool_call`/`tool_result` events), producing real evidence before any enforcement logic is written.
