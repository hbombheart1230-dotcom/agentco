# Agentco Current Task

Canonical workspace `C:\Agentco`; branch `feature/p3-worker-harness-design`. Follow `AGENTS.md`. Read ONLY **"Final direct-child cleanup fix — close P5"** at the end of `docs/work-orders/P5_PIPELINE_MVP.md` and inspect `scripts/commander.mjs` plus its test directly. Completed P0-P3 work orders, installations, previous model benchmarks and historical review discussions are out of scope.

## Accepted results from independent Claude review of `ed9e280`

P5 Pi -> Claude CLI -> Pi routing and exact Worker/toolResult/final correspondence previously PASS; same exact NVIDIA Super OpenRouter free-only route. Retiring completed Worker PID and skipping stale/mismatched/unverifiable **file-record orphan PID** have independently passed. No model calls during review.

**Required one regression fix:** if native PowerShell process-identity lookup fails, `runBounded` can detach a still-live **directly spawned child** and leave it running (potentially holding provider auth). This is a direct-child lifecycle bug, distinct from untrusted orphan PID cleanup. Overall P5 hardening still PARTIAL until corrected. WORKER READY for native Skill/file tools remains NO.

## ACTIVE — final focused P5 code/test correction (APPROVED)

Execute one Codex batch without intermediate approval:

- For a still-live directly spawned child with an owned Node ChildProcess handle, clean up the child/process tree on timeout/abort/identity failure/output overflow; use official Windows native taskkill for its owned tree when possible, `child.kill()` for direct-child fallback; never treat `unref` alone as cleanup. Ensure bounded failure, nonzero status, and no untracked live process silently abandoned.
- For separate **orphan file records**, retain strict PID plus `StartTime` identity checking and fail closed if stale or uncertain. Never blindly kill a PID from a file; don't revive retired Worker records.
- Focused offline mock-child/grandchild tests specifically exercise unknown/failed identity and orphan-finally code path; preserve unrelated process, do not repeat model or provider calls. Keep existing native tool/Skill tests deferred.
- Code changes only `scripts/commander.mjs`, `scripts/commander.test.mjs`; update this pointer and P5 work order with accurate short delta. One feature-branch commit/push, `git diff --check`; preserve Pi source, settings, sessions, auth, PATH, shared Skill, main, 2 stashes. No new packages/framework.
- Report **in Korean**. After result, one final Claude independent focused review, zero inference; GPT/user close P5 and then move straight to **real synthetic file-edit via the existing Pi -> Claude pipeline**, not further four-harness/model comparisons.
