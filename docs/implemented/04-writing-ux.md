# [완료] PRD-04 — 글쓰기 경험 개선

> 상태: ✅ 구현 완료

---

## 구현 내용

### R1. 카테고리별 Archetype 템플릿

| 파일 | 카테고리 | 섹션 헤딩 |
|------|----------|----------|
| `archetypes/posts/backend.md` | 백엔드 | 개요 / 핵심 개념 / 구현 / 주의사항 / 참고 |
| `archetypes/posts/cs.md` | CS 기초 | 개념 정리 / 동작 원리 / 예시 / 관련 개념 / 참고 |
| `archetypes/posts/troubleshooting.md` | 트러블슈팅 | 문제 상황 / 환경 / 원인 분석 / 해결 방법 / 결론 |
| `archetypes/posts/retrospect.md` | 회고 | 이번에 한 일 / 잘한 것 / 아쉬운 것 / 다음에 할 것 |

**사용 방법:**
```bash
hugo new content "posts/backend/jpa-n-plus-one/index.md" --kind posts/backend
# 또는 Makefile 사용:
make new-backend SLUG=jpa-n-plus-one
```

### R2. Makefile + scripts/dev.sh

`Makefile` — 프로젝트 루트에서 자주 쓰는 명령어 단축:
```bash
make dev                               # 로컬 서버 (draft 포함)
make new-backend     SLUG=post-name    # 백엔드 글 생성
make new-cs          SLUG=post-name    # CS 기초 글 생성
make new-troubleshooting SLUG=post-name
make new-retrospect  SLUG=post-name
make build                             # 프로덕션 빌드
make help                              # 도움말
```

`scripts/dev.sh` — Hugo 서버 옵션:
- `-D`: draft 글 포함
- `--disableFastRender`: 변경 누락 없이 전체 재빌드
- `--navigateToChanged`: 저장 시 브라우저 자동 이동

### R3. 글 작성 가이드

`docs/03-writing-guide.md` 에 다음 내용 정리:
- 3가지 작성 방법 (로컬/CMS/github.dev)
- Front matter 필드 전체 설명
- 커버 이미지·본문 이미지 규칙
- 시리즈 묶기 방법
- 발행 체크리스트
- 프로필 사진·giscus 댓글 활성화 방법
