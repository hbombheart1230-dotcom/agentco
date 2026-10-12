# Agentco Current Task

This is the only default execution entrypoint for Codex/Claude. Follow `AGENTS.md`, inspect live Git/status, and read only the active scope.

## Current action

**P3.3b1 — existing local Codex/Claude route inventory CLOSED / PASS (2026-10-12).** Executor SHA: `6e1f98b1b19fff93f4ce40d077e1f74c4335d21c`. No installer, model, login, profile mutation or shared Skill view was invoked. P3.3a separately pinned Codex CLI 0.162.1 remains installed, installation-only FINAL PASS; **WORKER READY = NO / NOT TESTED**.

**GPT architecture choice recorded, no implementation yet:**
- User's VS Code Codex extension remains the existing development route.
- Agentco Codex future worker will use the independently pinned 0.162.1 CLI via an explicit path, not the extension-owned PATH binary.
- Claude Desktop Code continues as the local independent verifier. Its privately managed Code executable is **not** a proven supported standalone CLI or automated worker surface. Claude CLI installation is **not currently approved or required** for the user's existing workflow.
- Hermes remains pending a separate official-native install gate. Pi and shared skills stay unchanged.

## Required context for next phase

- `AGENTS.md`
- `docs/work-orders/P3_LOCAL_RUNTIME_ROUTES.md` — **P3.3b1 disposition and interface choice** and **P3.3b2a recommended next gate** only
- live Git branch/status/remote

## Authorization boundary

**P3.3b2a is PROPOSED, NOT APPROVED.** Do not run link fixtures, create adapters, change profiles/PATH, start Claude/Codex sessions, install anything, authenticate, invoke models or merge main from this proposal. Only GPT/user may open a separate approval gate for the fixture-only native Skill view feasibility check.

## Next handoff

On user approval, GPT changes this entrypoint and work order to authorize the narrow P3.3b2a disposable-link test. Codex executes/commits; Claude independently reviews any substantive registration/integration changes; GPT/user gate actual P3.3b2b integration separately.
