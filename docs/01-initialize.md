# Hugo 개인 기술 블로그 구축 작업서 (for Claude Code)

> 이 문서는 Hugo + PaperMod로 GitHub Pages 기반 개인 기술 블로그를 구축하기 위한
> 실행 작업서입니다. Claude Code는 아래 "Claude Code가 수행할 작업"을 순서대로
> 실행하고, "사람이 직접 해야 하는 작업"은 사용자에게 안내만 하세요.

---

## 1. 목표

- 백엔드 학습 기록·트러블슈팅을 공개하고, 취업 포트폴리오로 제출 가능한 개인 기술 블로그를 만든다.
- 정적 사이트 생성기(Hugo) + GitHub Pages 무료 호스팅 + GitHub Actions 자동 배포.
- 글은 마크다운으로 작성하고, 이미지는 글과 함께 본인 도메인에서 서빙한다.
- **웹 브라우저에서 직접 글을 작성·발행**할 수 있도록 Sveltia CMS(`/admin`)를 함께 구성한다.

## 2. 기술 스택 / 확정된 결정사항

| 항목 | 선택 | 이유 |
|------|------|------|
| 정적 사이트 생성기 | **Hugo (extended)** | 단일 바이너리, 빠른 빌드, Ruby 의존성 없음 |
| 테마 | **PaperMod** | 개발 블로그 표준, 깔끔하고 빠름, 문서 풍부 |
| 호스팅 | **GitHub Pages** | 무료, push-to-deploy |
| 배포 | **GitHub Actions** (공식 워크플로우) | Pages가 Hugo를 자체 빌드하지 않으므로 Actions로 빌드 |
| 이미지 관리 | **page bundle 방식** | 글 폴더 안에 이미지를 함께 두어 관리 용이 |
| 웹 글쓰기 | **Sveltia CMS** + PAT 인증 | velog 같은 브라우저 에디터, 단일 사용자는 OAuth 서버 불필요 |
| 레포명 | **`Uechann.github.io`** (user site) | 주소가 `https://uechann.github.io`로 깔끔하게 떨어짐 |

## 3. 사람이 직접 해야 하는 작업 (Claude Code가 할 수 없음)

1. GitHub에서 `Uechann.github.io` 이름의 **빈 레포 생성** (`gh` CLI가 인증돼 있다면 `gh repo create Uechann/Uechann.github.io --public`로 대체 가능).
2. 레포 **Settings > Pages > Source** 를 `GitHub Actions`로 변경 (브라우저에서만 가능, 저장 버튼 없이 즉시 적용).
3. `git push` 시 GitHub 인증(토큰/SSH)이 필요하면 사용자가 처리.
4. **(웹 글쓰기용) GitHub 개인 액세스 토큰(PAT) 발급** — Sveltia CMS 로그인 화면이 안내하는 링크에서 발급. Claude Code가 대신 생성하지 말 것.
5. (선택, 나중에) 개인 도메인 구매 + DNS 설정.

> 위 항목들은 자격증명·브라우저 설정·결제가 얽혀 있으므로 Claude Code가 대신 수행하지 말고
> 사용자에게 단계별로 안내할 것.

---

## 4. Claude Code가 수행할 작업 (순서대로)

### Step 1 — Hugo extended 설치 확인

```bash
hugo version   # 'extended'가 출력에 포함돼 있어야 함
# 없으면 (macOS):
brew install hugo
```

### Step 2 — 사이트 생성 + git 초기화

```bash
hugo new site myblog --format yaml
cd myblog
git init
git branch -M main
```

### Step 3 — PaperMod 테마 추가 (submodule)

```bash
git submodule add --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
```

### Step 4 — `hugo.yaml` 작성

루트의 `hugo.yaml` 파일 내용을 아래로 교체:

```yaml
baseURL: "https://uechann.github.io/"
languageCode: "ko-kr"
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
# GitHub Actions 빌드 캐시용 (공식 권장)
caches:
  images:
    dir: :cacheDir/images
```

### Step 5 — 배포 워크플로우 작성

`.github/workflows/hugo.yaml` 파일을 생성하고 아래 내용을 그대로 넣을 것
(현재 Hugo 공식 워크플로우 기준. 버전 숫자는 추후 갱신 가능):

```yaml
name: Build and deploy
on:
  push:
    branches:
      - main
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
defaults:
  run:
    shell: bash
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      DART_SASS_VERSION: 1.100.0
      GO_VERSION: 1.26.3
      HUGO_VERSION: 0.163.0
      NODE_VERSION: 24.16.0
      TZ: Asia/Seoul
    steps:
      - name: Checkout
        uses: actions/checkout@v6
        with:
          submodules: recursive
          fetch-depth: 0
      - name: Setup Go
        uses: actions/setup-go@v6
        with:
          go-version: ${{ env.GO_VERSION }}
          cache: false
      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: ${{ env.NODE_VERSION }}
      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v6
      - name: Create directory for user-specific executable files
        run: mkdir -p "${HOME}/.local"
      - name: Install Dart Sass
        run: |
          curl -sLJO "https://github.com/sass/dart-sass/releases/download/${DART_SASS_VERSION}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
          tar -C "${HOME}/.local" -xf "dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
          rm "dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
          echo "${HOME}/.local/dart-sass" >> "${GITHUB_PATH}"
      - name: Install Hugo
        run: |
          curl -sLJO "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz"
          mkdir "${HOME}/.local/hugo"
          tar -C "${HOME}/.local/hugo" -xf "hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz"
          rm "hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz"
          echo "${HOME}/.local/hugo" >> "${GITHUB_PATH}"
      - name: Install Node.js dependencies
        run: '[[ -f package-lock.json || -f npm-shrinkwrap.json ]] && npm ci || true'
      - name: Configure Git
        run: git config --global core.quotepath false
      - name: Cache restore
        id: cache-restore
        uses: actions/cache/restore@v5
        with:
          path: ${{ runner.temp }}/hugo_cache
          key: hugo-${{ github.run_id }}
          restore-keys: hugo-
      - name: Build the site
        run: |
          hugo build \
            --gc \
            --minify \
            --baseURL "${{ steps.pages.outputs.base_url }}/" \
            --cacheDir "${{ runner.temp }}/hugo_cache"
      - name: Cache save
        id: cache-save
        uses: actions/cache/save@v5
        with:
          path: ${{ runner.temp }}/hugo_cache
          key: ${{ steps.cache-restore.outputs.cache-primary-key }}
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v5
        with:
          path: ./public
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

### Step 6 — 샘플 글을 page bundle로 생성

이미지를 글과 함께 묶는 page bundle 구조의 예시를 만들어, 글쓰기 패턴을 잡아둔다.

```bash
mkdir -p content/posts/hello-world
```

`content/posts/hello-world/index.md` 내용:

```markdown
---
title: "블로그를 시작하며"
date: 2026-06-14
draft: false
tags: ["회고"]
---

백엔드 학습 기록과 트러블슈팅을 정리하는 공간을 만들었습니다.

<!-- 이미지를 추가할 때는 이 폴더(content/posts/hello-world/)에
     이미지 파일을 넣고 아래처럼 상대경로로 참조합니다. -->
<!-- ![설명](example.png) -->
```

### Step 7 — Sveltia CMS admin 페이지 추가 (웹 글쓰기)

브라우저에서 글을 작성·발행하기 위한 관리자 페이지를 만든다. 파일 두 개를 `static/admin/`에
두면 Hugo가 빌드 시 `/admin/`으로 복사하여 `https://uechann.github.io/admin/`에서 접근 가능.

`static/admin/index.html`:

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

`static/admin/config.yml`:

```yaml
backend:
  name: github
  repo: Uechann/Uechann.github.io
  branch: main

# CMS에서 업로드한 이미지 저장 위치 (레포 경로 → 본인 도메인에서 서빙됨)
media_folder: "assets/uploads"
public_folder: "/assets/uploads"

collections:
  - name: "posts"
    label: "글"
    folder: "content/posts"
    create: true
    path: "{{slug}}/index"   # page bundle 구조(content/posts/<slug>/index.md)로 생성
    fields:
      - { label: "제목", name: "title", widget: "string" }
      - { label: "작성일", name: "date", widget: "datetime" }
      - { label: "초안", name: "draft", widget: "boolean", default: false }
      - { label: "태그", name: "tags", widget: "list", required: false }
      - { label: "본문", name: "body", widget: "markdown" }
```

> 참고: 위 설정은 단일 사용자 기준 **PAT(개인 액세스 토큰) 인증**을 전제로 한다.
> GitHub Pages는 정적 호스팅이라 보통 OAuth 서버가 필요하지만, 혼자 쓰는 경우
> Sveltia 로그인 화면의 "토큰으로 로그인"을 쓰면 OAuth 앱/서버 없이 바로 된다.
> CMS 업로드 이미지는 `assets/uploads/`에 저장되며, 본인 도메인에서 서빙되므로 문제없다.
> (로컬에서 직접 쓰는 글은 기존 page bundle 방식으로 이미지를 글 폴더에 두면 된다 — 두 방식 공존 가능.)

### Step 8 — 로컬 빌드 확인

```bash
hugo server -D
# http://localhost:1313 에서 정상 렌더 확인 후 Ctrl+C
```

> 로컬에서 정상 렌더되는 걸 확인한 뒤 push하는 것이 디버깅에 훨씬 유리하다.

### Step 9 — 원격 연결 후 푸시

```bash
# .gitignore에 빌드 산출물 제외
echo "/public/" >> .gitignore
echo "/resources/_gen/" >> .gitignore
echo ".hugo_build.lock" >> .gitignore

git add -A
git commit -m "init hugo blog with PaperMod + Sveltia CMS"
git remote add origin https://github.com/Uechann/Uechann.github.io.git
git push -u origin main   # 인증이 필요하면 사용자에게 안내
```

---

## 5. 배포 확인 (사람이 확인)

1. 레포의 **Actions** 탭에서 워크플로우가 도는지 확인.
2. 상태 표시가 초록색으로 바뀌면 `https://uechann.github.io` 접속해 확인.
3. 이후로는 `main`에 push할 때마다 자동 재배포된다.

---

## 6. 웹에서 글쓰기 (Sveltia CMS 사용법)

배포가 끝나면 브라우저만으로 글을 작성·발행할 수 있다.

1. `https://uechann.github.io/admin/` 접속.
2. 로그인 화면에서 **"토큰으로 로그인(Sign in with Token)"** 선택.
3. 안내되는 링크로 이동하면 필요한 권한이 미리 선택된 GitHub PAT 발급 페이지가 열림 → 토큰 생성 후 붙여넣기.
4. 에디터에서 새 글 작성, 이미지는 드래그로 업로드.
5. **저장(Publish)** 하면 레포에 자동 커밋 → Actions가 빌드·배포 → 잠시 후 사이트에 반영.

> 모바일 브라우저에서도 동작한다. velog처럼 "GitHub으로 로그인" 원클릭을 원하면,
> Cloudflare Workers에 Sveltia CMS Authenticator를 배포하고 GitHub OAuth 앱을 등록한 뒤
> `config.yml`의 `backend`에 `base_url: <Worker URL>`을 추가하면 된다 (단일 사용자는 불필요).

---

## 7. 이후 글 작성 워크플로우 (참고)

세 가지 방법을 자유롭게 섞어 쓸 수 있다 (모든 글은 결국 레포 안의 마크다운 파일).

1. **웹 에디터 (Sveltia CMS)**: `uechann.github.io/admin`에서 작성·발행. (위 6번)
2. **로컬 + git push**: `hugo new content posts/<글>/index.md` 작성 후 push.
3. **GitHub 웹 에디터 / github.dev**: 레포에서 `.md`를 브라우저로 직접 편집·커밋. (레포 화면에서 `.` 키 → github.dev)

### 이미지 규칙 (로컬 작성 시, page bundle)

```
content/posts/<글-슬러그>/
├── index.md        # 본문
├── diagram.png     # 이미지는 같은 폴더에
└── error-log.png
```

본문에서는 상대경로로 참조: `![에러 로그](error-log.png)`
→ 본인 블로그 도메인(`uechann.github.io/...`)에서 그대로 서빙됨.
큰 이미지는 커밋 전 압축·리사이즈하여 레포 비대화 방지.
(CMS로 작성할 때 업로드한 이미지는 `assets/uploads/`에 저장됨 — 역시 본인 도메인에서 서빙.)

---

## 8. (선택, 나중에) 개인 도메인 연결

1. 도메인 구매.
2. `static/CNAME` 파일에 도메인만 한 줄 기입.
3. DNS에서 CNAME(또는 A) 레코드를 GitHub Pages로 지정.
4. 레포 Settings > Pages에서 커스텀 도메인 입력 + Enforce HTTPS.

> PAT 인증 방식은 커스텀 도메인의 영향을 받지 않는다. (OAuth 방식을 쓸 경우에만
> OAuth 앱의 콜백 URL을 새 도메인에 맞춰 갱신하면 된다.)

---

## 9. 완료 체크리스트

- [ ] `hugo version`에 extended 포함 확인
- [ ] PaperMod submodule 추가됨 (`themes/PaperMod` 존재)
- [ ] `hugo.yaml` 작성됨
- [ ] `.github/workflows/hugo.yaml` 작성됨
- [ ] 샘플 글 page bundle 생성됨
- [ ] `static/admin/index.html` + `static/admin/config.yml` 작성됨
- [ ] `hugo server`로 로컬 렌더 확인 (`/admin/` 페이지 로드 확인 포함)
- [ ] `.gitignore`에 `/public/` 등 추가
- [ ] (사람) GitHub 레포 생성
- [ ] (사람) Settings > Pages > Source = GitHub Actions
- [ ] push 후 Actions 초록불 + 사이트 접속 확인
- [ ] (사람) `/admin`에서 PAT로 로그인 → 테스트 글 작성·발행 확인