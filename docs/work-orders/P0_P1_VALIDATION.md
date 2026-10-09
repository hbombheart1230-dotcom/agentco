# P0/P1 validation — 2026-10-09

Implementation base: `6a2d4ea7cd8fbda2218d94ab8b9a3dba7d681fa6`, branch `feature/p0-p1-agentco-workspace`. Work is isolated in a separate Git worktree; the original main checkout retains the pre-existing README/settings/bin changes and all original ignored runtime. Archive tag remains untouched.

Environment: Windows, Node 24.19.0, npm 11.17.0, upstream Pi 1.0.4. Configured packages remain LSP 0.8.0, skill-creator 0.3.4, Playwright MCP 0.0.83. pyright was absent on PATH and was installed through the explicit bootstrap option; observed version 1.1.414. TS7 was installed only in an ignored regression fixture, not as a repository dependency.

## Acceptance evidence

| Requirement | Result / evidence |
|---|---|
| Reproducible dependencies | PASS: bootstrap ran npm ci, restored pinned Pi packages via Pi install, launcher returned 1.0.4; lockfile unchanged |
| Portable launcher | PASS: env.mjs resolves the agent directory from its own location to pi-dev; external PI_CODING_AGENT_DIR is overridden |
| Baseline smoke | PASS: OpenRouter 7/7 + Groq 7/7 = 14/14, exit 0; existing environment loader injected credentials into child processes without printing or copying values |
| Extensions / prompts / skills | PASS: actual RPC startup, discovery of plan/workflow/skill commands, subagent/codemode/LSP and browser tools; no extension load errors |
| Plan | PASS: /plan removed write/edit and kept read; second /plan restored write/edit |
| Subagent | PASS: live scout read fixture marker; scripted-provider E2E ran actual Pi scout → worker child processes, read → previous-output handoff → write, parent subagent result and file verified |
| Protected paths / safety | PASS: RPC read of a nonexistent auth.json path blocked before access, node_modules write blocked, .env.example fixture readable; harmless echo containing a dangerous pattern rejected through the real permission dialog |
| Git checkpoint | PASS: fixture overwrite generated a persisted checkpoint; RPC fork offered restore, tracked fixture content returned to original. Assertion normalizes Git's native LF/CRLF line endings |
| Codemode | PASS: scripted assistant messages through the real SDK agent loop executed codemode read + find and returned fixture content |
| LSP | PASS: actual TS7 and Python servers returned intentional type diagnostics, definition locations and document symbols, through the real SDK tool loop |
| Browser/MCP | PASS: pi mcp list connected to 25 Playwright tools; real Edge navigate, JavaScript-generated button, ordered click and evaluation verified; browser closed and extension shutdown emitted |
| Session resume | PASS: SDK reopened the actual RPC session, retained its ID and token in model context; a separate launcher process resumed the same ID and live model recalled RESUME-4721 |
| Fresh setup | PASS: staged tracked snapshot materialized into a new temporary path containing spaces using checkout-index (clean-clone equivalent); no node_modules or runtime copied; bootstrap and doctor succeeded |
| Bootstrap safety | PASS: existing scratch .env stayed unchanged by timestamp/size checks only; no contents inspected. With PATH empty, missing Git failed clearly with exit 1 |
| Doctor | PASS: exit 0, PASS=27 WARN=1 FAIL=0 in implementation worktree and clean setup. Warning: intentionally absent .env; secrets stay in the original checkout |
| Hygiene | PASS: no active execution references to the old agent directory, no fixed repository/user paths needed, no credential patterns or runtime/dependencies in staged files, README links resolve, Git diff whitespace check clean |

## Evidence limits and reviewer notes

The real OpenRouter/Groq smoke and live scout/resume cover provider integration. Full Groq harness requests exceeded the account's 8,000-token request allowance; that was a provider limit, not a migration defect. Scripted responses were used to make subagent chain and SDK service regressions deterministic while executing the actual upstream Pi process/tool pipelines, extensions, language servers and Edge. The temporary test provider was removed after verification and is not committed. No upstream Pi source was patched.

Scratch RPC/SDK drivers and fixtures remain locally under ignored `smoke-output/` for independent review; they are not portable product infrastructure or committed runtime. Early driver issues (stdin left open in print mode, direct tool calls missing execution context, LF/CRLF equality) were corrected; only the successful corrected checks above count as acceptance evidence.

Old-directory mentions remain only in dated historical evidence, supplied pre-migration work orders, this audit, and an ignore rule that protects retained original runtime. The lastChangelogVersion setting is the last viewed changelog marker, not the installed Pi version, and was preserved as tracked baseline metadata. Original dirty settings were not folded into this change.

P2 shared-skill migration, other harness installations, Harbor, Commander implementation and runtime/session migration are outside this change. Independent Claude review has not been performed by Codex.

## Follow-up: canonical single workspace — 2026-10-09

Pulled feature branch to `06b7083eb2b8b5599edf5877bc9e0a46242fbf37` before following the appended work order. Development now uses the canonical workspace on `feature/p0-p1-agentco-workspace`. Git reports one working directory; the temporary P0/P1 linked worktree and its directory were removed with normal Git worktree cleanup after canonical validation. No merge to main was performed.

Preservation and reconciliation:

- Original README Windows command instructions were restored, with their active Pi directory reference updated to `pi-dev/`.
- Original `hideThinkingBlock: true` was mapped into `pi-dev/settings.json`. `lastChangelogVersion` was identified as runtime-only churn and not carried as a user setting.
- Original `bin/agentco.cmd` was restored unchanged in content, respecting the existing CRLF Git policy, and is now tracked. Running `agentco --version` from an external directory returned 1.0.4 and preserved the caller directory.
- Original README/settings/bin state remains in the local stash, also pinned by `refs/agentco-preserved/p0-p1-follow-up-user-state`. This ref is local only; no credential/runtime files were stashed or committed.
- Original root `.env` and old Pi runtime were retained without reading credential values. Original smoke output was moved into ignored `results/p0-p1-follow-up/preexisting-smoke-output` before rerunning smoke, so existing sessions/fixtures were not overwritten.
- All six ignored top-level entries from the temporary worktree (dependencies, Pi runtime/cache and regression artifacts) were moved into ignored `results/p0-p1-follow-up/temporary-worktree` before cleanup. The historical scratch-driver location mentioned above is superseded by this archive location. No local data was discarded.

Canonical verification: doctor exited 0 with **28 PASS / 0 WARN / 0 FAIL**; the live baseline smoke exited 0 with **14/14 PASS**. Pinned Pi managed packages were restored online into the new canonical agent directory. Existing repository dependencies were retained.

Root AGENTS.md and README now require the canonical workspace and Git branches by default; additional linked worktrees require a concrete isolation or parallelism reason. Independent Claude verification still gates merging to main.

## Root folder hygiene audit — 2026-10-09

Recorded before deleting or moving local state, after pulling feature branch to `9c9d2a3a794db3272377940bcaf1fd9be8dca93f`. Git was clean. All 20 physical top-level entries, including hidden/ignored files, were inventoried:

| Root item | Classification | Reason / planned action |
|---|---|---|
| .git/ | KEEP-LOCAL | Required canonical Git metadata |
| bin/ | KEEP-TRACKED | One portable user command wrapper |
| docs/ | KEEP-TRACKED | Governance, work orders and evidence |
| node_modules/ | KEEP-LOCAL | Active generated npm dependencies |
| pi-dev/ | KEEP-TRACKED | Active configuration namespace; runtime inside stays ignored |
| pi-home/ | MIGRATE | Move sessions and helper binaries into active runtime; retain old auth without overwriting active auth; remove proven obsolete cache/dependencies |
| results/ | KEEP-LOCAL | Generated output and bounded prior verification/preservation archives |
| scripts/ | KEEP-TRACKED | Portable launch, install and verification scripts |
| smoke-output/ | MIGRATE | Preserve existing generated output under results/smoke after new-path verification |
| .env | KEEP-LOCAL | Current root-local provider credentials; presence only inspected |
| .env.example | KEEP-TRACKED | Portable environment template |
| .env.naver | KEEP-LOCAL | Existing local secret file; retain untouched, not loaded by launcher |
| .gitattributes | KEEP-TRACKED | Line-ending policy |
| .gitignore | KEEP-TRACKED | Local-state exclusion rules |
| AGENTS.md | KEEP-TRACKED | Durable repository rules |
| package-lock.json | KEEP-TRACKED | Reproducible npm dependency graph |
| package.json | KEEP-TRACKED | Pinned Pi dependency and commands |
| PATCH_NOTES.md | KEEP-TRACKED | Change history |
| pi.cmd | KEEP-TRACKED | Existing command entrypoint |
| README.md | KEEP-TRACKED | Current usage and documentation links |

Legacy sub-item decisions: `sessions/` contains 64 JSONL sessions and four logs, with no active sessions directory to overwrite; MIGRATE intact to `pi-dev/sessions/`. `bin/` contains only the Pi-managed rg/fd helper executables and no active counterpart; MIGRATE to ignored `pi-dev/bin/`. Installed community package versions/content are compared against the active installation before deleting the old generated npm tree. `models-store.json` is a stale dynamically refreshed provider-catalog cache, verified from installed Pi's models-store implementation; REMOVE without reading its contents. Old `auth.json` has a newer active counterpart; MIGRATE opaquely to ignored `pi-dev/retained-auth/p0-p1/auth.json`, never overwrite active auth. DEFER only the decision to activate/discard that retained credential file; no credential values are read or compared.

The temporary linked worktree is already absent and Git lists only the canonical workspace. No root worktrees/ or future-phase placeholder directories exist. Existing results archives remain local evidence; their prior dependency snapshots are not active installations.

### Root hygiene outcome

- Migrated all 64 session JSONL files and four logs intact into `pi-dev/sessions/`, and both rg/fd helper executables into `pi-dev/bin/`. File lengths and timestamps were checked after the moves. Pi SessionManager discovers all 64 sessions, including three for the canonical working directory; session content was not printed.
- Retained older auth opaquely at the classified ignored destination; active auth length/timestamp remained unchanged. Credential contents were not read, hashed or compared. The deferred activation/disposal decision is recorded in TASK_INBOX.md and does not block the folder cleanup.
- Both community packages matched active versions and all 39 published package files compared identical. The obsolete npm tree and regenerable model catalog cache were removed through Windows Recycle Bin, allowing recovery. Only the classified paths were removed, followed by the empty legacy directory; no broad cleanup or Git history rewrite occurred.
- The updated smoke script creates a fresh `results/smoke/run-*/` directory for every invocation and no longer recursively deletes prior sessions. Live regression passed **14/14**, exit 0, using the new fixture path. After verification, all three original root smoke files were moved with unchanged metadata into `results/smoke/pre-hygiene/`; the root smoke directory no longer exists.
- Doctor passed **28 PASS / 0 WARN / 0 FAIL**, exit 0. Actual Pi launcher startup/help loaded the official plan extension with no extension load errors and dynamically targeted `pi-dev/`.
- bin/ remains the one unchanged tracked portable command wrapper. Root contract was added to AGENTS.md and WORK_PLAN.md; current README/smoke instructions were updated while historical evidence remains dated.
- The obsolete pi-home and root smoke-output ignore rules were removed. Migrated sessions/helpers/retained auth, generated smoke results, existing results archives and root secret files remain ignored. Git still has one canonical worktree and no temporary/placeholder worktree directory.

Final physical root inventory is the original audit table minus `pi-home/` and `smoke-output/`: **18 entries**, seven directories and 11 files. Every remaining item keeps its recorded KEEP-TRACKED or KEEP-LOCAL classification. No future-phase placeholder directories were created. Independent Claude review still gates merging to main.
