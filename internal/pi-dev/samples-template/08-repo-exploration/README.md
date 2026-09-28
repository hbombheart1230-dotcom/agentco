# 08 — Repo Exploration

## 목적
01보다 조금 더 큰 repo에서 여러 파일에 걸친 탐색/검색을 하는지 확인. 코드 수정은 없다.

## 추천 prompt
```text
이 repo에서 이메일 형식을 검증하는 함수가 어디에 정의되어 있고, 어디서 쓰이는지 찾아줘. 코드는 수정하지 마.
```

## 기대 동작
- 파일 수정 0건
- `app/utils/validation.py`의 `validate_email`과, 이를 사용하는 `app/routes/users.py`, `app/routes/orders.py`를 모두 찾아냄
