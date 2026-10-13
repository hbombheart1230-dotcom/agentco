# P5.1 — Real Claude file editing through the existing Pi Commander

**Status: APPROVED / ACTIVE (2026-10-13).** One sizable Codex implementation batch; one final independent Claude review. New branch `feature/p5-1-file-edit` starts from released `main` `03245540e7ae2e30bb232430f1e00a03b1e97280`. **Do not revive the old 88-commit P3 experimental branch.** The user wants functional delivery before benchmark/model/harness comparison and insists on vendor-native code and reusable official features FIRST, no new custom framework.

## Accepted base (DO NOT repeat)

- P5 synthetic-text Pi -> installed Claude CLI -> Pi delegation closed FINAL PASS, independently reviewed 18/18 offline tests, same pinned OpenRouter `nvidia/nemotron-3-super-120b-a12b:free`. Source is `scripts/commander.mjs` on main. Existing `node scripts/commander.mjs --check` and text-only usage must remain working.
- Historic 2026-10-12 real text/artifact run `HARDENED_PAYLOAD=137` PASS; lifecycle patches afterward reviewed offline, not re-run live. No need to re-run P5 text-only model smoke or old process-test cases for this feature.
- Claude Code native `--restricted` previously showed in-root Read and denied out-of-root Read/Write on owned synthetic canary. `--bare` sets `CLAUDE_CODE_SIMPLE` and can suppress Write/Skill tool inventory; use official installed-version flag semantics, not assumptions about `--allowedTools`. Native Skill invocation is separately deferred.
- Existing `shared/skills` single authoring source and future native views remain untouched. No custom Skill loader or Pi-agent framework.

## Target: genuine file-edit vertical slice in a toy JavaScript project

```text
Human "Fix fabricated function" 
 -> real Pi Commander decides to dispatch
 -> installed Claude CLI, official native Read/Edit/Write, in an owned off-repo synthetic project
 -> actual fixture code file changed by Claude's native file tool
 -> host verifies changed content, runs narrowly scoped `node --test`
 -> structured Worker result and test pass come back as Pi toolResult
 -> Pi final answer mirrors validated worker result
```

The test fixture should be tiny, deterministic and **synthetic**: e.g. `sum.js` intentionally returns wrong result, `sum.test.mjs` expects 7+11+24 = 42; work only in a newly created temp directory. A real edit must be observed (content before/after differ, expected fixed behavior), not a prose claim. `node --test` is performed by the trusted host helper **after** Claude completes, never by shell command tools given to Claude. Keep the task narrow; one source file edit, one test, one received result.

### A. Reuse official native tools; do not create unnecessary adapters

1. Extend **the existing `scripts/commander.mjs`** with an explicit opt-in mode such as `--toy-edit`. Keep the original default synthetic text path unchanged. Do NOT create a second orchestrator, a custom Skill adapter, a daemon, MCP server, system installer, agent package or general workspace runner.
2. In toy-edit mode allow native `Read,Edit,Write` or the smallest exact installed-version-supported set for Claude CLI. Confirm exact CLI flags locally via `claude --help` and the already known `--bare` simple-mode behavior. Adjust **child-process-only** simple-mode/setting options to make file tools available; do not relax restrictions globally, load real user settings, read real home/skills/session files or permit Bash, PowerShell, WebFetch, Search, MCP, Agent, shell or fallback models. Reuse existing temporary Pi Extension tool `claude_worker`; no duplicate native `subagent` registrations or package installations. Native Skill execution is NOT required for P5.1.
3. Explicitly enforce the installed Claude CLI's native restricted file-tool permission boundary to owned toy cwd and only the tiny fixture; real project/parent/private paths must not be accessible to model tools. `--restricted`, toy-only `cwd`, child-scoped homes, allowed tools + permissions and official project settings are preferred. A cwd by itself, `--sandbox read-only`, or hiding prompt text is **not** proof of filesystem isolation. If official native controls demonstrably cannot confine Read+Write outside owned toy directory, do not run live file-tool model prompts: report precise BLOCKED and preserve the working P5 text pipeline. A single cheap already-known canary denial may be reused rather than running a huge security suite.
4. Both Commander and Worker use exact `nvidia/nemotron-3-super-120b-a12b:free`, no auto/paid/secondary/auxiliary fallback; verify current public zero pricing before any new live model prompts. Use only approved local OpenRouter key opaque in env. Never send actual repo files, company/personal content, user chats, auth or secret paths to free providers.
5. Keep strict result correspondence: return a structured short `FILE_EDIT_RESULT=PASS` style payload **only when** real file content changed, host `node --test` succeeded, and native Worker execution/model/tool evidence supports the operation. The host directly verifies file bytes and test output. Pi final must match toolResult/validated Worker output through existing `validatePipeline` contract (adapt minimally as needed). False/missing edits, model prose-only claims, wrong result or unexpected extra writes = FAIL, nonzero exit.

### B. One real minimal integration, focused offline negatives

- Provide one easily copyable PowerShell command from `C:\Agentco` using the new opt-in mode. It must actually exercise `Pi -> Claude CLI -> synthetic file edit -> host test -> Pi` without manually copying source or Worker output between prompts.
- Live budget **<=4 NEW CLI top-level prompt attempts total** across Pi and Claude; one successful end-to-end roundtrip should need two CLIs. A CLI prompt can yield many model requests; report this honestly and avoid retry loops.
- Focused zero-model offline fixtures: no-op edit or wrong source does not PASS; test failure does not PASS; Worker result missing/mismatched does not PASS; preexisting P5 text mode remains syntactically compatible; no new process security investigation. Do NOT rerun 18 previously accepted process tests unless code changes directly require it.
- Bound timeouts/output, retain existing reviewed direct-child/orphan cleanup and lifecycle/no-raw-key evidence handling. For real code edit, log only nonsecret fabricated filenames/hashes/status. Never log authorization key, raw full environment, private working tree, session or unrelated process PIDs.
- Use existing Node stdlib and native CLI, no new third-party runtime dependency; a few extra transparent lines in current helper are better than a new architecture.
- If no safe official tool permission path, complete offline function design and report precisely P5.1 PARTIAL with one needed official boundary capability. Do not fake file-edit success by directly writing source in the host on behalf of the model.

### C. Deliver as one batch

- Modify only `scripts/commander.mjs`, `scripts/commander.test.mjs` as needed, `docs/CURRENT_TASK.md` and this P5.1 work order, plus optional tiny harmless toy fixture in ignored `results/p5-1/` rather than permanent product folders. Keep root setup, `pi-dev/`, `shared/skills/`, user auth/PATH/settings/runtime/session/stashes and past P3 branch untouched.
- Run `node --check`, focused offline acceptance, one bounded live toy edit if safe, `git diff --check`, and verify before/after source bytes, tests, Pi toolResult/final correlation, exact-free model route and no secret-bearing evidence. Evidence in ignored `results/p5-1/`, with only sanitized summaries.
- Stage explicit files, one commit/push **to this feature branch only**. No main merge by Codex now. Short Korean results: `tool invocation observed? | fixture edit? | node --test? | Pi result? | model route | code delta | evidence | next`. Honest `NOT RUN` status where applicable. If P5.1 works, one Claude independent evidence-only review, then GPT/user may selectively promote verified P5.1 to main.
- All user-visible reports **한국어로 작성**, no intermediate user approvals for pre-authorized synthetic-only changes; if unsafe/paid/global installation or user data would be required, BLOCK that operation and report rather than changing constraints.

**Acceptance:** actual owned fabricated code file modified via installed Claude Code native file tool, trusted local test passes, Pi receives structured successful Worker result, final matches, no real user repo data transmitted, exact free model confirmed. This is **P5.1 toy edit PASS**, NOT permission to modify private projects/claim general Worker READY or perform model/harness benchmarks.
