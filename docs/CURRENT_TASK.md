# Agentco Current Task — P5.1 native file-edit vertical slice

**Branch:** `feature/p5-1-file-edit` (from released main `03245540e7ae2e30bb232430f1e00a03b1e97280`). In `C:\Agentco`, safe-fetch and switch to this new remote tracking branch only if local worktree is clean; never reset, force-pull or touch pre-existing stashes. Preserve original `feature/p3-worker-harness-design` untouched.

Follow `AGENTS.md`. Read ONLY `docs/work-orders/P5_1_FILE_EDIT_VERTICAL.md` and the existing `scripts/commander.mjs` plus its test. No long P3 histories, model comparisons, repeated installers/doctor or P5 18-case regression.

## Accepted baseline

- P5 final **PASS and selectively released on main**. Real Pi 1.0.4 -> Claude Code CLI -> Pi text/artifact workflow, exact NVIDIA Super `:free`, strict result match, lifecycle reviewed after 18/18 offline tests. Existing text-only invocation MUST still work.
- P5 source and test Git blobs promoted without modifications. 88 unfinished P3 exploration commits deliberately NOT merged to main; they remain on the archived feature branch.
- Native file-edit and actual Skill invocation NOT RUN. Overall Worker READY = NO.

## ACTIVE — P5.1 first actual toy file edit (APPROVED)

Build one **real synthetic code-file edit** through actual Commander -> official Claude CLI native `Read/Edit/Write` -> host `node --test` -> returned Pi result. Use a newly generated off-repo tiny JS fixture (e.g. broken sum function -> expected 42), no real source/privacy exposure.

Official existing tool capability FIRST; enable file tools only for this explicit opt-in mode with native `--restricted` scope and isolated settings/home, no Bash/network/MCP/Shell or paid models. Do not write a new agent framework, custom Skill loader or duplicate Commander. Preserve the original text-only entrypoint and child safety safeguards. If the native file permissions cannot safely confine access to the fabricated workspace, STOP the live tool-capable run and report BLOCKED, not false PASS.

Execute in **one Codex batch**: focused offline checks, <=4 total new CLI prompt attempts, successful toy edit & host test & real Pi received result when safe; sanitized evidence and one feature commit/push. No main merge or package installation. After Codex returns, one independent Claude review, zero repeat model/API tests. Report in Korean with actual results and explicit NOT RUN.
