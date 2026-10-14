# Agentco Current Task - P5.10 Ultra defaults saved / review pending

Workspace C:\Agentco; feature/p5-10-ultra-defaults; execution base ee12f739fdbd59bbcac2ad5f93df1bb9f048ea3b, baseline origin/main ba104a6b4661298b8cb17dd0f010b8309da76580.

Read only Execution delta in docs/work-orders/P5_10_ULTRA_NATIVE_DEFAULTS.md and the small scripts/native-profile-check.test.py delta. No historical reports/model comparisons or raw native configs/auth during review.

Pi existing Ultra :free confirmed read-only and unchanged. Codex native model changed to exact nvidia/nemotron-3-ultra-550b-a55b:free. Hermes main + existing 13 auxiliary models + auxiliary.openrouter_model + delegation.model aligned (16 model fields only), preserving all nonmodel values. Claude main and six installed-supported role aliases aligned; gateway/token child plumbing unchanged. Three edited nonsecret configs backed up locally with private ACLs; no dotenv/auth edits or secret values in Git.

Six focused checks PASS before/after no-prompt Codex/Hermes TUI smoke; both displayed Ultra and exited 0. Pi TUI NOT RUN (already configured, preserve Pi). Claude TUI NOT RUN per work-order instruction to avoid repeating known onboarding/cancel process termination. Claude model/role settings validated locally; native runtime/inference compatibility remains unverified.

No launcher/Pi/Worker/AUTO/browser changes, price gate, CLI model override, package install, login or inference. Native background traffic unmeasured. Stashes/main preserved; feature-only docs/test commit.

NEXT: Claude independent new-delta and sanitized local evidence review; GPT/user decide release. Do not merge main or run inference/authenticated model/catalog checks without separate approval. Mandatory Claude onboarding, catalog/protocol compatibility and provider costs remain limitations.
