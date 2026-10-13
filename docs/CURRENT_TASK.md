# Agentco Current Task — P5.6 released; no new implementation assigned

**P5.6 CLOSED / PARTIAL PRODUCT ACCEPTANCE (2026-10-13)**

## Release accepted

- **Reviewed runtime implementation:** `d368be13ee589e09aae52486af08000b44222d19` + final explicit native-default UX `2a4bab3042f9b4df5ede129184eac02170677908`. Both independently reviewed PASS, no required fixes. Focused opt-in correction tests: 11/11 PASS, no inference/API prompt/login during review.
- Pi native default and P5.4 `add42` AUTO/Worker source unchanged.
- Codex Main configured through native, child-only OpenRouter Responses overrides for exact `nvidia/nemotron-3-super-120b-a12b:free`; public prompt/completion price both 0 required at launch. Menu 3 starts Codex TUI with model shown. **Live inference compatibility is NOT RUN; model changes after startup and pricing changes are not globally locked.**
- Claude Code does **not** officially support the non-Claude NVIDIA route in its gateway. Hermes free-only auxiliary/fallback behavior is unproven. Their automatic free routes therefore fail closed. To preserve P5.5 native TUI access, menu 2/4 prompts `[y/N]` with cost/login warning; only `y/yes` opens original native CLI. Explicit scripted form `agentco --main claude --native-default` or `agentco --main hermes --native-default`. **These native sessions may require login or incur charges if later used; they are not free-model readiness claims.**
- Original profiles/auth/session/stashes/runtime and separately parked browser branch preserved by Git changes. User's canonical workspace remains `C:\Agentco` and remote main authoritative; do not disturb working local files.

## Next priority is not assigned

Potential future work (requires user direction): narrowly authorize a *synthetic*, non-sensitive Codex free inference smoke with fresh public zero-pricing check; investigate official Hermes auxiliary/fallback controls without global settings modification; separately decide an acceptable Claude Code provider/model strategy. Do **not** silently route to paid models or merge company coding-agent context. Natural-language general harness handoff and Samsung POP browser remain separate.

## Context discipline

Start here, then read only a new approved work order and needed live source files. Archived evidence: `docs/work-orders/P5_6_NATIVE_FREE_MAIN_LOGIN.md`. Avoid re-reading P3–P5.5 history and rerunning their accepted tests.
