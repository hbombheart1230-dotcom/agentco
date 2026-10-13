# P5 Commander MVP — FINAL PASS / released to main

**Final acceptance:** 2026-10-13. Reviewed source commit on preserved P3 feature branch: `dc56eb5`. **Promotion method: exact blobs only**, not fast-forward of the entire experimental P3 branch. Codex implemented, Claude independently reviewed, GPT/user accepted the verified synthetic-text pipeline. The independent reviewer reported **18/18 offline tests PASS**, zero model/API calls, no required unresolved defects.

## Accepted vertical slice

```text
Human synthetic request -> Pi 1.0.4 Commander (official Extension tool)
 -> installed Claude Code CLI Worker using exact OpenRouter NVIDIA Super :free
 -> structured Worker result -> native Pi toolResult -> Pi final output
```

- Working example result from previous bounded live integration: `HARDENED_PAYLOAD=137`, Worker/toolResult/final exact correspondence, same observed free model for both participants. The final lifecycle patches after that test were **offline reviewed**, not retested live.
- Delivered unchanged reviewed files: `scripts/commander.mjs`, `scripts/commander.test.mjs`.
- Strict match/failure behavior, bounded timeouts and descendant cleanup with direct ChildProcess ownership, PID/creation-time checks for orphan records, scoped CLI override `AGENTCO_CLAUDE_CLI`, local key redaction, model public-zero-price gate, no other provider fallback.
- Windows CLI prerequisite check (no provider/key request): `node scripts/commander.mjs --check`.
- Synthetic-only real route: `node scripts/commander.mjs "Delegate this synthetic task to Claude: return exactly HARDENED_PAYLOAD=137. Return the worker output verbatim."`.

## Honest limits, non-blocking future work

1. **Text/artifact delegation only.** Claude native Read/Write/Skill invocation and Pi-to-Claude code-edit project workflow are NOT YET VERIFIED. Overall `WORKER READY = NO`.
2. `taskkill /T` success is accepted as attempted subtree cleanup, not proof of every descendant's death. Windows orphan PID identity check-before-taskkill has a narrow race; parent-already-exited descendant-held pipes can yield a bounded error with unverified subtree cleanup. Forced helper crash, OS permissions and Ctrl+C at console have no universal guarantee.
3. Preinstalled compatible Node/Pi/Claude Windows CLI and authorized OpenRouter key are required; process-only `AGENTCO_CLAUDE_CLI` points to a trusted binary that receives auth. No Linux portability claim.
4. No private/user/company repository data or credentials may be submitted to the free model. The runtime operates in ephemeral synthetic workspace with no model-visible filesystem tools; do not treat cwd alone as a security sandbox.
5. Provider physical HTTP counts and actual billing remain unverified; advertised public prompt/completion pricing of exact `:free` slug was 0 at validation time. No assertion about today's quota.

**Follow-on:** P5.1 reusable Pi -> Claude workflow with a disposable synthetic file edit, official tool surfaces and no custom framework; benchmark comparisons/other workers remain deferred. Full detailed review history remains archived on `feature/p3-worker-harness-design`, whose incompletely verified P3 commits were deliberately **not** released to main.
