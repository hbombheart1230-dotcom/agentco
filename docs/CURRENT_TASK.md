# Agentco Current Task — P5.9 released; Claude auxiliary defaults pending

**P5.9 CLOSED / REVIEW PASS / PARTIAL MODEL COMPATIBILITY ACCEPTANCE (2026-10-14)**

## Released behavior

- Independently reviewed implementation `e35191fedfc2c8b4ab670a087b22daa3df4f9aec`: PASS. Associated offline tests **15/15 PASS**. Latest scope details: `docs/work-orders/P5_9_NATIVE_CONFIG_SIMPLE_LAUNCH.md` final review section.
- Simple 4-native-TUI menu: one choice to launch Pi, Claude Code, Codex CLI or Hermes. Agentco's custom `nativeFreeMain` pricing/model/compatibility blocks and redundant Codex model arguments removed as user requested. Native CLI user config controls providers/models; Agentco supplies the existing root `C:\Agentco\.env` OpenRouter key to non-Pi child processes. No automatic prompts/model calls.
- Pi, `--delegate ... add42` synthetic Worker/AUTO, Codex `--no-daemon`/child TERM, shared Skills/native terminal transport and unrelated Agentra/browser work unchanged.
- Codex and Hermes persist native OpenRouter exact `nvidia/nemotron-3-super-120b-a12b:free` defaults; actual native TUI startup PASS, **live inference NOT RUN**. Hermes native-home key was matched to root key in locally backed-up dotenv, but remains a second physical credential copy; future root-key rotation requires sync.
- Claude receives OpenRouter Anthropic-compatible gateway env variables in the **child**, and native settings contain its exact requested NVIDIA model and nonsecret base URL. TUI opens but initial onboarding/theme remains; unknown-model catalog warning is observed. **Non-Claude model support / live response is UNVERIFIED**, do not interpret startup as success.

## Important pending item before any Claude chat

Claude main provider aliases `ANTHROPIC_DEFAULT_HAIKU_MODEL`, `ANTHROPIC_DEFAULT_SONNET_MODEL`, `ANTHROPIC_DEFAULT_OPUS_MODEL`, `CLAUDE_CODE_SUBAGENT_MODEL` and installed-version small/fast variants were **not pinned** to the requested `:free` model. Possible unexpected **paid** auxiliary calls if Claude is used with its defaults. The user asked to eliminate restrictive launcher gates, NOT to guarantee no billing. Prefer a very small next user-approved native-config setting fix rather than rebuilding free-only execution checks. Even aliases pinned cannot establish NVIDIA Messages API compatibility or no future price changes. Do not run a live Claude model test silently.

## Next work is not yet assigned

Potential separate checks: installed Claude Code alias default support and locally persist nonsecret defaults before live Claude chat; standalone CLI key env preparation; a user-approved non-sensitive tiny inference smoke (separately for Codex, Hermes, Claude); possible `--help` without key. No new implementation/silent model calls assigned. GitHub origin/main is authoritative, and local `C:\Agentco` checkout/stashes/native settings/backup/auth/runtime/browser profile must be preserved.

## Context discipline

For new work start here plus a fresh approved work order and only necessary current source. Do not reread completed P3–P5.8 history, recycle obsolete free-price-gate tests or replay old broad suites.
