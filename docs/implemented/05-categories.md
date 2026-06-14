# PRD-05: 카테고리 구조 개편

> 상태: ✅ 완료  
> 관련 PRD: [docs/prd/05-categories.md](../prd/05-categories.md)

---

## 변경 요약

광범위한 `backend/` 카테고리를 기술 스택 단위의 세부 카테고리로 분리했습니다.  
메뉴도 PRD-05 명세(홈·카테고리·아카이브·검색·소개)에 맞게 재구성했습니다.

---

## 파일 변경 목록

### 삭제
| 파일 | 이유 |
|------|------|
| `content/posts/backend/_index.md` | backend → java/spring/database/infra/woowacourse 로 분리 |
| `archetypes/posts/backend.md` | 대응 archetype 삭제 |

### 신규 생성
| 파일 | 설명 |
|------|------|
| `content/posts/java/_index.md` | Java 카테고리 인덱스 |
| `content/posts/spring/_index.md` | Spring 카테고리 인덱스 |
| `content/posts/database/_index.md` | Database 카테고리 인덱스 |
| `content/posts/infra/_index.md` | Infra 카테고리 인덱스 |
| `content/posts/woowacourse/_index.md` | 우아한테크코스 카테고리 인덱스 |
| `content/page/about/index.md` | 소개 페이지 (Stack page bundle) |
| `archetypes/posts/java.md` | Java 글 템플릿 |
| `archetypes/posts/spring.md` | Spring 글 템플릿 |
| `archetypes/posts/database.md` | Database 글 템플릿 |
| `archetypes/posts/infra.md` | Infra 글 템플릿 |
| `archetypes/posts/woowacourse.md` | 우아한테크코스 글 템플릿 |

### 수정
| 파일 | 변경 내용 |
|------|-----------|
| `hugo.yaml` | 메뉴 재구성: 홈·카테고리·아카이브·검색·소개 (글 항목 제거) |
| `static/admin/config.yml` | `backend` 컬렉션 제거, `java/spring/database/infra/woowacourse` 컬렉션 추가 |
| `Makefile` | `new-backend` 제거, `new-java/spring/database/infra/woowacourse` 추가 |
| `docs/03-writing-guide.md` | 카테고리 표, 예시 경로 업데이트 |

---

## 최종 카테고리 구조

```
content/posts/
├── java/          → Java 언어, JVM, JPA
├── spring/        → Spring Boot, MVC, Security
├── database/      → SQL, 인덱스, 트랜잭션
├── infra/         → Docker, CI/CD, 서버 설정
├── woowacourse/   → 미션, 페어 프로그래밍, 강의
├── cs/            → 네트워크, OS, 자료구조
├── troubleshooting/ → 에러 해결 기록
└── retrospect/    → 회고
```

## 최종 메뉴 구조

```
홈 (/)  →  카테고리 (/categories/)  →  아카이브 (/page/archives/)  →  검색 (/page/search/)  →  소개 (/page/about/)
```

---

## 새 글 생성 명령어

```bash
make new-java         SLUG=generic-type-erasure
make new-spring       SLUG=transaction-propagation
make new-database     SLUG=index-b-tree
make new-infra        SLUG=docker-compose-setup
make new-woowacourse  SLUG=week-1-retrospect
```
