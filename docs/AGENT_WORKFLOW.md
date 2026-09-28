# Agent Workflow

이 문서는 Pi/Nemotron/Claude/Codex 등 여러 agent가 이 repo(`C:\Cording Agent`)에서 작업할 때 지키는 최소 규칙이다.

**현재 상태**: 이 repo는 아직 root Git이 없다(`git init` 전). Git baseline이 생기기 전까지는 "커밋"이 아니라 "파일 변경"을 명확히 보고하는 것으로 대신한다. Git이 생긴 뒤에는 아래 규칙이 그대로 git 워크플로우에 적용된다.

## 작업 시작 전
- `git status` (root git이 생긴 이후)
- 현재 branch 확인
- uncommitted/미확정 변경사항이 이미 있는지 확인 — 있다면 그게 누구 작업인지 먼저 파악하고 진행

## 작업 중
- 요청받지 않은 파일 수정을 최소화한다
- generated artifact(스크린샷, 스크래핑 결과 JSON, 로그 등)를 커밋하지 않는다 — 필요하면 `C:\Agent Workspace\`에 둔다
- secrets(`.env`, `.env.*`, `auth.json`, API key)를 커밋하지 않는다
- `external/pi`, `external/mini-swe-agent`, `experiments/manual-playground`, `experiments/pi-tui-playground`, `internal/pi-dev/samples` 같은 **nested git repo**를 명시적 지시 없이 건드리지 않는다(`.git` 삭제/흡수/rebase 금지)

## 작업 종료 시
- 관련 test 실행
- `git diff --stat` (root git 생긴 이후)
- `git diff`
- 무엇을 왜 바꿨는지 설명

## 명시적 승인 없이 금지
- `git reset --hard`
- `git clean -fd`
- force push
- history rewrite
- `.git` 삭제
- credential 커밋

## 이 repo의 실제 분리 구조 (2026-09-28 정리 기준)

```
C:\Cording Agent            -- CODE REPOSITORY (source of truth, 이 repo)
C:\Agent Workspace           -- 업무 산출물 / POC / 임시 작업 (repo 밖, 별도 root)
C:\Obsidian\Personal-Agent-Vault  -- 사람이 읽는 개발 노트/의사결정 (repo 밖)
%USERPROFILE%\.pi-personal   -- 개인 브라우저 프로필/다운로드/스크린샷 등 runtime state (repo 밖)
~\.pi\agent                  -- Pi 자체 전역 runtime(인증/세션) — 절대 이 repo로 옮기지 않음
```

새로운 업무성 산출물(여행 조사, 스크래핑 결과, 실험 스크립트 등)은 이 repo 안이 아니라 `C:\Agent Workspace\`의 적절한 하위 폴더(`browser-poc`, `travel`, `research`, `coding`, `temp`, `artifacts`)에 만든다. 사람이 읽을 개발 노트/의사결정/회고는 이 repo의 `docs/`가 아니라 Obsidian Vault에 쌓는다 — `docs/`는 agent가 개발 시 반드시 알아야 하는 구조/마일스톤/결정 기록만 최소로 유지한다.

`internal/`에는 개발 환경 `pi-dev` 하나만 있다(2026-09-28 통합 — 이전의 `pi-dev-user`/`pi-dev-AY`는 재사용 가치가 있는 부분만 `pi-dev`로 병합하고 나머지는 `C:\Agent Workspace\archive\`로 archive함, 삭제 아님).
