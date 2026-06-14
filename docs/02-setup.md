# Hugo 블로그 구축 작업 기록

## 개요

Hugo (extended) + PaperMod 테마 + GitHub Pages + Sveltia CMS 조합으로 개인 기술 블로그를 구축한 작업 기록입니다.

- **사이트 주소**: https://uechann.github.io
- **레포지토리**: https://github.com/Uechann/Uechann.github.io
- **구축일**: 2026-06-14

---

## 최종 디렉토리 구조

```
Uechann.github.io/
├── .github/
│   └── workflows/
│       └── hugo.yaml          # GitHub Actions 자동 빌드·배포 워크플로우
├── archetypes/
│   └── default.md             # hugo new content 시 기본 템플릿
├── content/
│   └── posts/
│       └── hello-world/
│           └── index.md       # 샘플 글 (page bundle 구조)
├── docs/
│   ├── initialize.md          # 초기 구축 작업서
│   └── setup.md               # 이 파일 — 구축 상세 기록
├── static/
│   └── admin/
│       ├── index.html         # Sveltia CMS 진입점
│       └── config.yml         # CMS 백엔드·컬렉션 설정
├── themes/
│   └── PaperMod/              # git submodule (adityatelange/hugo-PaperMod)
├── .gitignore
├── .gitmodules
└── hugo.yaml                  # Hugo 사이트 설정
```

---

## 수행 작업 상세

### 1. Hugo extended 설치

```bash
brew install hugo
# 설치 버전: hugo v0.163.1+extended+withdeploy darwin/arm64
```

`extended` 빌드가 필요한 이유: PaperMod 테마가 SCSS 처리를 위해 Hugo extended를 요구하기 때문.

---

### 2. Hugo 사이트 초기화

이미 git 레포가 존재하는 디렉토리에 Hugo 사이트를 생성했기 때문에 `--force` 플래그를 사용했습니다.

```bash
hugo new site . --force --format yaml
```

`--format yaml`을 지정해 설정 파일을 `hugo.toml` 대신 `hugo.yaml`로 생성.

---

### 3. PaperMod 테마 추가 (git submodule)

```bash
git submodule add --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
```

- `--depth=1`: 전체 git 이력 대신 최신 커밋만 받아 클론 속도를 줄임
- submodule 방식을 선택한 이유: 테마 업스트림 업데이트를 `git submodule update --remote`로 간단히 적용 가능

`.gitmodules`에 다음 내용이 자동 생성됩니다:

```ini
[submodule "themes/PaperMod"]
	path = themes/PaperMod
	url = https://github.com/adityatelange/hugo-PaperMod.git
	shallow = true
```

---

### 4. `hugo.yaml` 작성

```yaml
baseURL: "https://uechann.github.io/"
locale: "ko-kr"
title: "의찬의 개발 블로그"
theme: "PaperMod"
enableRobotsTXT: true
buildDrafts: false
buildFuture: false
pagination:
  pagerSize: 10
minify:
  disableXML: true
params:
  env: production
  description: "백엔드 개발 학습 기록과 트러블슈팅"
  defaultTheme: auto
  ShowReadingTime: true
  ShowPostNavLinks: true
  ShowCodeCopyButtons: true
  ShowToc: true
  TocOpen: false
  homeInfoParams:
    Title: "안녕하세요 👋"
    Content: "백엔드 개발을 공부하며 마주친 문제와 해결 과정을 기록합니다."
  socialIcons:
    - name: github
      url: "https://github.com/Uechann"
menu:
  main:
    - identifier: posts
      name: 글
      url: /posts/
      weight: 10
    - identifier: tags
      name: 태그
      url: /tags/
      weight: 20
caches:
  images:
    dir: :cacheDir/images
```

**주요 결정 사항:**

| 키 | 값 | 이유 |
|---|---|---|
| `locale` | `ko-kr` | `languageCode`는 Hugo v0.158.0에서 deprecated됨 |
| `buildDrafts` | `false` | `draft: true` 글이 실수로 배포되는 것을 방지 |
| `minify.disableXML` | `true` | RSS XML minify 시 파싱 오류 방지 |
| `caches.images.dir` | `:cacheDir/images` | GitHub Actions 빌드 캐시 경로와 연동 |

---

### 5. GitHub Actions 워크플로우 작성

`.github/workflows/hugo.yaml` — main 브랜치에 push할 때마다 자동으로 빌드·배포됩니다.

**워크플로우 흐름:**

```
push to main
    │
    ▼
[build job]
  1. actions/checkout (submodules: recursive)
  2. Setup Go, Node.js
  3. actions/configure-pages
  4. Install Dart Sass
  5. Install Hugo extended (linux-amd64)
  6. npm ci (package.json이 있을 때만)
  7. Cache restore (runner.temp/hugo_cache)
  8. hugo build --gc --minify
  9. Cache save
 10. Upload artifact (./public)
    │
    ▼
[deploy job]
 11. actions/deploy-pages
```

**환경 변수 버전 정보:**

| 도구 | 버전 |
|---|---|
| Dart Sass | 1.100.0 |
| Go | 1.26.3 |
| Hugo | 0.163.0 |
| Node.js | 24.16.0 |

**권한 설정:**

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

GitHub Pages 배포에 필요한 최소 권한만 부여합니다.

---

### 6. 샘플 글 — page bundle 구조

`content/posts/hello-world/index.md`

```
content/posts/hello-world/
└── index.md
```

page bundle 방식을 사용하는 이유:
- 글과 이미지를 같은 폴더에 관리 → 경로 관리가 단순
- 이미지를 상대경로로 참조: `![설명](image.png)`
- Hugo가 이미지를 해당 글의 URL 경로 아래로 서빙

---

### 7. Sveltia CMS 설정

브라우저에서 직접 글을 작성·발행하기 위한 관리자 페이지입니다.

#### `static/admin/index.html`

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Content Manager</title>
  </head>
  <body>
    <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
  </body>
</html>
```

Hugo 빌드 시 `static/` 하위 파일은 그대로 `public/`으로 복사되므로, `/admin/` 경로에서 자동으로 서빙됩니다.

#### `static/admin/config.yml`

```yaml
backend:
  name: github
  repo: Uechann/Uechann.github.io
  branch: main

media_folder: "assets/uploads"
public_folder: "/assets/uploads"

collections:
  - name: "posts"
    label: "글"
    folder: "content/posts"
    create: true
    path: "{{slug}}/index"
    fields:
      - { label: "제목",  name: "title", widget: "string" }
      - { label: "작성일", name: "date",  widget: "datetime" }
      - { label: "초안",  name: "draft", widget: "boolean", default: false }
      - { label: "태그",  name: "tags",  widget: "list", required: false }
      - { label: "본문",  name: "body",  widget: "markdown" }
```

**인증 방식 — PAT (개인 액세스 토큰):**

단일 사용자 운영이므로 OAuth 서버 없이 PAT로 로그인합니다.
- `https://uechann.github.io/admin/` 접속
- "토큰으로 로그인(Sign in with Token)" 선택
- GitHub PAT 입력 → 즉시 사용 가능

**`path: "{{slug}}/index"` 설정의 의미:**

CMS에서 새 글을 만들면 `content/posts/<slug>/index.md` 형태(page bundle)로 저장됩니다. 로컬 작성 방식과 동일한 구조를 유지합니다.

---

### 8. `.gitignore`

```
/public/
/resources/_gen/
.hugo_build.lock
```

| 항목 | 이유 |
|---|---|
| `/public/` | Hugo 빌드 산출물. 레포에 올리지 않고 CI가 매번 생성 |
| `/resources/_gen/` | Hugo 내부 캐시 (SCSS 처리 결과 등). 로컬 전용 |
| `.hugo_build.lock` | Hugo 빌드 중 생성되는 락 파일 |

---

### 9. 빌드 검증

```bash
hugo build --gc --minify
# 결과: 14 Pages, 2 Static files, 35ms
```

빌드 성공. PaperMod 테마 내부에서 발생하는 deprecation 경고 2건은 테마 코드 문제로, 동작에는 영향 없습니다.

---

## 배포 후 사용자가 해야 할 작업

### GitHub Pages 소스 변경 (브라우저)

1. `https://github.com/Uechann/Uechann.github.io/settings/pages` 접속
2. **Source** → `GitHub Actions` 선택

### Push

```bash
git push -u origin main
```

### 배포 확인

- Actions 탭: `https://github.com/Uechann/Uechann.github.io/actions`
- 사이트: `https://uechann.github.io`

---

## 이후 글 작성 방법

### 방법 1 — 웹 에디터 (Sveltia CMS)

1. `https://uechann.github.io/admin/` 접속
2. PAT로 로그인
3. 새 글 작성 → Publish
4. 자동 커밋 → Actions 빌드 → 수 분 후 사이트 반영

### 방법 2 — 로컬 작성

```bash
mkdir content/posts/<글-슬러그>
# content/posts/<글-슬러그>/index.md 작성
# 이미지는 같은 폴더에 두고 상대경로로 참조
git add content/posts/<글-슬러그>/
git commit -m "post: <글 제목>"
git push
```

### 방법 3 — GitHub 웹 에디터

레포 페이지에서 `.` 키 → github.dev에서 마크다운 파일 직접 편집·커밋

---

## 트러블슈팅 메모

### `languageCode` deprecation 경고

Hugo v0.158.0부터 `languageCode` 대신 `locale`을 사용해야 합니다. `hugo.yaml`에 이미 `locale`로 작성되어 있습니다.

### PaperMod 테마 deprecation 경고

`.Language.LanguageDirection`, `.Language.LanguageCode` 관련 경고는 PaperMod 테마 내부 레이아웃 코드에서 발생합니다. 테마 업스트림에서 수정될 예정이며 현재 빌드와 동작에는 영향 없습니다.

### Submodule이 빠진 경우

클론 후 `themes/PaperMod`가 비어 있다면:

```bash
git submodule update --init --recursive
```
