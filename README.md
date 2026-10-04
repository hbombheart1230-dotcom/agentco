# Agentco

Agentco is a personal **cowork / companion agent** project.

It is not a coding-agent fork. Coding is one capability among many.

## Direction

Agentco follows four rules:

1. **Pi stays upstream.** Avoid Pi core patches unless a capability is impossible otherwise.
2. **Build last.** Search Pi built-ins, packages/extensions/skills, MCP/CLI, and mature OSS before writing Agentco code.
3. **Compose first.** Agentco should own composition, policy, evaluation, UX, and truly Agentco-specific adapters—not commodity infrastructure.
4. **Replace without regret.** Existing custom components are retained only when acceptance tests show a concrete advantage over available OSS.

## Current focus

Phase 0 is a capability and repository audit:

- inventory the existing Pi-dev work;
- classify each component as KEEP / REPLACE / REMOVE / DEFER;
- evaluate reusable Pi packages, skills, CLI tools, MCP servers, and OSS;
- preserve validated test assets even when implementations are replaced;
- define the smallest Agentco-owned surface.

See:

- `docs/ARCHITECTURE.md`
- `docs/BASELINE_AUDIT.md`
- `docs/WORK_PLAN.md`
- `docs/WORKER_ROLES.md`
- `PATCH_NOTES.md`
