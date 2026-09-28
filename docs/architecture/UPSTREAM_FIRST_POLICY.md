# Upstream-First / Minimal-Customization Policy

> 이 문서는 장기 유지보수 원칙만 담는다. 실행 순서는 [CODING_AGENT_PLAN_v0.4.md](../plan/CODING_AGENT_PLAN_v0.4.md), 결정 history는 [decision_log.md](../plan/decision_log.md)를 본다. 같은 내용을 여러 문서에 반복하지 않기 위해, 다른 문서는 이 문서를 링크로 참조한다.
> 채택: 2026-09-07 (사내 논의 결과, [DEC-008](../plan/decision_log.md)). 2026-09-09 Pi Dev 제품 정의(Enterprise Coding Harness / Distribution Layer)로 확장 — [DEC-009~013](../plan/decision_log.md).

## 원칙

```
UPSTREAM-FIRST
MINIMAL-CUSTOMIZATION
CONFIG-BEFORE-CODE
SKILL-BEFORE-EXTENSION (when appropriate)
EXTENSION-BEFORE-WRAPPER
WRAPPER-BEFORE-FORK
NO-FORK-BY-DEFAULT
WINDOWS-FIRST
```

1. Pi에 기능이 있으면 Pi native 기능을 사용한다.
2. config로 해결 가능하면 코드를 작성하지 않는다.
3. 반복되는 지침/워크플로우/노하우 문제는 Skill(재사용 가능한 prompt/instruction)로 먼저 해결을 시도한다 — 단, 실제로 강제해야 하는 동작이나 새 capability가 필요하면 Skill로 억지로 풀지 않고 바로 Extension으로 간다("when appropriate"의 의미: 이건 항상 먼저 시도하는 단계가 아니라, 문제의 성격이 "지식/절차 안내"인지 "강제/능력"인지로 나뉘는 분기다).
4. Pi 공식 extension/hook으로 해결 가능하면 그것을 사용한다.
5. 얇은 wrapper/launcher로 해결 가능하면 core를 수정하지 않는다.
6. Pi source fork/modification은 최후의 수단이다.
7. 새로운 UI/agent loop/session/tool framework를 자체 구현하지 않는다. 명확한 사내 요구가 확인되기 전까지는 Pi upstream UX/TUI를 우선 사용한다.
8. upstream update를 따라가기 쉬운 구조를 최우선 유지보수 목표 중 하나로 둔다.
9. 사내 개발환경은 Windows를 1st-class 대상으로 삼는다 — 다른 OS 지원은 secondary(DEC-003과 일관).

## Decision hierarchy

새 기능/요구사항이 생기면 반드시 이 순서로 판단한다. 앞 단계로 해결되면 뒷 단계는 검토하지 않는다.

```
Requirement
   ↓
1. Pi native feature/config로 가능한가?
   ↓ NO
2. Skill(지침/워크플로우 안내)로 충분한가? — 강제/enforcement가 필요하면 이 단계를 건너뛴다
   ↓ NO
3. Pi official extension/hook으로 가능한가?
   ↓ NO
4. Thin external wrapper/launcher로 가능한가?
   ↓ NO
5. 정말 Pi source modification이 필요한가?
```

5번까지 간 경우 자동으로 진행하지 않는다. 아래 다섯 가지를 반드시 기록한 뒤 결정한다 — Pi source modification은 architecture exception이지 기본 선택지가 아니다.

- 이유
- upstream 대안 (없었던 이유 포함)
- maintenance cost
- upgrade impact (다음 Pi 버전 업데이트 시 충돌 가능성)
- security impact

## Ownership boundary

### Pi upstream ownership — 가능한 한 그대로 사용

Agent Loop, Tool Calling, read/edit/write, search, PowerShell/bash 실행 메커니즘, Session/State, Context/Compaction, TUI, Events, Model/provider abstraction, `models.json`, Commands, Branching/resume 등 Pi native 기능.

> 정확한 기능명은 그때그때의 source inspection 결과를 기준으로 하고, 확인되지 않은 기능은 과장하지 않는다 (이 목록은 지금까지 source-level로 확인된 것들 위주다 — [CODING_AGENT_PLAN_v0.4.md](../plan/CODING_AGENT_PLAN_v0.4.md) 참고).

### Internal ownership — 사내에서 직접 관리

Internal vLLM endpoint/model configuration, internal model ID, credential 연동, security/policy 요구사항, permission policy, network 제한, audit/logging 요구사항, Windows packaging/배포, 사내 환경 호환성, 사내 공통 instruction/AGENTS policy(필요 시), Pi 버전 qualification, **Skills**, **Extensions**, **Authentication**, **Launcher**, **Approved-version 관리**, **Update/Rollback**, **Portal**.

이 영역 안에서도 **먼저 Pi native mechanism을 쓴다** — "사내가 소유하는 영역"이 "새로 구현하는 영역"과 같은 뜻이 아니다.

| 필요 | 우선 사용할 Pi native 방법 |
|---|---|
| Model integration | `models.json` (custom provider) |
| Credential handling | env var 참조(`${VAR}`)/config, native hook 우선 |
| Process credential scrub | Pi 공식 spawn hook 우선 |
| 반복 지침/워크플로우/노하우 | Skill (공식 skill 메커니즘) |
| 강제해야 하는 동작/새 capability | 공식 Extension |
| Custom behavior 기타 | 공식 extension/hook 우선 |

## Skills vs Extensions

역할이 다르다 — 서로 대체재가 아니다.

- **Skill = 재사용 가능한 지식/워크플로우 layer.** 반복되는 좋은 프롬프트, 업무 절차, 사내/팀/프로젝트 노하우를 instruction으로 제공한다. 모델의 reasoning과 구현 선택을 지나치게 제한하지 않는다 — 기본값/원칙을 주되 자유도를 허용한다. 기본 UX는 사용자의 자연어 요청에 대해 모델이 관련 Skill을 스스로 발견/선택하는 것이고, 명시적 호출(`/skill:*`)도 지원해야 한다.
- **Extension = capability/enforcement layer.** Pi native tool만으로 할 수 없는 실제 능력이 필요하거나, 시스템적으로 강제해야 하는 동작(예: security policy, approval, audit)이 필요할 때만 쓴다. PowerShell/native tool로 이미 가능한 걸 custom extension으로 다시 구현하지 않는다.

## Resource Hierarchy

장기적으로 다음 4단계 계층을 고려한다: **Company Global → Team → Project → Personal.** 각 단계에 Skill/Extension이 등록될 수 있다(예: Company의 Skills/Extensions, Team의 Skills/Extensions, Project의 Skills, Personal의 Skills).

원칙:
- **Company 수준 security/policy는 하위(Team/Project/Personal) resource가 override할 수 없다.**
- **Global Extension은 Skill보다 훨씬 엄격하게 검증한다** — 실제 코드가 모든 PC에서 실행되므로 qualification/signing/versioning 기준이 더 높아야 한다. Skill은 텍스트 instruction이라 상대적으로 리스크가 낮다.

## Update Principle

Pi upstream의 최신 릴리스를 사용자에게 그대로 바로 배포하지 않는다.

```
Pi upstream release
       ↓
pi-dev qualification
       ↓
Internal APPROVED
       ↓
central manifest
       ↓
user update
```

**`LATEST != APPROVED`가 항상 성립해야 한다.** Rollback을 지원할 수 있는 구조로 설계한다(구체적 구현은 아직 하지 않음 — [CODING_AGENT_PLAN_v0.4.md](../plan/CODING_AGENT_PLAN_v0.4.md) Phase 6).

## Self-Hosting 원칙

Pi Dev는 자기 자신을 개발하는 데도 쓸 수 있어야 한다(Skill/Extension/Launcher 개발, 테스트, packaging, 문서, upstream compatibility audit 등). 단, **실행 중인 runtime을 직접 mutation하는 구조는 피한다** — `running runtime ≠ development target` 경계를 유지한다. 권장 lifecycle은 [CODING_AGENT_PLAN_v0.4.md](../plan/CODING_AGENT_PLAN_v0.4.md) 10장 참고.

## Reference framework 역할

NOOA, OpenHands, Aider 등 다른 agent framework는 **architecture/feature reference**로만 유지한다. 우선 질문은 "이 framework가 Pi를 대체하는가"가 아니라 **"Pi에 없는 중요한 아이디어가 있는가"** 다.

가치 있는 아이디어를 발견했을 때의 흐름:

```
Idea 발견
→ Pi native에 이미 있는지 확인
→ Pi extension/config로 구현 가능한지 확인
→ 사내 요구에 실제 필요한지 확인
→ 필요한 경우에만 최소 구현
```

- **NOOA**: Code-as-Action, typed state/capabilities/contracts, execution/security model — reference study 대상.
- **OpenHands**: workspace/runtime boundary, sandbox/security, SDK/client boundary, context/state architecture — reference study 대상.

두 프로젝트를 Pi와 동일 규모로 구현/benchmark하는 것은 현재 기본 계획에서 제외한다.

## UI 방향

V1 공식 UX는 **Pi native TUI**다. VS Code extension, custom Web coding UI, custom TUI는 당분간 보류한다(우선순위를 낮춘 것이지 영구 배제가 아니다) — 실제 사용자 피드백에서 필요성이 확인되면 재평가한다. 실제 사내 사용자 평가에서 TUI가 blocker로 확인되면, 이 순서로 재검토한다:

```
Pi native UI capability
→ Pi web/UI 관련 capability
→ thin UI layer
→ VS Code integration
```

**Web을 고려하게 되면, Coding UI보다 Control Plane(Portal — 인증/버전 배포/Skill·Extension registry 등) 역할이 우선이다.** Web 기반 coding UI 자체는 이 순서에서 훨씬 뒤에 온다.

## BASE Reconsideration Triggers

Pi는 기본값(default upstream baseline)이며, 다른 framework를 Pi와 동일 수준의 BASE 후보로 계속 구현/benchmark하는 것은 기본 계획이 아니다. 아래 중 하나가 실제로 발생했을 때만 BASE를 재검토한다.

- Critical한 사내 security 요구사항을 Pi로 충족할 수 없음이 확인된 경우
- Windows 배포에 해결 불가능한 blocker가 있는 경우
- 사내 모델 호환성에 근본적인 blocker가 있는 경우
- 필요한 coding workflow를 native/config/extension 메커니즘으로 구현할 수 없는 경우
- upstream maintenance/license/policy 문제가 감내할 수 없는 수준이 된 경우

이 트리거가 확인되지 않는 한, "Pi를 계속 기본값으로 쓴다"가 기본 가정이다. 단, 이것이 "Pi를 영구적으로 절대 교체하지 않는다"는 선언은 아니다.
