# CODING_AGENT_PLAN Patch Notes

> [docs/plan/CODING_AGENT_PLAN_v0.md](../plan/CODING_AGENT_PLAN_v0.md)(v0.2 내용), [docs/plan/CODING_AGENT_PLAN_v0.3.md](../plan/CODING_AGENT_PLAN_v0.3.md), [docs/plan/CODING_AGENT_PLAN_v0.4.md](../plan/CODING_AGENT_PLAN_v0.4.md)의 개정 이력. 계획서 본문에는 최신 상태만 유지하고, "무엇이 왜 바뀌었는지"는 여기서 추적한다.
> 날짜는 각 문서 자체에 기록된 표기를 따른다(별도 재검증 안 함).

## v0.4 — 2026-09-09 (신규 파일, v0.3은 historical로 전환)

**변경**: Pi Dev의 제품 정의를 "Pi upstream + 최소 사내 통합"에서 **"Enterprise Coding Harness / Distribution Layer"** 로 확장했다 (파일: [CODING_AGENT_PLAN_v0.4.md](../plan/CODING_AGENT_PLAN_v0.4.md)). v0.2/v0.3과 마찬가지로 이전 문서를 덮어쓰지 않고 별도 파일로 추가했다.

- 원칙 확장: `SKILL-BEFORE-EXTENSION` / `EXTENSION-BEFORE-WRAPPER` / `WRAPPER-BEFORE-FORK` / `WINDOWS-FIRST` 추가 ([UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md)에 통합)
- **Skills**: 재사용 가능한 지식/워크플로우 layer로 신설 (PoC: test-and-fix, root-cause-debug, code-review)
- **Extensions**: capability/enforcement layer로 역할 명확화 (PoC 이후 V1 후보: security-policy, approval, audit)
- **Resource Hierarchy**: Company Global → Team → Project → Personal, Company security/policy override 금지, Global Extension 강화 qualification
- **Distribution Architecture**: Portal → Launcher → Managed Runtime → Pi Upstream → Internal AI Gateway 방향 수립, `internal/pi-dev-user`는 prototype artifact로 유지
- **Update Principle**: `LATEST != APPROVED` 불변식, qualification 파이프라인, rollback 지원 방향
- **Portal**: 초기엔 Coding UI가 아니라 SSO/Authentication/Approved versions/Registry/Policy/Update 역할
- **Self-Hosting**: Pi Dev가 스스로를 개발하는 데 쓰이되 `running runtime ≠ development target` 경계 유지
- **Roadmap**: Phase 1(Internal Model Qualification, 진행 중) ~ Phase 9(Usage-driven expansion)로 재정렬. 기존 M1.5~M4 상세 설계(v0.2/v0.3)는 대체하지 않고 Phase 1 안으로 흡수
- 근거는 [decision_log.md DEC-009~013](../plan/decision_log.md)에 기록
- **현재 blocker는 그대로**: Internal GLM response duplication 해결이 여전히 최우선이며, 이번 문서 정리로 Portal/Launcher/새 Extension 구현으로 넘어가지 않는다

**보존**: v0.2, v0.3의 본문은 수정하지 않았다. v0.3 파일 상단에 "historical, v0.4 참고" 안내만 추가했다(v0.2에 했던 것과 동일한 패턴).

### v0.4 갱신 — 2026-09-09 (Skills PoC, 같은 파일 내 living-document 갱신)

Phase 2(Skills PoC)를 실제로 실행하고 v0.4 11장에 상태를 기록했다(새 파일 아님, 새 decision 아님 — 원래 설계가 충분함을 확인했을 뿐):

- Skill 3개(`test-and-fix`, `root-cause-debug`, `code-review`)를 `internal/pi-dev/config/skills/`에서 만들고 native `loadSkills()`로 discovery 확인(diagnostics 0), `internal/pi-dev-user/config/skills/`에 qualified copy로 반영
- OpenRouter/GLM(사내 endpoint는 duplication blocker로 미사용) + `ab-test.cmd`로 baseline/auto/explicit 실제 실행, `--mode json` raw trajectory로 확인
- Auto-selection은 code-review에서 성공, test-and-fix/root-cause-debug에서는 이번 표본에서 트리거 안 됨(단 task correctness에는 영향 없음) — 표본이 작아 통계적 결론 아님
- 명시적 `/skill:name`은 이미 있는 native TUI 컴포넌트(`[skill] name`, 접기/펼치기)로 표시됨을 확인 — 별도 UI 구현 불필요
- Pi source 수정, custom skill loader/selector, Extension 없이 진행 완료

### v0.4 갱신 — 2026-09-09 (Extension PoC)

Phase 3(Extension PoC)를 실제로 실행하고 v0.4 11장에 상태를 기록했다(PASS):

- Extension 1개(`pi-dev-info`, command `/internal-info` + tool `get_pi_dev_environment`)를 공식 example(`hello.ts`/`commands.ts`) 패턴 그대로 `internal/pi-dev/config/extensions/`에서 만들고, native `discoverAndLoadExtensions()`로 discovery/load 확인 → `internal/pi-dev-user/config/extensions/`에 qualified copy
- 실제 CLI(`--extension` + `--mode json -p`, OpenRouter/GLM)로 tool 자동 선택·명시 호출·결과 반환까지 DEV/USER 둘 다 확인
- **재확인된 packaging 이슈**: USER의 self-contained 번들은 TypeScript extension loader(jiti)가 `node_modules` 없이는 로드 자체를 실패시킨다 — credential-scrub extension 때와 동일한 root cause. 동일한 native remediation(zero-dependency `jiti` 패키지를 `runtime/pi/node_modules/jiti`에 vendoring, fd/rg와 같은 성격)으로 해결, PASS
- **발견**: custom tool도 built-in tool과 동일하게 launcher의 `--tools` allowlist에 이름을 추가해야 활성화됨 — 실제 배포 시 반영 필요
- `/internal-info` 커맨드의 실제 TUI 렌더링은 headless 테스트로 확인 불가(`ctx.ui.notify`는 인터랙티브 전용) — 등록까지만 확인, 화면 표시는 사람이 직접 확인 필요
- Pi source 수정, custom extension loader 없이 진행 완료. 새 Decision Log entry 없음(기존 원칙 그대로 충분함을 확인했을 뿐)

### v0.4 갱신 — 2026-09-09 (Security / Approval Native Capability Audit)

Phase 4(Security Extension audit-only)를 실행하고 결과를 별도 문서 [SECURITY_NATIVE_AUDIT_v0.1.md](../security/SECURITY_NATIVE_AUDIT_v0.1.md)로 남겼다(Verdict: MULTI_LAYER_REQUIRED, 구현 없음):

- 17개 audit question 전부 source-grounded로 답변 완료(`agent-loop.ts`, `agent-session.ts`, `extensions/runner.ts`, `extensions/loader.ts`, `tools/bash.ts`, `tools/powershell.ts`, `utils/paths.ts`, `trust-manager.ts`, `project-trust.ts` 등 정확한 file:line 근거)
- **native로 확실히 되는 것**: `tool_call`/`tool_result` extension event로 모든 tool 호출(built-in/extension/custom 구분 없음) 관찰·차단·수정, `BashSpawnHook`/`PowerShellSpawnHook`으로 spawn 직전 command/cwd/env 재작성, `--tools` allowlist를 통한 tool 단위 capability 축소, interactive/RPC에서 `ctx.ui.confirm/select/input`을 통한 실제 approval UX
- **native로 안 되는 것(핵심 gap)**: `read`/`edit`/`write`/`find`/`grep`/`ls`에 workspace 밖 접근을 막는 장치가 전혀 없음(`resolvePath()`에 boundary 체크 없음), Extension 자체에 대한 sandbox/서명/권한 모델이 전혀 없음(jiti loader = 순수 Node 모듈 실행), `--no-extensions`/`--extension`/`--tools`가 전부 사용자가 대칭적으로 override 가능해 "비활성화 불가" 정책은 Pi/launcher 층만으로 보장 불가
- headless(`-p`/`--mode json`) approval은 `confirm()→false`/`select()·input()→undefined`로 우연히 fail-closed에 가깝게 동작하지만, 이는 문서화된 계약이 아니라 no-op stub의 부수효과임을 명시
- Security Extension, approval extension, audit extension, command blacklist, sandbox, launcher/Windows/registry/credential 관련 구현은 이번 phase에서 전혀 하지 않음(지시대로 audit-only). 새 Decision Log entry 없음(§16 policy candidate는 논의용이며 아직 확정된 architecture decision 아님)

### v0.4 갱신 — 2026-09-09 (Phase 4A: Security Observability)

Phase 4A(observability-only Security Extension)를 실제로 구현·검증하고 결과를 [SECURITY_OBSERVABILITY_v0.1.md](../security/SECURITY_OBSERVABILITY_v0.1.md)로 남겼다(Verdict: PASS, policy/enforcement 없음):

- `pi-dev-security-observer` extension 1개 — `tool_call`/`tool_result` event만 구독해 normalized `SecurityObservation`(tool/category/workspaceRelation/command preview 등)을 session-local in-memory ring buffer(최대 50개)에 저장, `/security-observations` command로만 확인. Custom tool 없음, ALLOW/CONFIRM/DENY 전혀 없음
- `internal/pi-dev/config/extensions/`와 `internal/pi-dev-user/config/extensions/`에 완전히 동일한 단일 소스로 존재(import-free라 SDK 의존성 문제가 애초에 없었음), 새 dependency 없이 기존 vendored `jiti` 재사용
- DEV(`discoverAndLoadExtensions()` + 실제 CLI `--mode json -p`, OpenRouter/GLM)와 USER(실제 self-contained bundle) 양쪽에서 Test A~F(workspace 내/외부 read, write, PowerShell, extension custom tool, 실패 케이스)를 harmless fixture로 실행, 전부 PASS
- 실제 trajectory(`tool_execution_end`) 대조로 **observer가 있어도 tool 동작이 전혀 변하지 않음**을 확인(no blocking/mutation) — outside-workspace read도 정상 수행됨(관찰만 하고 막지 않음)
- Workspace boundary 판정은 `path.resolve/relative/isAbsolute` 기반이라 `../outside/...` traversal을 정확히 outside로 분류함을 실제 실행으로 확인(문자열 prefix 방식 아님)
- Privacy: tool_result content/details 절대 미기록, PowerShell command는 200자 capped preview만 저장, persistent logging 없음(session 종료 시 소멸)
- 새 Decision Log entry 없음(Phase 4 audit의 결론을 실전 검증했을 뿐, 새 architecture decision 아님). Phase 4B(ALLOW/CONFIRM/DENY policy)는 미착수

### v0.4 갱신 — 2026-09-09 (Phase 4B: Workspace Boundary Policy — design only)

Phase 4B(workspace-boundary enforcement 설계)를 완료하고 [WORKSPACE_BOUNDARY_POLICY_v0.1.md](../security/WORKSPACE_BOUNDARY_POLICY_v0.1.md)로 남겼다(Verdict: READY_TO_IMPLEMENT, 구현 없음 — `block:true`/`ctx.ui.confirm`/path enforcement 전혀 없음):

- Final V1 matrix: `read`/`ls`/`find`/`grep` inside=ALLOW, outside/unknown=CONFIRM; `edit`/`write` inside=ALLOW, outside/unknown=DENY(mutation엔 CONFIRM 없음)
- Workspace root = session 생성 시 한 번만 고정되는 `AgentSession._cwd`임을 source로 확인(PowerShell `Set-Location`이 이를 바꿀 수 없음)
- headless fail-closed을 Pi의 우연한 stub 동작에 의존하지 않고 `ctx.hasUI`를 직접 체크하는 명시적 분기로 설계
- Windows path edge case(sibling/drive/UNC/traversal/대소문자)를 실제 실행으로 검증 — 대소문자 차이는 Node가 Windows에서 이미 무시 비교하므로 별도 처리 불필요함을 확인
- symlink/junction bypass는 의도적으로 미해결(Phase 4A부터 이어진 한계)로 문서화
- Observer(Phase 4A)와 Policy(Phase 4B)는 별도 extension 파일로 유지 권장, 단 **observer를 먼저 load해야** block으로 short-circuit돼도 시도가 계속 관찰됨을 `emitToolCall` short-circuit 로직으로 확인 — 실제 구현 시 load 순서 필수
- 새 Decision Log entry 없음(design만 확정). 실제 구현(`pi-dev-workspace-policy.ts`)과 runtime 재검증 전까지 Phase 4B는 미완료 상태로 유지

### v0.4 갱신 — 2026-09-11 (web_search extension 추가)

사용자가 "왜 웹 검색이 안 되냐"고 물어봐서 확인한 결과, **Pi native built-in tool엔 웹/네트워크 tool이 애초에 없음**을 소스로 확인(`core/tools/index.ts`의 `ToolName` union이 정확히 `read|bash|powershell|edit|write|grep|find|ls` 8개뿐) — 우리가 뭔가 막은 게 아니라 upstream Pi 자체의 scope였다. `pi-dev-web-search` extension을 새로 만들어 채움:

- Naver Search API(`openapi.naver.com`) 기반 `web_search` custom tool 1개(`pi.registerTool()`만 사용, Pi source 수정 없음) — `web`/`news`/`blog` 카테고리 지원
- `NAVER_CLIENT_ID`/`NAVER_CLIENT_SECRET`는 이미 repo root에 있던 `.env.naver`(원래 "News Provider(unrelated to Coding Agent project)"용 주석이 붙어 있던 키)를 사용자 승인 받아 재사용 — 새로 발급받지 않음
- 다른 extension(`pi-dev-info`, `pi-dev-security-observer`)과 동일하게 zero-import 단일 소스로 작성, `fetch`는 Node 18+ 내장 global이라 import 자체가 불필요 — `internal/pi-dev`, `internal/pi-dev-user`, `internal/pi-dev-AY` 세 곳에 동일 파일로 존재(divergence 없음)
- 세 launcher(`run-glm.cmd`, `run-agent.cmd`, `run-ay.cmd`) 전부 이 extension을 **기본으로** 켜도록 수정(`--extension` + `--tools`에 `web_search` 추가), `.env.naver`를 launcher가 자동으로 읽어 환경변수로 주입(OPENROUTER_API_KEY와 동일한 패턴)
- 실제 end-to-end 검증: `discoverAndLoadExtensions()`로 DEV에서 3개 extension(`pi-dev-info`+`pi-dev-security-observer`+`pi-dev-web-search`) 동시 로드 0 errors 확인, USER self-contained bundle에서 실제 자연어 프롬프트("오키나와 9월 태풍 검색해줘")로 모델이 `web_search`를 자동 선택해 실제 Naver 검색 결과를 받아오고 coherent하게 요약하는 것까지 real API 호출로 확인
- API key 자체는 절대 tool 출력/에러 메시지에 노출되지 않도록 구현(값 없으면 "not set"이라고만 알림, 값 자체는 어디에도 echo 안 함)
- 새 Decision Log entry 없음(기존 Extension-before-wrapper 원칙 그대로 적용한 capability 추가일 뿐, 새 architecture decision 아님)

### v0.4 갱신 — 2026-09-28 (internal/ 통합: pi-dev-user·pi-dev-AY 병합/archive)

개인용 개발 환경이 repo/workspace/runtime state가 뒤섞인 채로 정리 안 된 상태였음이 확인돼(browser POC가 `internal/pi-dev-AY/scripts/`에 직접 생성돼 있었고, `pi-dev-user/config/skills.zip` 같은 중복 백업도 방치돼 있었음), 두 단계로 정리했다:

**1단계 — 위치 분리(코드는 그대로, 새 root만 만듦)**: `C:\Agent Workspace`(업무 산출물/POC), `C:\Obsidian\Personal-Agent-Vault`(사람 노트), `%USERPROFILE%\.pi-personal`(개인 runtime skeleton)을 repo 밖에 신규 생성. `internal/pi-dev-AY/scripts/`에 섞여있던 browser POC(jalan.net 스크래핑 `smoke.js`/`collect.js`/`node_test.js`/`py_test.py` + 생성물 + playwright `node_modules`)를 `C:\Agent Workspace\browser-poc\`로 이동, 문법 오류가 있고 실제 사용 evidence가 없던 `pi-dev-browser.ts`는 archive. `.gitignore`를 `git init` 전에 실제 tree 기준으로 작성(secrets/runtime state만 정확히 제외, `models.json` 같은 source-controlled template은 안 건드림). `docs/AGENT_WORKFLOW.md` 신설.

**2단계 — `internal/` 자체를 `pi-dev` 하나로 통합**: `pi-dev`/`pi-dev-user`/`pi-dev-AY` 3개 환경의 extension/skill이 이미 전부 동일 내용임을 diff로 확인(병합할 코드 차이 없음). 실제로 재사용 가치 있던 것만 `pi-dev`로 병합:
- `pi-dev-user`의 `ab-test.cmd`(A/B 진단), `samples/`+`reset-samples.cmd`(ground-truth가 이미 `pi-dev/validation/`에 있어 의존관계가 있었음) → `pi-dev`로 이동, self-contained runtime 경로를 `pi-dev`의 external/pi 직접 경로로 재작성 후 실제 실행 검증
- `pi-dev-AY`의 `run-ay.cmd`(→`run-free.cmd`)+`check-model.mjs`(OpenRouter 무료 모델 fallback probing) → 경로 구조가 이미 동일해 그대로 이동, 실제 실행 검증
- 나머지(portable Node 포함 self-contained bundle 등, ~130MB)는 삭제하지 않고 `C:\Agent Workspace\archive\pi-dev-user\`, `archive\pi-dev-AY\`에 통째로 보관
- 이동 전 전체 grep으로 참조 여부 확인(활성 launcher/config 어디에서도 참조 안 됨을 확인한 후에만 이동)
- 삭제한 파일 없음(전부 이동/archive/신규 생성)

부수적으로 `pi` 글로벌 CLI가 PATH에 없는 이유도 조사: `@earendil-works/pi-coding-agent`가 global npm install된 적이 없어서(패키지 자체에 `bin: {pi: dist/bundle/cli.js}`는 선언돼 있음) — PATH 문제가 아니라 install 자체가 없었던 것. 이번엔 PATH나 global install을 건드리지 않고 원인만 확인.

새 Decision Log entry 없음(architecture/policy 변경이 아니라 workspace hygiene). Git init/GitHub 연결/global pi install은 이번에도 하지 않음.

## v0.3 — 2026-09-07 (신규 파일, v0.2는 historical/frozen으로 유지)

**변경**: 사내 논의 결과 프로젝트 기본 방향이 바뀜에 따라, v0.2를 덮어쓰지 않고 **별도 문서로 새 실행 계획을 추가**했다 (파일: [CODING_AGENT_PLAN_v0.3.md](../plan/CODING_AGENT_PLAN_v0.3.md)). 장기 원칙은 다시 별도 문서([UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md))로 분리했다 — PLAN=실행 순서, Decision Log=결정 history, Architecture policy=장기 원칙 역할 분리.

- **기본 방향 전환**: "여러 harness를 M5에서 대칭 비교해 BASE 결정" → **"Pi upstream을 기본 base(default upstream baseline)로 채택, 사내 최소 영역만 직접 관리"**
- 신규 원칙 5가지 도입: `UPSTREAM-FIRST` / `MINIMAL-CUSTOMIZATION` / `CONFIG-BEFORE-CODE` / `EXTENSION/HOOK-BEFORE-FORK` / `NO-FORK-BY-DEFAULT`, 그리고 5단계 decision hierarchy(native → config → extension/hook → thin wrapper → source modification)
- **Pi upstream ownership / Internal ownership** boundary 명시 (Agent Loop/Tool/Session/TUI/models.json 등은 Pi 소유, internal vLLM 연결/credential/security policy/Windows packaging 등만 사내 소유)
- NOOA/OpenHands 역할을 "BASE 경쟁 후보"에서 **"architecture/feature reference"**로 재정의 — "Pi를 대체하는가"보다 "Pi에 없는 아이디어가 있는가"를 먼저 물음
- UI 방향: VS Code integration/Web GUI 우선순위 하향, Pi native TUI를 현재 기본 UX로 확정 (근거: `packages/web-ui`가 이 clone에 존재하지 않음을 source-level로 확인)
- `internal/dev`, `internal/user` 패키지를 "Pi 재구현"이 아니라 "Pi upstream + native config + bundled runtime + thin launcher + internal policy"로 재정의
- USER package의 credential-scrub gap을 즉시 우회 구현하지 않고 backlog/design question으로 기록
- Milestone 흐름 재정렬: M0/M1 COMPLETE 표기, Internal Packaging Prototype COMPLETE 표기, 이후 Internal GLM Integration → Internal Pi Validation → Reference Study → Productionization 순으로 명시. 기존 M0~M5 번호/산출물 자체는 삭제하지 않음(v0.2에 그대로 보존)
- BASE Reconsideration Triggers 신설 (critical security/Windows blocker/모델 호환성 blocker/workflow 구현 불가/upstream 정책 문제 — 이 중 하나가 실제 발생했을 때만 BASE 재검토)
- 근거는 [decision_log.md DEC-008](../plan/decision_log.md)에 기록. single-run 결과를 유일한 근거로 과대 해석하지 않는다는 원칙은 유지.

**계기**: 사내 논의에서 harness 대칭 비교를 계속 유지할 실익이 낮고, Pi가 지금까지의 M0/M1/manual playground/TUI playground/internal packaging 검증에서 필요한 기능을 충분히 native하게 제공한다는 점이 누적 확인됨.

**보존**: v0.2의 M0/M1 실험 결과, hypothesis, toy benchmark, working principles, decision log(DEC-001~007)는 **수정하지 않았다**. v0.2 파일 상단에 "historical/frozen, v0.3 참고" 안내만 추가했다(본문 재작성 없음).

## v0.2 — 2026-09-01 표기 (실제 작업 turn 기준 2026-09-07경)

**변경**: 사내 후보 모델을 "Qwen 3.8 Flash" 단수에서 **Qwen 3.8 Flash + Z.ai GLM 5.3 Flash 2종 병행**으로 확장.

- 3장(원칙 6): 후보 모델 비교 시 gate·harness·task를 고정하고 모델만 변수로 두는 조항 추가
- 4장 표: 사내 모델 행을 2종 병기로 수정
- **8장(M1.5)**: G1~G10 게이트를 **모델별로 독립 실행**하도록 명시 — 같은 사내 인프라를 공유해도 인증/프로토콜은 모델마다 다를 수 있어 게이트 결과를 모델별로 별도 기록
- **9장(M2)**: harness(2) × 모델(2) = 4개 조합으로 확장, Anchor Task B를 4개 조합 공통 비교 기준으로 명시
- 16장: HYPOTHESIS-2/4를 두 모델 각각 결과가 다를 수 있음을 반영해 재작성, **HYPOTHESIS-7 신설**("두 모델 중 어느 쪽이 더 적합한지는 동일 gate·Anchor Task 비교 후에만 판단")
- 20장: 리스크 1건 추가(서빙 스택이 다르면 게이트를 두 번 통과시켜야 하는 비용)

**계기**: 실제 후보 모델이 확정되며 "사내 Qwen" 단수 표현이 현실과 어긋남.

## v0.1 (개정판) — 2026-09-01

**변경**: 직전 v0.1 초안이 M4_PRESURVEY의 4개 항목만 반영한 채 불완전하게 남아있던 것을, 그 이전에 합의된 **v0→v0.1 전체 개정사항**으로 다시 작성.

- **M1.5: Internal Readiness Gate 신설**(M1과 M2 사이) — harness 없이 raw 레벨에서 환경/endpoint/통합 계층을 먼저 검증
- **실패 귀속 4단계 도입**: Environment → Endpoint/Serving → Harness/Model integration → Model behavior
- OpenAI 호환 여부를 feasibility gate가 아니라 **integration cost 지표**로 재정의(HYPOTHESIS-4)
- M0/M1 harness 비교 시 **동일 backend model 고정** 원칙 추가(원칙 6)
- [TOY_BENCHMARK_v0.md](../plan/TOY_BENCHMARK_v0.md)의 A~E 5개 task를 정식 반영, **Task B를 공통 Anchor Task로 지정**
- Milestone별 반복 횟수 정책 도입: M0 1회 정밀분석 / M1 1~2회 / M2 task당 3~5회
- M3를 "VS Code/Jupyter implementation"에서 "Internal Environment **Feasibility**"로 축소(구현이 아니라 가능성 확인)
- M4 scope를 pre-survey reading map 범위로 고정
- HYPOTHESIS 1~6을 모두 중립(null-hypothesis에 가까운) 형태로 재작성 — 특정 결론을 미리 가정하지 않도록
- M5 후보 4개(Pi SDK / Own / OpenHands / Hybrid)를 대칭적으로 서술, **Own 후보의 feasibility estimate를 M5 착수 조건으로 추가**
- **Adoption Gate(License/Security/Internal Policy) 신설** — decision log와 별개의 독립 게이트
- Evaluation metrics 확장: success rate, variance, malformed/repeated tool calls, integration cost, recovery, unintended modifications, human intervention
- Trading Agent System과의 프로젝트 문맥 완전 분리 명시
- concrete actions를 M0 실제 착수 기준 3개로 교체

**계기**: 이전 v0.1 초안이 "M4_PRESURVEY 4개 항목만 반영"이라는 좁은 지시로 작성되어, 그 이전에 합의된 광범위한 개정사항이 누락됨.

## v0.1 (최초, 폐기됨) — 2026-09-01

**변경**: [M4_PRESURVEY_v0.md](../report/M4_PRESURVEY_v0.md)의 결과 중 "M4에서 확인할 대상 / 읽지 않을 대상 / 아직 미확인인 사항 / Codex source-level 검증 필요 사항" 4가지만 10장(M4)에 반영. NOOA 정체 관련 open question 해소.

**원칙 확인**: pre-survey에서 관찰된 내용(특정 프로젝트 사례가 특정 hypothesis를 뒷받침한다는 서술 등)은 hypothesis 증거나 architecture 결론으로 승격하지 않음 — 14장(hypotheses)은 이 개정에서 변경 없음.

*이 버전은 범위가 좁다는 이유로 위 "v0.1 (개정판)"으로 즉시 대체됨.*

## v0 — 2026-09-01

**최초 작성**. 17개 장 구조(Goal / Non-goals / Working principles / External-Internal strategy / 역할분담 / M0-M2 / OpenHands·NOOA 연구 목적 / 공통 toy benchmark / Evaluation metrics / Architecture hypotheses H1-H6 / 결정 보류 항목 / Decision log 운영 / Experiment journal 형식 / Risk·open questions / Concrete actions).

같은 날 사용자 요청으로 **M0~M5 milestone 구조로 확장**(버전 번호 변경 없이 동일 v0 내 수정):
M0(Minimal Agent Loop) → M1(Structured Tool Harness) → M2(Internal Qwen Core Smoke) → M3(Internal Environment Extension) → M4(Architecture References) → M5(BASE Decision).

## Companion 문서 도입 이력

계획서 자체의 버전은 아니지만 같은 계획 체계에 속하는 보조 문서들:

| 문서 | 도입 시점(표기) | 목적 |
|---|---|---|
| [TOY_BENCHMARK_v0.md](../plan/TOY_BENCHMARK_v0.md) | 2026-09-01 | M0~M3 공통 toy task A~E 명세 |
| [ENV_CAPABILITY_CHECKLIST_v0.md](../plan/ENV_CAPABILITY_CHECKLIST_v0.md) | 2026-09-01 | M1.5 게이트(G1~G10) 상세 정의 |
| [M4_PRESURVEY_v0.md](../report/M4_PRESURVEY_v0.md) | 2026-09-01 | OpenHands/NOOA 공식 소스 기반 사전 조사, M4 reading map |
| [MODEL_SERVING_STRATEGY_v0.md](../plan/MODEL_SERVING_STRATEGY_v0.md) | 2026-09-03 표기 | 모델/serving 비교축 고정 — **명시적으로 PLAN을 수정하지 않는 독립 보조 문서** |
| [UPSTREAM_FIRST_POLICY.md](../architecture/UPSTREAM_FIRST_POLICY.md) | 2026-09-07 | Pi upstream-first 장기 유지보수 원칙 (PLAN v0.3에서 분리, 중복 방지) |

## 문서 체계 재구성 — 2026-09-07

프로젝트 루트에 흩어져 있던 문서를 `docs/plan/`, `docs/patchnote/`, `docs/report/`로 분리 정리. 상호 참조 링크 전부 재검증·수정 완료. 실험 raw 산출물(trajectory JSON, driver script, fixture)은 `experiments/`, `toy-tasks/`에 그대로 유지(문서와 분리).
