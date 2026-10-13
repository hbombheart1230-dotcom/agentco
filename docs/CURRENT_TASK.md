# Agentco Current Task — P5.8 native CLI persistent default configurations

**ACTIVE / 2026-10-13**

Workspace: `C:\Agentco` (personal only).
Remote feature: `feature/p5-8-native-cli-default-profiles`.
Base main: `4107000453feb4e5e9880cf2df27d5d288d02a23`.

## Start small

1. Read this file.
2. Read `docs/work-orders/P5_8_NATIVE_CLI_DEFAULT_PROFILES.md`.
3. Inspect **actual installed CLI settings locations** using non-secret metadata only and only relevant source/tests.

No P3–P5.7 report rereads; do not rerun old test suites.

## User-corrected requirement

**Stop merely adding temporary launcher overrides.** The user explicitly wants existing installed **Codex CLI**, **Hermes**, and **Claude Code** initial/default provider and model settings configured in **their actual persistent local native settings files**, so they stop requesting unnecessary provider/model setup each time. Root ignored `C:\Agentco\.env` is the canonical existing OpenRouter credential source. Never write literal keys into TOML/YAML/JSON or Git; use env-var references and minimal child-only env plumbing if technically needed.

- Codex: back up then update native `%USERPROFILE%\.codex\config.toml` with OpenRouter and exact NVIDIA Super `:free` default, leaving other options intact.
- Hermes: back up then update native `%USERPROFILE%\.hermes\config.yaml` with OpenRouter and exact NVIDIA Super `:free`; verify/disable cost-bearing auxiliary/fallback entries. Avoid Nous subscription. Preserve existing TUI/native session and do not change auth or consent.
- Claude: inspect `%USERPROFILE%\.claude\settings.json`; official non-Claude NVIDIA restriction means do **not** pretend a compatible default can be set or bypass onboarding. Report as unsupported unless officially supported free-Claude route genuinely verified.
- Preserve Pi, previous Codex P5.6 launch price gate, P5.4 Worker/AUTO, Agentco 4-Main selector and explicit native-default flags.
- **This task allows backup-and-edit of non-secret local user config files**. Local native config/backups must never be committed or surfaced. No model/API inference or auth/login without separate approval.

Codex performs local configuration/tests and sanitized results, commits/pushes only safe repo docs/tests to feature. Claude independent reviews **new delta only** and metadata evidence; GPT/user final release decision. No main merge yet.
