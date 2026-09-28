# MODEL_SERVING_STRATEGY_v0

> 상태: **보조 문서 — [CODING_AGENT_PLAN_v0.md](CODING_AGENT_PLAN_v0.md)를 수정하거나 v0.2로 만드는 문서가 아니다.**
> 목적: M0~M2를 시작하기 전에 현재 사용 가능한 외부/사내 모델 및 serving 환경을 명시하고, 이후 실험에서 **Model / Serving / Harness** 차이를 혼동하지 않도록 비교축을 고정한다.
> 아직 실제 API capability를 검증하지 않았다. 실제 실행으로 확인되지 않은 사항은 `FACT`가 아니라 `TO VERIFY`로 표시한다.
> 새 architecture를 제안하지 않는다. M0~M2 실험을 해석하기 위한 보조 문서다.

---

## 1. 현재 확인된 환경 — External

현재 별도 **Trading Agent System**에서 OpenRouter를 사용하고 있으며 API 사용 비용이 발생하고 있다. `FACT` (기존 운영 사실)

**Coding Agent 프로젝트는 Trading Agent System과 완전히 별도 프로젝트다.** Trading Agent System의 agent architecture, 코드, 정책, 실행 로직을 Coding Agent 프로젝트에 가져오지 않는다.

단, **`OpenRouter`라는 외부 model provider/serving service 자체**는 Coding Agent M0/M1 실험에서도 독립적으로 사용할 수 있다. (Trading Agent System과 공유하는 것은 provider뿐이며, 그 위의 architecture/코드는 공유하지 않는다.)

OpenRouter에서 현재 후보로 고려할 수 있는 모델 중 하나:

- **Z.ai GLM 5.3 Flash**
- model identifier(카탈로그 표기): `z-ai/glm-5.3-flash`
- 이 식별자로 실제 API 호출이 성공하는지, 응답 capability가 기대와 일치하는지는 `TO VERIFY` (M0/M1에서 확인)

Qwen 후보도 OpenRouter에 존재하지만, 정확한 model identifier/revision은 `TO VERIFY` — 실제 사용 전에 확인한다.

## 2. 현재 확인된 환경 — Internal

사내에는 Linux server에서 **vLLM** framework를 이용해 LLM endpoint를 serving하고 있다. `FACT` (인프라 존재 사실)

현재 후보 모델:

### Internal Model A
- Qwen 3.8 Flash
- 정확한 model identifier / checkpoint / revision: `TO VERIFY`

### Internal Model B
- Z.ai GLM 5.3 Flash
- 사내 실제 model identifier / checkpoint / revision: `TO VERIFY`

**Serving 경로**: Linux Server → vLLM → Internal LLM Endpoint `FACT` (경로 구조는 알려짐, 세부 설정은 미검증)

API protocol, OpenAI compatibility, tool calling, structured output, chat template, tool parser 등의 실제 capability는 전부 `TO VERIFY` — [CODING_AGENT_PLAN_v0.md](CODING_AGENT_PLAN_v0.md) 8장(M1.5 Internal Readiness Gate) 및 [ENV_CAPABILITY_CHECKLIST_v0.md](ENV_CAPABILITY_CHECKLIST_v0.md)에서 확인한다.

## 3. 중요한 계층 구분

Coding Agent 실험에서는 다음 네 계층을 혼동하지 않는다 (CODING_AGENT_PLAN_v0.md 3장 원칙 7, 8장과 동일한 4단계 귀속 체계).

```
Environment
   ↓
Serving / Endpoint
   ↓
Harness / Adapter
   ↓
Model Behavior
```

| 계층 | 예시 |
|---|---|
| **Environment** | external PC / internal Linux, VS Code 가상 개발환경 |
| **Serving** | OpenRouter / internal vLLM |
| **Harness** | mini-SWE-agent / Pi |
| **Model** | GLM 5.3 Flash / Qwen 3.8 Flash |

어떤 실험이 실패했다고 바로 "모델 문제"라고 판단하지 않는다.

## 4. M0/M1 External Baseline 전략

M0와 M1의 목적 중 하나는 harness 차이를 이해하는 것이므로(CODING_AGENT_PLAN_v0.md 3장 원칙 6), 가능한 한 동일 backend model을 사용한다.

현재 유력한 baseline 후보: **`GLM 5.3 Flash via OpenRouter`**

예상 비교:

| Milestone | Harness | Model | Serving |
|---|---|---|---|
| M0 | mini-SWE | GLM 5.3 Flash | OpenRouter |
| M1 | Pi | GLM 5.3 Flash | OpenRouter |

이렇게 하면 가능한 한 Model / Serving을 고정하고 Harness만 바꿀 수 있다.

**단, 이것은 아직 확정 Decision이 아니다.** M0에서 Codex가 mini-SWE의 실제 provider/model source를 확인한 후 다음을 검증한다:

1. mini-SWE가 OpenRouter를 기존 provider 설정으로 사용할 수 있는가?
2. `z-ai/glm-5.3-flash`를 별도 architecture 수정 없이 사용할 수 있는가?
3. 어떤 SDK/provider abstraction을 거치는가?
4. OpenRouter 연결을 위해 mini-SWE source modification이 필요한가?
5. model request / response / action extraction 경로가 어떻게 구성되는가?

가능하면 harness source를 수정하지 않고 configuration/provider layer만으로 연결하는 것을 우선한다.

## 5. M2 Internal Comparison 전략

M2에서는 internal vLLM endpoint를 사용한다 (CODING_AGENT_PLAN_v0.md 9장).

기본 비교축:

| Harness | Internal GLM 5.3 Flash | Internal Qwen 3.8 Flash |
|---|---|---|
| mini-SWE | Test | Test |
| Pi | Test | Test |

이를 통해 Harness × Model interaction을 관찰한다. 단, 처음부터 모든 benchmark를 대량 반복하지 않는다.

### M2-0 — Raw Capability Gate

Harness를 붙이기 전에 GLM/Qwen 각각에 대해 최소 capability를 확인한다 (= CODING_AGENT_PLAN_v0.md 8장 M1.5, [ENV_CAPABILITY_CHECKLIST_v0.md](ENV_CAPABILITY_CHECKLIST_v0.md) G1~G10과 동일한 게이트, 모델별로 각각 실행):

- authentication
- system/user message
- normal text response
- structured JSON
- tool/function calling
- context/output limit
- timeout
- API protocol
- vLLM serving configuration
- chat template
- tool-call parser 관련 설정

목적은 모델 평가가 아니라 **Serving 기본 capability와 integration 조건 확인**이다.

### M2-1 — Anchor Task B

먼저 공통 Anchor Task B(CODING_AGENT_PLAN_v0.md 14장, [TOY_BENCHMARK_v0.md](TOY_BENCHMARK_v0.md) Task B)로:

**2 harness × 2 internal models × 3 runs**

를 기본 비교 단위로 고려한다. 즉 최대 12 trajectories.

이 결과를 본 뒤 A~E 전체 benchmark 반복 범위를 결정한다.

### M2-2 — Benchmark Expansion

필요한 조합에 대해 A~E를 3~5회 반복한다 (CODING_AGENT_PLAN_v0.md 14장 반복 횟수 정책과 동일한 상한).

모든 조합을 기계적으로 최대 반복 횟수까지 실행하는 것이 목적은 아니다. M2-1 결과에 따라 비교 가치가 있는 조합을 확장한다.

## 6. External ↔ Internal Control 전략

특히 **GLM 5.3 Flash가 External(OpenRouter)과 Internal(vLLM) 양쪽에 존재한다**는 점을 control로 활용할 수 있다.

예:

| | Harness | Model | Serving |
|---|---|---|---|
| A | Pi | GLM 5.3 Flash | OpenRouter |
| B | Pi | GLM 5.3 Flash | Internal vLLM |

Harness와 Model을 가능한 한 동일하게 유지하고 Serving/Environment를 바꾸는 비교가 가능하다.

**중요한 주의사항**: OpenRouter의 `z-ai/glm-5.3-flash`와 사내 vLLM의 GLM이 **이름만 같다고 동일 모델이라고 가정하지 않는다.** 반드시 다음을 가능한 범위에서 확인한다:

- exact model/checkpoint
- revision
- quantization
- context configuration
- chat template
- generation defaults
- tool-call parser
- serving-specific transformations

완전히 동일하지 않다면 "same model control"이라고 부르지 말고 `near-control` 또는 적절한 표현으로 구분한다.

## 7. Failure Attribution 예시

예를 들어:

> OpenRouter GLM + Pi = PASS
> Internal vLLM GLM + Pi = FAIL

이라고 해서 Internal GLM **모델 자체**가 문제라고 바로 판단하지 않는다.

우선 조사:

- API serialization
- chat template
- tool schema 전달
- tool-call parser
- stop token
- assistant/tool role history
- structured output handling
- generation parameters
- adapter implementation

반대로 여러 serving 환경에서 특정 model만 일관되게 같은 failure pattern을 보인다면 Model Behavior 가능성이 높아진다.

즉, 3장의 순서(Environment → Serving → Harness/Adapter → Model Behavior)로 failure domain을 좁힌다.

## 8. 비용 원칙

OpenRouter는 실제 API 비용이 발생하므로, M0/M1의 목적은 benchmark leaderboard 작성이 아니라 **trajectory 학습과 harness 비교**다.

따라서:

- M0: 1 trajectory 정밀 분석 (CODING_AGENT_PLAN_v0.md 14장 반복 횟수 정책과 동일)
- M1: 1~2 runs
- 불필요한 반복 호출 금지
- raw trajectory/log를 최대한 보존하여 한 번의 API 호출에서 최대한 많은 정보를 얻는다

비용 측정이 가능하면 experiment journal(CODING_AGENT_PLAN_v0.md 19장)에 다음을 기록한다:

- input tokens
- output tokens
- estimated/API reported cost
- number of model requests

단, 비용 절감을 위해 실험의 비교 가능성을 훼손하지 않는다.

## 9. 현재 Decision / To Verify 구분

### 현재 결정된 원칙

- Trading Agent System과 Coding Agent 프로젝트는 architecture/code 수준에서 분리한다.
- OpenRouter provider 자체는 Coding Agent 외부 실험에 사용할 수 있다.
- M0/M1은 가능한 동일 Model + Serving으로 Harness 차이를 비교한다.
- M1.5/M2에서는 사내 vLLM serving capability와 model behavior를 분리해서 본다.
- GLM과 Qwen 두 사내 모델을 후보로 유지한다.
- 실패를 곧바로 모델 탓으로 귀속하지 않는다.

### 아직 검증할 것 (`TO VERIFY`)

- mini-SWE의 현재 provider architecture
- Pi의 현재 provider architecture
- OpenRouter 연결 방식
- GLM 5.3 Flash 지원 방식
- 사내 GLM exact checkpoint/revision
- 사내 Qwen exact identifier/checkpoint/revision
- internal vLLM API compatibility
- internal vLLM tool calling 설정
- chat template
- tool-call parser
- structured output 지원
- OpenRouter GLM과 internal GLM의 실질적 동일성

## 10. M0 진입 시 Codex 첫 확인사항

M0에서 toy task를 실행하기 전에 Codex가 먼저 source-level로 다음을 확인한다:

1. mini-SWE의 Model abstraction 위치
2. 실제 Model API call path
3. 지원 provider 목록/방식
4. OpenRouter 사용 가능 여부
5. GLM 5.3 Flash 사용 가능 여부
6. 필요한 environment variables/config
7. source modification 필요 여부
8. model request/response가 Agent Loop에 들어가고 나오는 경로

이 확인 후 M0에서 사용할 실제 external backend/model을 최종 확정한다.

---

## Diagram

```
External:

  mini-SWE / Pi
       ↓
  Provider / Adapter
       ↓
  OpenRouter
       ↓
  GLM 5.3 Flash


Internal:

  mini-SWE / Pi
       ↓
  Provider / Adapter
       ↓
  Internal vLLM
       ↓
  GLM 5.3 Flash / Qwen 3.8 Flash
```

---

`Status: M0 시작 전 model/serving strategy 기록. 실제 capability는 아직 미검증.`
