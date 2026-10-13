# Agentco Current Task - P5.9 simple native launch complete / review pending

Workspace C:\Agentco; feature/p5-9-native-config-simple-launch; execution base 0e168ab72799fe60e8fb56147862080a24a4fc23, baseline origin/main 19dbd92ac17f7943c434adbab68e88f25d97ae64. User's native-config-first policy implemented; no main merge.

Read only Execution delta in docs/work-orders/P5_9_NATIVE_CONFIG_SIMPLE_LAUNCH.md and the current small launcher/test delta. Old free-mode gate code/tests are removed; do not reread historical reports or rerun model comparisons.

Menu 1..4 directly launches native TUIs with no second price/approval question. Pi unchanged. Codex/Hermes use their existing persistent OpenRouter NVIDIA :free defaults, no injected model/provider args or launch price check. Non-Pi root-key hydration is child-only; Claude receives official OpenRouter Anthropic endpoint/bearer mapping and blank API_KEY. Claude native user settings persist only endpoint, blank API_KEY and exact initial model, not the token. Hermes native dotenv key entry was backed up/reconciled locally; other bytes unchanged.

Eleven focused tests PASS. Actual menus: Pi/Codex/Hermes opened native TUIs, Ctrl+D exit 0. Claude opened onboarding with native unknown-model catalog warning; no model disguise or onboarding acceptance. Its theme screen did not exit on tested cancel keys in this PTY; only the identity-verified smoke child was stopped, outer exit 1. Gateway/model inference remains NOT RUN.

No model prompts, account queries, installations, auth/session reset or browser changes. Existing Pi startup-only lastChangelogVersion delta restored after confirming all other settings equal. P5.4 Worker/AUTO and native exit transport unchanged; stashes/main retained. Native background traffic unmeasured; no guarantee of free costs/Claude compatibility.

NEXT: Claude independent new-delta and sanitized evidence review. GPT/user release decision. No fresh inference or main merge without separate approval. Mandatory Claude onboarding, NVIDIA catalog/protocol compatibility and native cancel behavior remain limitations.
