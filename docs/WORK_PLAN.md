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

Tracked root source/configuration consists of `.gitattributes`, `.gitignore`, `.env.example`, `AGENTS.md`, `README.md`, `PATCH_NOTES.md`, `package.json`, `package-lock.json`, `pi.cmd`, and `bin/`, `docs/`, `scripts/`, `pi-dev/`. Local root state consists of `.git/`, ignored `.env`, optional ignored secret files such as `.env.naver`, `node_modules/`, and `results/`. `pi-dev/` owns Pi settings, MCP configuration, agents, prompts, extensions and later harness adapters. Runtime is ignored; npm supplies executables and dependencies.

Keep the physical root intentional: tracked source/configuration, active pi-dev runtime, portable bin entrypoints, local secrets and node_modules, and generated results. Smoke output belongs under `results/smoke/run-*/`; each run preserves earlier results. Remove legacy migration directories after needed state is safely migrated and validated. Empty future-phase directories are not placeholders to create now.

Future sibling areas: `shared/{skills,tools,mcp,prompts,docs}/`, `hermes-dev/`, `claude-code-dev/`, `codex-cli-dev/`, `commander/`, `harbor/`, `benchmark/`, ignored `results/` and `worktrees/`. Empty future folders have no placeholders and need not exist yet.

Portable Agent Skills belong canonically in `shared/skills/`. Harness-specific extensions/hooks/plugins remain in their harness area. Lift reusable execution logic into `shared/tools/` or later MCP only when justified. Do not duplicate skills into four harness directories. P1 preserves the community skill-creator package unchanged; actual shared-skill migration is P2.

## Verification and portability

Use the current work order acceptance tests and [HARNESS.md](capabilities/HARNESS.md). Bootstrap restores from the lockfile and pinned Pi package sources; never auto-upgrade to latest. Doctor only inspects. Unique local state is preserved during cleanup and never copied into Git; obsolete generated caches may be removed after classification and validation. Existing sessions and helper binaries are migrated into ignored pi-dev runtime by the P0/P1 root hygiene follow-up. Newer active credentials are retained; the older auth file is preserved opaquely under ignored `pi-dev/retained-auth/p0-p1/` for a separate credential decision. A fresh clone creates fresh runtime.
