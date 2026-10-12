# P3.3b1 — Existing Local Harness Routes

**Status:** APPROVED: metadata-only discovery and sanitized documentation (2026-10-12). **No installation/integration/model calls authorized.**
**Workspace:** `C:\Agentco`, branch `feature/p3-worker-harness-design`.
**Roles:** Codex executes; GPT/user decide; Claude independently reviews substantive changes.
**Context:** Read `AGENTS.md`, `docs/CURRENT_TASK.md`, and this work order only. Do not reload P0–P2 history.

## Corrected premise

The user confirms **both Codex and Claude are already being used locally for Agentco development**. Prior P3.2 did not detect a `claude` command on PATH or limited default paths; that is **not** evidence Claude is absent or requires reinstalling. It could be invoked via an editor extension, app, explicit executable, wrapper, alternative shell/WSL or another local route; this task must establish facts without guessing.

Distinct Codex entries also exist: VS Code ChatGPT extension 26.1002 is currently PATH-effective; Claude independently observed an additional 26.1007.21434 extension; a signed official stable Codex CLI `0.162.1` is installed separately in ignored `results/p3/tools/codex/0.162.1/`. The standalone installation passed Claude independent verification (implementation SHA `fc47bd0ce4e420a597dc4f432bef4fb0b0ad32f3`), **but worker readiness remains NOT TESTED**. Do not assume the separately pinned CLI is what the user currently invokes.

## Approved P3.3b1 task for Codex

1. Verify feature branch/current origin, clean Git state, and unchanged main. Fetch if safe, but never reset, force, clean, stash, overwrite or modify another agent's work. Stop if dirty or divergent.
2. Identify the **effective existing Codex and Claude invocation routes** using only safe local metadata: command/alias/function discovery, known executable locations, VS Code extension identifiers/manifests, app installation metadata, and running-process names/executable paths where relevant. Do not inspect process command-line arguments, session messages, editor windows, browser data, home configuration contents, auth stores or private user files. Do not start or terminate active agents/WSL instances.
3. Reconcile Codex's PATH-resolved VS Code extension version 26.1002, additional extension 26.1007.21434, and separately installed pinned stable CLI 0.162.1. Record actual version/path ownership/hash when practical; do not change PATH, select the latest extension by assumption, install/update or re-run unnecessary past tests.
4. For Claude, distinguish **user-confirmed local operation**, PATH discovery, and independently callable supported CLI. If local operation is known but a callable route cannot be established from nonsecret metadata, record `LOCAL USE CONFIRMED / INVOCATION ROUTE UNKNOWN`; never label it `NOT INSTALLED` or auto-install Claude. A later targeted user clarification may be required, but do not interrupt this read-only audit.
5. Review vendor-supported noninteractive invocation, version/update ownership, scoped environment/permission boundaries and Skill discovery **as future design hypotheses**. Mark INSTALLED-PROVEN, DOC-ONLY or UNKNOWN. Do not run commands that may bootstrap, authenticate, use models, write profiles or update themselves.
6. Do not create any Skill views/links/junctions, config, launcher, local env, home, or integration files. Pi's shared `agentco-delta-handoff` stays in exactly one canonical source. Hermes installation remains deferred and its writable external skill directory disabled.
7. Append a concise nonsecret result table to this document: `Harness / Local user operation / Actual invocation route / CLI entrypoint & version / Reusable by future Agentco worker? / Unknowns / Next action`. Separate user report from passive local observation. Save additional sanitized metadata only in ignored `results/p3/` if necessary. Exclude personal paths/names, secrets, process argv and user-specific account details.
8. Update `docs/CURRENT_TASK.md` to **P3.3b1 inventory complete, awaiting GPT/user integration choice**. Change only this work order and CURRENT_TASK, verify links and `git diff --check`; commit/push the feature branch, leave main and all runtime/stashes untouched. Report delta only.

## Strict boundaries

P3.3b1 permits passive system inspection plus its limited Git documentation writes. **No** installation, login/auth-status probe, model call, cost, sandbox execution, shared Skill adapter, Windows link creation, PATH/profile/config change, network installer, service or active-session disruption. If a metadata source risks revealing credentials/arguments, skip it and label NOT RUN. Never infer sandbox enforcement from CLI help or worker readiness from a signed executable.

## Subsequent approval gates — NOT YET AUTHORIZED

- P3.3b2: install nothing by default; configure minimal explicit native interface/Skill view for each **existing** local harness, only if supported and reversible, with Claude independent verification.
- P3.3b3: separate explicit user approval of auth route, provider/model, sandbox, permissions and usage cap before live E2E.
- Hermes: separate installation decision after local reuse paths are settled; shared write isolation required.
- P4: benchmark only after the actual readiness tests have passed.
