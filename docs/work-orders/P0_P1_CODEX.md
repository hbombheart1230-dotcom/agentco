# P0/P1 Work Order — Agentco workspace normalization

Owner: GPT / user
Executor: Codex
Verifier: Claude
Functional baseline commit: `3a27a7d60b9e6305bc538bab4b2dedacc15d302c`
Work-order commits were added afterward on `main`; create the implementation branch from the latest `origin/main` after pulling.
Target branch: `feature/p0-p1-agentco-workspace`

## Operating model

This repository is the single source of truth.

- **Codex = primary developer/executor**
- **Claude = independent verifier/reviewer**
- **GPT + user = architecture owner / final decision**
- Read repository documentation before changing code.
- Preserve useful existing behavior and validated assets.
- Build last: prefer configuration, package managers, stable CLI/MCP, and thin adapters over new infrastructure.
- Do not patch upstream Pi unless explicitly approved.

## Current verified baseline

Before starting, verify these facts against the repository and local workspace rather than assuming them:

- Functional code baseline before these work-order docs is `3a27a7d...`; current `origin/main` is expected to be newer because the work-order docs themselves were committed afterward.
- Pi is exact-pinned at `@earendil-works/pi-coding-agent@1.0.4`.
- Current Pi agent directory is repo-local `pi-home/`, set by `scripts/env.mjs`.
- Current harness includes:
  - Pi built-ins: codemode, MCP/tool-search, grep/find/ls
  - official subagent + plan-mode examples
  - Agentco-owned `permission-gate.ts`, `protected-paths.ts`, `git-checkpoint.ts`
  - `@ian-pascoe/pi-lsp@0.8.0`
  - Playwright MCP
  - `@tmustier/pi-skill-creator@0.3.4`
- Existing documented regression baseline is 14/14 smoke plus HARNESS.md checks.
- Runtime/secrets must remain machine-local.

## Goal

Normalize the personal Agentco workspace around a single repository whose canonical Windows location is:

`C:\Agentco`

The repository itself must remain **location-independent**: tracked code/config must derive paths from the repository root and must not hard-code `C:\Agentco`, so the same repo can later run from another PC, another drive, or Linux/cloud.

This phase only establishes the root architecture and migrates the existing Pi-managed assets. Do **not** install Hermes, Claude Code, Codex CLI, or Harbor yet.

## Target layout after P1

```text
<repo-root>/
├─ .git/
├─ .gitignore
├─ .env                 # local only, ignored
├─ .env.example
├─ AGENTS.md
├─ README.md
├─ package.json
├─ package-lock.json
│
├─ pi-dev/              # Pi agent/config/customization directory
│  ├─ settings.json
│  ├─ extensions/
│  ├─ agents/
│  ├─ prompts/
│  ├─ skills/
│  ├─ mcp.json
│  └─ AGENTS.md
│
├─ shared/
│  ├─ skills/           # canonical shared-skill source in later phase
│  ├─ tools/
│  ├─ mcp/
│  ├─ prompts/
│  └─ docs/
│
├─ hermes-dev/
├─ claude-code-dev/
├─ codex-cli-dev/
├─ commander/
├─ harbor/
├─ benchmark/
├─ results/
├─ worktrees/
│
├─ scripts/
│  ├─ env.mjs
│  ├─ pi.mjs
│  ├─ smoke.mjs
│  ├─ bootstrap.ps1
│  └─ doctor.ps1
│
└─ docs/
```

Empty future directories do not need meaningless placeholder files unless required for documentation. Prefer documenting the intended layout instead of committing empty folders.

## P0 — audit first

Before modifying anything:

1. Confirm local branch, HEAD, origin URL, and working-tree state.
2. Fetch remote and compare local HEAD with the latest `origin/main`; do not require `origin/main` itself to equal `3a27a7d...` because the work-order documentation commits are newer.
3. Do not discard or overwrite pre-existing dirty/untracked user work.
4. Inventory tracked and runtime contents related to:
   - `pi-home/`
   - `scripts/`
   - root environment/config files
   - Pi extensions, agents, prompts, skills, MCP config
5. Search tracked files for:
   - `pi-home`
   - absolute Windows/user paths
   - stale Pi 1.0.2 claims that describe the *current* state rather than historical baseline
   - old Claude/Codex role descriptions
6. Record findings before implementation.

If the working tree contains unrelated user changes, preserve them and isolate this work rather than cleaning them.

## P1 implementation

### 1. Role inversion and docs-first rules

Update project governance so the canonical role split is now:

- Codex: primary executor/developer
- Claude: independent verifier/reviewer
- GPT: architect/director/final technical decision
- User: final product/priority decision

Update at minimum:
- root `AGENTS.md` (create)
- `docs/WORKER_ROLES.md`
- `docs/DECISIONS.md` (supersede/update D-005; preserve decision history clearly)
- `PATCH_NOTES.md`

Root `AGENTS.md` must instruct future agents to read repository docs/current work order before implementation and to treat Git as the source of truth.

### 2. Rename Pi workspace

Use a Git-aware rename from:

`pi-home/` → `pi-dev/`

Preserve all currently tracked Pi configuration/custom assets and history.

Update all tracked references, including scripts, docs, comments, ignore rules and examples.

The Pi executable/package remains installed through npm; do not vendor/copy the executable or `node_modules` into `pi-dev`.

`PI_CODING_AGENT_DIR` must resolve dynamically to:

`<repo-root>/pi-dev`

No absolute repo path may be embedded in tracked files.

### 3. Shared-assets architecture

Establish/document these rules:

- portable Agent Skills belong canonically under `shared/skills/`
- harness-specific extensions/hooks/plugins remain under their harness area
- reusable execution logic should be lifted to `shared/tools/` or later MCP when appropriate
- do not duplicate the same skill into four harness directories
- actual shared-skill migration is **P2**, not this P1 unless moving an item is demonstrably zero-risk

Do not convert the existing community `skill-creator` package into custom code.

### 4. Future harness skeleton

Document intended sibling areas:
- `hermes-dev/`
- `claude-code-dev/`
- `codex-cli-dev/`
- `commander/`
- `harbor/`
- `benchmark/`

Do not install those products in this phase.

### 5. Portable bootstrap

Create a conservative Windows bootstrap:

`scripts/bootstrap.ps1`

Purpose: after a fresh Git clone, restore the **current Pi baseline** from online package sources rather than storing binaries/dependencies in Git.

It should:
- fail clearly when required prerequisites are absent
- use the repository root dynamically
- install repository npm dependencies from the lockfile using the safest reproducible mode supported by the repo
- handle/check the existing pyright prerequisite without hiding failures
- not print secrets
- not overwrite an existing `.env`
- explain how to create `.env` from `.env.example` when missing
- avoid installing Hermes/Claude/Codex/Harbor in P1

Do not auto-upgrade Pi to latest. Reproducibility is the default; "latest" update workflow belongs to a later phase.

### 6. Doctor

Create:

`scripts/doctor.ps1`

It must inspect without destructively changing state and report at least:
- Git available
- Node/npm version compatible
- repository root
- `.env` presence only (never values)
- npm dependencies / Pi package presence and exact expected version
- `PI_CODING_AGENT_DIR` target used by Agentco
- tracked Pi config presence
- pyright availability
- Edge availability or a clearly documented browser prerequisite check
- smoke-test command availability

End with a compact PASS / WARN / FAIL summary.

### 7. Documentation consistency

Create/update a real current plan document (prefer `docs/WORK_PLAN.md`) describing:
- P0/P1 workspace normalization
- P2 shared skills
- P3 Hermes/Claude/Codex installation
- P4 Harbor benchmark
- P5 Pi Commander MVP
- P6 benchmark-informed routing
- P7 multi-harness workflows
- P8 fresh-machine portability

Fix README links that currently point to missing/stale documents. Historical Pi 1.0.2 baseline docs may remain historical, but current-state docs must clearly state Pi 1.0.4.

Do not rewrite historical evidence merely to make all old documents say 1.0.4.

## Git / safety requirements

- Create/use branch `feature/p0-p1-agentco-workspace` from verified `origin/main`.
- Do not force push.
- Do not delete the archived Pi-dev tag/history.
- Do not read or print credential values.
- Do not remove the original runtime data outside Git as part of this work.
- Do not add secrets, sessions, browser profiles, caches, generated results, `node_modules`, or credentials to Git.
- Preserve line-ending strategy.
- Keep changes tightly scoped to P0/P1.

## Acceptance tests

At minimum:

1. `npm install`/reproducible install succeeds from the updated layout.
2. Pi launches through the existing launcher with `PI_CODING_AGENT_DIR=<repo>/pi-dev`.
3. Existing baseline smoke remains **14/14 PASS**.
4. Existing documented harness regression relevant to path/config migration remains PASS, especially:
   - extensions load
   - plan/subagent
   - safety/protected paths
   - git checkpoint
   - LSP
   - browser/MCP
   - session resume
5. No tracked reference incorrectly depends on `pi-home/` after migration, except historical text where intentionally retained and clearly historical.
6. No hard-coded `C:\Agentco` or user-profile path is required for execution.
7. `bootstrap.ps1` is tested in a fresh/scratch clone or equivalent clean setup without copying `node_modules` or runtime state.
8. `doctor.ps1` runs successfully and reports the expected environment.
9. `git status` contains only intentional changes.
10. Secrets scan / staged diff shows no credential material.

## Deliverable

Commit and push the branch when tests pass.

Final report format:

```text
BASELINE REMOTE HEAD:
LOCAL START HEAD:
BRANCH:

PREEXISTING DIRTY STATE:
PRESERVED:

PI VERSION:
OLD PI DIR:
NEW PI DIR:
PI_CODING_AGENT_DIR:

ROLE DOCS:
WORK PLAN:
README CONSISTENCY:

BOOTSTRAP:
DOCTOR:

SMOKE:
HARNESS REGRESSION:

ABSOLUTE PATHS:
STALE pi-home REFERENCES:
SECRETS IN GIT:

CHANGED FILES:
COMMIT:
PUSH:

P0/P1:
PASS / PARTIAL / FAIL

BLOCKERS / CLAUDE REVIEW NOTES:
```

## Follow-up — canonical single workspace

This follow-up is part of P0/P1 and supersedes routine use of per-phase sibling worktree folders.

The user wants Agentco development to use **one canonical working directory** by default:

`C:\Agentco`

Git branches remain the normal isolation/versioning mechanism. Additional linked worktrees such as `C:\Agentco-p0-p1`, `C:\Agentco-p2`, etc. are **exceptional**, not the default. Use an extra worktree only when there is a concrete reason such as simultaneous conflicting work or a high-risk experiment that cannot safely coexist in the canonical workspace.

### Required follow-up

Current implementation commit:
`23140f0addfb455cd6198441bc9e94f2e9876416`

Current temporary worktree used during P0/P1:
`C:\Agentco-p0-p1`

Canonical workspace:
`C:\Agentco`

Before Claude verification:

1. Inspect Git/worktree/status in both directories.
2. Preserve all pre-existing user state in the canonical workspace. At P0 start this included:
   - modified `README.md`
   - modified `pi-home/settings.json`
   - untracked `bin/`
3. Safely make `C:\Agentco` the working directory for `feature/p0-p1-agentco-workspace`.
4. Reconcile the preserved user changes with the new layout:
   - preserve intentional README edits;
   - map any meaningful old `pi-home/settings.json` changes into `pi-dev/settings.json`;
   - do not treat runtime-only `lastChangelogVersion` churn as an intentional user setting;
   - preserve `bin/` unless there is explicit evidence it is disposable.
5. Remove the no-longer-needed `C:\Agentco-p0-p1` linked worktree using normal Git worktree cleanup only after the canonical workspace is confirmed safe.
6. Re-run doctor and the 14/14 smoke from `C:\Agentco`.
7. Update root `AGENTS.md` (and another operating document only if useful) with this durable rule:

   > Agentco development uses the canonical workspace and Git branches by default. Additional linked worktrees are exceptional and require a concrete isolation or parallelism reason.

8. Commit and push this follow-up on the same feature branch.
9. **Do not merge to main yet.** Claude independent verification still gates the merge.

Final follow-up report:

```text
CANONICAL WORKSPACE:
BRANCH:
HEAD:

TEMP WORKTREE:
REMOVED:

PREEXISTING README CHANGE:
PREEXISTING SETTINGS CHANGE:
PREEXISTING BIN:
ALL PRESERVED:

DOCTOR:
SMOKE:

WORKTREE POLICY UPDATED:
FOLLOW-UP COMMIT:
PUSH:

SINGLE-WORKSPACE NORMALIZATION:
PASS / PARTIAL / FAIL
```
