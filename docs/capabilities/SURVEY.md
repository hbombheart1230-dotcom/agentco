# Agentco Phase 1 — Capability Survey

- Survey date: **2026-10-05** (all "current" claims are as of this date)
- Host: Laptop 2 (Windows 11), baseline `baseline-pi-1.0.2`, smoke 14/14 PASS before this survey started
- Principle: **BUILD LAST**. Priority order: (1) Pi built-in → (2) Pi package/extension/skill → (3) MCP/CLI → (4) mature OSS → (5) thin Agentco adapter → (6) custom.
- Scope guard: **nothing was installed, no code or wrapper was written, the old BrowserRuntime was not restored, Agentra was not touched, OpenClaw is a reference only.**
- Companion docs: [SHORTLIST.md](SHORTLIST.md) (ranked picks + first trial batch), [OVERLAP.md](OVERLAP.md) (what collides with what).

## 0. Method and evidence limits

| Source | Used for |
|---|---|
| Installed Pi 1.0.2 (`node_modules/@earendil-works/pi-coding-agent`: `docs/`, `examples/`, `CHANGELOG.md`) | Built-in inventory (authoritative for this baseline) |
| npm registry (`registry.npmjs.org`, `api.npmjs.org`) | version, license, publish dates, dependencies, peer deps, install scripts, monthly downloads, README text |
| GitHub (`api.github.com`, `raw.githubusercontent.com`, repo pages) | stars, last push, archived flag, README claims |
| Vendor pages (Obsidian help, pi.dev/packages, googleworkspace/cli, OpenClaw) | product status, platform claims |

Limits you should know about:

1. **GitHub API rate limit (HTTP 403) was hit mid-survey.** Stars/push dates are verified for the Pi packages and ~8 generic repos; for the rest (`modelcontextprotocol/servers`, `taylorwilsdon/google_workspace_mcp`, `mem0`, `tavily-mcp` repo, etc.) only npm/PyPI metadata is verified. Those cells say *npm-only*.
2. **Windows support is graded by evidence, not by testing.** Nothing was run. Legend: **DOC** = README/docs state Windows support; **LIKELY** = pure Node/TS or portable binary with no platform claim against it; **?** = no evidence found; **NO** = excluded by package metadata or docs.
3. npm monthly downloads are shown but treated as weak evidence (several packages show downloads far out of proportion to GitHub stars, e.g. `pi-background-tasks` 115k/mo vs 32★; bundling and CI installs inflate counts).
4. The `pi-package` npm keyword currently matches **11,224** packages. Most are personal, duplicate, or abandoned. Selection below is by capability fit, Pi-1.0 compatibility, maintenance and license, not by popularity alone.
5. **Pi 1.0 namespace check.** Pi 1.0 moved to `@earendil-works/*`. Packages whose peer deps still name `@mariozechner/*` (`pi-mcp-extension`, `pi-browser-harness`, `pi-google-workspace`) predate 1.0 and are treated as incompatible until proven otherwise.

## 1. Pi 1.0.2 built-in inventory (verified from the installed package)

Source: `docs/cli.md`, `docs/slash-commands.md`, `docs/settings.md`, `docs/mcp.md`, `docs/codemode.md`, `docs/security.md`, `docs/packages.md`, `docs/skills.md`, `docs/rpc.md`, `docs/windows.md`, `examples/`.

### 1.1 Built-in tools
`read`, `bash`, `powershell` (native Windows only), `edit`, `write`, `grep`, `find`, `ls`. Default on: `read`, `bash`, `edit`, `write`. `powershell` replaces/augments `bash` via `defaultTools` (`docs/windows.md`). Bash on Windows needs Git Bash (installed on Laptop 2 with Git for Windows).

### 1.2 Built-in extensions (load by default; `builtin:<name>`)
| Name | What it gives | Notes |
|---|---|---|
| `builtin:mcp` | MCP client: stdio + streamable HTTP, OAuth (DCR, CIMD, registered client), `pi mcp add/list/remove/login/logout`, `/mcp`, resources tools (`list_mcp_resources`, `read_mcp_resource`), per-server/per-tool **exposure** (`codemode`/`deferred`/`direct`/`hidden`), tool annotations exposed to permission extensions | Config in `~/.pi/agent/mcp.json` (user) / `.pi/mcp.json` (project, trust-gated). Tokens in `~/.pi/agent/mcp-auth.json` (file, not keychain). SSE transport unsupported. **Installing an extension that registers `/mcp` (e.g. `pi-mcp-adapter`) replaces this.** |
| `builtin:codemode` | `codemode` tool: model writes JS run in a QuickJS sandbox that calls other tools in parallel, filters big results, `store/load` state, `models.classify()`, `models.generateImages()` | Off by default; enable with `"defaultTools": ["+codemode"]`. Auto-activates when an MCP server with `codemode` exposure connects. |
| `builtin:tool-search` | `tool_search`: BM25 search over undeclared tools, declares matches next turn | Off by default; auto-activates for `deferred` MCP servers. Keeps MCP schemas out of context. |
| `builtin:llama.cpp` | `/llama` provider for a llama.cpp router | Not relevant now. |

### 1.3 Sessions, context, compaction
`/new /resume /name /session /tree /fork /clone /compact /import /export /share`; session JSONL tree with branch navigation; automatic + manual compaction with structured summary (Goal/Constraints/Progress/Decisions/Next/Critical Context) and **branch summarization**; extension hooks to replace compaction (`custom-compaction.ts`, `trigger-compact.ts` examples). `/session` shows statistics. There is **no built-in context-composition view** (what fills the window) — only stats.

### 1.4 Instructions, skills, prompts, packages
- Context files: `AGENTS.md`/`AGENTS.override.md`/`CLAUDE.md` from agent dir, cwd and parents (load **regardless of project trust**). This is Pi's only built-in "memory" — static, user-edited.
- Skills: implements the [Agent Skills spec](https://agentskills.io/specification); `/skill:name`; `.agents/skills` discovery; progressive disclosure (name+description in prompt, body on demand).
- Prompt templates, themes, `--append-system-prompt`.
- Packages: `pi install|remove|list|update|config` from `npm:`, `git:`, URL, local path; `-l` for project scope; version/tag pinning; `pi -e <pkg>` to try without persisting; resource filters (`+path`, `-path`, `!glob`). Extensions run in-process with full user permissions.
- Discovery: the `pi-package` npm keyword feeds the **pi.dev/packages** gallery (search, type filter, sort by downloads/recency). The gallery shows **no security/verification badges**.

### 1.5 Security model (docs/security.md, docs/containerization.md)
- **Pi has no built-in permission prompts or sandbox.** Docs say explicitly that transcript-watching and project trust are not security boundaries; recommended boundary is a container/VM/sandbox.
- **Project trust**: `.pi/settings.json`, `.pi/mcp.json`, `.pi/extensions|skills|prompts|themes`, `.pi/SYSTEM.md`, project `.agents/skills` need trust; `/trust`, `~/.pi/agent/trust.json`, `--approve/--no-approve`, `defaultProjectTrust`, extension `project_trust` event.
- Extension hooks `tool_call`/`tool_result` can block/modify calls (applies to MCP tools too; MCP annotations `readOnlyHint`/`destructiveHint` are surfaced to such hooks).
- Isolation guidance: Docker, Docker Sandboxes, OpenShell, Gondolin micro-VM extension (shipped as an *example*).

### 1.6 Programmatic control surface
`pi -p` (print), `--mode json`, `--mode rpc` (JSONL protocol, extension-UI sub-protocol), TypeScript SDK (`docs/sdk.md`; SDK sessions do **not** auto-load built-in extensions), `pi auth check/print-*`, `--offline`. This is the supported foundation for any Control/Web UI, scheduler, or headless job — no Pi patch required.

### 1.7 Shipped *examples* (inside the npm package, **not enabled**, not a supported feature)
`subagent/` (944-line `index.ts` + agents/prompts), `plan-mode/`, `todo.ts`, `permission-gate.ts`, `protected-paths.ts`, `confirm-destructive.ts`, `sandbox/` (279 lines, `@anthropic-ai/sandbox-runtime`), `gondolin/`, `ssh.ts`, `handoff.ts`, `git-checkpoint.ts`, `file-trigger.ts`, `preset.ts`, `custom-compaction.ts`, `jev-router.ts`, etc. Using one means **copying it and owning it** — they are references, not products.

### 1.8 What Pi 1.0.2 does **not** have (confirmed by docs/CLI/slash-command listing)
Web search/fetch · browser automation · desktop/computer-use · persistent/semantic memory · subagents (README: "skips features like sub-agents and plan mode") · background tasks · scheduler/recurring jobs · context-composition view · permission prompts/policy · sandbox · Obsidian/Google integrations · web/control UI · package trust/verification.

### 1.9 Built-in coverage per requested area
| Area | Pi 1.0.2 built-in | Gap that remains |
|---|---|---|
| Web/search/research | none (only `bash` + `curl`) | search, fetch→markdown, PDF |
| Browser automation | none | all |
| Desktop/computer-use | `powershell` tool only | all |
| Memory | `AGENTS.md` context files; sessions/compaction | cross-session recall, semantic search |
| Subagents | example only | all |
| Background tasks | none (`bash` blocks) | durable shell/agent tasks |
| Scheduler | none (`pi -p`/RPC are the hooks) | cron, persistence, catch-up |
| MCP | **full client (ADOPT as-is)** | none for Agentco's likely needs |
| Context observability | `/session` stats, `/compact`, `/tree` | composition/injection view |
| Permissions/security | project trust, tool-call hooks, container docs | policy engine, prompts, sandbox on Windows |
| Obsidian | `read/write/grep/find/ls` already work on a vault folder | CLI-level semantics (backlinks, properties, search index) |
| Google Workspace | MCP client | the Google tool itself |
| Control/Web UI | TUI, RPC, JSON, SDK | web front end |
| Package discovery | `pi install`, gallery, keyword | trust/vetting |

## 2. Candidate tables

Column notes: **Link** = how it connects to Pi. **Core mod** = Pi core modification needed (all candidates: **no**, unless stated). **Owned code** = Agentco-maintained lines if adopted as described. Verdicts: `ADOPT` use now · `TRIAL` install and test in a controlled batch · `WATCH` revisit later · `REJECT` do not use.

### 2.1 Web / search / research

| Candidate | Kind / URL | Provides | Windows | Link · Core mod | License · Maintenance | Deps · Security/credential | Owned code | Verdict |
|---|---|---|---|---|---|---|---|---|
| **pi-web-access** 0.35.0 | Pi extension · [npm](https://www.npmjs.com/package/pi-web-access) · [GitHub nicobailon/pi-web-access](https://github.com/nicobailon/pi-web-access) | search (Exa zero-config via Exa MCP, optional OpenAI/Codex, Brave, Tavily, Firecrawl, Jina, SearXNG…), URL→markdown, PDF, GitHub repo clone, YouTube/video understanding | **DOC** (platform badge "Windows*"; Windows DPAPI cookie code present, opt-in) | `pi install npm:pi-web-access`; no core mod | MIT · 1,581★ · pushed 2026-10-04 · 44 releases since 2026-01 · ~590k dl/mo | unpdf, undici, defuddle, linkedom, turndown, @mozilla/readability, @modelcontextprotocol/sdk. Queries go to third-party search providers (Exa by default, **no key needed**). Browser-cookie extraction is **opt-in** (`allowBrowserCookies`). Broad surface (video, GitHub clone) | ~0 (config) | **TRIAL** |
| **pi-web-search** 1.6.0 | Pi extension · [npm](https://www.npmjs.com/package/pi-web-search) · [GitHub ttttmr/pi-web-search](https://github.com/ttttmr/pi-web-search) | provider-**native** search (Gemini + URL Context, xAI Grok, OpenAI Responses, Anthropic, OpenCode Zen) | LIKELY (0 deps, TS) | `pi install`; no core mod | MIT (npm; GitHub license field empty) · 33★ · published 2026-09-16 | 0 deps. Needs a provider that offers native search — Agentco's fixed models (OpenRouter Nemotron, Groq gpt-oss) don't | ~0 | **WATCH** |
| **Brave Search MCP** 2.1.4 | MCP · [npm @brave/brave-search-mcp-server](https://www.npmjs.com/package/@brave/brave-search-mcp-server) · [GitHub brave/brave-search-mcp-server](https://github.com/brave/brave-search-mcp-server) | web/news/image/local search | LIKELY (Node stdio) | built-in `pi mcp add` (stdio); no core mod | MIT · vendor-published · 93 releases · published 2026-09-17 · ~89k dl/mo | zod, dotenv, express, commander, MCP sdk. API key expected (vendor-issued; **not re-verified**) → key in `${ENV}` only | 0 | **WATCH** (fallback if pi-web-access is rejected) |

Skipped (noted so they are not re-researched): `donsetch` (AGPL-3.0, `postinstall` fetches a Rust binary → **REJECT**), `@agntn/web` (5★, Node ≥24), `@mrclrchtr/supi-web` (jsdom stack, part of a larger suite), `@ollama/pi-web-search` (Ollama-account-bound), `pi-web-fetch` (old, headless-Chrome based).

### 2.2 Browser automation

| Candidate | Kind / URL | Provides | Windows | Link · Core mod | License · Maintenance | Deps · Security/credential | Owned code | Verdict |
|---|---|---|---|---|---|---|---|---|
| **Playwright MCP** `@playwright/mcp` 0.0.83 | MCP · [npm](https://www.npmjs.com/package/@playwright/mcp) · [GitHub microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) | accessibility-snapshot browser control; `--isolated` (in-memory profile), `--storage-state`, `--extension` (attach to running Edge/Chrome) | LIKELY (Node/Playwright; not tested here) | built-in MCP: `pi mcp add playwright -- npx -y @playwright/mcp@<ver> --isolated`; exposure `codemode`/`deferred` keeps schemas out of context; no core mod | Apache-2.0 · Microsoft · 37.8k★ · pushed 2026-09-28 · ~29M dl/mo | playwright, playwright-core (downloads browsers). Persistent/`--extension` modes expose logged-in sessions — use `--isolated` by default. README itself says CLI+skill workflows are more token-efficient than MCP | 0 | **TRIAL** |
| **agent-browser** CLI 0.38.2 (+ Pi wrapper `pi-agent-browser-native` 0.9.2) | CLI · [npm](https://www.npmjs.com/package/agent-browser) · [GitHub vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser); wrapper [npm](https://www.npmjs.com/package/pi-agent-browser-native) · [GitHub fitchmultz/pi-agent-browser-native](https://github.com/fitchmultz/pi-agent-browser-native) | native Rust CLI (Windows x64 build listed), compact snapshots, auth profiles; wrapper adds a Pi-native tool with secret redaction | CLI: **DOC** (Windows x64 native; Windows private-desktop launch). Wrapper: **owner waived Windows qualification on 2026-09-21** (failures non-blocking) | CLI used via `bash` + skill = no extension; wrapper = `pi install`. No core mod | CLI Apache-2.0 · 43.5k★ · pushed 2026-10-03 · ~7M dl/mo. Wrapper MIT · 230★ · 107 releases in 6 months | CLI: `postinstall` script, Chrome. Wrapper **needs Node ≥ 24.21.0 (Laptop 2 has 24.19.0)**, Pi ≥ 1.0.0, upstream CLI on PATH, optional ffmpeg. Auth profile feature stores credentials — keep off | CLI 0; wrapper 0 | **WATCH** (CLI) / **WATCH** (wrapper: Windows waived + Node floor) |
| **pi-browser-use** 0.12.11 | Pi extension + skill · [npm](https://www.npmjs.com/package/pi-browser-use) · [GitHub 0xPlayerOne/pi-browser-use](https://github.com/0xPlayerOne/pi-browser-use) | opinionated browser tools over Google's `chrome-devtools-mcp` (Apache-2.0, 52.9k★, ~8M dl/mo); persistent Pi browser profile in `~/.pi/browser-profile`; optional existing-Chrome mode | ? (no Windows statement found) | `pi install`; no core mod | MIT · **4★ · created 2026-09-05** · 51 releases in 1 month | chrome-devtools-mcp, MCP sdk; Node ≥ 24; persistent profile holds cookies | 0 | **WATCH** (too young; underlying chrome-devtools-mcp is solid and usable directly via built-in MCP if DevTools-style debugging is wanted) |

Skipped: `betterwright` (needs Bun + own BetterChromium binary download; strong policy ideas, but 80 releases in 2.5 months and a separate runtime), `pi-chrome` (drives the **signed-in** Chrome profile — high credential exposure), `@onkernel/browser-loop` (Kernel cloud browsers — third-party service; **REJECT** for default use), `pi-browser-harness` (**pre-1.0 `@mariozechner` namespace → REJECT**), `specpi-browser-qa` (QA-focused).

### 2.3 Desktop / computer-use

| Candidate | Kind / URL | Provides | Windows | Link · Core mod | License · Maintenance | Deps · Security/credential | Owned code | Verdict |
|---|---|---|---|---|---|---|---|---|
| **@injaneity/pi-computer-use** 0.5.1 | Pi extension · [npm](https://www.npmjs.com/package/@injaneity/pi-computer-use) · [GitHub injaneity/pi-computer-use](https://github.com/injaneity/pi-computer-use) | observe/control desktop apps via OS accessibility APIs (macOS, **Windows**, Linux) | **DOC** (Windows via platform accessibility APIs; needs interactive desktop session) | `pi install`; no core mod | MIT · 2,028★ · pushed 2026-10-04 · 21 releases since 2026-04 · ~4k dl/mo | 0 runtime deps but **`postinstall` runs `scripts/setup-helper.mjs`** (review before install). Full desktop control = highest blast radius in this survey | ~0 | **TRIAL** (later batch, after permission layer is proven) |
| **Windows-MCP** (`windows-mcp` 0.8.7) | MCP · [PyPI](https://pypi.org/project/windows-mcp/) · [GitHub CursorTouch/Windows-MCP](https://github.com/CursorTouch/Windows-MCP) | Windows-only computer-use MCP server | **DOC** (Windows 10/11 only) | built-in MCP (stdio; also remote with bearer token) | MIT · 7.7k★ · pushed 2026-10-04 | **PyPI metadata `requires_python >=3.14`; Laptop 2 has Python 3.12/3.10** → needs `uv`/new Python. Remote mode = network-exposed control surface | 0 | **WATCH** |
| **@amaster.ai/pi-computer-use** 0.1.22 (Cua Driver) | Pi extension · [npm](https://www.npmjs.com/package/@amaster.ai/pi-computer-use) · [GitHub TGYD-helige/pi](https://github.com/TGYD-helige/pi) | Rust Cua driver across macOS/Linux/Windows, recording, window tools, `confirmDangerousActions` | DOC (Linux/Windows daemon in interactive session) | `pi install` | Apache-2.0 · monorepo 78★ · **every package in the monorepo is version 0.1.22 with 79–106 releases** (bulk/automated publishing) | signed precompiled runtime via optionalDependencies; optional vision-model call sends screenshots to a provider | 0 | **WATCH** |

Reference only: [trycua/cua](https://github.com/trycua/cua) (MIT, 28k★, pushed 2026-10-04) is the upstream of the Cua driver.

### 2.4 Memory

| Candidate | Kind / URL | Provides | Windows | Link · Core mod | License · Maintenance | Deps · Security/credential | Owned code | Verdict |
|---|---|---|---|---|---|---|---|---|
| **pi-memory** 0.4.2 | Pi extension · [npm](https://www.npmjs.com/package/pi-memory) · [GitHub jayzeng/pi-memory](https://github.com/jayzeng/pi-memory) | durable facts + daily log + scratchpad as **plain Markdown** in `~/.pi/agent/memory/`; optional semantic search via `qmd` | **DOC-ish** (README has a Windows `.cmd`/`.ps1` shim workaround for qmd) | `pi install`; no core mod | MIT · 181★ · pushed 2026-09-21 · last release 2026-08-11 | 0 deps; **`postinstall` script**; optional `@tobilu/qmd` (better-sqlite3, node-llama-cpp, sqlite-vec — native/model downloads). Memory is human-readable and git-diffable; no secret scanner | ~0 | **TRIAL** (batch 2) |
| **pi-hermes-memory** 0.9.10 | Pi extension · [npm](https://www.npmjs.com/package/pi-hermes-memory) · [GitHub chandra447/pi-hermes-memory](https://github.com/chandra447/pi-hermes-memory) | policy-only memory, SQLite FTS5 session search, auto-consolidation, procedural skills, **secret scanning** (blocks API keys/tokens from being saved) | ? (native `better-sqlite3`; Windows prebuilds not documented) | `pi install` | MIT · 470★ · 64 releases in 5 months · 32 open issues | `better-sqlite3` native addon (ABI mismatch risk), strip-ansi | ~0 | **WATCH** (secret scanning is attractive; native dep + feature breadth is the cost) |
| **gentle-engram / Engram** 0.2.0 | Pi plugin + Go binary · [npm](https://www.npmjs.com/package/gentle-engram) · [GitHub Gentleman-Programming/engram](https://github.com/Gentleman-Programming/engram) | local SQLite+FTS5 memory in one Go binary, cross-agent (MCP), TUI, **optional** cloud replication | DOC (README points to `docs/INSTALLATION.md` for Windows) | `pi install` + engram binary | MIT · 7,033★ · pushed 2026-10-04 · 93 open issues | separate binary + MCP; cloud sync is opt-in and must stay off | ~0 | **WATCH** |

Skipped: `pi-observational-memory` (682★, MIT, 0 deps — memory via tiered *compaction*; overlaps Pi compaction, **WATCH** if long-session memory becomes the problem), `@amaster.ai/pi-memory-mem0` (Mem0 + Qdrant services), `@modelcontextprotocol/server-memory` (reference knowledge-graph MCP; license text non-SPDX — read before use), `basic-memory` (AGPL-3.0 → avoid), `om-memory-system`, `pi-dejavu-memory`.

### 2.5 Subagents

| Candidate | Kind / URL | Provides | Windows | Link · Core mod | License · Maintenance | Deps · Security/credential | Owned code | Verdict |
|---|---|---|---|---|---|---|---|---|
| **pi-subagents** 0.75.0 | Pi extension · [npm](https://www.npmjs.com/package/pi-subagents) · [GitHub nicobailon/pi-subagents](https://github.com/nicobailon/pi-subagents) | single-agent delegation + scripted multi-agent workflows, background children, FleetView/`/subagents-fleet`, built-in agents (researcher needs pi-web-access in the child), skills + prompts | ? (no Windows statement in README) | `pi install`; no core mod | MIT · 3,844★ · pushed 2026-10-04 · 142 releases since 2026-01 · ~593k dl/mo · 3 open issues | jiti, yaml, acorn, undici. Children are Pi processes with the parent's credentials and tools — pair with a permission layer | ~0 (agent definitions are Markdown) | **TRIAL** |
| **@tintinweb/pi-subagents** 0.19.0 | Pi extension · [npm](https://www.npmjs.com/package/@tintinweb/pi-subagents) · [GitHub tintinweb/pi-subagents](https://github.com/tintinweb/pi-subagents) | Claude-Code-like sub-agents, `SubagentWorkflow` JS orchestration, resume, Claude Code agent-file compatibility, depth cap | ? | `pi install` | MIT · 1,247★ · pushed 2026-09-03 · **137 open issues** · last release 2026-08-27 · needs Pi ≥ 0.84 | `croner` (adds scheduling surface) | ~0 | **WATCH** |
| Pi example `subagent/` | Pi built-in **example** · `examples/extensions/subagent` in the installed package | delegation with isolated context windows | LIKELY | copy into `.pi/extensions` | upstream-maintained example, but copying makes it **Agentco code** (≈1,080 lines TS + agent prompts) | none | ~1,000+ | **WATCH** (reference / fallback only) |

Skipped: `@henryqw/pi-subagent` (monorepo of 6 scoped internal deps, 12★), `@agwab/pi-subagent` (sandbox-runtime dep, 49★), `@quintinshaw/pi-dynamic-workflows` (100s-of-agents fan-out; cost risk), `gentle-pi`, `agent-fleet`.

### 2.6 Background tasks

| Candidate | Kind / URL | Provides | Windows | Link · Core mod | License · Maintenance | Deps · Security/credential | Owned code | Verdict |
|---|---|---|---|---|---|---|---|---|
| **pi-background-tasks** 2.6.9 | Pi extension · [npm](https://www.npmjs.com/package/pi-background-tasks) · [GitHub ismailsaleekh/pi-background-tasks](https://github.com/ismailsaleekh/pi-background-tasks) | durable `bg_run` shell tasks (task id + output path), read-only delegated agents, "attested" local Pi runs, workflows via child Pi processes | **DOC-ish** (README has a "windows-shell" section) | `pi install` | **ISC** · 32★ · pushed 2026-09-30 · 33 releases since 2026-05 · 115k dl/mo (**disproportionate to stars**) | turndown. `bg_run` is **not sandboxed**. Its `pi.extensions` list includes `anthropic-attribution.js` — **read the source before any install** | ~0 | **WATCH** (batch 3; overlaps pi-subagents background children) |
| **pi-better-background-tasks** 0.6.5 | Pi extension · [npm](https://www.npmjs.com/package/pi-better-background-tasks) · [GitHub 1aboveio/pi-better-harness](https://github.com/1aboveio/pi-better-harness) | background shell tasks, watchers, logs, status | ? | `pi install` | MIT · 8★ · 29 open issues · part of a multi-package "harness" | 0 deps | ~0 | **WATCH** |

Skipped: `pi-patty-bg-tasks` (6★, 24 open issues, last push 2026-08-01), `@deathbeam/pi-delegate` (subagent-as-background duplicate).

### 2.7 Scheduler / recurring jobs

Key structural fact: every Pi scheduler package below is **in-process** — jobs fire only while a Pi session is running (stated by `@jl1990/pi-scheduler`; the others show no daemon). A true "runs while Pi is closed" scheduler is **OS-level** (Windows Task Scheduler launching `pi -p …` / RPC) which needs **no package**.

| Candidate | Kind / URL | Provides | Windows | Link · Core mod | License · Maintenance | Deps · Security/credential | Owned code | Verdict |
|---|---|---|---|---|---|---|---|---|
| **pi-schedule-prompt** 0.4.1 | Pi extension · [npm](https://www.npmjs.com/package/pi-schedule-prompt) · [GitHub tintinweb/pi-schedule-prompt](https://github.com/tintinweb/pi-schedule-prompt) | recurring + one-shot prompts into main agent or subagent; jobs persisted in `.pi/schedule-prompts.json` | LIKELY (croner, JSON) | `pi install` | MIT · 116★ · last release **2026-06-23** (≈3.5 months) · 10 open issues | croner, nanoid. README warns **subagent jobs run unattended with full tools under your credentials** | ~0 | **WATCH** |
| **@jl1990/pi-scheduler** 0.5.1 | Pi extension · [npm](https://www.npmjs.com/package/@jl1990/pi-scheduler) · [GitHub jl1990/pi-scheduler](https://github.com/jl1990/pi-scheduler) | scheduled shell commands + follow-ups, backoff, expiry, catch-up of missed runs on restart | LIKELY | `pi install` | MIT · 8★ · published 2026-09-29 | croner, proper-lockfile. Runs shell commands → treat like `bash` | ~0 | **WATCH** |
| **@fookhsu/pi-scheduler** 0.3.2 | Pi extension + skill · [npm](https://www.npmjs.com/package/@fookhsu/pi-scheduler) · [GitHub fookhsu/pi-scheduler](https://github.com/fookhsu/pi-scheduler) | cron-driven prompts, each run in its own isolated Task Session file; delete/clear need interactive confirm | LIKELY (Node ≥ 22.19) | `pi install` | MIT · **1★** · created 2026-09-10 | croner | ~0 | **WATCH** |

Skipped: `@ryan_nookpi/pi-extension-cron` (**macOS launchd only → NO**), `@bacnh85/pi-cron` (part of a personal multi-extension repo, GitHub license field empty), `@patimweb/pi-cron` (0★, Node ≥ 26), `@amaster.ai/pi-task-scheduler` (bulk-published monorepo), `@runfusion/fusion` (a separate task platform, not a scheduler add-on).

### 2.8 MCP

| Candidate | Kind / URL | Provides | Windows | Link · Core mod | License · Maintenance | Deps · Security/credential | Owned code | Verdict |
|---|---|---|---|---|---|---|---|---|
| **Pi built-in MCP** (`builtin:mcp` + codemode + tool-search) | Pi built-in · `docs/mcp.md` in the installed package | everything in §1.2: stdio/HTTP, OAuth, exposure control, resources, annotations to permission hooks | **DOC** (Windows page covers shell; MCP stdio uses `command`+`args`) | already active | MIT (Pi) · 1.0.2 released 2026-10-04 | tokens stored in `~/.pi/agent/mcp-auth.json` (plain file) — mind that file | 0 | **ADOPT** (use as-is) |
| **pi-mcp-adapter** 5.0.0 | Pi extension · [npm](https://www.npmjs.com/package/pi-mcp-adapter) · [GitHub nicobailon/pi-mcp-adapter](https://github.com/nicobailon/pi-mcp-adapter) | alternative MCP client (OS keychain OAuth via `@napi-rs/keyring`, `mcp install <url>` from chat, QuickJS) | LIKELY | **replaces built-in MCP** (`docs/mcp.md`: an extension registering `/mcp` takes over; config moves to `.pi/mcp-adapter.json`) | MIT · 1,576★ · pushed 2026-10-03 · ~1.5M dl/mo | **15 deps incl. native keyring, quickjs-wasi**. Duplicates the built-in | ~0 | **REJECT** (duplicate; revisit only if built-in file-based token storage becomes a blocker) |
| `pi-mcp-extension` 1.5.1 | Pi extension · [npm](https://www.npmjs.com/package/pi-mcp-extension) · [GitHub irahardianto/pi-mcp-extension](https://github.com/irahardianto/pi-mcp-extension) | MCP client | ? | peers are **`@mariozechner/*` (pre-1.0)** | MIT · 8★ | — | — | **REJECT** (incompatible namespace + duplicate) |

### 2.9 Context observability

| Candidate | Kind / URL | Provides | Windows | Link · Core mod | License · Maintenance | Deps · Security/credential | Owned code | Verdict |
|---|---|---|---|---|---|---|---|---|
| **pi-context-view** 0.6.0 | Pi extension · [npm](https://www.npmjs.com/package/pi-context-view) · [GitHub dimk90/pi-context-view](https://github.com/dimk90/pi-context-view) | `/context` usage map (what fills the window, what survives compaction), `/context injections` (hidden prompt parts), config | LIKELY (TUI-only, 0 deps) | `pi install`; no core mod | MIT · 78★ · pushed 2026-10-04 · 15 releases since 2026-07 · Node ≥ 22.19 | **0 runtime deps**, read-only visibility, no network | 0 | **TRIAL** |
| **pi-context** 2.2.0 | Pi extension + skill · [npm](https://www.npmjs.com/package/pi-context) · [GitHub ttttmr/pi-context](https://github.com/ttttmr/pi-context) | "agentic context management" (model-driven context tools) + context view | LIKELY | `pi install` | MIT (npm; GitHub license field empty) · 299★ · published 2026-09-09 | 0 deps; lets the **model** edit its own context — behavior change, not just visibility | ~0 | **WATCH** |
| **Langfuse Pi plugin** `@langfuse/pi-observability-plugin` 0.1.2 | Pi extension · [npm](https://www.npmjs.com/package/@langfuse/pi-observability-plugin) | traces prompts, turns, generations, tool calls to Langfuse | LIKELY | `pi install` | vendor-published (Langfuse); 0.1.x, published 2026-08-31 | **sends prompts/tool args/outputs to Langfuse** (cloud or self-host) — credential and data-exposure risk | ~0 | **WATCH** (only with self-hosted Langfuse) |

Skipped (behavior-changing, not observability): `billion-context-pi` (463 releases in 2 months, 69 open issues, aggressive compression), `pi-cache-optimizer`, `pi-headroom`, `context-mode` (MCP; does not target Pi).

### 2.10 Permissions / security

| Candidate | Kind / URL | Provides | Windows | Link · Core mod | License · Maintenance | Deps · Security/credential | Owned code | Verdict |
|---|---|---|---|---|---|---|---|---|
| **@gotgenes/pi-permission-system** 39.0.3 | Pi extension · [npm](https://www.npmjs.com/package/@gotgenes/pi-permission-system) · [GitHub gotgenes/pi-packages](https://github.com/gotgenes/pi-packages) | allow/ask/deny policy over tools incl. bash AST parsing (tree-sitter-bash), path-aware file rules, per-project config **only after project trust**, pluggable authorizer chain (LLM reviewers exist as separate packages) | LIKELY (WASM tree-sitter) | `pi install`; **requires Pi ≥ 1.0.0** (matches); no core mod | MIT (npm; GitHub license field empty) · 243★ · pushed 2026-10-04 · **244 releases in 5 months, 39 majors, 112 open issues** (high churn) | zod, web-tree-sitter, tree-sitter-bash. In-process policy is **not a security boundary** (Pi docs) — it reduces accidents, not hostile code | ~policy file only | **TRIAL** (pin exact version) |
| Pi examples `permission-gate.ts`, `protected-paths.ts`, `confirm-destructive.ts` | Pi built-in **examples** | minimal confirm/block gates | LIKELY | copy into `.pi/extensions` | upstream examples | none | tens of lines each | **WATCH** (fallback; owning them is cheap but narrow) |
| **cc-safety-net** 2.5.2 | CLI/hook with Pi entry · [npm](https://www.npmjs.com/package/cc-safety-net) · [GitHub kenryu42/cc-safety-net](https://github.com/kenryu42/cc-safety-net) | blocks destructive commands and secret-file access; Pi entry at `dist/pi/index.js` | LIKELY | `pi install` | MIT · 1,576★ · pushed 2026-10-04 | peers reference opencode plugin APIs, Pi support is a secondary entry — verify | ~0 | **WATCH** (overlaps the permission system) |
| Pi isolation docs + `sandbox/` & `gondolin/` examples; Docker | Pi built-in docs / examples | the only real boundary: container/VM/OS sandbox | `sandbox/` uses `@anthropic-ai/sandbox-runtime` (OS-level; **Windows support not verified here — assume WSL/Docker**); Docker Desktop is Windows-capable | docs only | upstream | — | ~0 (docs) / copy cost for example | **WATCH** (decision needed once agents get web/desktop reach) |

### 2.11 Obsidian

| Candidate | Kind / URL | Provides | Windows | Link · Core mod | License · Maintenance | Deps · Security/credential | Owned code | Verdict |
|---|---|---|---|---|---|---|---|---|
| **Pi built-in file tools on the vault folder** | Pi built-in | read/write/edit/grep/find/ls over Markdown + frontmatter | **DOC** | none | — | no vault-aware guard (can corrupt `.obsidian/` config) | 0 | **ADOPT** (baseline; add a skill/AGENTS.md convention if needed) |
| **Obsidian CLI** (official, Obsidian ≥ 1.12; Windows needs ≥ 1.12.7) | CLI · [Obsidian Help: CLI](https://obsidian.md/help/cli) | search, read/create/append, tags, properties, backlinks, plugin/eval commands; remote-controls the **running** app | **DOC** (Windows `Obsidian.com` redirector since 1.12.7; enable under Settings → General) | via `bash`/`powershell` + a skill; no extension | first-party, shipped with the desktop app | **requires Obsidian app running**; `eval` can run JS inside the app (powerful) | 0 | **TRIAL** (batch 2) |
| **@bacnh85/pi-obsidian** 0.8.20 | Pi extension + skill · [npm](https://www.npmjs.com/package/@bacnh85/pi-obsidian) · [GitHub bacnh85/pi-extensions](https://github.com/bacnh85/pi-extensions) | one tool wrapping the official CLI; **vault protection** (blocks generic read/write/bash on a vault when cwd is inside one) | depends on Obsidian CLI (DOC) | `pi install`; no core mod | MIT (npm; GitHub license field empty) · 29★ (multi-extension repo) · published 2026-09-30 | wraps `eval`; strict bash allowlist in vault cwd | ~0 | **WATCH** |

Alternatives: `cyanheads/obsidian-mcp-server` 3.6.0 (Apache-2.0, Node ≥ 24, npm-only verified) and `MarkusPfundstein/mcp-obsidian` (MIT, Python, requires Obsidian Local REST API plugin) are MCP routes — **WATCH**. Skipped: `@sfroment/pi-obsidian` (**GPL-3.0 → REJECT**), `pi-obsidian-capture` (1★), `agents-memo`/`pi-vault-mind`/`@zosmaai/pi-llm-wiki` (opinionated vault-as-memory systems; overlap with the Memory area).

### 2.12 Google Workspace

| Candidate | Kind / URL | Provides | Windows | Link · Core mod | License · Maintenance | Deps · Security/credential | Owned code | Verdict |
|---|---|---|---|---|---|---|---|---|
| **gws — Google Workspace CLI** `@googleworkspace/cli` 0.22.5 | CLI + agent skills · [GitHub googleworkspace/cli](https://github.com/googleworkspace/cli) · [npm](https://www.npmjs.com/package/@googleworkspace/cli) | Drive, Gmail, Calendar, Sheets, Docs, Chat, Admin via one CLI built from Google Discovery; 100+ agent skills; env-var/service-account/OAuth auth | **?** (binaries "for your OS"; Windows not explicitly documented; npm `postinstall` fetches the binary) | via `bash`/`powershell` + the shipped skills (Agent Skills format → Pi-compatible); no extension | Apache-2.0 · 31.2k★ · pushed 2026-09-24 · **explicitly "not an officially supported Google product" and "expect breaking changes toward v1.0"** · npm last published 2026-03-31 (binaries likely ship via GitHub Releases — check which is current) | OAuth credentials encrypted at rest (AES-256-GCM; key in OS keyring or `~/.config/gws/.encryption_key`); `gcloud` needed for guided setup. Start with **read-only scopes** | 0 | **TRIAL** (batch 2) |
| **google_workspace_mcp** (taylorwilsdon) | MCP · [GitHub taylorwilsdon/google_workspace_mcp](https://github.com/taylorwilsdon/google_workspace_mcp) | Gmail/Drive/Calendar/Docs/Sheets MCP | ? | built-in MCP | **not verified — GitHub 403 during survey** | OAuth app required | 0 | **WATCH** (unverified) |

Rejected Pi packages: `pi-google-services` (npm `os` field = darwin, linux → **NO on Windows**), `pi-google-workspace` (pre-1.0 `@mariozechner` namespace, 2 releases), `@nexionsoftware/pi-gmail` (declared repo returns 404 → source unverifiable), `@amaster.ai/pi-lark`/`pi-dingtalk` (wrong ecosystem).

### 2.13 Control / Web UI

| Candidate | Kind / URL | Provides | Windows | Link · Core mod | License · Maintenance | Deps · Security/credential | Owned code | Verdict |
|---|---|---|---|---|---|---|---|---|
| **Pi RPC / JSON / SDK** | Pi built-in · `docs/rpc.md`, `docs/sdk.md` | supported programmatic surface for any UI | **DOC** | none | — | — | the UI itself (if built) | **ADOPT** (as the substrate) |
| **@jmfederico/pi-web** 1.202610.1 | Pi extension / server · [npm](https://www.npmjs.com/package/@jmfederico/pi-web) · [GitHub jmfederico/pi-web](https://github.com/jmfederico/pi-web) | web UI for persistent Pi sessions in real workspaces, remote machines, plugins | ? (README mentions WSL/manual usage; install guide at pi-web.dev) | `pi install` / own server; no core mod | MIT · 850★ · pushed 2026-10-04 · 65 open issues | fastify, node-pty, ws, xterm, codemirror (**26 deps**). README: "not a sandbox, permission system, or multi-tenant platform" — loopback/VPN only | ~0 | **WATCH** |
| **pi-web-ui** 0.99.0 | Pi extension · [npm](https://www.npmjs.com/package/pi-web-ui) · [GitHub xing-shuyin/pi-web-ui](https://github.com/xing-shuyin/pi-web-ui) | browser cockpit: chat, files, terminal, Git; token auth (`PI_WEB_TOKEN`); Windows autostart (HKCU Run) | DOC (explicit Windows handling in README, docs largely Chinese) | `pi install` | MIT · 266★ · pushed 2026-10-04 · **189 releases in 2 months** | express, node-pty, ws, electron-updater, DeepSeek SDK-protocol deps (odd for a Pi UI) — review | ~0 | **WATCH** |

Reference only: **OpenClaw** ([GitHub OpenClaw/OpenClaw](https://github.com/OpenClaw/OpenClaw), MIT) — a local gateway with Control UI, channels (Discord/Slack/Telegram/…), companion apps, tools/skills/plugins and the **ClawHub** marketplace; installs on Windows via PowerShell. Pi's own README cites it as the "real-world integration" of Pi. Recorded for comparison of Control UI/channel design only; **not** an Agentco base.

### 2.14 Package / skill / extension discovery

| Candidate | Kind / URL | Provides | Windows | Link · Core mod | License · Maintenance | Deps · Security/credential | Owned code | Verdict |
|---|---|---|---|---|---|---|---|---|
| **Pi package manager + pi.dev/packages gallery** | Pi built-in + [pi.dev/packages](https://pi.dev/packages) | `pi install/list/config/update`, keyword discovery, sort by downloads/recency, type filter; version/tag pinning; `-e` trial runs | **DOC** | none | Pi upstream | **no vetting or security badges**; 11,224 keyword matches; installs execute code in-process | 0 | **ADOPT** |
| **Agent Skills spec** (agentskills.io) + `.agents/skills` | open spec implemented by Pi | portable skills across Pi and other agents (incl. gws's bundled skills) | **DOC** | none | spec | skills "instruct the model to run programs" — review as code | 0 | **ADOPT** |
| **pi-claude-marketplace** 0.19.2 | Pi extension · [npm](https://www.npmjs.com/package/pi-claude-marketplace) · [GitHub acolomba/pi-claude-marketplace](https://github.com/acolomba/pi-claude-marketplace) | install Claude plugin-marketplace content (commands, skills, …) into Pi | ? | `pi install`; peer on `pi-subagents` | MIT · 26★ · pushed 2026-10-04 | imports third-party plugin content with expanded trust surface | ~0 | **WATCH** |

Skipped: `@agimon-ai/doompi-skill` (alpha, DoomPi-specific).

## 3. Cross-cutting observations

1. **Pi 1.0.2 already did the hardest generic work** (MCP client with exposure control, codemode, tool search, packages, skills, RPC/SDK). Anything that re-implements MCP (e.g. `pi-mcp-adapter`) is a duplicate that *replaces* built-in behaviour.
2. **MCP/CLI beats Pi extension for commodity integrations.** Playwright, Brave, Obsidian CLI, gws all work through the built-in MCP client or `bash`+skill — zero Pi-extension surface and no coupling to a third-party extension's release cadence.
3. **The Pi extension ecosystem churns extremely fast** (`@gotgenes/pi-permission-system` 244 releases in 5 months; `pi-web-ui` 189 in 2 months; `billion-context-pi` 463 in 2 months). Pin exact versions; never use floating ranges; treat each update as a review.
4. **Several "popular" signals are weak** (downloads ≫ stars). Prefer 1,000★+ or vendor-published, and read `package.json` scripts (`postinstall`) and `pi.extensions` lists.
5. **Security reality:** Pi docs state there is no built-in sandbox and that in-process permission extensions are not a boundary. Every candidate that adds reach (web, browser, desktop, subagents, schedulers) increases blast radius; the permission/isolation decision must precede or accompany them.
6. **Node version:** Laptop 2 runs Node **24.19.0**. `pi-agent-browser-native` requires ≥ 24.21.0; `@patimweb/pi-cron` requires ≥ 26. Pi itself requires ≥ 22.19 (satisfied).

## 4. Out of survey scope (explicitly)

No installs, no Agentco code or wrappers, no BrowserRuntime restoration, no Agentra access, no OpenClaw-as-base design. Candidates were not executed; every `TRIAL` verdict means "worth a controlled test", not "tested".
