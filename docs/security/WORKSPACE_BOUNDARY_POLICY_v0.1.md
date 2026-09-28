# Workspace Boundary Policy v0.1 (Phase 4B — Design Only)

**Phase**: Pi Dev Architecture v0.4 — Phase 4B
**Status**: Design complete. **Not implemented.** No `block: true`, no `ctx.ui.confirm`, no path enforcement of any kind exists yet.
**Depends on**: [SECURITY_NATIVE_AUDIT_v0.1.md](SECURITY_NATIVE_AUDIT_v0.1.md) (Phase 4, mechanism confirmation) and [SECURITY_OBSERVABILITY_v0.1.md](SECURITY_OBSERVABILITY_v0.1.md) (Phase 4A, `SecurityObservation`/`workspaceRelation` pipeline, PASS).

**Question this phase answers**:
> Pi Dev V1에서 어떤 filesystem tool access를 자동 허용하고, 어떤 access를 사용자 승인 대상으로 하며, 어떤 access를 무조건 거부할 것인가?

Answer is the Final V1 Policy Matrix (§14) below. It is a design decision ready for review, not yet an implementation.

---

## 1. Scope

In scope: `read`, `edit`, `write`, `ls`, `find`, `grep` — the six built-in filesystem/search tools already classified by Phase 4A's observer.
Out of scope (deliberately, per instruction): `powershell`, `bash`, extension custom tools, network, credentials, process execution. PowerShell command-level policy is Phase 4C.

## 2. Workspace Definition

**Workspace root = the session's fixed `cwd` at launch, not a dynamically-tracked "current directory."**

Source-grounded, not assumed: `AgentSession._cwd` (`packages/coding-agent/src/core/agent-session.ts:356,391`) is assigned exactly once, from `config.cwd`, in the constructor — grepped for every `this._cwd =` assignment in the file and found only that single line. It is never reassigned during a session. This same `_cwd` is what's threaded into `ExtensionContext.cwd` (`core/extensions/types.ts:317`) that Phase 4A's observer already reads.

This directly answers the brief's stated preference: **`PowerShell`'s `Set-Location` cannot change the filesystem-policy root**, because `Set-Location` runs *inside a spawned child shell process* (each `powershell` tool call spawns a fresh process per Phase 4 audit §4), which has no path back into Pi's own Node process state — it cannot mutate `AgentSession._cwd`. Phase 4A's use of `ctx.cwd` already matches the "launch/session workspace root" model the brief prefers; no change is needed for Phase 4B to build on it.

## 3. Enforcement Point

Reusing the exact lifecycle confirmed in Phase 4 (`packages/agent/src/agent-loop.ts:607-675`, wired via `agent-session.ts:479-529`):

```
tool_call event fires (before execute())
   ↓
normalize (Phase 4A logic: classify tool, resolve workspaceRelation)
   ↓
policy lookup (Final V1 Matrix, §14) → SecurityDecision {action, reason, ruleId}
   ↓
action === "confirm"?
   → await ctx.ui.confirm(...) BEFORE deciding block  [see §5/§6]
   ↓
action resolves to "allow" or "deny"
   → "deny": return { block: true, reason: decision.reason }
   → "allow": return undefined (no return value)
   ↓
tool.execute() runs only if not blocked
```

Direct, source-grounded answers to the brief's enforcement questions:

- **Can the `tool_call` handler return `block: true`?** Yes — confirmed type (`ToolCallEventResult.block`, `types.ts:1125-1128`) and confirmed effect: `agent-loop.ts:643-653` turns a `{block:true}` result into an immediate `createErrorToolResult(beforeResult.reason || "Tool execution was blocked")` with `isError: true`, and **`tool.execute()` is never called**.
- **How is a blocked result surfaced to the model?** The exact string in `SecurityDecision.reason` becomes the tool's error-result text the model sees (confirmed at `agent-loop.ts:644`). This is a real, usable UX channel — the model can read *why* it was blocked and adapt (e.g., ask the user, or try a different path) rather than just seeing an opaque failure.
- **Can input be left untouched?** Yes — returning `undefined`/no mutation of `event.input` leaves the call exactly as the model issued it (this is what Phase 4A's observer already does for every call).
- **Can confirm be invoked before blocking?** Yes — `agent-session.ts`'s `beforeToolCall` wiring is `async` and is `await`-ed (`return await runner.emitToolCall(...)`, confirmed Phase 4 §1), and `ExtensionRunner.emitToolCall` itself `await`s each handler in sequence (`runner.ts:990-991`). A handler is free to `await ctx.ui.confirm(...)` internally and then return `{block: !approved}` based on the result.
- **What happens if confirm UI is unavailable?** See §6 — this must be handled explicitly by policy logic, not left to Pi's stub behavior.

## 4. Proposed Decision Model

```ts
type SecurityDecision = {
  action: "allow" | "confirm" | "deny";
  reason: string;   // becomes the model-visible block reason when action resolves to deny
  ruleId: string;
};
```

Not frozen — same status as Phase 4A's `SecurityObservation` (a design candidate the eventual Phase 4B implementation may adjust). Rule IDs, one per matrix cell that isn't a no-op:

```
FS_INSIDE_READ        FS_OUTSIDE_READ        FS_UNKNOWN_READ
FS_INSIDE_SEARCH       FS_OUTSIDE_SEARCH      FS_UNKNOWN_SEARCH
FS_INSIDE_MUTATION    FS_OUTSIDE_MUTATION    FS_UNKNOWN_MUTATION
```
(`SEARCH` covers `ls`/`find`/`grep` as one rule family since §8 concludes they share a risk profile with `read` — see below.)

## 5. Approval UX

`ctx.ui.confirm(title, message, opts?) -> Promise<boolean>` (`types.ts:138`, confirmed signature) is the only primitive needed — no new API.

Proposed call shape for an outside-workspace read/search CONFIRM:

```ts
const approved = await ctx.ui.confirm(
  "Filesystem access outside workspace",
  [
    `Tool: ${toolName}`,
    `Target: ${resolvedPath}`,
    `Workspace: ${workspaceRoot}`,
    "Allow this one access?",
  ].join("\n"),
);
```

Only `toolName`, the resolved path, and the workspace root ever appear — never file content, never environment values, never anything from `tool_result`. This mirrors Phase 4A's existing redaction discipline exactly (same rule: never read `content`/`details` from any event for display purposes).

## 6. Headless Fail-Closed Behavior

This is the most important correction the brief demands relative to Phase 4's finding, and the design commits to it explicitly:

**Do not rely on `noOpUIContext.confirm() → false` as the fail-closed mechanism.** That behavior is real (Phase 4 §6) but is an implementation side effect of a stub, not a documented contract — Pi's maintainers could change it without notice, and depending on it silently would be exactly the kind of unverified assumption this whole audit process has been built to avoid.

Instead, the policy logic itself must check `ExtensionContext.hasUI` (`types.ts:314-315`, confirmed field: *"Whether dialog-capable UI is available (true in TUI and RPC modes)"*) **before** calling `confirm()` at all:

```ts
if (decision.action === "confirm") {
  if (!ctx.hasUI) {
    return { block: true, reason: `${decision.reason} (approval required, no interactive UI available)` };
  }
  const approved = await ctx.ui.confirm(...);
  if (!approved) {
    return { block: true, reason: `${decision.reason} (user declined)` };
  }
  // approved: fall through to allow (return undefined)
}
```

This makes `CONFIRM_REQUIRED + no UI = DENY` an **explicit branch in Pi Dev's own code**, not an accident of Pi's stub. It happens to produce the same headless result Phase 4 observed (`false`-shaped), but now for a reason Pi Dev controls and can defend, and one that survives even if Pi's internal `noOpUIContext` implementation ever changes.

## 7. Windows Path Edge Cases (empirically verified, not assumed)

Reused Phase 4A's exact classification logic (`path.resolve`/`path.relative`/`path.isAbsolute`) and ran it directly against every edge case named in the brief, on this Windows/Node runtime:

| Case | Root | Target | Result |
|---|---|---|---|
| Workspace root itself | `C:\repo` | `.` | `inside` |
| Relative path | `C:\repo` | `src\a.py` | `inside` |
| `..` traversal | `C:\repo` | `..\outside\x.txt` | `outside` |
| Sibling directory (same-prefix name) | `C:\repo` | `..\repo-sibling\x.txt` | `outside` (confirms this is NOT a naive `startsWith` check — a real prefix-string bug would have misclassified this) |
| Same-prefix sibling, absolute | `C:\repo` | `C:\repo2\x.txt` | `outside` |
| Different drive, same subpath | `C:\repo` | `D:\repo\x.txt` | `outside` |
| **Case difference** (`C:\REPO` vs `C:\repo`) | `C:\repo` | `C:\REPO\src\a.py` | `inside` |
| Mixed separators (`/` vs `\`) | `C:\repo` | `C:/repo/src/a.py` | `inside` |
| UNC path | `C:\repo` | `\\server\share\file.txt` | `outside` |
| Non-existent target, nested under root | `C:\repo` | `C:\repo\does-not-exist\deeply\nested.txt` | `inside` |
| Non-existent target, outside root | `C:\repo` | `..\does-not-exist-outside.txt` | `outside` |
| Segment-level case difference | `C:\repo\SRC` | `..\src\a.py` (resolves back into the same dir, different case) | `inside` |

**Notable, empirically-confirmed finding**: Node's `path` module on Windows performs **case-insensitive** comparison when computing `path.relative()` — both at the drive-letter and at the path-segment level. This means case differences do **not** create a bypass risk or a false-"outside" misclassification at this layer; the concern the brief raised is real to check but turns out to already be handled correctly by Node's own Windows path semantics, not something Pi Dev's logic needs to add.

**Non-existent targets are classified correctly** by construction — `resolveWorkspaceRelation()` is purely lexical (string path math), so it never needs the target to actually exist. This directly answers §10: `write` creating a new file, or `edit`/`read` targeting a path that doesn't exist yet, resolve and classify exactly like an existing path would, based on the resolved parent chain.

**Symlink/junction risk (Phase 4A limitation carried forward)**: because classification is purely lexical, a symlink or junction *inside* the workspace that points to a target *outside* it would be classified `inside` (the symlink's own lexical path is under the workspace root) even though the real target is not. **This is a genuine, currently-unmitigated risk for Phase 4B V1**: a `write`/`edit` through such a symlink would be `ALLOW`ed by lexical path even though it mutates something outside the intended boundary. This is explicitly *not* fixed in this phase (no `fs.realpath` resolver is implemented here, per instruction) — it is carried into §17 Known Limitations as a documented, open gap, not a silent one.

## 8. Search Tool Semantics

`ls`/`find`/`grep` are read-only enumeration, not mutation — same fundamental risk class as `read` (information disclosure, not destructive/irreversible action). Recommendation: **treat them identically to `read`** for V1 (`inside → ALLOW`, `outside/unknown → CONFIRM`), not a separate, stricter tier.

Rationale against giving them a harsher tier: `find`/`grep` already have native result caps (`limit`, default 1000/100 respectively, per Phase 4A's confirmed schema) bounding how much a single outside-workspace call can enumerate; nothing about "broad enumeration" changes the fundamental read-vs-mutate distinction the whole matrix is organized around. Splitting search into its own, more restrictive tier than `read` would add a second axis of complexity (MINIMAL-PROMPTS, STRUCTURED-PATH-FIRST) without a concretely different risk to justify it.

Per confirmed schema (Phase 4A/4B source check): `ls`, `find`, `grep` all have **optional** `path` (default: current directory per each tool's own description). When `path` is omitted, Phase 4A's normalizer already substitutes `ctx.cwd` (the workspace root itself) — which resolves to `inside` unambiguously. So "path omitted" is not a special case needing its own rule; it flows through the same `FS_INSIDE_SEARCH` rule naturally.

`unknown` for search tools: same treatment as `read` — never `ALLOW` (§ below), resolves via the same `CONFIRM`-then-fail-closed-to-`DENY` path as `outside`.

## 9. Mutation Boundary

Recommendation: **keep the proposed baseline — `outside → DENY`, `unknown → DENY`, no CONFIRM tier for mutation in V1.**

Why DENY instead of CONFIRM for mutation, specifically (the brief asks this directly): mutation is irreversible within Pi's own tooling — `write` overwrites unconditionally, `edit` has no undo. Compounding an irreversible action with an interactive approval prompt doesn't actually reduce the risk much (a user under "just confirm it" fatigue during a long coding session is a realistic failure mode — this is exactly what MINIMAL-PROMPTS and FAIL-CLOSED-FOR-MUTATION are warning against), while it *does* add UX friction and a second interactive-UI dependency. A flat `DENY` is simpler, more predictable, and strictly safer, at the cost of not supporting the brief's own example ("repo 밖 C:\temp\foo.txt 수정해줘"). That cost is judged acceptable for a V1 coding-harness default: a request like that is rare relative to normal in-workspace editing, and a user who hits it gets a clear, actionable model-visible reason (§3) rather than a silent failure — they can rerun outside the harness, or a future explicit escape hatch (not designed here, out of scope for V1 per instruction) can be added later if this turns out to be a frequent, legitimate need.

## 10. Directories and New Files

Covered concretely by the lexical, existence-independent classification (§7): `write` creating a brand-new file inside the workspace is `inside` → `ALLOW`; the same new-file write with a path resolving outside the workspace is `outside` → `DENY`, identically to an existing-file case. No special-casing needed for "new file" vs. "existing file" — the policy operates purely on the resolved path's position relative to the workspace root, not on filesystem state.

## 11. Workspace Root Source (restated precisely)

Confirmed in §2: `ctx.cwd` = `AgentSession._cwd` = the value passed once at session construction (`config.cwd`), fixed for the life of the session, immune to anything a spawned `powershell`/`bash` child process does to its own working directory. Phase 4B's policy should read `ctx.cwd` exactly as Phase 4A's observer already does — no new plumbing needed, and no risk of the boundary silently shifting mid-session.

## 12. Bypass Analysis

**Explicitly acknowledged, not hidden**: Phase 4B enforcement applies only to the six built-in filesystem/search tools. It does **not** close the equivalent capability reachable through `powershell`/`bash`:

```
read/write/edit blocked by Phase 4B policy
        but
Get-Content C:\outside\x     (equivalent to read, outside workspace)
Set-Content C:\outside\x     (equivalent to write, outside workspace)
Remove-Item C:\outside\x     (no filesystem-tool equivalent to even compare against)
```

**Phase 4B is `filesystem built-in boundary enforcement`, not `complete host filesystem sandbox`.** This distinction, already flagged as a structural finding in Phase 4 (`SECURITY_NATIVE_AUDIT_v0.1.md` §4/§15 — PowerShell command visibility is string-only, no semantic understanding), is restated here because Phase 4B's own scope (§1) explicitly excludes PowerShell. PowerShell-level policy is deferred to Phase 4C and, per the Phase 4 audit's own conclusion, can never reach the same structural guarantee a native path-based check gets for the six filesystem tools — command-string heuristics are a fundamentally weaker mechanism (§15 of the Phase 4 audit, unchanged by this document).

## 13. Extension Risk (unchanged)

Restating the Phase 4 finding without modification: the Security Observer/Policy extension is itself unrestricted Node code, like any Pi extension. Phase 4B enforces boundaries on **agent-generated filesystem tool calls** — it does nothing to stop a *different*, unapproved extension from calling `fs`/`child_process` directly, bypassing the tool layer entirely. That remains a Launcher/Packaging-layer problem (approved-extension distribution, pinning, signing), explicitly out of scope for both Phase 4A and 4B.

## 14. Final V1 Policy Matrix

| Tool | Inside | Outside | Unknown | Rationale (one line) |
|---|---|---|---|---|
| `read` | ALLOW | CONFIRM | CONFIRM | Read-only, reversible-by-nature (no state change); outside/unknown still gets a human in the loop before potentially-sensitive content leaves the workspace boundary into model context |
| `ls` | ALLOW | CONFIRM | CONFIRM | Same risk class as `read` (§8) — enumeration only, no content exposure by itself, but treated identically for simplicity (one fewer axis of policy) |
| `find` | ALLOW | CONFIRM | CONFIRM | Same as `ls`; native `limit` param already bounds enumeration breadth |
| `grep` | ALLOW | CONFIRM | CONFIRM | Same as `ls`/`find`; native `limit` param already bounds match breadth |
| `edit` | ALLOW | DENY | DENY | Irreversible mutation; FAIL-CLOSED-FOR-MUTATION — no CONFIRM tier for mutation in V1 (§9) |
| `write` | ALLOW | DENY | DENY | Same as `edit`; applies identically to both new-file and existing-file targets (§10) |

`unknown` is expected to be rare (only reachable via malformed/empty path input or a resolution exception, per Phase 4A's normalizer) — it is deliberately given the **same** decision as `outside` in every row, never a separate or more permissive one, so "we couldn't prove it's safe" never defaults toward `ALLOW`.

## 15. UX Frequency

V1 recommendation: **per-call only** — no caching, no per-path/per-directory/per-session scoping. Every outside-workspace `read`/`ls`/`find`/`grep` call prompts independently.

This is deliberately the simplest option, evaluated against the alternatives:
- *Per-path one-time* / *per-directory one-time* / *per-session scope* would all reduce prompt frequency, which matters for usability in a long session that legitimately touches a handful of outside paths repeatedly — but each introduces a state-management concern (what counts as "the same path"? case/separator normalization again; does approval survive a `/tree` navigation or session resume?) that is real design work, not yet done, and explicitly listed by the brief as **not to be implemented this phase** ("이번 단계에서 approval caching 구현은 하지 않는다").
- Starting with per-call-only keeps Phase 4B's actual implementation (when it happens) minimal and matches MINIMAL-CUSTOMIZATION/MINIMAL-PROMPTS as *starting points* — if per-call turns out to be too noisy in practice, a caching layer is a well-scoped, additive follow-up (a natural Phase 4B.1), not a redesign.

## 16. Audit Observation Integration

**Recommendation: a separate extension file, not a merge into `pi-dev-security-observer.ts`.**

Reasoning:
1. **Multiple extensions can each register independent `tool_call` handlers, and Pi runs them in a defined order** — confirmed directly in source: `ExtensionRunner.emitToolCall()` (`runner.ts:982-1003`) iterates `this.extensions` (load order) and, within each, its handlers in registration order; the first handler across all extensions to return `block: true` short-circuits **all later handlers for that call, in any extension**. This means the observer and a future policy extension compose cleanly as two independent files — no shared code or direct coordination is required for them to both see every call, *provided load order is respected* (next point).
2. **Load-order consequence, found while designing this, not assumed**: if a policy extension that can `block: true` is loaded/ordered *before* the observer, a `DENY`ed attempt would never reach the observer's `tool_call` handler at all — the attempt would be invisible to `/security-observations`, silently defeating the audit trail for exactly the calls most worth auditing. **The observer extension must be loaded before the policy extension** (e.g., `--extension pi-dev-security-observer.ts --extension pi-dev-workspace-policy.ts`, in that order) for Phase 4B to preserve Phase 4A's guarantee that every attempt is observed, blocked or not. This ordering requirement is a concrete, load-order-sensitive constraint that the eventual implementation must enforce (launcher flag order) and empirically verify — flagged here as a design requirement, not yet tested since no policy extension exists yet.
3. **Keeping Phase 4A's already-`PASS`ed, verified observer file completely untouched** avoids any regression risk to a working component — matches MINIMAL-CUSTOMIZATION (change surface area only where the new capability actually requires it) more directly than editing a proven file to grow a second responsibility into it.
4. A small amount of logic duplication (the `classifyTool`/`resolveWorkspaceRelation` helpers, ~15-20 lines) between two single-purpose, self-sufficient extension files is preferred over introducing a shared local module imported by both — consistent with the pattern already used successfully for `pi-dev-info.ts` and `pi-dev-security-observer.ts` (both deliberately self-sufficient, no cross-file imports, which sidesteps any packaging/import-resolution question in the self-contained USER bundle entirely).

Naming candidate for the future implementation: `pi-dev-workspace-policy.ts`, following the established `pi-dev-<purpose>` convention (`pi-dev-info`, `pi-dev-security-observer`).

## 17. Known Limitations

- **Symlink/junction bypass (new, concrete instance of the Phase 4A limitation)**: a symlink/junction lexically inside the workspace pointing to a real target outside it is classified `inside` and would be `ALLOW`ed — not fixed in V1 (§7).
- **No PowerShell-level equivalent** (§12) — `powershell`/`bash` remain a full bypass path for everything Phase 4B would otherwise restrict; deferred to Phase 4C.
- **`unknown` is a defensive fallback, not a well-tested state** — reachable only via malformed/empty input or a resolution exception in the current normalizer; its `DENY`/`CONFIRM` treatment is a conservative default, not empirically exercised the way `inside`/`outside` were in Phase 4A's runtime tests.
- **No approval caching** (§15) — every outside-workspace read/search call prompts independently; this is a known, accepted V1 UX cost, not an oversight.
- **Load-order dependency between observer and policy extensions** (§16) is a real operational constraint on whatever loads them (launcher `--extension` flag order) — not yet implemented or empirically verified, since the policy extension doesn't exist yet.
- **Extension supply-chain risk unchanged** (§13) — Phase 4B does nothing about a different, unapproved extension bypassing the tool layer entirely.
- **No implementation exists yet** — every mechanism described here (block, confirm, hasUI check, decision matrix) is a design grounded in confirmed source behavior, not yet written or runtime-tested as a unit. Phase 4A's own runtime tests validated the *normalization* half of this pipeline (workspace-relation classification); the *enforcement* half (block/confirm/decision) has zero runtime evidence yet — it is source-grounded, not runtime-verified, pending actual implementation.

## Phase 4B Design Verdict

**READY_TO_IMPLEMENT**

The Final V1 Policy Matrix (§14) is complete and directly answers the phase's core question. Every mechanism the implementation would need (block, confirm, `hasUI`, decision reason surfacing to the model, workspace-root stability) is confirmed from source, not assumed. The one substantive open risk (symlink/junction bypass) is explicitly named as an accepted, documented V1 gap rather than a blocker — consistent with how Phase 4A treated the same limitation. The one real implementation-order dependency (observer before policy, §16) is flagged precisely enough to be handled correctly when Phase 4B is actually built.

## Next One Action

Implement `pi-dev-workspace-policy.ts` (single-file, self-sufficient, following the `pi-dev-security-observer.ts` pattern) exactly per the Final V1 Policy Matrix (§14) and the explicit `hasUI`-checked fail-closed confirm logic (§6) — as its own Phase 4B implementation step, loaded after the observer extension (§16 ordering requirement) — then re-run Phase 4A's Test Matrix A–F plus new cases specifically exercising CONFIRM (approved and declined) and headless-DENY, to get the runtime evidence this design currently lacks before calling Phase 4B itself PASS.
