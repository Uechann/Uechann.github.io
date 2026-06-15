# PRD-07 — 관리자 페이지 UI/UX 개선

> 상태: 🔴 미구현  
> 우선순위: 높음

---

## 문제 정의

현재 `/admin/` 페이지는 Sveltia CMS를 그대로 노출한다.  
- 블로그와 폰트·색상이 전혀 다름 (Sveltia 기본 UI)
- 로딩 화면이 단순 흰 배경
- 소개 페이지 수정, 카테고리 선택이 불편함 (자유 입력 → 오타 위험)
- 필드 라벨이 영문 혼재

---

## 구현 범위 및 제약

Sveltia CMS는 Svelte 앱이므로 내부 스타일을 완전히 제어하기 어렵다.  
**접근 전략**: 제어 가능한 부분만 개선, 나머지는 CMS 기능 보완으로 UX 향상.

| 영역 | 제어 가능 여부 | 접근법 |
|------|--------------|--------|
| 로딩 화면 | ✅ 완전 제어 | 블로그 디자인 적용 |
| Sveltia CMS UI 전체 | ⚠️ 부분 (CSS 변수) | CSS 변수 오버라이드 시도 |
| config.yml 기능 | ✅ 완전 제어 | 필드 개선, 컬렉션 추가 |

---

## 요구사항

### R1. 로딩 화면 블로그 테마 적용

`static/admin/index.html` 의 `#cms-loading` 스타일을 블로그 디자인과 일치시킨다.

- Pretendard 폰트 로드 (cdn.jsdelivr.net)
- 블로그 accent color `#3b82f6` 적용
- 다크모드 지원 (시스템 설정 따름)
- 로고/블로그명 표시
- 스피너 색상 accent color 적용

**디자인 스펙:**
```
배경: 라이트 #f9fafb / 다크 #1a1a2e
텍스트: 라이트 #1f2937 / 다크 #e5e7eb
accent: #3b82f6
폰트: Pretendard, system-ui
```

### R2. Sveltia CMS CSS 오버라이드

Sveltia CMS가 마운트된 후 CSS 변수를 주입해 색상·폰트를 부분 조정한다.

```js
// CMS 마운트 후 실행
document.documentElement.style.setProperty('--font-family', "'Pretendard', sans-serif");
// accent 색상 등 Sveltia CSS 변수 오버라이드
```

> **한계**: Sveltia CMS의 일부 스타일은 Svelte scoped CSS로 적용되어 오버라이드 불가.  
> 가능한 범위에서만 적용하고, 불가능한 부분은 인정.

### R3. 소개 페이지 편집 기능 추가

`config.yml`에 `about` 컬렉션을 추가해 CMS에서 소개 페이지를 수정할 수 있게 한다.

```yaml
- name: "about"
  label: "소개 페이지"
  files:
    - name: "about"
      label: "나의찬 소개"
      file: "content/page/about/index.md"
      fields:
        - { label: "제목", name: "title", widget: "string" }
        - { label: "본문", name: "body", widget: "markdown" }
```

### R4. 카테고리 선택 필드를 드롭다운으로 변경

현재 `categories` 필드는 자유 입력 `list` 위젯 → 오타·대소문자 오류 발생 가능.  
`select` 위젯으로 변경해 정해진 카테고리만 선택하게 한다.

```yaml
# 변경 전
- { label: "카테고리", name: "categories", widget: "list" }

# 변경 후 (PRD-09 카테고리 확정 후 적용)
- label: "카테고리"
  name: "categories"
  widget: "select"
  multiple: true
  options:
    - { label: "Java", value: "Java" }
    - { label: "Spring", value: "Spring" }
    # ... 전체 카테고리 목록
```

### R5. 필드 라벨 한국어 통일 + 필수/선택 명확화

```yaml
# 현재
- { label: "제목", name: "title", widget: "string" }   # 필수인데 required 미명시

# 개선
- { label: "제목 *", name: "title", widget: "string", required: true }
- { label: "요약 (카드에 표시되는 한 줄 소개)", name: "description", widget: "text", required: false }
- { label: "커버 이미지 (1200×630px 권장)", name: "image", widget: "image", required: false }
```

---

## 구현 순서

```
1. index.html 로딩 화면 리디자인 (R1)
2. CMS 마운트 후 CSS 변수 주입 시도 (R2)
3. config.yml: about 컬렉션 추가 (R3)
4. config.yml: categories → select 위젯으로 변경 (R4, PRD-09 확정 후)
5. config.yml: 필드 라벨·힌트 개선 (R5)
```

---

## 비고

- 완전한 커스텀 어드민 UI(GitHub API 직접 호출)는 이후 Phase 5로 분리 가능
- 현 단계는 Sveltia CMS 위에서 가능한 개선을 최대화하는 방향
