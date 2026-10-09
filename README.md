# Agentco

Agentco is a personal cowork / companion agent. Coding is one capability among many.

Pi stays upstream. Build last: prefer built-ins, maintained packages, MCP/CLI and mature OSS before thin Agentco adapters. Agentco owns composition, policy, evaluation and UX.

## Current baseline

Upstream **Pi 1.0.4**, exact-pinned through npm. Configuration and customizations live in `pi-dev/`, resolved from the repository root by `scripts/env.mjs`. The harness includes official plan/subagent examples, three Agentco safety/checkpoint extensions, LSP 0.8.0, skill-creator 0.3.4 and Playwright MCP 0.0.83 using Edge. OpenRouter Nemotron free is the fixed primary model; Groq gpt-oss-120b is the secondary smoke provider.

```powershell
powershell -NoProfile -File scripts/bootstrap.ps1
# If missing, create .env from .env.example and fill provider keys locally.
node scripts/pi.mjs             # or .\pi.cmd
node scripts/smoke.mjs          # expected 14/14
powershell -NoProfile -File scripts/doctor.ps1
```

Bootstrap uses `npm ci`, restores configured Pi npm packages and checks pyright. Install Microsoft Edge for the configured browser MCP. Python LSP requires pyright on PATH; bootstrap can install it with the explicit `-InstallPyright` option. TypeScript projects need their own TS7 package for the configured LSP command; see [harness caveats](docs/capabilities/HARNESS.md).

Execution works from any clone location. Secrets, sessions, package caches and browser profiles stay machine-local. Existing runtime is never deleted during migration; new runtime packages are restored online. Old sessions/auth remain preserved until the user separately chooses a local migration.

## Current work

P0/P1 normalizes the workspace and governance. Codex develops, Claude independently reviews, GPT directs architecture, and the user decides product priorities. Shared skills and other harnesses remain later phases.

- [Repository rules](AGENTS.md)
- [Current work plan and intended layout](docs/WORK_PLAN.md)
- [Worker roles](docs/WORKER_ROLES.md)
- [Decisions](docs/DECISIONS.md)
- [Harness and regression evidence](docs/capabilities/HARNESS.md)
- [Fresh-machine setup](docs/bootstrap/LAPTOP2_MIGRATION.md)
- [P0 audit](docs/work-orders/P0_P1_AUDIT.md)
- [Patch notes](PATCH_NOTES.md)

The original clean Pi 1.0.2 baseline is historical evidence under [BASELINE.md](docs/bootstrap/BASELINE.md). The retired implementation remains in `archive/pi-dev-pre-rebootstrap`; it is not merged into main.
