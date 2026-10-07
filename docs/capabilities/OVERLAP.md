# Agentco Phase 1 — Overlap Map

Companion to [SURVEY.md](SURVEY.md) and [SHORTLIST.md](SHORTLIST.md). Purpose: prevent installing two things that do the same job, and flag packages that change each other's behavior.

## 1. Overlap with Pi 1.0.2 built-ins (highest priority — never duplicate)

| Pi built-in | Overlapping candidates | Rule |
|---|---|---|
| `builtin:mcp` (+ codemode, tool-search) | `pi-mcp-adapter` (**replaces** it: owns `/mcp`, moves config to `.pi/mcp-adapter.json`), `pi-mcp-extension` | Do not install. Add MCP servers with `pi mcp add`. |
| Sessions/compaction/`/tree` | `pi-observational-memory`, `billion-context-pi`, `pi-midcompact`, `pi-headroom`, `pi-context` | These change compaction or let the model edit its own context. Not needed for observability. Revisit only for a measured long-session problem. |
| `AGENTS.md` context files | `pi-memory`, `pi-hermes-memory`, Engram (partially) | Memory packages add *dynamic* recall; keep `AGENTS.md` for static instructions — don't mirror the same facts in both. |
| File tools (`read/write/edit/grep/find/ls`) | Obsidian packages for plain note I/O; `pi-hashline-edit-pro`, `@ff-labs/pi-fff` | Plain vault read/write needs nothing. |
| Skills (Agent Skills spec) | `pi-claude-marketplace`, skill-catalog packages | Native skills + `.agents/skills` suffice. |
| `pi install` | any second package manager | none |
| RPC/JSON/SDK | Web UIs (`pi-web`, `pi-web-ui`) | They are *clients* of the same surface — optional front ends, not new capability. |
| Examples (`subagent/`, `permission-gate`, `sandbox/`) | `pi-subagents`, permission packages | Examples are references. Copying them makes Agentco own the code; prefer a maintained package. |

## 2. Overlap clusters among candidates

### 2.1 Delegation / background / schedule (largest cluster — pick one owner per job)
| Job | Who does it | Collision |
|---|---|---|
| Run an agent in the background | `pi-subagents` (background children), `pi-background-tasks` (delegated read-only agents, attested runs), `@tintinweb/pi-subagents` (resume detached), `@deathbeam/pi-delegate` | **Install at most one.** Plan: `pi-subagents` first. |
| Run a shell command in the background | `pi-background-tasks` (`bg_run`), `pi-better-background-tasks`, `pi-patty-bg-tasks`, `@jl1990/pi-scheduler` (commands + follow-up) | Only one background-shell owner. |
| Recurring prompts | `pi-schedule-prompt`, `@fookhsu/pi-scheduler`, `@bacnh85/pi-cron`, `@patimweb/pi-cron`, `@amaster.ai/pi-task-scheduler`, `@tintinweb/pi-subagents` (carries `croner`) | Schedulers that spawn **subagent jobs** need the subagent package installed and inherit its permissions. All are in-process (fire only while Pi runs). OS Task Scheduler + `pi -p` is the alternative with no package. |
| Fleet/inspector UI | `pi-subagents` FleetView, `@tintinweb` widget/fleet view, `@henryqw/pi-subagent` | Two panels fight over the footer/widget area. |

### 2.2 Web ⇄ browser ⇄ computer-use (escalating reach, overlapping "get information from the outside")
| Layer | Candidates | Overlap |
|---|---|---|
| Search / fetch | `pi-web-access`, `pi-web-search`, Brave MCP, Exa MCP | `pi-web-access` **bundles** Exa MCP, URL→markdown, PDF and GitHub clone; also depends on `@modelcontextprotocol/sdk`. Don't add a second fetcher. |
| Page rendering / interaction | `@playwright/mcp`, `agent-browser` (+wrapper), `pi-browser-use` (chrome-devtools-mcp), `betterwright`, `pi-chrome` | One browser stack only. `pi-browser-use` and Playwright both launch a Chromium-family browser with their own profile. |
| Whole desktop | `@injaneity/pi-computer-use`, `@amaster.ai/pi-computer-use` (Cua), Windows-MCP | Overlaps browser tools for any web task (prefer the browser layer; desktop only for non-web apps). Two computer-use stacks must never be active together. |
| Research agent | `pi-subagents` `researcher` agent **requires** `pi-web-access` in the child | Intentional dependency, not a collision. |

### 2.3 Memory ⇄ notes ⇄ context management
| Candidates | Overlap |
|---|---|
| `pi-memory`, `pi-hermes-memory`, Engram, `@amaster.ai/pi-memory-mem0`, `@modelcontextprotocol/server-memory` | All are "persist facts across sessions". **One** memory owner. Engram/mem0 also speak MCP, so they can duplicate each other through two routes. |
| `pi-observational-memory`, `billion-context-pi`, Pi compaction | Three mechanisms rewriting what stays in context. Mutually conflicting. |
| Vault-as-memory (`agents-memo`, `pi-vault-mind`, `@zosmaai/pi-llm-wiki`, Obsidian CLI/MCP) | Overlaps Memory if the Obsidian vault becomes the memory store. Decide **vault = knowledge base** vs **memory package = agent state** before installing either. |
| `pi-hermes-memory` secret scanning ↔ permission system path rules | Complementary, not duplicate. |

### 2.4 Observability
| Candidates | Overlap |
|---|---|
| `pi-context-view` ↔ `pi-context` | Both register a `/context` view. **Do not install both** (command-name clash); keep `pi-context-view` for read-only inspection. |
| `pi-context-view` ↔ Langfuse/LangSmith/Braintrust/Raindrop plugins | Local view vs remote tracing of the same events; remote ones export prompts and tool I/O. Not interchangeable. |
| `pi-powerline-footer`, `@narumitw/pi-usage`, `pi-cache-optimizer` footers | UI-surface contention (footer/status line), cosmetic. |

### 2.5 Permissions / isolation
| Layer | Candidates | Overlap |
|---|---|---|
| In-process policy | `@gotgenes/pi-permission-system`, `@zhushanwen/pi-permission`, `pi-permission-guardian`, `cc-safety-net`, Pi example gates, `@mzwing/pi-permission-auto-review` (builds **on** the gotgenes system) | **One policy engine.** Several of these hook `tool_call` and will double-prompt or fight over blocks. |
| Capability-specific guards | `@bacnh85/pi-obsidian` vault guard, `@injaneity/pi-computer-use`/Cua `confirmDangerousActions`, scheduler confirms | Stack on top of the policy engine; verify they don't double-confirm every call. |
| Hard boundary | Docker/OpenShell/Gondolin/OS sandbox | Orthogonal: in-process policy is **not** a boundary (Pi docs). Not a replacement for each other. |

### 2.6 Google / Obsidian / messaging
| Candidates | Overlap |
|---|---|
| `gws` CLI ↔ `google_workspace_mcp` ↔ Pi Google packages | Same API surface through three routes. One route only (`gws` first). |
| Obsidian CLI ↔ `@bacnh85/pi-obsidian` ↔ Obsidian MCP servers | The package **wraps** the CLI; MCP servers need the Local REST API plugin instead. One route. |
| Control UIs (`pi-web`, `pi-web-ui`, `@raingor/pi-web-switch`) ↔ OpenClaw Control UI | Reference only; none are required for core capability. |

## 3. Dependency / runtime overlap to watch
- **`@modelcontextprotocol/sdk`** is pulled in by `pi-web-access`, `pi-browser-use`, `@agntn/web` and others while Pi already has an MCP client. Harmless but doubles MCP code paths — keep an eye on duplicate MCP connections to the same server (e.g. Exa).
- **Chromium instances**: Playwright, agent-browser, chrome-devtools-mcp and Cua each manage their own browser profile — disk and process duplication if more than one is tried; clean up between trials.
- **Native modules**: `better-sqlite3` (pi-hermes-memory, qmd), `node-llama-cpp`/`sqlite-vec` (qmd), `@napi-rs/keyring` (pi-mcp-adapter), `node-pty` (web UIs). Windows prebuild availability not verified; these are the likeliest install failures.
- **Install scripts**: `@injaneity/pi-computer-use`, `pi-memory`, `agent-browser`, `@googleworkspace/cli`, `donsetch` run `postinstall` — review first.
- **Prompt budget**: each extension may append system-prompt sections (skills list, `mcp_servers`, tool declarations). Use `pi-context-view` after each install to attribute growth.

## 4. Safe combinations (designed to work together)
- `pi-subagents` + `pi-web-access` (researcher agent).
- `@gotgenes/pi-permission-system` + built-in MCP (MCP annotations are exposed to permission hooks).
- Built-in MCP `exposure: codemode` + `pi-context-view` (verify schemas stay out of the prompt).
- Obsidian CLI + `pi-memory` **only if** the vault and memory directories are kept separate.

## 5. Install-time rules derived from this map
1. One owner per job in §2.1–§2.6.
2. Never install anything that registers `/mcp` while built-in MCP is wanted.
3. Install the permission engine before any package that adds reach; install `pi-context-view` before measuring anything.
4. Re-run the smoke test and `pi-context-view` after every install; revert via `pi remove` if the baseline degrades.
