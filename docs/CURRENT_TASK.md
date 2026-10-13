# Agentco Current Task — P5.6 product UX correction after verified partial implementation

**2026-10-13: P5.6 code review PASS at `d368be13ee589e09aae52486af08000b44222d19`; PRODUCT RELEASE HOLD.**

## Required context — minimum only

1. This file.
2. `docs/work-orders/P5_6_NATIVE_FREE_MAIN_LOGIN.md`, specifically the final section **Release review and narrow correction**.
3. `scripts/agentco.mjs`, `scripts/native-free-main.mjs`, current focused tests, and the relevant current live native executable metadata if essential.

Do **not** reread old completed P3–P5.5 reports or revalidate P5.4 models.

## Current assignment

- Canonical workspace: `C:\Agentco`; branch: `feature/p5-6-native-free-main`.
- P5.6's Codex exact OpenRouter NVIDIA Super `:free` route was independently verified as a native *configuration*, with no actual inference. Preserve it, including pricing gate, credentials protections, `--no-daemon`, TERM and no paid fallback at launcher entry.
- **Regression:** P5.5 had working four native TUI launch choices. P5.6 blocks Claude and Hermes options 2/4 entirely because free-mode compatibility/cost boundaries are not proven. Keep their automatic free paths blocked, but allow **an explicitly acknowledged native-default TUI path** while retaining old trusted native CLI execution semantics. For interactive 2/4 add default-cancel confirmation clearly stating free-only cannot be guaranteed and vendor login may appear; for script usage provide explicit opt-in flag. Never invoke inference or credentials automatically.
- Correct diagnostic order: Claude unsupported/Hermes blocked reason should not misleadingly depend on whether an OpenRouter key is present.
- No P5.4/Worker/AUTO/source changes, Pi changes, global native profile modifications, sign-in bypass, personal financial/browser work, model/API prompt, or unauthorized install. Preserve local changes/stashes/sessions/profiles and browser branch.
- Codex implements and adds small offline tests; commit/push this feature only. Claude independently reviews **new delta only**; GPT/user decide main promotion. A new implementation SHA is required; no code changes are made by this documentation update.

**Current `main` is still P5.5 `1ed95a3ff0432ca1b94e16d6d14506db0d710bac`**. Existing PARTIAL P5.6 implementation remains safely on feature.
