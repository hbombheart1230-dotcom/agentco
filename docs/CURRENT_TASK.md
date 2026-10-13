# Agentco Current Task — P5.2 Pi Interactive Harness Routing

Canonical Windows workspace `C:\Agentco`, **assigned branch `feature/p5-2-interactive-routing`**, based on released main `bb1ccc71a5b72446c93022c01876f0a24e9ac135`.

Follow `AGENTS.md`. Read ONLY `docs/work-orders/P5_2_INTERACTIVE_HARNESS_ROUTING.md`, the actual `pi-dev/settings.json`, `scripts/pi.mjs` and `scripts/commander.mjs` as needed. Do NOT reload earlier P3/P5 task histories or rerun old 22-case process tests. Existing P5/P5.1 main release and source are validated.

## ACTIVE — authorized one Codex execution batch (2026-10-13)

User explicitly requests (1) normal Pi interactive **automatic external Worker dispatch** and (2) a **named Worker override** choosing Claude, Codex or Hermes. The model-callable Pi extension tool and explicit `/harness <auto|claude|codex|hermes> add42` slash command must use one shared native delegation path. `/harness status` accurately reports readiness; auto selects ONLY safe verified Worker capabilities.

REQUIRED: Real Pi session -> **Claude CLI** toy `add42` -> real same-session Pi toolResult; direct `/harness claude add42` must run real Claude CLI without nested Pi. Reuse installed official Pi `registerTool`/`registerCommand`, existing `scripts/commander.mjs` safe worker process logic and exact NVIDIA Super OpenRouter free route. Do not alter the usual Pi Ultra default model or existing native subagent/security/Skill settings.

IN THE SAME BATCH: inspect installed Codex and Hermes native help/safe child-only auth and exact free/model/auxiliary rules; when truly safe, implement and smoke their **text-only synthetic** named route and enable in auto READY list. If unsafe/unverified, respond honestly `NOT_READY` with one specific reason, no silent fallback, paid model, global auth/profile changes or added installs. No new common Skill execution adapter, daemon, general-purpose manager, server or new packages.

**ONLY owned fixed synthetic jobs**, e.g. `add42` and optionally proven `edit42`. Pi must not send source, session text, user/company/private files or arbitrary freeform task contents into external model prompts. Reject unsupported direct jobs. No generalized user-code editing permission.

One substantial batch: limited focused offline tests; <=8 new top-level CLI model prompts; minimal real Pi auto and explicit smoke, truthful local ignored evidence; one scoped feature commit/push. Preserve all user data, local sessions, credentials, node/runtime, settings unrelated to the one new extension, two stashes, historical branches and main. Report PASS/PARTIAL/NOT_READY by harness entirely in Korean.

After Codex completion: **freeze feature branch** until one independent Claude review (no fresh models), then GPT/user decide final acceptance. Do not main-merge without a later release decision.
