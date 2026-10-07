# Agentco Phase 1 — Shortlist

Derived from [SURVEY.md](SURVEY.md) (2026-10-05). Evidence limits and the Windows legend (DOC / LIKELY / ?) are defined there. **Nothing below has been installed or run.**

## 1. Use Pi's own features first (do NOT duplicate with packages)

| Need | Use | Do **not** install |
|---|---|---|
| MCP servers | Pi `builtin:mcp` (`pi mcp add/list`, `/mcp`) + `builtin:codemode` + `builtin:tool-search` | `pi-mcp-adapter` (replaces built-in), `pi-mcp-extension` (pre-1.0 namespace) |
| Keeping MCP schemas out of context | MCP `exposure: codemode`/`deferred`, `toolExposure` | any "context compression" package for this purpose |
| Parallel tool calls / filtering big results | `codemode` (`"defaultTools": ["+codemode"]`) | custom orchestration code |
| Compaction, branching, resume | `/compact`, `/tree`, `/fork`, `/resume`, branch summarization | memory packages whose only value is "summarize old turns" |
| Static instructions/"memory" | `AGENTS.md` / `CLAUDE.md` context files | — |
| Skills | Agent Skills spec, `/skill:name`, `.agents/skills` | a skill-manager package |
| Package management | `pi install/list/config/update`, pinning, `pi -e` | a second package manager |
| Windows shell | `powershell` tool (`defaultTools`), Git Bash | WSL by default |
| Headless / programmatic control | `pi -p`, `--mode json`, `--mode rpc`, SDK | a custom agent runner |
| Obsidian baseline | `read/write/edit/grep/find/ls` on the vault folder | an Obsidian package for plain note read/write |
| Project trust | `.pi` trust gate, `/trust`, `--approve/--no-approve` | — |

## 2. Per-capability ranking (top 1–3)

Verdicts: `ADOPT` use now · `TRIAL` controlled install/test · `WATCH` revisit · `REJECT`.

| Capability | #1 | #2 | #3 |
|---|---|---|---|
| Web / search / research | **pi-web-access** — TRIAL | Brave Search MCP — WATCH | pi-web-search — WATCH |
| Browser automation | **@playwright/mcp** via built-in MCP — TRIAL | agent-browser CLI (+ `pi-agent-browser-native`) — WATCH (Windows waived by wrapper owner; Node ≥ 24.21 vs 24.19) | pi-browser-use — WATCH (4★, created 2026-09-05) |
| Desktop / computer-use | **@injaneity/pi-computer-use** — TRIAL (later) | Windows-MCP — WATCH (needs Python ≥ 3.14) | @amaster.ai/pi-computer-use — WATCH |
| Memory | **pi-memory** — TRIAL (Markdown files, optional qmd) | pi-hermes-memory — WATCH (secret scanning; native SQLite) | Engram (`gentle-engram`) — WATCH |
| Subagents | **pi-subagents** — TRIAL | @tintinweb/pi-subagents — WATCH (137 open issues) | Pi example `subagent/` — WATCH (copy = ~1,000 LOC owned) |
| Background tasks | **pi-background-tasks** — WATCH (overlaps pi-subagents; read `anthropic-attribution.js` first) | pi-better-background-tasks — WATCH | — |
| Scheduler / recurring | **OS Task Scheduler + `pi -p`/RPC** — no package (decision needed) | pi-schedule-prompt — WATCH | @jl1990/pi-scheduler — WATCH |
| MCP | **Pi built-in** — ADOPT | pi-mcp-adapter — REJECT (duplicate) | pi-mcp-extension — REJECT |
| Context observability | **pi-context-view** — TRIAL | pi-context — WATCH | Langfuse plugin — WATCH (self-host only) |
| Permissions / security | **@gotgenes/pi-permission-system** — TRIAL (pin exact) | Pi examples (`permission-gate`, `protected-paths`) — WATCH | cc-safety-net — WATCH; container/VM isolation — decision pending |
| Obsidian | **Pi built-in file tools** — ADOPT | Obsidian CLI (official) — TRIAL (batch 2) | @bacnh85/pi-obsidian — WATCH |
| Google Workspace | **gws CLI** (`@googleworkspace/cli`) — TRIAL (batch 2, read-only scopes) | google_workspace_mcp — WATCH (unverified) | — (Pi Google packages: REJECT) |
| Control / Web UI | **Pi RPC/JSON/SDK** — ADOPT (substrate) | @jmfederico/pi-web — WATCH | pi-web-ui — WATCH |
| Package / skill discovery | **Pi package manager + pi.dev/packages + Agent Skills spec** — ADOPT | pi-claude-marketplace — WATCH | — |

## 3. Rejected outright (do not revisit without new facts)

| Package | Reason |
|---|---|
| `pi-mcp-adapter` | Replaces built-in MCP; 15 deps incl. native keyring |
| `pi-mcp-extension`, `pi-browser-harness`, `pi-google-workspace` | Peer deps on pre-1.0 `@mariozechner/*` |
| `donsetch` | AGPL-3.0, `postinstall` downloads a binary |
| `@sfroment/pi-obsidian` | GPL-3.0 |
| `pi-google-services` | npm `os` = darwin, linux (no Windows) |
| `@ryan_nookpi/pi-extension-cron` | macOS launchd only |
| `@onkernel/browser-loop` | cloud browser service by default |
| `@nexionsoftware/pi-gmail` | declared repository returns 404 (source unverifiable) |
| `basic-memory` | AGPL-3.0 |

## 4. Features Agentco must NOT build now

MCP client · web search/fetch · browser runtime (old BrowserRuntime stays retired) · desktop/computer-use driver · generic key-value/semantic memory store · subagent runner · background-task runner · cron engine · context viewer · permission/policy engine · Obsidian CRUD · Google API clients · package manager/marketplace · TUI/web chat front end · session storage/compaction · tool-call parallelism. Each is covered by Pi built-in, a mature package, or an MCP/CLI above.

## 5. First trial batch (max 5)

Selection criteria: useful to Agentco now · removes the most custom work · Windows evidence · zero Pi core modification · low maintenance · minimal overlap. Reach-adding capabilities (web, browser, subagents) are deliberately paired with **permissions** and **observability** so the test can tell what the agent actually did.

| # | Install / configure | Why this batch | What to verify on Laptop 2 |
|---|---|---|---|
| 1 | **`@gotgenes/pi-permission-system`** (pin exact version, user scope) | Policy layer before adding reach; Pi has none. Requires Pi ≥ 1.0 (matches). | policy file loads; `ask`/`deny` fire for `bash`, `write`, MCP tools; project config ignored when untrusted; bash AST parsing works under Git Bash **and** `powershell` tool; startup time |
| 2 | **`pi-context-view`** | 0 deps, read-only; shows what each other package adds to the prompt | `/context usage`, `/context injections` render in Windows Terminal; numbers change as packages 3–5 load |
| 3 | **`pi-web-access`** | Search/fetch/PDF with no API key (Exa zero-config); replaces the whole web-research build | search + fetch + PDF work; confirm what leaves the machine; `allowBrowserCookies` stays **off**; behavior with OpenRouter/Groq models (no Codex auth) |
| 4 | **Playwright MCP** (`@playwright/mcp`, pinned, `--isolated`) via `pi mcp add` — **no Pi package** | Browser capability through built-in MCP: nothing extra to maintain in Pi | `pi mcp list` connects on Windows; `exposure: codemode` keeps schemas out of context (confirm in #2); isolated profile leaves no cookies on disk; permission system gates MCP calls |
| 5 | **`pi-subagents`** (pin exact) | Best-supported delegation + background children; also covers most of "background tasks" | child runs spawn on Windows; children inherit permission policy (#1); FleetView works in Windows Terminal; cost/token behavior with free models; `researcher` agent with #3 |

Install hygiene for the batch (applies when the next instruction authorizes installing):
- Do it on a branch; one package per commit of `.pi/settings.json` (or user settings) so any package can be backed out with `pi remove`.
- Pin exact versions (`pi install npm:<pkg>@<version>`); record versions in `docs/capabilities/`.
- Before installing each package, read its `package.json` (`scripts.*install`, `pi.extensions`) and entry file.
- Keep MCP/OAuth tokens only in user-level files; never in the repo; no credentials in `.pi/mcp.json`.
- Re-run `node scripts\smoke.mjs` after each install; baseline must stay 14/14.
- Success = each item meets its "verify" column on Windows. Otherwise record the failure and move to the WATCH alternative.

### Not in the first batch (and why)

| Deferred | Reason | Likely batch 2 |
|---|---|---|
| `pi-memory` | Identity-defining for a companion agent; choose after seeing real context load (#2) and permission behavior | yes |
| Obsidian CLI | Requires Obsidian ≥ 1.12.7 running; test after permissions exist | yes |
| `gws` (Google Workspace CLI) | Pre-1.0, unofficial, needs OAuth app setup; use read-only scopes | yes |
| `@injaneity/pi-computer-use` | Highest blast radius; `postinstall` script; needs proven permission gate first | batch 3 |
| Scheduler | Decide first whether jobs must run while Pi is closed (then OS Task Scheduler + `pi -p`, no package) | after decision |
| Web UI | Substrate is Pi RPC/SDK; evaluate `pi-web` only if a UI is actually needed | later |

### Decisions the owner needs to make (not blockers for the batch)
1. Do scheduled jobs need to run while Pi is closed? (drives scheduler choice)
2. Is container/VM isolation required once web + browser + subagents are active? (Pi docs: permission extensions are not a security boundary.)
3. Node 24.19.0 → 24.21.0+ acceptable if the browser CLI wrapper is revisited?
