# Laptop 2 migration

## Roles

| Machine | Role |
|---|---|
| Current machine | Created and pushed the clean baseline only. **Not** the primary development host from now on. |
| **Laptop 2** | **Canonical Agentco development machine.** All extension/skill experiments and development happen here. |

Rule: Git carries source; each machine keeps its own secrets and runtime state.

| What | Where it lives |
|---|---|
| Canonical source | GitHub `origin/main` (`https://github.com/hbombheart1230-dotcom/agentco`) |
| Pi version | pinned by `package.json` + `package-lock.json` (Pi 1.0.2, upstream-unmodified) |
| Secrets | Laptop 2 local `.env` (git-ignored, never copied through Git) |
| Runtime/state | Laptop 2 local: `pi-home/` (except tracked `settings.json`), `node_modules/`, `smoke-output/` — all git-ignored and created on first run |

Do **not** copy the old machine's folder, `.pi-personal`, browser profiles or finance login state. They are not dependencies of this baseline (the repo contains no reference to them) and stay on the old machine untouched.

## Prerequisites

- Windows with **Node.js >= 22.19.0** (baseline verified on 24.20) and npm
- **Git** (Git for Windows; Pi's `bash` tool uses Git Bash)
- Network access to npm, OpenRouter and Groq

## Steps

```bat
git clone https://github.com/hbombheart1230-dotcom/agentco.git
cd agentco
npm install
copy .env.example .env
```

Edit `.env` (repo root, git-ignored) and fill in the values:

```
OPENROUTER_API_KEY=<your OpenRouter key>
GROQ_API_KEY=<your Groq key>
```

Optional: `OPENROUTER_BASE_URL`, `GROQ_BASE_URL` (only to override Pi's defaults). Only these four names are read.

`npm install` may print "install-scripts ... not yet covered by allowScripts" for esbuild, `@google/genai` and protobufjs. This is expected; the baseline passes without approving them.

## Run

```bat
pi.cmd                       :: interactive Pi (default: openrouter / nvidia/nemotron-3-ultra-550b-a55b:free)
pi.cmd --provider groq --model openai/gpt-oss-120b
node scripts\pi.mjs --version
```

`pi.cmd` calls `scripts/pi.mjs`, which loads `.env` into the Pi process and sets `PI_CODING_AGENT_DIR` to `<repo>/pi-home`. Pi creates the rest of `pi-home/` on first run.

## Verify

```bat
node scripts\smoke.mjs
```

Expected (7 checks per provider, ends with `14/14 checks passed`, exit code 0):

```
== openrouter/nvidia/nemotron-3-ultra-550b-a55b:free
PASS  auth key present / model discovery / text response / fixed model (no routing)
PASS  session start/exit / tool call (read) / file content used in answer
== groq/openai/gpt-oss-120b
PASS  (same 7 checks)
14/14 checks passed
```

One provider only: `node scripts\smoke.mjs openrouter` or `groq`. The free OpenRouter model can rate-limit; the script retries once, then re-run later.

## Baseline facts (for comparison)

- Pi 1.0.2 (`@earendil-works/pi-coding-agent`), upstream tag `v1.0.2`, commit `cd32f7725fdbddbaecdff5b1e68491563394e0ca`, 0 modifications
- Tags: `baseline-pi-1.0.2` (this baseline), `archive/pi-dev-pre-rebootstrap` (retired pi-dev line, archive only, never merged into `main`)
- No custom extensions, skills, browser code, memory or model routing are installed

## Do not

Commit `.env`; copy `node_modules` or `pi-home` between machines; put machine-specific absolute paths into code, config or smoke tests (paths are derived from the script location).
