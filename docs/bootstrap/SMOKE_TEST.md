# Smoke test

Run: `node scripts/smoke.mjs [openrouter|groq|all]` (exit 0 = all checks pass). Uses Pi print/JSON mode with `--no-extensions --no-skills --no-context-files`, so only upstream Pi behaviour is measured. Writes only to `smoke-output/` (gitignored). Prints no secrets.

Checks per provider/model:
1. auth key present (presence only)
2. model discovery (`--list-models`)
3. simple text response (`PONG`)
4. fixed model: every assistant message used exactly the requested provider/model
5. session start/exit: JSON `session` event, exit code 0, one session `.jsonl` written to `smoke-output/sessions/`
6. tool call: `read` of `smoke-output/fixture.txt` executed without error and returned the marker
7. file content used in the final answer

## Results — 2026-10-04, Pi 1.0.2

| Provider / model | Checks | Result |
|---|---|---|
| openrouter / `nvidia/nemotron-3-ultra-550b-a55b:free` (primary) | 7/7 | **PASS** |
| groq / `openai/gpt-oss-120b` (secondary) | 7/7 | **PASS** |

Default launch without flags (`node scripts/pi.mjs -p ...`) resolved to `openrouter/nvidia/nemotron-3-ultra-550b-a55b:free` and answered — confirms `pi-home/settings.json` default works.

## Not covered

Interactive TUI by a human; multi-turn sessions; edit/write/bash tools; long context; rate-limit behaviour under load.
