# Agentco Current Task — P5.5 released; no implementation in progress

**P5.5 CLOSED / PARTIAL PRODUCT ACCEPTANCE (2026-10-13).**

## Accepted release boundary

- Main selector launches installed Pi / Claude Code / Codex CLI / Hermes as native interactive TUI. Enter defaults to Pi; existing Pi CLI args and `--main` remain supported.
- Independently reviewed implementation SHA: `d827df06ab7f7f0d1f0aa177864e4ed9ce41c175`, Claude verdict PASS; focused launcher tests 8/8 PASS without a model prompt. Codex menu 3 no-prompt interactive exit 0 is based on implementer's local manual evidence.
- Codex Main alone receives native `--no-daemon` and child-only TERM fallback to handle that installed CLI. Other three native Main launch paths and P5.4 source are preserved.
- The previous P5.4 AUTO policy is **unchanged**: fixed synthetic `add42` only, AUTO chooses Claude. Named `--delegate ... add42` is likewise fixed synthetic only.
- **NOT VERIFIED/NOT DELIVERED**: general cross-harness natural-language task delegation; Claude/Hermes onboarding and general chat; free-model/non-paid chat routing for other native Mains; live financial data / browser integration.
- Legacy local/auth/runtime/session/profile/stash artifacts remain machine-local and out of Git. Parked browser feature branch is independent and not merged.

## Next action — user priority decision

No new implementation is assigned yet. When a task is selected, create a separate feature work order; keep existing P5.4/P5.5 implementation frozen unless the next task specifically needs a bounded change.

Potential next scope: verify existing native Main free-only model/provider setups **without inspecting credentials or sending unapproved paid inference**, then separately implement explicit real-task handoffs through official native mechanisms. Browser integration remains parked.

## Minimal context rule

Start here and read only the new approved task order. P5.5 details and review are archival evidence at `docs/work-orders/P5_5_MAIN_HARNESS_SELECTOR.md`; do not reread historical P3–P5.4 work orders or rerun their tests.
