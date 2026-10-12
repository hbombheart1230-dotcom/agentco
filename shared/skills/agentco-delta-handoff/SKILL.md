---
name: agentco-delta-handoff
description: Report a worker task's Git-based changes, verification results, unresolved risks, and next step at completion or handoff. Use for an explicit delta report or a repository worker's closing report; not for implementation or a general history review.
---

# Delta handoff

Produce a concise report of the current task's changes. This skill is read-only: do not edit files, stage, commit, push, fetch, switch branches, or otherwise change repository state.

1. Read [references/report-format.md](references/report-format.md), resolving it from this skill's directory, not the working directory. Honor any report format explicitly required by the task.
2. Confirm the repository root, current branch, HEAD and status with read-only Git commands. Run summaries with `git -C <repo-root>` so nested sessions report repository-relative paths. Use an explicit task-start SHA or comparison ref already supplied by the task. If the baseline is unknown, label it unknown; do not infer it from a parent commit, main, or a long history search.
3. Separate committed changes since that baseline from staged, unstaged and untracked changes. Use name/status summaries first. Attribute changes only when task evidence supports it. Without ownership/prior-state evidence label them UNATTRIBUTED, not task-created or pre-existing. Discovery metadata and untracked status do not establish provenance.
4. Summarize checks actually executed in this task and their observed outcomes. Mark unrun checks NOT RUN; prior evidence is not a new test. Report only evidence-backed risks: a discovered but untracked skill is not proof of a duplicate; verify distinct locations before claiming duplication. Report unresolved failures, unknowns and the next owner/action without starting that action.
5. Return only the task delta using the reference format. Do not repeat completed project history or load earlier work orders merely to fill the report.

Do not read or output credential files or values, `.env` contents, or session transcripts. A presence/status check is enough when relevant. Avoid raw diffs or command output that could expose them. Do not run new tests from this reporting skill: some tests write files or runtime state.
