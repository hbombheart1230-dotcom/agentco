# Decision Log

> [docs/plan/CODING_AGENT_PLAN_v0.md](CODING_AGENT_PLAN_v0.md) 18장에서 정의한 형식을 따른다. "확정하지 않기로 한 것"도 기록 대상이다.

---

### DEC-001 — 사내 후보 모델을 Qwen 3.8 Flash + GLM 5.3 Flash 2종으로 확정
- **Date**: 2026-09-01
- **Status**: confirmed
- **Context**: 계획서가 "사내 Qwen" 단수로만 표현되어 있었으나 실제 후보가 2개로 확정됨.
- **Alternatives considered**: 단일 모델만 먼저 검증 후 순차 확장 — 기각(동일 gate/Anchor Task로 비교 가능하다는 이점이 커서 처음부터 2종 병행하기로 함).
- **Related hypothesis**: HYPOTHESIS-7 (신설 계기)
- **Related milestone**: M1.5, M2

### DEC-002 — M0 실행 shell 계약을 mini-SWE 기본값(cmd.exe) 대신 PowerShell로 정렬하는 실험적 workaround 채택
- **Date**: 2026-09-07
- **Status**: confirmed (M0 experimental workaround로만 — production 패턴 아님)
- **Context**: Run 1에서 mini-SWE의 bash 지향 prompt/tool 계약과 Windows cmd.exe 실행이 불일치해 `LimitsExceeded` 발생(M0-FINDING-01).
- **Alternatives considered**: (a) mini-SWE 소스 수정 — 기각(source modification 금지 원칙). (b) Linux/WSL/Docker로 이동해 bash 정합성 확보 — 기각(PR-ENV-01/PR-INSTALL-01과 우선순위 불일치, 기록만 보존). (c) driver script에서 `COMSPEC` env override + prompt 텍스트 교체 — **채택**.
- **Related hypothesis**: 없음(H1~H7 어디에도 정확히 대응 안 함, M0-FINDING-01로 별도 관리)
- **Related milestone**: M0

### DEC-003 — Product Requirements PR-ENV-01 ~ PR-LINUX-01 확정
- **Date**: 2026-09-07
- **Status**: confirmed
- **Context**: Windows-first 실행, 원격 사내 vLLM serving, 설치 최소화, Linux 실행은 secondary라는 product goal이 명시적으로 주어짐.
- **Alternatives considered**: 없음 — 사용자가 직접 제시한 요구사항을 그대로 기록.
- **Related hypothesis**: H3(UI 독립성), H5(복잡도)
- **Related milestone**: M0 이후 전 milestone에 적용

### DEC-004 — mini-SWE M0 → Pi M1 Anchor B 결과를 harness 우열로 일반화하지 않음
- **Date**: 2026-09-07
- **Status**: confirmed (원칙으로 확정, 결론 자체는 아님)
- **Context**: Pi Anchor B가 shell 실패 0건·가장 깨끗한 diff로 종료했으나 1회 실행 결과.
- **Alternatives considered**: 지금 시점에 "structured tool이 우월하다"는 잠정 결론을 남기는 것 — 명시적으로 기각(반복 실행·M2~M5 근거 없이는 승격 금지).
- **Related hypothesis**: H2, H6
- **Related milestone**: M1, M5(향후)

### DEC-005 — Credential scrub은 driver-script 레벨(mini-SWE) 또는 공식 spawnHook(Pi)으로 처리, 아직 architecture decision으로 승격하지 않음
- **Date**: 2026-09-03 (mini-SWE) / 2026-09-07 (Pi)
- **Status**: confirmed as pattern, **not** confirmed as architecture
- **Context**: 두 harness 모두 기본적으로 전체 process env를 agent가 실행하는 shell subprocess에 상속한다는 공통 구조 발견.
- **Alternatives considered**: Pi의 `spawnHook`을 "표준 패턴"으로 지금 확정 — 기각(M2~M5 이전에는 성급함, 관찰로만 유지).
- **Related hypothesis**: 없음(Security observation으로 별도 관리)
- **Related milestone**: M0, M1

### DEC-006 — Node.js v24.20.0(Active LTS)을 관리자 권한 없는 ZIP 배포판으로 설치
- **Date**: 2026-09-07
- **Status**: confirmed
- **Context**: PR-INSTALL-01(간단한 설치) 요구사항 + 이 세션에 UAC 대화형 승격 수단이 없음.
- **Alternatives considered**: (a) MSI 전체 사용자 설치 — 기각(Error 1925, 관리자 권한 필요). (b) MSI per-user 설치 — 기각(이 MSI 빌드가 `MSIINSTALLPERUSER` 속성을 실제로 지원하지 않음, 로그로 확인). (c) 공식 ZIP 배포판, 사용자 PATH 등록 — **채택**.
- **Related hypothesis**: 없음
- **Related milestone**: M1

### DEC-007 — `.env`에서 프로젝트와 무관한 credential(NAVER_*)을 분리
- **Date**: 2026-09-07
- **Status**: confirmed
- **Context**: 실험 driver마다 매번 "제외 목록"에 무관한 키를 수동으로 넣어야 했음 — 근본적으로 이 프로젝트의 secret 파일에 있을 이유가 없음.
- **Alternatives considered**: 계속 driver마다 scrub 목록에 포함 — 기각(사고 여지, 유지보수 부담).
- **Related hypothesis**: 없음
- **Related milestone**: 전체

### DEC-008 — Pi Upstream-First / Minimal-Customization Policy 채택
- **Date**: 2026-09-07
- **Status**: confirmed
- **Context**: 사내 논의 결과, "여러 harness를 대칭 비교해 M5에서 BASE를 고른다"는 기존 계획([CODING_AGENT_PLAN_v0.2](CODING_AGENT_PLAN_v0.md) 12장)에서 "Pi upstream을 기본 base로 채택하고, 사내 정책/보안/환경/모델연결/배포에 필요한 최소 영역만 직접 관리한다"로 방향이 바뀜. 지금까지 확인된 사실이 이 방향을 뒷받침함:
  - Pi structured tools(read/edit/powershell)가 Anchor B에서 정상 동작 확인(M1)
  - Windows PowerShell tool 지원 확인(M1, manual playground, TUI playground)
  - Pi native TUI/session/runtime/이벤트 버스가 실재하고 source-level로 확인됨
  - OpenRouter를 통한 external GLM 연결 확인(manual playground, TUI playground)
  - 사내 vLLM을 위한 custom provider가 **Pi native `models.json`만으로 가능**하다는 source evidence 확보(임의 provider ID 허용, `${ENV_VAR}` credential 참조 native 지원)
  - USER self-contained packaging prototype이 실제로 동작함을 dry-run으로 확인(`internal/user`)
  - 직접 구현량을 줄이면 upstream 업데이트 추종이 쉬워짐(유지보수 비용 감소가 기대되는 방향 — 아직 실측은 아님)
  - `packages/web-ui`는 이 clone에 존재하지 않음을 확인 — 자체 UI를 새로 만들 근거가 오히려 약해짐(참고할 완성형 web UI가 없으므로 더더욱 "TUI 우선" 원칙을 강화)
- **Alternatives considered**:
  - 기존 계획대로 M5에서 Pi/OpenHands/Own/Hybrid를 계속 대칭 비교 — 기각(단일 run 결과를 과도하게 일반화하지 않는다는 원칙과는 별개로, 사내 논의에서 "지금 시점에 대칭 비교를 계속 유지할 실익이 없다"고 판단).
  - Pi를 영구 확정(fork 후 독자 진화)으로 선언 — 기각(아직 이르고, upstream 추종 이점을 포기하게 됨).
- **Related hypothesis**: HYPOTHESIS-1, 2, 5, 6 (M5 대칭 비교 전제가 바뀌므로 관련 — 단, 이 hypothesis들 자체를 이 결정으로 confirmed/rejected 처리하지는 않는다. 여전히 "확정 전 관찰"로 유지)
- **Related milestone**: M4, M5 (프레이밍 변경), 이후 milestone 흐름 전체
- **Consequences**: [CODING_AGENT_PLAN_v0.3.md](CODING_AGENT_PLAN_v0.3.md) 신설, [UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md) 신설. v0.2는 historical/frozen으로 유지(삭제/재작성 없음).
- **Reconsideration triggers**: critical 사내 security 요구사항을 Pi로 충족 불가 / Windows 배포 blocker / 사내 모델 호환성 근본적 blocker / 필요한 coding workflow를 native·config·extension으로 구현 불가 / upstream maintenance·license·policy 문제가 감내 불가 수준 — 상세는 [UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md) 참고.
- **주의**: single-run 결과(Anchor B 1회 등)를 이 결정의 유일한 근거로 과대 해석하지 않는다 — 이 결정은 여러 세션에 걸친 source-level 확인의 누적과 사내 논의 결과를 함께 근거로 한다.

### DEC-009 — Pi Dev 제품 정의: Enterprise Coding Harness / Distribution Layer
- **Date**: 2026-09-09
- **Status**: confirmed
- **Context**: DEC-008 이후 실제로 사내 GLM 연결, packaging(`internal/pi-dev`, `pi-dev-user`), sample 8종, OpenRouter A/B 등을 진행하며 "Pi upstream + 최소 통합"이라는 원칙 수준 표현으로는 실제 제품 범위(Skills, Extensions, 배포, 인증, 업데이트)를 설명하기 부족해짐. Pi Dev를 "Coding Agent core를 새로 만드는 프로젝트"가 아니라 "Pi upstream을 core로 쓰는 Enterprise Coding Harness / Distribution Layer"로 명시적으로 재정의.
- **Alternatives considered**: 기존 DEC-008 표현을 그대로 유지하고 세부는 문서화하지 않음 — 기각(Skills/Extensions/Distribution처럼 서로 다른 성격의 영역을 구분 없이 뭉뚱그리면 이후 "이것도 Pi가 해야 하나 우리가 해야 하나" 판단이 매번 흔들림).
- **Related hypothesis**: 없음(제품 정의 결정, hypothesis 대상 아님)
- **Related milestone**: v0.4 전체
- **Consequences**: [CODING_AGENT_PLAN_v0.4.md](CODING_AGENT_PLAN_v0.4.md) 신설. [UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md)에 원칙 `SKILL-BEFORE-EXTENSION`/`EXTENSION-BEFORE-WRAPPER`/`WRAPPER-BEFORE-FORK`/`WINDOWS-FIRST` 및 Ownership boundary(Skills/Extensions/Authentication/Launcher/Approved-version/Update-Rollback/Portal) 추가. v0.3은 historical로 전환(본문 재작성 없음).

### DEC-010 — Native TUI First, Web은 Coding UI 전에 Control Plane으로 고려
- **Date**: 2026-09-09
- **Status**: confirmed
- **Context**: V1 공식 UX를 Pi Native TUI로 재확인하고, VS Code Extension/Custom Web Coding UI/Custom TUI는 보류. 이전 세션에서 `packages/web-ui`가 이 clone에 존재하지 않음을 이미 source-level로 확인했고(DEC-008 근거), 이번엔 "Web을 고려하게 되면 Coding UI보다 Portal(Control Plane) 역할이 우선"이라는 순서를 명시.
- **Alternatives considered**: Web Coding UI를 VS Code보다 먼저 검토 — 기각(사내 인증/배포/버전관리 같은 Control Plane 요구가 Coding UI 자체보다 먼저 필요하다고 판단).
- **Related hypothesis**: 없음
- **Related milestone**: v0.4 3장, Phase 7(Portal)
- **Consequences**: [UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md) UI 방향 절 갱신.

### DEC-011 — Skills(지식/워크플로우 layer) vs Extensions(capability/enforcement layer) 역할 분리
- **Date**: 2026-09-09
- **Status**: confirmed
- **Context**: 두 메커니즘을 구분 없이 쓰면 "반복 지침"까지 코드(extension)로 구현하게 되어 MINIMAL-CUSTOMIZATION 원칙과 충돌함. Skill = 재사용 가능한 prompt/instruction(자유로운 reasoning 허용), Extension = 실제 capability나 강제(enforcement)가 필요할 때만이라고 역할을 분리.
- **Alternatives considered**: Extension 하나로 통일 — 기각(모든 절차성 지식까지 코드화하면 유지보수 비용이 늘고 모델의 문제 해결 자유도를 불필요하게 제한함).
- **Related hypothesis**: 없음
- **Related milestone**: Phase 2(Skills PoC), Phase 3(Extension PoC)
- **Consequences**: [UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md)에 "Skills vs Extensions" 절, decision hierarchy에 Skill 단계 추가. Resource Hierarchy(Company/Team/Project/Personal) 및 Global Extension의 강화된 qualification 요구사항도 함께 기록.

### DEC-012 — Managed Distribution Architecture (Portal → Launcher → Managed Runtime), `LATEST != APPROVED`
- **Date**: 2026-09-09
- **Status**: confirmed (방향 결정 — 구현은 아직 없음)
- **Context**: 현재 `internal/pi-dev-user`는 portable ZIP prototype이다(그대로 유지, 12장 참고). 장기적으로는 Pi upstream release를 사용자에게 바로 배포하지 않고 qualification → Internal APPROVED → central manifest → user update 파이프라인을 거치게 한다. Rollback도 지원 가능한 구조를 지향.
- **Alternatives considered**: 매 Pi upstream 릴리스를 바로 사용자 배포 — 기각(사내 qualification 없이 배포하면 upstream 변경이 검증 없이 그대로 전파되어 DEC-008의 "Pi upstream을 신뢰하되 검증 후 채택"이라는 취지와 어긋남).
- **Related hypothesis**: 없음
- **Related milestone**: Phase 5(Launcher/Managed Runtime), Phase 6(Central Manifest/Approved Update/Rollback)
- **Consequences**: [UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md) "Update Principle" 절 신설. Portal/Launcher 실구현은 이번 라운드에서 하지 않음 — 방향만 문서화.

### DEC-013 — Pi Dev Self-Hosting (running runtime ≠ development target)
- **Date**: 2026-09-09
- **Status**: confirmed (원칙 — 구현은 아직 없음)
- **Context**: Pi Dev가 스스로를 개발(Skill/Extension/Launcher 개발, 테스트, packaging, 문서, upstream compatibility audit)하는 데도 쓰일 수 있어야 하되, 지금 실행 중인 runtime 자체를 직접 고쳐쓰는 구조는 피해야 한다는 경계를 명시. 권장 lifecycle: source workspace 개발 → build/test/qualification → candidate runtime → 새 process에서 실행 → PASS → approved 승격.
- **Alternatives considered**: 실행 중인 runtime을 즉시 hot-patch하는 방식 — 기각(무엇이 approved 상태인지 불분명해지고, DEC-012의 qualification 파이프라인과 충돌).
- **Related hypothesis**: 없음
- **Related milestone**: v0.4 10장
- **Consequences**: [UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md) "Self-Hosting 원칙" 절 신설.
