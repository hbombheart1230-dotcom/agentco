# Assistant-first interaction

Canonical policy: [AGENTS.md](../../AGENTS.md). Ordinary greetings, advice, planning, explanations and research use personal-assistant mode. Merely running a native CLI in this repository does not authorize Git inspection, reading the current task or development actions. Inspect a specific file only when needed for the actual question.

Explicit Agentco implementation, debugging, testing or review requests use [CURRENT_TASK.md](../CURRENT_TASK.md) and its minimum required context. Codex implements; Claude independently verifies the named SHA; GPT/user decide release. No completed-history preload. These instructions guide behavior; they are not a model-response guarantee or a new runtime intent classifier.

## Native instruction loading

| Main / installed version | Instruction path at C:\Agentco | Evidence / boundary |
| --- | --- | --- |
| Pi 1.0.4 | pi-dev/AGENTS.md (global agentDir), then root AGENTS.md | Installed loadProjectContextFiles executed offline and selected exactly these paths. Per-directory candidates prefer AGENTS.override.md, AGENTS.md, AGENTS.MD, CLAUDE.md, CLAUDE.MD. No project/global SYSTEM.md or APPEND_SYSTEM.md present |
| Claude Code 2.1.292 | root CLAUDE.md imports root AGENTS.md through native @AGENTS.md | Official import mechanism; no copied policy or changed native settings. Direct AGENTS support depends on version/session/plugin; the explicit import avoids relying on it. Actual session context/model response NOT RUN |
| Codex 0.162.1 | optional CODEX_HOME global AGENTS.override.md/AGENTS.md, then ancestor-to-cwd AGENTS files | User/global/ancestor override files absent here; root AGENTS.md is the applicable repo policy. Default document budget/fallback metadata unchanged. Installed discovery symbols and official resolution documented; no native prompt/model test |
| Hermes 0.21.7 | native-home SOUL.md plus repo AGENTS.md chain | Installed candidate functions checked offline. .hermes.md/HERMES.md takes precedence if present; neither exists here. AGENTS wins before CLAUDE fallback, so the new Claude import file does not replace Hermes policy |

Official references: [Claude memory/imports](https://code.claude.com/docs/en/memory), [Codex AGENTS resolution](https://developers.openai.com/codex/guides/agents-md/). Pi source: installed dist/core/resource-loader.js. Hermes source: installed agent/prompt_builder.py. Ancestor/user instruction files were checked only in relevant locations; no auth/session/secret files or historical reports were inspected. Existing Hermes SOUL.md has no current-task directive and is unchanged. User-level/native memories or explicitly resumed modes can still influence a session.

## Narrow corrections

- Pi's global operating rules no longer apply plan/subagent instructions to ordinary conversation; those apply only to explicit Agentco development. Existing browser sequencing and secret handling rules remain.
- The Git checkpoint extension previously ran rev-parse/stash-create on every agent_start, including a greeting. Automatic checkpoints now default OFF. Development sessions may explicitly opt in with `agentco --main pi --agentco-checkpoints`. This requests snapshots for every turn of that session; omit it for ordinary chat. Existing checkpoint recording and explicit fork/restore behavior are preserved, and prior refs/stashes/session entries are not deleted.
- Plan-mode extension already defaults OFF for a new session. Explicit --plan and restored user plan state remain untouched. Available coding tools/Worker tools are capabilities, not automatic development authorization. No model, API key, native TUI settings, launcher, Skill, AUTO or Worker change.
- Root CLAUDE.md is only a native import of AGENTS.md. CURRENT_TASK.md is not imported at startup by that file; it remains a development-only entrypoint.

## Verification / handoff (2026-10-14)

Base: 1c76ade5a68cdb5625be2d5cb20a543a6fd9e080 on feature/assistant-first-interaction. Four focused offline tests PASS: default checkpoint events make no Git/session calls; opt-in uses the original checkpoint recording path; actual installed Pi loader selects scoped/canonical rules; Claude import and conditional development routing are intact. Git/extension calls in event tests are mocked, not real stash operations. Installed Hermes candidate functions were additionally exercised in an isolated AST namespace with known Git root and filesystem reads; root AGENTS selected, full native prompt build NOT RUN. This is candidate-resolution evidence, not a Hermes model conversation.

Model/API calls, TUI, live greeting/advice/development responses, Claude /context and full native runtime prompt inspections: NOT RUN. No claim that every model will obey the policy or that native CLI internal Git metadata calls are eliminated; the verified no-Git default is specifically this checkpoint extension. No new framework, vendor patch or global native config edits. Tests/syntax/UTF-8/link/scope checks PASS. P5.10 branch, two stashes, local native models/configs and browser/runtime state preserved; no main merge.

Use fresh native sessions (or the harness-supported reload) to load changed instruction/extension files; existing contexts and explicitly resumed user modes are not rewritten.

Next: Claude independently reviews this delta and offline evidence. Any live response test requires separate authorization. No historical phase validation repeats.


## Independent verification and release acceptance — 2026-10-14

- **Reviewed SHA:** `2879522c69a5ed8f8e03859519a0be911acaf9ce`. Claude independent review verdict **PASS**, no required fixes, no critical findings. Focused tests **4/4 PASS** locally and installed Pi `--help` confirmed the new `--agentco-checkpoints` flag is available. No model/API calls, native chat sessions, login, secrets or user settings inspected during this review.
- **Scoped feature accepted:** Pi global `AGENTS.md` and repo root `AGENTS.md` are selected by the installed Pi loader; native Claude Code import `CLAUDE.md -> @AGENTS.md` uses official syntax; Codex resolves root AGENTS; Hermes source/AST candidate checks select repo AGENTS with native SOUL still present. These are **instruction discovery and source-based proofs**, not proof of model compliance in a live greeting. No new classifier/router was introduced.
- **Pi checkpoint default OFF:** mocked event evidence shows zero extension-triggered Git/session calls for a default turn. `agentco --main pi --agentco-checkpoints` is supported by the installed runtime and runs the original snapshot path when explicitly enabled. Existing fork/restore registration, refs and session entries are left intact; actual Git stash/fork integration NOT RUN.
- **Development routing preserved:** `docs/CURRENT_TASK.md` is opened only for an explicitly assigned Agentco development request; Codex executes/tests/commits/pushes, Claude independently verifies, GPT/user decide the release. P5.4 AUTO/Worker, original Main launcher, P5.9 native provider defaults, Pi packages, credentials, profiles and browser unaffected.
- **Cross-branch conflict:** independent `git merge-tree` reported exactly one overlap with separate `feature/p5-10-ultra-defaults`: `docs/CURRENT_TASK.md`. That branch has its own Ultra model task status and is **NOT** part of this release. When separately reviewed P5.10 is integrated, resolve the pointer once so assistant-first development-only preamble stays and P5.10 truthful status is recorded. Do not overwrite P5.10 model/test commits or auto-merge without its own review.
- **Release scope:** only documentation may change after the reviewed SHA, to mark assistant-first complete. No further code changes; main fast-forward only when origin/main remains previous accepted SHA `ba104a6b4661298b8cb17dd0f010b8309da76580`. Native sessions started before the change need a new session or reload to pick up instructions. Live assistant behavior is NOT RUN and cannot be guaranteed solely by policy files.
