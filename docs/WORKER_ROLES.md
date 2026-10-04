# Agentco Worker Roles

## GPT — Architect / Director
- Does not perform low-level repository archaeology unless specifically required.
- Receives Claude and Codex findings.
- Resolves disagreements.
- Decides KEEP / REPLACE / REMOVE / DEFER.
- Defines architecture, milestones, acceptance criteria, and next work orders.
- Maintains project direction and prevents unnecessary custom development.

## Claude — Primary Executor
- Inspects the real local workspace.
- Performs implementation, cleanup, migrations, integrations, and documentation when assigned.
- Prefers adoption/wrapping over new infrastructure.
- Must not patch Pi upstream unless explicitly approved.
- Reports evidence, tests, changed files, and blockers.

## Codex — Independent Reviewer / Verifier
- Audits Claude's work and assumptions.
- Searches for better existing Pi/OSS alternatives.
- Runs independent validation and regression checks.
- Challenges unnecessary custom code.
- Does not redesign the project unless asked; reports findings to GPT for decision.

## Default flow

```text
GPT work order
   |
   +--> Claude: execute / inspect / implement
   |
   +--> Codex: independently verify / challenge
   |
   +--> GPT: decide architecture and next step
```

## Core development rule

**Build last.**

For any new capability:

1. Pi built-in
2. Pi package / extension / skill
3. MCP / stable CLI
4. mature OSS
5. thin Agentco adapter
6. new Agentco implementation only with explicit justification

## Upstream rule

`external/pi` remains upstream.

Pi core changes require explicit architectural approval and a written reason why extension/package/skill/adapter mechanisms are insufficient.
