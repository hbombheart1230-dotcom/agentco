# Agentco Current Task - P5.8 native defaults saved / review pending

Workspace C:\Agentco; branch feature/p5-8-native-cli-default-profiles; execution base 74f0db8631f96c914ce5007b504bef0082a4350b, baseline origin/main 4107000453feb4e5e9880cf2df27d5d288d02a23.

Read only Execution delta in docs/work-orders/P5_8_NATIVE_CLI_DEFAULT_PROFILES.md and scripts/native-profile-check.test.py. Local persistent Codex/Hermes configuration is complete; Claude independent review uses sanitized evidence/new delta only, not raw local configs/auth.

Actual Codex user config.toml and Windows Hermes AppData\Local\hermes\config.yaml were backed up locally with restricted ACLs, then updated to OpenRouter and exact NVIDIA Super :free. No literal key written. Claude settings.json inspected through nonsecret selected fields only; no edit because NVIDIA gateways are officially unsupported.

Four focused local checks PASS before and after native TUI smoke. Codex/Hermes persistent defaults opened correct native TUI without provider selection when supplied a child-only root key, and exited 0 without prompts. Claude still opens mandatory theme/onboarding and was canceled, outer batch exit 1. No login/consent/model request.

Runtime launcher/Pi/Codex price gate/Worker/AUTO are unchanged. Normal standalone launch needs OPENROUTER_API_KEY in its process environment; user-level Hermes dotenv can override inherited values and exact key provenance was not inspected. No second key store or symlink created. Hermes default free-mode remains guarded: local pinned/disabled settings are not full free-chat certification.

NEXT: Claude independent new-delta/sanitized evidence verification; GPT/user decide release. Live inference remains NOT RUN and requires separate approval. Do not merge main, inspect auth stores or modify profiles further during review.
