# Agentco Current Task

This is the only active Codex/Claude entrypoint. Follow `AGENTS.md` and inspect current Git status/origin before any approved work.

## Current state

**P3.3b2b BLOCKED (2026-10-12), safe rollback PASS.** Real repo-local Codex Skill link was NOT registered: Windows `os.symlink()` accepted a forward-slash relative target but dereferencing `SKILL.md` failed with WinError 123. Executor `44f5a7014f20aeaaf4106e9344280de774b83fd4` committed failure documentation only; canonical shared Skills, Pi, existing Codex/Claude sessions, stashes, runtime and main remained unchanged. Git link mode, clean-clone portability, native Codex discovery/invocation and model E2E are NOT RUN. **WORKER READY = NO.**

GPT reviewed the failure against official Windows/Python documentation: forward slashes in relative Windows symlink reparse targets are a strong root-cause hypothesis; using Windows-native backslashes may fix local file access. **Git-tracked portability is still unverified**, so do not retry persistent repo registration directly.

## Required context for next authorized action

- `AGENTS.md`
- `docs/work-orders/P3_LOCAL_RUNTIME_ROUTES.md` — **P3.3b2b stopped registration attempt** and **P3.3b2c — proposed Windows link-target diagnostic** only
- Live Git branch/status/origin

## Authorization boundary

**P3.3b2c fixture-only diagnostics are PROPOSED / NOT YET AUTHORIZED.** No real `.agents/skills` changes, link retries, code/installer creation, index-mode forcing, PATH or Git-global settings, profile changes, login, model calls, OpenRouter traffic or new CLI installs. Preserve all state until a separate user approval. P3.3b3 and subsequent harness setup remain separate gates.

## Next handoff

On user approval, GPT activates the narrow disposable Windows target-separator and isolated Git-checkout test in the work order. Codex runs/tests and records only delta; GPT/Claude review the safety and portability evidence before any actual registration decision.
