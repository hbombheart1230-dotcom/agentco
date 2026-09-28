# 05 — Cross-file Bug

## 목적
원인이 실패한 테스트가 있는 파일이 아니라 다른 파일(`config.py`)에 있는 구조에서, 여러 파일을 탐색해 근본 원인을 찾아 고치는지 확인한다. `formatter.py`는 관련 없는 decoy 파일이다.

## 추천 prompt
```text
이 프로젝트의 테스트가 실패하는 원인을 찾아서 고쳐줘. 관련 없는 코드는 수정하지 말고, 수정 후 테스트를 실행해서 결과를 확인해줘.
```

## 검증
```powershell
python -m pytest tests -v
```

## 기대 동작
- `src/service.py`가 `src/config.py`의 `DISCOUNT_RATE`(0.15)를 쓰도록 수정
- `src/formatter.py`는 수정되지 않음
