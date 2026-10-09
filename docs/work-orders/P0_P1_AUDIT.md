# P0 audit — 2026-10-09

Recorded before implementation, after fetching and fast-forwarding main.

- Local start: `3a27a7d60b9e6305bc538bab4b2dedacc15d302c` on `main`.
- Remote baseline: `6a2d4ea` (`origin/main`), origin: `https://github.com/hbombheart1230-dotcom/agentco.git`.
- Pre-existing work: modified README.md and pi-home/settings.json; untracked bin/. These remain untouched in the original checkout. Implementation uses a separate Git worktree based on origin/main.
- Pi exact pin: 1.0.4; Node requirement >=22.19.0. Host Node 24.19.0, npm 11.17.0. pyright commands were not on PATH.
- Tracked Pi assets: settings, MCP config, three custom extensions, four agent roles, three prompts, AGENTS.md. No tracked skills directory. Community LSP 0.8.0 and skill-creator 0.3.4 are configured npm packages; official plan/subagent examples reference the installed Pi package.
- Original runtime inventory (names only): bin/, npm/, sessions/, auth.json, models-store.json. Runtime and credentials are ignored and remain at their original location. No credential content was inspected.
- Active scripts, ignore rules, harness/setup/model docs use the old directory name. Historical baseline and supplied work orders also mention that name; these will be explicitly marked historical rather than rewritten as new evidence.
- README describes the retired 1.0.2 clean baseline as current and links to absent ARCHITECTURE.md, BASELINE_AUDIT.md, WORK_PLAN.md. Setup instructions also contain a stale 1.0.2 install claim.
- Worker roles and D-005 assign execution to Claude and verification to Codex. D-005 will retain the original decision as superseded history.
- No executable configuration requires a fixed Windows repository path. MCP uses portable home-relative browser runtime paths. The canonical Windows location in the work order is descriptive.
- Archive tag/history will be preserved. No additional harness installation or shared-skill migration is planned in P1.
