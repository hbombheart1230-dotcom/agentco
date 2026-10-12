# Agentco Current Task

This file is the sole default entrypoint for Codex/Claude. Follow `AGENTS.md`, inspect live Git/status and read only the listed current context. Do not reread P0–P2 history.

## Current action

**P3.2 — Windows Worker Harness environment preflight: APPROVED (2026-10-12).** P3 architecture (D-010) remains PROPOSED and P3.3 installation/configuration is NOT APPROVED. Use the canonical `C:\Agentco` workspace on `feature/p3-worker-harness-design`; P2 main baseline is `1f928974c3fcfc70456fa06bc03064576a9fd51d`.

## Required context

- `AGENTS.md` — common rules
- `docs/work-orders/P3_WORKER_HARNESSES.md` — **Approved P3.2 inventory execution order** and its gates only
- actual `git status`, branch, remote HEAD and local CLI metadata

## Codex action

Run an inspection-only preflight for **Codex CLI, Claude Code and Hermes** as specified in the approved work order. No installs, upgrades, logins, model calls, new Skill links, user-profile changes, service starts, or Pi changes. Existing credentials and personal configuration must not be read or printed. A compact, sanitized inventory summary may be committed to the work order; raw nonsecret diagnostics belong under ignored `results/p3/`.

First verify/fetch the exact feature branch and ensure no dirty/unexpected local or remote changes. If those checks fail, stop safely and report. Update only this current task and the P3 work order with preflight findings and next-step review status; check diff; commit/push to the feature branch, never main. Report only delta, tests NOT RUN and gates remaining.

## Next handoff

GPT/user review P3.2 findings, choose exact versions/install channels and approve each P3.3 worker setup separately. The architecture and worker Skill adapters remain unapproved until then.
