# Agentco Current Task — P5.5 native 4-TUI correction

**User correction (2026-10-13): the 4 Main choices MUST open their existing native interactive CLIs.**
Previous implementation `c167989e727e633e2ca8f0810636ceb48ccccfe9` passed Claude's **scoped** review, but incorrectly blocks non-Pi interactive startup with `CONFIG_REQUIRED`.

## Required context — minimum only

1. This file.
2. The **User correction after scoped review** section at the bottom of `docs/work-orders/P5_5_MAIN_HARNESS_SELECTOR.md`; consult earlier work order only for an actual ambiguity.
3. Current `scripts/agentco.mjs`, `scripts/agentco.test.mjs`, `bin/agentco.cmd`, plus installed native CLI executable metadata when necessary.

## Do now

- Workspace: `C:\Agentco`; branch: `feature/p5-5-main-harness-selector`.
- Safely sync branch only after checking local tracked/untracked changes; stop on unexpected conflicting changes; no reset/stash/clean.
- **Remove only the non-Pi TUI launch block**: selection 1–4 should open Pi/Claude/Codex/Hermes's **existing native TUI**. No replacement chat interface; no custom profiles, no P5.4 configuration reuse for Main.
- Model status can be separately unknown/unverified. Don't auto-send a prompt or silently use paid models. Don't treat inability to validate free model as grounds to suppress the TUI itself.
- Keep existing `--delegate add42`, P5.4 source/AUTO, browser branch, credentials and sessions unchanged; make sure `AGENTCO_MAIN` is tagged for all selected Mains.
- Focused offline checks + live **TUI no-prompt open/exit only**. Mark failed/blocked/unrun cases honestly; no model/API calls.
- Codex: minimal code change, commit/push feature branch, no main merge. Claude: independently review the new SHA/delta. GPT/user: final release decision.

**Do not reread completed P3–P5.4 history.** Previous 5/5 tests/first review remain evidence, but the intended all-four-TUI goal is not yet accepted.
