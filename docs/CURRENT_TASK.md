# Agentco Current Task

Canonical workspace C:\Agentco / feature/p3-worker-harness-design. Follow AGENTS.md; read only Hardening execution result in docs/work-orders/P5_PIPELINE_MVP.md and changed helper/test. Do not reload P3 histories or repeat passed model/installation checks.

## Current state

P5 pipeline operation PASS; final hardening independent review PENDING. Base cbb8af3. Strict Worker/toolResult/final correspondence, asynchronous known-child tree cleanup, and trusted AGENTCO_CLAUDE_CLI override implemented. Existing WinGet default retained; no global settings change.

8 offline checks passed (initial 7 plus one targeted parent-error case). Owned nested trees cleaned on timeout/abort/output limit and tracked Worker cleaned after parent error; unrelated control survived. Physical Ctrl+C and universal OS termination guarantee not claimed.

One live synthetic pipeline: HARDENED_PAYLOAD=137, exact NVIDIA Super free route, 2 CLI prompt attempts, 3.659s, pipelineSuccess=true. HTTP totals/billing unverified. Evidence: ignored results/p5/hardening-cbb8af3/ and results/p5/pipeline-1791796530917/.

Only helper/test and two active docs changed; source/Skills/auth/settings/PATH/runtime/sessions/main/two stashes preserved. File-edit/Skill E2E NOT RUN; WORKER READY = NO.

## Run and handoff

node scripts/commander.mjs --check
node scripts/commander.mjs "Delegate this synthetic task to Claude: return exactly HARDENED_PAYLOAD=137. Return the worker output verbatim."

Optional process-only AGENTCO_CLAUDE_CLI points to a trusted local Claude .exe. Claude independently reviews the single new commit/evidence once, no model/API reruns, Korean report. GPT/user accept hardened P5 before any main merge or separately authorized file-edit extension.
