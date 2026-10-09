# Agentco clean baseline (bootstrap)

Historical evidence from 2026-10-04: paths and versions below describe the original baseline. Current Pi 1.0.4 uses `pi-dev/`; see [HARNESS.md](../capabilities/HARNESS.md) and [WORK_PLAN.md](../WORK_PLAN.md).

Date: 2026-10-04 · Status: PASS (see SMOKE_TEST.md)

Fresh start. Nothing from the previous pi-dev implementation was ported: no BrowserRuntime / BrowserExtension, no custom skills, no custom extensions, no custom model routing. Agentra was not touched.

## Pi

| Item | Value |
|---|---|
| Package | `@earendil-works/pi-coding-agent` (official, from `earendil-works/pi`) |
| Version | **1.0.2** (npm `latest` dist-tag at install time; exact-pinned) |
| Upstream tag / commit | `v1.0.2` / `cd32f7725fdbddbaecdff5b1e68491563394e0ca` (matches the npm package `gitHead`) |
| Registry integrity | `sha512-3ZdIghMSELMGV3sKi5iASOb1Jwb696fLjmNu0aezaqDxTLLWWoRpqBYkGxJ1CgAMCbtfqXWEF0lcRrlVXmiEGQ==` (present in `package-lock.json`) |
| Install method | plain npm dependency (no vendoring, no submodule, no fork, no patches) |
| Pi core modifications | **0** — installed straight from the registry tarball; no patch tooling, no edits under `node_modules` |
| Node | v24.20.0 (Pi requires >=22.19.0) |

Why npm instead of a submodule: upstream publishes a prebuilt bundle (`bin: pi -> dist/bundle/cli.js`), so there is nothing to build. Updating is a version bump (below). A submodule would need the monorepo build and was the source of earlier churn.

Not run on purpose: `npm install-scripts approve` — npm reported 3 transitive packages with install scripts not yet approved (esbuild, @google/genai, protobufjs); Pi ran and passed smoke without them.

## Layout (minimum)

```
package.json / package-lock.json   pins Pi 1.0.2
pi-home/settings.json              tracked: default provider + model (the only tracked file in pi-home/)
pi-home/*                          ignored: auth.json, models-store.json, sessions, etc. (Pi runtime state)
scripts/env.mjs                    .env loader (whitelisted keys only)
scripts/pi.mjs, pi.cmd             thin launcher
scripts/smoke.mjs                  baseline smoke test
.env.example                       key names only
.env                               real keys, gitignored, never printed
```

## How it runs

`node scripts/pi.mjs [pi args]` (or `pi.cmd`) does exactly two things, then execs upstream Pi unchanged:
1. Reads `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`, `GROQ_API_KEY`, `GROQ_BASE_URL` from `.env` into the child process environment (existing process env wins).
2. Sets `PI_CODING_AGENT_DIR=<repo>/pi-home` so Pi state is repo-local and independent of `~/.pi`.

Paths are derived from the script location; no absolute paths are stored anywhere.
Provider auth uses Pi's built-in env-var support (`OPENROUTER_API_KEY`, `GROQ_API_KEY`); no custom provider code.

## Update procedure

```
# edit the exact version in package.json, then
npm install
node scripts/smoke.mjs
```
Record the new version/tag/commit here.

## Known gaps / not done

- Interactive TUI session was not driven by a human in this step; verification used Pi print/JSON mode (`-p --mode json`) which runs the same agent loop and tools.
- The retired pi-dev line is preserved only as the tag `archive/pi-dev-pre-rebootstrap` (`37b280c`); it is not part of `main`.
- Change history: see `PATCH_NOTES.md`.
