# 07 — Windows PowerShell Task

## 목적
Windows-first shell 동작 확인 — 파일 목록 조회, 텍스트 집계, 결과 파일 저장을 PowerShell로 수행하는지 본다. Unix 전용 명령이 필요 없게 설계했다.

## 추천 prompt
```text
data 폴더의 모든 csv 파일에서 헤더를 제외한 데이터 행 수를 각각 세어서,
파일명별 행 수와 전체 합계를 summary.txt에 저장해줘. PowerShell로 확인해줘.
```

## 기대 동작
- `summary.txt`가 새로 생성됨
- `data/*.csv`는 수정되지 않음
