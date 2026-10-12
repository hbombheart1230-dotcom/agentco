# Delta report format

Use the task's required format when provided. Otherwise use this compact shape, omitting irrelevant detail:

```text
BRANCH / HEAD:
BASELINE:
COMMITTED:
UNCOMMITTED: staged / unstaged / untracked
CHECKS:
RISKS / UNRESOLVED:
NEXT:
```

- **BRANCH / HEAD:** current branch and SHA; say detached HEAD when applicable. Remote synchronization is unknown unless current task evidence establishes it; do not fetch to fill this field.
- **BASELINE:** the task-supplied comparison SHA/ref and what it represents, or UNKNOWN. A known ref may be resolved with `git rev-parse`; do not invent a task-start boundary.
- **COMMITTED:** changed file names/statuses from `git diff --name-status <baseline> HEAD` when a valid task baseline is available. If unavailable, say UNKNOWN and report current HEAD without attributing earlier commits to this task.
- **UNCOMMITTED:** distinguish `git diff --name-status --cached`, `git diff --name-status`, and `git ls-files --others --exclude-standard`, using `git -C <repo-root>` for repository-relative paths. Mark pre-existing work only when prior-state evidence establishes it; otherwise use UNATTRIBUTED. An untracked filename establishes neither creation nor prior ownership.
- **CHECKS:** concise observed results and scope, including FAIL or NOT RUN. Use available task evidence, not stored session contents. Do not claim smoke, portability or live integration PASS from a schema check.
- **RISKS / UNRESOLVED:** relevant blockers, uncertainty, attribution gaps or limitations; write none only when supported by the task evidence.
- **NEXT:** one concrete action and its owner, such as independent review. Reporting it does not authorize execution or mutation.

Prefer relative paths and short summaries. Report secret-file presence only when relevant; never include contents, values or raw session/diff excerpts. Reading this reference does not permit repository modifications.
