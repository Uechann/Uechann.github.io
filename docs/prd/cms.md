# PRD-02 — Sveltia CMS 관리자 페이지 접속 문제 해결

## 문제 현상

`https://uechann.github.io/admin/` 접속이 안 되거나, 접속해도 로그인·글 작성이 정상 동작하지 않는다.

---

## 원인 분석

Sveltia CMS admin 페이지가 동작하려면 아래 조건이 **모두** 충족되어야 한다. 현재 상태에서 막히는 지점을 단계별로 정리한다.

---

### 원인 1 — 사이트가 배포되지 않음 (가장 유력)

**증상**: `/admin/` 접속 자체가 안 됨 (404)

현재 `git push`가 아직 이루어지지 않았으므로 GitHub Pages에 사이트가 없다. CMS 페이지는 Hugo 빌드 산출물인 `public/admin/`이 GitHub Pages에 올라가야 접근 가능하다.

**해결 방법:**

```
1. GitHub 레포 Settings > Pages > Source = "GitHub Actions" 변경 (브라우저)
2. git push -u origin main
3. Actions 탭에서 워크플로우 초록불 확인
4. https://uechann.github.io/admin/ 재접속
```

---

### 원인 2 — GitHub PAT 권한 부족

**증상**: CMS 로그인 화면에서 "토큰으로 로그인" 입력 후 오류 또는 빈 화면

Sveltia CMS가 GitHub API를 통해 레포에 파일을 읽고 쓰려면 PAT에 충분한 권한이 필요하다.

**필요한 PAT 권한:**

| 권한 | 이유 |
|------|------|
| `repo` (전체) | `content/`, `assets/` 폴더 읽기·쓰기·커밋 |
| `workflow` | Actions 트리거 (직접 커밋 후 Actions가 자동 실행되므로 없어도 됨) |

**Classic Token 발급 방법:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)" 클릭
3. `repo` 전체 스코프 체크
4. 만료 기간: 90일 또는 No expiration (개인 블로그이므로 No expiration 무방)
5. 생성된 토큰 복사 (이후 다시 볼 수 없음)

---

### 원인 3 — `config.yml` 백엔드 설정 불일치

**증상**: CMS가 로드됐지만 레포에 연결이 안 됨

현재 `static/admin/config.yml`:

```yaml
backend:
  name: github
  repo: Uechann/Uechann.github.io
  branch: main
```

주의사항:
- `repo`의 대소문자가 실제 GitHub 레포명과 **정확히** 일치해야 한다.
- GitHub 유저명이 `Uechann`인지 확인 필요 (대소문자 구분).

**확인 방법:**
```bash
gh repo view Uechann/Uechann.github.io --json name,owner
```

---

### 원인 4 — Content Security Policy (CSP) 차단

**증상**: 페이지는 뜨지만 CMS 스크립트가 로드되지 않음 (브라우저 콘솔에 CSP 오류)

현재 `static/admin/index.html`은 `unpkg.com`에서 스크립트를 로드한다:

```html
<script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
```

GitHub Pages 자체는 CSP 헤더를 강제하지 않으므로 기본적으로 문제없으나, 향후 `_headers` 파일이나 meta 태그로 CSP를 추가할 경우 `unpkg.com`을 명시적으로 허용해야 한다.

**예방적 수정** (선택):

```html
<!-- static/admin/index.html -->
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'self'; script-src 'self' https://unpkg.com; connect-src 'self' https://api.github.com https://uploads.github.com">
  <title>Content Manager</title>
</head>
```

---

### 원인 5 — 로컬 개발 환경에서 CMS 테스트 불가

**증상**: `hugo server`로 띄운 `http://localhost:1313/admin/`에서 CMS가 GitHub에 연결 안 됨

`backend.name: github`는 **실제 배포된 사이트에서만** 동작한다. 로컬에서 CMS UI 자체를 테스트하려면 `local_backend`를 활성화해야 한다.

**로컬 개발용 설정 추가:**

`static/admin/config.yml`에 추가:
```yaml
local_backend: true
```

그리고 별도 터미널에서 Sveltia CMS 프록시 서버 실행:
```bash
npx @sveltia/cms-backend
```

> 주의: `local_backend: true`는 로컬 파일시스템에 직접 쓰는 개발 모드이므로, 실제 배포 시에는 이 줄을 제거하거나 조건부로 분기해야 한다.

---

## 해결 로드맵

### 즉시 해결 (배포만 하면 됨)

```
Step 1. GitHub Pages Source 변경 (브라우저)
         레포 Settings > Pages > Source = GitHub Actions

Step 2. Push
         git push -u origin main

Step 3. Actions 초록불 확인 후 /admin 접속
         https://uechann.github.io/admin/

Step 4. "Sign in with Token" 클릭 → Classic PAT (repo 스코프) 입력
```

### 선택적 개선

| 항목 | 파일 | 작업 |
|------|------|------|
| CSP 명시 | `static/admin/index.html` | meta CSP 태그 추가 |
| 로컬 개발 지원 | `static/admin/config.yml` | `local_backend: true` 추가 (배포 전 제거) |
| PAT 만료 알림 | — | PAT 캘린더 만료일 등록 (수동) |

---

## 장기 개선 — OAuth 서버 경유 로그인

현재는 PAT를 직접 붙여 넣는 방식이다. 팀원이 생기거나 "GitHub으로 로그인" 버튼 방식을 원한다면 OAuth 서버가 필요하다.

**구현 방법 (단일 사용자도 편의를 위해 선택 가능):**

1. Cloudflare Workers에 [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) 배포
2. GitHub OAuth 앱 등록 (`https://github.com/settings/applications/new`)
   - Homepage URL: `https://uechann.github.io`
   - Callback URL: `https://<worker-url>/callback`
3. `static/admin/config.yml` 수정:

```yaml
backend:
  name: github
  repo: Uechann/Uechann.github.io
  branch: main
  base_url: https://<worker-url>
```

이후 로그인 버튼 클릭 → GitHub 인증 → 자동 리다이렉트로 로그인 완료.

---

## 체크리스트

- [ ] GitHub Pages Source → GitHub Actions 변경
- [ ] `git push` 완료 및 Actions 초록불 확인
- [ ] `https://uechann.github.io/admin/` 접속 확인
- [ ] GitHub Classic PAT (`repo` 스코프) 발급
- [ ] CMS 로그인 → 테스트 글 작성 → 사이트 반영 확인
- [ ] (선택) `local_backend: true` 개발 환경 설정
- [ ] (선택) Cloudflare Workers OAuth 서버 구축
