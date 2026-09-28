# Sample Ground Truth (DEV only)

`internal/pi-dev/samples/`의 각 sample에 대한 정답과 검증 기준(2026-09-28 internal/ 통합 이전엔 별도의 `pi-dev-user` 패키지 하위에 samples/가 있었으나, 지금은 `pi-dev` 하나로 합쳐짐). **이 폴더의 위치(`validation/`)는 agent가 작업할 `samples/`와 분리돼 있다** — agent가 정답을 읽어버리면 테스트 가치가 없어지기 때문이다.

각 sample 파일은 아래 metadata 틀을 공유한다 (실제 실행 결과를 기록할 때 채운다):

```text
Task Correctness:        (agent 결과가 실제로 맞았는가)
Harness Completion:      (agent가 스스로 "끝났다"고 판단하고 정상 종료했는가)
Tools Used:              (실제 사용한 tool 목록)
Tool Call Count:
Failed Tool Calls:
Repeated/Unnecessary Calls:
Files Modified:
Unintended Modifications:
Verification Command:
Verification Result:
```

## Sample 목록

| Sample | 파일 |
|---|---|
| 01-read-and-explain | [01.md](01.md) |
| 02-fix-python-test | [02.md](02.md) |
| 03-precise-edit | [03.md](03.md) |
| 04-diagnose-only | [04.md](04.md) |
| 05-cross-file-bug | [05.md](05.md) |
| 06-create-new-file | [06.md](06.md) |
| 07-windows-powershell | [07.md](07.md) |
| 08-repo-exploration | [08.md](08.md) |
