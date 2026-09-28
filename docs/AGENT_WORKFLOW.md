# Agent Workflow

이 문서는 Pi/Nemotron/Claude/Codex 등 여러 agent가 이 repo(`C:\Cording Agent`)에서 작업할 때 지키는 최소 규칙이다.

**현재 상태 (2026-09-28)**: root Git baseline이 생성됨(`main` branch, root-commit `eef7921`). `external/mini-swe-agent`는 submodule로 전환됨. `external/pi`는 아직 submodule이 아님(`package.json`이 dirty — 비공식 스크립트 2개가 커밋 안 된 채로 남아있어 보류 중, [[../../../Obsidian/Personal-Agent-Vault/10 Projects/Personal Pi/Milestones|Milestones]] M0.6 참고). GitHub private remote는 이 머신에 `gh` CLI가 없어 아직 연결 안 됨 — 연결되기 전까지는 로컬 커밋으로만 작업하고 원격 push는 하지 않는다.

## 역할 분리 (M0.6 이후)
- **Pi-dev / Nemotron** = primary implementer (실제 기능 개발)
- **Claude / Codex** = reviewer / independent verifier

새 기능 개발(Browser Extension, Jalan Skill 등)은 Pi-dev/Nemotron이 시작한다. Claude/Codex는 리뷰·검증 역할로 전환되며, 사용자가 명시적으로 요청하지 않는 한 새 기능 구현에 먼저 들어가지 않는다.

## 작업 시작 전
- `git status`
- `git branch --show-current`
- `git diff`
- feature branch 생성 (예: `feature/m1-persistent-browser`) — `main`에 직접 커밋하지 않는다

## 작업 중
- 요청받지 않은 파일 수정을 최소화한다
- generated artifact(스크린샷, 스크래핑 결과 JSON, 로그 등)를 커밋하지 않는다 — 필요하면 `C:\Agent Workspace\`에 둔다
- secrets(`.env`, `.env.*`, `auth.json`, API key)를 커밋하지 않는다
- `external/pi`, `experiments/manual-playground`, `experiments/pi-tui-playground` 같은 **nested/미전환 git repo**를 명시적 지시 없이 건드리지 않는다(`.git` 삭제/흡수/rebase 금지)
- `external/mini-swe-agent` 같은 **submodule**을 임의로 수정하지 않는다 — 필요하면 upstream에 반영 후 submodule 포인터만 갱신
- `internal/pi-dev/samples/`는 runtime-generated(gitignored)다 — 여기 직접 수정한 내용은 `reset-samples.cmd` 실행 시 사라진다. 영구히 남겨야 할 변경은 `samples-template/`에 반영한다

## 작업 종료 시
- 관련 test 실행
- `git diff --stat`
- `git diff`
- 변경 파일과 이유 설명

## 명시적 승인 없이 금지
- `git reset --hard`
- `git clean -fd`
- force push
- history rewrite
- `.git` 삭제
- credential 커밋

## 이 repo의 실제 분리 구조

```
C:\Cording Agent                  -- CODE REPOSITORY (source of truth, 이 repo, Git)
C:\Agent Workspace                 -- 업무 산출물 / POC / 임시 작업 (repo 밖, 별도 root)
C:\Obsidian\Personal-Agent-Vault   -- 사람이 읽는 개발 노트/의사결정 (repo 밖)
%USERPROFILE%\.pi-personal         -- 개인 브라우저 프로필/다운로드/스크린샷 등 runtime state (repo 밖)
~\.pi\agent                        -- Pi 자체 전역 runtime(인증/세션) — 절대 이 repo로 옮기지 않음
```

새로운 업무성 산출물(여행 조사, 스크래핑 결과, 실험 스크립트 등)은 이 repo 안이 아니라 `C:\Agent Workspace\`의 적절한 하위 폴더(`browser-poc`, `travel`, `research`, `coding`, `temp`, `artifacts`)에 만든다. 사람이 읽을 개발 노트/의사결정/회고는 이 repo의 `docs/`가 아니라 Obsidian Vault에 쌓는다 — `docs/`는 agent가 개발 시 반드시 알아야 하는 구조/마일스톤/결정 기록만 최소로 유지한다.

`internal/`에는 개발 환경 `pi-dev` 하나만 있다(2026-09-28 통합 — 이전의 `pi-dev-user`/`pi-dev-AY`는 재사용 가치가 있는 부분만 `pi-dev`로 병합하고 나머지는 `C:\Agent Workspace\archive\`로 archive함, 삭제 아님).

## Pi CLI
`external/pi/packages/coding-agent`가 `npm link`로 global `pi` 명령에 연결돼 있다 — `pi` 명령은 항상 이 repo의 `external/pi` 소스를 직접 바라본다(별도 global install 아님). 소스를 빌드로 반영하려면 `external/pi`에서 공식 build 스크립트(`npm run build`)를 실행한다.
