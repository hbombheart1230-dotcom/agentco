# Agentco current work plan

Current baseline: upstream Pi 1.0.4, exact-pinned. This plan supersedes the early capability-audit roadmap; historical survey/trial proposals remain dated evidence, not current installation instructions.

| Phase | Scope |
|---|---|
| P0/P1 | Audit, docs-first role governance, portable pi-dev workspace, bootstrap/doctor and regression verification |
| P2 | Shared Agent Skills with one canonical source in shared/skills |
| P3 | Install/evaluate Hermes, Claude Code and Codex CLI after a new work order |
| P4 | Harbor benchmark and reproducible evaluation evidence |
| P5 | Pi Commander MVP using supported Pi control surfaces |
| P6 | Benchmark-informed model/harness routing |
| P7 | Multi-harness workflows with explicit ownership and handoffs |
| P8 | Fresh-machine portability across PCs/drives and Linux/cloud |

## Intended layout

The root contains Git, local ignored .env, .env.example, AGENTS.md, README.md, npm manifests, scripts and docs. `pi-dev/` owns Pi settings, MCP configuration, agents, prompts, extensions and later harness adapters. Runtime is ignored; npm supplies executables and dependencies.

Future sibling areas: `shared/{skills,tools,mcp,prompts,docs}/`, `hermes-dev/`, `claude-code-dev/`, `codex-cli-dev/`, `commander/`, `harbor/`, `benchmark/`, ignored `results/` and `worktrees/`. Empty future folders have no placeholders and need not exist yet.

Portable Agent Skills belong canonically in `shared/skills/`. Harness-specific extensions/hooks/plugins remain in their harness area. Lift reusable execution logic into `shared/tools/` or later MCP only when justified. Do not duplicate skills into four harness directories. P1 preserves the community skill-creator package unchanged; actual shared-skill migration is P2.

## Verification and portability

Use the current work order acceptance tests and [HARNESS.md](capabilities/HARNESS.md). Bootstrap restores from the lockfile and pinned Pi package sources; never auto-upgrade to latest. Doctor only inspects. Original machine-local runtime and credentials are retained during directory migration, never removed or copied into Git. A fresh clone creates fresh runtime; continuation from old sessions requires a separately chosen local migration.
