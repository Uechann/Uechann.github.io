# 글 작성 가이드

> 이 블로그에 글을 쓰는 3가지 방법과 자주 쓰는 패턴을 정리합니다.

---

## 빠른 시작 (30초)

```bash
# 1. 로컬 서버 켜기
make dev

# 2. 새 글 만들기 (카테고리에 맞게 선택)
make new-java              SLUG=generic-type-erasure
make new-spring            SLUG=transaction-propagation
make new-database          SLUG=index-b-tree
make new-network           SLUG=tcp-three-way-handshake
make new-infra             SLUG=docker-compose-setup
make new-wooteco-mission   SLUG=level1-racing-car
make new-wooteco-study     SLUG=db-index-study
make new-wooteco-activity  SLUG=level1-demo-day
make new-troubleshooting   SLUG=datasource-pool-error
make new-retrospect        SLUG=june-week-1

# 3. 생성된 파일을 에디터에서 열어 작성
# 4. 브라우저에서 http://localhost:1313 으로 확인
# 5. draft: false 로 바꾸고 git push
```

---

## 방법 1 — 로컬 + Makefile (권장)

### 새 글 만들기

```bash
make new-java SLUG=jpa-n-plus-one
```

→ `content/posts/java/jpa-n-plus-one/index.md` 생성  
→ 카테고리·날짜·섹션 헤딩이 미리 채워진 템플릿으로 시작

SLUG 규칙:
- 영어 소문자 + 하이픈만 사용
- 짧고 의미 있게: `transaction-propagation` ✓ / `post1` ✗
- 글 URL이 됩니다: `https://uechann.github.io/posts/java/jpa-n-plus-one/`

### 로컬에서 확인하기

```bash
make dev
# → http://localhost:1313 에서 실시간 미리보기
# → 파일 저장할 때마다 브라우저가 자동으로 해당 페이지로 이동
```

`draft: true` 상태 글도 `-D` 옵션으로 로컬에서 보입니다.

### 발행하기

```bash
# front matter에서 draft: true → draft: false 로 변경
git add content/posts/java/jpa-n-plus-one/
git commit -m "post: JPA N+1 문제와 해결 방법"
git push
# → GitHub Actions가 자동으로 빌드·배포 (2~3분 소요)
```

---

## 방법 2 — 웹 에디터 (Sveltia CMS)

배포 후 브라우저에서 바로 작성할 수 있습니다.

```
1. https://uechann.github.io/admin/ 접속
2. "Sign in with Token" → GitHub PAT 입력
3. 왼쪽에서 카테고리 선택 → "New 글" 클릭
4. 제목·본문 작성, 이미지 드래그 업로드
5. Publish → 자동 커밋 → 2~3분 후 사이트 반영
```

> **CMS 로컬 테스트**: `config.yml`의 `local_backend: true` 주석 해제 후
> `npx @sveltia/cms-backend` 실행하면 `localhost:1313/admin` 에서도 사용 가능.

---

## 방법 3 — GitHub 웹 에디터

레포 페이지에서 `.` 키를 누르면 github.dev 에디터가 열립니다.  
마크다운 파일을 직접 편집·커밋할 수 있습니다.

---

## Front Matter 필드 설명

```yaml
---
title: "JPA N+1 문제와 해결 방법"   # 글 제목 (필수)
date: 2026-06-14                     # 작성일 (자동 입력)
draft: true                          # true = 로컬만 / false = 배포됨
categories: ["Java"]                 # 카테고리 (아래 목록 참고)
tags: ["jpa", "spring", "n+1"]       # 태그 (소문자, 검색에 활용)
description: "JPA 연관관계 조회 시 발생하는 N+1 문제를 fetch join으로 해결하는 방법"
                                     # 카드 요약 문구 + SEO
image: "cover.png"                   # 커버 이미지 (같은 폴더에 파일 배치)
---
```

### 카테고리 목록

**개념학습**

| 값 | Makefile 명령 | 폴더 | 어떤 글 |
|----|--------------|------|--------|
| `"Java"` | `new-java` | `posts/java/` | Java 언어, JVM, GC, OOP, 자료구조 |
| `"Spring"` | `new-spring` | `posts/spring/` | Spring Boot, MVC, Security, AOP, IoC/DI |
| `"Database"` | `new-database` | `posts/database/` | SQL, 인덱스, 정규화, 트랜잭션, JPA |
| `"Network"` | `new-network` | `posts/network/` | HTTP, TCP/IP, DNS, REST, 웹 통신 |
| `"Infra"` | `new-infra` | `posts/infra/` | Docker, CI/CD, GitHub Actions, Linux |

**우아한테크코스**

| 값 | Makefile 명령 | 폴더 | 어떤 글 |
|----|--------------|------|--------|
| `"우테코-미션"` | `new-wooteco-mission` | `posts/wooteco-mission/` | 미션 설계 고민, 코드 리뷰, 리팩터링 |
| `"우테코-스터디"` | `new-wooteco-study` | `posts/wooteco-study/` | 내부 스터디 자료, 기술 토론 정리 |
| `"우테코-활동"` | `new-wooteco-activity` | `posts/wooteco-activity/` | 행사, 발표, 네트워킹, 코치 세션 |

**기타**

| 값 | Makefile 명령 | 폴더 | 어떤 글 |
|----|--------------|------|--------|
| `"트러블슈팅"` | `new-troubleshooting` | `posts/troubleshooting/` | 에러 해결 기록 |
| `"회고"` | `new-retrospect` | `posts/retrospect/` | 주간/월간 회고 |

---

## 커버 이미지 추가

글 폴더에 `cover.png` (또는 `cover.jpg`, `cover.webp`)를 넣으면 됩니다.

```
content/posts/java/jpa-n-plus-one/
├── index.md       ← 본문
└── cover.png      ← 커버 이미지 (자동으로 카드에 표시)
```

front matter에 명시:
```yaml
image: "cover.png"
```

**커버 이미지 규격 권장:**
- 크기: 1200 × 630 px (OGP 썸네일 겸용)
- 포맷: WebP 또는 JPG (PNG보다 용량 절감)
- 무료 이미지: [Unsplash](https://unsplash.com) · [unDraw](https://undraw.co) · [Storyset](https://storyset.com)

---

## 본문 안 이미지 삽입

커버 외에 본문 중간에 이미지를 넣을 때도 **같은 폴더에 파일을 두고 상대경로**로 참조합니다.

```
content/posts/java/jpa-n-plus-one/
├── index.md
├── cover.png
├── query-result.png   ← 본문 중간 이미지
└── er-diagram.png
```

```markdown
![N+1 쿼리 결과](query-result.png)
![ERD](er-diagram.png)
```

---

## 시리즈 묶기

여러 글을 시리즈로 묶으면 각 글 상단에 시리즈 네비게이션이 자동으로 표시됩니다.

archetype으로 생성된 파일에 `series` 주석이 포함되어 있습니다. 주석을 해제하고 값을 입력하세요.

```yaml
---
title: "Spring 트랜잭션 1 — 개념과 ACID"
categories: ["Spring"]
tags: ["spring", "transaction"]
series: ["Spring 트랜잭션 완전 정복"]   # 주석 해제 + 시리즈명 입력
series_order: 1                         # 이 글의 시리즈 내 순서
---
```

**규칙:**
- 같은 `series` 배열 값을 가진 글들이 하나의 시리즈로 묶임
- `series_order` 숫자 오름차순으로 정렬되어 표시
- 시리즈명은 배열 형식 (`["이름"]`)으로 입력

---

## 글 발행 체크리스트

```
□ draft: false 로 변경
□ title, description 채웠는지 확인
□ categories, tags 올바른지 확인
□ 커버 이미지 있으면 image 필드에 파일명 입력
□ make dev 로 로컬에서 최종 확인
□ git add / commit / push
□ GitHub Actions 탭에서 배포 완료 확인
□ https://uechann.github.io 에서 글 보이는지 확인
```

---

## 프로필 사진 추가 방법

```bash
# 본인 사진을 아래 경로에 배치
cp 내사진.png assets/img/avatar.png
```

그리고 `hugo.yaml` 수정:
```yaml
sidebar:
  avatar: "img/avatar.png"   # 이 줄의 주석(#) 해제 + 값 수정
```

---

## 댓글 (giscus) 활성화 방법

giscus는 GitHub Discussions 기반 댓글 시스템입니다. 아래 순서대로 설정하면 됩니다.

**Step 1 — GitHub Discussions 활성화**
1. `github.com/Uechann/Uechann.github.io` → Settings → General
2. Features 섹션에서 **Discussions** 체크박스 활성화

**Step 2 — giscus 설정값 발급**
1. [giscus.app](https://giscus.app) 접속
2. Repository 입력: `Uechann/Uechann.github.io`
3. Page ↔ Discussions 매핑: **pathname** 선택
4. Discussion 카테고리: **General** 선택
5. 페이지 하단에 생성된 `data-repo-id`(repoID)와 `data-category-id`(categoryID) 복사

**Step 3 — hugo.yaml 수정**

```yaml
comments:
  enabled: true          # false → true
  giscus:
    repoID: "..."        # giscus.app 에서 복사
    categoryID: "..."    # giscus.app 에서 복사
```
