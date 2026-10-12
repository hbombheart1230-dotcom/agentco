# Agentco Current Task

This is the only default execution entrypoint for Codex/Claude. Follow `AGENTS.md`, inspect Git/status directly, and read only the minimum specified task context.

## Current action

**P2.3: evidence amendments complete; Claude evidence-only follow-up pending.** Reviewed implementation remains `5037e417a5fa6a9cc29852d79204cf3c43d34592`. The work order now separates Codex-recorded live invocation/final-clone evidence from Claude-independent checks and states baseline/provenance limitations; GPT/user final PASS and merge remain pending.

## Required context

- `AGENTS.md`
- `docs/work-orders/P2_SHARED_SKILLS.md` — **P2.3 conditional-pass evidence closure** section and **P2.2 final evidence** subsection only; follow linked evidence as needed
- current branch/HEAD/status and local ignored `results/p2-2/` evidence relevant to these claims, **without inspecting credentials, sessions, or private test payloads**

## Codex closure

Retained relevant evidence was re-inspected; no model call, regression suite or bootstrap rerun was needed. Only this file and the work order changed. Keep implementation SHA, ignored evidence, recovery stash and runtime unchanged; no main merge. The documentation commit/push completes this executor scope.

## Next handoff

Claude performs a **short evidence-only follow-up** on the new document commit (no full re-review or model call), distinguishing self-reported Codex evidence from independently observed results. GPT/user then decide final PASS and main merge.
