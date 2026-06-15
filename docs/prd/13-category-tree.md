# PRD-13: 트리 구조 카테고리 시스템 (Composite 패턴)

> 상태: 🔴 미구현  
> 우선순위: P0  
> 의존: PRD-12 (커스텀 테마), PRD-14 (관리자 v2)

---

## 배경

현재 카테고리는 `data/admin-cats.json`에 그룹-카테고리 2단계로 고정되어 있다.  
Composite 패턴을 적용해 임의 깊이의 트리 구조를 지원한다.

---

## 목표

- **폴더(Node)** 안에 **폴더(Node)** 또는 **글(Leaf)** 을 자유롭게 배치
- Hugo 섹션 구조와 동기화
- 블로그 사이드바와 관리자 모두 같은 트리를 참조

---

## Composite 구조 설계

```
Node (폴더)
├── key: string
├── label: string
├── icon: string
├── color: string (optional)
└── children: (Node | Leaf)[]

Leaf (글)
├── slug: string
├── title: string
├── path: string (Hugo content 경로)
└── date: string
```

Leaf는 블로그 렌더링 시 Hugo 섹션으로 자동 감지되므로  
`data/categories.json`에는 **Node(폴더)** 정보만 저장한다.  
글(Leaf)은 Hugo가 파일 시스템에서 읽어 섹션에 연결한다.

---

## data/categories.json 스키마

```json
{
  "tree": [
    {
      "key": "concepts",
      "label": "개념학습",
      "icon": "📚",
      "children": [
        {
          "key": "java",
          "label": "Java",
          "icon": "☕",
          "color": "#f59e0b",
          "children": []
        },
        {
          "key": "spring",
          "label": "Spring",
          "icon": "🌱",
          "color": "#10b981",
          "children": []
        }
      ]
    },
    {
      "key": "wooteco",
      "label": "우아한테크코스",
      "icon": "🏫",
      "children": [
        {
          "key": "wooteco-mission",
          "label": "미션",
          "icon": "🎯",
          "color": "#ec4899",
          "children": []
        }
      ]
    }
  ]
}
```

> children이 비어 있으면 글을 담는 최종 카테고리.  
> children에 다시 Node가 있으면 중간 그룹.

---

## Hugo 콘텐츠 경로 규칙

트리의 key를 `/` 로 이어 붙여 Hugo 섹션 경로를 만든다.

```
tree[0].key = "concepts"
tree[0].children[0].key = "java"
→ 콘텐츠 경로: content/posts/concepts/java/{slug}/index.md
→ URL: /posts/concepts/java/{slug}/
```

각 Node에는 Hugo의 섹션 `_index.md` 가 필요하다.

```
content/posts/
  concepts/
    _index.md          ← Node "개념학습"
    java/
      _index.md        ← Node "Java"
      my-post/
        index.md       ← 글
    spring/
      _index.md
  wooteco/
    _index.md
    wooteco-mission/
      _index.md
```

---

## 블로그 렌더링

### 사이드바 트리 렌더링 (Hugo 파셜)

`layouts/_partials/sidebar-tree.html`:
- `data/categories.json`의 tree를 재귀적으로 순회
- 각 Node에 `hugo.Site.GetPage` 로 해당 섹션 포스트 수 표시
- 최종 Node(children = [])에만 글 목록 링크

### 카테고리 목록 페이지

- URL: `/posts/concepts/java/`
- `layouts/list.html`에서 해당 섹션의 pages 렌더링

### 브레드크럼

- 글 상세 페이지 상단: `개념학습 > Java > 제목`
- 트리 상의 조상 Node 경로 표시

---

## 관리자 트리 관리 (PRD-14 연동)

관리자에서 트리 조작 시:

| 동작 | 파일 변경 |
|------|-----------|
| 폴더 추가 | `data/categories.json` 업데이트, `content/posts/{path}/_index.md` 생성 |
| 폴더 삭제 | 하위에 글이 없을 때만 허용, `_index.md` 삭제, JSON 업데이트 |
| 폴더 이름 변경 | JSON의 label 업데이트 (key/경로는 변경 없음) |
| 폴더 이동 | 미지원 (경로가 바뀌면 URL이 깨짐) |

> **폴더 key는 불변**: 한 번 정해진 key를 바꾸면 URL이 바뀌어 404가 발생한다.  
> key는 생성 시에만 설정하고, 이후 label만 변경 가능하다.

---

## 마이그레이션

현재 구조(`content/posts/{category}/`) → 새 구조(`content/posts/{group}/{category}/`):

```
기존: content/posts/java/my-post/index.md
신규: content/posts/concepts/java/my-post/index.md
```

마이그레이션 스크립트(bash)로 파일 이동 후 커밋.

---

## 요구사항

### R1 — data/categories.json
- 임의 깊이의 Node 트리 정의
- key(불변, URL 경로), label(가변, 표시명), icon, color, children

### R2 — Hugo 섹션 동기화
- 각 Node의 key 경로에 `_index.md` 존재
- 글은 최종 Node 하위 디렉터리에 배치

### R3 — 사이드바 트리
- Composite 재귀 렌더링 (Hugo 파셜 재귀 호출)
- 접기/펼치기 (JS, 상태는 localStorage에 저장)
- 각 최종 Node의 글 수 표시

### R4 — 브레드크럼
- 글/목록 페이지 상단에 트리 경로 표시

### R5 — 관리자 연동 (PRD-14)
- 폴더 추가/삭제/이름변경
- key 불변 원칙 보장
