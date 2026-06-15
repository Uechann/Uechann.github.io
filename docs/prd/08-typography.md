# PRD-08 — 블로그 타이포그래피 및 가독성 개선

> 상태: 🔴 미구현  
> 우선순위: 높음  
> 파일: `assets/scss/custom.scss`

---

## 문제 정의

현재 블로그 글 본문이 읽기 불편하다.  
- 글자 크기·자간·줄 간격이 최적화되지 않음
- 제목 계층(h1~h4)이 시각적으로 명확하지 않음
- 코드 블록 스타일이 거칠음
- 인용구, 목록, 구분선 등 요소 스타일 미흡

---

## 벤치마크 분석

### velog
- 본문 폰트 크기: `16px` (1rem)
- 줄 간격: `1.7`
- 단락 간격: `1.5em`
- 자간: `−0.004em`
- 최대 너비: `768px`
- 제목: bold + 명확한 크기 계층
- 코드: 배경 `#f6f8fa`, 둥근 모서리, 적절한 패딩

### tistory (기본 스킨)
- 본문 폰트 크기: `16px`
- 줄 간격: `1.8`
- 단락 간격: `1.2em`
- 제목: 제목마다 border-bottom으로 구분

---

## 요구사항

### R1. 본문 기본 타이포그래피

```scss
// 현재
.article-content { font-size: 1.05rem; line-height: 1.85; }

// 목표
.article-content {
  font-size: 1rem;          // 16px (기기 기본값 기준)
  line-height: 1.8;
  letter-spacing: -0.003em; // 한국어 가독성 향상
  word-spacing: 0.05em;
}

// 단락 간격
.article-content p {
  margin-bottom: 1.4em;
}
```

### R2. 제목 계층 스타일

```scss
// 섹션을 명확히 구분하는 제목 스타일
.article-content h2 {
  font-size: 1.6rem;
  font-weight: 700;
  margin-top: 2.5em;
  margin-bottom: 0.8em;
  padding-bottom: 0.4em;
  border-bottom: 2px solid var(--accent-color);
}

.article-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 2em;
  margin-bottom: 0.6em;
}

.article-content h4 {
  font-size: 1.05rem;
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.4em;
  color: var(--accent-color);
}
```

### R3. 코드 블록 스타일

```scss
// 인라인 코드
.article-content code:not(pre code) {
  background: rgba(59, 130, 246, 0.08);
  color: #3b82f6;
  border-radius: 4px;
  padding: 0.15em 0.4em;
  font-size: 0.88em;
  font-family: var(--code-font-family);
}

// 코드 블록
.article-content pre {
  border-radius: 10px;
  padding: 1.25em 1.5em;
  font-size: 0.875rem;
  line-height: 1.65;
  overflow-x: auto;
}
```

### R4. 인용구 스타일

```scss
.article-content blockquote {
  border-left: 4px solid var(--accent-color);
  margin: 1.5em 0;
  padding: 0.8em 1.2em;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 0 8px 8px 0;
  color: var(--body-text-color);  // 현재 테마 텍스트 색
  font-style: normal;             // italic 제거 (한국어에 부적합)
}

.article-content blockquote p {
  margin: 0;
}
```

### R5. 목록 스타일

```scss
.article-content ul,
.article-content ol {
  padding-left: 1.5em;
  margin: 0.8em 0 1.2em;
}

.article-content li {
  margin-bottom: 0.4em;
  line-height: 1.75;
}

.article-content li + li {
  margin-top: 0.2em;
}
```

### R6. 구분선, 링크, 테이블

```scss
// 구분선
.article-content hr {
  border: none;
  border-top: 1px solid var(--body-text-color-faded);
  margin: 2.5em 0;
}

// 링크
.article-content a {
  color: var(--accent-color);
  text-decoration: underline;
  text-decoration-color: rgba(59, 130, 246, 0.4);
  text-underline-offset: 3px;
}

.article-content a:hover {
  text-decoration-color: var(--accent-color);
}

// 테이블
.article-content table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  margin: 1.5em 0;
}

.article-content th {
  background: rgba(59, 130, 246, 0.08);
  font-weight: 600;
  padding: 0.6em 1em;
  border: 1px solid var(--body-text-color-faded);
}

.article-content td {
  padding: 0.5em 1em;
  border: 1px solid var(--body-text-color-faded);
}
```

### R7. 글 카드 목록 (홈/카테고리 페이지) 개선

```scss
// 카드 제목 폰트 크기 조정
.article-title {
  font-size: 1.15rem;
  line-height: 1.4;
}

// 카드 설명 텍스트
.article-subtitle {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--body-text-color);
  opacity: 0.75;
}
```

---

## 구현 순서

```
1. R1 본문 기본 타이포그래피 적용
2. R2 제목 계층 스타일
3. R3 코드 블록
4. R4 인용구
5. R5 목록
6. R6 구분선·링크·테이블
7. R7 카드 목록
8. make dev 로 샘플 글 작성 후 전체 시각 검토
```

---

## 참고

- Stack 테마 CSS 변수: `--body-text-color`, `--body-text-color-faded`, `--accent-color`, `--card-border-radius`
- 다크모드: Stack이 `[data-scheme="dark"]` 클래스로 관리 → CSS 변수 이용 시 자동 대응
