# Agentco Current Task — P5.3 investigation closed; main release baseline

**P5/P5.1/P5.2 final PASS; P5.3 independent investigation PASS / CLOSED (2026-10-13).** Latest reviewed P5.3 implementation `8fd7a9f543987338335ee56c2bf03e605b9d0a3b`. The user-requested 1 Commander + 3 named Workers system remains **PARTIAL**: only Claude is runtime-verified; Codex and Hermes are NOT_READY. An investigation PASS is NOT a runtime Worker PASS.

## Verified interactive entrypoints

From canonical Windows workspace `C:\Agentco`, after safe sync, run `node scripts/pi.mjs`. Supported synthetic-only command set: `/harness status`, `/harness auto add42`, `/harness claude add42`. Pi auto selects verified Claude only, direct Claude launches the installed native CLI, and same Pi session receives real result. `/harness codex add42` and `/harness hermes add42` report exact NOT_READY reasons, no fallback or paid inference. These are deliberately fixed `add42` tasks: no arbitrary user prompts, private/Agentco/company source, browser sessions, credentials or broad project editing. Existing standalone P5 text and P5.1 disposable `--toy-edit` paths are preserved.

## P5.3 blocked lanes (investigated and independently reviewed)

- **Codex 0.162.1 — NOT_READY:** its native custom provider locally constructs correct `POST /api/v1/responses` with NVIDIA Super exact `:free` model (no authenticated inference). `view_image` remained available; Windows unelevated restricted-token sandbox REFUSED to enforce split filesystem read permissions in a synthetic out-of-cwd canary. Fail-closed denial is verified; no private read. No supported safe no-file-tool alternative confirmed on installed version.
- **Hermes — NOT_READY:** official full CLI has dependency-runtime issues (missing ruamel); minimal runner permits zero loaded tools but native-provider routing / auxiliary suppression / fallback isolation are unverified. Minimal `--version` returned v0.0.0 versus expected v0.21.7. Dummy-key preflight unexpectedly reported one external OpenRouter **401 Missing Authentication** despite requested loopback base URL, and exited 0 with `Completed: False`. Treat this as FAIL, not inference success. No real key used.
- **Preserved:** Claude/AUTO independently accepted P5.2 PASS, not rerun; Pi settings, `scripts/commander.mjs`, canonical shared Skills, local sessions/auth/runtime/PATH, historical branches and user stashes untouched. Only two NOT_READY reason strings, two offline tests and P5.3 documentation changed during implementation.
- **Independent review:** 6/6 focused harness tests PASS; Pi extension loader PASS; 0 model/API/network calls during reviewer check. In the implementation batch, Codex used only local HTTP fixtures, Hermes reported one unauthenticated rejected 401; authenticated inference 0. Provider billing remains unverified.

## NEXT — no new implementation authorized

Do not repeat P5.3 audits or enable Codex/Hermes just because they are installed. Any future work on official Windows read-isolation for Codex or coherent isolated Hermes runtime needs a new user-approved scope. No generic Skill adapter, unsafe OS change, WSL/Docker install, vendor patch, or arbitrary project forwarding. See final decision in `docs/work-orders/P5_3_CODEX_HERMES_WORKERS.md`. Keep `AGENTS.md` delta-context/Git-first workflow: user direction, GPT architecture, Codex implementation, Claude independent verification, final main release gate.
