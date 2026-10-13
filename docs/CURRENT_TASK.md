# Agentco Current Task - P5.5 native TUI correction complete

Workspace C:\Agentco; feature/p5-5-main-harness-selector; correction base a105ac8ed2eeef8600efbdd3dae81fa5c67754a0. User correction implemented; independent review pending. Read only Native TUI correction result at the end of docs/work-orders/P5_5_MAIN_HARNESS_SELECTOR.md and the current small launcher/test delta.

Non-Pi CONFIG_REQUIRED launch block removed. Existing native empty/ordinary arguments and inherited native configuration preserved. AGENTCO_MAIN now tags Pi/Claude/Codex/Hermes. No Worker HOME/config reuse, forced model/profile, login, auto prompt or replacement. P5.4/AUTO/Worker and menu/args/exit behavior unchanged.

Live no-prompt checks: Pi TUI opened/exited 0; Claude native onboarding opened and canceled (outer shell exit 1); Hermes native TUI opened, provider setup skipped/canceled, then native Goodbye (outer shell exit 1). Codex default startup displayed a missing local background-server package error; explicitly forwarding native --no-daemon under test-only TERM=xterm-256color opened/exited TUI 0. No automatic workaround in launcher. Free model messaging remains separate: Pi shows Ultra free, Claude unknown, Codex shows existing GPT-6.1-Sol, Hermes shows existing claude-opus-4.6/Nous; non-Pi free status UNVERIFIED. No inference prompt sent; background native network traffic unmeasured.

Two changed-scope offline tests PASS. Pi changelog-only startup delta was checked/restored; frozen settings/source/Skills clean. No manual native profile edits/provider/theme/login accepted. Hermes consent cancellation retained its displayed default No thanks. New empty native session/startup artifacts retained; no existing sessions/runtime/stash/browser cleanup.

NEXT: Claude independent correction-only review, no fresh prompts/API probes or edits. Verify native launch/args/env tags and exact live outcomes. GPT/user gates release/main merge. General delegation remains the previous separate limitation, not implemented in this correction.
