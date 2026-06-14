# 제품 요구사항 문서 (PRD) 인덱스

> 구현 완료된 항목은 `docs/implemented/`로 이동합니다.
> 이 파일에는 **미구현·진행 중** 항목만 관리합니다.

---

## 미구현 PRD 목록 (우선순위 순)

| 번호 | 파일 | 주제 | 상태 | 의존성 |
|------|------|------|------|--------|
| PRD-03 | [03-theme-stack.md](./03-theme-stack.md) | Stack 테마 전환 + 전체 디자인 재설계 | 🔴 최우선 | 없음 |
| PRD-04 | [04-writing-ux.md](./04-writing-ux.md) | 글쓰기 경험 개선 ("쓰고 싶어지는" 블로그) | 🔴 중요 | PRD-03 |
| PRD-05 | [05-categories.md](./05-categories.md) | 카테고리 관리 UX | 🟡 보통 | PRD-03 |
| PRD-06 | [06-post-detail.md](./06-post-detail.md) | 글 상세 + 블로그 완성도 (댓글·시리즈·아카이브) | 🟡 보통 | PRD-03 |

---

## 완료된 PRD → implemented/

| 번호 | 파일 | 주제 | 커밋 |
|------|------|------|------|
| PRD-01 | [implemented/01-theme-book.md](../implemented/01-theme-book.md) | Hugo Book 테마 전환 (→ PRD-03에서 Stack으로 교체 예정) | `84cd804` |
| PRD-02 | [implemented/02-cms-sveltia.md](../implemented/02-cms-sveltia.md) | Sveltia CMS 카테고리 구조 정비 + CSP | `ecfa5cb` |

---

## 전체 로드맵

```
Phase 1 — 기반 (완료)
  ✅ PRD-01: Hugo Book 테마
  ✅ PRD-02: CMS 설정

Phase 2 — 디자인 전환 (현재)
  🔴 PRD-03: Stack 테마로 전면 교체
  🔴 PRD-04: 글쓰기 경험 개선

Phase 3 — 기능 완성
  🟡 PRD-05: 카테고리 관리
  🟡 PRD-06: 댓글·시리즈·아카이브

Phase 4 — (이후)
  · 커스텀 도메인
  · 방문자 분석 (umami / goatcounter)
  · OGP 이미지 자동 생성
```
