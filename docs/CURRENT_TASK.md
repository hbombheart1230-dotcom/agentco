# Agentco Current Task — P5.10 Ultra :free as every native Main startup model

**ACTIVE / 2026-10-14**

Workspace: `C:\Agentco` (personal only).
GitHub feature: `feature/p5-10-ultra-defaults`.
Base origin/main: `ba104a6b4661298b8cb17dd0f010b8309da76580`.

**Read only this file and `docs/work-orders/P5_10_ULTRA_NATIVE_DEFAULTS.md`**, then effective native settings/nonsecret metadata and directly related focused tests. Do not reread completed P3–P5.9 reports or old gate suites.

The user requested exactly `nvidia/nemotron-3-ultra-550b-a55b:free` (OpenRouter) for initial native launch of **Pi, Claude Code, Codex CLI and Hermes**. Prefer minimal persistent local native configuration edits, not new launcher model overrides.

- Pi Main 1 already Ultra :free: confirm and preserve.
- Codex Main 3: native `C:\Users\mush2\.codex\config.toml` model -> Ultra :free; keep OpenRouter provider and key variable name, all unrelated keys.
- Hermes Main 4: native `C:\Users\mush2\AppData\Local\hermes\config.yaml` main, already-pinned auxiliary/task and delegation model fields -> Ultra :free, preserve provider, disabled title/compression and empty fallbacks; DO NOT touch native dotenv secret entry.
- Claude Main 2: native `C:\Users\mush2\.claude\settings.json` main model -> Ultra :free, set supported role aliases (Opus/Sonnet/Haiku/Subagent, plus only confirmed installed-version aliases) to same Ultra in nonsecret env settings. P5.9 gateway/base URL/token child-env path unchanged. Non-Claude NVIDIA compatibility and theme/onboarding issues still unproven.

Safely back up *each local native settings file that changes*, no secret copying/output or Git upload, no auth/login/inference. No price checks, no new execution gates, no special provider/model flags, no vendor patches. Keep Pi, P5.4 Worker/AUTO, P5.9 Main launcher, 2 stashes, sessions/browser/Agentra unchanged.

Codex: local implementation + focused non-inference validation; push sanitized docs and only truly necessary tests on feature. Claude: independent delta + sanitized local verification. GPT/user: final release decision; **no main merge yet**. 
