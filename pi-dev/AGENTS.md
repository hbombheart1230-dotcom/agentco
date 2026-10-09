# Agentco operating rules

- Browser tools (`mcp__playwright__*`) are stateful: call them **one at a time, in order**. Never batch navigate/click/type/evaluate in the same turn; wait for each result before the next call.
- Credentials never enter the conversation: do not read or print `.env*`, `auth.json`, token or key files. Protected paths are blocked on purpose; do not look for ways around the block.
- Use `plan` mode for analysis-only work; delegate bounded investigations to `subagent` (scout / planner / worker / reviewer) instead of filling this context.
