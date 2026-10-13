# Agentco Current Task — released main baseline

**P5 and P5.1 FINAL PASS / CLOSED (2026-10-13).** Pi 1.0.4 Commander -> official Claude Code CLI Worker -> Pi has two verified paths: (1) synthetic text/artifact delegation; (2) opt-in, fixed synthetic JS file correction with actual native Claude `Read/Edit`, independently checked host `node --test`, and exact Worker/toolResult/Pi final correspondence.

## Verified usage

- `node scripts/commander.mjs --check` — local Windows CLI prerequisites, no model/auth query.
- `node scripts/commander.mjs "Delegate this synthetic task to Claude: return exactly HARDENED_PAYLOAD=137. Return the worker output verbatim."` — original P5 synthetic text route.
- `node scripts/commander.mjs --toy-edit` — P5.1 owned disposable `sum.js` correction and host test. Does not accept arbitrary real file/project paths. Default original text route preserved.
- Both modes pin exact OpenRouter `nvidia/nemotron-3-super-120b-a12b:free` (public zero-price gate), require installed Node/Pi/official Windows Claude CLI and the existing approved local auth source. An opt-in `AGENTCO_CLAUDE_CLI` environment override must name a trusted executable; the binary receives auth.
- Claude independently validated 22/22 offline tests on P5.1 `03e3fb0` and prior real native Read/Edit/host-test evidence, without rerunning models. First Pi mismatch was correctly rejected; second real roundtrip passed. Provider HTTP/billing not observed. **GENERAL WORKER READY = NO**; native Write, Skill, arbitrary projects and other operating systems NOT RUN.

## Source/release boundaries

Reviewed exact blobs of `scripts/commander.mjs` and `scripts/commander.test.mjs` from `feature/p5-1-file-edit` were selectively promoted to main with documentation closure. Historical unfinished P3 development history remains unmerged on `feature/p3-worker-harness-design`, preserving main as the stable release. See `docs/work-orders/P5_PIPELINE_MVP.md` and `docs/work-orders/P5_1_FILE_EDIT_VERTICAL.md`.

Use only synthetic owned fixtures; never route private Agentco/company/user data, credentials or real repositories through these free-model demonstration entrypoints. Do not relax filesystem tool permissions or treat cwd as an OS sandbox.

## Next work — NOT YET AUTHORIZED

Prioritize **normal Pi interactive-session integration of Claude Worker**, reusing existing Pi extension and official vendor native controls, then extend to other small synthetic tasks. No shared Skill execution adapter: keep one canonical `shared/skills` source while using each harness's official native discovery/invocation paths. Codex/Hermes three-worker orchestration, benchmarks, model comparisons, desktop UI and Linux portability are deferred.

Before coding, GPT/user approve a new scoped work order on a fresh feature branch. Never run new development tasks directly on main. Preserve local auth, sessions, PATH, ignored results, existing runtime and all stashes.
