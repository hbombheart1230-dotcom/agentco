# Agentco repository rules

Start at `docs/CURRENT_TASK.md` and follow its **Required context** only. Do not preload README, WORK_PLAN, DECISIONS, HARNESS, TASK_INBOX, old work orders or validation history unless the current task explicitly requires them. Git and actual tracked files are the source of truth. Preserve dirty/untracked user work; do not broaden the assigned scope.

- Codex: primary executor/developer. Claude: independent verifier/reviewer. GPT: architect/director and final technical decision. User: final product/priority decision.
- Build last: prefer Pi built-ins, packages, stable MCP/CLI and thin adapters. Do not patch upstream Pi without explicit approval.
- Resolve paths from the repository root. Pi customizations live in pi-dev; npm supplies its executable.
- Agentco development uses the canonical workspace and Git branches by default. Additional linked worktrees are exceptional and require a concrete isolation or parallelism reason. The current canonical Windows workspace is `C:\Agentco`; execution paths must still derive from the repository root.
- Keep the repository root intentional. Generated outputs belong under results/. Remove legacy migration directories once their needed state is safely migrated and validated. Do not keep empty future-phase directories merely as placeholders.
- Portable Agent Skills belong canonically in shared/skills in P2. Harness-specific extensions/hooks/plugins stay in their harness area. Reusable execution logic belongs in shared/tools or later MCP. Do not duplicate skills across harnesses or replace the community skill-creator with custom code.
- Credentials never enter model context or Git. Do not inspect credential contents. Runtime, dependencies, browser profiles and results remain machine-local. Preserve existing runtime and archived history.
- Preserve .gitattributes line endings. Run work order acceptance checks; report failures accurately before any conditional commit/push.

- Documentation routing: phase-defining work goes in `docs/work-orders/`; small follow-ups, cleanup, ideas, and deferred checks accumulate in `docs/TASK_INBOX.md`. Promote an inbox item to a work order when it becomes substantial; do not create one-off work-order files for trivial items.

- **Delta-context rule:** `docs/CURRENT_TASK.md` is the default execution entrypoint. Read only the context it explicitly references. Completed work-order sections and historical reports are archival context and must not be reread unless the current task requires them. Prefer direct Git/file verification over reloading long history. Keep final reports delta-only and do not restate completed work.

- **Git-first task delegation:** GPT writes/updates shared policy in `AGENTS.md` and task-specific instructions, acceptance criteria and the verification handoff in the active Git work order. `docs/CURRENT_TASK.md` points to that scope. Execution prompts should only synchronize the assigned branch and say to run `CURRENT_TASK.md`; do not paste a second full work order into chat. Codex implements/tests/commits/pushes; Claude independently verifies the named implementation SHA (including preceding design when the work order requests a combined review); GPT and user gate final PASS/main merge. Tests not actually executed must be reported NOT RUN.

- **Batch-first execution (user preference):** Group related native installation/configuration, common Skill wiring, synthetic functional tests and results into one sizable work order and one end-of-batch independent review. Do not create micro-phases for every preflight, failure or version check. Reuse verified results, use a one-line BLOCKED reason and move to other independent tasks. Escalate only actual secret exposure, uncontrolled paid/provider fallback, unauthorized writes or destructive environment changes. Keep evidence truthful and do not equate installed/text PASS with Worker/tool readiness.

- **No concurrent Git writes during execution:** GPT finishes and pushes work-order revisions **before** dispatching Codex and freezes the assigned branch until Codex returns. If an unexpected origin change occurs, stop, identify the author/diff, and preserve local tracked/untracked/staged work before reconciling; never reset, force-push, blindly pull or overwrite a dirty tree. Existing stashes are not cleanup targets.
