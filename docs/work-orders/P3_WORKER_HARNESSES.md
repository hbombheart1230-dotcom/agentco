# P3 Worker Harnesses — Windows-native common environment

**Status:** PROPOSED / design review only (2026-10-12). **No installation or activation authorized.**
**Base:** `main` at `1f928974c3fcfc70456fa06bc03064576a9fd51d`.
**Roles:** User chooses product priorities and approves scope; GPT architects and adjudicates; Codex implements; Claude independently verifies.
**Baseline:** existing Pi 1.0.4 and shared-skill P2 are CLOSED/PASS. Do not reopen completed phase history.

## 1. Purpose / non-goals

Build a reproducible, security-conscious **worker-harness runtime** for Claude Code, Codex CLI and Hermes on the canonical Windows checkout `C:\Agentco`, without changing Pi's pinned core, installed skill packages or single-workspace model. P3 validates independent CLI readiness and native discovery. It does **not** select a winning harness, benchmark coding quality/latency/cost (P4 Harbor), implement the Pi Commander (P5), route workers (P6), start autonomous jobs/schedulers, or turn on shared external tools indiscriminately. Existing externally installed CLI tools must be inventoried rather than overwritten.

Desired future chain: User → Agentco/Pi Commander → Pi SELF or selected worker; routing remains a **hypothesis** until P4 evaluation.

## 2. Evidence & platform assumptions (official docs checked 2026-10-12)

These are documentation claims, **not** installed-version PASS results.

| Component | Official reference | Windows/install facts | Gate / limitation |
| --- | --- | --- | --- |
| Claude Code | [Advanced setup](https://code.claude.com/docs/en/setup), [Skills](https://code.claude.com/docs/en/skills) | Official native Windows CLI; native installer/WinGet; `claude --version`, `claude doctor`; Windows Git Bash optional. Native installer may auto-update | Native Windows sandbox **not supported** in documented setup; WSL2 supports sandboxing. Account/API entitlement and stable/exact-version policy need approval |
| Codex CLI | [Codex CLI](https://learn.chatgpt.com/docs/codex/cli), [Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox), [Skills](https://learn.chatgpt.com/docs/build-skills) | Official CLI includes interactive, review, `codex exec`, account sign-in and Windows guidance | Inspect installed version, auth, permissions, sandbox and supported install channel before choosing any pin or non-interactive invocation |
| Hermes | [Platform support](https://hermes-agent.nousresearch.com/docs/getting-started/platform-support), [Native Windows guide](https://hermes-agent.nousresearch.com/docs/user-guide/windows-native), [Install](https://hermes-agent.nousresearch.com/docs/getting-started/installation), [Skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills) | Official Tier-1 native Windows support and PowerShell installer; WSL2 is an **option**, not a prerequisite | Installer may manage user profile and toolchain. `skills.external_dirs` is supported but may be **written into** by skill-management tools; require technical read-only barrier or keep shared integration disabled |

Before implementation, Codex must capture the actual official versions, native install provenance, package/update ownership, profile paths and verified supported CLI flags (help output), not guess them from changing docs. Current installed/user-global state is **UNKNOWN** until the local preflight. No broad `npm -g` or remote installer piped directly to PowerShell without a separate reviewed installation decision.

## 3. Architecture proposal

- **Canonical working tree:** `C:\Agentco` only. `origin/main` is source of truth. Extra worktrees exceptional and justified. No parallel agents editing it in P3.
- **Pi:** stays 1.0.4, upstream untouched; `pi-dev/` is Pi-only. P2's `shared/skills/agentco-delta-handoff/` is the sole tracked authoring source.
- **Worker CLIs:** favor **Windows-native** when supported. Reuse existing, working installations. If none exist, install through a reviewed official installer/channel **one at a time**. WSL2 may be proposed only after documenting a material native blocker or a sandbox requirement.
- **Configuration:** prefer upstream-supported repo-local settings; where only user-profile config is supported, modify the narrowest owned entry with snapshot/rollback and consent. Never replace a whole user profile, overwrite `~/.claude`, `~/.codex`, `~/.hermes` or copy secret files into Git. Machine-local proof/artifacts in ignored `results/p3/`.
- **Shared Skills:** one canonical `shared/skills/`. For Codex, propose *per-skill* repo `.agents/skills/<name>` symlink; for Claude, `.claude/skills/<name>` symlink; for Hermes, `skills.external_dirs` via root-derived path **only with safe write isolation**. These are proposals; actual Windows link/junction discovery is UNVERIFIED until tested on pinned CLIs. Never copy skill bodies as a fallback. Avoid creating views that cause Pi duplicate discovery, and do not create empty future placeholder directories.
- **Common tests:** run the same *read-only, provider-neutral* micro-task in root and nested CWD per harness. Check command/version, auth availability (presence/status only), config ownership, shared-skill explicit invocation, reference read, no unintended writes, timeout/cost, and clean Git. Do not claim exact skill syntax is universal; adapt only via documented native commands.
- **Security:** start with minimal permissions and no autonomous write tools. No unattended auto-approval, uncontrolled browser, gateway, cron, external network scraping, self-modifying shared skills, full user-profile access, or budget-consuming model tests without approved limits. Native Windows Claude Code lacks the documented WSL2 sandbox guarantee; distinguish approval controls from enforced isolation. For Hermes, Git cleanliness is not a read-only guarantee.
- **Version / portability:** record exact executable versions and install method; do not assume semver pinning is supported identically across vendors. Existing main bootstrap remains Pi-only; a separate *optional*, idempotent setup for approved workers may be considered when demonstrated necessary. New-machine restore is not certified until later P8.

## 4. Stages with explicit gates

**P3.1 — now, design only (this proposal):** publish evidence-backed installation, ownership, safety, smoke and rollback contracts; D-010 PROPOSED; `CURRENT_TASK.md` points to design review. No executable, package, profile, auth or skill-view changes.

**P3.2 — preflight (requires user/GPT approval):** Codex reads `CURRENT_TASK.md`; inventory existing `claude`, `codex`, `hermes` commands (version, binary path, `--help`, installation/update channel, known setting roots and nonsecret auth/status only), Windows capabilities (symlink ability, WSL status only if relevant), privileges, Node/Git/Python where relevant. Do not inspect credentials, personal skill contents or account identifiers. Produce a small matrix in `results/p3/` and summary in this work order. **Read-only preflight; don't install anything.** Pin/approve the actual implementation versions and installation paths using the inventory.

**P3.3 — opt-in setup, one harness per gated subtask (separate approval):**
1. Reuse working installed Claude/Codex/Hermes CLIs and avoid duplicate managers. If absent, review official installer artifact, side effects, version/update model and profile location, then ask for approval to install that named CLI.
2. Verify `--version`/`--help`/vendor doctor where applicable, native auth/status safely and one explicit low-budget, read-only model test **only with approved provider credentials/limits**. No forced login or key printing.
3. Test per-skill link or external directory connection in a reversible, conflict-checked manner. Try a disposable Windows link outside personal skill trees before registering an Agentco-owned entry. Validate correct target/invocation/reference from root and nested CWD. If symlink privilege/junction or source permissions fail, report BLOCKED/UNKNOWN; never silently copy content or elevate.
4. Hermes shared skill must not be writable through `skill_manage`. If a genuine read-only access boundary cannot be demonstrated, leave Hermes external skill connection **disabled** and mark it NOT READY; do not disable its ordinary local skill management or redirect creation into the shared repo.
5. Preserve other tools' unrelated configs and source state; keep machine-private files ignored. Update work order with exact versions, probes, partial PASS/NOT RUN, rollback entries, commit/push only approved tracked configuration. No new background service or gateway.

**P3.4 — independent review and merge gate:** Claude verifies implementation SHA with minimum task context, probes one harness at a time, checks no profile clobber, key leakage, links, privileges, runtime/skill discovery and git cleanliness. GPT+user final technical/product PASS or rework; main ff-only merge on approval. Incomplete harnesses must be individually NOT READY, not mislabeled P3 complete.

## 5. Readiness vs P4 benchmark

P3 = **technical readiness**, not capability judgment: CLI starts; dependencies/auth are available; safe approvals configured; shared skill discovered with intended ownership; one tiny common task succeeds; root/nested path handling; rollback; version manifest; no unintended writes or ignored-state leaks.

P4 Harbor + Terminal-Bench will measure resolution rate, latency, cost/tokens, tool-call success, robust regressions with a controlled model/backend and comparable task/environment. Do not choose Claude=implementer/Codex=reviewer/Hermes=autonomous as an immutable fact before those results.

## 6. Acceptance criteria / STOP conditions

- Baseline Pi doctor and native three-skill discovery remain unchanged when P3 begins and ends; run relevant regressions once, not between every read-only documentation edit.
- Every harness has a version, provenance, entrypoint, minimal config inventory, auth/status outcome (never key content), tool permissions and smoke outcome PASS/FAIL/NOT RUN.
- Approved shared skill has one editable source, no copied files. Any adapters are minimal, inspectable, collision-safe and reversible; no modifications to personal skill dirs without approval.
- No unapproved provider charges, account signups, secret exposure, broad installer side effects, credential migration, service startup or network gateway.
- A failed prerequisite, unsupported permissions, unknown external source change or dirty tree stops that subtask; preserve user/stashes, not auto-clean.
- Each subtask reports its delta, exact command version and evidence scope; Claude review independent; final gate only after required harnesses become READY or user explicitly narrows scope.

## 7. Rollback / preservation

Record before/after command path, version, package ownership and every Agentco-created link/config entry. On rollback, verify **exact** owned entry and target before unlinking it; never recurse into its target. Restore only the changed owned settings entry from a snapshot, not the entire profile; an installed system/vendor binary is removed only under separate approval. Maintain `origin/main` and the reviewed P2 baseline, retain ignored local results and recovery stashes, and report remaining optional state.

## 8. Decisions needing user approval

1. Is P3 scope three workers (Claude Code, Codex CLI, Hermes), with **native Windows first** and Pi preserved? (Recommended.)
2. Are existing user installations/auth allowed to be **inspected by metadata only** in P3.2? (Recommended.)
3. What model/provider and max spend should be used for later P3.3 live smoke? Default = **NO LIVE MODEL CALLS / NO NEW CHARGES** until explicitly specified.
4. Should Hermes shared Skill registration remain **deferred until write isolation is proven**? (Recommended.)
5. After approved P3.2 preflight, which harness to configure first? Proposed order **Codex → Claude → Hermes** for simple incremental integration; not a performance ranking.

**Do not implement P3.2/P3.3 or activate any worker from this PROPOSED document alone.**
