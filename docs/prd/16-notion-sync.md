# PRD-16: Notion → Hugo 글 자동 동기화

> 상태: 🔴 미구현
> 우선순위: P1
> 의존: PRD-13 (카테고리 트리, `data/categories.json`) 권장

---

## 배경

현재 글 작성 흐름은 **Notion에 먼저 작성 → 블로그로 수작업 이전**이다.
글마다 본문 복사, 이미지 다운로드/재업로드, front matter 작성, 경로 배치를
하나씩 반복해야 해서 느리고 누락·깨짐이 발생한다.

목표는 **Notion에서 쓴 글(이미지 포함)을 명령 한 번으로 Hugo 콘텐츠로 변환**하고,
다시 실행해도 안전하게 갱신되도록(증분 동기화) 만드는 것이다.

### 현재 블로그 구조 (변환 대상 규격)

- 글은 **페이지 번들**: `content/posts/{섹션}/{slug}/index.md` + 같은 폴더에 이미지 동봉
- front matter 예시:
  ```yaml
  ---
  title: "DNS에서 IP로 주소 변환 과정"
  date: "2026-06-15"
  draft: false
  categories: ["Network"]
  tags: ["DNS", "IP"]
  description: ""
  image: ""
  # series: ["..."] / series_order: 1
  ---
  ```
- 섹션: `java, spring, database, network, infra, troubleshooting, retrospect, wooteco-mission, wooteco-study, wooteco-activity`
- CI(`.github/workflows/hugo.yaml`)에 Node 24 + `npm ci` 단계 이미 존재 → Node 스크립트 운용 가능

---

## 목표

- Notion 글 1개 = 블로그 글 1개로 **자동 변환** (본문·이미지·메타데이터 포함)
- **이미지 누락 0** — Notion의 만료되는 이미지 URL을 즉시 내려받아 번들에 동봉
- **본문 누락 0** — 지원하지 않는 블록도 경고 후 보존 (조용한 손실 금지)
- **증분·멱등** — 재실행 시 바뀐 글만 갱신, 중복 생성 없음
- 로컬에서 `make sync` 한 번으로 실행, 변경 사항은 git diff로 검토 후 커밋

### 비목표

- Notion ↔ 블로그 **양방향** 동기화 (블로그 → Notion 역방향 없음)
- 블로그에서 직접 글쓰기 대체 (Notion이 원본(source of truth))
- 실시간 자동 발행 (기본은 수동 트리거; CI 자동화는 Phase 3 선택)

---

## 접근 방식 비교

| 방안 | 장점 | 단점 | 채택 |
|------|------|------|------|
| **A. Notion API + Node 스크립트** (`@notionhq/client` + `notion-to-md`) | 이미지·메타·증분 완전 제어, 블로그 규격에 맞춤, CI에 Node 이미 있음 | 초기 구현 필요 | ✅ **권장** |
| B. Notion 수동 마크다운 export + 정리 스크립트 | API 토큰 불필요, 가장 단순 | 매번 수동 export, 이미지 경로·콜아웃 깨짐, 증분 불가 | 보조 |
| C. 턴키 도구(notion-hugo 등) | 빠른 도입 | 이 블로그의 카테고리 트리/번들 규격과 안 맞음, 커스터마이즈 한계 | ✕ |

→ **방안 A** 채택. Notion 데이터베이스를 글 저장소(CMS)로 쓰고, 스크립트가 이를 Hugo 번들로 변환한다.

---

## 설계

### 1. Notion 데이터베이스 = 글 CMS

Notion에 글 목록 DB 하나를 만들고, 각 페이지(행)가 글 1개. 속성(properties):

| Notion 속성 | 타입 | Hugo 매핑 | 필수 |
|-------------|------|-----------|------|
| 제목 (Name) | title | `title` | ✅ |
| 카테고리 | select | 섹션 경로 + `categories` (매핑표 경유) | ✅ |
| 태그 | multi-select | `tags` | - |
| 발행일 | date | `date` | ✅ |
| 상태 | select (`작성중`/`발행`) | `draft` (`작성중`→true) | ✅ |
| 슬러그 | text | URL slug (없으면 제목에서 생성) | - |
| 요약 | text | `description` | - |
| 시리즈 | text | `series` | - |
| 순서 | number | `series_order` | - |
| 대표이미지 | files | `image` | - |

### 2. 카테고리 매핑표 — `data/notion-map.json`

Notion select 값을 Hugo 섹션·표시명으로 변환. `data/categories.json` 트리와 일치시킨다.

```json
{
  "Java": { "section": "java", "category": "Java" },
  "Spring": { "section": "spring", "category": "Spring" },
  "네트워크": { "section": "network", "category": "Network" },
  "트러블슈팅": { "section": "troubleshooting", "category": "Troubleshooting" }
}
```

> 매핑에 없는 카테고리를 만나면 **중단하고 경고** (잘못된 경로로 글이 새는 것 방지).

### 3. 동기화 흐름

```
1. NOTION_TOKEN으로 DB 쿼리 (상태=발행 또는 전체)
2. 각 페이지마다:
   a. last_edited_time을 매니페스트와 비교 → 변경 없으면 skip
   b. notion-to-md로 블록 → 마크다운 변환
   c. 본문/대표 이미지의 (만료되는) URL 즉시 다운로드
        → content/posts/{섹션}/{slug}/ 에 저장, 경로를 상대경로로 치환
   d. 속성으로 front matter 생성 (notionID, notionEdited 포함)
   e. index.md 작성
3. 매니페스트(data/notion-sync.json) 갱신
4. 변환 리포트 출력 (성공 N, 스킵 N, 미지원 블록 경고 목록)
```

### 4. 멱등·증분 — `data/notion-sync.json` 매니페스트

```json
{
  "<notion-page-id>": {
    "path": "content/posts/network/dns-ip",
    "lastEdited": "2026-06-15T05:00:00.000Z",
    "slug": "dns-ip"
  }
}
```

- `lastEdited`가 같으면 재변환 skip → 빠르고 git diff 깔끔
- slug 변경 감지 시 기존 번들 폴더 이동(또는 경고)
- Notion에서 삭제된 글: 매니페스트에는 있고 DB에 없는 항목 → 기본은 **경고만**(자동 삭제 안 함), `--prune` 옵션 시 삭제

### 5. 이미지 처리 (누락 0 핵심)

- Notion 이미지 URL은 **서명된 S3 링크로 ~1시간 후 만료** → 변환 즉시 다운로드 필수
- 저장 위치: 글 번들 폴더에 동봉 (`content/posts/{섹션}/{slug}/img-{n}.png`)
- 파일명: 블록 ID 해시로 결정 → 재실행 시 동일 파일 재사용(중복 방지)
- 마크다운 경로를 상대경로(`./img-1.png`)로 치환, **caption → alt 텍스트** 보존
- 대표이미지(files 속성)도 동일하게 받아 `image` front matter에 설정

### 6. 블록 변환 커버리지 (본문 누락 0)

| Notion 블록 | 변환 결과 |
|-------------|-----------|
| heading 1~3 | `##`, `###`, `####` |
| 문단/볼드/이탤릭/코드/링크 | 마크다운 인라인 |
| bulleted / numbered / to-do | `-`, `1.`, `- [ ]` |
| code (언어 포함) | ```` ```lang ```` |
| quote | `>` |
| callout | `>` 인용 + 이모지 (또는 셔트코드) |
| toggle | `<details><summary>` |
| table | 마크다운 표 |
| image / 캡션 | `![caption](./img-n.png)` |
| divider | `---` |
| bookmark / embed / video / file | 링크 또는 셔트코드 |
| equation | `$$ ... $$` (KaTeX, 별도 도입 필요 시 표기) |
| column / column_list | 순차 평탄화 |

> **핵심 원칙:** 매핑 없는 블록을 만나면 **건너뛰지 말고** 플레이스홀더(`<!-- 미지원 블록: callout_xxx -->`)를 남기고 리포트에 집계 → 사람이 확인 가능.

### 7. 실행 방식

- 로컬: `make sync` (= `node scripts/notion-sync.mjs`), `.env`의 `NOTION_TOKEN`/`NOTION_DB_ID` 사용
- 변환 후 `hugo server`로 미리보기 → git diff 검토 → 커밋
- (Phase 3, 선택) GitHub Actions `workflow_dispatch` 또는 cron으로 자동 변환 → PR 생성. 토큰은 repo secret.

---

## 요구사항

### R1 — Notion DB 스키마 정의
- 위 속성표대로 Notion DB 구성 (사용자 작업), Integration 연결 및 토큰 발급

### R2 — 동기화 스크립트 (`scripts/notion-sync.mjs`)
- `@notionhq/client` + `notion-to-md` 기반
- DB 쿼리 → 페이지별 마크다운 변환 → 번들 작성
- `package.json` 추가(의존성), `.env.example` 제공

### R3 — 카테고리 매핑 (`data/notion-map.json`)
- Notion select → 섹션/표시명, 미정의 값은 중단+경고

### R4 — 이미지 다운로드·동봉
- 만료 전 즉시 다운로드, 번들에 저장, 상대경로 치환, caption→alt, 블록ID 해시로 중복 방지

### R5 — front matter 생성
- title/date/draft/categories/tags/description/image/series/series_order
- `notionID`, `notionEdited` 메타 포함(증분·추적용)

### R6 — 증분·멱등 (`data/notion-sync.json`)
- lastEdited 비교로 변경분만 변환, slug 변경/삭제 처리, `--prune` 옵션

### R7 — 블록 커버리지 + 변환 리포트
- 위 매핑표 지원, 미지원 블록은 플레이스홀더+리포트(조용한 손실 금지)

### R8 — 실행 진입점
- `make sync` 타깃 추가, README/`docs`에 사용법, `.gitignore`에 `.env`

### R9 — (선택) CI 자동화
- `workflow_dispatch` 워크플로, secret으로 토큰 주입, 변경 시 PR 생성

---

## 작업 분해 / 일정

| Phase | 작업 | 산출물 |
|-------|------|--------|
| **0 (준비)** | Notion DB·Integration 구성, 토큰 발급 | R1 (사용자) |
| **1 (핵심)** | 스크립트·매핑·이미지·front matter·매니페스트 | R2~R6 |
| **2 (안전망)** | 블록 커버리지·리포트·`make sync`·문서 | R7~R8 |
| **3 (선택)** | CI 자동 동기화 + PR | R9 |

---

## 리스크 / 결정 필요

- **이미지 URL 만료(~1h):** 변환과 다운로드를 한 번에 처리. 대용량 글은 실행 시간 증가 가능.
- **Notion API rate limit(~3 req/s):** 페이지 수 많으면 백오프/딜레이 필요.
- **수식(KaTeX):** Notion equation을 살리려면 블로그에 KaTeX 렌더링 도입 필요 → 별도 결정.
- **source of truth:** Notion이 원본. 블로그에서 직접 수정하면 다음 sync에서 덮어쓰일 수 있음(원칙으로 명시).
- **카테고리 트리 의존:** PRD-13 트리와 매핑표를 일치시켜야 경로 안정.

---

## 검증 (Acceptance)

- [ ] `make sync` 1회로 Notion 발행 글이 `content/posts/...`에 번들로 생성
- [ ] 글 내 모든 이미지가 번들에 다운로드되고 상대경로로 표시 (외부 링크 0)
- [ ] front matter가 Notion 속성과 일치 (카테고리/태그/날짜/시리즈)
- [ ] 재실행 시 변경 없는 글은 skip, 변경 글만 갱신 (git diff 최소)
- [ ] 미지원 블록이 있으면 리포트에 집계되고 본문에 플레이스홀더로 보존
- [ ] `hugo build` 성공 및 로컬 미리보기에서 글·이미지 정상 렌더
