# P5 — Agentco Pi Commander -> Claude Worker: first working pipeline

**ACTIVE / APPROVED (2026-10-12).** User decision: **make the pipeline work FIRST; evaluate harnesses/models, polish security proof and unify remaining Skills LATER**. Execute in one batch, no micro-gates. GPT defines the job, Codex implements/tests/pushes, Claude independently reviews once, GPT/user accept. Work only in personal Agentco, never Samsung corporate materials.

## Canonical environment and already-proven baseline

- Local workspace `C:\Agentco`, branch `feature/p3-worker-harness-design` at initial head `ac8d389`; freeze origin while Codex runs.
- Pi 1.0.4 pinned. Existing upstream `subagent` example (scout -> worker), file tools, prompt templates, Pi extensions and 14/14 smoke were functionally tested in the historical harness baseline. Do not redo them.
- Claude Code CLI 2.1.292 is installed; OpenRouter `nvidia/nemotron-3-super-120b-a12b:free` was verified for text inference; Claude native Read/Write/Skill **visibility** now works without the `--bare` simple-mode filter, but actual Write and Skill **invocation** have NOT passed E2E.
- Three native Skill views already exist: canonical `shared/skills`, Codex project link, Claude project link. Preserve them; no duplicate canonical Skill bodies. Hermes remains deferred.
- `docs/CURRENT_TASK.md` and the appended Round 2 outcome in `docs/work-orders/P3_WORKER_E2E_BATCH.md` contain literal replacement `?` characters from damaged Korean encoding; repair that documentation **once** as prescribed below rather than reproducing it.

## Deliver ONE vertical slice, not another comparison project

The definition of a *functional pipeline* for this task is:

```text
Human -> Pi (Commander) -> bounded task dispatch -> Claude Code CLI (Worker)
      -> machine-readable result/artifact -> Pi receives result -> Human
```

Use only toy/fabricated task data for all model calls. Example: ask Claude to produce a minimal Python `mean` function or calculate `7+11+24=42` from a fabricated input. Actual source edits, agent-level Skill use, full Worker readiness and multi-harness routing are **separate later gates**. A successful text/artifact handoff is a legitimate **PIPELINE MVP PASS**; do not falsely label file-edit/Skill E2E PASS.

### A — Reuse an existing delegation Extension FIRST

1. Reuse already-installed Pi's official `subagent` example for Pi-native handoffs as the baseline. **It may only launch another Pi session; do not falsely claim it natively launches Claude.**
2. Inspect **one or two credible ready-made Pi Extensions** for external Claude Code CLI dispatch, using exact versions and maintained sources. Preferred candidate: community `pi-subagents@0.77.0` ([package](https://pi.dev/packages/pi-subagents), [Claude Code runner docs](https://github.com/nicobailon/pi-subagents/blob/main/docs/agents.md)). It exposes built-in `claude-code` / `claude-code-writer` adapters, but requires verified Windows CLI compatibility and its documented user-auth assumptions must NOT override our OpenRouter free-only requirement. Smaller alternative `pi-cli-subagent` is a possible candidate, but verify maintenance/security before adopting; it is not an official Pi built-in.
3. **Important duplication rule:** do NOT load two competing `subagent` tools (existing official example vs package) in production simultaneously. In an **isolated, throwaway Pi agent directory**, inspect/adopt the community Extension if it can safely route the exact approved free model without changing Claude user auth/global config, accessing private paths, installing broad unwanted dependencies or invoking hidden paid auxiliary models. Pin exact version if accepted; do not auto-upgrade. Reject and document in one line if it cannot.
4. If a ready-made Extension is unavailable or incompatible, use **only the smallest existing Pi-native tool and official `claude -p` mechanism** to perform a no-file-tools synthetic text handoff. One thin transparent repo-local launcher/config (<~100 lines if required) is permissible **only after** demonstrating no off-the-shelf route fits and must not become a manager, daemon, adapter framework, source copier or SDK fork. Prefer zero new code. Do not endlessly evaluate packages.

### B — Make the real Pi -> Claude response path work in one session

- Accept one user-level request in Pi, dispatch it to the actual locally installed Claude Code CLI and return its result **to Pi in the same workflow**, not via manually copying output or having Codex call Pi and Claude separately. Observe distinct Commander and Worker execution events and a final response that includes evidence from the Worker result.
- Use a newly owned ignored `results/p5/pipeline-*/` area and off-repo isolated **synthetic** model cwd (like a fresh owned temporary toy directory); never run free-model agents with private Agentco repository context. Caller must not leak `AGENTS.md`, private source, secrets, memory or real user files into free-model prompts.
- Both model routes **pin the exact same OpenRouter NVIDIA Super `:free`** for this MVP; no paid fallback, auto mapping or other auxiliary models. Do not change global Pi's current Ultra default; override only in this isolated pipeline test. Model calls limited to **<=5 CLI prompt attempts for the whole batch**. No model-selection benchmarking, tool-call scoring or repeat of previous text-test rubrics solely to collect timings.
- Use native model/tool/no-session options and the **least powerful delegation profile** (text-only, or Read-only of fabricated input). Claude writer tools can be tried on fully disposable toy files **only if an enforceable boundary is already supported and demonstrably safe**; otherwise skip file-edit, still complete text handoff. Never disable security checks or grant arbitrary shell/Bash access. No user profile, persistent login, PATH, main, stash or real runtime modifications.
- If an off-the-shelf adapter cannot use our exact free-model provider without real vendor login, switch immediately to the approved minimal native CLI approach instead of blocking the entire P5 pipeline. Never use an existing paid subscription or brand new token as an implicit fallback.
- Output one unambiguous practical start command using existing `agentco` / `node scripts/pi.mjs` and a copyable demonstration request. Avoid extra launch steps/user interaction except explicit local key availability and normal native confirmation prompts. An actual user can reproduce the Pi -> Claude roundtrip in a toy project.

### C — Preserve project, repair corrupted docs, and hand off

- **Repair confirmed encoding corruption**: rewrite `docs/CURRENT_TASK.md` cleanly to point at this task; in `docs/work-orders/P3_WORKER_E2E_BATCH.md`, replace ONLY the corrupt appended `## Round 2 ?? ??` outcome block with a short accurate **ASCII-English** historical summary based on existing validated report and ignored evidence. Keep previous intact sections, preserve original bad bytes in Git history, and don't invent lost prose. Windows writes must be UTF-8; automated integrity check should reject literal runs of `???`, replacement U+FFFD in changed docs. Future status reports **Korean only**.
- Minimal code/config only if essential for a user-operable pipeline. Prefer a small native extension setting/prompt to custom source. Keep canonical Skill source/link untouched; metadata may be reused and basic Skill injection is optional, never gate pipeline on prior synthetic Skill invocation failures.
- 1 compact evidence/report: `Pi started? | Claude CLI actually invoked? | exact model | Worker output returned into Pi? | final Pi response | new files/config | actual tool/file E2E NOT RUN`. Save sanitized logs only under ignored `results/p5/`.
- Normal `git diff --check`, focused startup/smoke plus reproducible pipeline test, stage only intended files, **one commit/push** to feature branch. Preserve user `.env`, existing sessions/runtime/PATH, all stashes, main, VS Code versions. Do not run a full regression or re-audit old P3 gates.
- Claude independent reviewer performs **one end-of-batch diff+evidence review**, no repeated model/API calls; user reports and handoff **in Korean**. No intermediate Git edits by GPT while Codex is executing.

## Success/fail semantics and next scope

- **P5 PIPELINE MVP PASS**: human request processed by real Pi, real Claude Code CLI invoked under pinned free route, nonempty Worker result observed by Pi and included in final Commander response, startup command and evidence reproducible.
- **P5 PIPELINE MVP PARTIAL**: one component not wired (say exactly which), even if Pi and Claude each work separately; preserve any functional progress and include *one shortest remaining action*.
- **WORKER READY = NO** until genuine native Skill invocation/file-edit/security E2E passes. No P4 harness comparison, Ultra vs Super comparisons, Hermes/Codex integration, P6 routing, background daemon, UI, browser or new paid models in this phase.
