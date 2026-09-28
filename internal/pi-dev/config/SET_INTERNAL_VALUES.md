회사에서 바꿀 값은 딱 3개입니다.

[1] Endpoint
파일:
config/models.json

찾을 문자열:
<INTERNAL_VLLM_ENDPOINT>

바꿀 값 예:
"baseUrl": "http://10.0.x.x:8000/v1"

[2] GLM Model ID
파일:
config/models.json

찾을 문자열:
<INTERNAL_GLM_MODEL_ID>

바꿀 값 예:
"id": "glm-5.3-flash-internal"

[3] API Key
둘 중 하나를 선택합니다.

  방법 A (매번 환경변수로 설정, 파일엔 저장 안 함) -- 기본값, 더 안전
  config/models.json은 그대로 두고, 실행 전 PowerShell에서:

  $env:INTERNAL_VLLM_API_KEY = "<실제 키>"

  방법 B (config/models.json에 직접 저장) -- 더 간단, 대신 키가 파일에 평문으로 남음
  config/models.json에서 찾을 문자열:

  "apiKey": "${INTERNAL_VLLM_API_KEY}"

  이 줄을 실제 키로 바꿉니다:

  "apiKey": "<실제 키>"

  이렇게 하면 매번 $env: 설정을 할 필요가 없습니다. 다만 이 파일을 다른 사람과
  공유하거나 백업/복사할 때 키가 그대로 노출된다는 점을 알고 있어야 합니다.

---

확인:
scripts\check-config.cmd

실행:
scripts\run-glm.cmd

세 값을 모두 채우기 전까지 run-glm.cmd는 명확한 에러를 보여주고 종료합니다
(실제 서버를 호출하지 않습니다).
