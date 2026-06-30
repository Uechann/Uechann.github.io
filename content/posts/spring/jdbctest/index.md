---
title: "JDBCTest"
date: "2026-05-28"
draft: false
categories: ["Spring"]
tags: []
description: ""
image: ""
notionID: "0b678738-4b0a-8212-b32f-01d0736e49d8"
notionEdited: "2026-05-28T07:24:00.000Z"
---

## 어떤 개념인가요 ?


JDBC 기반 컴포넌트만 격리해서 테스트하기 위한 Spring Boot의 슬라이스 테이스 어노테이션이다.

> 전체 애플리케이션을 띄우지 않고,   
> JDBC 작업에 필요한 최소한의 것만 로드해서 테스트하는 것이 본질이다.

## 어떤 문제를 해결하려고 나왔나?


### 문제1 @SpringBootTest가 너무 무겁다.


@SpringBootTest는 애플리케이션 전체 컨텍스트를 띄운다.


즉, Repository 하나를 테스트 하려고 (Controller, Service, Security, 외부 API, 메시지 큐 설정 등) 모든것 로드한다.

- 테스트 시작이 느림
- 관련 없는 빈 설정 오류로 테스트가 깨짐
- `뭘 테스트하는 건지 경계가 모호해짐`

### 문제2 순수 단위 테스트로는 SQL을 검증할 수 없다.


JdbcTemplate을 Mock으로 만들면 SQL 문자열이 맞는지 DB에서 동작하는지 알 수 없다.
진짜 DB가 필요한데, 가볍게 띄어줄 도구가 필요하다.


### 문제3 테스트 간 데이터 격리


테스트가 DB를 건드리면 다음 테스트에 영향이 간다.


## 어떻게 동작하나? (큰 그림)

1. TypeExcludeFilters(JdbcTypeExcludeFilter.class)
컴포넌트 스캔 제한을 하며, JDBC 관련 빈과 사용자가 만든 Repository만 올라온다.
2. Transactional 트랜잭션 자동 롤백 

각 테스트 메서드가 트랜잭션 안에서 실행되고, 끝나면 자동으로 롤백된다.
즉, 테스트마다 데이터가 초기화된다.
3. AutoConfigureJdbc

빈 JDBC 자동 설정
4. AutoConfigureTestDatabase

내장 DB 자동 설정
운영용 DataSource 설정이 있어도 이를 무시하고 H2 같은 인메모리 DB로 교체한다.
테스트가 외부 DB에 의존하지 않게 만들어준다.
5. ImportAutoConfiguration

흐름


```java
테스트 시작
  ↓
JDBC 관련 빈만 로드 (Controller, Service 제외)
  ↓
H2 인메모리 DB 자동 구동 + schema.sql 실행
  ↓
트랜잭션 시작
  ↓
@Test 메서드 실행 (Repository 동작 검증)
  ↓
트랜잭션 롤백 → DB 원상복구
  ↓
다음 테스트
```


## 언제 쓰고, 언제 안 쓰나?


쓸 때:

- JdbcTemplate 기반 Repository 테스트할 때
- 직접 작성한 SQL 쿼리가 실제 DB에서 동작하는지 검증할 때
- ResultSet → 객체 매핑이 올바른지 확인할 때
- DB 제약조건이 의도대로 걸리는지 볼 때
- 빠른 피드백이 필요한 통합 테스트가 필요할 때

안 쓸 때:

- JPA를 사용할 때, @DataJpaTest가 존재한다.
- Service → Repository를 Mock으로 두고 순수 단위 테스트로 한다.
- Controller → @WebMvcTest
- End-2-End 시나리오 → @SpringBootTest가 적합하다. Controller → DB까지 전체 흐름을 봐야한다.
- 운영 DB에 특화된 기능을 검증해야 할 때

## 남에게 설명한다면 어떻게 설명할 것인가?


JdbcTest는 Repository만 빠르게 테스트하려고 만든 어노테이션이다.
SpringBootTest처럼 앱 전체를 띄우면 무겁고 느리게됩니다.
그래서 Spring Boot가 JDBC 테스트할 때에는 진짜 필요한 것만 띄어주는 어노테이션을 만들었다.


구체적으로는 3가지는 해줍니다.
1. Controller나 Service 같은 빈은 안 올리고, JDBC 관련한 빈만 올려줍니다.
2. H2 인 메모리 DB를 자동으로 띄워서 외부 DB 없이 테스트할 수 있게 해줍니다.
3. 각 테스트가 끝나면 트랜잭션을 자동으로 롤백해서 테스트끼리 데이터가 안섞이게 해줍니다.


