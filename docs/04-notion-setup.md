# Notion 연동 설정 가이드

> Notion에 쓴 글을 `make sync` 한 번으로 블로그로 옮기기 위한 **최초 1회 설정**.
> 동기화 동작·옵션 설명은 [PRD-16](./prd/16-notion-sync.md) 참고.

---

## 전체 순서 (체크리스트)

- [ ] 1. Notion Integration 생성 → 토큰 발급
- [ ] 2. 글 목록 데이터베이스(DB) 생성 + 속성 설정
- [ ] 3. DB에 Integration 연결 (Connections)
- [ ] 4. DB ID 복사 → `.env`에 입력
- [ ] 5. 글 1개 작성 후 `make sync` 테스트

---

## 1. Integration 생성 (토큰 발급)

1. https://www.notion.so/my-integrations 접속
2. **New integration** 클릭
3. 이름 입력(예: `blog-sync`), 워크스페이스 선택
4. **Capabilities**: `Read content`만 있으면 충분 (쓰기 권한 불필요)
5. 생성 후 표시되는 **Internal Integration Secret** (`ntn_...` 또는 `secret_...`) 복사
   → `.env`의 `NOTION_TOKEN`에 입력 (이미 입력해 둠)

> ⚠️ 이 토큰은 비밀번호입니다. 채팅·커밋·스크린샷에 노출 금지.
> 노출됐다면 같은 화면에서 **Regenerate(재발급)** 후 `.env`만 갱신하면 됩니다.

---

## 2. 글 목록 데이터베이스 만들기

Notion에서 새 페이지 → **Table - Database**(전체 페이지 DB) 생성.
각 **행(row) 1개 = 블로그 글 1개**. 아래 속성을 만든다.

| 속성 이름 | Notion 타입 | 필수 | 설명 / Hugo 매핑 |
|-----------|-------------|------|------------------|
| **제목** | 제목(Title) | ✅ | 글 제목 → `title` (DB 기본 제목 속성 그대로 사용) |
| **상태** | 선택(Select) | ✅ | `발행` / `작성중` → `발행`만 동기화, `작성중`은 `--all`일 때 draft로 |
| **카테고리** | 선택(Select) | ✅ | 글 분류 → Hugo 섹션 (아래 §2-1 값 목록 사용) |
| **발행일** | 날짜(Date) | ✅ | → `date` (없으면 페이지 생성일로 대체) |
| **슬러그** | 텍스트(Text) | 선택 | URL 경로(영문 소문자-하이픈). 비우면 제목에서 자동 생성 |
| **태그** | 다중 선택(Multi-select) | 선택 | → `tags` |
| **요약** | 텍스트(Text) | 선택 | → `description` (검색·미리보기용) |
| **시리즈** | 텍스트(Text) | 선택 | → `series` (연재 글) |
| **순서** | 숫자(Number) | 선택 | → `series_order` |
| **대표이미지** | 파일/미디어(Files) | 선택 | → `image` (OG·카드 썸네일) |

> 속성 이름은 위 한글 그대로 쓰면 됩니다. (스크립트가 영문명 `Name/Status/Category/Date/Slug/Tags/...`도 인식)

### 2-1. 카테고리 선택지 값

`상태`·`카테고리` Select의 **옵션 값**은 아래와 정확히 일치해야 합니다.
(매핑은 `data/notion-map.json`에 정의되어 있고, 없는 값을 만나면 동기화가 멈추며 경고합니다.)

**상태:** `발행`, `작성중`

**카테고리** (왼쪽 = Notion에 넣을 값 → 오른쪽 = 블로그 분류):

| Notion 카테고리 값 | 블로그 섹션 / 표시명 |
|--------------------|----------------------|
| `Java` | java / Java |
| `Spring` | spring / Spring |
| `Database` | database / Database |
| `Network` (또는 `네트워크`) | network / Network |
| `Infra` (또는 `인프라`) | infra / Infra |
| `Troubleshooting` (또는 `트러블슈팅`) | troubleshooting / Troubleshooting |
| `Retrospect` (또는 `회고`) | retrospect / 회고 |
| `우테코-미션` | wooteco-mission / 우아한테크코스 |
| `우테코-학습` | wooteco-study / 우아한테크코스 |
| `우테코-활동` | wooteco-activity / 우아한테크코스 |

> 다른 분류를 쓰고 싶으면 `data/notion-map.json`에 `"내값": { "section": "섹션", "category": "표시명" }` 형태로 추가하세요.

---

## 3. DB에 Integration 연결 (가장 자주 빠뜨리는 단계)

토큰만 있으면 안 되고, **해당 DB를 Integration에 공유**해야 읽힙니다.

1. 만든 DB 페이지 열기
2. 우측 상단 **`···`(더보기)** → **Connections**(연결) → **Connect to**
3. 1단계에서 만든 Integration(`blog-sync`) 선택

연결하지 않으면 `make sync` 실행 시 `object_not_found` 오류가 납니다.

---

## 4. DB ID 복사 → `.env` 입력

1. DB를 브라우저에서 열고 주소창 URL 확인:
   ```
   https://www.notion.so/<워크스페이스>/<32자리hex>?v=<뷰id>
                                        ^^^^^^^^^^^^^ 이 부분이 DB ID
   ```
2. 그 **32자리 hex**(하이픈 없어도 됨)를 복사
3. `.env`의 `NOTION_DB_ID=` 뒤에 붙여넣기

> 헷갈리면: `?v=` 앞, 마지막 `/` 뒤의 긴 문자열이 DB ID입니다.

---

## 5. 동기화 테스트

```bash
make sync          # 상태=발행 글만 변환
make sync-all      # 작성중 글까지 draft 로 변환 (미리보기용)
```

실행 후:
- 터미널의 **동기화 리포트** 확인 (변환 수 / 이미지 수 / 미지원 블록 경고)
- `git diff`로 생성된 `content/posts/...` 검토
- `make dev`로 로컬 미리보기
- 이상 없으면 커밋

### 자주 쓰는 옵션

| 명령 | 동작 |
|------|------|
| `make sync` | 발행 글만, 변경분만(증분) |
| `make sync-all` | 작성중 글까지 포함 |
| `node scripts/notion-sync.mjs --force` | 매니페스트 무시하고 전체 재변환 |
| `node scripts/notion-sync.mjs --prune` | Notion에서 삭제한 글의 로컬 번들도 삭제 |

---

## 문제 해결

| 증상 | 원인 / 해결 |
|------|-------------|
| `NOTION_TOKEN / NOTION_DB_ID 가 필요합니다` | `.env` 미작성 — 토큰·DB ID 확인 |
| `object_not_found` | 3단계 **Connections 연결** 누락 |
| `매핑 없는 카테고리 "..."` | Notion 카테고리 값이 §2-1과 불일치 → 값 수정 또는 `notion-map.json` 추가 |
| 이미지가 안 보임 | 리포트의 `이미지 오류` 확인. Notion 이미지 URL은 ~1시간 후 만료되므로 작성 직후 sync 권장 |
| 글이 안 올라옴 | `상태`가 `발행`인지 확인 (작성중은 `make sync-all` 필요) |

---

## 요약: 지금 당신이 할 일

1. ✅ 토큰 — 이미 `.env`에 입력됨
2. ⬜ Notion DB 생성 + §2 속성 + §2-1 선택지
3. ⬜ DB를 Integration에 **Connections 연결**
4. ⬜ DB ID를 `.env`의 `NOTION_DB_ID`에 입력
5. ⬜ `make sync` 테스트
