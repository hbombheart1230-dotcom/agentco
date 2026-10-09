# Agentco repository rules

Read README.md, docs/WORK_PLAN.md, docs/DECISIONS.md, docs/WORKER_ROLES.md, docs/capabilities/HARNESS.md, docs/TASK_INBOX.md and the current docs/work-orders work order before implementation. Git and actual tracked files are the source of truth. Preserve dirty/untracked user work; do not broaden the assigned scope.

- Codex: primary executor/developer. Claude: independent verifier/reviewer. GPT: architect/director and final technical decision. User: final product/priority decision.
- Build last: prefer Pi built-ins, packages, stable MCP/CLI and thin adapters. Do not patch upstream Pi without explicit approval.
- Resolve paths from the repository root. Pi customizations live in pi-dev; npm supplies its executable.
- Portable Agent Skills belong canonically in shared/skills in P2. Harness-specific extensions/hooks/plugins stay in their harness area. Reusable execution logic belongs in shared/tools or later MCP. Do not duplicate skills across harnesses or replace the community skill-creator with custom code.
- Credentials never enter model context or Git. Do not inspect credential contents. Runtime, dependencies, browser profiles and results remain machine-local. Preserve existing runtime and archived history.
- Preserve .gitattributes line endings. Run work order acceptance checks; report failures accurately before any conditional commit/push.

- Documentation routing: phase-defining work goes in `docs/work-orders/`; small follow-ups, cleanup, ideas, and deferred checks accumulate in `docs/TASK_INBOX.md`. Promote an inbox item to a work order when it becomes substantial; do not create one-off work-order files for trivial items.
