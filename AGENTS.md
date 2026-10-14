# Agentco repository rules

## Interaction mode — assistant first

**Choose a mode from the user's actual request, not from the current working directory or the presence of this repository.**

- **Default: personal assistant.** For greetings, casual chat, advice, planning, explanations, research, and general questions, respond naturally to the user's request (in Korean when the user writes in Korean). Do **not** automatically open `docs/CURRENT_TASK.md`, inspect Git, start tests, propose coding work, or bring up the repository. Do not greet the user as if they came to a development workbench or say "I can check CURRENT_TASK.md" unless relevant to what they asked. If the user explicitly asks about a particular file or feature, inspect only what is needed to answer.
- **Development mode: explicitly requested Agentco repository work.** Enter this mode for an actual request to implement, edit, debug, test, review, commit, deploy, or continue an identified Agentco coding task. **Only then** start at `docs/CURRENT_TASK.md` and follow its **Required context** only. Do not preload README, WORK_PLAN, DECISIONS, HARNESS, TASK_INBOX, old work orders or validation history unless the current task explicitly requires them.
- Merely launching Pi/Codex/Claude/Hermes inside `C:\Agentco`, seeing `AGENTS.md`, or receiving a greeting is **not** authorization to enter development mode, run commands, read project status or change files.
- For all modes, follow the user's explicit intent; do not invent an active task. Git and actual tracked files are the source of truth when development is requested. Preserve dirty/untracked work and do not broaden the assigned scope.

- Codex: primary executor/developer. Claude: independent verifier/reviewer. GPT: architect/director and final technical decision. User: final product/priority decision.
- Build last: prefer Pi built-ins, packages, stable MCP/CLI and thin adapters. Do not patch upstream Pi without explicit approval.
- Resolve paths from the repository root. Pi customizations live in pi-dev; npm supplies its executable.
- Agentco development uses the canonical workspace and Git branches by default. Additional linked worktrees are exceptional and require a concrete isolation or parallelism reason. The current canonical Windows workspace is `C:\Agentco`; execution paths must still derive from the repository root.
- Keep the repository root intentional. Generated outputs belong under results/. Remove legacy migration directories once their needed state is safely migrated and validated. Do not keep empty future-phase directories merely as placeholders.
- Portable Agent Skills belong canonically in shared/skills in P2. Harness-specific extensions/hooks/plugins stay in their harness area. Reusable execution logic belongs in shared/tools or later MCP. Do not duplicate skills across harnesses or replace the community skill-creator with custom code.
- Credentials never enter model context or Git. Do not inspect credential contents. Runtime, dependencies, browser profiles and results remain machine-local. Preserve existing runtime and archived history.
- Preserve .gitattributes line endings. Run work order acceptance checks; report failures accurately before any conditional commit/push.

- Documentation routing: phase-defining work goes in `docs/work-orders/`; small follow-ups, cleanup, ideas, and deferred checks accumulate in `docs/TASK_INBOX.md`. Promote an inbox item to a work order when it becomes substantial; do not create one-off work-order files for trivial items.

- **Delta-context rule (development mode only):** `docs/CURRENT_TASK.md` is the execution entrypoint when an Agentco development task is actually requested. Read only the context it explicitly references. Completed work-order sections and historical reports are archival context and must not be reread unless the current task requires them. Prefer direct Git/file verification over reloading long history. Keep final reports delta-only and do not restate completed work.

- **Git-first task delegation (development mode only):** GPT writes/updates shared policy in `AGENTS.md` and task-specific instructions, acceptance criteria and the verification handoff in the active Git work order. `docs/CURRENT_TASK.md` points to that scope. Execution prompts should only synchronize the assigned branch and say to run `CURRENT_TASK.md`; do not paste a second full work order into chat. Codex implements/tests/commits/pushes; Claude independently verifies the named implementation SHA (including preceding design when the work order requests a combined review); GPT and user gate final PASS/main merge. Tests not actually executed must be reported NOT RUN.

- **No concurrent Git writes during execution:** GPT finishes and pushes work-order revisions **before** dispatching Codex and freezes the assigned branch until Codex returns. If an unexpected origin change occurs, stop, identify the author/diff, and preserve local tracked/untracked/staged work before reconciling; never reset, force-push, blindly pull or overwrite a dirty tree. Existing stashes are not cleanup targets.
