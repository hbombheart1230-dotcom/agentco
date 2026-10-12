# Agentco Decision Log

Only architecture-level decisions belong here.

## D-001 — Agentco product identity
**Status:** Accepted

Agentco is a personal cowork / companion agent. Coding is one capability, not the product identity.

## D-002 — Pi relationship
**Status:** Accepted

Pi remains upstream and should be used through supported extension/package/skill mechanisms wherever possible. Agentco does not aim to become a Pi fork.

## D-003 — Build Last
**Status:** Accepted

New custom infrastructure requires evidence that available Pi-native, MCP/CLI, or mature OSS options are insufficient.

## D-004 — Existing code is not sacred
**Status:** Accepted

Previously implemented components may be replaced if external alternatives meet Agentco acceptance requirements with lower maintenance cost.

Tests, fixtures, and learned failure cases should be preserved whenever useful.

## D-005 — Worker roles
**Status:** Superseded by D-008 (2026-10-09)

Historical decision: Claude executed; Codex independently verified and challenged. GPT resolved findings and owned architecture. Current roles are defined by D-008.

## D-006 — Clean baseline on pristine Pi
**Status:** Accepted

`origin/main` is the canonical Agentco history. The retired pi-dev line is preserved only as the tag `archive/pi-dev-pre-rebootstrap` and is never merged into `main`.

The historical 2026-10-04 baseline was upstream Pi 1.0.2 (npm, exact-pinned, zero modifications) with one fixed primary model (OpenRouter `nvidia/nemotron-3-ultra-550b-a55b:free`), a Groq secondary for smoke tests only, and no custom extensions, skills, browser code, memory, or model routing. Baseline behaviour is compared before anything is added.


## D-007 — Harness composition on Pi 1.0.2
**Status:** Accepted (2026-10-07). Details and evidence: `docs/capabilities/HARNESS.md`.

The title records the historical Pi 1.0.2 composition decision. The current baseline is Pi 1.0.4 following the upgrade recorded below and D-008; the original decision remains historical evidence.

- Official first: built-in `codemode`/`mcp`/`tool-search`, official `subagent` and `plan-mode` examples loaded in place from the pinned package.
- Browser = Playwright MCP through Pi's built-in MCP (no Pi browser extension, no BrowserRuntime). LSP = `@ian-pascoe/pi-lsp`. Skill = `skill-creator`.
- Agentco owns only three small extensions derived from official examples (`permission-gate`, `protected-paths`, `git-checkpoint`), each justified by a concrete gap in the upstream example (see HARNESS.md §2). Delete them when upstream closes the gap.
- Pi is exact-pinned (1.0.2 baseline, moved to 1.0.4 on 2026-10-07 after a zero-change regression, see HARNESS.md §7); community packages are version-pinned.

## D-008 - P0/P1 workspace and governance
**Status:** Accepted (2026-10-09). Supersedes D-005.

Codex executes and develops; Claude independently verifies/reviews; GPT owns architecture and final technical decisions; the user owns final product and priority decisions. Read repository docs and the current work order before implementation; Git is the source of truth.

Pi remains exact-pinned at 1.0.4, upstream-unmodified. Its portable agent directory is `<repo>/pi-dev`, derived from the launcher location. Harness-specific assets stay there. Portable skills will have one canonical source in `shared/skills` in P2; reusable execution logic belongs in `shared/tools` or later MCP. No new harness installation or shared-skill migration in P1.

## D-009 — Canonical shared skills and native discovery
**Status:** Accepted (2026-10-12). P2.1/P2.2/P2.3 independently verified, final PASS and merged to main at `1f928974`.

Agentco-owned portable skills would have one authoring source in `shared/skills/`. Prefer native direct references for Pi and future Hermes; use minimal native link views for future Codex/Claude where appropriate, with bootstrap limited to idempotent registration. Keep user/system/community skills in their current ownership and location. Do not maintain copied harness skill bodies or assume identical permissions and invocation semantics.

P2 delivered the approved `agentco-delta-handoff` and Pi native registration. Claude's joint independent verification and evidence follow-up completed; P2 is CLOSED. Future worker-harness adapter activation requires separate P3 approval. Evidence, alternatives, unknowns and rollback: [P2_SHARED_SKILLS.md](work-orders/P2_SHARED_SKILLS.md).

## Other pending decisions

The following remain intentionally undecided:

- desktop/computer-use implementation
- memory implementation
- scheduler/background runtime
- control UI
- long-running task runtime

Decided by D-007: browser, subagent, LSP, MCP, tool orchestration.


## D-010 — P3 worker harnesses and native-first execution environment
**Status:** PROPOSED (2026-10-12), awaiting user scope approval.

P3 proposes three independent worker CLIs (Codex CLI, Claude Code, Hermes) alongside the unchanged upstream Pi 1.0.4 baseline. Prefer existing installations and official **Windows-native** methods first, scoped repository discovery, one Git-managed shared-skill source, per-worker opt-in setup, strict permission/credential/cost gates and no auto-started autonomous services. Hermes writable `external_dirs` cannot be treated as read-only without a proved technical barrier. P3 confirms execution readiness only; P4 Harbor determines relative harness capability and roles. No P3.2 preflight or P3.3 installation is authorized by this proposal.

Evidence, staged acceptance and rollback: [P3_WORKER_HARNESSES.md](work-orders/P3_WORKER_HARNESSES.md).
