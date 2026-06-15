# PRD-10: 블로그 디자인 — 관리자 페이지 디자인 체계 통일

> 상태: ✅ 완료  
> 우선순위: P1  
> 관련 PRD: [PRD-07 관리자 페이지](./07-admin-ux.md)

---

## 배경

관리자 페이지의 디자인(청결한 그레이 배경, 화이트 카드, 파란 액센트, 진한 텍스트)이
사용자가 블로그에서 원하는 모습과 일치한다. 현재 블로그는 Stack 테마 기본값인
`#f5f5fa` 배경에 `#707070` 텍스트를 사용해 어둡고 묵직하지 않은 느낌이 있다.

---

## 목표

Stack 테마의 CSS 변수를 재정의해 블로그 외관을 관리자 페이지 디자인과 통일한다.

---

## 요구사항

| # | 항목 | 현재 → 목표 |
|---|------|-------------|
| R1 | 페이지 배경 (라이트) | `#f5f5fa` → `#f3f4f6` (관리자 `--bg`) |
| R2 | 페이지 배경 (다크) | `#303030` → `#0f172a` (관리자 dark `--bg`) |
| R3 | 카드 배경 (다크) | `#424242` → `#1e293b` (관리자 dark `--surface`) |
| R4 | 카드 텍스트 (다크) | `rgba(255,255,255,.9)` → `#f1f5f9` |
| R5 | 보조 텍스트 (다크) | `rgba(255,255,255,.7)` → `#94a3b8` |
| R6 | 카드 구분선 (다크) | `rgba(255,255,255,.12)` → `rgba(51,65,85,.6)` |
| R7 | 본문 텍스트 색 | `#707070` → `#374151` (가독성 향상) |
| R8 | 카드 테두리 (라이트) | 없음 → `1px solid #e5e7eb` (관리자 `--border`) |
| R9 | 카드 테두리 (다크) | 없음 → `1px solid #334155` |

---

## 구현 방법

`assets/scss/custom.scss`에서 Stack 테마의 CSS 변수 재정의:
```scss
:root {
    --body-background: #f3f4f6;
    --body-text-color: #374151;
    --card-separator-color: rgba(229,231,235,.8);
}
[data-scheme="dark"] {
    --body-background:           #0f172a;
    --card-background:           #1e293b;
    --body-text-color:           #e2e8f0;
    --card-text-color-main:      #f1f5f9;
    --card-text-color-secondary: #94a3b8;
    --card-separator-color:      rgba(51,65,85,.6);
}
```

카드 테두리는 `.card` 클래스에 직접 적용.
