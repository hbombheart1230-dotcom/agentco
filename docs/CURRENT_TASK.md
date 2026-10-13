# Agentco Current Task — P5.4 Codex/Hermes native Workers: implemented, awaiting independent review

Canonical `C:\Agentco`, branch `feature/p5-4-worker-root-cause`. Follow `AGENTS.md`. Read only the **Execution result** in `docs/work-orders/P5_4_WORKER_RUNTIME_ROOT_CAUSE.md` plus `pi-dev/extensions/harness-delegation.ts`, the P5.4 block of `scripts/commander.mjs` and `scripts/harness-delegation.test.mjs`.

## State

P5.4 PASS for the fixed synthetic `add42` job only. Codex 0.162.1 (`features.view_image=false` leaves zero I/O tools) and Hermes (installed venv `hermes.exe -z`, child config with `custom` provider, zero toolsets, no auxiliary/memory/fallback) each returned `ADD42=42` on the exact free `nvidia/nemotron-3-super-120b-a12b:free` route through the existing Pi `/harness` and `agentco_delegate`. Claude/AUTO is unchanged (`auto` selects Claude only). P5.3's blockers were a wrong Codex feature key and a Hermes launcher/venv mismatch, not model incompatibility.

4 authenticated CLI prompts were used; physical HTTP counts and billing are unverified. TUI, Skills, edit tasks and other PCs are NOT RUN. General-project WORKER READY = NO.

## Next handoff

One independent Claude offline review of this commit and ignored `results/p5-4/` (no provider calls). GPT/user decide release and main merge. The executor does not merge main.
