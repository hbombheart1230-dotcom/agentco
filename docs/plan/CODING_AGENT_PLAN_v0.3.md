# CODING_AGENT_PLAN_v0.3 — Current Execution Plan

> **[2026-09-09] 이 문서는 historical 상태다.** Pi Dev의 제품 정의가 "Pi upstream + 최소 사내 통합"에서 **"Enterprise Coding Harness / Distribution Layer"(Skills, Extensions, Managed Distribution, Portal, Self-Hosting 포함)** 로 확장되며, 이 문서의 milestone 흐름(7장)은 [CODING_AGENT_PLAN_v0.4.md](CODING_AGENT_PLAN_v0.4.md)의 Roadmap(Phase 1~9)으로 대체되었다 ([decision_log.md DEC-009~013](decision_log.md)). 이 문서의 원칙(1~6장, 8장)은 여전히 유효하며 v0.4가 그 위에 얹힌다 — 본문은 수정하지 않는다.
>
> 상태: **현재 실행 계획 (current execution plan)** — [CODING_AGENT_PLAN_v0.2](CODING_AGENT_PLAN_v0.md)를 대체하는 것이 아니라 그 위에 새 방향을 얹는다.
> 작성일: 2026-09-07
> **v0.3 변경 요약**: 사내 논의 결과 프로젝트 기본 방향이 "여러 harness를 대칭 비교해 M5에서 BASE를 고른다"에서 **"Pi upstream을 기본 base로 채택하고, 사내에서 필요한 최소 영역만 직접 관리한다"**로 바뀌었다. 자세한 원칙은 [UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md), 결정 기록은 [decision_log.md DEC-008](decision_log.md)을 본다.
> **v0.2와의 관계**: v0.2에 기록된 M0/M1 실험 결과, working principles, toy benchmark 방법론, decision log는 **그대로 유효한 역사적 기록**이며 재작성하지 않는다. 바뀐 것은 M5(BASE Decision)의 "4개 후보 대칭 비교" 프레이밍과, 그 이후 milestone 흐름이다.

---

## 1. 새로운 기본 방향

사내 Coding Agent는 가능한 한 **Pi upstream 기능 자체를 그대로 사용**한다. 사내에서 직접 개발·유지보수하는 영역은 사내 정책, 보안, 환경, 모델 연결, 배포에 필요한 **최소 영역**으로 제한한다.

원칙(`UPSTREAM-FIRST` / `MINIMAL-CUSTOMIZATION` / `CONFIG-BEFORE-CODE` / `EXTENSION/HOOK-BEFORE-FORK` / `NO-FORK-BY-DEFAULT`), decision hierarchy, ownership boundary는 전부 [UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md)에 있다 — 이 문서에서 반복하지 않는다.

## 2. Pi의 역할 재정의

**과거(v0.2 시점, 역사적 사실 그대로 보존)**:
- M0: mini-SWE minimal loop 학습
- M1: Pi structured tools/session/runtime 검증
- 당시 계획: Pi/OpenHands/Own/Hybrid를 M5에서 대칭 비교해 BASE 결정

**현재 방향**:

```
Current Direction:

Pi = DEFAULT UPSTREAM BASELINE

우리 프로젝트 =
Pi upstream
+ Internal Model Configuration
+ Internal Security/Policy
+ Windows Packaging
+ Internal Environment Adaptation

필요한 경우에만 thin extension/wrapper
```

**중요한 제한**: 이것은 "Pi를 영구적으로 절대 교체하지 않는다"는 선언이 **아니다**. 다만 앞으로 다른 framework를 Pi와 동일한 수준의 BASE 후보로 계속 구현/benchmark하는 것은 기본 계획이 아니다. Pi에서 해결 불가능한 blocker가 발견될 경우에만 BASE를 재검토한다 (트리거 목록: [UPSTREAM_FIRST_POLICY.md#base-reconsideration-triggers](../architecture/UPSTREAM_FIRST_POLICY.md)).

## 3. Ownership boundary

[UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md)의 "Ownership boundary" 절 참고. 요약:

- **Pi upstream ownership**: Agent Loop, Tool Calling, read/edit/write, search, PowerShell/bash 실행, Session/State, Context/Compaction, TUI, Events, Model/provider abstraction, `models.json`, Commands, Branching/resume — source inspection으로 존재가 확인된 것만 이 목록에 있다.
- **Internal ownership**: internal vLLM 연결, credential 연동, security/policy, permission policy, network 제한, audit/logging, Windows packaging, 사내 환경 호환성, 사내 공통 instruction, Pi 버전 qualification — 이 영역 안에서도 Pi native mechanism(`models.json`, env var 참조, 공식 spawn hook, 공식 extension)을 먼저 쓴다.

## 4. Reference framework (NOOA / OpenHands)

기존 M4 계획에서 NOOA/OpenHands가 BASE 경쟁 후보처럼 읽히는 부분은 이 문서로 재정의한다: 앞으로 두 프로젝트의 기본 역할은 **architecture/feature reference**다. "Pi를 대체하는가"보다 "Pi에 없는 중요한 아이디어가 있는가"를 먼저 묻는다. 상세 흐름은 [UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md)의 "Reference framework 역할" 참고.

- NOOA: Code-as-Action, typed state/capabilities/contracts, execution/security model.
- OpenHands: workspace/runtime boundary, sandbox/security, SDK/client boundary, context/state architecture.

M4_PRESURVEY([M4_PRESURVEY_v0.md](../report/M4_PRESURVEY_v0.md))에서 이미 확인된 사실(reading map, 미확인 사항, Codex 검증 필요 사항)은 그대로 유효하다 — 다만 그 조사의 **목적**이 "BASE 후보 평가"에서 "reference study"로 바뀐다.

두 프로젝트를 Pi와 동일 규모로 구현/benchmark하는 것은 현재 기본 계획에서 제외한다.

## 5. UI 방향

VS Code integration은 우선순위를 낮춘다. Web GUI도 지금 구현하지 않는다 (근거 조사는 이미 함: [pi-web-ui 관련 조사 세션](../report/PROGRESS_SUMMARY_v0.md) — `packages/web-ui`는 현재 clone에 존재하지 않고, 존재하는 것은 터미널 전용 TUI와 headless RPC/transport 계층뿐임을 source-level로 확인). 현재 기본 UX는 **Pi native TUI**이며, 실제 사내 사용자 평가를 먼저 한다.

TUI가 실사용에서 blocker로 확인되는 경우에만, 이 순서로 재검토한다: Pi native UI capability → Pi web/UI 관련 capability → thin UI layer → VS Code integration. 지금 단계에서 자체 GUI/VS Code extension은 개발하지 않는다.

## 6. Internal package(`internal/pi-dev`, `internal/pi-dev-user`)의 위치

`internal/pi-dev/`, `internal/pi-dev-user/`는 **Pi를 재구현하는 제품이 아니다**. 정확한 정의:

```
Internal Package
    =
Pi upstream runtime
+ Pi native config (models.json)
+ bundled runtime (dist/bundle, portable Node)
+ thin launcher (.cmd)
+ internal policy/config (placeholder 3개 값)
```

USER package의 목표는 "Pi를 숨기거나 다시 만드는 것"이 아니라 **"Pi를 사내 Windows PC에서 dependency setup 없이 사용할 수 있게 packaging하는 것"**이다.

### USER credential-scrub gap

USER self-contained package에서 Pi 공식 `spawnHook` extension을 로드할 때 dependency 문제(jiti 확장 로더가 non-bundle SDK 진입점의 전체 의존성을 요구)가 발견되어, credential-scrub extension을 제외한 상태다. 이 문제 때문에 **즉시 custom credential subsystem을 만들지 않는다.** backlog/design question으로만 기록한다:

1. Pi native packaging/loading 방법 재확인
2. upstream-supported solution 존재 여부 확인
3. 실제 사내 security requirement 확인
4. 필요할 경우 최소 wrapper/extension 검토
5. Pi source modification은 최후 수단

현재 blocker로 과장하지 않는다 — DEV package에는 동일 메커니즘(공식 spawnHook)이 정상 동작하며, USER package는 self-contained 목적상의 known gap일 뿐이다.

## 7. Milestone 재정렬

기존 M0~M5 번호와 산출물은 유지한다(문서 일관성). 바뀐 것은 M5 "4개 후보 대칭 비교"라는 표현과 그 이후 흐름이다. 현재 기본값은 Pi이고, 재검토 조건은 별도로 둔다.

```
M0 COMPLETE
mini-SWE minimal loop learning

M1 COMPLETE
Pi external structured harness validation

Internal Packaging Prototype (COMPLETE)
DEV / USER self-contained preparation

Next:
Internal GLM Integration
- Endpoint
- API Key
- Model ID
- Pi native models.json
- smoke
- tool use
- Anchor B

Then:
Internal Pi Validation
- representative coding tasks
- Windows environment
- model behavior
- security/policy gaps
- packaging/user experience

Reference Study
- NOOA selected concepts
- OpenHands selected concepts
- only where useful

Productionization
- internal policy/security
- version qualification
- packaging
- deployment/update strategy
```

기존 M1.5(Internal Readiness Gate), M2(Internal Candidate Model Core Smoke), M3(Internal Environment Feasibility), M4(Architecture References)의 상세 설계는 [CODING_AGENT_PLAN_v0.2](CODING_AGENT_PLAN_v0.md) 8~11장에 그대로 있다 — "Internal GLM Integration"과 "Internal Pi Validation"은 그 내용을 대체하지 않고, Pi를 기본값으로 둔 상태에서 순서를 이어받는다. M2의 "harness(2)×모델(2) 대칭 비교"는 "Pi×모델(GLM 우선, Qwen은 이후)" 위주로 축소된다 — mini-SWE와의 대칭 비교를 계속 유지하는 것이 기본 계획은 아니다.

### BASE Reconsideration Triggers

[UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md)와 동일 (중복 방지를 위해 여기서는 목록만 링크):

- Critical한 사내 security 요구사항을 Pi로 충족할 수 없음이 확인된 경우
- Windows 배포에 해결 불가능한 blocker가 있는 경우
- 사내 모델 호환성에 근본적인 blocker가 있는 경우
- 필요한 coding workflow를 native/config/extension 메커니즘으로 구현할 수 없는 경우
- upstream maintenance/license/policy 문제가 감내할 수 없는 수준이 된 경우

## 8. 보존되는 것 (변경하지 않음)

- M0/M1 실험 결과, hypothesis, toy benchmark, decision log 이력 — [CODING_AGENT_PLAN_v0.2](CODING_AGENT_PLAN_v0.md), [decision_log.md](decision_log.md) 그대로.
- Adoption Gate(License/Security/Internal Policy, v0.2 13장) — Pi 채택 여부와 무관하게 여전히 유효한 별도 게이트.
- "아직 결정하지 말아야 할 사항"(v0.2 17장) — 이 문서가 그 항목들을 대신 확정하지 않는다.

---
*이 문서는 living document다. Internal GLM Integration/Internal Pi Validation이 끝날 때마다 갱신한다.*
