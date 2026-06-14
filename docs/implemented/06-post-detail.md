# PRD-06: 글 상세 페이지 + 블로그 완성도

> 상태: ✅ 완료  
> 관련 PRD: [docs/prd/06-post-detail.md](../prd/06-post-detail.md)

---

## 구현 요약

Stack 테마 자동 제공 기능 + 미비했던 설정/문서를 보완했습니다.

---

## 요구사항별 구현 결과

| 요구사항 | 결과 | 방법 |
|----------|------|------|
| R1 커버 이미지 | ✅ | Stack 자동 (front matter `image: cover.png`) |
| R2 읽는 시간 | ✅ | `hasCJKLanguage: true` + `article.readingTime: true` (PRD-03) |
| R3 이전/다음 글 | ✅ | Stack 자동 제공 |
| R4 시리즈 | ✅ | 모든 archetype에 `series`/`series_order` 주석 필드 추가 |
| R5 giscus 댓글 | ✅ | hugo.yaml 설정 완비, 가이드 문서화 (repoID·categoryID는 사용자가 giscus.app에서 발급) |
| R6 소개 페이지 | ✅ | PRD-05에서 완료 (`content/page/about/index.md`) |
| R7 아카이브 + 검색 | ✅ | 페이지 기존 존재, archives에 `outputs: [html, rss]` 추가 |

---

## 파일 변경 목록

| 파일 | 변경 내용 |
|------|-----------|
| `content/page/archives/index.md` | `outputs: [html, rss]` 추가 |
| `archetypes/posts/java.md` | `series` / `series_order` 주석 필드 추가 |
| `archetypes/posts/spring.md` | 동일 |
| `archetypes/posts/database.md` | 동일 |
| `archetypes/posts/infra.md` | 동일 |
| `archetypes/posts/woowacourse.md` | 동일 |
| `archetypes/posts/cs.md` | 동일 |
| `archetypes/posts/troubleshooting.md` | 동일 |
| `archetypes/posts/retrospect.md` | 동일 |
| `docs/03-writing-guide.md` | 시리즈 사용법 상세 추가, giscus 3단계 설정 가이드 추가 |

---

## giscus 댓글 활성화 (사용자 직접 작업)

```
1. github.com/Uechann/Uechann.github.io → Settings → Discussions 활성화
2. giscus.app 접속 → 레포 연결 → repoID · categoryID 복사
3. hugo.yaml 수정:
   comments:
     enabled: true
     giscus:
       repoID: "..."
       categoryID: "..."
4. git push → 2~3분 후 댓글창 표시 확인
```

---

## 시리즈 사용법

```yaml
# front matter에서 주석 해제
series: ["Spring 완전 정복"]
series_order: 1
```

같은 `series` 값을 가진 글들이 자동으로 시리즈로 묶이며, 각 글 상단에 시리즈 목록 네비게이션이 표시됩니다.
