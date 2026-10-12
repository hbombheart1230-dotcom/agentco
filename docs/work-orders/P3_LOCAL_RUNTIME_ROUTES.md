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


## P3.3b1 findings (2026-10-12)

**Audit base:** `a30e8cc8ebd457e548500b6399440e60ff0459d3`; main remains `1f928974c3fcfc70456fa06bc03064576a9fd51d`. **Inventory complete, awaiting GPT/user integration choice.** User-confirmed local operation and passive process/installation observations are separate evidence; no session/project attribution, authentication or worker-readiness claim is made.

| Harness / owner | Local user operation | Actual invocation route / entrypoint and version | Reusable by future Agentco worker? | Unknowns / next action |
| --- | --- | --- | --- | --- |
| Codex / VS Code ChatGPT 26.1002.51308 | User confirms local use; running `codex.exe` path observed. | Current PowerShell PATH and running Codex process both point to `<USERPROFILE>/.vscode/extensions/openai.chatgpt-26.1002.51308-win32-x64/bin/windows-x86_64/codex.exe`. Publisher `openai`, manifest version 26.1002.51308. CLI 0.162.0-alpha.2 is the prior version result, not re-executed here; current hash matches that record. **INSTALLED-PROVEN** metadata/route. | Existing editor route confirmed; no automatic worker integration approved. Extension owns updates. | No argv/session reads: active project, effective config/auth/permissions and exact editor selection mechanism UNKNOWN. Preserve route; explicit future choice required. |
| Codex / additional VS Code ChatGPT 26.1007.21434 | Installed extension observed; not observed as the running Codex route in this snapshot. | `<USERPROFILE>/.vscode/extensions/openai.chatgpt-26.1007.21434-win32-x64/bin/windows-x86_64/codex.exe`; publisher `openai`, manifest version 26.1007.21434. Signed OpenAI binary exists; executable VERSIONINFO absent, **CLI version UNKNOWN**. Do not equate extension version with CLI version. | Candidate only; do not select it merely because its extension version is newer. | Current activation/update/pin policy and standalone launch behavior UNKNOWN; no launch or extension change. |
| Codex / Agentco isolated Stable | Separate install observed; not presumed to be the user's current command. | `<repo>/results/p3/tools/codex/0.162.1/codex.exe`; hash matches independently reviewed P3.3a artifact. **0.162.1** launch version reused from reviewed P3.3a, no rerun. **INSTALLED-PROVEN**; not PATH-effective. | Explicit-path, independently pinned candidate for future worker; **WORKER READY NOT TESTED**. No launcher/config created. | Auth, permissions, model budget, shared-skill discovery and E2E remain separate approval gates. Prefer an explicit selection over PATH replacement. |
| Claude / existing Desktop + Code runtime route | **LOCAL USE CONFIRMED** by user. Running Desktop app and a distinct Claude Code-path process observed. | Desktop Appx `Claude` 2.31226.1.0, x64; running executable under `C:/Program Files/WindowsApps/Claude_2.31226.1.0_x64__<package-id>/app/claude.exe`, VERSIONINFO 2.31226.1. Running Code-path process: `<USERPROFILE>/AppData/Roaming/Claude/claude-code/2.1.295/<build-id>/claude.exe`; **2.1.295 is a path label, not a verified CLI version**. No current PowerShell `claude` command/alias/function discovered. | Existing Desktop-managed local operation confirmed; **independently callable supported CLI UNKNOWN**. Do not reinstall. Desktop app executable is not established as a worker CLI. | The reported Code executable path returned PathNotFound; the limited known runtime-root check was absent too. It may be a stale/inaccessible process image or another routing situation; cause UNKNOWN. No privilege bypass, session inspection or process restart. GPT/user should identify the supported reuse entrypoint before any adapter/launch probe. |

**Passive provenance:** two VS Code extension manifests declare `openai.chatgpt`, with `./out/extension.js` entrypoint. No Anthropic Claude Code extension found in the checked `.vscode/extensions` / `.vscode-insiders/extensions` roots; this does not negate Desktop/local use. Both Codex extension binaries and the Stable binary have **Valid OpenAI OpCo, LLC** Authenticode signatures. Desktop executable has **Valid Anthropic, PBC** signature. Claude Code-path executable hash/signature/version are **UNVERIFIED** because file metadata is unavailable; process-path presence alone is not binary authenticity or standalone launch proof.

| Binary | SHA256 observed without execution |
| --- | --- |
| Codex extension 26.1002 | `D83CC3582592E307DF008411F02F61A93FB93580B53DC173608A63202D97BBE4` |
| Codex extension 26.1007 | `F5521B058CA08E249AFD3B25B4681E81100181D92E73AA6B94BB8E75C2AA487B` |
| Codex Stable 0.162.1 | `DD13BDB162A184FA04039488B234A8258EF9B76F84E926C505D5742B19249A6A` |
| Claude Desktop | `0109485C3812FA9C6FBC8BFD1C9C390DAD4D25A538BBBD0D95E8286283A94BFB` |

**Future interface hypotheses, DOC-ONLY (official rolling docs checked 2026-10-12):** [Codex CLI reference](https://learn.chatgpt.com/docs/cli/reference) documents noninteractive `codex exec`; availability/auth/sandbox behavior for a chosen worker is not tested by this audit. [Claude Desktop](https://code.claude.com/docs/en/desktop) documents a Desktop-managed Code copy whose version/update lifecycle can differ from terminal `claude`, consistent with these passive routes but not proof of the process's parent/session. [Programmatic Claude](https://code.claude.com/docs/en/headless) documents `claude -p`; a supported CLI entrypoint for this Desktop-managed installation is still UNKNOWN. Do not assume Desktop's private payload is a supported standalone automation interface. Noninteractive startup can load hooks/skills/config/MCP; isolate permissions and approve auth/provider/spend separately before any launch. Generic repo discovery `.agents/skills` (Codex) / `.claude/skills` (Claude) remains a proposal, with Windows link/reference behavior and enforced sandbox UNKNOWN/NOT RUN; no view created.

**Scope/evidence:** current-session `Get-Command -All`; known vendor extension/package metadata and exact executable `Get-Item`/hash/Authenticode; current-user Claude Appx metadata; process query requested **only Name and ExecutablePath**, not command lines. A limited known Claude Code runtime-directory check found no accessible payload; no broad user-directory scan. Sanitized executable metadata is ignored at `results/p3/p3-3b1-executable-metadata.json`. No CLI/app/WSL was launched, stopped or updated; version/help tests were reused rather than rerun. No account/status/config/session/editor-window/browser/private content was read. Model, login, sandbox, discovery/invocation, adapters and regression tests are **NOT RUN**. Only this work order and CURRENT_TASK change in Git; main, Pi/shared assets, PATH, installations, runtime, working sessions and all stashes are preserved.

**Next:** GPT/user choose which Codex interface to reuse (current editor route versus reviewed explicit Stable binary) and resolve Claude's supported callable route through metadata/targeted clarification under a new gate; never infer NEEDS INSTALL from PATH absence. P3.3b2 integration and P3.3b3 live readiness/budget remain unapproved. Hermes stays deferred; no independent verification run was initiated.


## P3.3b1 disposition and interface choice (GPT review, 2026-10-12)

**P3.3b1 metadata audit CLOSED / PASS**, executor commit `6e1f98b1b19fff93f4ce40d077e1f74c4335d21c`. No new CLI was installed or launched, and no model, session, secret, credential or profile was inspected. This PASS is for **route/provenance inspection only**, not worker readiness.

**Architecture recommendation (implementation not yet authorized):**

- **Development Codex:** preserve current VS Code ChatGPT extension 26.1002 effective process/PATH; additional extension 26.1007 stays untouched. Do not tie worker identity to extension autoupdates.
- **Agentco Codex worker:** use exact executable `<repo>/results/p3/tools/codex/0.162.1/codex.exe` through an explicit, future minimal adapter; do not replace user's PATH. That binary passed independent installation-only checks but no login/exec/sandbox/E2E.
- **Current Claude independent verifier:** preserve the **existing Claude Desktop Code tab**, which is locally running; its packaged Code 2.1.295 path label is not a verified standalone entrypoint. Do not treat Claude Desktop as not installed.
- **Future automated Claude worker:** independent callable CLI remains **UNKNOWN**; do not automate Desktop's private runtime executable or infer that the Desktop app exports `claude -p`. Anthropic official [Desktop reference](https://code.claude.com/docs/en/desktop) states the Code tab downloads/updates **its own Claude Code copy**, potentially different from the separate terminal CLI. Official [programmatic mode](https://code.claude.com/docs/en/headless) documents the supported `claude -p` route. Reuse a supported CLI if a genuine one is later found; otherwise propose an **optional separate official CLI installation** for automated worker use under a new approval. It is not needed for continued local manual Claude verification.
- **Hermes:** later approved official native install and separate external skill write-boundary test.
- **Pi:** preserve upstream 1.0.4 and P2 single-source shared-skill behavior.

Do not implement a full Commander, generic orchestration broker, per-agent config mirroring, a new skill loader or copied skill bodies in P3; use native supported process/Skill surfaces first.

## P3.3b2a recommended next gate — PROPOSED, NOT APPROVED

**Scope if approved:** small, reversible **Codex-only native Skill view feasibility** and stable explicit-path launcher *design*, without launching a model or using any auth.

1. Inspect exact Git HEAD, ignored-state ownership and Pi skill discovery baseline. Do not modify user-level Codex/Claude profiles or global PATH. Preserve all existing applications, versions, sessions and stashes.
2. In a **new, owned and ignored** `results/p3/` disposable fixture (not the canonical repo `.agents/skills`), test Windows per-skill symlink creation to the one canonical `shared/skills/agentco-delta-handoff`. Verify `SKILL.md`, reference resolution, identity/reversibility, junction/symlink semantics and safe unlink without following/deleting the shared source. If privilege/behavior fails, STOP and report UNVERIFIED or BLOCKED; do not elevate or copy files.
3. Check whether any intended future repo-local skill view would duplicate existing Pi discovery. Do not register an actual repo `.agents/skills` or `.claude/skills` in this gate. Do not modify `pi-dev/settings.json`.
4. Document the simplest possible explicit executable invocation contract for pinned Codex 0.162.1, scoped environment, permissions and future stdout/stderr capture, grounded in the installed version's prior documented CLI help. This is **design only**, not a launcher/script implementation. No `codex exec`, authentication/status probing, sandbox launch or network/model access.
5. If a file change is needed beyond ignored test fixtures and sanitized documentation, STOP for new authorization. Update `docs/CURRENT_TASK.md` and this work order only; commit/push feature branch after `git diff --check`. Report test PASS/FAIL/NOT RUN with true provenance and **WORKER READY = NO**.

**Following gates require separate approval:** P3.3b2b actual owned Skill registration and thin explicit-path adapter (with Claude independent verification), then P3.3b3 auth/sandbox/model E2E with stated provider and spend cap. For the Claude automated-worker route, decide reuse versus separately managed CLI only after a specific supported command path is established. Do not silently reuse Desktop auth or private binaries.

**Current authorization:** P3.3b1 is completed; P3.3b2a remains only a work-order proposal, so no agent should execute it from this document yet.
