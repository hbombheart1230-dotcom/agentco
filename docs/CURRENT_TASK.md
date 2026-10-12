# Agentco Current Task

This file is the sole default entrypoint for Codex/Claude. Follow `AGENTS.md`, check actual Git status, and read only the referenced active work order.

## Current action

**P3.3b1 — existing local Codex + Claude invocation-route audit: APPROVED (2026-10-12).** The user confirmed that **both Codex and Claude are already in local use** for Agentco development and verification. Earlier failure to find `claude` on PATH/default locations does **not** mean Claude is absent. Do not reinstall either existing harness. Codex's separate, signed stable CLI 0.162.1 installation already passed Claude review, but worker readiness remains NOT TESTED. Main retains the completed P2 baseline.

## Required context

- `AGENTS.md`
- `docs/work-orders/P3_LOCAL_RUNTIME_ROUTES.md` — the **only active P3.3b1 work order**
- actual Git branch/status/remote, passive OS and extension/executable metadata

## Codex action

Run the approved **read-only system metadata audit** for the actual existing Codex and Claude execution routes, including two installed VS Code ChatGPT extension versions and the isolated stable Codex CLI. Distinguish user-confirmed local execution from confirmed standalone callable CLI. If Claude route remains unknown, report UNKNOWN; never infer that Claude needs installation from PATH alone. Avoid sessions, secrets, config contents and process arguments.

Only append nonsecret results to the active work order and update this task status to awaiting GPT/user integration decision. `git diff --check`, commit/push documentation on feature branch, no main merge. Preserve working sessions, Pi, users' installations, ignored results, PATH, auth, runtime and all stashes. **No** install/upgrade, login, model call, user configuration change, Skill adapters, links, WSL startup, sandbox execution or other P3.3b implementation.

## Next handoff

GPT/user decide minimal reuse/adapters after the audit; Claude independently checks implementation changes after a separately approved execution gate. Hermes remains a future distinct install decision.
