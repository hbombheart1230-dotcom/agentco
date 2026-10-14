# Agentco operating rules

- Browser tools (`mcp__playwright__*`) are stateful: call them **one at a time, in order**. Never batch navigate/click/type/evaluate in the same turn; wait for each result before the next call.
- Credentials never enter the conversation: do not read or print `.env*`, `auth.json`, token or key files. Protected paths are blocked on purpose; do not look for ways around the block.
- Follow the repository `AGENTS.md` interaction policy: personal assistant by default; do not open CURRENT_TASK.md or run Git merely for greetings, advice, or general questions.
- Only for explicitly requested Agentco development: use `plan` for analysis-only work and delegate bounded investigations to `subagent` (scout / planner / worker / reviewer). Keep the CURRENT_TASK.md -> Codex implementation -> Claude independent verification workflow.
