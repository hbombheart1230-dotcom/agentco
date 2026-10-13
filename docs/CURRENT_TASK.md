# Agentco Current Task — P5.9 simplify native Main launch

**ACTIVE / Codex assigned (2026-10-14)**

Workspace: `C:\Agentco`. Branch: `feature/p5-9-native-config-simple-launch`. Base main: `19dbd92ac17f7943c434adbab68e88f25d97ae64`.

Read **only** this file, `docs/work-orders/P5_9_NATIVE_CONFIG_SIMPLE_LAUNCH.md`, and current small launcher/tests/native config metadata. Do not re-read historical P3–P5.8 or run past broad suites.

## User overrides previous product decision

The user explicitly wants **existing native CLI persistent provider/model settings to be the defaults**, and says to **remove Agentco's own free-model-price, compatibility and auxiliary fail-closed launch gates** rather than endlessly block native Claude/Hermes. Four main menu choices should launch original native TUIs directly; no secondary pricing confirmation. The user understands unsupported NVIDIA on Claude gateway may fail and native models may charge credits; do **not** claim compatibility or free cost guaranteed.

- Codex/Hermes native files have persistent OpenRouter + exact `nvidia/nemotron-3-super-120b-a12b:free` defaults from P5.8. Preserve them; stop duplicating the model in `-c`/argv.
- Claude: use documented OpenRouter Anthropic-compatible endpoint `https://openrouter.ai/api` with root OpenRouter key as `ANTHROPIC_AUTH_TOKEN` in **child environment only**, `ANTHROPIC_API_KEY=""`; persist nonsecret endpoint + best-effort NVIDIA initial model in installed native user settings. Not officially guaranteed for non-Claude; do not spoof/auto-login.
- Root `C:\Agentco\.env` credential remains unprinted/uncommitted. Hermes native-home dotenv has an overriding `OPENROUTER_API_KEY`; backup and surgically align only that local entry to root credential if safe, so native TUI does not silently use a different OpenRouter account. No raw values in reports and no changes to other fields.
- Preserve Pi, Codex `--no-daemon` and TERM, P5.4 synthetic Worker/AUTO and exit behavior, browser/Agentra separation, stashes, profiles and session state. No model inference without approval.
- Codex: implement/test/commit/push feature only; Claude review after. GPT/user release decision. **Main remains P5.8** until PASS.
