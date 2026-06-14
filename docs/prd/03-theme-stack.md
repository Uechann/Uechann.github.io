# PRD-03 — 블로그 테마 전면 재설계 (Stack 전환)

> 상태: 🔴 미구현 (최우선순위)

---

## 문제 정의

Hugo Book은 **문서화(documentation) 테마**다. 사이드바 카테고리 트리·검색은 갖췄지만, 보는 사람도 쓰는 사람도 "블로그"라는 느낌이 없다. 개인 기술 블로그에 필요한 것들이 빠져 있다.

| 부족한 것 | 결과 |
|-----------|------|
| 프로필 사진·소개 | "누가 쓰는 블로그인지" 모름 |
| 커버 이미지 카드 | 글 목록이 텍스트 나열이라 눈길을 끌지 못함 |
| 읽는 시간·작성일 | 글 메타 정보 부재 |
| 비주얼 위계 | 백과사전처럼 보임 → 쓰고 싶은 마음이 안 생김 |

> **핵심**: 블로그는 기술 자랑이 아니라 내 이야기를 담는 공간이다. 디자인이 그 감각을 줘야 한다.

---

## 목표 테마: Hugo Stack

- 레포: https://github.com/CaiJimmy/hugo-theme-stack
- 참조 데모: https://demo.stack.jimmycai.com
- 별점: 5k+ ⭐
- 현재 Hugo 개인 기술 블로그 사실상 표준 테마

### Stack 테마가 답인 이유

| 기능 | Hugo Book | Stack |
|------|-----------|-------|
| 카드형 글 목록 (커버 이미지) | ✗ | ✅ 기본 제공 |
| 좌측 프로필 사이드바 | ✗ | ✅ 사진·이름·소개·소셜 |
| 우측 TOC 고정 스크롤 | ✓ | ✅ 더 세련된 방식 |
| 다크모드 토글 | ✓ | ✅ |
| giscus 댓글 | 직접 구현 필요 | ✅ 내장 |
| 읽는 시간 | ✗ | ✅ |
| 이전/다음 글 | ✗ | ✅ |
| 카테고리 페이지 | 폴더 트리 | ✅ 카드 그리드 |
| 아카이브 페이지 | ✗ | ✅ |
| 태그 클라우드 | 링크 목록 | ✅ 시각적 크기 차등 |

---

## 구현 요구사항

### R1. Stack 테마 전환

```bash
# Hugo Book submodule 제거
git submodule deinit -f themes/hugo-book
git rm -f themes/hugo-book

# Stack 추가
git submodule add https://github.com/CaiJimmy/hugo-theme-stack.git themes/hugo-theme-stack
```

---

### R2. `hugo.yaml` 재작성

Stack의 핵심 설정:

```yaml
baseURL: "https://uechann.github.io/"
locale: "ko-kr"
title: "의찬의 개발 블로그"
theme: "hugo-theme-stack"

params:
  mainSections:
    - posts
  featuredImageField: image
  rssFullContent: true
  favicon: /favicon.png

  footer:
    since: 2026
    customText: ""

  dateFormat:
    published: 2006년 01월 02일
    lastUpdated: 2006년 01월 02일

  sidebar:
    emoji: "🛠️"
    subtitle: "백엔드 개발 학습 기록과 트러블슈팅"
    avatar:
      enabled: true
      local: true
      src: img/avatar.png   # static/img/avatar.png 에 사진 배치

  article:
    math: false
    toc: true
    readingTime: true
    license:
      enabled: false

  comments:
    enabled: true
    provider: giscus
    giscus:
      repo: Uechann/Uechann.github.io
      repoID: ""         # giscus.app에서 발급
      category: General
      categoryID: ""     # giscus.app에서 발급
      mapping: pathname
      lightTheme: light
      darkTheme: dark_dimmed
      reactionsEnabled: 1
      emitMetadata: 0

  widgets:
    homepage:
      - type: search
      - type: archives
        params:
          limit: 5
      - type: categories
        params:
          limit: 10
      - type: tag-cloud
        params:
          limit: 10
    page:
      - type: toc

  colorScheme:
    toggle: true
    default: auto   # system 설정 따름
```

---

### R3. 카테고리 구조 재정의

Stack은 `content/posts/` 하위에 카테고리 폴더를 두고, `_index.md`에 카테고리 커버 이미지를 지정한다.

```
content/
├── page/
│   ├── about/index.md        # 소개 페이지
│   ├── archives/index.md     # 아카이브
│   └── search/index.md       # 검색
└── posts/
    ├── backend/
    │   ├── _index.md         # 카테고리 설명 + 커버 이미지
    │   └── first-post/
    │       ├── index.md
    │       └── cover.png     # 글 커버 이미지
    ├── cs/
    ├── troubleshooting/
    └── retrospect/
```

---

### R4. 프로필 이미지 배치

`static/img/avatar.png` 에 본인 사진 또는 아바타 이미지 배치.  
Stack이 사이드바에 자동으로 표시한다.

---

### R5. 커스텀 폰트 유지

기존 `assets/_custom.scss` 및 `layouts/_partials/docs/html-head.html` 오버라이드는 Stack 레이아웃에 맞게 재작성 필요.

Stack의 폰트 오버라이드 방법:
```scss
// assets/scss/custom.scss (Stack의 커스텀 진입점)
:root {
  --sys-font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --code-font-family: 'JetBrains Mono', 'Fira Code', monospace;
  --article-font-size: 1.05rem;
  --article-line-height: 1.85;
}
```

---

## 구현 순서

```
1. Hugo Book 제거 + Stack submodule 추가
2. hugo.yaml 재작성
3. content/page/ 구조 생성 (about, archives, search)
4. 기존 posts/ 카테고리 _index.md 갱신 (커버 이미지 필드)
5. static/img/avatar.png 배치 (프로필 사진)
6. assets/scss/custom.scss 폰트 설정
7. hugo build 검증
8. 기존 Sveltia CMS config.yml collections 경로 확인
```

---

## 비고

현재 Hugo Book 상태에서도 `hugo build`는 되지만, **"쓰고 싶다"는 동기는 디자인이 만든다**. Stack으로 전환하면 블로그가 내 공간처럼 느껴지게 된다.
