# PRD-08: 블로그 타이포그래피 및 가독성 개선

> 상태: ✅ 완료  
> 관련 PRD: [docs/prd/08-typography.md](../prd/08-typography.md)  
> 파일: `assets/scss/custom.scss`

---

## 변경 요약

velog, tistory를 벤치마크해 글 본문 전체 타이포그래피를 개선했습니다.

---

## 요구사항별 구현

| 요구사항 | 내용 | 구현값 |
|----------|------|--------|
| R1 기본 타이포그래피 | 폰트 크기·자간·줄간격·단락 간격 | `font-size: 1rem`, `line-height: 1.8`, `letter-spacing: -0.003em`, `p { margin-bottom: 1.4em }` |
| R2 제목 계층 | h2~h4 크기·색상·여백·구분선 | h2 `1.55rem` + accent border-bottom, h3 `1.2rem`, h4 `1.05rem` accent color |
| R3 코드 블록 | pre 스타일, 인라인 코드 배경 | pre `border-radius: 10px`, inline code `rgba(accent, 8%)` 배경 |
| R4 인용구 | 이탤릭 제거, accent 좌측 보더, 배경 | `font-style: normal`, `border-left: 4px solid accent`, 연한 배경 |
| R5 목록 | 항목 간격, 중첩 처리 | `li { margin-bottom: 0.35em; line-height: 1.75 }` |
| R6 구분선·링크·테이블 | hr 정리, 링크 언더라인, 테이블 스타일 | hr `opacity: 0.35`, 테이블 th `accent 배경`, 짝수 행 연한 배경 |
| R7 카드 목록 | article-title 폰트 개선 | `.article-title { font-size: 1.1rem; letter-spacing: -0.01em }` |

---

## 다크모드 대응

- 인라인 코드 배경: `rgba(96, 165, 250, 0.12)` (blue-400 기준)
- 인용구 배경: `rgba(96, 165, 250, 0.07)`
- 테이블 짝수 행: `rgba(255, 255, 255, 0.03)`
- 카드 hover shadow: `rgba(0, 0, 0, 0.35)`

---

## 모바일 대응

```scss
@media (max-width: 768px) {
  .article-content {
    font-size: 1rem;
    h2 { font-size: 1.35rem; }
    h3 { font-size: 1.15rem; }
  }
}
```
