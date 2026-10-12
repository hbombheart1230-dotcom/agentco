# Agentco Current Task

Sole Codex execution entrypoint. Follow `AGENTS.md` and the **active P3.3c section only**. Check live Git branch/status/origin; avoid rereading completed P0–P3 work or redoing previous audits.

## Active execution — P3.3c CLI setup APPROVED (2026-10-12)

**P3.3b2d FINAL PASS / CLOSED.** Implementation `099cb2661ecb3469af57bdd1320387432cbdbb61` was independently verified by Claude (native Windows repo Skill link, final-SHA fresh checkout, Git 120000, Pi 3 Skills/0 diagnostics). Codex live model-based discovery and POSIX checkout NOT RUN; WORKER READY = NO. A clone with `core.symlinks=false` materializes a plain file; later existing-doctor check is a separate maintenance action, not part of P3.3c.

**P3.3c APPROVED by user: official Claude Code CLI + Hermes CLI native Windows installation and passive startup/version checks only.** Reuse any already-operational standalone CLI rather than install twice. Favor official mechanisms, minimal custom code. Existing Claude Desktop Code is the independent reviewer and must not be disturbed. Standard user-scoped vendor installation/dependencies and only necessary additive Hermes User PATH entry are permitted; machine PATH, existing settings, users' sessions and system packages are preserved.

## Required context

- `AGENTS.md`
- `docs/work-orders/P3_LOCAL_RUNTIME_ROUTES.md` — **P3.3c — APPROVED official Claude Code CLI + Hermes CLI native Windows setup** only
- live Git status, origin and current feature branch

## Codex task

1. Safe feature-branch sync `C:\Agentco`; stop on dirty/divergent work. Use official [Claude Code Windows setup](https://code.claude.com/docs/en/setup) and official [Hermes Windows native setup](https://hermes-agent.nousresearch.com/docs/user-guide/windows-native). Determine whether standalone CLI is already installed from narrow safe metadata and avoid redundant installs.
2. **Claude first:** prefer vendor WinGet CLI `Anthropic.ClaudeCode`, if supported; otherwise reviewed official native stable installer. Preserve Desktop Claude and private settings. Test version/help only, no `claude` interactive invocation, `-p`, login, doctor accessing config or model call.
3. **Hermes second:** prefer safe supported official user-scoped CLI package; otherwise inspect/download official native installation script from pinned/reviewed vendor source and run with `-NonInteractive` so setup/gateway not started. Vendor-required managed tools and additive User PATH append only if necessary/recorded; do not change machine PATH, existing PATH entries, profiles/keys, desktops, daemon/services, config, model or tools activation.
4. Stop rather than bypass if unexpected destructive/privileged/auth-affecting install behavior arises; record blocked component. Protect Pi 1.0.4, pinned Codex 0.162.1, VS Code Codex versions, registered shared Skill, user Claude Desktop, ignored runtime, stashes and main.
5. Document concise actual PASS/BLOCKED/NOT RUN results/version/path ownership, nonsecret scope and side effects **only** in the P3 work order and this task. `git diff --check`, commit/push docs on current feature branch, no main merge. Evidence local/ignored. No new source code, adapters or full doctor/smoke tests.

## Next handoff

Claude performs independent installation/scope verification of P3.3c result; GPT adjudicates final PASS. Actual Skill connection and synthetic OpenRouter NVIDIA free-only tool/model E2E require a distinct execution scope; `WORKER READY = NO` until proven.
