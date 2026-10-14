# P5.10 — Set one OpenRouter Ultra :free model at native Main startup

**Status:** ASSIGNED / local Codex implementation pending (2026-10-14)
**Feature:** `feature/p5-10-ultra-defaults`
**Base:** `main` = `ba104a6b4661298b8cb17dd0f010b8309da76580`
**Workspace:** `C:\Agentco` (PERSONAL Agentco only, not Samsung internal/OASIS)

## Single user request

At **initial launch**, standardize all 4 Agentco native Mains to the exact OpenRouter model:

`nvidia/nemotron-3-ultra-550b-a55b:free`

User wants **persistent native CLI settings**, not new scripts that change models with command-line flags, compatibility detectors, free-price gates, or repeated chooser prompts. Preserve existing P5.9 one-choice native Main TUI launching.

OpenRouter's verified listing uses this exact ID; it is advertised as free, though the user can later change models and fees/rate limits/providers can change. Do not run an inference prompt. Official references:
- https://openrouter.ai/nvidia/nemotron-3-ultra-550b-a55b:free
- https://openrouter.ai/docs/guides/coding-agents/claude-code-integration

## Actual configuration targets and modifications (local machine, not Git)

1. **Pi (Main 1):** Current Pi native agent user config already uses this exact Ultra `:free` model. Read only nonsecret default provider/model fields to CONFIRM; only repair in-place with a backup if it differs. Preserve all Pi settings and `pi-dev`. Don't migrate Pi config or touch its auth.
2. **Codex (Main 3):** The effective native `C:\Users\mush2\.codex\config.toml` already has `model_provider = "agentco_openrouter"` and a native Responses/OpenRouter provider definition with `env_key = "OPENROUTER_API_KEY"`. Set only its persistent `model` from NVIDIA Super `:free` to the **exact Ultra `:free`**. If an existing explicitly persisted review/aux model points to Super, change that specific applicable model field too, without inventing extra knobs or changing unrelated providers. Do not add back runtime `-c` flags or price checks.
3. **Hermes (Main 4):** Actual installed Windows path `C:\Users\mush2\AppData\Local\hermes\config.yaml`. Keep `model.provider = openrouter` and change `model.default` from Super `:free` to **Ultra `:free`**. The already-persisted 13 auxiliary/task model overrides, `auxiliary.openrouter_model`, and `delegation.model` currently use Super; align **only existing relevant pinned model fields** to Ultra to ensure all defaults agree. Keep title generation and compression disabled and existing fallbacks empty, leave memory/profile/auth state untouched. Hermes native-home dotenv already reconciled with `C:\Agentco\.env` in P5.9; DO NOT re-copy/rotate/edit any key/secret files for a model-ID-only task.
4. **Claude Code (Main 2):** Native `C:\Users\mush2\.claude\settings.json` has a P5.9 OpenRouter Anthropic-style gateway and an exact NVIDIA Super initial `model`, no stored token. Change initial `model` to exact Ultra `:free`. In its existing/native `env` settings, configure **documented nonsecret model mapping** `ANTHROPIC_DEFAULT_OPUS_MODEL`, `ANTHROPIC_DEFAULT_SONNET_MODEL`, `ANTHROPIC_DEFAULT_HAIKU_MODEL`, `CLAUDE_CODE_SUBAGENT_MODEL` all to that same exact Ultra `:free`. For `ANTHROPIC_DEFAULT_FABLE_MODEL` and the installed version's documented small/fast aliases, add only if supported by that installed CLI; do not guess invalid setting names or hack vendor code. Preserve previous `ANTHROPIC_BASE_URL` endpoint and empty `ANTHROPIC_API_KEY`; **NEVER place `ANTHROPIC_AUTH_TOKEN` or actual OpenRouter API key literal into settings.json**. Existing P5.9 child-only gateway environment supplies the token. If local settings env or inherited env might override mappings, diagnose with names/booleans only.
5. **Compatibility caveat:** Claude Code and OpenRouter do not guarantee non-Claude NVIDIA compatibility; its native first-run theme, unknown catalog warning and incomplete inference support remain **UNVERIFIED**. This task must configure model IDs without fake Claude aliases, forbidden provider spoof, proxy, auth/consent acceptance or silent model calls. Do not claim its session will work merely because its TUI opens.

## Minimal process / scope

- Safely sync the prepared feature branch without disturbing clean/dirty worktree, 2 stashes, ignored files, auth/browser sessions, profiles or parked branch. First read `docs/CURRENT_TASK.md` and this order, then inspect actual current native config with a **local** parser. Do NOT paste, upload, print or expose raw configs, backup text, local tokens, token lengths or hashes. Report only effective paths, provider/model strings, key-name-only fields, and pass/fail.
- User has authorized adjustment of **nonsecret native model defaults**. For each file actually edited, create a same-directory private local backup, preserve ACLs/comments/unrelated values as feasible, use a minimal edit and verify it was loaded by the *real installed native CLI*. No user-profile-wide reset, home symlink, additional dotenv copies, OS env changes, login, auth or package install.
- **No repository runtime implementation change required** unless a demonstrable narrow bug prevents native config selection. Prefer **local persistent config only** plus sanitized docs and a small suitable test, if needed. Do not reintroduce P5.6 free-only blocks, provider/model `-c` argv, a model selector UI or metadata price checks. Keep P5.4 Worker/AUTO as-is (not in the scope of Main default changes) and P5.9 launcher/Pi/browser/Agentra unchanged.
- Targeted read-only syntax/semantic verification: each effective native user config now has exactly Ultra `:free` for initial Main, relevant Claude aliases and existing Hermes auxiliary pinned-model fields all Ultra. Ensure no old `Super` remains **in active model defaults** (do not rewrite unrelated historical data/backups). New run confirmation: no model prompt, no provider selection, no background model/API chat prompt, native UI startup/exit only if safe; if Claude onboarding cannot be canceled, avoid repeated process-killing or falsely report success.
- OpenRouter listing is currently free but third-party provider **may log/use inputs**. **Do not send private repo source, secrets, health, finance, employer/internal content or other sensitive data** in testing. No live model inference or authenticated model/catalog requests without separate explicit approval.
- If there are no Git-tracked runtime changes, still commit a **sanitized task completion note** (and only very narrow tests if truly valuable), push **feature only**, no merge main. Claude independent verifier reviews new SHA/diff and local sanitized results (not raw native config), then GPT/user decide release. Never claim runtime chat compatibility verified.

## Required report (compact)

`IMPLEMENTATION_SHA` / `PI` / `CODEX` / `HERMES_MAIN_AUX_DELEGATION` / `CLAUDE_MAIN_ROLE_ALIASES` / `NATIVE_STARTUP` / `NO_SECRETS_WRITTEN` / `LOCAL_BACKUPS` / `TESTS` / `CHAT_TEST_NOT_RUN` / `MAIN_UNCHANGED` / `LIMITATIONS`.
