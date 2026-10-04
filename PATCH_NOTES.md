# Agentco Patch Notes

This file records user-visible and architecture-significant changes to Agentco.

## Unreleased

### Project direction
- Defined Agentco as a personal cowork / companion agent, not a coding-agent fork.
- Adopted **Build Last**: prefer Pi built-ins, packages/extensions/skills, MCP/CLI, and mature OSS before custom development.
- Pi remains an upstream dependency; core modification is discouraged by default.
- Existing custom implementations are now subject to KEEP / REPLACE / REMOVE / DEFER review rather than being automatically carried forward.

### Process
- Established GPT / Claude / Codex division of responsibilities.
- Claude is the primary executor.
- Codex is the independent reviewer/verifier.
- GPT owns architecture and final technical decisions.
- Started Phase 0 workspace and capability audit before further feature development.

### GitHub
- Initialized the Agentco repository documentation.
- Added Phase 0 audit work orders for Claude and Codex.
