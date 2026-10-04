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

## Pending decisions

The following remain intentionally undecided until Phase 0 reports are complete:

- browser implementation
- desktop/computer-use implementation
- memory implementation
- scheduler/background runtime
- subagent implementation
- control UI
- long-running task runtime
