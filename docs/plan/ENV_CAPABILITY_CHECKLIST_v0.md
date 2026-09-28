# ENV_CAPABILITY_CHECKLIST_v0

> 상태: **Specification only — architecture 제안이나 구현 코드 없음**
> 목적 문서: [CODING_AGENT_PLAN_v0.md](CODING_AGENT_PLAN_v0.md) M2(8장), Architecture Review의 "3. 사외→사내 전환 시 빠진 validation gate" 지적사항의 구체화
> 전제: **특정 Qwen 모델/버전/endpoint 스펙을 알고 있다고 가정하지 않는다.** 이 문서는 "무엇을 확인해야 하는가"의 목록이지, "무엇이 맞을 것이다"의 가정이 아니다.

---

## 0. 목적

M2가 실패했을 때 "Qwen이 agentic coding을 못 한다"로 뭉뚱그려 결론 내리지 않기 위해, 실패를 3가지 범주로 **미리 분리해서 귀속**할 수 있게 만드는 것이 이 checklist의 유일한 목적이다.

| 귀속 범주 | 의미 |
|---|---|
| **모델(Model)** | 모델 자체의 추론/포맷 준수 능력 문제. 같은 endpoint, 같은 환경에서도 다른 모델이면 다른 결과가 나올 만한 것 |
| **Endpoint/서빙(Serving)** | API 스펙, 서버 설정, 인증, 리소스 한계 등 — 모델을 감싸고 있는 서빙 계층 문제 |
| **환경/인프라(Environment)** | harness가 실행되는 sandbox의 실행 능력 문제 — 모델/endpoint와 무관하게 harness조차 못 도는 경우 |

각 checklist 항목에 이 범주를 태깅해서, 실패 시 "이 항목이 FAIL이었으니 원인은 여기"라고 즉시 좁힐 수 있게 한다.

---

## 1. Checklist

| # | 항목 | 확인 목적 (이게 없으면/틀리면 무엇이 안 되는가) | 귀속 범주 | 분류 | 확인 방법 (개념적) |
|---|---|---|---|---|---|
| 1 | API protocol | REST/HTTP인지, 다른 프로토콜인지조차 모르면 client를 쓸 수 없음 | Endpoint | **REQUIRED** | endpoint 문서 또는 관리자에게 프로토콜 확인, 1회 raw 요청으로 응답 형태 확인 |
| 2 | OpenAI API compatibility | mini-SWE/Pi의 기존 client 계층을 그대로 쓸 수 있는지 결정 (HYPOTHESIS-4 직결) | Endpoint | **REQUIRED** | `/v1/chat/completions` 또는 동등 경로에 최소 payload로 raw 요청 시도 |
| 3 | chat/completions 또는 responses 형태 | 어느 스키마를 타겟으로 tool 정의를 짜야 하는지 결정 | Endpoint | **REQUIRED** | 응답 JSON 구조가 어느 스펙을 따르는지 raw 응답으로 확인 |
| 4 | tool/function calling | 구조화된 tool 호출이 API 레벨에서 지원되는지 (지원 자체는 endpoint, 활용 품질은 모델) | Endpoint + Model | **REQUIRED** | 최소 1개 tool schema를 담은 raw 요청 → 스키마 유효한 tool_call 응답이 오는지 |
| 5 | parallel tool calls | 한 응답에 여러 tool 호출을 요청할 수 있는지 | Endpoint | **OPTIONAL** | Toy benchmark v0의 5개 task 모두 순차 단일 tool-call로 설계되어 있어 M2 자체엔 불필요 — 지원 여부만 기록 |
| 6 | streaming | 응답을 스트리밍으로 받을 수 있는지 | Endpoint | **DEFER TO M3** | 배치 방식 smoke test에는 불필요, VS Code 인터랙티브 사용성에서만 의미 있음 |
| 7 | structured JSON output | JSON 스키마를 강제/검증하는 기능이 있는지 (prompting에만 의존하는지) | Endpoint + Model | **REQUIRED** | Toy Task D의 정밀도가 이 항목에 직접 좌우됨 — raw 요청으로 소규모 JSON 스키마 준수율 확인 |
| 8 | system prompt | system role/필드를 지원하는지 | Endpoint | **REQUIRED** | system 필드 유무에 따라 응답 태도가 바뀌는지 최소 1회 비교 |
| 9 | context window | 몇 토큰까지 견디는지 | Endpoint(모델 한계 vs 서빙 절단 구분 필요) | **REQUIRED** | 문서 확인 또는 긴 입력으로 절단/에러 발생 지점 탐색 (정밀 측정은 M2 본 실험에서, 여기선 대략적 하한만) |
| 10 | max output tokens | 응답이 도중에 잘리는지 (Task E의 진단 문단이 잘리면 실패로 오판될 수 있음) | Endpoint | **REQUIRED** | 문서 확인 또는 긴 출력 유도 요청으로 절단 여부 확인 |
| 11 | authentication | 어떤 인증 방식(API key/토큰/mTLS 등)인지 | Endpoint | **REQUIRED** | 인증 없이는 다른 모든 확인이 불가능 — 최우선 확인 항목 |
| 12 | model discovery | `/v1/models` 등으로 정확한 모델 버전을 조회할 수 있는지 | Endpoint | **OPTIONAL** | 없어도 진행 가능(모델명을 문서/관리자에게 직접 확인) — 있으면 experiment journal에 정확한 버전 기록 가능해 재현성이 좋아짐 |
| 13 | timeout | 서버가 요청을 얼마나 기다려주는지, 긴 추론 시 강제 종료되는지 | Endpoint | **REQUIRED** | 문서 확인 + 관찰된 응답 지연 시간 기반으로 client-side timeout 하한 설정 |
| 14 | concurrency/rate limit | 동일 task를 반복 실행(재현성 확보를 위한 3~5회 반복)할 때 차단되는지 | Endpoint | **OPTIONAL** | 순차 smoke test 수준에서는 낮은 우선순위 — 반복 실행 중 429 등 발생 시에만 본격 조사, 상세 SLA 파악은 M3로 |
| 15 | package installation | 사내 sandbox에서 mini-SWE/Pi 자체 의존성을 설치할 수 있는지 | Environment | **REQUIRED** | 대상 sandbox에서 harness 설치 1회 시도 (toy task 실행 시점이 아니라 harness 준비 시점에 필요) |
| 16 | outbound network | (a) Qwen endpoint 도달 가능 여부, (b) harness 설치용 외부 패키지 레지스트리 도달 가능 여부 | Environment | **REQUIRED** | endpoint/레지스트리 각각에 대해 별도로 확인 — 망분리 환경이면 (b)가 막혀 있을 수 있음(별도 대응 필요, 이 문서 범위 밖) |
| 17 | filesystem | 작업 디렉토리에서 읽기/쓰기가 가능한지 | Environment | **REQUIRED** | 모든 toy task가 파일 read/write에 의존 |
| 18 | subprocess | 하위 프로세스 실행이 가능한지 (pytest, 스크립트 실행) | Environment | **REQUIRED** | Task B/C/E가 subprocess 실행에 의존 |
| 19 | shell | bash/sh 등 셸이 사용 가능한지 (mini-SWE는 셸 기반 실행에 의존) | Environment | **REQUIRED** | mini-SWE harness의 핵심 실행 경로 |
| 20 | git | git이 설치되어 있고 초기화 가능한지 | Environment | **REQUIRED** | Toy benchmark의 여러 success condition이 git diff로 "의도치 않은 파일 변경 없음"을 판정함 — harness 사용 여부와 별개로 채점 인프라로 필요 |
| 21 | Python | Python 인터프리터 버전 확인 | Environment | **REQUIRED** | Toy task 전체가 Python 기반(pytest, calc.py, parser.py) |
| 22 | Node.js | Node 런타임 필요 여부 | Environment | **OPTIONAL** (조건부) | Pi SDK가 Node/TS 기반 의존성을 갖는지 불확실 — M1에서 Codex가 source-level로 확인한 뒤 필요 시 REQUIRED로 재분류 |
| 23 | VS Code | IDE 자체 | Environment | **DEFER TO M3** | M2는 agent core 능력 검증이 목적이며 IDE 통합은 M3 범위 (Architecture Review에서 지적된 M2/M3 변수 분리 원칙과 일치 — M2는 VS Code 없이도 shell+python+git+network만 있는 최소 sandbox에서 수행 가능해야 함) |
| 24 | Jupyter | 노트북 실행 환경 | Environment | **DEFER TO M3** | 계획서 M3 범위와 동일 |
| 25 | kernel access | 노트북 커널 제어 | Environment | **DEFER TO M3** | 계획서 M3 범위와 동일 |

---

## 2. M2 착수를 위한 최소 PASS gate

아래 10개는 **모두 통과해야 M2를 시작한다.** 하나라도 실패하면 M2는 시작하지 않고, 실패한 항목의 귀속 범주(Model/Endpoint/Environment)에 따라 대응 주체를 정한다.

이 gate는 harness(mini-SWE/Pi) 없이, **raw API 호출 + sandbox 기본 명령 몇 개**만으로 확인 가능해야 한다 — harness를 붙이기 전에 harness 밖에서 최소 조건을 먼저 검증하는 것이 목적이다 (Architecture Review에서 지적한 "harness 없이 Qwen 자체를 먼저 검증하는 gate가 없다"는 문제를 이 gate로 메운다).

| Gate # | 통과 조건 | 대응 checklist 항목 |
|---|---|---|
| G1 | 인증된 상태로 endpoint에 1회 요청을 보내 200(또는 동등 성공) 응답을 받는다 | 1, 11 |
| G2 | system + user 메시지 1쌍을 보내 텍스트 응답을 정상적으로 받는다 (OpenAI 호환 스키마 여부와 무관하게 최소 대화가 성립) | 2, 3, 8 |
| G3 | tool schema 1개를 포함한 요청에 대해 **스키마상 유효한** tool_call 형태의 응답을 최소 1회 받는다 (내용의 정확성은 불문, 형식만 확인) | 4 |
| G4 | 동일한 간단한 JSON 스키마 요청을 5회 반복했을 때 최소 과반(3/5 이상) valid JSON을 받는다 | 7 |
| G5 | 응답이 사전 확인한 max output tokens 이내에서 잘리지 않고 완결된 문장으로 끝난다 (짧은 진단문 생성 시험) | 10 |
| G6 | 알려진 최소 context 길이(예: toy benchmark 5개 task를 한 세션에 다 넣어도 남는 여유)까지는 에러/절단이 없다 | 9 |
| G7 | 관찰된 응답 지연 범위 안에서 client-side timeout을 설정했을 때 정상 응답이 timeout 전에 도착한다 | 13 |
| G8 | 대상 sandbox에서 `git`, `python`, shell 명령, subprocess 실행, 파일 read/write가 모두 individually 성공한다 | 17, 18, 19, 20, 21 |
| G9 | 대상 sandbox에서 Qwen endpoint로의 outbound 연결과 (필요 시) 외부 패키지 레지스트리 연결이 확인된다 | 16 |
| G10 | 대상 sandbox에서 mini-SWE-agent, Pi 두 harness 모두 설치가 1회 성공적으로 완료된다 | 15 (+ 22, 필요시) |

**G1~G7 실패 → Endpoint/서빙 계층 담당자에게 에스컬레이션 (모델 문제로 오판하지 않는다).**
**G8~G10 실패 → 사내 인프라/sandbox 담당자에게 에스컬레이션 (Qwen과 무관한 문제임을 먼저 확정한다).**
**G1~G10 전부 통과 후에도 M2 본 실험(toy benchmark A~E)에서 실패가 나오면, 그때 비로소 "모델 능력" 문제로 귀속을 좁힐 수 있다.**

---

## 3. 이 checklist가 다루지 않는 것

- 각 REQUIRED 항목의 구체적 통과 기준값(정확한 context window 크기, timeout 초 등)은 실제 endpoint 문서/관리자 확인 후 채워 넣는다 — 지금은 "확인해야 할 목록"이지 "기준값 목록"이 아니다.
- Gate를 통과시키기 위한 client 구현 방식(어떤 라이브러리, 어떤 코드 구조)은 다루지 않는다 (요청 범위 밖).
- 망분리/보안 정책으로 인한 outbound 제약(G9 실패 시 대안)은 이 문서에서 해결책을 제시하지 않는다 — CODING_AGENT_PLAN_v0.md 18장의 open question으로 남아 있는 사항과 연결된다.
