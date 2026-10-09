# Agentco worker roles

- **Codex — primary executor/developer:** inspect actual Git/files, read docs/current work order first, implement scoped changes, validate regressions, update documentation and report evidence/blockers.
- **Claude — independent verifier/reviewer:** review Codex's exact branch/commit, independently check assumptions and acceptance evidence, challenge unnecessary custom code, and report classified findings. Implement only when explicitly assigned.
- **GPT — architect/director:** define architecture, milestones and acceptance criteria, resolve disagreements and make final technical decisions.
- **User — product owner:** final product and priority decisions.

Default flow: GPT/user work order → Codex implementation → Claude independent review → GPT technical decision / user priority decision.

Git is the source of truth. Preserve user changes and validated assets. Build last: Pi built-in → package/extension/skill → stable MCP/CLI → mature OSS → thin adapter → justified custom implementation. Upstream Pi patches require explicit approval; Pi is an npm dependency, not a vendored tree.
