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
