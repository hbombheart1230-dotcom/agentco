# Fresh-machine / Laptop 2 setup

Git carries source; each machine keeps its own secrets, sessions and browser state. Pi is upstream-unmodified 1.0.4, pinned by the npm manifest and lockfile.

Prerequisites: Windows PowerShell, Git (including Git Bash for Pi's bash tool), Node >=22.19.0 and npm, network access to npm/provider endpoints, Microsoft Edge for browser MCP. Python LSP requires pyright; TypeScript LSP requires a project-local TS7 package (see [HARNESS.md](../capabilities/HARNESS.md)).

```powershell
git clone https://github.com/hbombheart1230-dotcom/agentco.git
cd agentco
powershell -NoProfile -File scripts/bootstrap.ps1 -InstallPyright
# Only if .env is absent:
Copy-Item .env.example .env
# Fill provider keys locally; never print or commit values.
.\pi.cmd
node scripts/smoke.mjs
powershell -NoProfile -File scripts/doctor.ps1
```

Bootstrap uses npm ci and restores pinned LSP/skill-creator packages through Pi. Without -InstallPyright it checks the existing prerequisite and fails clearly if missing. It never overwrites .env. Missing .env is a warning; provider smoke tests require configured keys. Doctor warns if Edge or .env is absent and fails on missing required dependencies/configuration. Subprocess failures are reported.

The launcher sets `PI_CODING_AGENT_DIR=<repo>/pi-dev` from its own script location. Do not put an absolute machine-specific path in tracked configuration. Expected smoke: OpenRouter 7/7 + Groq 7/7 = 14/14.

On an existing checkout, preserve original Pi runtime and archived `archive/pi-dev-pre-rebootstrap` history. P1 renames tracked assets only; it does not remove or copy old auth/sessions, node_modules, .pi-personal or browser profiles. New runtime packages come from online sources. Session/auth migration is a separate local choice; never copy credentials into conversation or Git.
