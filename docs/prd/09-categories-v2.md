# PRD-09 — 카테고리 구조 v2 재편

> 상태: 🔴 미구현  
> 우선순위: 높음  
> 의존성: PRD-07 (admin config.yml 수정과 연동)

---

## 문제 정의

현재 카테고리가 의도한 글쓰기 목적과 맞지 않는다.

- `cs`: 너무 광범위 (네트워크, OS, 자료구조가 섞임)
- `woowacourse`: 하나로 묶여 있어 미션 기록, 스터디, 활동이 구분 안 됨
- 사용자가 실제로 작성하고자 하는 두 축("개념학습", "우테코 활동")이 카테고리에 드러나지 않음

---

## 작성 목적 분석

### 축 1: 개념학습

Java, OOP, Spring, Database, Network, Infra를 배우며 정리하는 글.  
각 기술 스택이 명확히 구분되어야 검색·탐색이 편하다.

### 축 2: 우아한테크코스 활동

우테코 내에서 발생하는 활동은 성격이 세 가지로 나뉜다:
1. **미션**: 매 레벨 미션을 풀며 고민한 설계·리팩터링 기록
2. **스터디**: 내부 그룹 스터디에서 공부한 내용 정리
3. **활동**: 행사, 발표, 네트워킹, 기타 이벤트 참여 기록

이 세 가지는 성격이 전혀 달라 하나의 `woowacourse` 카테고리로 묶기 어렵다.

---

## 제안 카테고리 구조

### 개념학습 (6개)

| 카테고리 | 폴더 | 포함할 내용 |
|----------|------|-----------|
| Java | `posts/java/` | Java 언어, JVM, GC, OOP, 자료구조, 알고리즘 |
| Spring | `posts/spring/` | Spring Boot, MVC, Security, AOP, IoC/DI, JPA |
| Database | `posts/database/` | SQL, 인덱스, 정규화, 트랜잭션, JPA 매핑, MySQL |
| Network | `posts/network/` | HTTP, TCP/IP, DNS, REST, 웹 통신 (구 `cs` 중 네트워크 부분) |
| Infra | `posts/infra/` | Docker, CI/CD, GitHub Actions, Linux, 서버 설정 |

> `cs` 카테고리 제거: 네트워크는 `network`으로, Java/OOP 관련은 `java`으로 흡수

### 우아한테크코스 (3개)

| 카테고리 | 폴더 | 포함할 내용 |
|----------|------|-----------|
| 우테코-미션 | `posts/wooteco-mission/` | 레벨별 미션 설계 고민, 코드 리뷰 기록, 리팩터링 과정 |
| 우테코-스터디 | `posts/wooteco-study/` | 내부 스터디 자료 정리, 기술 토론 기록 |
| 우테코-활동 | `posts/wooteco-activity/` | 행사, 발표, 네트워킹, 코치 세션, 기타 활동 |

> `woowacourse` 카테고리 제거 → 3개로 분리  
> 폴더 접두사 `wooteco-`로 시작해 관련 카테고리임을 시각적으로 그룹화

### 기타 (2개)

| 카테고리 | 폴더 | 포함할 내용 |
|----------|------|-----------|
| 트러블슈팅 | `posts/troubleshooting/` | 에러 해결 기록 (유지) |
| 회고 | `posts/retrospect/` | 주간·월간·분기 회고 (유지) |

---

## 변경 요약

### 제거
- `content/posts/cs/` → 내용 없으므로 폴더 삭제
- `content/posts/woowacourse/` → 내용 없으므로 폴더 삭제

### 신규 추가
- `content/posts/network/` + archetype
- `content/posts/wooteco-mission/` + archetype
- `content/posts/wooteco-study/` + archetype
- `content/posts/wooteco-activity/` + archetype

### 유지
- java, spring, database, infra, troubleshooting, retrospect (폴더·archetype 모두 유지)

---

## 영향 범위

| 파일 | 변경 내용 |
|------|-----------|
| `content/posts/` | 폴더 추가·삭제 |
| `archetypes/posts/` | network, wooteco-mission, wooteco-study, wooteco-activity 추가, cs·woowacourse 삭제 |
| `static/admin/config.yml` | 컬렉션 재편 (PRD-07 R4 select 위젯과 동시 적용) |
| `Makefile` | new-network, new-wooteco-mission, new-wooteco-study, new-wooteco-activity 추가 |
| `hugo.yaml` | 메뉴 변경 없음 (카테고리 페이지가 자동으로 taxonomy 표시) |
| `docs/03-writing-guide.md` | 카테고리 표 업데이트 |

---

## 구현 순서

```
1. 기존 cs/, woowacourse/ 폴더 git rm (비어 있으므로 안전)
2. network/, wooteco-mission/, wooteco-study/, wooteco-activity/ _index.md 생성
3. archetypes 추가·삭제
4. Makefile 타깃 추가·삭제
5. config.yml 컬렉션 업데이트 (PRD-07 select 위젯 동시 적용)
6. 가이드 문서 업데이트
7. hugo build 검증
```

---

## 비고

- 글이 없는 카테고리는 Hugo가 자동으로 카테고리 목록에서 제외하므로,  
  빈 `_index.md`만 있어도 문제없음 (글 작성 시 자동 표시)
- 우테코 3개 카테고리는 폴더명을 영문 `wooteco-*`로 통일  
  (URL: `/posts/wooteco-mission/`, 표시명: "우테코-미션" 등 _index.md에서 한글로 설정)
