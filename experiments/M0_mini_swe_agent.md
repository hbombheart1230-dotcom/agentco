# M0 — mini-SWE-agent experiment journal

> 실행 주체 표기 원칙(임시): Codex credit 제약으로 M0/M1은 당분간 Claude Code 단독 진행. Claude가 source를 직접 확인한 사실은 `Claude source inspection`으로 표기하며, **독립 검증(Codex cross-check)된 사실이 아니다.** M5 BASE Decision에 영향을 주는 중요 architecture 사실은 추후 Codex 또는 별도 독립 verification 대상으로 남긴다.

---

## Source Inspection 1 — 2026-09-01

- **표기**: `Claude source inspection` (독립 검증 아님)
- **대상**: mini-SWE-agent 공식 repository, toy task 실행 전 사전 조사
- **방법**: 공식 repo를 로컬에 실제 clone하여 source 직접 확인 (README 요약이 아님)
  - Clone 위치: `external/mini-swe-agent/` (`.gitignore` 대상 — 이 프로젝트 저장소 코드가 아님)
  - Repository: https://github.com/SWE-agent/mini-swe-agent
  - Clone 시점 commit: `25941c89cfbc91eb40b3f8756348c91d9977d57e` (2026-08-17, "chore: update pre-commit hooks (#917)")
  - 소스상 버전 문자열: `__version__ = "2.4.6"` (`src/minisweagent/__init__.py`)

### 결과 요약

| 항목 | 내용 |
|---|---|
| Install | `pip install mini-swe-agent` / `uvx mini-swe-agent` / `pipx run mini-swe-agent` / editable: `pip install -e .` (Python ≥3.10) |
| Run entry point | console script `mini`/`mini-swe-agent` → `minisweagent.run.mini:app`; `mini-extra`/`mini-e` → `minisweagent.run.utilities.mini_extra:main` |
| Model 추상화 위치 | `src/minisweagent/models/__init__.py` (`get_model`, `get_model_class`, `_MODEL_CLASS_MAPPING`), `Model` Protocol은 `src/minisweagent/__init__.py` |
| Model API call chain | `DefaultAgent.run→step→query` (`agents/default.py`) → `self.model.query(self.messages)` → (default) `LitellmModel._query`가 `litellm.completion(...)` 호출, 또는 (model_class="openrouter" 지정 시) `OpenRouterModel._query`가 `requests.post("https://openrouter.ai/api/v1/chat/completions", ...)` 직접 호출 |
| OpenRouter 지원 | 지원됨 — 전용 `OpenRouterModel` 클래스(`models/openrouter_model.py`) 존재, 공식 docs에 사용 예시 있음. `model_class: "openrouter"` + `model_name: "<provider>/<model>"` + `OPENROUTER_API_KEY` |
| GLM 5.3 Flash (`z-ai/glm-5.3-flash`) feasibility | 구조적으로 가능해 보임(문자열 그대로 API payload에 전달, 코드상 모델명 allowlist 없음) — **실행으로 확인된 사실 아님, TO VERIFY** |
| Source modification 필요 여부 | 현재 source 판독으로는 불필요해 보임(config만으로 연결 가능) — **이 결론도 TO VERIFY, 실행 전 확정 아님** |

### 세부 답변 (10개 질문)

1. **공식 repository / 현재 commit**: https://github.com/SWE-agent/mini-swe-agent, commit `25941c89c`, `__version__ = "2.4.6"`.
2. **설치 방법**: `pip install mini-swe-agent`(PyPI), `uvx mini-swe-agent`, `pipx run mini-swe-agent`, 개발용 `git clone` + `pip install -e .` (README.md:159-175, docs/quickstart.md).
3. **실행 entry point**: `pyproject.toml [project.scripts]` — `mini = "minisweagent.run.mini:app"` 등. 실제 진입 함수는 `src/minisweagent/run/mini.py`의 `main()` (typer 커맨드) — config 조립 후 `get_model` → `get_environment` → `get_agent` → `agent.run(task)`.
4. **Model abstraction 위치**: `src/minisweagent/models/__init__.py`. `Model` Protocol(`query`, `format_message`, `format_observation_messages`, `get_template_vars`, `serialize`)은 `src/minisweagent/__init__.py`에 정의. 구체 클래스는 `models/litellm_model.py`(기본값), `litellm_textbased_model.py`, `litellm_response_model.py`, `openrouter_model.py`, `openrouter_textbased_model.py`, `openrouter_response_model.py`, `portkey_model.py`, `portkey_response_model.py`, `requesty_model.py`.
5. **실제 Model API call path**: `DefaultAgent.run()`(`agents/default.py`) → `step()` → `query()` → `self.model.query(self.messages)`. 기본 경로(`LitellmModel`)는 `litellm.completion(model=..., messages=..., tools=[BASH_TOOL], ...)` 호출. `model_class: openrouter` 지정 시 `OpenRouterModel`이 litellm을 거치지 않고 `requests.post`로 `https://openrouter.ai/api/v1/chat/completions`를 직접 호출. 응답의 `tool_calls`는 `_parse_actions()`가 파싱해 `execute_actions()`에서 `env.execute()`로 실행됨.
6. **지원 provider 방식**: (a) 기본값 `litellm` 클래스 — litellm 자체의 provider 라우팅에 위임(코드 내 별도 처리 없음, litellm 라이브러리 동작은 mini-swe-agent 밖의 영역이라 이 조사에서 직접 확인하지 못함), (b) 전용 `openrouter` 클래스 — OpenRouter REST API 직접 호출, (c) `portkey`, `requesty` 등 별도 전용 클래스.
7. **OpenRouter 사용 가능 여부**: 가능. 전용 `OpenRouterModel` 클래스가 존재하며 공식 docs(`docs/models/quickstart.md`, `docs/reference/models/openrouter.md`)에 다수 사용 예시(`model_class: openrouter` + `model_name: "<provider>/<model>"`) 확인. 인증은 `OPENROUTER_API_KEY` 환경변수(`openrouter_model.py:61`).
8. **`z-ai/glm-5.3-flash` backend 사용 가능 여부**: docs의 예시들(`moonshotai/kimi-k2-0905`, `google/gemini-3-pro-preview`, `minimax/minimax-m2`)과 동일한 `<provider>/<model-slug>` 포맷이며, `OpenRouterModel._query()`는 `model_name`을 그대로 API payload의 `"model"` 필드에 넣을 뿐 allowlist 검증이 없음(`openrouter_model.py:70`) — 구조적으로는 특별한 처리 없이 통과할 것으로 보임. **단, 실제 OpenRouter가 이 식별자를 인식하고 tool_calls를 포함한 응답을 반환하는지는 미실행 상태 — TO VERIFY.** 추가로, `_calculate_cost()`(`openrouter_model.py:119-130`)가 OpenRouter 응답에 유효한 cost(>0) 정보가 없으면 `RuntimeError`를 던지도록 되어 있어, GLM 5.3 Flash의 cost 리포팅이 비정상이면 `MSWEA_COST_TRACKING=ignore_errors` 없이는 실행이 죽을 수 있음 — 실행 전 리스크로 기록.
9. **필요한 environment variable/config**: `OPENROUTER_API_KEY`(필수, openrouter 사용 시), `MSWEA_MODEL_NAME`(기본 모델명), `MSWEA_COST_TRACKING`(cost 리포팅 실패 시 `ignore_errors`로 우회 가능), `MSWEA_GLOBAL_CONFIG_DIR`/`MSWEA_SILENT_STARTUP`/`MSWEA_CONFIGURED`(부트스트랩), `MSWEA_GLOBAL_COST_LIMIT`/`MSWEA_GLOBAL_CALL_LIMIT`(선택적 지출 상한). 최초 실행 시 `MSWEA_CONFIGURED`가 없으면 대화형 setup wizard(`configure_if_first_time()`, `run/mini.py:68`)가 실행됨 — 비대화형으로 M0를 돌리려면 사전에 `.env`/환경변수로 채워두거나 `mini-extra config setup`을 먼저 1회 실행해야 함.
10. **OpenRouter 연결을 위한 source modification 필요 여부**: 현재 source 판독으로는 **불필요** — config(`model_name`, `model_class: openrouter`) + 환경변수만으로 연결 가능해 보임. 이 결론은 Claude의 source 판독 결과이며, 실제 실행/Codex cross-check로 아직 확인되지 않았다.

### Files / Functions Inspected

- `pyproject.toml` (dependencies, `[project.scripts]`, extras)
- `src/minisweagent/__init__.py` (`Model`/`Environment`/`Agent` Protocol, `global_config_dir`, 버전)
- `src/minisweagent/models/__init__.py` (`get_model`, `get_model_name`, `get_model_class`, `_MODEL_CLASS_MAPPING`, `GlobalModelStats`)
- `src/minisweagent/models/openrouter_model.py` (`OpenRouterModel`, `OpenRouterModelConfig`, `_query`, `query`, `_calculate_cost`, `_parse_actions`)
- `src/minisweagent/models/litellm_model.py` (`LitellmModel`, `_query`, `query`, `_calculate_cost`, `_parse_actions`)
- `src/minisweagent/agents/default.py` (`DefaultAgent.run/step/query/execute_actions/serialize/save`, `AgentConfig`)
- `src/minisweagent/run/mini.py` (`main()`, entry point 조립 로직)
- `src/minisweagent/run/utilities/config.py` (`configure_if_first_time`, `setup`, `set`/`unset`/`edit`, `.env` 관리)
- `src/minisweagent/config/mini.yaml` (기본 agent/environment/model 설정 — model_name/model_class는 미지정)
- `AGENTS.md` (프로젝트 구조/스타일 가이드 — repo 공식 문서)
- `docs/models/quickstart.md` (OpenRouter/Portkey/litellm 설정 예시, model class 설명)
- `docs/reference/models/openrouter.md`, `docs/reference/models/overview.md` (OpenRouterModel/Textbased/Response 3종 비교)
- `README.md`, `docs/quickstart.md` (install 방법)

---

## Source Inspection 2 — 2026-09-01 (setup for Anchor Task B run)

- **표기**: `Claude source inspection` (독립 검증 아님)

### 실행 준비 중 발견한 사실

1. **`pip install -e .` 성공** (editable install, `external/mini-swe-agent`), `python -m minisweagent` import 시 버전 `2.4.6` 정상 확인.
2. **환경 이슈 발견 (Environment/Harness 계층)**: `mini` CLI(`run/mini.py`)를 이 세션의 비대화형 셸(Bash tool, 실제 TTY 없음)에서 실행하면 `minisweagent.agents.utils.prompt_user` 모듈이 **import 시점에 무조건** `prompt_toolkit.PromptSession()`을 생성하다 크래시한다 (`prompt_user.py:8-9`). `-t`/`--task`를 지정해도, `--yolo`를 써도 회피되지 않는다 — 이 모듈은 `run/mini.py`가 무조건 import하기 때문이다.
   - **귀속**: 이것은 Model 문제도 Serving 문제도 아니다. Harness가 "TTY 없는 자동화 환경에서 non-interactive 실행"을 1급으로 지원하지 않는다는 **Environment/Harness 통합 계층**의 사실이다 (MODEL_SERVING_STRATEGY_v0.md 3장 4계층 구분).
   - **대응**: `run/mini.py`를 우회하고, 공식 `hello_world.py` 예제와 동일한 패턴(=공개 Python API를 직접 호출)으로 `DefaultAgent` + `OpenRouterModel` + `LocalEnvironment`를 조립하는 driver script(`experiments/run_m0_task_b.py`)를 작성했다. mini-swe-agent **소스 자체는 수정하지 않았다** — 공식적으로 문서화된 사용 패턴(python bindings)을 그대로 따른 것이다.
3. **부수 관찰(미확인, 우선순위 낮음)**: `hello_world.py`가 기본으로 로드하는 `config/default.yaml`의 system/instance template은 텍스트 기반 액션 파싱(```mswea_bash_command``` 코드블록)을 지시하는 문구인데, `hello_world.py`가 실제로 쓰는 `LitellmModel`의 `_parse_actions`는 structured tool-calling(`response.choices[0].message.tool_calls`)만 읽는다 — 프롬프트 문구와 실제 파싱 메커니즘이 불일치해 보인다. 이번 실행에서는 이 경로를 쓰지 않고 대신 `mini.yaml`(structured tool-calling 문구와 일치)을 사용해 이 이슈를 우회했다. **이 관찰 자체도 미검증이며, 직접 문제를 겪은 것은 아니다** — 이후 Codex cross-check 대상으로만 기록.

### 실행 설계 (아직 미실행)

- Driver: `experiments/run_m0_task_b.py`
- Model: `OpenRouterModel(model_name="z-ai/glm-5.3-flash")`
- Config 출처: `mini.yaml`의 `agent` 섹션 (실제 `mini` CLI 기본 설정과 동일한 system/instance template)
- 안전장치(이번 첫 유료 실행이므로 보수적으로 설정): `cost_limit=$0.50`, `step_limit=15`, `mode="yolo"`(비대화형이라 confirm 프롬프트 불가)
- **차단 요인**: `OPENROUTER_API_KEY` 미설정 — 사용자 확인/입력 대기 중

---

## Run 1 — 2026-09-03

- **Harness / model**: mini-SWE-agent `DefaultAgent` (via `experiments/run_m0_task_b.py` python-bindings driver, `mini` CLI 우회) / `OpenRouterModel(model_name="z-ai/glm-5.3-flash")` — GLM 5.3 Flash via OpenRouter
- **Toy task**: B (Fix the Failing Test) — Anchor Task, 1회 (M0 반복 정책: 1회 정밀분석)
- **Environment**: 외부 PC (M0). **단, `LocalEnvironment`가 `subprocess.Popen(..., shell=True)`로 명령을 실행하며 이 Windows 호스트에서는 그게 `cmd.exe`로 풀린다 — mini.yaml의 system/instance prompt는 bash를 전제로 작성되어 있어(heredoc, `sed -i`, MacOS 분기는 있어도 cmd.exe 분기는 없음) 실제 실행 shell과 프롬프트 전제가 불일치했다.**
- **Result**: **과제 목표(실패 테스트 통과) 기준 PASS** — `pkg/calc.py` 정확히 1줄 수정(`return high`→`return low`, human ground-truth와 완전히 일치), `tests/test_calc.py` 미변경, 최종 `pytest` 1 passed, 잔여 파일 없음(중간 생성한 `check_tmp.py`는 agent가 스스로 정리). **단 harness-level `exit_status`는 `Submitted`가 아니라 `LimitsExceeded`** — step_limit(15) 도달로 강제 종료, `echo COMPLETE_TASK_AND_SUBMIT_FINAL_OUTPUT`을 issue하지 못함. Pass/fail을 이분법으로 기록하기 부적절해 두 축으로 분리 기록함.
- **Tool-call count / turns**: 15 api_calls (step_limit 도달, 정확히 상한까지 소진), 43 messages
- **Wall-clock time**: 116.9초 (trajectory 메시지 timestamp 기준 역산)
- **Malformed / repeated tool calls**: tool-call 스키마 자체의 malformed는 관찰되지 않음(매 turn 정상적으로 `tool_calls` 파싱됨). 다만 **shell 명령이 여러 번 실패**(heredoc 3회, `;` 구분자, quoting 실험 등) — 이건 tool-call 포맷 오류가 아니라 명령 내용이 실행 환경(cmd.exe)과 안 맞아서 생긴 실패.
- **Unintended modifications**: N — `tests/test_calc.py` 미변경 확인(git diff 대신 파일 diff로 직접 확인, 프로젝트가 git repo 아님). 최종 작업 디렉토리에 의도치 않은 잔여 파일 없음.
- **Human intervention count**: 0 — 실행 중 개입 없음. (단, driver script 작성/버그 수정(mode 필드 제거, secret 스크럽)은 실행 전 준비 단계였음, 실행 자체에는 개입 없음)
- **Notable behavior**:
  - 버그를 정확히 특정(“clamp returns high instead of low”)하고 올바르게 수정하는 데는 전체 15턴 중 절반이 채 안 걸림(대략 9턴 이내 수정+1차 검증 완료).
  - 이후 "엣지 케이스 검증"(mini.yaml 권장 워크플로우 5단계와 일치하는 신중한 행동)을 시도하다 **Windows cmd.exe와 bash 전제 프롬프트의 불일치**로 heredoc/따옴표/구분자 실패를 반복 겪음 — 결국 `python -c "<한 줄짜리 표현식>"` 형태로 우회에 성공해 9개 엣지케이스 전부 통과를 확인했지만, 이 우회 과정 자체가 step 예산(15)의 상당 부분을 소모함.
  - 최종 재확인(디렉토리 정리 + 전체 재실행)까지 마쳤으나 그 시점에 step_limit에 걸려 formal submit 직전에 강제 종료됨.
  - **결론적으로 이번 run의 "실패"(LimitsExceeded)는 model behavior 문제가 아니라 Environment/Harness 계층 문제로 귀속된다** (MODEL_SERVING_STRATEGY_v0.md 3장 4계층 구분 적용 — Environment: Windows/cmd.exe vs bash 전제 prompt 불일치가 근본 원인, Model behavior: 코드 수정 자체는 정확했음).
- **Hypothesis impact**:
  - 기존 H1~H7 어디에도 정확히 대응하지 않는 **새로운 관찰** — "harness의 prompt template이 실행 host의 실제 shell을 가정하고 있고, 이 가정이 깨지면(Windows/cmd.exe) model behavior와 무관하게 step 예산이 낭비된다"는 사실. M3(Internal Environment Feasibility)와 15장(Integration cost metric)에 관련 있을 수 있음 — 사내 VS Code 가상 개발환경의 실제 shell(bash/WSL/cmd.exe)을 M1.5/M3에서 미리 확인할 필요가 있다는 시사점. **CODING_AGENT_PLAN_v0.md나 ENV_CAPABILITY_CHECKLIST_v0.md에 이 항목을 추가할지는 별도 논의 대상 — 이 turn에서 임의로 그 문서들을 수정하지 않음.**

---

## M0-FINDING-01 — Shell contract mismatch

> Model-facing shell contract와 actual execution shell semantics가 일치하지 않으면, 모델이 task를 올바르게 해결하더라도 command failure/recovery가 반복되어 agent efficiency와 termination reliability가 악화될 수 있다.

**증거 (Run 1 source trace 기준)**:
- `mini.yaml`의 `instance_template`은 "You can execute **bash** commands"라고 명시하고, `<system_information>`에는 `{{system}} {{release}} {{version}} {{machine}}`(→ 실제 렌더링: `Windows 11 10.0.26200 AMD64`)을 그대로 노출한다. 즉 harness는 host가 Windows임을 스스로 알고 있었지만(Environment 정보를 이미 template 변수로 갖고 있었음), 그 정보를 shell-syntax 안내에 반영하지 않았다.
- 같은 템플릿에 `{% if system == "Darwin" %}...{% endif %}` 분기(sed -i 따옴표 차이 경고)는 있지만 **Windows 분기는 없다.** heredoc 예시(`cat <<'EOF' > newfile.py ... EOF`)는 OS 조건 없이 "Useful command examples"로 제시된다.
- Tool 자체도 `BASH_TOOL = {"function": {"name": "bash", "description": "Execute a bash command", ...}}`(`models/utils/actions_toolcall.py`)로, API 레벨에서도 "bash"임을 명시한다.
- `LocalEnvironment._run()`(`environments/local.py`)은 `subprocess.Popen(command, shell=True, ...)`을 `executable=` 지정 없이 호출한다. Python stdlib 표준 동작상 Windows에서는 이것이 `cmd.exe`로 풀린다.
- 결과: 모델이 프롬프트가 지시한 대로(bash 관용구) 명령을 냈고, 실제 실행은 cmd.exe가 담당해 `/dev/null`, heredoc, `;` 구분자가 실패했다 (Run 1 trajectory에서 3개 대표 사례로 재현 확인 — 아래 "Failure → Recovery" 참고).

**Failure attribution**: 단순 `Model Failure` 아님. **Environment(host가 Windows라는 사실) × Harness environment contract(prompt/tool 템플릿이 bash를 가정하면서 Windows 분기가 없고, `LocalEnvironment`가 host 기본 shell에 위임하는 설계)의 interaction.** host가 Linux였다면 같은 harness 코드로도 문제가 없었을 것이고(Environment 단독 요인 아님), harness가 Windows 분기를 뒀다면 같은 Windows host에서도 문제가 없었을 것(Harness 단독 요인도 아님) — 두 조건이 겹칠 때만 발생.

## Security Observation — credential inheritance (architecture decision 아님, 관찰만)

> Model API credential(harness 프로세스가 필요로 하는 `OPENROUTER_API_KEY`)이 agent가 실행하는 subprocess에 자동으로 상속되어서는 안 된다.

**근거**: `LocalEnvironment.execute()`(`environments/local.py`)는 `_run(command, cwd, os.environ | self.config.env, timeout)`을 호출한다 — 즉 **harness 프로세스의 전체 `os.environ`이 agent가 실행하는 모든 bash 명령에 기본적으로 그대로 전달된다.** `OpenRouterModel.__init__`이 `os.getenv("OPENROUTER_API_KEY")`를 읽는 것과 같은 프로세스 공간이므로, 별도 조치가 없으면 agent가 `env`나 `echo $OPENROUTER_API_KEY` 같은 명령을 (의도적이든 우연이든) 실행할 경우 그 값이 tool observation → model context → trajectory 파일에 그대로 노출될 수 있는 경로가 **harness 기본 동작상 존재한다.**
이번 Run 1에서는 `experiments/run_m0_task_b.py`가 `OpenRouterModel` 생성 직후 `os.environ`에서 `OPENROUTER_API_KEY`(및 이 프로젝트 `.env`에 같이 있던 무관한 `NAVER_*` 키)를 명시적으로 제거한 뒤 `LocalEnvironment`/`agent.run()`을 호출하는 방식으로 **이번 실행에 한해 우회**했다 — mini-swe-agent 소스 자체는 수정하지 않았다.
**이것을 architecture decision으로 승격하지 않는다** — 지금은 "이런 경로가 존재한다"는 관찰과, 이번 run에서 어떻게 임시로 피했는지만 기록한다.

---

## Product Requirements (기록만 — CODING_AGENT_PLAN_v0.1 미수정)

> 2026-09-03 확정된 Product Goal에 따라 기록. Trading Agent System과 무관.

```
사내 Windows PC (VS Code + Coding Agent Harness, primary execution)
      │ HTTP/API
      ▼
사내 Linux Server (vLLM: GLM 5.3 Flash / Qwen 3.8 Flash, serving만 담당)
```

- **PR-ENV-01 — Windows-first execution**: Coding Agent의 primary execution environment는 사내 Windows development PC다.
- **PR-SERVING-01 — Remote internal model serving**: LLM inference는 primary scenario에서 사내 Linux server의 vLLM endpoint를 통해 수행한다.
- **PR-INSTALL-01 — Simple client installation**: 일반 사용자가 Coding Agent를 사용하기 위해 WSL/Docker/Linux environment를 필수로 설치하지 않는 것을 목표로 한다.
- **PR-LINUX-01 — Linux execution is secondary**: Linux에서 Coding Agent 자체를 실행하는 것은 지원 가능성을 열어두되 현재 primary product requirement가 아니다.

**영향**: 이전 turn에서 조사한 "Windows/cmd Run 1 vs Linux/bash Run 2" 비교는 PR-ENV-01/PR-INSTALL-01과 우선순위가 맞지 않아 당분간 실행하지 않는다. WSL/Docker feasibility 조사 결과(WSL2는 설치되어 있으나 범용 배포판 없음 — docker-desktop 전용 배포판만 존재, Docker Desktop은 이미 가동 중이며 Trading Agent System의 실제 운영 컨테이너와 호스트를 공유함)는 **기록으로만 보존**하고, PR-LINUX-01이 우선순위를 얻기 전까지 실행하지 않는다.

**Future Design Consideration (구현 아님, 원칙 후보로만 기록)**:
```
Agent Core
   │
   ├─ read/edit/search → 가능한 cross-platform structured tools
   │
   └─ shell → environment-specific explicit executor
                 ├─ Windows: PowerShell
                 └─ Linux: bash
```
M0에서는 구현하지 않으며, M5 BASE Decision 이전에 architecture로 확정하지 않는다.

---

## Run 2 — 2026-09-03

- **Harness / model**: mini-SWE-agent `DefaultAgent` (via `experiments/run_m0_task_b_run2.py`) / `OpenRouterModel(model_name="z-ai/glm-5.3-flash")` — 동일
- **Toy task**: B (Anchor Task), 1회만 실행 (Run 1과 동일 정책)
- **M0 experimental workaround (production 아님)**: (1) driver script에서 `os.environ["COMSPEC"]`를 `powershell.exe`로 설정(실행 계약), (2) `mini.yaml` 기반 system/instance template을 PowerShell 지향으로 교체(모델 계약), (3) `minisweagent.models.openrouter_model.BASH_TOOL`을 모듈 attribute rebind로 description만 교체("Execute a PowerShell command", `name`은 `actions_toolcall.parse_toolcall_actions`의 하드코딩된 검증 때문에 `"bash"` 유지 — "가능한 범위" 내 최소 변경). **mini-SWE-agent 소스 파일은 전혀 수정하지 않음.**
- **Control variables**: commit `25941c89c`, `DefaultAgent`, GLM 5.3 Flash, OpenRouter, Anchor Task B, 동일 fixture(Run 2 실행 전 buggy state로 리셋 확인), `cost_limit=$0.50`, `step_limit=15`, credential scrub 동일 유지.
- **Result**: **`exit_status: Submitted`** (Run 1: `LimitsExceeded`). Task correctness PASS — `pytest` 1 passed, `tests/test_calc.py` 미변경, 잔여 파일 없음. **단, `pkg/calc.py` diff가 Run 1보다 크다**: 의도된 1줄 수정(`return high`→`return low`) 외에 docstring이 `"""..."""` → `"..."`로, 마지막 줄에 CRLF가 섞여 들어감(전체 라인 수는 동일, 최소 diff 원칙에서는 다소 벗어남 — 아래 New Finding Candidates 참고).
- **Tool-call count / turns**: 9 api_calls (Run 1: 15), 22 messages
- **Wall-clock time**: 65.6초 (Run 1: 116.9초)
- **Cost**: $0.0010 (Run 1: $0.0020)
- **Malformed / repeated tool calls**: 0/9 malformed(모든 call이 정상 파싱됨, Run 1과 동일). Shell 수준 실패는 2건(quoting/`;`-nested-argument 계열) — Run 1의 3개 실패 유형(heredoc·`;`·`/dev/null`)과 겹치지 않는, 더 좁은 범위의 새로운 실패 유형.
- **Unintended modifications**: 기능적으로는 없음(test 파일 미변경, 잔여 파일 없음)이나, calc.py의 diff가 최소 수정 범위를 살짝 벗어남(위 Result 참고) — "unintended"로 분류하되 심각도는 낮음.
- **Human intervention count**: 0
- **Hypothesis impact**: M0-FINDING-01 지지 증거 추가 (아래 평가 참고).

### New Finding Candidates (architecture decision 아님)

- Nested-quote/`;`-포함 인용 인자 전달 시 여전히 깨짐(`python -c "a; b"` 형태) — PowerShell 자체 다중 명령 체이닝(`cmd1; cmd2`)은 정상이지만, 외부 프로그램에 전달되는 인용된 인자 내부의 `;`는 별개 문제로 재발.
- 동일 계열로 보이는 현상: PowerShell single-quoted here-string(`@'...'@`) 내부의 리터럴 큰따옴표가 한 차례 소실됨 — outer `shell=True`→`/c "..."` 전달 계층과 관련된 것으로 추정(미확정).
- `Set-Content -Value @'...'@`로 파일 전체를 재작성하는 방식이, 의도한 1줄 수정 외에 docstring 포맷/줄바꿈 문자에 부수적 변화를 일으킴 — targeted in-place 편집(`-replace`) 예시를 제공했음에도 모델이 전체 재작성을 선택함.
- 인코딩(한글 mangled) 현상 1회 재발 — Run 1과 동일 계열, 새로운 건 아님.
- COMSPEC 전역 mutate로 인한 부작용은 관찰되지 않음.

### Unknown / Needs Runtime Verification

- `z-ai/glm-5.3-flash`가 OpenRouter 카탈로그에 실제로 이 식별자로 존재하는지 (MODEL_SERVING_STRATEGY_v0.md 1장 TO VERIFY와 동일 항목)
- OpenRouter가 이 모델에 대해 `tool_calls` 형식의 응답(OpenAI 호환 tool-calling)을 실제로 반환하는지 — `_parse_actions()`가 기대하는 형식과 실제 응답이 일치하는지
- OpenRouter가 이 모델 호출에 대해 유효한 cost(>0) 정보를 응답에 포함하는지 (포함 안 하면 `MSWEA_COST_TRACKING=ignore_errors` 필요)
- litellm 경로(`model_class` 미지정, 기본값)로 `openrouter/z-ai/glm-5.3-flash` 형태를 썼을 때도 동작하는지 — 이번 조사는 전용 `openrouter` 클래스 경로만 source로 확인했고, litellm 자체의 OpenRouter 라우팅 동작은 mini-swe-agent 저장소 밖의 영역이라 확인하지 못함
- `MSWEA_CONFIGURED` 미설정 상태에서 비대화형(스크립트) 실행 시 setup wizard가 실제로 어떻게 동작/우회되는지
- 위 전체 — 지금까지는 전부 **Claude source inspection**이며, Codex 또는 실제 실행에 의한 독립 검증 대상 (CODING_AGENT_PLAN_v0.md 5장/8장의 역할분담·귀속 체계 참고)
