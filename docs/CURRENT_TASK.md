# Agentco Current Task — Assistant-first released; P5.10 remains separate

**ASSISTANT-FIRST CLOSED / CLAUDE REVIEW PASS (2026-10-14)**

## Runtime behavior

- **Default: personal assistant.** A greeting, everyday question, advice, explanation, travel/finance research or general planning does NOT authorize reading this file, inspecting Git or initiating development. Root `AGENTS.md` is the canonical rule for all four Mains, with Pi-specific `pi-dev/AGENTS.md` and native Claude `CLAUDE.md` import.
- **Development is opt-in by user intent.** Only a specific Agentco change, debug, test, review or continued coding request opens `docs/CURRENT_TASK.md`. For a newly assigned task, follow its active work order and minimum referenced code; do not reread completed P3–P5.9 history. Codex implements, Claude independently verifies, GPT and user decide final acceptance.
- **Pi Git checkpoints are OFF by default**, to avoid Git activity on greeting turns; `agentco --main pi --agentco-checkpoints` enables them only for that Pi session. Existing fork/restore works with retained entries and is not deleted.

## Accepted implementation

- Claude independent review at `2879522c69a5ed8f8e03859519a0be911acaf9ce`: PASS, offline tests 4/4 PASS; installed Pi loader and CLI flag supported, Hermes candidate/Claude import checked. **Actual model responses NOT RUN**, so this is policy/config acceptance, not guarantee of conversational compliance.
- Latest evidence and exact limitations: `docs/capabilities/INTERACTION.md` (Independent verification and release acceptance).
- No native model/provider/secret/auth/TUI changes, no P5.4 Worker/AUTO modification. Two local stashes, browser profile and user settings remain protected.

## Parallel P5.10 Ultra model-default branch

`feature/p5-10-ultra-defaults` remains a **separate unmerged, unreviewed-for-release branch** with task spec `docs/work-orders/P5_10_ULTRA_NATIVE_DEFAULTS.md` and non-overlapping native model test changes. Independent reviewer identified a single future merge conflict: **this file** (`docs/CURRENT_TASK.md`). Once P5.10 has its own PASS review, retain this assistant-first development-only preamble and record P5.10's true completion status. Never silently overwrite either branch, its work order or user-local models.

**No new implementation is currently assigned on main.** GitHub origin/main authoritative. Do not disturb local checkout/dirty files, ignored results, stashes, native settings/auth or parked browser branch.
