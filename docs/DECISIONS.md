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
**Status:** Accepted

Claude executes. Codex independently verifies and challenges. GPT resolves findings and owns architecture.

## D-006 — Clean baseline on pristine Pi
**Status:** Accepted

`origin/main` is the canonical Agentco history. The retired pi-dev line is preserved only as the tag `archive/pi-dev-pre-rebootstrap` and is never merged into `main`.

The baseline is upstream Pi 1.0.2 (npm, exact-pinned, zero modifications) with one fixed primary model (OpenRouter `nvidia/nemotron-3-ultra-550b-a55b:free`), a Groq secondary for smoke tests only, and no custom extensions, skills, browser code, memory, or model routing. Baseline behaviour is compared before anything is added.


## D-007 — Harness composition on Pi 1.0.2
**Status:** Accepted (2026-10-07). Details and evidence: `docs/capabilities/HARNESS.md`.

- Official first: built-in `codemode`/`mcp`/`tool-search`, official `subagent` and `plan-mode` examples loaded in place from the pinned package.
- Browser = Playwright MCP through Pi's built-in MCP (no Pi browser extension, no BrowserRuntime). LSP = `@ian-pascoe/pi-lsp`. Skill = `skill-creator`.
- Agentco owns only three small extensions derived from official examples (`permission-gate`, `protected-paths`, `git-checkpoint`), each justified by a concrete gap in the upstream example (see HARNESS.md §2). Delete them when upstream closes the gap.
- Pi stays on 1.0.2; community packages are version-pinned.

## Pending decisions

The following remain intentionally undecided:

- desktop/computer-use implementation
- memory implementation
- scheduler/background runtime
- control UI
- long-running task runtime

Decided by D-007: browser, subagent, LSP, MCP, tool orchestration.
