# PRD-15: 검색 엔진 노출 (Google / Naver SEO)

> 상태: 🔴 미구현
> 우선순위: P1
> 의존: 없음 (현재 head.html / 배포 파이프라인 위에서 동작)

---

## 배경

블로그(`https://uechann.github.io/`)가 Google·Naver 검색 결과에 노출되지 않는다.
GitHub Pages + Hugo 환경에서 검색 노출을 위해 필요한 것은 두 가지다.

1. **소유권 인증** — 각 검색 엔진의 웹마스터 도구에 사이트를 등록하고 소유를 증명
2. **크롤링 최적화(SEO)** — 크롤러가 페이지를 잘 읽고 색인할 수 있도록 메타데이터·사이트맵·robots 정비

### 현재 상태 점검

| 항목 | 현재 | 비고 |
|------|------|------|
| `sitemap.xml` | ✅ Hugo 자동 생성 (`/sitemap.xml`) | 정상 동작 |
| `robots.txt` | ⚠️ `User-agent: *` 한 줄 | **Sitemap 지시어 없음** |
| canonical | ✅ `head.html`에 존재 | - |
| description / OG | ⚠️ 부분 존재 | `og:image` 폴백 없음, `og:site_name`·트위터 카드 없음 |
| 소유권 인증 메타태그 | ❌ 없음 | Google / Naver 모두 미등록 |
| 구조화 데이터(JSON-LD) | ❌ 없음 | 검색 리치 결과 미지원 |

### 배포 환경 제약 (중요)

GitHub Actions가 `public/` 아티팩트를 **직접** 배포한다(브랜치 커밋 방식 아님).
따라서 검색 엔진이 요구하는 "루트에 인증 HTML 파일 업로드"는
**레포 루트가 아니라 `static/`에 넣어야** Hugo가 `public/` 루트로 복사한다.
다만 본 PRD는 더 깔끔한 **메타태그 인증 방식**을 기본 채택한다.

---

## 목표

- Google Search Console·Naver Search Advisor에 소유권 인증 완료
- 두 도구에 `sitemap.xml` 제출 → 색인 시작
- 크롤러가 모든 페이지를 따라가도록 `robots.txt`에 Sitemap 명시
- 검색 결과 노출 품질 향상(제목·설명·OG 이미지·구조화 데이터)

### 비목표 (Non-goals)

- 검색 순위(SEO 랭킹) 상위 노출 보장 — 색인 등록까지가 범위
- 유료 광고 / 검색 광고
- 사이트 내부 검색 기능 (이미 `/page/search/` 존재)

---

## 설계

### 1. 소유권 인증 — 메타태그 방식 (권장)

`hugo.yaml`의 `params`에 인증 코드를 두고 `head.html`에서 렌더링한다.
코드 값은 **사용자가 각 콘솔에서 발급**받아 입력한다.

```yaml
# hugo.yaml
params:
  verification:
    google: ""   # Search Console > URL 접두어 > HTML 태그 방식의 content 값
    naver: ""    # Search Advisor > 사이트 등록 > HTML 태그 방식의 content 값
```

```html
<!-- layouts/partials/head.html -->
{{- with .Site.Params.verification.google }}
<meta name="google-site-verification" content="{{ . }}" />
{{- end }}
{{- with .Site.Params.verification.naver }}
<meta name="naver-site-verification" content="{{ . }}" />
{{- end }}
```

> **대안(파일 방식):** 콘솔이 주는 `googleXXXX.html` / `naverXXXX.html`을
> `static/` 에 그대로 넣으면 `public/` 루트로 배포되어 동일하게 인증된다.
> 메타태그 방식이 값 관리·재배포가 쉬워 기본 채택.

### 2. robots.txt — Sitemap 지시어 추가

`enableRobotsTXT: true`는 이미 설정됨. 기본 템플릿이 `User-agent: *`만 출력하므로
커스텀 템플릿으로 교체한다.

```
# layouts/robots.txt  (또는 layouts/_default/robots.txt)
User-agent: *
Allow: /

Sitemap: {{ .Site.BaseURL }}sitemap.xml
```

> Naver 일부 크롤러(`Yeti`)는 robots를 엄격히 따르므로 명시적 `Allow: /` 권장.

### 3. 메타데이터 보강 (head.html)

| 추가 항목 | 목적 |
|-----------|------|
| `og:site_name` | 사이트 이름 노출 |
| `og:image` 기본 폴백 | 글에 image 없을 때 기본 대표 이미지 |
| `og:locale` (`ko_KR`) | 언어 정보 |
| `twitter:card` / `twitter:title` / `twitter:description` / `twitter:image` | 트위터·일부 메신저 미리보기 |
| `article:published_time` (글일 때) | 발행일 |

기본 OG 이미지는 `static/img/og-default.png`(1200×630) 1장 추가.

### 4. 구조화 데이터 (JSON-LD) — Phase 2

글 상세에 `BlogPosting`, 홈에 `WebSite` 스키마를 `head.html`에 주입해
검색 리치 결과(작성자·날짜·제목) 노출 가능성을 높인다.

### 5. Naver 추가 등록

Naver는 sitemap 외에 **RSS 제출**도 지원한다. 홈 RSS(`/index.xml`)가 이미 생성되므로
Search Advisor에서 RSS도 함께 제출한다.

---

## 요구사항

### R1 — robots.txt Sitemap 명시
- `layouts/robots.txt` 커스텀 템플릿 생성
- `Sitemap:` 절대 URL 출력, `Allow: /` 포함

### R2 — 소유권 인증 메타태그
- `hugo.yaml params.verification.{google,naver}` 추가
- `head.html`에서 값이 있을 때만 메타태그 렌더링 (빈 값이면 출력 안 함)

### R3 — 메타데이터 보강
- `og:site_name`, `og:locale`, `og:image` 기본 폴백
- Twitter Card 메타 4종
- 글 페이지에 `article:published_time`

### R4 — 기본 OG 이미지
- `static/img/og-default.png` (1200×630) 추가
- 글 front matter의 `image`가 없을 때 폴백으로 사용

### R5 — 구조화 데이터 (Phase 2)
- 홈: `WebSite` JSON-LD
- 글: `BlogPosting` JSON-LD (headline·datePublished·author·image)

### R6 — 콘솔 등록 (사용자 수동 작업)
- Google Search Console: URL 접두어 `https://uechann.github.io/` 등록 → 메타태그 인증 → sitemap 제출
- Naver Search Advisor: 사이트 등록 → 메타태그 인증 → sitemap + RSS 제출

---

## 작업 분해 / 일정

| Phase | 작업 | 산출물 |
|-------|------|--------|
| **1 (코드)** | robots 템플릿, 인증 메타, OG 보강, 기본 OG 이미지 | R1~R4 |
| **2 (수동)** | 콘솔 인증 코드 발급·입력 → 재배포 → sitemap/RSS 제출 | R6 |
| **3 (선택)** | JSON-LD 구조화 데이터 | R5 |

Phase 1은 코드 변경만으로 완료 가능. Phase 2는 사용자가 콘솔에서 발급한
인증 코드를 `hugo.yaml`에 입력하고 푸시하면 자동 배포된다.

---

## 검증 (Acceptance)

- [ ] `https://uechann.github.io/robots.txt` 에 `Sitemap:` 줄 노출
- [ ] 페이지 소스에 `google-site-verification` / `naver-site-verification` 메타 존재 (코드 입력 후)
- [ ] Google Search Console 소유권 "확인됨" + sitemap "성공" 상태
- [ ] Naver Search Advisor 소유 확인 + sitemap/RSS 수집 성공
- [ ] `site:uechann.github.io` 검색 시 페이지 노출 (색인까지 수일~수주 소요)
- [ ] OG 미리보기(카카오/트위터 디버거)에서 제목·설명·이미지 정상
```
