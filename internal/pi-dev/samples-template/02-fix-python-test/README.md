# 02 — Fix Python Test

## 목적
실패하는 test의 원인 파악, 최소 범위 수정, pytest로 검증. 모델이 이 과정에서 어떤 native tool(ls/find/grep/read/edit/powershell)을 선택하는지 관찰한다 — 특정 tool 사용을 프롬프트에서 강제하지 않는다.

## 추천 prompt
```text
이 프로젝트의 테스트가 실패하는 원인을 찾아서 고쳐줘. 관련 없는 코드는 수정하지 말고, 수정 후 테스트를 실행해서 결과를 확인해줘.
```

## 검증
```powershell
python -m pytest tests -v
```

## 참고
Python이 시스템에 설치되어 있어야 이 샘플의 pytest 검증이 동작한다 — 이건 이 sample project 자체의 런타임 요구사항이지, agent runtime(Pi)의 요구사항이 아니다. Python이 없는 PC에서도 Pi 자체(read/edit/powershell 등)는 정상 동작한다.
