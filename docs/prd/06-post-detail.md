# PRD-06 — 글 상세 페이지 + 블로그 완성도

> 상태: 🔴 미구현
> 의존성: PRD-03 (Stack 전환) 완료 후 자동 해결되는 것이 대부분

---

## 문제 정의

참조 블로그 분석에서 발견한 기능 중, 현재 우리 블로그에 없는 것들을 정리한다.

---

## 요구사항

### R1. 글 커버 이미지

참조 블로그의 글 목록은 커버 이미지가 있는 카드로 구성된다.

**Stack 테마에서의 적용:**

```markdown
---
title: "Spring 트랜잭션 완전 정복"
date: 2026-06-14
image: cover.png     # 글 폴더 내 이미지를 자동 인식
categories: ["spring"]
tags: ["spring", "transaction", "jpa"]
---
```

- 글 폴더에 `cover.png`(또는 `cover.jpg`)를 두면 Stack이 자동으로 카드 이미지로 사용
- 이미지 없으면 카테고리 색상 배경으로 대체

**권장 커버 이미지 규격:**
- 사이즈: 1200 × 630 px (OGP 겸용)
- 포맷: JPG 또는 WebP (PNG보다 용량 절감)
- 직접 디자인 or Unsplash / unDraw 무료 이미지 활용

---

### R2. 읽는 시간 표시

Stack 테마의 `article.readingTime: true` 설정으로 자동 계산된다.  
한국어 기준 분당 200~250자로 계산.

---

### R3. 이전 글 / 다음 글 네비게이션

Stack 기본 제공. 글 하단에 같은 카테고리 내 이전/다음 글 링크가 표시된다.

---

### R4. 시리즈 기능 (연속 글 묶기)

참조 블로그는 "Hugo 블로그 만들기" 시리즈를 글 상단에 목록으로 표시한다.  
Stack 테마는 이를 `series` front matter 필드로 지원한다.

```markdown
---
title: "Spring 시리즈 1 — IoC와 DI"
series: ["Spring 완전 정복"]
series_order: 1
---
```

시리즈 네비게이션이 글 상단에 자동 표시된다.

---

### R5. giscus 댓글

GitHub Discussions 기반. Stack 테마가 내장 지원한다.

**사용자가 해야 할 작업 (브라우저):**
1. 레포 Settings → Features → Discussions 활성화
2. `https://giscus.app` 접속 → 레포 연결 → 설정값 복사
3. `hugo.yaml`의 `params.comments.giscus` 블록에 `repoID`, `categoryID` 입력

**코드 구현:** `hugo.yaml` comments 섹션 완성 (PRD-03의 R2 참조)

---

### R6. 프로필 / 소개 페이지

Stack은 좌측 사이드바에 프로필 영역을 자동 표시한다.  
별도로 `/page/about/` 소개 페이지도 만든다.

`content/page/about/index.md`:
```markdown
---
title: "소개"
description: "나의찬 — 백엔드 개발자"
---

## 나의찬 (Uechann)

우아한테크코스 X기 백엔드 과정 수료 중.
Java / Spring / JPA를 공부하며 마주치는 문제들을 기록합니다.

- GitHub: [Uechann](https://github.com/Uechann)
```

---

### R7. 아카이브 + 검색 페이지

Stack 테마가 기본 제공. `content/page/`에 두 파일만 추가하면 된다.

`content/page/archives/index.md`:
```yaml
---
title: "아카이브"
layout: archives
outputs:
  - html
  - rss
---
```

`content/page/search/index.md`:
```yaml
---
title: "검색"
layout: search
outputs:
  - html
  - json
---
```

---

## 구현 순서

```
1. PRD-03 (Stack 전환) 완료 → R2, R3, R4, R5 대부분 자동 해결
2. 커버 이미지 가이드라인 확정 (R1)
3. giscus 설정값 발급 (사용자 직접, R5)
4. hugo.yaml giscus 파라미터 입력 (R5)
5. content/page/ 구조 생성: about, archives, search (R6, R7)
6. 소개 페이지 내용 작성 (R6)
```

---

## 참조 블로그 벤치마크

| 기능 | minyeamer.github.io | 우리 목표 |
|------|---------------------|-----------|
| 커버 이미지 카드 | ✅ Dropbox CDN | ✅ page bundle 로컬 |
| 읽는 시간 | ✅ "읽는데 38분" | ✅ Stack 자동 |
| 이전/다음 글 | ✅ | ✅ Stack 자동 |
| 시리즈 네비게이션 | ✅ 상단 목록 | ✅ Stack series 필드 |
| 댓글 (giscus) | ✅ | ✅ Stack 내장 |
| 카테고리 계층 | ✅ 2레벨 | ✅ 태그로 세분화 |
| 아카이브 | ✅ | ✅ Stack 기본 |
| 검색 | ✅ Fuse.js | ✅ Stack 내장 |
