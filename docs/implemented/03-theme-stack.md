# [완료] PRD-03 — Stack 테마 전환

> 상태: ✅ 구현 완료 (`commit 7ef94bc`)

---

## 구현 내용

### 변경된 파일

| 파일 | 변경 내용 |
|------|----------|
| `.gitmodules` | PaperMod → Hugo Book → **Stack** 순 전환 |
| `themes/hugo-theme-stack/` | Stack submodule 추가 |
| `hugo.yaml` | Stack 전용 설정 완전 재작성 |
| `assets/scss/custom.scss` | 폰트·컬러·카드 hover·한국어 타이포 |
| `layouts/_partials/head/custom-font.html` | Pretendard + JetBrains Mono |
| `content/page/archives/index.md` | 아카이브 특수 페이지 |
| `content/page/search/index.md` | 검색 특수 페이지 |
| `content/posts/*/index.md` | `description` 필드 추가 |
| `archetypes/default.md` | Stack front matter 형식 |
| `static/admin/config.yml` | categories·description·image 필드 추가 |

---

## 적용된 기능

- **카드형 글 목록** — 커버 이미지 + 설명 + 날짜 + 카테고리 배지
- **좌측 사이드바** — 블로그 제목·소개·소셜·메뉴·위젯
- **다크/라이트 모드 토글** — 시스템 설정 자동 연동, 수동 토글 버튼
- **Pretendard 폰트** — 한국어 최적화, dynamic subset
- **JetBrains Mono** — 코드 블록
- **아카이브 페이지** — `/page/archives/`
- **검색 페이지** — `/page/search/` (FlexSearch 기반)
- **카테고리 위젯** — 사이드바에 카테고리 클라우드
- **읽는 시간 표시** — `hasCJKLanguage: true` 로 한국어 계산
- **giscus 댓글 설정 준비** — `repoID·categoryID` 입력 시 즉시 활성화

---

## 사용자가 추가로 해야 할 것

1. **프로필 사진**: `assets/img/avatar.png` 배치 후 `hugo.yaml`의 `sidebar.avatar: "img/avatar.png"` 주석 해제
2. **giscus 댓글**: `https://giscus.app` 에서 repoID·categoryID 발급 → `hugo.yaml` 입력 → `comments.enabled: true`
