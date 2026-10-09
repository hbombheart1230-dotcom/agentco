# Agentco harness composition (Pi 1.0.4)

Status date: 2026-10-07; directory migration verified 2026-10-09. Pi is **1.0.4, unmodified** (npm exact pin; moved from 1.0.2 after the validation in §7). Current configuration lives in `pi-dev/` (set by `scripts/env.mjs`), tracked except runtime and secrets. Paths in sections 1–6 show the current migrated location; their original validation used the previous agent directory. Sections 1–6 were validated on 1.0.2 and re-validated unchanged on 1.0.4 (§7). P0/P1 migration evidence: [P0_P1_VALIDATION.md](../work-orders/P0_P1_VALIDATION.md).

## 1. Composition

| Layer | Component | Source | Maintained by Agentco |
|---|---|---|---|
| Native | sessions / `/resume` / `/tree` / `/fork`, compaction, context files, packages, RPC | Pi 1.0.2 | no |
| Built-in extensions | `codemode` (`codemode.mode = on`), `mcp`, `tool-search` (auto-activates for `deferred` MCP servers) | Pi 1.0.2 | no |
| Built-in tools | `read bash edit write` + `grep find ls` (enabled via `defaultTools`) | Pi 1.0.2 | no |
| Official examples (loaded in place from the pinned package, not copied) | `subagent`, `plan-mode` | `node_modules/@earendil-works/pi-coding-agent/examples/extensions` | no |
| Agentco-owned, derived from official examples | `permission-gate.ts`, `protected-paths.ts`, `git-checkpoint.ts` | `pi-dev/extensions/` | yes (≈50–60 lines each) |
| Config | subagent roles `scout / planner / worker / reviewer` (model line removed → inherit the fixed model), 3 workflow prompts | `pi-dev/agents`, `pi-dev/prompts` | yes (copied Markdown) |
| Community package | `@ian-pascoe/pi-lsp@0.8.0` (LSP) | npm | no |
| MCP | `@playwright/mcp@0.0.83` (browser) via built-in MCP, no Pi package | `pi-dev/mcp.json` | config only |
| Skill | `@tmustier/pi-skill-creator@0.3.4` | npm | no |
| Rules | `pi-dev/AGENTS.md` (3 short rules) | repo | yes |

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
4. **Playwright MCP quirks (0.0.83):** `browser_click.target` takes selectors, not `ref=eN` (the model recovers); the model may batch dependent calls — mitigated by `pi-dev/AGENTS.md`.
5. **Free-model variance:** Nemotron occasionally returns empty text or wanders; every item above was re-run when that happened. Not a harness defect, but expect it.
6. **Tool surface grew:** ≈ 9 tools listed in the prompt (system prompt ≈ 4.8k chars vs 2.9k bare) plus 6 browser tools and the LSP direct tools. Check with a context viewer before adding more.
7. `lastChangelogVersion` in `pi-dev/settings.json` is rewritten by Pi on startup (harmless noise in diffs).

## 5. Held / not installed

| Item | Decision | Reason |
|---|---|---|
| `pi-coding-agent-test` 0.1.3 | HOLD | Useful (real-Pi E2E with scripted responses) but it is a test framework: 5 deps incl. native `node-pty` + Playwright, 0★, 3 releases. Use it as a **devDependency** if/when a scripted regression suite is wanted. The RPC/JSON drivers used here cover the need today. |
| TDD skill | not installed | No credible Pi-native one (`@windyroad/tdd`: 281 releases, 88 issues, no license field; `tdd-workflow` is a CLI installer for other tools). If needed, write a ~30-line Agent Skill with skill-creator. |
| `pi-lsp-extension`, `@narumitw/pi-lsp` | rejected | First never starts servers on Windows; second offers diagnostics/fix only (no definition/references/symbols). |
| `pi-context-view`, `pi-web-access`, permission packages, `pi-subagents` | not part of this batch | Superseded by official built-ins/examples for this phase; revisit per `SHORTLIST.md`. |

## 6. Fresh-machine setup for this harness

1. `powershell -NoProfile -File scripts/bootstrap.ps1` (`npm ci`, pins Pi 1.0.4).
2. Start Pi once (`node scripts\pi.mjs`). Missing packages listed in `pi-dev/settings.json` are installed automatically into the ignored `pi-dev/npm/` (verified with an empty agent dir containing only `settings.json`; `pi update --extensions` alone did **not** install them).
3. `npm i -g pyright` (Python LSP). Microsoft Edge must be installed (browser MCP uses `--browser msedge`).
4. In each TypeScript project: `npm i -D typescript@7` (or switch the LSP command, §4.2).
5. Run `node scripts\smoke.mjs`.

## 7. Pi 1.0.2 → 1.0.4 upgrade validation (2026-10-07)

Done on branch `chore/pi-1.0.4-validation`; only Pi was changed (LSP, skill-creator, Playwright MCP, pyright, TypeScript untouched), **no Agentco file was modified** before the zero-change regression.

Relevant upstream changes (1.0.3/1.0.4): `--tools`/`--exclude-tools` accept `*` patterns and `--tools` now keeps MCP tools (`--no-mcp` added); codemode freezes built-ins and returns image blocks from `read`; MCP shutdown/OAuth fixes; system-prompt rules omit hidden tools; Azure provider renamed (unused). Extension API: one additive method (`getPromptGuidelines`). No lifecycle, session, fork or settings-schema change.

| Check (same fixtures/drivers as §3) | 1.0.4 |
|---|---|
| startup / tool list | PASS (same 9 listed tools) |
| basic tools, codemode (file content in session: 0 occurrences) | PASS |
| plan-mode, subagent (scout, worker, scout → worker), session resume | PASS |
| safety (gate, protected paths) | PASS |
| git checkpoint — Agentco version | PASS |
| LSP TS + Python | PASS, identical behaviour incl. the Python cold-start diagnostics timeout |
| browser (ordered calls, JS page, `localStorage` across processes, Edge exits, no cwd litter) | PASS |
| MCP list + `tool_search` loading a `deferred` server | PASS |
| baseline smoke | 14/14 |

Historical differences: system prompt 4.8k → 5.5k chars (same tool count). Running Pi in print/JSON/RPC modes left the then-current tracked `pi-home/` files unchanged (an interactive start may still rewrite `lastChangelogVersion`; not verified).

**Official `git-checkpoint` on 1.0.4: FAIL.** The example (and `permission-gate`, `protected-paths`, `subagent`, `plan-mode`) is byte-identical to 1.0.2. In an isolated agent dir the fork showed no restore prompt and the file stayed modified. Custom `git-checkpoint`, `permission-gate` and `protected-paths` therefore stay; no new official permission/protection feature exists in 1.0.4 docs. Custom extension count: 3 → 3.

Decision: **adopt 1.0.4** (no regression, no new workaround).
