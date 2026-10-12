# Agentco Current Task

This file is the sole default entrypoint for Codex/Claude. Follow `AGENTS.md`, verify actual Git/status and read only the minimum required context. Do not reread completed P0–P2 history.

## Current action

**P3.3a — isolated stable Codex CLI installation APPROVED (2026-10-12), limited to installation-only verification.** P3.2 inventory closed at `d4b8ae5504ea5ab9f0047283b4438f1d655fc74f`. The existing VS Code-bundled signed Codex `0.162.0-alpha.2` must remain intact. Claude Code/Hermes were not detected and are **not authorized for installation**. D-010 stays PROPOSED; later Codex authentication, Skill adapters, model tests and P3.3b remain unapproved.

## Required context

- `AGENTS.md`
- `docs/work-orders/P3_WORKER_HARNESSES.md` — **P3.2 inventory findings** and **P3.3a approved standalone Codex setup** only
- actual branch/status and origin, relevant installed executable metadata and official package metadata necessary to verify the chosen stable artifact

## Codex action

1. In canonical `C:\Agentco` on `feature/p3-worker-harness-design`, verify Git/branch/remote/status; synchronize using fast-forward only if safe, otherwise STOP without modifying user work.
2. Follow the approved P3.3a installation order and preflight gates in the work order: validate the **exact** official stable Windows x64 version/artifact and integrity, install in an **isolated, ignored, versioned Agentco-local destination**, then verify only explicit-path `--version` and `--help`. If package/version selection or side effects cannot be established safely, STOP before installing and report; don't silently select alpha/latest/fallback.
3. Preserve VS Code bundled Codex, Pi, PATH/shell profiles, personal configs/credentials, all stashes, ignored runtime/results and main. No login, auth/status probes, model calls, linked Skills, permission/sandbox activation, other worker installs, global upgrades, or extra costs.
4. Update only `docs/CURRENT_TASK.md` and `docs/work-orders/P3_WORKER_HARNESSES.md` with **sanitized** installed version/provenance/exact-path designation (not username), checks, rollback and NOT RUN/UNKNOWN. Leave worker readiness NOT READY. `git diff --check`; commit/push feature branch only and report delta. Preserve the installer artifact/evidence locally under ignored `results/p3/`.

## Next handoff

Claude performs narrow installation/integrity/scope independent verification after Codex's push; GPT/user gate P3.3b (auth, permissions, shared-skill integration and paid model tests) separately. No P3 main merge or other harness installation yet.
