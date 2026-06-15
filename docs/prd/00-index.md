# 제품 요구사항 문서 (PRD) 인덱스

> 구현 완료된 항목은 `docs/implemented/`로 이동합니다.
> 이 파일에는 **미구현·진행 중** 항목만 관리합니다.

---

## 미구현 PRD 목록 (우선순위 순)

| 번호 | 파일 | 주제 | 상태 | 의존성 |
|------|------|------|------|--------|
| PRD-07 | [07-admin-ux.md](./07-admin-ux.md) | 관리자 페이지 UI/UX 개선 | 🔴 미구현 | - |
| PRD-08 | [08-typography.md](./08-typography.md) | 블로그 타이포그래피 및 가독성 개선 | 🔴 미구현 | - |
| PRD-09 | [09-categories-v2.md](./09-categories-v2.md) | 카테고리 구조 v2 재편 | 🔴 미구현 | PRD-07 |

---

## 완료된 PRD → implemented/

| 번호 | 파일 | 주제 | 커밋 |
|------|------|------|------|
| PRD-01 | [implemented/01-theme-book.md](../implemented/01-theme-book.md) | Hugo Book 테마 전환 (→ PRD-03에서 Stack으로 교체) | `84cd804` |
| PRD-02 | [implemented/02-cms-sveltia.md](../implemented/02-cms-sveltia.md) | Sveltia CMS 카테고리 구조 정비 + CSP | `ecfa5cb` |
| PRD-03 | [implemented/03-theme-stack.md](../implemented/03-theme-stack.md) | Stack 테마 전환 — 카드·다크모드·사이드바 | `7ef94bc` |
| PRD-04 | [implemented/04-writing-ux.md](../implemented/04-writing-ux.md) | 글쓰기 경험 개선 — archetype·Makefile·가이드 | `TBD` |
| PRD-05 | [implemented/05-categories.md](../implemented/05-categories.md) | 카테고리 구조 개편 — java/spring/database/infra/woowacourse | `92c72af` |
| PRD-06 | [implemented/06-post-detail.md](../implemented/06-post-detail.md) | 글 상세 완성도 — 시리즈·giscus·아카이브RSS | `TBD` |

---

## 전체 로드맵

```
Phase 1 — 기반 (완료)
  ✅ PRD-01: Hugo Book 테마
  ✅ PRD-02: CMS 설정

Phase 2 — 디자인 전환 (완료)
  ✅ PRD-03: Stack 테마로 전면 교체
  ✅ PRD-04: 글쓰기 경험 개선

Phase 3 — 기능 완성 (완료)
  ✅ PRD-05: 카테고리 관리
  ✅ PRD-06: 댓글·시리즈·아카이브

Phase 4 — (이후)
  · giscus repoID/categoryID 발급 후 hugo.yaml에 입력 (사용자 직접)
  · 커스텀 도메인
  · 방문자 분석 (umami / goatcounter)
  · OGP 이미지 자동 생성
  · 프로필 사진 (assets/img/avatar.png)
```
