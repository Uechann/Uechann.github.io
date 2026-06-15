# PRD-07: 커스텀 관리자 페이지

> 상태: ✅ 완료  
> 관련 PRD: [docs/prd/07-admin-ux.md](../prd/07-admin-ux.md)

---

## 구현 요약

Sveltia CMS를 완전히 제거하고, 블로그와 동일한 디자인의 커스텀 어드민 SPA를 구현했다.

---

## 파일 변경

| 파일 | 변경 |
|------|------|
| `static/admin/index.html` | 커스텀 어드민 SPA 전면 재작성 |
| `static/admin/config.yml` | 삭제 (Sveltia CMS 설정 불필요) |

---

## 기능 목록

| 기능 | 설명 |
|------|------|
| PAT 로그인 | GitHub Personal Access Token 입력, sessionStorage 보관 |
| 대시보드 | 카테고리별 글 수 카드, 빠른 글쓰기 버튼 |
| 카테고리 네비게이션 | 사이드바에서 그룹별 카테고리 선택 |
| 글 목록 | 카테고리별 글 목록, 초안/발행 상태 표시 |
| 글 작성 | 카테고리별 기본 템플릿, slug 자동 생성 |
| 글 편집 | 전체 front matter 편집 + EasyMDE 마크다운 에디터 |
| 글 삭제 | 확인 다이얼로그 후 GitHub API로 삭제 |
| 소개 편집 | about 페이지 제목 + 본문 편집 |
| 다크모드 | CSS 변수 + prefers-color-scheme 자동 적용 |
| 토스트 알림 | 저장/발행/삭제/에러 피드백 |

---

## 기술 구현

- **인증**: GitHub PAT → `sessionStorage` (탭 닫으면 자동 삭제)
- **파일 CRUD**: GitHub REST API `/repos/{owner}/{repo}/contents/{path}`
- **한국어 인코딩**: `btoa(unescape(encodeURIComponent(str)))` / `decodeURIComponent(escape(atob(...)))`
- **마크다운 에디터**: EasyMDE (unpkg.com CDN)
- **폰트**: Pretendard Variable (cdn.jsdelivr.net)
- **이벤트**: 단일 document 위임 방식

---

## 접근 방법

```
https://uechann.github.io/admin/
1. GitHub PAT 입력 (repo 권한)
2. 대시보드에서 카테고리 선택
3. 글 목록 → 편집 or + 새 글
4. 작성 후 초안 저장 or 발행
→ GitHub Actions가 자동 빌드·배포 (2~3분)
```
