# Agentco Current Task — P5.8 released, follow-up requires user approval

**P5.8 CLOSED / PARTIAL PRODUCT ACCEPTANCE (2026-10-14)**

## Verified accepted scope

- Reviewed implementation/evidence SHA: `13ec02d29985a7ccf3107538ac9b6f4c0a3e9668`. Claude independent review PASS; scoped machine-local native defaults confirmed.
- `C:\Users\mush2\.codex\config.toml`: permanent OpenRouter Responses provider, `env_key = "OPENROUTER_API_KEY"`, model `nvidia/nemotron-3-super-120b-a12b:free`.
- **Actual effective Hermes Windows path:** `C:\Users\mush2\AppData\Local\hermes\config.yaml` (not `%USERPROFILE%\.hermes\config.yaml`): permanent OpenRouter provider, same `:free` model, saved auxiliary pinning/disabled title & compression/empty fallback. Some installed auxiliary consumers exist but **complete runtime free-only execution is UNPROVEN**.
- Local backups present, no literal keys in settings, no auth/profile reset. Claude `~/.claude/settings.json` unchanged due unsupported non-Claude NVIDIA gateway.
- Native Codex/Hermes TUI opened with persisted defaults with no new model prompts. Actual model inference/paid fallback suppression NOT RUN. No runtime source change in Git. Existing Pi, 4-native selector/explicit native-default, Codex P5.6 free launch gate and P5.4 AUTO/Worker unchanged.

## Critical follow-up to decide with user

**Single-root-key requirement is not yet fulfilled.** Hermes native-home `.env` has its **own** `OPENROUTER_API_KEY` entry, and installed Hermes dotenv loader uses overriding precedence. It may ignore an OpenRouter key passed from `C:\Agentco\.env`. Do not read, print, erase, synchronize or overwrite the native Hermes key without the user's explicit approval. A surgical backup+only-key migration must be paired with a working Agentco/standalone credential delivery mechanism; removal by itself can break standalone Hermes.

Standalone `codex` similarly does not auto-read `C:\Agentco\.env`; current Agentco menu 3 child-key passing is established, and directly running Codex needs environment hydration. Root whitelist loader currently favors inherited nonempty OS keys over the root `.env` (no such OS key was observed in prior PC check). No global Windows env or duplicated secret file is desired.

Other deferred choices: Hermes verified auxiliary/fallback real routing, Codex permitted synthetic inference with fresh free-pricing check, Claude's officially supported model strategy. **No new implementation assigned.**

## Minimum-context discipline

Start with this pointer and a new authorized work order only. Accepted P5.8 evidence: `docs/work-orders/P5_8_NATIVE_CLI_DEFAULT_PROFILES.md`, final review section. Avoid rereading P3–P5.7 reports or rerunning completed tests. GitHub main is canonical; respect local `C:\Agentco` changes, two saved stashes, ignored files, native config/auth profiles and parked browser branch.
