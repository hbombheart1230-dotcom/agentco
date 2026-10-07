# Agentco harness composition (Pi 1.0.2)

Status date: 2026-10-07. Pi stays **1.0.2, unmodified** (npm exact pin). Everything below is configuration in `pi-home/` (Pi's agent dir, set by `scripts/pi.mjs`), tracked in git except runtime state and secrets.

> Pi `1.0.4` was already published on 2026-10-05 (`npm view @earendil-works/pi-coding-agent version`). The baseline deliberately stays on 1.0.2; upgrading is a separate, smoke-gated step.

## 1. Composition

| Layer | Component | Source | Maintained by Agentco |
|---|---|---|---|
| Native | sessions / `/resume` / `/tree` / `/fork`, compaction, context files, packages, RPC | Pi 1.0.2 | no |
| Built-in extensions | `codemode` (`codemode.mode = on`), `mcp`, `tool-search` (auto-activates for `deferred` MCP servers) | Pi 1.0.2 | no |
| Built-in tools | `read bash edit write` + `grep find ls` (enabled via `defaultTools`) | Pi 1.0.2 | no |
| Official examples (loaded in place from the pinned package, not copied) | `subagent`, `plan-mode` | `node_modules/@earendil-works/pi-coding-agent/examples/extensions` | no |
| Agentco-owned, derived from official examples | `permission-gate.ts`, `protected-paths.ts`, `git-checkpoint.ts` | `pi-home/extensions/` | yes (≈50–60 lines each) |
| Config | subagent roles `scout / planner / worker / reviewer` (model line removed → inherit the fixed model), 3 workflow prompts | `pi-home/agents`, `pi-home/prompts` | yes (copied Markdown) |
| Community package | `@ian-pascoe/pi-lsp@0.8.0` (LSP) | npm | no |
| MCP | `@playwright/mcp@0.0.83` (browser) via built-in MCP, no Pi package | `pi-home/mcp.json` | config only |
| Skill | `@tmustier/pi-skill-creator@0.3.4` | npm | no |
| Rules | `pi-home/AGENTS.md` (3 short rules) | repo | yes |

Final count: **community Pi packages 2** (LSP + skill-creator), **MCP servers 1**, **official examples 2**, **Agentco-owned extensions 3**, **skills 1**.

## 2. Why the three Agentco-owned extensions exist (they are not duplicates)

| File | Official example | What differs / why |
|---|---|---|
| `permission-gate.ts` | `permission-gate.ts` (rm -rf, sudo, chmod 777 only) | Adds Windows/PowerShell destructive commands, `git push --force / reset --hard / clean -f`, remote-exec pipes, `Invoke-Expression`, and **shell access to credential files**. No UI → blocked by default (subagents, print mode). |
| `protected-paths.ts` | `protected-paths.ts` (write/edit of `.env`, `.git/`, `node_modules/`) | Also blocks **`read`** of credential files so secrets never enter model context; adds Agentco token stores; Windows path normalisation. `.env.example` stays accessible. |
| `git-checkpoint.ts` | `git-checkpoint.ts` | **The upstream example cannot restore anything in 1.0.2**: it clears checkpoints on `agent_settled` and records nothing for the first turn. The Agentco version snapshots once per prompt, keys it to the user-message entry, stores it as a session entry and pins it under `refs/agentco-checkpoints/`. Restore resets tracked files only (untracked files are not captured). |

If upstream fixes the example, replace these copies with in-place references and delete the files.

## 3. Verification (final regression, 2026-10-07)

Run through `scripts/pi.mjs` against throw-away fixtures outside the repo (JSON/RPC drivers kept in the scratchpad, not committed).

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | startup, all extensions load | PASS | tools: read, bash, edit, write, codemode, subagent (+grep/find/ls, MCP, LSP) |
| 2 | model call (OpenRouter Nemotron free) | PASS | exact-reply test |
| 3 | read / edit / write / bash / grep / find | PASS | one call each |
| 4 | codemode | PASS | one script combined `read`+`find`; the 3000-line file content appears **0 times** in the session JSONL (only the one-line summary reached the model) |
| 5 | plan-mode | PASS | in plan mode the prompt's tool list has no `edit`/`write`; read works; `/plan` again restores them and a write succeeds |
| 6 | subagent scout → worker | PASS | worker output contains scout findings; the parent session holds one `subagent` call and none of the children's tool calls |
| 7 | safety | PASS | harmless `echo "rm -rf …"` triggers the gate (No → blocked, Yes → runs); `.env` read/write, `node_modules` write blocked; `.env.example` readable; `.env` unchanged |
| 8 | git checkpoint | PASS (Agentco version) | agent overwrote a tracked file; `/fork` offered restore; file returned to its pre-prompt content. Official example: **FAIL** (no prompt offered) |
| 9 | LSP | PASS with caveat | TS and Python: definition, references (cross-file), document symbols, diagnostics (real type errors). Caveat §4.1 |
| 10 | browser | PASS | navigate, JS-rendered page, click, evaluate, link navigation, `localStorage` kept across **separate Pi processes**, Edge exits cleanly |
| 11 | session resume | PASS | `-c` resumed the same session id and recalled a token |
| — | baseline smoke | PASS | `node scripts\smoke.mjs` 14/14 |

## 4. Known issues

1. **LSP cold start.** The first `lsp_diagnostics` of a session can report `diagnostics timeout` (observed for Python/pyright, 20 s limit); the next call succeeds. Python cross-file references only appear after the other file has been opened/analysed (`diagnosticMode: workspace` is set).
2. **TypeScript needs a project-local `typescript`.** The configured server is TS7 native (`npx --no-install tsc --lsp --stdio`). Projects on TypeScript ≤ 6 need `typescript-language-server` instead (`typescript-language-server` itself refuses TS 7; and with no shell flag the first LSP candidate could not spawn `.cmd` shims on Windows at all).
3. **Python server is a global npm install** (`npm i -g pyright`) — machine-local, not in the repo.
4. **Playwright MCP quirks (0.0.83):** `browser_click.target` takes selectors, not `ref=eN` (the model recovers); the model may batch dependent calls — mitigated by `pi-home/AGENTS.md`.
5. **Free-model variance:** Nemotron occasionally returns empty text or wanders; every item above was re-run when that happened. Not a harness defect, but expect it.
6. **Tool surface grew:** ≈ 9 tools listed in the prompt (system prompt ≈ 4.8k chars vs 2.9k bare) plus 6 browser tools and the LSP direct tools. Check with a context viewer before adding more.
7. `lastChangelogVersion` in `pi-home/settings.json` is rewritten by Pi on startup (harmless noise in diffs).

## 5. Held / not installed

| Item | Decision | Reason |
|---|---|---|
| `pi-coding-agent-test` 0.1.3 | HOLD | Useful (real-Pi E2E with scripted responses) but it is a test framework: 5 deps incl. native `node-pty` + Playwright, 0★, 3 releases. Use it as a **devDependency** if/when a scripted regression suite is wanted. The RPC/JSON drivers used here cover the need today. |
| TDD skill | not installed | No credible Pi-native one (`@windyroad/tdd`: 281 releases, 88 issues, no license field; `tdd-workflow` is a CLI installer for other tools). If needed, write a ~30-line Agent Skill with skill-creator. |
| `pi-lsp-extension`, `@narumitw/pi-lsp` | rejected | First never starts servers on Windows; second offers diagnostics/fix only (no definition/references/symbols). |
| `pi-context-view`, `pi-web-access`, permission packages, `pi-subagents` | not part of this batch | Superseded by official built-ins/examples for this phase; revisit per `SHORTLIST.md`. |

## 6. Fresh-machine setup for this harness

1. `npm install` (pins Pi 1.0.2).
2. Start Pi once (`node scripts\pi.mjs`). Missing packages listed in `pi-home/settings.json` are installed automatically into the ignored `pi-home/npm/` (verified with an empty agent dir containing only `settings.json`; `pi update --extensions` alone did **not** install them).
3. `npm i -g pyright` (Python LSP). Microsoft Edge must be installed (browser MCP uses `--browser msedge`).
4. In each TypeScript project: `npm i -D typescript@7` (or switch the LSP command, §4.2).
5. Run `node scripts\smoke.mjs`.
