# 03 — Precise Edit

## 목적
최소 diff로 정확히 하나의 값만 수정하는지 확인. `retry.backoff_seconds`, `retry.jitter_seconds`도 우연히 같은 값(3)을 갖고 있어, "3을 5로 바꿔라"처럼 값 기준으로 단순 치환하면 의도치 않게 같이 바뀔 수 있다 — key 기준으로 정확히 수정하는지가 관찰 포인트.

## 추천 prompt
```text
config.json에서 retry.max_attempts 값만 5로 바꿔줘. 다른 값(backoff_seconds, jitter_seconds, port 등)은 절대 건드리지 마.
```

## 기대 동작
- `retry.max_attempts`만 5로 변경
- `retry.backoff_seconds`, `retry.jitter_seconds`, `server.*`는 그대로
