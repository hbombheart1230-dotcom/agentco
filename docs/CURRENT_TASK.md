# Agentco Current Task — P5.7 one root .env for native provider workflows

**ACTIVE / ASSIGNED (2026-10-13)**

Workspace: `C:\Agentco` (personal only).
Git feature: `feature/p5-7-shared-env-native-providers`.
Base remote main: `7fcefb4bb6fe1a576ca42e93b7ca5b872a1f22aa`.

## Read minimum

1. This file.
2. `docs/work-orders/P5_7_SHARED_ENV_NATIVE_PROVIDERS.md`.
3. Live `scripts/env.mjs`, `scripts/agentco.mjs`, `scripts/native-free-main.mjs` and only directly relevant tests and installed CLI help/config metadata.

Avoid P3–P5.6 historic work orders and old test suites.

## User's exact direction

The **single canonical OpenRouter credential source** is ignored `C:\Agentco\.env`, for **Claude Code, Codex CLI and Hermes**, not Hermes alone. Each native TUI requires **officially supported** provider selection as well as its child receiving the appropriate credential. No vendor OAuth signup, Nous subscription login, or global CLI profile copies merely to find the key.

- **Pi:** existing root env + Ultra free unchanged.
- **Codex:** P5.6 already reads root env, injects child-only OpenRouter key, sets exact NVIDIA Super `:free` model and zero-price launch gate. Preserve implementation; live chat NOT RUN.
- **Hermes:** investigate native OpenRouter provider + free-model route, child-only root env; independently prove or disable ALL paid auxiliary/fallback routes. If impossible safely, keep guarded and explicit `--native-default` path.
- **Claude Code:** official gateway does NOT support non-Claude NVIDIA; path/key alone cannot fix this. Never spoof compatibility or force a paid/subscription login. Keep transparent `CLAUDE_UNSUPPORTED` and optional explicit native-default unless an officially supported exact free Claude route is proven.
- P5.4 AUTO/Worker, P5.5 TUI behavior, P5.6 opt-in and Codex free settings all preserved.
- Preserve local creds/profiles/auth/stashes/browser and all dirty/untracked files. Never print or inspect secret values. Do not invoke models or run live inference without separate approval.

Codex: minimal implementation or truthful diagnostic report, scoped focused tests, commit/push **feature only**. Claude: independent delta-only review. GPT/user: release decision; no main merge yet.
