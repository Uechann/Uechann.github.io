# PRD-11: 관리자 카테고리 관리 기능

> 상태: ✅ 완료  
> 우선순위: P1  
> 관련 PRD: [PRD-07 관리자 페이지](./07-admin-ux.md), [PRD-09 카테고리 v2](./09-categories-v2.md)

---

## 배경

현재 관리자 페이지의 카테고리 목록이 HTML에 하드코딩되어 있어,
새 카테고리를 추가하거나 불필요한 카테고리를 삭제하려면 코드를 직접 수정해야 한다.

---

## 목표

관리자 UI에서 카테고리를 추가·삭제할 수 있게 하고,
카테고리 설정을 단일 JSON 파일(`data/admin-cats.json`)로 관리해
블로그 위젯과 관리자 모두 같은 소스를 참조하도록 한다.

---

## 요구사항

### R1 단일 소스 (data/admin-cats.json)
- 그룹(key, icon)과 카테고리(key, label, icon, color, group) 정보를 담는 JSON 파일
- 관리자 HTML의 하드코딩 CATS 배열 → 런타임에 이 파일을 로드해 대체
- 블로그 `grouped-categories` 위젯도 이 파일을 Hugo 데이터로 읽음
- 기존 `data/catgroups.yaml` 삭제

### R2 카테고리 관리 뷰
- 사이드바 하단 "⚙️ 카테고리 관리" 버튼 → 메인 영역에 관리 화면 표시
- 그룹별 카테고리 목록
- 각 카테고리에 삭제 버튼 (글이 있으면 비활성화)

### R3 카테고리 추가
- 폼: 키(영문소문자-하이픈), 이름(한글/영문), 그룹(드롭다운), 아이콘(이모지), 색상(color picker)
- 저장 시:
  1. `content/posts/{key}/_index.md` 생성
  2. `data/admin-cats.json` 업데이트
  3. 트리 사이드바 즉시 반영

### R4 카테고리 삭제
- 삭제 조건: 해당 카테고리에 글이 0개
- 글이 있으면 버튼 비활성화 + 툴팁 표시
- 삭제 시:
  1. 확인 다이얼로그
  2. `content/posts/{key}/_index.md` 삭제
  3. `data/admin-cats.json` 업데이트
  4. 트리 사이드바에서 제거

---

## data/admin-cats.json 스키마

```json
{
  "groups": [
    { "key": "개념학습",    "icon": "📚" },
    { "key": "우아한테크코스", "icon": "🏫" },
    { "key": "기타",       "icon": "🗂️" }
  ],
  "cats": [
    { "key": "java", "label": "Java", "icon": "☕", "color": "#f59e0b", "group": "개념학습" }
  ]
}
```

---

## 구현 방법

- `data/admin-cats.json`: 카테고리 설정 단일 소스
- `static/admin/index.html`:
  - CATS를 `let`으로 변경, 로그인 후 `loadCatsConfig()` 호출
  - `saveCatsConfig()`: JSON 업데이트
  - `tCatsManage()`: 관리 뷰 렌더링
  - `addCat()` / `delCat()`: 추가/삭제 로직
- `layouts/_partials/widget/grouped-categories.html`: `admin-cats.json` 읽도록 변경
- `data/catgroups.yaml`: 삭제 (admin-cats.json으로 통합)
