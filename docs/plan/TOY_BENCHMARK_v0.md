# TOY_BENCHMARK_v0

> 상태: **Specification only — 아직 실제 repo/코드는 생성하지 않음**
> 목적 문서: [CODING_AGENT_PLAN_v0.md](CODING_AGENT_PLAN_v0.md) 12장(공통 toy benchmark 전략)의 상세화
> 이 문서가 정의하는 것은 "coding 성능 경쟁"이 아니라 **agent capability를 분리해서 관찰하기 위한 최소 task 세트**다.

---

## 0. 설계 원칙

- **coding 난이도를 의도적으로 낮춘다.** 모든 task는 "이 코드를 못 짜서 실패"가 아니라 "탐색/도구선택/해석/반복행동을 못 해서 실패"가 나오도록 설계한다. 버그는 한 줄, 한 연산자 수준으로 제한한다.
- **외부 네트워크 의존 없음.** pip install, git clone, 외부 API 호출이 필요한 task는 없다. `pytest`가 이미 설치되어 있다고 가정하는 것 정도만 환경 전제로 둔다.
- **성공 판정은 스크립트로 자동 확인 가능해야 한다.** "그럴듯해 보인다"가 아니라 exit code / 파일 diff / 문자열 정확 일치로 판정한다. 판정 로직 자체가 harness/model에 유리·불리하게 편향되지 않아야 한다.
- **step budget(최대 turn/tool-call 수)을 모든 harness/model에 동일하게 설정한다.** 그래야 "반복/루프 행동" 관찰이 harness 기본값 차이가 아니라 실제 model/harness 행동 차이가 된다.
- **tool 원시 능력(primitive parity)을 사전에 맞춘다.** mini-SWE와 Pi가 파일 읽기/쓰기/셸 실행에 대해 동등한 수준의 tool을 노출하는지 M0/M1 착수 전에 확인한다 (안 맞으면 그 자체가 비교의 confound가 된다 — 개별 task의 "공정성 주의점"에서 반복 언급).

## 1. 관찰 대상 능력 ↔ task 매핑

| 능력 | A: Find & Read | B: Fix Failing Test | C: Pick the Right Script | D: Precise Structured Edit | E: Diagnose Only |
|---|---|---|---|---|---|
| repository 탐색 | ● 주 | ○ | ○ | ○ | ○ |
| file read | ● 주 | ○ | ○ | ○ | ○ |
| shell/tool 선택 | | | ● 주 | | |
| edit | | ● 주 | | ● 주 | (금지됨 — 역으로 관찰) |
| test 실행 | | ● 주 | | | ● 주 |
| 실패 결과 해석 | | ● 주 | | | ● 주 |
| repair | | ● 주 | | | |
| completion 판단 | ○ | ● 주 | ○ | ○ | ● 주 |
| structured tool-call 안정성 | | | | ● 주 | |
| 반복/루프 행동 | | | ● 주 | | |

● = 이 task가 해당 능력을 주로 관찰하도록 설계됨, ○ = 부수적으로 관찰됨(주 지표 아님)

5개 task로 10개 능력을 모두 최소 1회 이상 "주 관찰 대상"으로 커버한다.

---

## Task A — Find & Read

### 목적
편집 없이 순수 **탐색 + 읽기**만으로 정답을 찾을 수 있는지 관찰한다. Edit/test가 전혀 없으므로, 실패하면 원인이 "찾기/읽기" 단계로 명확히 좁혀진다.

### repo 구조
```
repo/
  README.md              (프로젝트 개요만, 정답 없음)
  config/
    defaults.yaml         (여러 키, 정답 아님)
    overrides/
      staging.yaml         (여러 키, 그 중 하나가 정답)
  src/
    (정답과 무관한 파일 2~3개, 디코이 목적)
```
정답 값(예: `retry_limit: 7`)은 `config/overrides/staging.yaml`에만 존재하고, `defaults.yaml`에는 다른 값(`retry_limit: 3`)이 있어 혼동을 유도한다.

### 초기 코드 상태
정적. 버그 없음. 실행 가능한 코드도 없음 (순수 설정 파일 탐색).

### user prompt
> "이 프로젝트에서 staging 환경에 적용되는 `retry_limit` 값이 얼마인지 찾아서 `ANSWER.txt`에 숫자만 써줘."

### expected trajectory
1. 디렉토리 구조 확인 (`ls`/`find` 또는 파일 탐색 tool)
2. `defaults.yaml` 읽음 (여기서 멈추면 오답 유도 함정)
3. `config/overrides/` 존재를 인지하고 `staging.yaml` 읽음
4. 정답 값 확인 후 `ANSWER.txt` 작성
5. 종료 (추가 파일 탐색 없이 멈춤)

### objective success condition
`ANSWER.txt`의 내용이 정확히 `7` (whitespace만 허용). 그 외 파일은 변경되지 않아야 함(git diff로 확인).

### 측정 metric
- 정답 일치 여부 (binary)
- 읽은 파일 수 / 실제 필요한 최소 파일 수 (탐색 효율)
- `defaults.yaml`의 오답 값을 그대로 썼는지 (함정 회피 여부)
- 총 tool-call 수, wall-clock

### 어떤 실패가 model 문제인가
- `defaults.yaml`만 읽고 `3`을 정답으로 씀 (오버라이드 개념을 이해 못함)
- 파일을 다 읽고도 잘못된 값을 답으로 씀 (독해 실패)

### 어떤 실패가 harness 문제인가
- 디렉토리 목록 tool이 하위 디렉토리(`overrides/`)를 노출하지 않음
- 파일 쓰기 tool 호출이 스키마 오류로 거부되어 `ANSWER.txt`가 아예 생성 안 됨
- 파일 읽기 결과가 잘려서 모델에 전달됨(truncation)

### mini-SWE / Pi 공정 비교 주의점
- 두 harness가 디렉토리 탐색에 쓰는 수단이 다를 수 있음 (mini-SWE는 셸 `ls`/`find`, Pi는 구조화된 file-list tool). 어느 쪽이 더 "찾기 쉽게" 만들어주는지는 harness 설계 차이이지 모델 능력 차이가 아니므로, 결과 해석 시 반드시 구분해서 기록할 것.

---

## Task B — Fix the Failing Test

### 목적
표준적인 "실패 인지 → 해석 → 수정 → 재검증 → 종료 판단" 루프 전체를 가장 단순한 형태로 관찰한다. M0/M1/M2 공통의 핵심 task.

### repo 구조
```
repo/
  pkg/
    calc.py        (버그 1개 — 연산자 하나 틀림)
  tests/
    test_calc.py    (버그를 잡아내는 테스트 1개만 존재)
```

### 초기 코드 상태
```python
# pkg/calc.py
def clamp(value, low, high):
    if value < low:
        return low
    if value > high:      # 버그: 원래 high가 아니라 다른 조건이어야 함 등, 실제 구현 시 한 줄짜리 명확한 오류로 확정
        return high
    return value
```
(구현 시점에 실제로 "한 줄, 한 연산자" 수준의 결함으로 고정한다 — 예: `>=`을 `>`로 잘못 쓴 경우 등. 지금은 스펙 단계이므로 정확한 버그 코드는 task 구현 시 확정.)

`tests/test_calc.py`는 이 함수를 호출해 경계값에서 실패하는 assert 1개만 가진다.

### user prompt
> "`tests/` 안의 실패하는 테스트를 통과시켜줘. 테스트 파일은 수정하지 마."

### expected trajectory
1. 테스트 실행 (`pytest`) → 실패 확인
2. 실패 메시지(assertion 내용) 읽고 원인 위치(`pkg/calc.py`) 특정
3. 해당 파일 읽음
4. 최소 수정
5. 테스트 재실행 → 통과 확인
6. 종료 (통과 후 불필요한 추가 수정/재실행 없이 멈춤)

### objective success condition
- `pytest` exit code 0
- `tests/test_calc.py` 바이트 단위로 미변경
- `pkg/calc.py` 외 파일 미변경
- diff가 최소 수정(예: 1~2줄) 범위 내

### 측정 metric
- pass/fail
- 테스트 실행 횟수 (1회 만에 고쳤는가, 여러 번 시행착오했는가)
- 통과 이후 추가 turn 수 (0에 가까울수록 completion 판단이 정확함)
- diff 크기 (의도한 라인 수 대비)
- 테스트 파일을 몰래 수정해서 "우회 통과"를 시도했는지 (cheating pattern — 별도로 반드시 체크)

### 어떤 실패가 model 문제인가
- assertion 메시지를 잘못 해석해 엉뚱한 파일을 수정
- 수정했지만 여전히 실패 (근본 원인 파악 실패)
- 테스트를 통과시키려고 테스트 파일 자체를 수정 (지시 위반 + 문제 해결 능력 부재의 조합)
- 통과 후에도 계속 파일을 건드리며 종료하지 못함 (completion 판단 실패)

### 어떤 실패가 harness 문제인가
- 테스트 실행 tool이 stdout/exit code를 모델에게 제대로 전달하지 못함 (모델은 맞게 판단했는데 harness가 결과를 못 넘겨줌)
- edit tool이 부분 수정이 아니라 전체 파일을 덮어써서 의도치 않은 변경 발생
- 테스트 통과를 harness가 감지하고도 루프를 계속 돌리는 경우 (모델이 아니라 harness의 종료 조건 로직 문제)

### mini-SWE / Pi 공정 비교 주의점
- edit 방식이 다르면(mini-SWE: 셸 기반 sed/전체 재작성 vs Pi: 구조화된 patch) diff 크기와 정확도가 harness 능력 차이로 갈릴 수 있음. "수정 정확도"를 모델 비교에 쓸 때는 이 차이를 각주로 반드시 명시.
- 두 harness의 pytest 실행 명령/출력 캡처 방식이 동일한지 사전 확인 (한쪽만 verbose 출력을 주면 해석 난이도가 달라짐).

---

## Task C — Pick the Right Script (& Avoid Looping)

### 목적
정답이 여러 후보 중 하나를 "선택"해야 나오는 상황에서 **tool/명령 선택 판단**과, 잘못된 선택 후 **반복 행동(loop)** 이 어떻게 나타나는지 관찰한다.

### repo 구조
```
repo/
  scripts/
    check.sh            (정답 — 실행하면 성공적으로 PASS 출력)
    check_legacy.sh      (디코이 — 실행하면 "deprecated, use check.sh" 메시지와 함께 비정상 종료)
  README.md              (어느 스크립트를 써야 하는지에 대한 명시적 언급 없음 — 스스로 판단해야 함)
```

### 초기 코드 상태
정적. 두 스크립트 모두 존재하고 실행 가능. `check.sh`는 항상 성공, `check_legacy.sh`는 항상 실패(exit code 1, deprecation 메시지 출력)하도록 고정.

### user prompt
> "이 프로젝트의 검증 스크립트를 실행하고 통과 여부를 보고해줘."

### expected trajectory
1. `scripts/` 디렉토리 확인, 두 스크립트 존재 인지
2. (필요시) 파일명/내용으로 어느 것이 최신인지 판단 — 예: `check_legacy.sh`를 먼저 실행해도 됨, 단 실패 메시지에서 "check.sh를 쓰라"는 힌트를 읽고 즉시 전환
3. `check.sh` 실행 → 성공 확인
4. 결과 보고 후 종료

### objective success condition
- 최종 보고 내용이 실제 `check.sh` 실행 결과(PASS)와 일치
- 동일한 실패 명령을 3회 초과 반복 실행하지 않음 (loop 상한을 스펙에서 3회로 고정)
- 실행 없이 결과를 지어내지 않음 (tool-call 로그에 최소 1회의 실제 스크립트 실행 존재)

### 측정 metric
- 정답 스크립트를 실행했는지 여부
- `check_legacy.sh` 반복 실행 횟수 (동일 실패 명령 재시도 카운트)
- 첫 실행에서 바로 `check.sh`를 골랐는지, 아니면 legacy를 거쳐서 전환했는지 (둘 다 성공으로 간주하되 효율 지표로 기록)
- 보고 내용이 실제 실행 결과와 일치하는지 (hallucination 여부)

### 어떤 실패가 model 문제인가
- `check_legacy.sh`의 deprecation 메시지를 읽고도 `check.sh`로 전환하지 않고 계속 같은 명령을 반복 실행
- 실행 없이 "통과했을 것"이라고 추측해서 보고 (실행 회피 + 확인 없는 답변)

### 어떤 실패가 harness 문제인가
- 셸 실행 tool이 exit code나 stdout을 모델에게 온전히 전달하지 못해 반복 실행을 유발
- harness 자체의 max-turn 설정이 너무 낮아 정상적으로 전환 판단을 할 시간도 없이 강제 종료됨 (이 경우 "반복 행동" 지표 자체가 무의미해지므로, step budget을 사전에 통일하는 게 중요한 이유)

### mini-SWE / Pi 공정 비교 주의점
- 두 harness의 기본 max-turn / retry 정책이 다르면 "루프 행동"처럼 보이는 것이 실제로는 harness 설정값 차이일 수 있음. **반드시 동일한 step budget으로 고정 실행.**
- Pi처럼 구조화된 tool 목록을 미리 모델에게 노출하는 방식은 "무엇을 실행할 수 있는지"를 더 쉽게 알려줄 수 있어, 선택 난이도 자체가 harness에 따라 달라질 수 있음 — 결과 해석 시 명시.

---

## Task D — Precise Structured Edit

### 목적
자유 형식 파일 재작성이 아니라 **정확히 한 값만 바꾸는 구조화된 edit**을 요구해, tool-call의 정밀도/안정성을 관찰한다. M1(Pi 구조화 비교)과 M2(Qwen structured tool-call 안정성 검증)에 특히 중요.

### repo 구조
```
repo/
  settings.json    (여러 키를 가진 단순 설정 파일)
```

### 초기 코드 상태
```json
{
  "timeout_seconds": 5,
  "retries": 3,
  "verbose": false
}
```

### user prompt
> "`settings.json`에서 `timeout_seconds` 값만 `30`으로 바꿔줘. 다른 키나 포맷은 건드리지 마."

### expected trajectory
1. 파일 읽음
2. 해당 키만 정확히 수정하는 단일 edit 수행 (전체 재작성 지양)
3. 결과 확인 후 종료

### objective success condition
- `timeout_seconds`가 정확히 `30`
- 나머지 키(`retries`, `verbose`) 값 불변
- JSON 유효성 유지
- **불필요한 포맷 변경 없음** (들여쓰기/키 순서/줄바꿈 등 원본과 동일 — diff가 1줄만 나와야 함)

### 측정 metric
- 목표 값 정확히 반영 여부
- diff 라인 수 (1줄 기대, 초과 시 "정밀 edit 실패" 신호)
- 첫 tool-call에서 스키마 유효하게 성공했는지, 몇 차례 재시도했는지 (tool-call 안정성 핵심 지표)
- JSON parse 유효성

### 어떤 실패가 model 문제인가
- 엉뚱한 키를 수정하거나 존재하지 않는 키를 새로 추가
- 값의 타입을 잘못 지정 (`"30"` 문자열 vs `30` 숫자)

### 어떤 실패가 harness 문제인가
- 구조화된 edit tool의 인자 스키마를 모델이 올바르게 채웠는데도 harness가 파싱에 실패해 재시도를 유발
- edit tool이 "부분 수정" API임에도 내부적으로 전체 파일을 재작성하면서 포맷을 바꿔버림 (모델 의도와 무관하게 harness가 diff를 오염시킴)
- Qwen의 tool-call 출력이 스키마상 malformed로 반복 거부되는 경우 (M2에서 특히 주목해야 할 패턴 — 모델의 tool-calling 포맷 준수 능력 자체를 보여줌)

### mini-SWE / Pi 공정 비교 주의점
- 이 task는 태생적으로 Pi 같은 구조화 tool-calling harness에 유리하게 설계되어 있음을 명시한다. mini-SWE가 셸 기반 edit(sed 등)을 쓴다면 "diff 1줄" 기준을 달성하기 더 어려울 수 있는데, 이걸 "Pi 모델이 더 낫다"로 잘못 해석하지 않는다 — **harness의 edit 원시 능력 차이**로 먼저 귀속하고, 그 다음에 동일 harness 내에서 모델 간 비교(M2에서 Qwen vs 외부모델, 같은 harness 사용)로 넘어가야 진짜 모델 비교가 된다.

---

## Task E — Diagnose Only (No Edit Allowed)

### 목적
"실패 해석" 능력을 "repair(수정)" 능력과 분리해서 단독으로 관찰한다. Task B는 해석+수정이 묶여 있어 실패 시 원인 귀속이 어려운데, 이 task는 수정을 금지해 순수 해석력만 본다. 동시에 "지시(수정 금지)를 얼마나 따르는가"도 부수적으로 관찰된다.

### repo 구조
```
repo/
  pkg/
    parser.py       (버그 1개 — 원인이 에러 메시지에서 한 단계 추론이 필요한 수준)
  tests/
    test_parser.py    (실패하는 테스트 1개)
```
에러 메시지 자체가 근본 원인을 직접 가리키지 않도록 설계한다 (예: `IndexError`가 나지만 진짜 원인은 그 이전 줄의 off-by-one — Task B보다 한 단계 더 해석을 요구하되, 여전히 "코딩 난이도"가 아니라 "읽기 난이도"로 국한).

### 초기 코드 상태
정적, 버그 포함. **수정 대상 아님.**

### user prompt
> "`tests/` 안의 실패하는 테스트를 실행하고, 왜 실패하는지 원인을 `DIAGNOSIS.md`에 한 문단으로 정리해줘. 코드는 수정하지 마."

### expected trajectory
1. 테스트 실행 → 실패/traceback 확인
2. `pkg/parser.py` 읽고 traceback을 근본 원인까지 역추적
3. `DIAGNOSIS.md`에 원인(파일/줄 수준)과 근거를 작성
4. 소스 파일은 건드리지 않고 종료

### objective success condition
- `DIAGNOSIS.md`가 생성되고, 실제 버그가 있는 파일/줄(또는 그에 준하는 명확한 근거)을 정확히 언급
- `pkg/parser.py`, `tests/test_parser.py` **미변경** (git diff로 확인 — 지시 위반 여부를 objective하게 판정 가능)
- 테스트 실행은 진단 목적 최소 횟수(1~2회)로 충분

### 측정 metric
- 근본 원인 지목의 정확도 (정확한 파일+줄 vs 근접 vs 오답)
- 소스 파일 미변경 준수 여부 (지시 준수율 — 별도 지표)
- 테스트 실행 횟수 (진단에 불필요하게 여러 번 돌렸는지)

### 어떤 실패가 model 문제인가
- traceback의 표면적 에러(`IndexError` 발생 줄)만 지목하고 진짜 근본 원인(그 이전의 off-by-one)까지 추적 못함
- 수정하지 말라는 지시를 무시하고 `pkg/parser.py`를 고쳐버림 (지시 불이행)

### 어떤 실패가 harness 문제인가
- 테스트 실행 tool이 traceback 전체가 아니라 마지막 줄만 잘라서 모델에게 전달 (근본 원인 추적에 필요한 정보 자체가 손실)
- "읽기 전용" 모드가 harness 레벨에서 강제되지 않아, 모델이 실수로 edit tool을 호출했는데도 harness가 이를 막지 않고 실행해버림

### mini-SWE / Pi 공정 비교 주의점
- 이 task는 edit tool을 거의 안 쓰므로 두 harness 간 원시 능력 차이의 영향이 가장 작다. **가장 "순수하게 모델을 비교하기 좋은 task"** 로 취급하고, 다른 task에서 나온 harness-confound 의심 결과를 검증하는 대조군으로 활용한다.

---

## 2. Milestone별 적용 범위

### M0 (mini-SWE-agent, 외부) — 필수 최소 task
- **Task A (Find & Read)**
- **Task B (Fix the Failing Test)**

이 두 개만으로 "agent의 본질"(관측→사고→도구호출→결과반영)을 순수 읽기 케이스와 읽기+수정+재검증 케이스로 나눠 관찰할 수 있다. M0 목적("Agent의 본질 이해")에 필요한 최소 세트이며, 이 이상 늘리지 않는다.

### M1 (Pi, 외부) — 추가
- **Task C (Pick the Right Script)** — Pi의 구조화된 tool 목록 노출 방식이 도구 선택/루프 행동에 미치는 영향을 mini-SWE와 비교하기 위해 추가
- **Task D (Precise Structured Edit)** — Pi의 structured tool-calling 정밀도를 직접 겨냥한 task이므로 M1에서 반드시 포함

(A, B는 M0와 동일하게 재실행하여 harness 간 비교 기준을 유지한다.)

### M2 (mini-SWE + Pi, 사내 Qwen) — 추가
- **Task E (Diagnose Only)** — Qwen의 해석력을 repair 능력과 분리해서 보기 위해, 모델이 처음으로 바뀌는 시점인 M2에서 추가
- A, B, C, D 전체를 두 harness × Qwen 조합으로 재실행 (8장의 M2 설계와 동일: 두 harness 모두 사용)

### M3 (VS Code / Jupyter, 사내)
새 task를 추가하지 않는다. **동일한 5개 task를 그대로** VS Code 가상 개발환경 및 (필요 시) Jupyter 셀 실행 흐름 안에서 재실행해, 환경 변화가 결과에 미치는 영향만 분리해서 본다. Jupyter 전용 변형(`.ipynb` 실행이 필요한 task)이 필요한지는 M3 착수 시 별도 검토 대상으로 열어둔다(현재는 미정 — CODING_AGENT_PLAN_v0.md 15장/18장 open question과 연결).

---
*이 문서는 specification이다. 실제 repo 파일(`toy-tasks/v0/...`)과 버그 코드는 M0 착수 시점에 별도로 생성한다.*
