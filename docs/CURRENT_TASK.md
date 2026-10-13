# Agentco Current Task - P5.5 Codex default-menu fix complete

Workspace C:\Agentco; branch feature/p5-5-main-harness-selector; implementation base 72a61299ce7a5545844119dd98bc80ec7e02325e. User-approved minimal correction complete; Claude independent review pending.

Read only Codex default-menu completion at the end of docs/work-orders/P5_5_MAIN_HARNESS_SELECTOR.md and the current launcher/test delta. Codex Main adds the installed official --no-daemon option and a child-only TERM fallback for missing/empty/dumb values. Existing native arguments, valid TERM and configuration remain intact. Pi/Claude/Hermes and P5.4 AUTO/Worker code are unchanged.

Actual bin/agentco.cmd menu option 3 opened Codex 0.162.1 TUI with no shell overrides; Ctrl+D exited 0 and restored the terminal. No model prompt entered; native background traffic unmeasured. Four focused tests PASS; no historical pipeline or other Main live tests repeated.

NEXT: Claude independent exact-commit review of this minimal delta. No model/API retest or configuration edits. GPT/user approval gates main merge; do not merge main now.
