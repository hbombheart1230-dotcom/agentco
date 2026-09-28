---
name: test-and-fix
description: Use when asked to fix a failing test or regression. Reproduce the failure, identify the root cause, make the minimum necessary change, and verify with tests.
---

Guidance for fixing a failing test or regression:

- 먼저 실패를 재현한다.
- 관련 코드를 조사해 root cause를 확인한 뒤 수정한다.
- 불필요한 변경을 피한다 — 필요한 최소한의 수정만 한다.
- 프로젝트에 적절한 테스트를 실행해 확인한다.
- 테스트 실행이 불가능하면 이유를 보고한다.
- 관련 있을 수 있는 다른 테스트도 점검해 새로운 회귀가 없는지 확인한다.
- 최종 diff와 검증 결과를 사용자에게 보고한다.
