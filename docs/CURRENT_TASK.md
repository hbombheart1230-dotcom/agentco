# Agentco Current Task

Sole active Codex/Claude entrypoint. Check \`AGENTS.md\` and current clean Git branch/origin. Read only the active P3.3b2d work-order section and P3.3b2c conclusions; no P0–P2 rereads.

## Active execution — P3.3b2d Windows-correct native Codex Skill registration APPROVED

P3.3b2c diagnostic on \`4d84aee0b9f164cea8b2d97dca8f5a67ef4c17f2\` confirmed the original WinError 123 is caused by passing a forward-slash relative directory-symlink target to Python on Windows. Native backslash link reads successfully; Git normalizes its link blob to portable \`../../shared/skills/agentco-delta-handoff\` and a fresh Windows checkout creates a working native symlink. POSIX checkout remains NOT RUN. No previous persistent registration exists; \`WORKER READY = NO\`.

## Required context

- \`AGENTS.md\`
- \`docs/work-orders/P3_LOCAL_RUNTIME_ROUTES.md\` — **P3.3b2d — APPROVED native repo Skill registration** only; supporting diagnostic results if needed
- live Git status, current branch/origin

## Codex instruction

1. On canonical \`C:\Agentco\`, safely synchronize \`feature/p3-worker-harness-design\`; stop if dirty/diverged or the proposed target entry exists unexpectedly.
2. Make **exactly one** native Windows relative directory symlink at \`.agents/skills/agentco-delta-handoff\` pointing to \`..\..\shared\skills\agentco-delta-handoff\` with actual Windows backslash characters (do not pass \`/\` to \`os.symlink\`). No copied Skill, bootstrap, adapter, junction or custom Extension.
3. Verify file/reference read and source identity BEFORE stage; normal Git stage must produce mode \`120000\`, canonical forward-slash blob, Windows fresh-checkout usable symlink/clean status in an ignored disposable test tree. Minimal Pi root/nested 3 Skills/0 diagnostics/canonical dedup; no full regression.
4. Codex native Skill discovery only if a safely nonmutating, non-model installed-version command is available, otherwise NOT RUN. No auth/status/login, model/OpenRouter call, sandbox activation, user profile/PATH/settings changes or other worker installations.
5. Document short evidence; change only the one owned link and \`docs/CURRENT_TASK.md\` plus \`docs/work-orders/P3_LOCAL_RUNTIME_ROUTES.md\`. \`git diff --check\`; commit/push feature branch only. On failure remove only the newly owned link after identity checks, no recursive source removal, and report BLOCKED. Preserve all sessions, runtime, Pi, stashes, main, and ignored evidence.

## Next handoff

Claude independent verification is REQUIRED after Codex implementation: exact link and target, fresh-Windows-checkout compatibility, Git tree and Pi dedup, no unintended writes. GPT final gate after Claude. Actual Codex/Claude/Hermes model testing with OpenRouter NVIDIA free-only and synthetic prompts is separate and NOT approved by this task.
