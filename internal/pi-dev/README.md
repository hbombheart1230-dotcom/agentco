# Pi Dev Package

개인/개발용 Pi + 사내 vLLM(GLM) 연결 환경이다. **2026-09-28 internal/ 통합 이후, `internal/` 아래엔 이 `pi-dev` 하나만 있다** — 이전에 별도로 존재했던 `pi-dev-user`(self-contained 배포 패키지)와 `pi-dev-AY`(OpenRouter 무료 모델 tryout)는 재사용 가치가 있는 부분만 여기로 병합하고 나머지는 `C:\Agent Workspace\archive\`로 archive했다(삭제 아님). 이 repo의 `external/pi`(전체 소스, 빌드 산출물)를 그대로 재사용하며, 별도 복사본을 만들지 않는다.

## 용도
- source inspection, benchmark, trajectory/로그 확인
- Pi native TUI를 사내 GLM(`run-glm.cmd`) 또는 OpenRouter 무료 모델(`run-free.cmd`)로 실행
- provider/model A/B 진단(`ab-test.cmd`)
- `samples/`의 ground truth/evaluator 보관 ([validation/sample-ground-truth/](validation/sample-ground-truth/README.md))

## 회사에서 바꿀 3개 값
[config/SET_INTERNAL_VALUES.md](config/SET_INTERNAL_VALUES.md) 참고.

## 경로
```
internal/pi-dev/
├─ config/
│  ├─ models.json              -- Pi native models.json (placeholder, 사내 vLLM용)
│  ├─ SET_INTERNAL_VALUES.md
│  ├─ bin/
│  │  ├─ fd.exe                -- find tool용 공식 fd 바이너리 (offline 대비 vendored)
│  │  └─ rg.exe                -- grep tool용 공식 ripgrep 바이너리 (offline 대비 vendored)
│  ├─ skills/                  -- Pi native skill discovery(`<agentDir>/skills/`), PoC 3개
│  └─ extensions/               -- Pi native extension discovery(`<agentDir>/extensions/`)
│     ├─ pi-dev-info.ts              -- PoC: `/internal-info` command + `get_pi_dev_environment` tool (기본 미사용)
│     ├─ pi-dev-security-observer.ts -- PoC: tool_call/tool_result 관찰만, custom tool 없음 (기본 미사용)
│     └─ pi-dev-web-search.ts        -- **기본 사용.** Naver Search API로 `web_search` tool 등록 (Pi native엔 웹 tool이 전혀 없어서 추가함)
├─ scripts/
│  ├─ check-config.mjs         -- 3개 값 검증
│  ├─ check-config.cmd         -- 검증만 실행
│  ├─ run-glm.cmd              -- Pi native TUI 실행, 사내 GLM (credential-scrub + web-search extension 기본 활성화)
│  ├─ run-free.cmd             -- Pi native TUI 실행, OpenRouter 무료 모델 (pi-dev-AY에서 병합, 상세는 아래 "run-free.cmd" 참고)
│  ├─ check-model.mjs          -- run-free.cmd가 쓰는 모델별 liveness probe
│  ├─ ab-test.cmd              -- internal-vllm ↔ openrouter A/B 진단 (pi-dev-user에서 병합)
│  ├─ reset-samples.cmd        -- samples/를 초기 상태로 되돌림 (git 기반, pi-dev-user에서 병합)
│  └─ scrub-powershell-credentials.js  -- INTERNAL_VLLM_API_KEY가 agent의
│                                          powershell 하위 프로세스로 새지
│                                          않도록 하는 official 확장 (Smoke
│                                          A/B, Anchor B와 동일 메커니즘)
├─ samples/                    -- 기능 검증용 sample project 8종 (pi-dev-user에서 병합, 자체 git fixture 유지)
├─ validation/
│  └─ sample-ground-truth/     -- samples/ 8종의 정답/검증 기준 (agent가 작업할 samples/와 분리된 위치)
└─ README.md
```

## 실행 (사내 GLM)
```powershell
$env:INTERNAL_VLLM_API_KEY = "<실제 키>"
cd "C:\Cording Agent\internal\pi-dev\scripts"
.\run-glm.cmd
```

`run-glm.cmd`는 공식 `--offline` 플래그를 항상 붙인다 — Pi가 기본적으로 시작할 때
시도하는 버전/패키지 업데이트 확인(코딩 작업과 무관한 외부 호출)을 막기 위함이다.
`config/models.json`의 `baseUrl`(사내 vLLM)로 나가는 호출은 당연히 그대로 동작한다.

## run-free.cmd (OpenRouter 무료 모델)

사내 vLLM 없이 OpenRouter 무료 모델로 바로 시작하고 싶을 때 사용한다(원래 `pi-dev-AY` 패키지였던 것, 2026-09-28에 병합).

```powershell
cd "C:\Cording Agent\internal\pi-dev\scripts"
.\run-free.cmd
```

인자 없이 실행하면 검증된 무료 모델 후보 목록을 순서대로 짧게 찔러보고(liveness probe, `check-model.mjs`) 살아있는 첫 모델로 TUI를 띄운다 — Pi 자체엔 "이 모델 죽으면 다른 모델로 자동 전환"하는 기능이 없어서(같은 모델/provider 재시도만 native지원) 세션 시작 전에 미리 확인하는 방식으로 만들었다. 특정 모델을 강제로 쓰려면 `run-free.cmd "openrouter/<model>:free"`처럼 인자를 주면 된다. `.env.naver`가 있으면 `web_search`도 함께 켜진다.

## ab-test.cmd (A/B 진단)

사내(`internal-vllm`)와 OpenRouter 사이를 같은 PC/toolset/launcher 조건에서 빠르게 비교하고 싶을 때 쓰는 진단 전용 스크립트(원래 `pi-dev-user`에 있던 것, 병합됨). `-p`/`--json`/`--fullscreen`/`--tui [extra args]` 모드를 지원한다. 자세한 사용법은 스크립트 상단 주석 참고.

```powershell
.\ab-test.cmd internal|openrouter [-p "prompt"] [--json "prompt"] [--tui [extra args...]]
```

## samples/ (기능 검증)

8개 sample project(01~08)로 read/edit/write/ls/grep/find/powershell 조합을 검증한다. 각 폴더의 `README.md`에 추천 prompt가 있고, 정답/ground truth는 `validation/sample-ground-truth/`에 별도로 있다(agent가 읽지 않도록 분리). `reset-samples.cmd`로 초기 상태 복원(자체 git fixture 기반).

## web_search

Pi native built-in tool은 `read/bash/powershell/edit/write/grep/find/ls` 8개가 전부고(source: `external/pi/packages/coding-agent/src/core/tools/index.ts`) 웹/네트워크 tool은 애초에 없다 — `pi-dev-web-search` extension이 Naver Search API로 `web_search` tool을 새로 등록해 채운다. `run-glm.cmd`/`run-free.cmd` 둘 다 기본으로 켜며, `NAVER_CLIENT_ID`/`NAVER_CLIENT_SECRET`를 repo root `.env.naver`에서 자동으로 읽는다(없으면 tool 호출만 깨끗하게 실패, 나머지 기능엔 영향 없음).

## Toolset

`read, edit, write, ls, grep, find, powershell, web_search`.
과거 M1 실험은 `read/edit/powershell`로 의도적으로 제한했었다 — 이건 그 시점의 historical fact로 남겨둔다 (바뀐 게 아니라, 그때는 그게 맞는 선택이었다는 기록). 지금은 Pi Upstream-First 원칙에 따라 Windows에서 추가 설치 없이 동작하는 native tool을 임의로 제한하지 않는다. `bash`는 Windows에서 Git Bash 등 추가 dependency가 필요해 기본에서 제외했다(Pi 자체 기본값도 bash를 포함하지만, DEC-003의 Windows-first 원칙에 따라 powershell로 대체).

## 과거 pi-dev-user / pi-dev-AY (archive됨)

2026-09-28 이전엔 `internal/pi-dev-user`(self-contained 배포 패키지, portable Node 포함)와 `internal/pi-dev-AY`(OpenRouter 무료 모델 tryout)가 별도로 존재했다. 재사용 가치가 있던 부분(`ab-test.cmd`, `run-free.cmd`+`check-model.mjs`, `samples/`+`reset-samples.cmd`)은 이 `pi-dev`로 병합했고, extensions/skills는 이미 모든 패키지에서 내용이 동일했어서 병합할 게 없었다. 나머지(portable Node + 빌드된 self-contained bundle 등)는 `C:\Agent Workspace\archive\pi-dev-user\`, `C:\Agent Workspace\archive\pi-dev-AY\`에 통째로 보관돼 있다(삭제 안 함 — 필요하면 복원 가능).
