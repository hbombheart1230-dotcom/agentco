# CODING_AGENT_PLAN_v0.4 — Pi Dev: Enterprise Coding Harness / Distribution Layer

> 상태: **현재 실행 계획 (current execution plan)** — [CODING_AGENT_PLAN_v0.3](CODING_AGENT_PLAN_v0.3.md)를 대체하는 것이 아니라 그 위에 제품 정의를 확장한다.
> 작성일: 2026-09-09
> **v0.4 변경 요약**: v0.3까지는 "Pi upstream을 기본 base로 채택하고, 사내 통합에 필요한 최소 영역만 관리한다"는 원칙 수준의 방향이었다. v0.4는 이를 구체적인 **제품 정의**(Enterprise Coding Harness / Distribution Layer)와 **로드맵**(Phase 1~9)으로 확장한다: Skills, Extensions, Managed Distribution(Launcher/Portal), Update/Rollback, Self-Hosting. 장기 원칙은 [UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md)에 통합했고(중복 방지), 결정 기록은 [decision_log.md DEC-009~013](decision_log.md)에 있다.
> **v0.2/v0.3과의 관계**: v0.2(M0/M1 실험, hypothesis, decision log)와 v0.3(Upstream-First 전환, milestone 재정렬)의 내용은 **그대로 유효한 역사적 기록**이며 재작성하지 않는다. v0.4는 v0.3의 milestone 흐름(7장)을 이 문서의 11장 Roadmap으로 대체한다.
> **이번 작업 범위**: 문서/계획 정리만 한다. Portal/Launcher/새 Extension 구현은 하지 않는다 — 13장 Current Blocker 참고.

---

## 1. Product Definition

**Pi Dev는 Coding Agent core 자체를 새로 구현하는 프로젝트가 아니다.** Pi upstream을 coding harness core로 그대로 쓰고, 사내 Windows 개발환경에서 안전하고 편리하게 쓸 수 있도록 **Internal Model, Skills, Extensions, Security, Distribution, Update, Authentication**을 제공하는 **Enterprise Coding Harness / Distribution Layer**다.

핵심 원칙(`UPSTREAM-FIRST` / `MINIMAL-CUSTOMIZATION` / `CONFIG-BEFORE-CODE` / `SKILL-BEFORE-EXTENSION(when appropriate)` / `EXTENSION-BEFORE-WRAPPER` / `WRAPPER-BEFORE-FORK` / `NO-FORK-BY-DEFAULT` / `WINDOWS-FIRST`)와 decision hierarchy는 [UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md)에 있다 — 이 문서에서 반복하지 않는다.

## 2. Ownership Boundary

[UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md)의 "Ownership boundary" 절 참고. 이번 확장으로 Internal ownership에 **Skills, Extensions, Authentication, Launcher, Approved-version 관리, Update/Rollback, Portal**이 추가되었다. Pi source modification은 여전히 architecture exception(최후 수단)이다.

## 3. UI Direction

V1 공식 UX는 **Pi Native TUI**다. VS Code Extension, Custom Web Coding UI, Custom TUI는 당분간 보류한다 — 실제 사용자 피드백에서 필요성이 확인되면 재평가한다. Web을 고려하게 되면 Coding UI보다 **Control Plane**(Portal) 역할이 먼저다. 상세는 [UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md) UI 방향 절.

## 4. Skills

**역할**: 반복되는 좋은 프롬프트, 업무 절차, 사내/팀/프로젝트 노하우를 재사용 가능한 instruction으로 제공한다. 기본 UX는 사용자가 자연어로만 요청하고 모델이 관련 Skill을 스스로 발견/선택하는 것이며, 명시적 `/skill:*` 호출도 지원한다. Skill은 모델의 해결 방법을 지나치게 제한하지 않는다 — 좋은 원칙/절차를 기본값으로 주되 자유로운 reasoning과 구현 선택은 허용한다.

**초기 PoC 후보** (Phase 2):
```
test-and-fix
root-cause-debug
code-review
```

**향후 후보** (필요 확인 후):
```
repo-understanding
implement-feature
safe-refactor
handoff-summary
internal-development
internal-ai-debug
project-specific skills
```

## 5. Extensions

**역할**: Pi native tool만으로 할 수 없는 실제 capability가 필요하거나, 시스템적으로 강제해야 하는 동작이 필요한 경우에만 쓴다. PowerShell/native tool로 이미 되는 걸 custom extension으로 다시 구현하지 않는다.

**초기 PoC** (Phase 3):
```
simple command registration
simple local tool registration
```

**V1 실제 후보** (Phase 4):
```
security-policy
approval
audit
```

**향후 필요 기반 후보**:
```
internal-auth
internal-doc-search
issue tracker
CI/build
Git service
PowerPoint
Excel
deployment
```

## 6. Resource Hierarchy

Company Global → Team → Project → Personal 4단계 계층(각 단계에 Skill/Extension 등록 가능)과 override 금지 원칙, Global Extension의 강화된 qualification 요구사항은 [UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md) "Resource Hierarchy" 절 참고.

## 7. Distribution Architecture

`internal/pi-dev-user`(portable ZIP)는 **prototype artifact로 유지**한다(historical/functional evidence — 12장). 장기 제품 방향:

```
Pi Dev Portal
      ↓
Pi Dev Launcher
      ↓
Managed Runtime
      ↓
Pi Upstream
      ↓
Internal AI Gateway / vLLM
```

Launcher가 관리할 후보: 승인된 Pi 버전, 승인된 Node 런타임, `fd`/`rg`, Skills, Extensions, Config, Security policy, Authentication, Update, Rollback, Launch.

시스템 전역 Node/npm에 무조건 의존하지 않는다 — 장기적으로 PiDev-managed shared runtime을 우선 검토한다:

```
%LOCALAPPDATA%\PiDev\
  launcher\
  runtime\
  pi\
  bin\
  skills\
  extensions\
  config\
```

## 8. Update Principle

`LATEST != APPROVED` 불변식과 qualification 파이프라인(Pi upstream release → pi-dev qualification → Internal APPROVED → central manifest → user update), rollback 지원 원칙은 [UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md) "Update Principle" 절 참고. 구현은 Phase 6.

## 9. Portal Direction

Portal은 초기에는 **Coding Agent UI가 아니다.** 역할: SSO, Authentication, Permission, Approved versions, Runtime distribution, Skill registry, Extension registry, Policy, Update, Launch.

향후 이상적 사용자 흐름:
```
Portal
  ↓
[Pi Dev 실행]
  ↓
authentication
  ↓
update/verify
  ↓
Pi Native TUI
```

## 10. Self-Hosting

Pi Dev는 자기 자신을 개발하는 데도 쓸 수 있어야 한다 — Skill 개발, Extension 개발, Launcher 개발, Tests 작성/수정, Packaging 수정, Documentation 수정, Pi upstream compatibility audit, Upgrade qualification 등. 경계 원칙(`running runtime ≠ development target`)은 [UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md) "Self-Hosting 원칙" 참고.

권장 lifecycle:
```
Current Approved Pi Dev
        ↓
pi-dev source workspace 개발
        ↓
build/test/qualification
        ↓
candidate runtime 생성
        ↓
새 process에서 candidate 실행
        ↓
PASS
        ↓
approved version 승격
```

## 11. Roadmap

```
PHASE 1 — Internal Model Qualification
- current response duplication root cause
- OpenRouter A/B
- working environment parity
- Internal GLM smoke
- tool calling
- samples 01~08

PHASE 2 — Skills PoC
- test-and-fix
- root-cause-debug
- code-review
- automatic discovery/selection 확인
- explicit skill invocation 확인
- behavior comparison

PHASE 3 — Extension PoC
- simple command
- simple tool
- Windows/package load
- GLM tool selection
- TUI rendering

PHASE 4 — Security / Approval
- native capability audit first
- missing requirements only extension

PHASE 5 — Launcher / Managed Runtime

PHASE 6 — Central Manifest / Approved Update / Rollback

PHASE 7 — Portal / SSO / Authentication

PHASE 8 — Small Internal Pilot

PHASE 9 — Usage-driven expansion
- internal docs
- issue tracker
- CI
- Git
- PPT
- Excel
- deployment
- additional Skills
```

Phase 1의 세부 항목(M1.5/M2/M3/M4에 해당하는 상세 설계)은 [CODING_AGENT_PLAN_v0.2](CODING_AGENT_PLAN_v0.md) 8~11장과 [CODING_AGENT_PLAN_v0.3](CODING_AGENT_PLAN_v0.3.md) 7장에 이미 있다 — 이 로드맵은 그 내용을 대체하지 않고 Phase 2 이후로 이어받는다.

### Phase 2 — Skills PoC 상태 (2026-09-09)

**Status: PoC 완료(PARTIAL) — Phase 1(Internal GLM duplication)이 여전히 우선.**

- **Skill list**: `test-and-fix`, `root-cause-debug`, `code-review` 3개 — `internal/pi-dev/config/skills/`(validation authority)에서 개발/검증 후 `internal/pi-dev-user/config/skills/`(qualified copy)로 반영.
- **Test method**: `internal/pi-dev-user/ab-test.cmd` + OpenRouter/GLM(사내 endpoint는 duplication blocker로 이번엔 미사용), `--mode json`으로 raw trajectory 확인. A(baseline, `--no-skills`)/B(auto)/C(explicit `/skill:name`) 조건 중 test-and-fix는 3개 전부, root-cause-debug/code-review는 auto만 실행(budget 제한, 전체 3×3 아님).
- **Observed native behavior**: Pi native `loadSkills()`가 `<agentDir>/skills/`(우리 경우 `config/skills/`)에서 SKILL.md를 diagnostics 0건으로 정상 discover. Auto-selection은 system prompt의 `<available_skills>` 블록으로만 이뤄지며, **모델이 skill을 쓰기로 하면 `read` tool로 SKILL.md를 직접 읽는 것**이 유일한 native evidence다(별도 "skill selected" 이벤트 없음). 반면 명시적 `/skill:name`은 클라이언트 측에서 즉시 확장되어 전용 TUI 컴포넌트(`[skill] name`, 접기/펼치기)로 표시된다 — 이건 이미 있는 native UX라 별도 UI를 만들 필요가 없었다.
- **Auto-selection 결과**: code-review는 자동 선택 성공(가장 먼저 SKILL.md를 읽고 진행), test-and-fix와 root-cause-debug는 이번 실행에서 자동 선택되지 않음 — 다만 두 경우 모두 모델이 skill 없이도 이미 skill의 workflow(재현→원인→최소수정→검증, 또는 진단만/edit 0건)를 자연스럽게 따라 task correctness에는 차이가 없었다. Explicit invocation(test-and-fix)에서는 "재현 먼저 실행 후 수정"이라는 skill 고유 단계가 관찰되어 baseline/auto보다 output quality가 더 풍부했다.
- **Known limitations**: 표본이 각 skill당 1~3회로 매우 작다(통계적 결론 아님). 3×3 전체 매트릭스는 이번에 다 돌리지 않음. Internal vLLM으로는 아직 검증 못함(duplication blocker).
- **Next decision**: 새 architecture decision 불필요(원래 설계대로 native skill discovery/`/skill:` 메커니즘이 충분함이 확인됨). Phase 1(duplication) 해결 후 Internal GLM에서 동일 test 재현, 필요하면 auto-selection 개선을 위해 description 문구만 조정(코드 변경 아님) 검토.

### Phase 3 — Extension PoC 상태 (2026-09-09)

**Status: PoC 완료(PASS)** — Pi native Extension mechanism(discovery/load/custom command/custom tool)을 Pi Dev의 공식 확장 지점으로 채택 가능함을 확인.

- **Extension**: `pi-dev-info` 1개 — command `/internal-info`(정적 상태 텍스트) + tool `get_pi_dev_environment`(`{platform, extension, status}` JSON 반환). Network/credential/filesystem write/process spawn/environment dump 없음. `internal/pi-dev/config/extensions/`(validation authority)에서 개발 후 `internal/pi-dev-user/config/extensions/`(qualified copy)로 반영 — 위치는 native `<agentDir>/extensions/*.ts` discovery(Skill과 동일 `config/` 하위, source 확인: `loader.ts`의 `globalExtDir = agentDir/extensions`)와 정확히 일치, 새 convention 없음.
- **Test method**: 공식 example(`examples/extensions/hello.ts`, `commands.ts`) 패턴을 그대로 따름. `discoverAndLoadExtensions()`(공개 SDK 함수)로 live model 없이 discovery/load 확인 → 실제 CLI(`--extension` + `--mode json -p`)로 OpenRouter/GLM 대상 실제 tool 호출까지 확인.
- **Results**: DEV/USER 모두 discovery·load·command 등록·tool 등록·tool 실행·결과 반환 전부 PASS(아래 Evaluation Matrix). Auto-selection도 성공(자연어 프롬프트만으로 `get_pi_dev_environment` 자동 호출) — 단, 처음엔 `--tools` 목록에 tool 이름을 안 넣어서 실패로 보였음(내 테스트 설정 실수였지 mechanism 문제 아님): **custom tool도 built-in tool과 동일하게 `--tools` allowlist에 이름을 넣어야 활성화된다**는 점을 이번에 확인 — 실제 배포 시 launcher의 `--tools` 목록에 extension tool 이름을 추가해야 함.
- **Packaging finding (중요, 재현됨)**: TypeScript extension은 self-contained USER 번들에서 loader(jiti)를 요구하며, USER 패키지엔 `node_modules`가 없어 우리 extension이 아무것도 import 안 해도(zero-dependency로 작성해도) `Cannot find module 'jiti'`로 로드 자체가 실패한다 — 이전 credential-scrub extension에서 이미 겪은 것과 **동일한 root cause, 재현 확인**. 해결은 이전과 동일한 native remediation: zero-dependency인 `jiti` 패키지(1.7MB)를 `runtime/pi/node_modules/jiti`에 vendoring — Pi source 수정도 custom loader도 아니고, fd/rg 바이너리를 vendoring한 것과 같은 성격의 packaging 작업. Vendoring 후 DEV/USER 모두 PASS.
- **TUI 표시(Test B/E) 제한**: `/internal-info` 커맨드는 `ctx.ui.notify()`로 출력하는데, 이건 인터랙티브 TUI 전용이라 headless(`-p`/`--mode json`) 테스트로는 렌더링 결과를 확인할 수 없었다 — 커맨드 자체는 등록/파싱까지 확인했지만(`discoverAndLoadExtensions` 결과에 `commands: internal-info` 확인), 실제 화면 표시는 사람이 인터랙티브 TUI에서 직접 확인 필요(다음 액션 참고). Tool 쪽은 JSON 이벤트로 tool_execution_start/end가 정상 기록되는 것을 확인함.
- **Next decision**: 새 architecture decision 불필요 — Extension이 이미 "Extension-before-wrapper" 원칙대로 동작함을 확인했을 뿐, 새 메커니즘을 추가한 게 아니다. 실제 배포 launcher에 custom tool 이름을 `--tools`에 추가하는 것과, `runtime/pi/node_modules/jiti` vendoring을 표준 packaging 절차로 기록해두는 것만 필요.

### Phase 4 — Security / Approval Native Capability Audit 상태 (2026-09-09)

**Status: Audit 완료 — Verdict: MULTI_LAYER_REQUIRED.** Security Extension은 이번 phase에서 구현하지 않음(지시대로 audit-only).

- **문서**: 전체 audit은 별도 문서 [SECURITY_NATIVE_AUDIT_v0.1](../security/SECURITY_NATIVE_AUDIT_v0.1.md)에 기록(17개 audit question, threat scope A~E, tool lifecycle map, security capability matrix 전부 source-grounded — `agent-loop.ts`/`agent-session.ts`/`extensions/runner.ts`/`extensions/loader.ts`/`tools/bash.ts`/`tools/powershell.ts`/`utils/paths.ts`/`trust-manager.ts`/`project-trust.ts` 등 정확한 file:line 근거 포함).
- **핵심 결론 (요약)**: `tool_call`/`tool_result` extension event가 built-in/extension/custom tool 구분 없이 모든 tool 호출을 관찰·차단·수정할 수 있다(Pi Dev의 security extension이 서게 될 정확한 지점). `BashSpawnHook`/`PowerShellSpawnHook`으로 spawn 직전 command/cwd/env 재작성도 가능(이미 `scrub-powershell-credentials.js`가 사용 중인 패턴). 반면 **workspace 밖 파일 접근을 막는 native 장치는 전혀 없고**(`read`/`edit`/`write`/`find`/`grep`/`ls` 전부 `resolvePath()`가 boundary 체크 없이 절대경로/`..` traversal을 그대로 허용), **Extension 자체를 sandbox/서명 검증하는 native 장치도 전혀 없다**(jiti loader는 순수 Node 모듈 실행 — fs/child_process/net/env 전체 접근 가능). `--no-extensions`/`--extension`/`--tools`는 전부 사용자가 대칭적으로 override 가능한 flag라 "mandatory, 비활성화 불가" 정책은 Pi/launcher 층만으로 보장 불가 — OS/enterprise endpoint 통제가 필요.
- **Verdict가 MULTI_LAYER_REQUIRED인 이유**: Level 1(실수 방지)과 Level 2(사내 정책)의 상당 부분은 Pi native + Security Extension으로 실제 가능함을 확인했지만, workspace confinement(Extension으로 보완 가능), 진짜 "disable 불가" 정책과 Level 3(적대적 코드 sandboxing)은 Pi 어떤 조합으로도 불가능 — Launcher/Packaging(승인된 extension 배포·pinning·서명)과 OS/enterprise 계층이 반드시 필요.
- **Next decision**: 새 architecture decision 아직 없음(design만 나왔고 확정된 architecture decision이 아직 없음 — audit 문서 §16은 "논의용 후보"로 명시, decision_log 미추가). 다음 액션은 구현이 아니라 **observability-only** extension 설계(ALLOW/CONFIRM/DENY 판단 없이 `tool_call`/`tool_result`로 모든 tool 호출·PowerShell command string·workspace 밖 path 접근을 기록만 하는 것) — audit 문서 "Next One Action" 참고.

### Phase 4A — Security Observability 상태 (2026-09-09)

**Status: 구현·검증 완료 — Verdict: PASS.** Policy/enforcement 없음(ALLOW/CONFIRM/DENY 전혀 구현하지 않음).

- **문서**: [SECURITY_OBSERVABILITY_v0.1](../security/SECURITY_OBSERVABILITY_v0.1.md) (Phase 4 audit와 직접 연결).
- **Extension**: `pi-dev-security-observer` 1개 — `tool_call`/`tool_result` event만 구독해 normalized `SecurityObservation`을 session-local in-memory ring buffer(최대 50개)에 저장, `/security-observations` command로 확인. Custom tool 없음(model-accessible capability 안 늘림). `internal/pi-dev/config/extensions/`와 `internal/pi-dev-user/config/extensions/`에 **완전히 동일한 단일 소스**로 존재(divergence 없음, import-free라 SDK 의존성 문제 자체가 없었음). 새 dependency 없음 — 이미 vendored된 `jiti`만 재사용.
- **검증**: DEV는 `discoverAndLoadExtensions()`로 0 errors 확인 후 실제 CLI(`--mode json -p`, OpenRouter/GLM)로 Test A~F(workspace 내부/외부 read, write, PowerShell, extension custom tool, 실패 케이스) 전부 실행 — fixture 디렉토리에서만 진행. USER도 실제 self-contained bundle(portable node + vendored jiti)로 A/E 재확인, PASS. 매 tool call의 실제 trajectory(`tool_execution_end`)를 대조해 **observer가 활성화되어도 tool 결과가 전혀 변경되지 않음**을 확인(no blocking/mutation).
- **Workspace boundary 판정**: `path.resolve`/`path.relative`/`path.isAbsolute` 기반(문자열 `startsWith` 아님) — `../outside/...` traversal을 정확히 `outside`로 분류하는 것을 실제 실행으로 확인.
- **Privacy**: `tool_result`의 content/details는 절대 읽지 않음(tool/status만), PowerShell command는 200자로 capped된 sanitized preview만 저장(원본 전체 문자열은 어디에도 남기지 않음), persistent logging 전혀 없음(session 종료 시 소멸).
- **Next decision**: 새 architecture decision 없음(Phase 4 audit가 이미 native mechanism이 충분함을 확인했고, 이번엔 그 mechanism이 실제로 안정적인 normalized event를 만들어낼 수 있는지만 검증한 것). Phase 4B(workspace boundary policy: ALLOW/CONFIRM/DENY)는 아직 시작하지 않음 — 이번 문서의 스키마가 실전 검증되었다는 것만 확정.

### Phase 4B — Workspace Boundary Policy 상태 (2026-09-09)

**Status: 설계 완료(design only) — Verdict: READY_TO_IMPLEMENT.** ALLOW/CONFIRM/DENY 구현·`block:true`·`ctx.ui.confirm` 전혀 구현하지 않음.

- **문서**: [WORKSPACE_BOUNDARY_POLICY_v0.1](../security/WORKSPACE_BOUNDARY_POLICY_v0.1.md) (Phase 4/4A와 연결).
- **Final V1 Policy Matrix**: `read`/`ls`/`find`/`grep` — inside ALLOW, outside/unknown CONFIRM. `edit`/`write` — inside ALLOW, outside/unknown DENY(mutation엔 CONFIRM tier 없음, FAIL-CLOSED-FOR-MUTATION). PowerShell/bash는 범위 밖(Phase 4C).
- **핵심 source-grounded 확정**: workspace root = session 생성 시 고정되는 `AgentSession._cwd`(생성자에서 단 한 번만 할당됨을 코드에서 직접 확인) — PowerShell의 `Set-Location`은 별도 spawn된 child process 안에서만 동작하므로 이 값을 바꿀 수 없음. `block:true` 반환 시 `agent-loop.ts`가 `reason` 문자열을 그대로 model에게 보이는 tool error로 만든다는 것도 코드로 확인. Headless에서는 Pi의 stub 동작(`confirm()→false`)에 우연히 의존하지 않고, `ctx.hasUI`를 명시적으로 먼저 체크해 UI 없으면 즉시 DENY하는 자체 fail-closed 분기를 설계.
- **Windows path edge case 실측**: root=`C:\repo` 기준 sibling(`C:\repo2`), 다른 drive, UNC, `..` traversal 전부 정확히 outside로, 대소문자 차이(`C:\REPO` vs `C:\repo`)는 Node의 `path.relative`가 Windows에서 대소문자 무시 비교를 하기 때문에 실제로는 bypass 위험이 없음을 직접 실행해 확인.
- **알려진 gap(의도적으로 미해결)**: workspace 내부의 symlink/junction이 외부를 가리키는 경우 lexical 경로만으로는 `inside`로 오분류돼 mutation이 통과할 수 있음 — Phase 4A부터 이어진 한계, 이번에도 구현 안 함. Observer와 Policy를 같은 extension에 합치지 않고 별도 파일로 두되, **observer를 policy보다 먼저 load해야** block으로 short-circuit돼도 시도 자체는 계속 관찰됨을 source(`emitToolCall`의 handler 순회/short-circuit 로직)로 확인 — 이 load 순서 요구사항은 실제 구현 시 반드시 지켜야 함.
- **Next decision**: 새 architecture decision 없음(design만 확정, 아직 approved architecture decision 아님). 다음 단계는 실제 구현(`pi-dev-workspace-policy.ts`) + Test Matrix A~F 재실행 + CONFIRM/headless-DENY 신규 케이스 검증 — 그 결과가 나오기 전까지 Phase 4B 자체를 PASS로 부르지 않음.

## 12. Existing Work (보존)

기존 작업은 폐기하지 않는다. 다음은 historical validation evidence로 유지한다:

- M0 mini-SWE ([CODING_AGENT_PLAN_v0.2](CODING_AGENT_PLAN_v0.md), `experiments/M0_mini_swe_agent.md`)
- M1 Pi external model 검증 (`experiments/M1_pi.md`)
- Windows native tool validation (read/edit/write/ls/grep/find/powershell 활성화, fd/rg vendoring — 이번 세션 결과)
- `internal/pi-dev` / `internal/pi-dev-user` packaging (rename 이력: `internal/dev`→`pi-dev`, `internal/user`→`pi-dev-user`)
- sample 01~08 (`internal/pi-dev-user/samples/`) 및 ground truth (`internal/pi-dev/validation/sample-ground-truth/`)
- OpenRouter A/B 테스트 결과 (`internal/pi-dev-user/ab-test.cmd`) — 사내 duplication 이슈 원인 격리에 사용 중

## 13. Current Blocker

문서 정리가 현재 개발 우선순위를 바꾸지 않는다. 최우선 blocker:

```
Internal GLM response duplication
```

다음 실행 순서:
```
1. Internal GLM duplication 해결
2. Internal GLM qualification
3. Skills PoC
```

Portal/Launcher/새 Extension 구현으로 지금 넘어가지 않는다.

---
*이 문서는 living document다. Phase가 끝날 때마다 11장 Roadmap을 갱신한다.*
