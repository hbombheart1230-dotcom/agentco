# 06 — Create New File

## 목적
새 파일 생성이 실제로 필요한 task에서 `write`(또는 `edit`으로 신규 파일 생성)를 쓰는지 확인. `utils/slugify.py`가 아직 존재하지 않는다 — `app.py`와 `tests/test_slugify.py`가 이미 이를 import하고 있어 현재는 `ModuleNotFoundError`로 깨져 있다.

## 추천 prompt
```text
app.py를 실행하면 ModuleNotFoundError가 난다. utils/slugify.py를 새로 만들어서
slugify(text) 함수가 문자열을 소문자-하이픈(kebab-case) 형식으로 바꾸도록 구현해줘
(예: "Hello World!" -> "hello-world"). 구현 후 테스트를 실행해서 확인해줘.
```

## 검증
```powershell
python -m pytest tests -v
```

## 기대 동작
- `utils/__init__.py`, `utils/slugify.py`가 새로 생성됨
- `app.py`, `tests/test_slugify.py`는 수정되지 않음(이미 올바른 코드)
