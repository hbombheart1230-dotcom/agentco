# CODING_AGENT_PLAN — 진행 현황 종합 보고 (Progress Summary)

> 작성: 2026-09-07
> 목적: 지금까지(M0~M1) 진행한 모든 작업을 한 문서에서 조망할 수 있게 정리. 세부 원본은 각 절의 링크를 따라간다.
> 이 문서는 계획서가 아니라 **현재 상태 스냅샷**이다 — 계획 변경은 [docs/plan/CODING_AGENT_PLAN_v0.md](../plan/CODING_AGENT_PLAN_v0.md)와 [docs/patchnote/PATCHNOTE.md](../patchnote/PATCHNOTE.md)를 따른다.

---

## 1. 프로젝트 개요

사내 Coding Agent를 만들기 전, 기존 오픈소스 harness(mini-SWE-agent, Pi, OpenHands, NOOA)를 실제로 돌려보며 구조를 이해하고 근거 있는 BASE 선택(M5)을 준비하는 연구 트랙. **최종 목표 아키텍처**: Windows PC(VS Code + Coding Agent, Windows-native execution) ↔ 사내 Linux 서버(vLLM, GLM 5.3 Flash / Qwen 3.8 Flash serving). 이 프로젝트는 Trading Agent System 등 다른 프로덕션 시스템과 완전히 무관하다.

### 문서 체계

```
docs/
  plan/      — CODING_AGENT_PLAN_v0(.2), TOY_BENCHMARK_v0, ENV_CAPABILITY_CHECKLIST_v0, MODEL_SERVING_STRATEGY_v0
  patchnote/ — PLAN 개정 이력
  report/    — M4_PRESURVEY_v0, 이 문서(PROGRESS_SUMMARY)
experiments/ — 실험 journal(M0/M1) + raw trajectory/driver script (문서와 분리 보관)
toy-tasks/   — 공통 toy benchmark fixture (현재 Task B만 실제 구현됨)
external/    — vendored 공식 repo (mini-swe-agent, pi) — 이 프로젝트 코드 아님, 소스 미수정
```

---

## 2. 지금까지 완료된 Milestone

| Milestone | 상태 | 핵심 결과 |
|---|---|---|
| M0 — Minimal Agent Loop (mini-SWE-agent) | **완료** | Run1(mismatch)→Run2(PowerShell 정렬) 비교, M0-FINDING-01 확보 |
| M1 Phase 1 — Pi Source Trace | **완료** | 구조 이해, GLM 호환 가능성 source로 확인 |
| M1 Phase 2 — Runtime Smoke (Smoke A/B) | **완료** | Model/provider/structured-tool-calling 경로 검증 |
| M1 — Anchor Task B (Pi) | **완료** | 6턴, 0 실패, 가장 깨끗한 diff로 종료 |
| M1.5 / M2 / M3 / M4 / M5 | **미착수** | — |

---

## 3. M0 요약 — mini-SWE-agent

원본: [experiments/M0_mini_swe_agent.md](../../experiments/M0_mini_swe_agent.md)

- 공식 repo(`SWE-agent/mini-swe-agent`, commit `25941c89c`) source-level 조사 완료. Model/Environment/Agent-loop call chain 확인.
- **Run 1**(GLM 5.3 Flash via OpenRouter, Windows, `LocalEnvironment`가 `shell=True`로 실행 → 실제로는 **cmd.exe**): Task Correctness PASS, Harness Completion **LimitsExceeded**(step_limit 15 소진). 원인: mini.yaml의 prompt/tool 계약은 bash를 전제하는데 실제 실행은 cmd.exe라 heredoc·`;`·`/dev/null`이 반복 실패 — 5회 shell 실패, 15턴 중 절반 이상을 recovery에 소모.
- **Run 2**(같은 조건, `os.environ["COMSPEC"]`을 PowerShell로 override + prompt/tool description을 PowerShell 지향으로 교체 — driver script 레벨의 실험적 workaround, mini-SWE 소스 미수정): Harness Completion **Submitted**로 개선, 9턴, shell 실패 2건으로 감소. 단 `pkg/calc.py` diff에 의도치 않은 docstring 포맷/줄바꿈 변화 발생(기능적으로는 무해).
- **M0-FINDING-01**: "Model-facing shell contract와 actual execution shell semantics가 불일치하면, 모델이 task를 올바르게 풀어도 command failure/recovery 반복으로 효율·종료 신뢰성이 나빠진다." 귀속 = Environment × Harness environment contract의 **interaction**(단독 요인 아님).
- **Security observation**: harness 프로세스의 credential(`OPENROUTER_API_KEY`)이 agent가 실행하는 shell subprocess에 기본적으로 상속되는 경로가 존재 — driver script에서 실행 직전 env를 scrub해 우회(mini-SWE 자체엔 공식 확장점 없음).
- **Product Requirements 확정**(PLAN 미수정, journal에만 기록): PR-ENV-01(Windows-first execution), PR-SERVING-01(원격 사내 vLLM serving), PR-INSTALL-01(WSL/Docker 비필수), PR-LINUX-01(Linux 실행은 secondary).

## 4. M1 요약 — Pi (`earendil-works/pi`)

원본: [experiments/M1_pi.md](../../experiments/M1_pi.md)

### Phase 1 — Source Trace
- 공식 repo(commit `4e69b0c2806...`, `@earendil-works/pi-coding-agent@0.84.4`) 조사. `agent-loop.ts`(순수 함수형 event loop) / `Agent`(stateful wrapper) / `AgentSession`(세션·압축·bash·확장을 얹는 제품 레이어) 구조 확인.
- Tool 8종(read/bash/powershell/edit/write/grep/find/ls) 전부 실존. **기본 활성 tool은 OS 무관 고정값**(`read, bash, edit, write`) — powershell은 opt-in.
- Windows: bash tool은 **Git Bash**를 우선 탐색(cmd.exe로 조용히 폴백하지 않음), powershell tool은 **pwsh 우선, 없으면 5.1 자동 폴백**(공식 문서 `docs/windows.md`로 확인, 이 머신엔 pwsh 미설치라도 문제 없음).
- `edit` tool: exact-string-replacement, 여러 disjoint edit 지원, **line-ending/BOM 자동 감지·복원** — M0 Run 2의 collateral diff 문제를 구조적으로 방지할 가능성 확인.
- OpenRouter는 1급 provider(`OPENROUTER_API_KEY`), GLM은 카탈로그엔 없지만 **custom model id fallback 경로가 소스에 존재**(주석에 GLM 예시가 이미 있었음).
- Termination: mini-SWE식 explicit submit 명령 없음 — tool call 없는 최종 응답 = 자연 종료.
- Credential: 기본적으로 전체 process env가 shell tool에 상속되나, **공식 `spawnHook` 확장점**으로 scrub 가능(mini-SWE보다 구조적으로 지원 수준이 높음).
- **결론**: Node.js 미설치가 유일한 실행 blocker, GO 판정.

### 환경 준비 — Node.js 설치
- Windows native, 관리자 권한 불필요한 방식으로 **Node.js v24.20.0**(Active LTS) 설치. 1차 시도(MSI, 전체 사용자용)는 Error 1925(권한 부족)로 실패 → 공식 ZIP 배포판(체크섬 검증)으로 사용자 로컬 설치, User PATH 영구 등록.
- `npm ci`(317 packages) + `npm run build` 전체 성공, `pi --version`/`pi --help` 정상 동작 확인.

### Phase 2 — Runtime Smoke
- **Smoke A**(tool 없음): PASS, 1턴, `finalText === "PI_GLM_SMOKE_OK"` 정확히 일치.
- **Smoke B**(`read` tool만): PASS, 2턴, structured tool call 정상 생성·파싱·실행·결과 반영·자연 종료 전부 확인.
- Custom model 등록은 **in-memory `Model` 객체 하나만으로 충분**(models.json도 CLI 플래그도 불필요) — Phase 1 예상보다 더 간단했음.

### Anchor Task B (Pi, 1회)
- Tools: `read, edit, powershell`(bash/write 제외). Fixture는 mini-SWE와 동일하게 pristine 버그 상태로 리셋 후 실행.
- **결과: Task Correctness PASS, Harness Completion NORMAL_FINAL(자연 종료)**, 6턴, tool 실패 0, recovery 0, 50.7초.
- `edit` tool이 uniqueness 문제(같은 문자열이 파일에 2번 존재)를 실제로 만나 **충분한 문맥을 포함해 1회 만에 정확히 해결** — Phase 1 예측과 정확히 일치.
- **diff는 정확히 1줄**(`return high`→`return low`), docstring/줄바꿈 완전 보존 — mini-SWE 두 run보다 더 깨끗함.
- 특이 행동: 이 run에서는 **fix 전에 pytest로 실패를 재현하지 않고** 코드 정적 비교만으로 버그를 특정 — mini-SWE 두 run과 다른 패턴(원인 미확정: prompt 차이/Pi 기본 system prompt/GLM 성향 중 무엇인지 불명).
- Credential scrub은 공식 `PowerShellSpawnHook`으로 적용, pre-flight 코드 경로 검증 완료(실제 secret 노출 검증은 하지 않음 — 정책상 의도적).

### M0 vs M1 지표 비교 (1회 실행 결과, 일반화 아님)

| Metric | mini-SWE Run 1 | mini-SWE Run 2 | Pi Anchor B |
|---|---:|---:|---:|
| Task correctness | PASS | PASS | PASS |
| Harness completion | LimitsExceeded | Submitted | NORMAL_FINAL |
| Model turns | 15 | 9 | 6 |
| Shell failures | 5 | 2 | 0 |
| Edit mechanism | shell(`sed`) | shell(전체 재작성) | structured `edit`(targeted) |
| Unintended diff | none | minor | none |
| Elapsed | ~117s | ~66s | ~51s |

---

## 5. Hypotheses 현재 상태

[docs/plan/CODING_AGENT_PLAN_v0.md](../plan/CODING_AGENT_PLAN_v0.md) 16장 기준. **이 문서는 hypothesis를 confirmed/rejected로 승격하지 않는다** — 그건 PLAN 문서 자체의 역할. 여기서는 관련 관찰만 연결한다.

| Hypothesis | 관련 관찰 (아직 confirmed 아님) |
|---|---|
| H1(core loop 복잡도) | mini-SWE의 단순 loop로 M0/M1 둘 다 실행 가능했음 — 복잡도 불필요 쪽 관찰 누적 중 |
| H2(structured vs 비구조화 tool-calling) | M1 Anchor B에서 shell 실패 0건 — structured 방식이 이 실패 클래스를 아예 없앤 것으로 보이나 1회 관찰 |
| H4(OpenAI 호환/integration cost) | mini-SWE·Pi 둘 다 OpenRouter를 별도 source 수정 없이 사용 — 두 harness 모두 integration cost 낮음으로 관찰 |
| H7(Qwen vs GLM) | **아직 Qwen을 한 번도 호출하지 않음** — 완전히 미검증 |
| H3, H5, H6 | 관련 milestone(M3, M4, M5) 미착수로 관찰 없음 |

---

## 6. 아직 결정하지 않은 것 (의도적으로 열어둠)

- BASE 선택(M5) — Pi/Own/OpenHands/Hybrid 중 아무것도 배제하지 않음
- Qwen 3.8 Flash는 한 번도 실행하지 않음(M1.5/M2 대상)
- M1.5(Internal Readiness Gate), M2(사내 vLLM), M3(환경 feasibility), M4(OpenHands/NOOA 본조사) 전부 미착수
- Adoption Gate(License/Security/Internal Policy) 미실시
- Pi/mini-SWE 우열 판단 — 지금까지의 모든 비교는 명시적으로 일반화 금지 처리됨

---

## 7. 다음 단계 후보 (판단은 사용자 몫)

- M1을 여기서 종료하고 M1.5/M2(사내 vLLM, Qwen 포함)로 진행
- 또는 Pi Anchor B를 같은 GLM으로 1회 더 실행해 재현성 확인
- 또는 mini-SWE M0의 나머지 toy task(A, C, D, E)를 Pi에서도 실행해 커버리지 확대
- 8번(아래 추천) 중 관리 부채가 쌓이고 있는 항목부터 정리

---

## 8. 추천 — 지금 필요할 수 있는 것

지금까지 작업하며 "언젠가 필요해 보이지만 아직 안 만든 것"들:

1. **`decision_log.md`가 아직 실제 파일로 없음.** PLAN 18장이 형식을 정의해뒀지만 물리적 파일을 한 번도 만들지 않았다 — M0-FINDING-01, Product Requirements(PR-ENV-01 등), Pi GO/NO-GO 같은 결정들이 지금 journal 산문 속에 흩어져 있다. `docs/decision_log.md`(또는 plan 폴더 하위)로 만들어 표 형태로 옮기는 걸 권장.
2. **toy-tasks/v0에 Task A/C/D/E fixture가 아직 없음.** TOY_BENCHMARK_v0.md는 5개를 정의했지만 지금까지 B만 실제로 만들어 썼다. M1에서 mini-SWE와의 비교 폭을 넓히려면(특히 D: structured edit 비교에 딱 맞는 task) 필요.
3. **프로젝트 루트에 진입점 README가 없음.** 지금 `docs/`, `experiments/`, `toy-tasks/`, `external/`이 뭘 뜻하는지 설명하는 최상위 안내가 없어서, 이 대화 맥락 없이 나중에 돌아오면 파악이 어려울 수 있다. 이 PROGRESS_SUMMARY를 가리키는 짧은 `README.md` 하나를 추천.
4. **`.env`에 무관한 `NAVER_*` 크리덴셜이 계속 같이 있다.** 지금까지는 매번 scrub 대상에 명시적으로 넣어 우회했지만, 별도 `.env`로 분리하는 게 근본적으로 더 안전하다(이 프로젝트 secret과 무관한 자격증명이 실험 driver 코드 곳곳에서 매번 "제외 목록"으로 다뤄지는 건 사고 여지가 있음).
5. **experiments/pi-smoke, experiments/pi-anchor-b의 `.agent-dir` 폴더**는 실행 부산물(빈 experiment-local Pi 설정 디렉터리)이라 정리 대상 후보 — 지금은 해가 없지만 나중에 실험이 늘면 지저분해질 수 있다.
6. **M1.5 gate 문서(ENV_CAPABILITY_CHECKLIST_v0)가 아직 Qwen에 대해 실제로 실행된 적 없음.** GLM만 두 번(mini-SWE, Pi) 통과했고 Qwen은 G1도 안 밟아봤다 — H7 검증을 시작하려면 이게 먼저다.

이 중 어느 것도 지금 임의로 만들지 않았어(요청 시 진행). 필요한 것부터 알려줘.
