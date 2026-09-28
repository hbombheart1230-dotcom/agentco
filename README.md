# Coding Agent — 사내 Coding Agent 연구 프로젝트

Trading Agent System 등 다른 프로덕션 시스템과 무관한 독립 연구 트랙.

## Project Direction

**Pi Dev는 Pi upstream을 coding harness core로 쓰는 Enterprise Coding Harness / Distribution Layer다.** Coding Agent core 자체를 새로 만드는 프로젝트가 아니라, 사내 Windows 개발환경에서 안전하고 편리하게 쓸 수 있도록 다음을 제공하는 데 집중한다:

- Internal model configuration (사내 vLLM endpoint, GLM/Qwen model ID)
- Skills (재사용 가능한 지침/워크플로우) / Extensions (capability/enforcement)
- Security/policy, Authentication, Audit
- Distribution/Update (Launcher, Portal, approved-version 관리)
- Windows environment adaptation

Pi source 수정은 꼭 필요할 때만, 최후 수단으로 검토한다. 원칙 전체는 [docs/architecture/UPSTREAM_FIRST_POLICY.md](docs/architecture/UPSTREAM_FIRST_POLICY.md), 이 방향으로 바뀐 경위는 [docs/plan/decision_log.md](docs/plan/decision_log.md) DEC-008~013을 본다.

**지금 최우선 blocker**: Internal GLM response duplication 해결 — Portal/Launcher/새 Extension 구현보다 이게 먼저다 ([CODING_AGENT_PLAN_v0.4.md](docs/plan/CODING_AGENT_PLAN_v0.4.md) 13장).

**지금 상태가 궁금하면**: [docs/report/PROGRESS_SUMMARY_v0.md](docs/report/PROGRESS_SUMMARY_v0.md) 하나만 읽으면 됨.

## 폴더 구조

```
docs/
  plan/         계획 문서 — CODING_AGENT_PLAN(v0.2/v0.3 historical / v0.4 current), TOY_BENCHMARK, ENV_CAPABILITY_CHECKLIST, MODEL_SERVING_STRATEGY
  architecture/ 장기 유지보수 원칙 — UPSTREAM_FIRST_POLICY
  patchnote/    계획 문서 개정 이력
  report/       조사/진행상황 보고 — M4_PRESURVEY, PROGRESS_SUMMARY
experiments/    실험 journal(M0/M1) + raw trajectory/driver script + manual/TUI playground
toy-tasks/      공통 toy benchmark fixture (Task A~E)
internal/       사내 반입용 DEV/USER 패키지 (Pi upstream + native config + thin launcher, Pi 재구현 아님)
external/       vendored 공식 repo (mini-swe-agent, pi) — 이 프로젝트 코드 아님, 소스 미수정
decision_log.md (docs/plan/) 확정된 결정 기록
```

## 시작점

1. 방향/원칙: [docs/architecture/UPSTREAM_FIRST_POLICY.md](docs/architecture/UPSTREAM_FIRST_POLICY.md)
2. 현재 실행 계획: [docs/plan/CODING_AGENT_PLAN_v0.4.md](docs/plan/CODING_AGENT_PLAN_v0.4.md) (이전 계획은 [v0.3](docs/plan/CODING_AGENT_PLAN_v0.3.md), [v0.2](docs/plan/CODING_AGENT_PLAN_v0.md) — 둘 다 historical)
3. 지금까지 뭘 했는지: [docs/report/PROGRESS_SUMMARY_v0.md](docs/report/PROGRESS_SUMMARY_v0.md)
4. 결정 이력: [docs/plan/decision_log.md](docs/plan/decision_log.md)
5. 계획 변경 이력: [docs/patchnote/PATCHNOTE.md](docs/patchnote/PATCHNOTE.md)

## 주의

- `.env`에는 이 프로젝트가 실제로 쓰는 `OPENROUTER_*`만 둔다. 무관한 credential은 `.env.naver`처럼 별도 파일로 분리한다.
- `external/`은 공식 repo를 그대로 clone한 것 — 이 디렉터리의 파일을 직접 수정하지 않는다.
- `internal/pi-dev-user/`는 실제 사내 secret이 들어가면 안 되는 placeholder 상태로 배포한다 — `<INTERNAL_VLLM_ENDPOINT>` 등 3개 placeholder는 [SET_INTERNAL_VALUES.md](internal/pi-dev-user/config/SET_INTERNAL_VALUES.md) 안내대로 사내에서만 교체한다.
