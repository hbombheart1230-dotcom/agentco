# Agentco Current Task

Sole local Codex developer/executor entrypoint. Follow `AGENTS.md`, verify live clean branch/origin, and read only `docs/work-orders/P3_WORKER_E2E_BATCH.md`. No reread/retest of completed P0–P3 baseline or earlier installation, symlink and text benchmarks.

## CLOSED — Fast Track `ec36a5c`: independent PARTIAL verified

Claude independently verified one native repo Skill symlink for Claude (Git 120000, canonical source intact); Pi root/nested 3 Skills/0 diagnostics; recovered P3.4b WIP evidence; Pi/Claude two synthetic prompt rubrics 2/2 each on NVIDIA Super free. These are **text-only response tests**, not Skill runtime, tool file-edit or sandbox PASS. Codex/Hermes free-model calls were 0 due to unresolved OS/tool/auxiliary guardrails, **not model compatibility FAIL**. Existing main `1f92897`, both stashes, user settings/auth/PATH, Pi/Codex/Claude Desktop/Hermes preserved. Claude reviewer made zero model calls or repo changes. Provider actual billing/HTTP counts NOT VERIFIED; Claude's dollar estimate is client-side only. **WORKER READY = NO.**

## ACTIVE — One large P3 Worker Skill/Tool E2E batch APPROVED

Run `docs/work-orders/P3_WORKER_E2E_BATCH.md` **A/B/C/D in one Codex session**. No interim user/GPT approvals for routine investigations. Aim for native functional Skill discovery/invocation and a toy `numbers.txt` -> `result.txt` file-read/write tool task with the exact `nvidia/nemotron-3-super-120b-a12b:free` model, and cost/limit accounting where available, on Pi / Claude / Codex / Hermes. Reuse previous evidence, 6 or fewer NEW model prompt attempts across the batch, no repeated simple text benchmarks.

**Safety:** use external synthetic project and actual native/OS access boundary before tool-capable model sessions; do not confuse temp cwd or read-only prompt with actual credential/private-file containment. No real repository text sent to free endpoints. Do not expose or log key values; no paid/auxiliary fallback. If a CLI cannot meet isolation in one focused check, mark that lane BLOCKED and continue other independent lanes. No custom agent loaders, wrappers, proxies, SDKs or code; native capabilities first. Don't reinstall/upgrade or mutate personal profiles/PATH/credentials. New Windows Sandbox feature enablement/system changes are not authorized.

**Git output:** write sanitized summary/evidence to ignored `results/p3/`; update only CURRENT_TASK + active work order. `git diff --check`, commit/push once on feature branch; no main merge. Keep existing links/source, runtime, sessions and both stashes. One Claude independent verification at end, no model reruns.

## Next handoff

GPT/user adjudicate supported native Skill/Tool E2E per harness based on actual evidence. Overall `WORKER READY` only when model + safe tool/Skill task tested; no status inflation.
