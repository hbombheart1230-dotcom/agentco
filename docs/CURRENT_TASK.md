# Agentco Current Task — released Pi interactive routing baseline

**P5 / P5.1 FINAL PASS; P5.2 Claude-only interactive routing FINAL PASS (2026-10-13).** Source implementation `e863179f0171bb04eafa38190cb75ea7633d7d4e`, accepted after Claude independent evidence-only review. Normal Pi 1.0.4 RPC session auto tool routing and direct slash command both executed actual installed Claude CLI and returned the fixed synthetic `ADD42=42`. **Three-harness coverage PARTIAL**, since Codex and Hermes remain **NOT_READY**, correctly refusing named execution without fallback.

## Current usage

From `C:\Agentco`, run `node scripts/pi.mjs`. Intended Pi tool: `agentco_delegate` on explicitly synthetic `add42`. Pi command: `/harness status`, `/harness auto add42`, `/harness claude add42`, `/harness codex add42`, `/harness hermes add42`. Only Claude route is validated to perform the named fixed task, and an unknown job/real file/user private text MUST be rejected; Codex/Hermes return NOT_READY without new model calls. The actual RPC session flow is verified, **TUI keyboard/rendering E2E is NOT RUN**.

Standalone accepted P5 and P5.1 entrypoints remain `node scripts/commander.mjs --check`, text-only synthetic request, and `node scripts/commander.mjs --toy-edit`. The main Pi default Ultra `:free` and the Claude worker Super `:free` are not the same model. No general project code edits/Skill execution, arbitrary text forwarding or combined three-harness READY claim. Physical HTTP counts and billing unknown.

## Verification and source of truth

Claude reran 4/4 new P5.2 offline tests PASS, 0 fresh API/model calls. Real same-session RPC evidence and two Claude Worker result artifacts are retained under machine-local ignored `results/p5-2/`. Refer ONLY to the final closure in `docs/work-orders/P5_2_INTERACTIVE_HARNESS_ROUTING.md` and current tracked implementation; skip completed P3/P5/P5.1 history. The exact reviewed implementation files are unchanged.

## NEXT — not approved yet

One separately scoped real-product advancement: resolve native Codex and Hermes **safe, free-only, tool-free synthetic invocation** and enable named routes after verified smoke; or expand the Claude-only toy job set while retaining owned data and isolation. No generic four-harness Skill adapter, new agent framework, benchmark, user/private source code handling, or host-global changes. Default roles: user priority/direction, GPT architecture/final technical decision, Codex implementation, Claude independent verification. Any new implementation requires a new approved work order on a new feature branch. Keep upstream Pi unchanged and preserve user sessions/runtime/auth/PATH/ignored results and all stashes.
