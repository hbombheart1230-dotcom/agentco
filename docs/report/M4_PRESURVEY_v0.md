# M4_PRESURVEY_v0 — OpenHands V1 / NOOA 사전 조사

> 상태: **사전 조사(pre-survey) — 채택 여부 판단 없음, 상세 architecture 설계 없음**
> 목적 문서: [CODING_AGENT_PLAN_v0.md](../plan/CODING_AGENT_PLAN_v0.md) 10장(M4: Architecture References)
> 이 문서의 결과물: M4에서 **무엇을 실제로 읽어야 하는지**를 줄이는 reading map. 여기 적힌 개념 설명은 M4 본조사를 대체하지 않는다 — 요약이지 검증이 아니다.

---

## 0. 사용한 출처 신뢰도 구분

- **공식(Primary)**: 프로젝트 소유 조직이 직접 게시한 저장소/블로그/논문
- **2차(Secondary)**: 제3자 블로그/뉴스 요약 — 방향성 참고용, M4에서 그대로 인용하지 않는다

| 프로젝트 | 공식 출처 |
|---|---|
| OpenHands V1 | [The Path to OpenHands v1](https://www.openhands.dev/blog/the-path-to-openhands-v1) (공식 블로그), [Introducing the OpenHands Software Agent SDK](https://openhands.dev/blog/introducing-the-openhands-software-agent-sdk) (공식 블로그), [github.com/OpenHands/software-agent-sdk](https://github.com/OpenHands/software-agent-sdk) (공식 repo), [github.com/OpenHands/OpenHands](https://github.com/OpenHands/OpenHands) (공식 repo), [docs.openhands.dev/sdk](https://docs.openhands.dev/sdk) (공식 문서), [arXiv:2511.03690](https://arxiv.org/abs/2511.03690) "The OpenHands Software Agent SDK" (연구팀 공저 논문) |
| NOOA | [github.com/NVIDIA-NeMo/labs-OO-Agents](https://github.com/NVIDIA-NeMo/labs-OO-Agents) (공식 repo), [arXiv:2607.20709](https://arxiv.org/abs/2607.20709) "NVIDIA-labs OO Agents: Native Python Object-Oriented Agents" (공식 저자 논문) |

2차 출처(Medium, Enterprise DNA 등 뉴스/블로그 요약)는 검색 과정에서 방향을 잡는 데만 썼고, 아래 표의 근거로는 쓰지 않았다. NOOA의 보안 모델 관련 2차 블로그 하나(blog.ogwilliam.com)는 확인했으나, 공식 repo README 수준의 정보 이상을 제공하지 못해 근거에서 제외했다.

---

## 1. OpenHands V1 — concept별 정리

| Concept | 확인된 내용 (공식 출처 기반) | 분류 | 분류 근거 |
|---|---|---|---|
| **Agent core** | V0의 비동기 EventStream(pub/sub) 방식이 "thread/async issues"와 메시지 순서 보장 부재 문제를 낳아, V1은 **동기(synchronous) 대화 모델**로 전환. 장시간 작업은 필요시 thread/asyncio로 감싸는 방식으로 옵션화. [출처](https://www.openhands.dev/blog/the-path-to-openhands-v1) | **M0/M1에서 이미 배울 수 있음** | mini-SWE(단순 동기 loop)와 Pi(구조화 harness)를 직접 돌려보면 "단순한 core냐, 복잡한 core냐"의 실질적 trade-off를 이미 체감하게 된다. OpenHands가 V0→V1에서 겪은 "복잡도를 줄인 이유"는 HYPOTHESIS-1을 뒷받침하는 사례로 가볍게만 참고하면 충분 — M4에서 깊게 읽을 우선순위 낮음 |
| **Tools** | Tool은 `name`, `description`, `callback`, `inputSchema`로 구성된 구조화 객체. JSON schema 기반 입력 검증. [출처](https://www.openhands.dev/blog/the-path-to-openhands-v1) | **M0/M1에서 이미 배울 수 있음** | 구조 자체가 표준적인 function-calling 스키마와 유사 — M1(Pi)에서 이미 구조화 tool-calling을 다루므로 개념적으로 새로울 게 적음 |
| **Workspace/Runtime** | 동일 agent 코드가 로컬(prototyping)과 원격 sandbox(컨테이너)에서 코드 변경 없이 실행되도록 하는 workspace 추상화. `LocalWorkspace ↔ DockerWorkspace`를 교체만 하면 됨. 블로그 시점엔 "5개 런타임 provider 로직이 뒤섞여 있다"고 리팩토링 필요성 언급. [출처](https://www.openhands.dev/blog/the-path-to-openhands-v1) | **M2/M3 이후에 볼 가치 있음** | 이 추상화가 정확히 우리의 HYPOTHESIS-3("VS Code는 실행 환경일 뿐, agent core는 UI 독립적")과 M3의 목표(VS Code/Jupyter 통합)에 직접 맞닿아 있음. M3에서 우리가 겪을 문제를 먼저 겪은 뒤 이 패턴을 비교 대상으로 읽는 게 훨씬 유효함 |
| **Sandbox/Security** | "optional isolation, not mandatory" — CLI는 기본적으로 워크스테이션에서 직접 실행되고, Docker sandbox는 선택 옵션으로 제공. SDK 차원에서는 "native sandboxed execution"과 "built-in security analysis(analyzer)"를 명시. [출처](https://www.openhands.dev/blog/the-path-to-openhands-v1), [arXiv:2511.03690](https://arxiv.org/abs/2511.03690) | **M2/M3 이후에 볼 가치 있음** | ENV_CAPABILITY_CHECKLIST_v0.md의 sandbox 관련 open question, CODING_AGENT_PLAN_v0.md 15장의 "Sandbox/실행 격리 방식" 미결 항목과 직접 연결. M2에서 우리 환경의 실제 제약을 확인한 뒤 비교해야 의미가 있음 |
| **Context management** | **공식 출처에서 구체적 메커니즘을 확인하지 못함.** arXiv 초록에 "memory management"가 확장 가능한 기능으로 언급되는 정도. | **미확인 — M4에서 원본(SDK 코드/공식 docs) 직접 열람 필요** | 요약 소스로는 실체를 파악할 수 없는 항목. 추측해서 분류하지 않는다 |
| **Event architecture** | 소스 간 미묘한 불일치 있음: 블로그는 "EventStream(pub/sub)을 버리고 동기 모델로 간다"고 하지만, arXiv 논문은 "event-sourcing overhead가 무시할 만하다"는 표현으로 event-sourcing 자체는 V1에도 남아있음을 시사. 즉 **"이벤트 로그 기반 상태 모델(event-sourcing)"과 "비동기 pub/sub 실행 방식"이 서로 다른 축**이며, V1은 후자만 버리고 전자는 유지했을 가능성이 있음. [출처1](https://www.openhands.dev/blog/the-path-to-openhands-v1), [출처2](https://arxiv.org/abs/2511.03690) | **M2/M3 이후에 볼 가치 있음** (단, M4 핵심 정독 대상) | 이 불일치 자체가 "블로그 요약만으로는 판단하면 안 되는 지점"임을 보여줌 — M4에서 반드시 SDK 소스코드(`software-agent-sdk` repo)로 직접 확인해야 하는 항목으로 표시 |
| **SDK/client 분리** | Agent SDK는 "tiny library"로 설계되고, CLI·서버·VSCode/VNC/browser 등 다양한 인터페이스가 이 SDK를 소비하는 client로 존재. [출처1](https://www.openhands.dev/blog/the-path-to-openhands-v1), [출처2](https://arxiv.org/abs/2511.03690), [출처3](https://openhands.dev/blog/introducing-the-openhands-software-agent-sdk) | **M2/M3 이후에 볼 가치 있음** | "특정 UI/모델에 종속되지 않아야 한다"는 우리 프로젝트의 핵심 요구사항과 가장 직접적으로 맞닿은 concept. M3에서 VS Code 통합을 직접 겪은 뒤, 이 SDK/client 경계 설계를 "우리가 따라할 만한가"로 비교 평가하는 게 순서상 맞음 |

---

## 2. NOOA — concept별 정리

| Concept | 확인된 내용 (공식 출처 기반) | 분류 | 분류 근거 |
|---|---|---|---|
| **Object-oriented agent abstraction** | "The agent is a Python object." 메서드가 능력(capability), 필드가 상태, docstring이 prompt 역할. mini-SWE(절차적 loop)나 Pi(SDK 구조화 tool)와는 근본적으로 다른 패러다임. [출처](https://github.com/NVIDIA-NeMo/labs-OO-Agents) | **M2/M3 이후에 볼 가치 있음** | M0/M1로는 접할 수 없는 완전히 다른 설계 철학 — 9장에서 명시한 "NOOA를 대안적 접근 대조군으로 본다"는 목적에 정확히 부합. M5(BASE Decision)의 "Own" 후보를 검토할 때 참고할 실질적 패턴이 됨 |
| **State** | 상태가 object의 typed field로 직접 존재(`order_db: OrderDB` 등). "opaque LLM context가 아니라 object field에 상태가 산다"는 설계 원칙. [출처](https://github.com/NVIDIA-NeMo/labs-OO-Agents) | **M2/M3 이후에 볼 가치 있음** | M2에서 Qwen의 context window 한계(ENV_CAPABILITY_CHECKLIST 항목 9)를 실측한 뒤, "상태를 프롬프트 context 밖에 둔다"는 이 접근이 실제로 유효한 대안인지 비교할 근거가 생김 |
| **Capabilities/Tools** | 본문이 `...`(Ellipsis)인 메서드는 런타임에 LLM이 채우는 "generation method", 일반 구현체를 가진 메서드는 결정론적 Python으로 그대로 실행. Tool schema를 별도로 정의하지 않고 메서드 시그니처/타입 자체가 계약이 됨. [출처](https://github.com/NVIDIA-NeMo/labs-OO-Agents) | **M2/M3 이후에 볼 가치 있음** | JSON tool-schema를 LLM이 준수해야 하는 Pi 방식과 정반대로, "LLM이 아예 tool-call JSON을 만들지 않아도 되는" 접근. TOY_BENCHMARK_v0.md Task D(structured tool-call 정밀도)에서 Qwen이 취약함이 확인될 경우, 이 대안이 즉시 비교 대상이 됨 — M2 결과가 이 항목의 우선순위를 크게 좌우함 |
| **Code-as-Action** | 모델이 `self`, import, helper에 접근 가능한 **Jupyter-style REPL**에서 실제 Python 코드를 작성해 행동함. 별도 tool-call 프로토콜이 아니라 코드 실행 자체가 action. [출처](https://github.com/NVIDIA-NeMo/labs-OO-Agents) | **M2/M3 이후에 볼 가치 있음** (M3와 사실상 직결) | "Jupyter-style REPL"이라는 표현 자체가 M3(Jupyter feasibility)의 조사 대상과 거의 겹친다. M3 착수 시점에 이 개념만 먼저 당겨서 읽어도 좋을 정도로 우선순위가 높음 — M4 전체를 기다릴 필요는 적음 |
| **Typed contracts** | 반환 타입 annotation이 곧 계약. "generation은 단일 결정론적 결과를 commit"하며, 실패 시 auto-retry를 지원한다는 설계 원칙. [출처](https://github.com/NVIDIA-NeMo/labs-OO-Agents) | **M2/M3 이후에 볼 가치 있음** | structured output 안정성(ENV_CAPABILITY_CHECKLIST 항목 7, HYPOTHESIS-2/6)과 직접 비교 가능한 대안 설계 — M2에서 Qwen의 JSON 준수율을 실측한 뒤 봐야 의미가 큼 |
| **Subagent/Composition** | 공식 repo README/문서에서 "object composition"과 "composing subagents" 튜토리얼 존재를 확인. 세부 메커니즘은 README 수준 설명 이상 확인 안 됨. [출처](https://github.com/NVIDIA-NeMo/labs-OO-Agents) | **우리에게 당장은 불필요함** | CODING_AGENT_PLAN_v0.md 15장에서 "Multi-agent 여부(단일 loop vs orchestrator+sub-agent)"를 명시적으로 결정 보류 항목으로 지정해뒀고, TOY_BENCHMARK_v0.md의 5개 task 전부 단일 agent로 완결됨. 지금 이 개념을 깊게 볼 이유가 없음 — 존재만 인지하고 넘어간다 |
| **Execution/Security model** | Repo는 "defense-in-depth" 원칙을 표방하며 AST validation, module deny-list 같은 in-process 가드레일을 언급. 동시에 **"containment boundary는 OS 수준 격리(container/VM/OpenShell)이며, in-process validator는 의도적 우회를 막지 못한다"**고 명시적으로 한계를 인정. [출처](https://github.com/NVIDIA-NeMo/labs-OO-Agents) | **M2/M3 이후에 볼 가치 있음** | "in-process 검증은 보안의 전부가 아니다"라는 이 명시적 태도 자체가, 우리 sandbox 설계 미결 항목(계획서 15장) 및 ENV_CAPABILITY_CHECKLIST의 환경 게이트(G8~G10)와 비교할 좋은 기준점이 됨. 특히 이 저장소가 실거래 시스템이라는 맥락에서, "in-process 가드레일의 한계를 스스로 인정하는" 이 설계 태도는 채택 여부와 무관하게 참고 가치가 있음 |

---

## 3. 요약 — 분류별 집계

| 분류 | OpenHands | NOOA |
|---|---|---|
| M0/M1에서 이미 배울 수 있음 | Agent core, Tools | 없음 |
| M2/M3 이후에 볼 가치 있음 | Workspace/Runtime, Sandbox/Security, Event architecture, SDK/client 분리 | 전부 (Subagent/Composition 제외) |
| 우리에게 당장은 불필요함 | 없음 | Subagent/Composition |
| 미확인(원본 직접 확인 필요) | Context management | 없음 |

관찰: OpenHands는 "이미 M0/M1에서 배울 수 있는 것"이 상대적으로 많다 — 애초에 mini-SWE/Pi와 같은 계열(structured tool-calling, event/conversation loop)의 구현체이기 때문. 반대로 NOOA는 거의 모든 concept이 M0/M1로는 접할 수 없는 새로운 패러다임이라, 9장이 의도한 "대조군" 역할을 실제로 하고 있음이 확인된다.

## 4. M4 Reading Map (실제로 읽을 것)

우선순위 순. 전체를 다 읽지 않아도 되는 항목은 명시적으로 제외한다.

1. **[NOOA] github.com/NVIDIA-NeMo/labs-OO-Agents README + 튜토리얼 노트북** — Code-as-Action, typed contracts, capabilities 정의 방식. M3 착수 시점에 조기 열람 권장 (M4를 기다릴 필요 없음).
2. **[OpenHands] software-agent-sdk repo의 event-sourcing / conversation 상태 관리 소스 코드** (`docs.openhands.dev/sdk` 및 실제 코드) — 블로그와 논문 간 event architecture 서술 불일치를 해소하기 위한 필수 확인. 요약 소스로 판단 금지.
3. **[OpenHands] Workspace 추상화 관련 코드/문서** (LocalWorkspace/DockerWorkspace) — M3 완료 후, 우리 VS Code 통합 결과와 나란히 비교.
4. **[NOOA] arXiv:2607.20709 중 execution/security 섹션** — 우리 sandbox 미결정 사항과 대조.
5. **[OpenHands] context management 관련 공식 문서** — 현재 미확인 상태이므로 M4에서 반드시 채워야 할 gap.

**읽지 않아도 되는 것**: OpenHands의 Agent core/Tools 기본 구조(이미 M0/M1로 충분), NOOA의 Subagent/Composition 상세(현재 스코프 밖).

---
*이 문서는 M4 착수를 위한 사전 정찰이며, 여기 담긴 요약을 M4의 결론으로 재사용하지 않는다. M4에서는 위 reading map을 따라 원본을 직접 읽고 CODING_AGENT_PLAN_v0.md 14장(hypotheses)을 갱신한다.*
