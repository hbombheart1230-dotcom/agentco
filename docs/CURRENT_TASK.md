# Agentco Current Task

This is the only default execution entrypoint for Codex/Claude. Follow `AGENTS.md`, inspect Git/status directly, and read only the minimum specified task context.

## Current action

**P2.3 — close the Claude CONDITIONAL PASS evidence gaps for P2.1+P2.2.** The tested implementation SHA is `5037e417a5fa6a9cc29852d79204cf3c43d34592`. Claude independently confirmed native Pi discovery/diagnostics, settings, ownership and doctor 28/28; the remaining issues are documentation/evidence gaps, not a known implementation failure.

## Required context

- `AGENTS.md`
- `docs/work-orders/P2_SHARED_SKILLS.md` — **P2.3 conditional-pass evidence closure** section only; follow linked implementation evidence as needed
- current branch/HEAD/status and local ignored `results/p2-2/` evidence relevant to these claims, **without inspecting credentials, sessions, or private test payloads**

## Codex action

Reconcile the original model-invocation and exact-SHA fresh-clone claims against retained evidence, add a concise truthful tracked evidence summary, and update this task's status. If evidence is absent, label it NOT VERIFIED and run only the missing safe targeted check if needed. Do not rerun the complete smoke or destructive bootstrap in the canonical workspace. Preserve the named recovery stash, user changes and all local runtime. Commit/push documentation-only corrections on the feature branch; do not merge main.

## Next handoff

Claude performs a **short evidence-only follow-up** on the new document commit (no full re-review or model call), distinguishing self-reported Codex evidence from independently observed results. GPT/user then decide final PASS and main merge.
