# Agentco current work plan

Current baseline: upstream Pi 1.0.4, exact-pinned. This plan supersedes the early capability-audit roadmap; historical survey/trial proposals remain dated evidence, not current installation instructions.

| Phase | Scope |
|---|---|
| P0/P1 | Audit, docs-first role governance, portable pi-dev workspace, bootstrap/doctor and regression verification |
| P2 | **CLOSED / PASS:** shared canonical Skill source and Pi integration, merged to main |
| P3 | CLI/Skill research performed on `feature/p3-worker-harness-design`; detailed four-harness E2E remains PARTIAL and is deferred |
| P4 | Harbor benchmark and reproducible evaluation evidence |
| P5 | **CLOSED / FINAL PASS (2026-10-13):** Pi -> Claude Code CLI -> Pi synthetic-text pipeline, reviewed and selectively promoted to main |
| P5.1 | **CLOSED / FINAL PASS (2026-10-13):** native Read/Edit synthetic JS + host test + Pi result; main release |
| P5.2 | **CLOSED / CLAUDE PASS (2026-10-13):** actual Pi auto + named Claude synthetic delegation; Codex/Hermes NOT_READY, full three-worker coverage PARTIAL |
| P5.3 | **CLOSED / INVESTIGATION PASS (2026-10-13):** Codex/Hermes remain NOT_READY with independently verified fail-closed reasons; overall 3-worker coverage PARTIAL |
| P6 | Model/harness routing and comparisons deferred until useful product workflow runs |
| P7 | Multi-harness workflows with explicit ownership and handoffs |
| P8 | Fresh-machine portability across PCs/drives and Linux/cloud |

## Intended layout

Tracked root source/configuration consists of `.gitattributes`, `.gitignore`, `.env.example`, `AGENTS.md`, `README.md`, `PATCH_NOTES.md`, `package.json`, `package-lock.json`, `pi.cmd`, and `bin/`, `docs/`, `scripts/`, `pi-dev/`. Local root state consists of `.git/`, ignored `.env`, optional ignored secret files such as `.env.naver`, `node_modules/`, and `results/`. `pi-dev/` owns Pi settings, MCP configuration, agents, prompts, extensions and later harness adapters. Runtime is ignored; npm supplies executables and dependencies.

Keep the physical root intentional: tracked source/configuration, active pi-dev runtime, portable bin entrypoints, local secrets and node_modules, and generated results. Smoke output belongs under `results/smoke/run-*/`; each run preserves earlier results. Remove legacy migration directories after needed state is safely migrated and validated. Empty future-phase directories are not placeholders to create now.

Future sibling areas: `shared/{skills,tools,mcp,prompts,docs}/`, `hermes-dev/`, `claude-code-dev/`, `codex-cli-dev/`, `commander/`, `harbor/`, `benchmark/`, ignored `results/` and `worktrees/`. Empty future folders have no placeholders and need not exist yet.

Portable Agent Skills belong canonically in `shared/skills/`. Harness-specific extensions/hooks/plugins remain in their harness area. Lift reusable execution logic into `shared/tools/` or later MCP only when justified. Do not duplicate skills into four harness directories. P1 preserves the community skill-creator package unchanged; actual shared-skill migration is P2.

The [shared-skills work order](work-orders/P2_SHARED_SKILLS.md) records discovery, compatibility and the accepted native-first architecture (D-009). The approved P2.2 scope is `agentco-delta-handoff` plus Pi's native path; joint P2.1+P2.2 independent Claude verification follows. Existing user/community package skills retain their ownership/location. Future harness activation remains separately gated by P3 scope and version-specific tests.

## Verification and portability

Use the current work order acceptance tests and [HARNESS.md](capabilities/HARNESS.md). Bootstrap restores from the lockfile and pinned Pi package sources; never auto-upgrade to latest. Doctor only inspects. Unique local state is preserved during cleanup and never copied into Git; obsolete generated caches may be removed after classification and validation. Existing sessions and helper binaries are migrated into ignored pi-dev runtime by the P0/P1 root hygiene follow-up. Newer active credentials are retained; the older auth file is preserved opaquely under ignored `pi-dev/retained-auth/p0-p1/` for a separate credential decision. A fresh clone creates fresh runtime.
