# Agentco Task Inbox

Purpose: keep small follow-ups, cleanup items, ideas, and deferred checks in one place without creating a new work-order file for every minor item.

## Rules

- Large or phase-defining work belongs in a dedicated `docs/work-orders/Px_*.md` file.
- Small follow-ups, cleanup, observations, and future checks go here.
- Keep each item short and actionable.
- Add a source/phase when useful.
- If an inbox item grows into multi-file or architecture-changing work, promote it into the relevant phase work order and remove it from Pending.
- Do not store secrets, credentials, machine-local paths containing sensitive information, or transient runtime logs here.
- Codex may execute an inbox item only when the current work order or GPT/user explicitly includes it in scope.
- Claude may use this file to verify that deferred findings were not accidentally lost.

## Pending

- None.

## Parked / Future

- P0/P1 root hygiene: decide whether to activate or discard the retained older auth file under ignored `pi-dev/retained-auth/p0-p1/` when credential recovery is needed. Active newer auth was preserved; no credential values were inspected.

## Done

- None.
