# M1 — Pi source trace journal

> 표기 원칙: `Claude source inspection` (독립 검증 아님, Codex cross-check 대상으로 남김). 아직 Anchor Task B 실행 전 — Phase 1 (source trace)만 기록.

## Source Inspection 1 — 2026-09-03

- **대상**: Pi 공식 repository, 실제 실행 전 사전 조사
- **방법**: 공식 repo를 실제 clone하여 source 직접 확인 (README 요약이 아님)
  - Clone 위치: `external/pi/` (이 프로젝트 저장소 코드가 아님)
  - Repository: https://github.com/earendil-works/pi (구 `badlogic/pi-mono` / `@mariozechner/*`에서 이전, 2026-05-경)
  - Clone 시점 commit: `4e69b0c28060f0f02fbe38bfa7c21a2e2eb25057` (2026-09-02, "feat(ai): preserve Anthropic per-turn thinking effort")
  - coding-agent 패키지 버전: `@earendil-works/pi-coding-agent` 0.84.4
  - **Node.js/npm이 이 머신에 미설치** — `node`/`npm` 명령 모두 not found. 실제 실행 전 설치 필요 (M1 실행 시 별도 blocker로 취급).

핵심 구조 요약은 최종 보고(대화 응답)에 상세 기술. 이 파일은 재현을 위한 최소 fact만 기록:

- Monorepo: `packages/agent`(core, framework-agnostic), `packages/ai`(model/provider), `packages/coding-agent`(CLI, tools, session)
- Core loop: `packages/agent/src/agent-loop.ts` (`runAgentLoop`/`runLoop`) — 현재도 중심 파일 맞음, 순수 함수형 event-emitting loop
- Stateful wrapper: `packages/agent/src/agent.ts`의 `Agent` 클래스 — 공식 docstring: "Stateful wrapper around the low-level agent loop"
- Session: `packages/coding-agent/src/core/agent-session.ts`의 `AgentSession` — Agent 위에 세션 영속화/압축/bash 실행/확장 붙임
- Composition root: `packages/coding-agent/src/core/sdk.ts`의 `createAgentSession()`
- Tools: read/bash/powershell/edit/write/grep/find/ls 전부 실존 (`core/tools/*.ts`)
- **기본 활성 tool: `["read", "bash", "edit", "write"]`(`sdk.ts:256`) — OS 무관 고정값. powershell은 opt-in.**
- Windows: `docs/windows.md` 공식 문서로 bash(Git Bash 우선)/powershell(pwsh 우선, 없으면 5.1 fallback) 명시적으로 문서화됨.
- OpenRouter: `packages/ai/src/providers/openrouter.ts` 1급 지원, `OPENROUTER_API_KEY` env var, baseUrl `https://openrouter.ai/api/v1`. GLM은 생성된 카탈로그(`openrouter.models.ts`)에 없으나 `model-resolver.ts`가 "custom model id" fallback 경로를 명시적으로 지원.

---

## Runtime Smoke — 2026-09-07 (M1 Phase 2)

- **환경**: Node.js v24.20.0(공식 ZIP, user-local install), npm 11.19.0, Pi `0.84.4` (동일 clone/build, commit `4e69b0c2806...`)
- **Driver**: [experiments/pi-smoke/smoke.mjs](pi-smoke/smoke.mjs) — Pi SDK(`createAgentSession`)만 사용, source 미수정, `agentDir` 실험-로컬 격리, `SessionManager.inMemory()`로 세션 파일 미생성, GLM Model 객체를 in-memory로 직접 구성(models.json 불필요), 인증은 `OPENROUTER_API_KEY` 환경변수 1개만 `.env`에서 로드(다른 키 미접근), bash/powershell tool 자체를 등록하지 않음(credential 상속 경로 원천 차단).
- **Smoke A(model-only, tools 없음)**: PASS — 1 turn, 1.7s, `stopReason: "stop"`, `finalText === "PI_GLM_SMOKE_OK"` 정확히 일치.
- **Smoke B(structured `read` tool만)**: PASS — 2 turns, 9.8s, GLM이 `read({"path":"marker.txt"})` structured tool call을 정확히 생성 → Pi가 정상 parse/실행 → toolResult 반환 → GLM이 tool call 없이 최종 응답. Malformed/parallel tool call 없음.
- **Cost 필드는 0으로 표시되나 실제 billing 무료를 의미하지 않음** — 이 스크립트가 GLM에 대해 `cost: {input:0,output:0,...}`를 placeholder로 직접 넣었기 때문(source에 실제 GLM 요금 데이터가 없어서). 실제 token usage(Smoke A: 415 total, Smoke B: 745 total)는 OpenRouter가 반환한 진짜 값.

---

## Anchor Task B — 2026-09-07 (Run 1)

- **Driver**: [experiments/pi-anchor-b/run_anchor_b.mjs](pi-anchor-b/run_anchor_b.mjs), raw trajectory: [experiments/pi-anchor-b/anchor_b_run1.json](pi-anchor-b/anchor_b_run1.json)
- **Tools**: `read`, `edit`, `powershell` only (no bash, no write). `powershell` registered via official `customTools` + `PowerShellSpawnHook` to scrub `OPENROUTER_API_KEY`/`OPENROUTER_BASE_URL`/`NAVER_CLIENT_ID`/`NAVER_CLIENT_SECRET` — pre-flight hook-logic check passed (키 제거됨, 무관한 변수 보존됨), 실제 secret 값 출력 안 함.
- **Result**: Task Correctness **PASS**, Harness Completion **NORMAL_FINAL**(자연 종료, tool call 없는 최종 응답). 6 turns, 6 tool executions(powershell×3, read×2[parallel], edit×1), 0 실패, 0 recovery, 50.7s, usage total 9905 tokens, **cost: UNKNOWN(placeholder)**.
- **Diff**: 정확히 1줄(`return high`→`return low`), docstring/줄바꿈 완전 보존 — mini-SWE Run 1/Run 2보다 더 깨끗함.
- **`edit` tool 사용**: `oldText`에 `if value < low:\n        return high`처럼 충분한 문맥을 포함해 uniqueness 확보, 1회 시도로 즉시 성공 (Phase 1 예측과 정확히 일치).
- **주목할 행동 차이**: 이 모델은 **fix 전에 pytest로 실패를 empirically 재현하지 않았다** — 코드를 두 번 읽은 뒤(turn 3) 정적 비교만으로 버그를 특정하고 바로 edit(turn 4), pytest는 fix **이후** 1회만 실행해 확인(turn 5). mini-SWE 두 run은 항상 먼저 pytest로 실패를 재현했음 — 이 차이가 prompt 차이 때문인지 Pi의 기본 system prompt 때문인지 GLM 성향 때문인지는 미확인(아래 Unknown).
- **잔존 encoding 이슈**: turn 5의 pytest 출력에 Windows 사용자명(한글)이 여전히 mangled로 표시됨(`ȫ��...`) — Pi의 PowerShell tool이 적용하는 UTF8 콘솔 인코딩 prefix로도 이 특정 경로 문자열은 고쳐지지 않음. 단, mini-SWE의 손상(치환문자 `�`로 완전 파괴)보다는 덜 심각하고, 이번 run에서 실제 동작에 영향 없음(순수 표시 문제).

### Unknown / Needs Runtime Verification

- GLM 5.3 Flash가 커스텀 모델로 등록될 때 `api` 타입(`anthropic-messages` vs `openai-completions`)을 어떻게 지정해야 하는지 — `docs/models.md`의 custom model 설정 세부는 이번 조사에서 완전히 추적하지 않음
- edit tool의 "oldText가 파일에서 unique하지 않을 때" 정확한 에러 메시지 문자열 — 스키마 설명("must be unique")으로 요구사항은 확인했으나 실제 에러 문구는 미확인
- Node.js 22.19+ 설치 후 실제 `pi` CLI/SDK가 이 Windows 머신에서 정상 기동하는지
