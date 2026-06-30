---
title: "queryForObject 호출시 조회결과가 비어있으면\n어떤 상황이 발생할까"
date: "2026-05-28"
draft: false
categories: ["Spring"]
tags: []
description: ""
image: ""
notionID: "8bb78738-4b0a-831f-baee-01e1727d92e0"
notionEdited: "2026-05-28T07:24:00.000Z"
---

# 💥 의도적 파괴 학습 로그


**날짜:** YYYY-MM-DD


**개념 / 대상 코드:**


## 어떤 개념인가요 ?


**queryForObject**
는 SQL 조회 결과가 정확히 1건일 것을 기대하는 메서드입니다.
0건 또는 2건 이상이면 Spring이 예외를 던집니다. 이 동작을 직접 눈으로 확인합니다.


## 어떤 부분을 의도적으로 파괴할 것인가요 ?


코드가 정상적으로 돌아간단다면, 안전하게 사고를 쳐보자
파괴의 목적은 에러 로그를 눈으로 확인하는 것이다.
원래 그 코드가 그렇게 작성되어야 하는지 역으로 이해한다.


**무엇을 파괴할 것인가 — 3가지 기준:**

<details>
<summary>**경계 조건 파괴** — 정상 입력이 아닌 것을 넣어본다</summary>
- 없는 id로 조회/삭제하면 어떤 에러가 나는가?
- null이나 빈 값을 넣으면 어디서 터지는가?
- 숫자 필드에 문자열을 넣으면 어디서 막히는가?

</details>

<details>
<summary>**연결 고리 파괴** — 두 개념이 맞닿는 지점을 끊어본다</summary>
- JOIN 쿼리의 컬럼명을 하나 틀리면 어떤 에러가 나는가?
- JSON 필드명과 Java 필드명이 다르면 역직렬화가 어떻게 실패하는가?
- 매핑 키를 바꾸면 어디서 null이 되는가?

</details>

<details>
<summary>**순서 파괴** — 의존성의 순서를 바꿔본다</summary>
- 이 설정이 없으면 어디서 먼저 터지는가?
- 어떤 Bean이 먼저 만들어져야 하는가?

</details>


---


## 파괴 목록


**파괴 1 — 존재하지 않는 id로 조회경계 조건**


**무엇을 바꿨나**


DB에 없는 id 값 (예: `id = 99999L`)을 queryForObject에 전달


**예상한 결과**


null이 반환되거나 조용히 무시될 것 같다


**실제 에러 로그**


org.springframework.dao.`EmptyResultDataAccessException`:
  Incorrect result size: expected 1, actual 0


**왜 이 에러가 났는가**


queryForObject는 내부적으로 결과 List의 크기를 검사합니다. size == 0이면 `EmptyResultDataAccessException`을 즉시 던집니다. null을 반환하는 설계가 아닙니다.


역으로 이해한 것: 이 메서드는 "반드시 있는 데이터"를 꺼낼 때만 써야 한다. 존재 여부가 불확실한 조회라면 `Optional`로 감싸거나 `query()`를 써야 한다.


**얻은 것**

- queryForObject는 null-safe하지 않다는 것을 에러 로그로 직접 확인
- `EmptyResultDataAccessException`의 존재와 위치를 몸으로 기억하게 됨

**파괴 2 — 동일 id를 가진 중복 데이터 삽입 후 조회경계 조건**


**무엇을 바꿨나**


테스트 setup에서 같은 id의 row를 2건 INSERT한 뒤 queryForObject 호출


**예상한 결과**


첫 번째 row가 반환될 것 같다


**실제 에러 로그**


org.springframework.dao.`IncorrectResultSizeDataAccessException`:
  Incorrect result size: expected 1, actual 2


**왜 이 에러가 났는가**


queryForObject는 결과가 2건 이상이어도 예외를 던집니다. 내부에서 `DataAccessUtils.requiredSingleResult()`를 거치며, size != 1이면 모두 실패입니다.


역으로 이해한 것: queryForObject는 결과가 "1건임을 보장"할 수 있는 쿼리에서만 사용해야 한다. PK 조회처럼 유니크가 보장된 경우에 적합하다.


**얻은 것**

- 0건·2건 모두 예외이며, 예외 타입이 다르다는 것을 비교해서 확인
- `IncorrectResultSizeDataAccessException`이 `EmptyResultDataAccessException`의 부모임을 상속 계층으로 이해

## 의도적으로 파괴했을 때 결과로 얻은것

- 
- 

