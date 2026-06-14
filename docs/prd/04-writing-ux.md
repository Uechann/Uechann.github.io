# PRD-04 — 글쓰기 경험 개선 ("쓰고 싶어지는" 블로그)

> 상태: 🔴 미구현
> 의존성: PRD-03 (Stack 전환) 완료 후 진행

---

## 문제 정의

> "일단 먼저 쓰고 싶어야 써야 하는데 쓰고 싶지가 않아."

이것은 **동기 문제**이자 **마찰 문제**다.

### 동기 문제 (시각적 보상)

- 내가 쓴 글이 예쁘게 보여야 공유하고 싶다
- 지금 Hugo Book은 API 문서처럼 보인다
- Stack 전환(PRD-03)이 해결의 80%를 담당

### 마찰 문제 (쓰기까지의 허들)

| 현재 마찰 | 원인 |
|----------|------|
| 새 글 시작이 번거롭다 | 폴더 생성 → 파일 생성 → front matter 직접 작성 |
| 로컬에서 보는 게 배포와 다를 수 있다 | 미리보기 환경 미정비 |
| CMS 웹 에디터 접속이 아직 안 된다 | 미배포 상태 |
| 카테고리 선택이 어렵다 | 어떤 폴더에 넣어야 하는지 불명확 |

---

## 요구사항

### R1. Archetype 템플릿 강화

현재 `archetypes/default.md`는 최소한의 front matter만 있다. 카테고리별 전용 archetype을 만들어 `hugo new content`로 바로 시작할 수 있게 한다.

`archetypes/posts/backend.md`:
```markdown
---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
draft: true
tags: []
categories: ["backend"]
image: cover.png
description: ""
---

## 배경

## 문제

## 해결 과정

## 결론
```

동일하게 `cs.md`, `troubleshooting.md`, `retrospect.md` 생성.

**사용 방법:**
```bash
hugo new content posts/backend/spring-transaction/index.md
# → archetypes/posts/backend.md 기준으로 생성됨
```

---

### R2. 로컬 미리보기 스크립트

`Makefile` 또는 `scripts/dev.sh`:

```bash
#!/bin/bash
# scripts/dev.sh

echo "🚀 Hugo 개발 서버 시작..."
echo "   로컬: http://localhost:1313"
echo "   CMS:  http://localhost:1313/admin/ (local_backend 활성화 시)"
echo ""
hugo server -D --disableFastRender --navigateToChanged
```

`hugo server -D` 옵션 설명:
- `-D`: draft 글도 표시 (작성 중인 글 바로 확인)
- `--disableFastRender`: 변경 사항이 반드시 재빌드됨
- `--navigateToChanged`: 파일 저장 시 브라우저가 해당 페이지로 이동

---

### R3. 글 작성 워크플로우 문서화

`docs/03-writing-guide.md` 로 분리하여 "이렇게 쓰면 된다"를 한 페이지에 정리.

포함 내용:
- 새 글 시작 명령어
- front matter 필드 설명
- 커버 이미지 추가 방법
- 드래프트 → 발행 전환 (`draft: false`)
- 로컬 확인 → git push → 자동 배포 흐름

---

### R4. 글 작성 후 보상 루프

Stack 테마 전환 후 발생하는 보상:
- 내 사진이 있는 사이드바
- 커버 이미지가 있는 카드형 글 목록
- 다크모드에서도 예쁜 레이아웃
- giscus 댓글로 반응 확인

이 시각적 보상이 "또 쓰고 싶다"는 동기를 만든다.
PRD-03 → PRD-04 순서가 중요한 이유.

---

## 구현 순서

```
1. PRD-03 (Stack 전환) 완료
2. archetypes/ 카테고리별 템플릿 작성
3. scripts/dev.sh 생성 및 권한 부여 (chmod +x)
4. docs/03-writing-guide.md 작성
```
