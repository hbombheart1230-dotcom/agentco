# Agentco Current Task

This is the default execution entrypoint for Codex/Claude. Follow `AGENTS.md`; inspect live Git/status first, and read only the minimum current context.

## Current action

**P2 FINAL PASS (2026-10-12) — approved fast-forward merge to main.** GPT reviewed Claude's evidence-only PASS at implementation `5037e417a5fa6a9cc29852d79204cf3c43d34592` and documentation evidence `e1a0f60027ce59e62aa298d6f7a042bf03e382a7`. No functional blockers. Reused model-dependent smoke was 14/14 on second run after a Groq marker omission on first run; it was not independently rerun. Exact-SHA fresh-clone and live invocation provenance/limits are recorded in the work order.

## Required context

- `AGENTS.md`
- `docs/work-orders/P2_SHARED_SKILLS.md` — final evidence and completion/merge notes only if needed
- actual local/remote Git HEAD, branch, status, ancestry

## Codex merge action

1. In canonical `C:\Agentco`, check branch, fetch, status and current `origin/main` / `origin/feature/p2-shared-skills-design`. Check there are **only authorized documentation-only commits** after independently verified implementation `5037e417...` and evidence `e1a0f600...`. If dirty work, unexpected commits, origin drift, or a non-fast-forward is detected, STOP and report; do not reset, force-push, clean or overwrite.
2. Fast-forward the approved feature branch into `main` with `--ff-only`; push `origin/main`, verify remote SHA equals the fast-forwarded HEAD. Never rebase/squash/change verified implementation files as part of merging.
3. Preserve the feature branch, ignored results, runtime, auth, user work and **all existing stashes**, including retained recovery stash `0c43cbd1b330fad177cecfbc24a3d7a95f26c397`. Do not delete anything or run a new model/smoke/bootstrap regression merely for the docs-only finalization.
4. Report only `MAIN SHA / ORIGIN SHA / MERGE METHOD / GIT STATUS / NEXT`. If this approved P2 merge is already completed by another actor, verify and report without a new merge.

## After merge

P2 is CLOSED. **Next: P3 worker-harness installation/evaluation work-order design, pending user/GPT scope approval. Do not install Hermes, Claude Code or Codex CLI or begin P3 implementation until a new work order is approved.**
