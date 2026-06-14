# PRD-05 — 카테고리 관리 UX

> 상태: 🔴 미구현
> 의존성: PRD-03 (Stack 전환) 완료 후 진행

---

## 문제 정의

> "내가 카테고리들을 관리할 수 있고"

현재 카테고리 추가 = 폴더 생성 + `_index.md` 작성 + CMS config.yml 컬렉션 추가의 3단계 작업.  
어디서 뭘 해야 하는지 파악하기 어렵다.

---

## 현재 카테고리 구조 (Hugo Book 기준)

```
content/posts/
├── backend/        # 백엔드
├── cs/             # CS 기초
├── troubleshooting/ # 트러블슈팅
└── retrospect/     # 회고
```

폴더 = 카테고리. CMS에서 컬렉션도 4개로 분리돼 있다.

---

## 목표 카테고리 설계

참조 블로그 분석 + 백엔드 개발 학습 기록에 맞는 구조:

```
posts/
├── java/            # Java / 언어
├── spring/          # Spring Framework
├── database/        # DB / JPA / SQL
├── infra/           # Docker / CI-CD / 서버
├── cs/              # 네트워크 / OS / 자료구조
├── troubleshooting/ # 에러 해결 기록
├── woowacourse/     # 우아한테크코스 활동
└── retrospect/      # 회고 / 일기
```

> 지금의 `backend`는 너무 광범위하다.
> 검색·태그로 세부 분류하더라도, 카테고리는 한눈에 "이 블로그가 뭘 다루는지" 보여줘야 한다.

---

## 요구사항

### R1. 카테고리 폴더 + `_index.md` 구조

Stack 테마에서 카테고리 페이지는 `_index.md` front matter로 제목·설명·커버 이미지를 설정한다.

`content/posts/spring/_index.md`:
```yaml
---
title: "Spring"
description: "Spring Framework, Spring Boot, JPA 관련 학습 기록"
image: cover.jpg   # static/img/category/spring.jpg
---
```

---

### R2. CMS 컬렉션 동기화

카테고리가 추가되면 `static/admin/config.yml`에도 컬렉션을 추가해야 CMS 웹 에디터에서 해당 카테고리로 글을 쓸 수 있다.

**카테고리 추가 체크리스트:**

```
□ content/posts/<카테고리>/_index.md 생성
□ static/admin/config.yml 에 컬렉션 블록 추가
□ (선택) static/img/category/<카테고리>.jpg 커버 이미지 추가
```

---

### R3. 카테고리 페이지 개선 (Stack 기본 제공)

Stack 테마는 `/categories/` 경로에 카드 그리드 방식의 카테고리 목록 페이지를 기본 제공한다.  
각 카테고리 카드에는 커버 이미지 + 글 수 + 설명이 표시된다.

---

### R4. 메뉴 네비게이션

Stack의 사이드바 메뉴에 주요 링크 추가:

```yaml
# hugo.yaml 메뉴 설정
menu:
  main:
    - name: "홈"
      url: "/"
      weight: 1
      params:
        icon: home
    - name: "카테고리"
      url: "/categories/"
      weight: 2
      params:
        icon: category
    - name: "아카이브"
      url: "/page/archives/"
      weight: 3
      params:
        icon: archives
    - name: "검색"
      url: "/page/search/"
      weight: 4
      params:
        icon: search
    - name: "소개"
      url: "/page/about/"
      weight: 5
      params:
        icon: user
```

---

## 카테고리 운영 원칙

1. **상위 8개 이하 유지** — 너무 많으면 관리가 어렵고 방문자도 혼란
2. **태그로 세분화** — `spring`, `jpa`, `transaction` 같은 세부 주제는 태그로
3. **카테고리 = 독자 관점** — "이 블로그가 뭘 다루는지" 설명하는 단위
4. **추가는 신중하게** — 글이 3개 이상 쌓일 때 새 카테고리 고려

---

## 구현 순서

```
1. PRD-03 (Stack 전환) 완료
2. 기존 카테고리 폴더 구조 재편성
3. 각 카테고리 _index.md 작성
4. CMS config.yml 컬렉션 동기화
5. hugo.yaml 메뉴 설정
6. 카테고리 커버 이미지 준비 (선택)
```
