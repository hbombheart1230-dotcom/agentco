# CODING_AGENT_PLAN_v0.2

> **[2026-09-07] 이 문서는 historical/frozen 상태다.** 사내 논의 결과 프로젝트 기본 방향이 "Pi upstream을 기본 base로 채택"으로 바뀌었다 (자세한 내용: [CODING_AGENT_PLAN_v0.3.md](CODING_AGENT_PLAN_v0.3.md), [decision_log.md DEC-008](decision_log.md)). 이 문서에 기록된 M0~M1 실험 결과와 방법론(hypothesis, toy benchmark, decision hierarchy 이전 버전)은 **그대로 유효한 역사적 기록**이며 수정하지 않는다. M5 "4개 후보 대칭 비교" 프레이밍(12장)은 v0.3의 새 principle로 대체되었다 — 이 문서를 신규 판단의 근거로 그대로 쓰지 말고 v0.3을 먼저 확인할 것.
>
> 상태: **초안 (아이데이션 / 오픈소스 검증 단계) — v0.2**
> 작성일: 2026-09-01 (v0) / 개정: 2026-09-01 (v0.1, v0.2)
> **v0.2 변경 요약**: 사내 후보 모델이 **Qwen 3.8 Flash**와 **Z.ai GLM 5.3 Flash** 2종으로 확정됨에 따라, 이전까지 "사내 Qwen"으로 단일 지칭하던 부분을 전부 두 후보 모델로 일반화했다. M1.5 gate와 M2 Anchor Task B는 두 모델에 **동일한 절차로 각각** 적용해 모델 간 비교가 가능하도록 했다 (3장 원칙 6, 8장, 9장, 16장 HYPOTHESIS-7 참고).
> **이 프로젝트는 사내 Trading Agent System을 포함한 특정 downstream 프로덕션 시스템과 무관한 독립 연구 트랙이다.** 이 문서의 어떤 항목(특히 15장 evaluation metrics)도 특정 프로덕션 시스템의 리스크 프로파일을 근거로 삼지 않는다 — 근거는 "실제 개발환경에 배포되는 coding agent 일반"에 대한 표준적 우려뿐이다.
> **v0.1 개정 배경**: 직전 v0.1 초안이 M4_PRESURVEY_v0의 4개 항목만 반영하고, 그 이전에 합의된 v0→v0.1 전체 개정사항(M1.5 gate 신설, 실패 귀속 4단계 체계, TOY_BENCHMARK_v0 A~E 정식 반영, Anchor Task 지정, milestone별 반복 횟수 정책, M3 재축소, hypothesis 중립화, Own feasibility, Adoption Gate 신설, metrics 확장, concrete actions 교체)이 누락되어 있었다. 이번 버전에서 전체를 반영했다. 반영 검증 결과는 별도 검증표로 확인한다(이 문서 밖, 응답 본문).
> 이 문서의 목적: 사내 Coding Agent를 만들기 위한 "무엇을 왜 확인해야 하는가"를 정리하는 것.
> 이 문서는 **최종 architecture 문서가 아니다.** 17장에 명시된 항목은 아직 결정하지 않는다.

---

## 1. Goal

사내 개발환경(VS Code 기반 가상 개발환경 + 사내 후보 모델 endpoint — **Qwen 3.8 Flash**, **Z.ai GLM 5.3 Flash** 2종)에서 동작하는 Coding Agent를 만들기 위해,
먼저 기존 오픈소스 coding agent harness들(mini-SWE-agent, Pi, OpenHands V1, NOOA)의 구조와 동작 방식을 **직접 돌려보며** 이해하고,
그 지식을 바탕으로 "우리가 무엇을 재사용하고 무엇을 새로 만들지"에 대한 근거 있는 판단을 내릴 수 있는 상태에 도달한다.

이번 단계의 산출물은 코드가 아니라 **검증된 가설들의 목록**과, M5에서 내릴 BASE 선택(12장)의 근거 자료다.

이 프로젝트는 특정 downstream 애플리케이션(예: 트레이딩 시스템)의 요구사항에 맞춰 설계되지 않는다. 평가 기준과 리스크 판단은 일반적인 coding agent 배포 맥락에서 도출한다.

## 2. Non-goals

- 사내 최종 Coding Agent의 architecture를 확정하는 것 (이번 단계 아님 — M5는 "base 선택"까지만 다룬다)
- 특정 harness(mini-SWE-agent 등)를 그대로 fork해서 프로덕션화하는 것
- UI/UX를 지금 디자인하는 것 (M3도 feasibility 확인일 뿐 VS Code extension이나 Jupyter 통합을 실제로 구현하지 않는다)
- 성능 튜닝, prompt 최적화 등 완성도를 높이는 작업
- 사내 후보 모델(Qwen 3.8 Flash, GLM 5.3 Flash)을 fine-tuning 하는 것
- 여러 harness를 한 번에 통합하는 "슈퍼 harness"를 만드는 것
- 특정 downstream 프로덕션 시스템의 요구사항에 맞춰 이 연구의 우선순위를 조정하는 것

## 3. Working principles

1. **처음부터 최종 architecture를 확정하지 않는다.** M5의 BASE Decision도 "다음 단계에서 무엇을 기반으로 상세 설계를 시작할지"에 대한 결정이지, 최종 architecture가 아니다.
2. **각 설계 요소는 hypothesis로 관리한다.** "이렇게 할 것이다"가 아니라 "이렇게 하면 될 것이라고 가정한다 → 검증 필요"로 기록한다.
3. **동일한 toy task를 외부/사내, 여러 harness/model에서 반복해 비교한다.** 비교 가능성이 개별 실험의 완성도보다 중요하다.
4. **Claude는 architecture/review 중심, Codex는 source verification/implementation 중심으로 사용한다.** (5장 참고)
5. **사외 완성 → 사내 이식이 아니라, 초기부터 짧은 주기로 사외↔사내를 왕복 검증한다.** M1.5에서 사내 왕복 검증이 시작되고, M3에서 실제 개발환경까지 확장한다.
6. **비교 실험에서는 한 번에 하나의 변수만 바꾼다.** M0→M1처럼 harness를 비교할 때는 backend model을 동일하게 고정하고, M1.5→M2처럼 모델을 바꿀 때는 그 전에 harness/환경이 이미 검증된 상태여야 한다. 마찬가지로 M1.5/M2에서 **사내 후보 모델(Qwen 3.8 Flash, Z.ai GLM 5.3 Flash) 두 개를 비교할 때는 gate 절차와 toy task(특히 Anchor Task B)를 동일하게 고정**하고, 모델만 변수로 남긴다.
7. **실패 원인은 Environment → Endpoint/Serving → Harness/Model integration → Model behavior 순서로, 배제법으로 좁힌다.** 앞 단계가 확인되지 않은 상태에서 뒷 단계(특히 "모델이 못한다")로 결론 내리지 않는다 (8장 M1.5 참고).

## 4. External / Internal development strategy

| | 외부 (사외 PC) | 사내 (VS Code 가상 개발환경) |
|---|---|---|
| 목적 | harness 구조 학습, 최소 smoke test, 빠른 반복 | 실제 제약조건(후보 모델 endpoint, 네트워크, VS Code/Jupyter 통합) 검증 |
| 모델 | Claude Code / Codex 기본 플랜 중 **하나로 고정** (M0~M1 동안 변경하지 않음, working principle 6) | 사내 후보 모델 2종: **Qwen 3.8 Flash**, **Z.ai GLM 5.3 Flash** — M1.5/M2에서 동일 gate·Anchor Task로 각각 비교 |
| 해당 milestone | M0, M1 | M1.5(readiness gate), M2, M3 |
| 산출물 | smoke test 로그, 구조 노트, hypothesis 갱신 | gate 통과 기록, 사내 제약 목록, 동일 toy task 결과 비교, 환경 feasibility 결과 |

M4(architecture 참고 조사)는 외부/사내 구분이 크지 않은 문헌·소스 조사 성격이다. M5(BASE Decision)와 13장(Adoption Gate)은 M0~M4 전체를 종합하는 판단 단계다.

## 5. Claude Code / Codex 역할 분담

- **Claude Code**
  - Architecture 검토, harness 간 구조 비교, 이 문서류(계획서, decision log, experiment journal)의 정리
  - "이 harness의 tool-call loop 구조가 우리 요구사항과 어떻게 다른가" 같은 상위 레벨 분석
  - M4 architecture reference 조사의 구조적 분석, M5 BASE Decision 초안 작성
  - Review 역할: Codex가 검증한 내용에 대한 2차 검토
- **Codex**
  - Source code 수준 verification: 실제로 mini-SWE-agent/Pi/OpenHands/NOOA의 코드가 문서/README와 일치하는지 확인
  - Smoke test 구현 및 실행 (harness 설치, toy task 실행 스크립트 작성) — M0, M1, M2
  - 사내 후보 모델 endpoint 연동 코드 작성 — Qwen 3.8 Flash, GLM 5.3 Flash 각각 (M1.5, M2), VS Code/Jupyter feasibility spike 구현 (M3)

원칙: **Claude가 "이렇게 되어 있을 것이다"라고 말한 것을 Codex가 실제 코드로 확인한다.** 반대로 Codex가 구현한 것의 설계적 타당성은 Claude가 검토한다.

**주의**: 위 역할분담은 "계획/구현/리뷰를 누가 하는가"에 대한 축이며, M0/M1 toy task 실행 시 harness가 실제로 호출하는 **backend LLM이 무엇인지와는 별개**다. M0/M1의 backend model은 working principle 6에 따라 하나로 고정하되, 구체적으로 어떤 모델(Claude Code 세션 vs Codex 세션)을 쓸지는 M0 착수 시점에 정하고 M1까지 바꾸지 않는다 — 이 문서에서 지금 확정하지 않는다.

## 6. M0: Minimal Agent Loop

- **Harness / 환경**: mini-SWE-agent / 외부
- **핵심 질문**: *"Agent의 본질을 이해한다"* — 관측 → 사고 → 도구 호출 → 결과 반영이라는 최소 loop는 어떤 구성요소로 이루어지는가.
- **Toy task**: A(Find & Read), B(Fix the Failing Test) — [TOY_BENCHMARK_v0.md](TOY_BENCHMARK_v0.md) 기준 M0 최소 세트. **B는 공통 Anchor Task다 (14장 참고).**
- **실행 방식**: A, B 각 **1회, 정밀분석**. 통계적 검증이 목적이 아니라, 1회 trajectory를 처음부터 끝까지 완전히 이해하는 것이 M0의 목적이다 (14장 반복 횟수 정책 표 참고).
- **확인할 것**:
  - Agent loop의 최소 구성요소는 무엇인가 (system prompt, tool schema, history 관리 방식)
  - 모델 교체가 얼마나 쉬운가 (hard-coded API 의존이 있는가)
  - 실패/재시도 처리 방식
- **산출물**: 구조 노트 1장, Anchor Task B의 source call-chain trace, hypothesis 갱신 (16장)

## 7. M1: Structured Tool Harness

- **Harness / 환경**: Pi / 외부, **M0와 동일한 backend model 사용** (working principle 6)
- **핵심 질문**: *"Tool/State/SDK 차이를 이해한다"* — mini-SWE-agent 대비 structured tool-calling과 state 관리가 무엇을 다르게 하는가.
- **Toy task**: A, B, C(Pick the Right Script), D(Precise Structured Edit) — A/B는 M0와 동일하게 재실행해 harness 간 비교 기준을 유지, C/D는 M1에서 신규 추가.
- **실행 방식**: 각 task **1~2회**. M0보다 조금 더 반복해 harness 간 초기 안정성 감각을 잡되, 아직 통계적 유의성을 목표로 하지 않는다.
- **확인할 것**:
  - Tool schema를 얼마나 엄격하게 강제하는가 (structured output 방식, SDK가 대신 처리해주는 범위)
  - 사내 후보 모델(Qwen 3.8 Flash, GLM 5.3 Flash)의 tool-calling 포맷과의 호환 가능성 (M1.5/M2 리스크 조기 추정)
  - Pi SDK를 그대로 채택했을 때 얻는 것과 잃는 것 (M5 BASE Decision의 후보 중 하나이므로 여기서 장단점을 기록해둔다)
- **산출물**: M0 대비 비교 노트, hypothesis 갱신

## 8. M1.5: Internal Readiness Gate

- **목적**: harness를 사내 후보 모델에 실제로 붙이기(M2) 전에, **harness 없이 raw 레벨**에서 환경/endpoint/통합 계층이 최소한 동작하는지 확인한다. M2가 실패했을 때 "어디가 원인인지" 구분 가능한 상태를 미리 만드는 것이 유일한 목적.
- **환경**: 사내, 후보 모델(**Qwen 3.8 Flash**, **Z.ai GLM 5.3 Flash**) 최초 접촉 지점
- **상세 checklist와 최소 PASS gate**는 [ENV_CAPABILITY_CHECKLIST_v0.md](ENV_CAPABILITY_CHECKLIST_v0.md)의 G1~G10을 그대로 사용한다 (이 장에서 재정의하지 않는다).
- **후보 모델별로 독립 실행**: G1~G10은 **Qwen 3.8 Flash용 1회, GLM 5.3 Flash용 1회, 각각 독립적으로** 통과해야 한다. 두 모델이 같은 사내 서빙 인프라를 공유하더라도(Environment 단계는 공유될 수 있음), 인증·프로토콜·tool-calling 형식(Endpoint/Serving 단계)은 모델마다 다를 수 있으므로 gate 결과를 모델별로 별도 기록한다. 한쪽 모델만 gate를 통과한 경우, 그 모델에 대해서만 M2를 시작할 수 있다.
- **실패 귀속 4단계**: 실패 원인은 아래 순서로, 앞 단계를 통과하지 못하면 뒷 단계를 판단하지 않는 방식으로 좁힌다.
  1. **Environment** — sandbox가 shell/git/python/subprocess/filesystem/network를 지원하는가 (ENV_CAPABILITY_CHECKLIST G8~G10, 두 모델 공통 환경이면 1회로 충분)
  2. **Endpoint/Serving** — 해당 후보 모델의 endpoint가 인증/프로토콜/tool-calling 형식 등 API 레벨에서 정상 응답하는가 (ENV_CAPABILITY_CHECKLIST G1~G7, 모델별 개별 확인)
  3. **Harness/Model integration** — mini-SWE/Pi 각각의 client 코드가 해당 후보 모델의 실제 응답 포맷을 문제없이 파싱/처리하는가. Endpoint 자체나 모델 추론 능력과 무관하게, harness의 모델별 adapter/client 코드 결함일 수 있는 계층 (ENV_CAPABILITY_CHECKLIST에는 없던 축 — G1~G10 통과 후, harness를 붙인 최초 1~2회의 raw round-trip이 정상 파싱되는지로 확인, 모델별로 각각 확인)
  4. **Model behavior** — 위 3단계가 모두 확인된 이후에만, 남은 실패를 모델 자체의 추론/판단 능력 문제로 귀속한다. 두 모델 모두 1~3단계를 통과한 뒤에야 "이 모델이 저 모델보다 못한다"는 비교가 성립한다 (HYPOTHESIS-7 참고).
- **명시적 원칙**: **OpenAI API 호환 여부는 이 gate의 통과/실패 기준이 아니다.** 호환되지 않더라도 harness/model integration 계층에 adapter를 추가하면 agent 자체는 여전히 feasible할 수 있다 — 호환 여부는 feasibility gate가 아니라 **integration cost** 지표로 다룬다 (15장, HYPOTHESIS-4 참고). 두 후보 모델의 호환 여부가 서로 다를 수 있으므로, 이 원칙은 모델별로 독립적으로 적용한다.
- **산출물**: 후보 모델별 G1~G10 결과 기록, harness×모델별 raw round-trip 성공 여부 기록. 이 결과 없이는 해당 모델에 대한 M2를 시작하지 않는다.

## 9. M2: Internal Candidate Model Core Smoke (Qwen 3.8 Flash / GLM 5.3 Flash)

- **Harness / 환경**: mini-SWE-agent **및** Pi / 사내, **Qwen 3.8 Flash 및 Z.ai GLM 5.3 Flash 각각**
- **선행조건**: 8장(M1.5)에서 해당 후보 모델이 G1~G10 게이트를 통과해야 그 모델에 대한 M2를 시작한다. 한쪽 모델만 통과했다면 그 모델만으로 M2를 먼저 진행할 수 있다.
- **핵심 질문**: *"각 후보 모델이 agentic loop를 수행 가능한가, 그리고 두 모델 간 차이가 있는가"* — harness 종류와 무관하게 모델 자체가 agent core로서 동작하는지, 그리고 Qwen 3.8 Flash와 GLM 5.3 Flash 중 어느 쪽이 더 안정적인지.
- **Toy task**: A~E 전체 (E는 M2에서 신규 추가 — 후보 모델의 해석력을 repair 능력에서 분리해 단독 관찰하기 위함). **B(Anchor Task)는 반드시 포함.**
- **실행 방식**: harness(2) × 후보 모델(2) × task 조합마다 **3~5회 반복** — 총 4개 harness×모델 조합. M0/M1보다 반복을 늘리는 이유는 모델이 처음 바뀌는 지점이라 확률적 변동을 통계적으로(success rate, variance) 다뤄야 하기 때문 (15장 metrics 참고). **Anchor Task B는 이 4개 조합 전체에서 공통으로 실행**해, harness 차이와 모델 차이를 같은 기준점에서 비교할 수 있게 한다.
- **범위**: M0/M1에서 검증한 두 harness **모두**를, 사내 VS Code 가상 개발환경에서 **두 후보 모델 모두**에 대해 재실행한다. harness나 모델 어느 한쪽만 골라서 넘기지 않는다 — 넷 다 돌려봐야 "harness 문제인지, 모델 문제인지, 특정 모델만의 문제인지"를 구분할 수 있다.
- **확인할 것**:
  - 각 후보 모델 endpoint의 tool-calling / structured output 지원 수준 (mini-SWE 방식 vs Pi 방식 각각에서)
  - 응답 속도, context 길이 제약 등 실사용 제약 (모델별로 다를 수 있음)
  - harness 간, 그리고 **모델 간** 적합도 차이 (있다면 그 원인이 harness 설계 때문인지, 특정 모델의 프롬프트/포맷 특성 때문인지 — 8장의 4단계 귀속 체계로 판정)
- **산출물**: 사내 제약 목록, "harness가 특정 모델에 종속적으로 짜여 있던 지점" 목록, 두 후보 모델 간 비교 노트 (16장/17장에 반영)

## 10. M3: Internal Environment Feasibility

- **대상**: VS Code / `.ipynb` / kernel access — **구현이 아니라 feasibility 확인**
- **핵심 질문**: *"실제 개발환경에 agent core를 붙이는 게 기술적으로 가능한가"* — VS Code extension이나 완성된 Jupyter 통합을 만드는 것이 목적이 아니다 (2장 non-goals와 일치).
- **범위**: M2에서 검증된 agent core(harness+사내 후보 모델)를 VS Code 가상 개발환경의 터미널/파일시스템에서 실행할 수 있는지, Jupyter 커널에 대한 최소한의 프로그래밍적 접근(커널 기동/셀 실행/출력 회수 각각의 가능 여부)이 있는지를 **최소 스파이크 수준**으로만 확인한다. 새 toy task를 만들지 않고 기존 A~E를 재사용한다 (14장).
- **확인할 것**:
  - VS Code 가상 개발환경 내 실행 제약 (네트워크, 파일시스템 접근, 터미널 권한 등)
  - Jupyter 커널 기동/셀 실행/출력 회수가 프로그래밍적으로 가능한가 (완성된 통합이 아니라 가능/불가능 여부)
  - Agent core와 "VS Code라는 UI" 사이의 경계가 얼마나 깨끗하게 분리되는가 (HYPOTHESIS-3, 16장)
- **산출물**: 환경 제약 목록(가능/불가능 수준), "여기서부터는 실제 구현이 필요하다"는 경계선 — 상세 구현 설계는 하지 않는다.

## 11. M4: Architecture References

- **대상**: OpenHands V1 + NOOA
- **핵심 질문**: *"우리에게 필요한 복잡도/abstraction 수준을 확인한다"* — 채택이 목적이 아니라 대조군 확보가 목적.
- **OpenHands V1**: 더 복잡한(멀티스텝, sandbox 실행, event stream 기반) agent 구조를 참고 대상으로 본다. M0~M3에서 겪은 필요를 이 구조가 어떻게 해결하는지 비교하고, "우리가 나중에 필요해질 수도 있는 복잡도"가 실제로 필요한지 판단하는 데 사용한다.
- **NOOA**: NVIDIA의 object-oriented agent 프레임워크로, 다른 harness들과 설계 철학이 다른 대안적 접근으로서 비교 대상에 포함한다. (정체는 [M4_PRESURVEY_v0.md](../report/M4_PRESURVEY_v0.md)에서 공식 repo/논문 기준으로 최소 확인 완료 — 상세 평가는 M4 본조사에서.)

- **M4 스코프 (pre-survey 기반, 결론 아님)**: 아래는 [M4_PRESURVEY_v0.md](../report/M4_PRESURVEY_v0.md)가 제공하는 reading map을 그대로 가져온 것이다. **pre-survey의 관찰 내용 자체(어떤 concept이 특정 hypothesis를 뒷받침한다거나, 특정 프로젝트가 더 적합해 보인다는 서술)는 여기 포함하지 않는다** — 오직 "무엇을 볼지/안 볼지/모르는지/검증해야 하는지"만 가져온다.

  - **M4에서 확인할 대상**
    - NOOA: Code-as-Action / typed contracts / capabilities 정의 방식 (공식 repo README + 튜토리얼 노트북) — 필요 시 M3 착수 시점에 조기 열람 가능
    - NOOA: execution/security model 원문 (공식 arXiv 논문 관련 섹션)
    - OpenHands: workspace/runtime 추상화 원본 코드/문서
    - OpenHands: event architecture 원본 소스코드
    - OpenHands: SDK/client 분리 구조 원본 문서
  - **읽지 않을 대상 (현재 스코프에서 제외)**
    - OpenHands: agent core, tools 기본 구조의 상세 조사 (M4 착수 시 필요성 재확인 대상으로만 남김)
    - NOOA: subagent/composition 상세 (17장에서 multi-agent 여부를 이미 결정 보류 항목으로 지정)
  - **아직 미확인인 사항**
    - OpenHands: context management 메커니즘 (pre-survey에서 공식 출처로 확인 못함)
    - OpenHands: event architecture의 정확한 구조 (pre-survey에서 참고한 두 공식 출처의 서술이 서로 다르게 읽혀, 판단을 보류함)
  - **Codex가 source-level로 검증해야 할 사항**
    - OpenHands의 event-sourcing 관련 구조와 실행 방식이 V1 소스코드상 실제로 어떻게 구성되어 있는지
    - NOOA의 AST validation / module deny-list의 실제 구현 범위와 한계
    - OpenHands workspace 추상화(로컬↔원격 실행 환경 전환)가 agent 코드 변경 없이 실제로 교체 가능한지

- **부가 산출물**: M0~M3에서 드러난 필수 기능을 Own(자체구현)으로 만들 경우의 최소 effort estimate (12장 M5 착수 조건과 연결 — M4와 병행 진행)
- **산출물**: OpenHands/NOOA 구조 노트, "채택하지 않기로 한 이유" 포함 hypothesis 갱신 — 이 갱신은 M4 본조사 완료 후에만 수행하며, pre-survey 단계의 관찰로 선반영하지 않는다.

## 12. M5: BASE Decision

- **목적**: M0~M4에서 쌓인 근거를 바탕으로, 다음 설계 단계에서 무엇을 **기반(base)** 으로 삼을지 선택한다. 이것은 최종 architecture 확정이 아니라 "무엇 위에서 상세 설계를 시작할지"에 대한 결정이다 (원칙 1, 2장 참고).
- **후보 (모두 hypothesis 상태, M5 이전에 우열을 가정하지 않는다 — 4개 후보는 대칭적으로 취급한다)**:
  - **Pi SDK 채택** — structured tool-calling이 검증되었고 사내 후보 모델(Qwen 3.8 Flash / GLM 5.3 Flash)과의 호환도 확인된 경우
  - **자체 구현(Own)** — 기존 harness들이 공통적으로 우리 요구사항(모델/UI 비종속성)과 맞지 않는 가정을 깔고 있는 경우
  - **OpenHands 기반 채택** — M3에서 드러난 환경 통합 요구가 OpenHands 수준의 abstraction을 실제로 필요로 하는 경우
  - **Hybrid** — 예: agent loop는 mini-SWE/Pi 수준으로 단순하게, sandbox/event 처리만 OpenHands 방식을 부분 차용
- **M5 착수 조건**:
  1. M0~M4 실험/조사가 완료되어 있을 것
  2. **Own 후보에 대한 최소 effort/feasibility estimate가 존재할 것** — 다른 3개 후보는 M0~M4 실측 데이터가 쌓이는 반면 Own은 그렇지 않으므로, 정밀한 사람-일 추정이 아니어도 "M0~M4에서 드러난 필수 기능을 자체 구현할 경우 체감 난이도(상/중/하)와 근거"가 최소한 있어야 한다. 이게 없으면 Own은 근거 없이 배제되거나 근거 없이 선택되는 결과로 이어진다.
  3. 13장 Adoption Gate(License/Security/Internal policy)를 최소 1회 확인했을 것
- **진행 방식**: Claude가 M0~M4 근거를 종합해 초안 작성 → Codex가 후보별 source-level 재검증 → decision log(18장)에 confirmed로 기록.
- **산출물**: BASE Decision 기록 (decision log), 다음 단계(v1 상세 설계) 착수를 위한 열린 질문 목록

## 13. Adoption Gate: License / Security / Internal Policy

- **목적**: 기술적 우수성과 무관하게, 어떤 BASE 후보도 채택 전에 반드시 통과해야 하는 별도의 게이트. 18장 decision log(기술적 판단 기록)와 성격이 다르므로 분리한다.
- **체크리스트**:
  - **License**: 후보(Pi, OpenHands, NOOA 또는 그 일부 코드 차용)의 라이선스가 사내 상용 코드베이스 통합과 호환되는가
  - **Security**: 코드 실행/sandbox 모델이 사내 보안 정책과 충돌하지 않는가 (17장 미결 sandbox 항목과 연결)
  - **Internal policy**: 사외에서 만든 toy task/코드/실험 로그를 사내로 이전하는 것이 데이터 정책상 허용되는가 (20장 open question과 연결)
- **원칙**: 이 게이트는 M5의 기술적 BASE Decision과 **독립적으로** 통과해야 한다. 기술적으로 가장 우수한 후보라도 이 게이트를 통과하지 못하면 채택 후보에서 제외한다.
- **시점**: M4 완료 전후, M5 착수 전까지 최소 1회 확인 (M5 착수 조건 3, 12장).

## 14. 공통 toy benchmark 전략

상세 스펙은 [TOY_BENCHMARK_v0.md](TOY_BENCHMARK_v0.md)를 따른다. 이 장은 milestone 계획과의 연결점만 요약한다.

- **5개 task**: A(Find & Read), B(Fix the Failing Test), C(Pick the Right Script), D(Precise Structured Edit), E(Diagnose Only)
- **Task B는 공통 Anchor Task다.** M0~M4 전 milestone에서 예외 없이 포함하며, 다른 task가 milestone별로 추가/제외되더라도 B는 항상 실행해 milestone 간·harness 간·모델 간 비교의 고정 기준점으로 삼는다.
- **Milestone별 task 적용 범위**: M0(A,B) → M1(A,B,C,D) → M2(A~E 전체) → M3(신규 없음, A~E 재사용).
- **Milestone별 반복 횟수 정책** (harness/model 변수와 별개로 "같은 task를 몇 번 도는가"):

  | Milestone | 반복 횟수 | 목적 |
  |---|---|---|
  | M0 | 1회, 정밀분석 | 통계가 아니라 trajectory 전체를 이해하는 것이 목적 |
  | M1 | 1~2회 | harness 간 초기 안정성 감각 확보 |
  | M2 | task당 3~5회 (harness×모델 조합별) | 확률적 변동을 다루기 위한 최소 반복 (Qwen 3.8 Flash, GLM 5.3 Flash 두 후보 모델이 처음 투입되는 지점) |
  | M3 | 해당 없음 | feasibility 확인이지 반복 실행 대상이 아님 |

- Task 세트는 버전 관리한다 (`toy-tasks/v0/...`), M0에서 fixture를 확정한 후 M1~M3까지 고정.

## 15. 측정할 evaluation metrics

정량 지표와 정성 관찰을 함께 기록한다. 지금 단계에서는 "채점"이 목적이 아니라 **비교 가능한 기록**이 목적이다.

- **정량**
  - Task 성공/실패 (pass/fail)
  - **Success rate** — 반복 실행 대비 성공 비율. M2부터 의미를 가짐 (14장 반복 횟수 정책)
  - **Variance** — 동일 task 반복 실행 간 결과 편차 (성공 여부의 흔들림, trajectory 길이 편차)
  - 완료까지 turn/tool-call 수
  - Wall-clock 시간
  - Token 사용량 (가능한 경우)
  - **Malformed / repeated tool calls** — 스키마 오류로 실패한 tool-call 횟수, 동일 실패 명령의 반복 횟수 (Task C/D에서 특히 중요, 8장 Harness/Model integration 계층과 직결)
  - **Integration cost** — harness를 각 후보 모델(Qwen 3.8 Flash, GLM 5.3 Flash)에 연동하기 위해 변경한 파일/라인 수 (OpenAI 비호환 시 추가되는 adapter 코드량 포함, 모델별로 별도 집계 — HYPOTHESIS-4, 8장 원칙과 연결)
- **정성**
  - Tool schema를 모델이 얼마나 잘 따랐는가
  - **Recovery** — 실패 후 스스로 복구하는지, 같은 실수를 반복하는지, 포기하는지
  - **Unintended modifications** — 지시 범위를 벗어난 파일 변경 (Task B의 테스트 파일 우회 수정, Task E의 수정 금지 위반 등 git diff로 objective하게 확인 가능)
  - **Human intervention** — 실험 진행자가 개입해야 했던 횟수(멈춰서 수동 재시작, 프롬프트 수정 등)
  - Model-agnostic / UI-agnostic 정도
- 기록 위치: 18장 decision log와 별개로, milestone별 experiment journal(19장 포맷)에 남긴다.

## 16. 현재 architecture hypotheses

> 아래는 전부 **HYPOTHESIS** 다. 검증 전까지 설계 결정으로 취급하지 않는다. 모두 중립(null-hypothesis에 가까운) 형태로 서술한다 — 특정 결론을 미리 가정하지 않는다.

- **[HYPOTHESIS-1]** Agent 핵심 loop에 필요한 복잡도 수준은 아직 알 수 없다. 단순 동기 loop(mini-SWE 수준)로 충분한지, event 기반 등 추가 구조가 필요한지는 M0~M4 실험/조사로 판단한다.
- **[HYPOTHESIS-2]** Structured tool-calling(Pi 방식)과 비구조화(셸 기반) 접근 중 어느 쪽이 사내 후보 모델(Qwen 3.8 Flash, GLM 5.3 Flash) 연동 시 더 안정적인지 아직 알 수 없다. 두 모델 간에도 결과가 다를 수 있다. M1/M2에서 동일 조건(8장 4단계 귀속 체계) 비교로 판단한다.
- **[HYPOTHESIS-3]** Agent core가 VS Code 같은 특정 UI로부터 독립적으로 설계 가능한지 아직 검증되지 않았다. M3의 feasibility 확인으로 판단한다.
- **[HYPOTHESIS-4]** 사내 후보 모델(Qwen 3.8 Flash, GLM 5.3 Flash) 각각의 endpoint가 OpenAI-호환 API 스펙을 따르는지 아직 확인되지 않았으며, 두 모델의 호환 여부가 서로 다를 수 있다. **호환 여부와 무관하게 agent 연동 자체의 feasibility는 모델별로 별개로 판단한다** — 호환성은 feasibility gate가 아니라 integration cost 지표다 (8장 명시적 원칙).
- **[HYPOTHESIS-5]** OpenHands/NOOA 수준의 복잡도(sandbox, event bus, OO abstraction 등)가 초기 사내 유스케이스에 필요한지 아직 판단하지 않는다. M4에서 확인한 개념을 M0~M3 실측 결과와 대조해 판단한다.
- **[HYPOTHESIS-6]** Pi SDK / 자체 구현(Own) / OpenHands 기반 / Hybrid 중 어느 것을 채택해도 모델·UI 비종속성 요구사항을 해치지 않는지는 아직 알 수 없으며, **4개 후보 모두에 동일한 기준으로 검증한다** (특정 후보를 우선 가정하지 않는다).
- **[HYPOTHESIS-7]** Qwen 3.8 Flash와 Z.ai GLM 5.3 Flash 중 한쪽이 agentic coding에 명확히 더 적합한지 아직 알 수 없다. 동일한 M1.5 gate와 동일한 Anchor Task(B)로 두 모델을 같은 조건에서 비교한 뒤에만(8장, 9장) 이 판단을 내린다 — gate/harness/task가 다른 상태에서의 두 모델 비교는 근거로 삼지 않는다.

각 hypothesis는 관련 milestone에서 채택(confirmed) / 기각(rejected) / 부분채택(partial)으로 갱신하고 18장 decision log에 근거를 남긴다.

## 17. 아직 결정하지 말아야 할 사항

- 최종 BASE 이후의 상세 architecture (BASE는 M5에서 정하되, 그 위의 구체적 구조는 이번 문서 범위 밖)
- Tool schema의 최종 스펙
- Sandbox/실행 격리 방식 (Docker, VM, 프로세스 격리 등)
- Multi-agent 여부 (단일 agent loop vs orchestrator + sub-agent)
- 메모리/컨텍스트 관리 전략 (RAG, 파일 기반 등)
- VS Code extension으로 만들지, CLI로 만들지, 둘 다 지원할지
- 인증/권한 모델 (사내 endpoint 접근 제어)
- 배포 방식 (사내 서버 상주 서비스 vs 로컬 실행)
- 13장 Adoption Gate를 통과한 이후의 최종 채택 대상 (Adoption Gate는 제외 기준이지, 채택을 확정하지 않는다)

이 항목들은 M0~M5가 끝나기 전까지 **의도적으로 열어둔다.**

## 18. Decision log 운영 방법

- 파일: `decision_log.md` (같은 디렉토리, 이 문서와 별도 관리)
- 형식: 결정 1건당 아래 필드
  - `Date`
  - `Decision` (한 문장)
  - `Status`: proposed / confirmed / rejected / superseded
  - `Context` (왜 이 시점에 이 결정을 했는가)
  - `Alternatives considered`
  - `Related hypothesis` (16장 번호 링크)
  - `Related milestone` (M0~M5 중 어디서 나온 결정인가)
- 규칙: "확정하지 않기로 한 것"도 기록한다 (17장 항목이 왜 아직 열려있는지도 decision log 대상). M5의 BASE Decision과 13장 Adoption Gate 통과 여부는 반드시 이 형식으로 기록한다.
- Architecture 관련 결정은 Claude가 초안 작성, Codex가 source-level 근거 검증 후 confirmed 상태로 전환.

## 19. Experiment journal 형식

- 파일: milestone별 `experiments/M0_mini_swe_agent.md`, `experiments/M1_pi.md`, `experiments/M1.5_readiness_gate.md`, `experiments/M2_qwen_smoke.md`, `experiments/M3_env_feasibility.md`, `experiments/M4_openhands_nooa.md` ...
- 각 항목:
  ```
  ## Run <n> — <date>
  - Harness / model:
  - Toy task:
  - Environment (외부 PC / 사내 VS Code / 사내 Jupyter):
  - Result: pass / fail
  - Tool-call count / turns:
  - Wall-clock time:
  - Malformed / repeated tool calls:
  - Unintended modifications (Y/N, 있다면 diff 요약):
  - Human intervention count:
  - Notable behavior (실패 복구, 특이사항):
  - Hypothesis impact: (16장의 어떤 hypothesis에 영향을 주는가)
  ```
- 목적은 "어떤 harness가 이겼다"가 아니라, M5 BASE Decision을 내릴 때 **근거로 되돌아볼 수 있는 raw record**를 남기는 것.

## 20. 주요 risk와 open questions

- **Risk**: 사내 후보 모델(Qwen 3.8 Flash, GLM 5.3 Flash) 각각의 tool-calling 품질이 harness들이 기본 가정하는 수준(Claude/Codex 급)에 못 미칠 수 있다 → M1.5/M2에서 모델별로 조기 확인 필요.
- **Risk**: 두 후보 모델이 서로 다른 서빙 스택/인증 방식을 쓸 경우 M1.5 gate를 두 번 독립적으로 통과시켜야 하는 추가 비용이 발생한다 → 8장에서 이를 기본 전제로 반영해뒀으나, 실제 비용이 예상보다 크면 M1.5 자체의 일정에 영향을 줄 수 있다.
- **Risk**: VS Code 가상 개발환경의 네트워크/파일시스템 제약이 harness 실행 자체를 막을 수 있다 → M3에서 확인, 필요시 M1.5/M2 결과를 재검토.
- **Risk**: 4개 harness를 순차 분석하다 시간이 늘어져 "학습을 위한 학습"이 될 수 있다 → milestone마다 산출물(구조 노트 + hypothesis 갱신)을 강제하여 방지. M5라는 명시적 종료 게이트를 둔 것도 같은 이유.
- **Risk**: M2에서 mini-SWE와 Pi를 둘 다 사내에서 테스트하는 데 시간이 배로 들 수 있다 → 두 harness의 코드 변경 범위가 작으므로(주로 client 계층) 실제 추가 비용은 크지 않을 것으로 가정 (검증 필요, hypothesis 아님 — M2 착수 시 재확인).
- **Open question**: NOOA가 정확히 어떤 성격의 프로젝트인지 — [M4_PRESURVEY_v0.md](../report/M4_PRESURVEY_v0.md)에서 공식 repo/논문 기준으로 최소 확인 완료. 상세 평가는 M4 본조사 대상으로 남음.
- **Open question**: "특정 UI/모델에 종속되지 않아야 한다"는 요구사항을 어느 layer에서 강제할 것인가 (agent core vs adapter layer) — 지금은 결정하지 않되, M0~M3에서 각 harness/환경이 이 경계를 어떻게 긋는지 관찰 대상으로 삼는다.
- **Open question**: 사내 이식 시 보안/데이터 유출 제약이 있는지 — 13장 Adoption Gate(Internal policy 항목)에서 formal하게 다룬다.

## 21. 다음 3개 concrete actions

M0 실제 착수 기준으로 정의한다.

1. **Toy Benchmark A/B fixture 생성 및 human ground-truth 확인**: [TOY_BENCHMARK_v0.md](TOY_BENCHMARK_v0.md)의 Task A(Find & Read), Task B(Fix the Failing Test) 스펙대로 실제 repo fixture를 만들고, 사람이 직접 풀어서 objective success condition이 실제로 정답을 정확히 가려내는지 확인한다 (Codex 담당).
2. **mini-SWE-agent clone/install**: 사외 PC에 mini-SWE-agent를 설치하고, working principle 6에 따라 고정할 backend model을 확정한다 (Codex 담당).
3. **Anchor Task B 최초 trajectory 실행 및 source call-chain trace**: mini-SWE-agent로 Task B를 1회 실행하고, 호출되는 tool/함수 흐름을 처음부터 끝까지 source 수준으로 추적해 기록한다 — M0의 "정밀분석 1회" 목적과 직결 (Codex 구현, Claude 리뷰).

---
*이 문서는 살아있는 문서(living document)다. Milestone이 끝날 때마다 16장(hypotheses)과 17장(보류 항목)을 갱신한다.*
