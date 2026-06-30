---
title: "계층별 테스트 코드 작성 : 나만의 방법 "
date: "2026-05-28"
draft: false
categories: ["Spring"]
tags: []
description: ""
image: ""
notionID: "2ac78738-4b0a-8235-a26e-812dfe38eafd"
notionEdited: "2026-06-01T11:29:00.000Z"
---

## 1. Repository 계층


### 무엇을 검증하는가

- 직접 작성한 SQL/쿼리,
- 컬럼↔객체 매핑(`RowMapper`),
- DB 제약조건(unique·FK) 위반 시 기대한 예외.

### 어떻게 테스트 할까


```java
@JdbcTest // JdbcTemplate 기반. JPA면 @DataJpaTest
class ReservationRepositoryTest {

    @Autowired JdbcTemplate jdbcTemplate;

    @Test
    void 중복_슬롯_저장시_제약조건_위반_예외가_발생한다() {
        // unique 제약을 가진 슬롯을 두 번 저장 → 기대한 예외 검증
    }
}
```


사용하는 기술에 따라서 다르게 접근한다.


: `@JdbcTest` `@DataJpaTest`, + 인메모리 H2 or Testcontainers


### 어떤 결정을 내리는가

- **표준 SQL + 단순 CRUD** → H2로 한다.
- **벤더 종속 기능**(upsert `ON DUPLICATE KEY`, JSON 컬럼, 비관/낙관 락, `FOR UPDATE`, 벤더 함수) → H2가 통과시켜도 운영(MySQL/PostgreSQL)에서 깨질 가능성이 있으므로,
**Testcontainers**로 실제 엔진을 띄워야 한다.

**락 동작을 검증하는 테스트는 H2로 하지 않는다.**
H2와 MySQL의 락 모델이 달라서 통과해도 의미가 없다. 
MVCC·낙관/비관 락 검증은 Testcontainers를 사용한다.


## 2. Service 계층 — Mock / Fake / @SpringBootTest 결정


### 어떻게 테스트 할까


| 방법              | 검증 성격       | 비용       | 구현 결합          |
| --------------- | ----------- | -------- | -------------- |
| Mock            | 행위(호출했는가)   | 쌈, 스프링 X | 높음 (호출 순서에 결합) |
| Fake            | 상태(결과가 맞는가) | 쌈, 스프링 X | 낮음             |
| @SpringBootTest | 진짜 연동       | 비쌈, 느림   | 없음             |


**결정 기준**


`Mock`

- 상호작용을 검증한다.
- 외부 시스템/ 비결정적이거나, 실패 상황을 강제로 만들어야 하는 것인가?

`Fake` 

- 결과(상태)를 검증한다.
- 내가 통제하는 것 (repository) 이고, 상태로 검증하며 여러 테스트에서 재사용하고 싶은가?

`@SpringBootTest` 

- 프레임워크가 매개하는 동작을 검증한다.
- 트랙잭션, 프록시, 실제 빈까지 함께 테스트해야하는가?

### Fake를 기본으로 하자.


Mock을 사용한다면 `verify(repo).save(...)`는 
"내가 save를 불렀다"만 확인하지 규칙이 옳은지는 검증 못 하고, 구현을 바꾸면 동작이 같아도 깨진다.


반면 인메모리 Fake Repository를 쓰면 실제 저장·조회 결과(상태)로 검증하므로 
비즈니스 규칙이 깨지지 않음과 정확히 맞고 리팩터링에도 강합니다.


#### @SpringBootTest는 마지막 선택지로 한다.


신뢰도는 가장 높지만 느립니다. 그래서 **Mock/Fake로 잡히는 건 여기서 하지 않는다.** 
오직 프레임워크가 떠 있어야만 존재하는 동작 프록시 기반 `@Transactional`, self-invocation 같은 것에만 씁니다. 프록시가 살아 있어야 재현되므로 순수 단위테스트로는 절대 못 잡는다.


## 3. Controller 계층


### 무엇을 검증하는가

- `@Valid` 검증 동작 (필수값 누락 → 400)
- 예외 → 응답/상태코드 변환 (GlobalExceptionHandler + ErrorCode 경유, 400 vs 422 판단)
- 직렬화/역직렬화 엣지 (Jackson `final` 필드 이슈)
- 파라미터 바인딩·기본값

### 어떻게 테스트 할까


`@WebMvcTest` 슬라이스 + MockMvc. 웹 계층만 올리고, Service는 가짜로 채운다. 
**컨트롤러가 검증하려는 건 비즈니스 로직이 아니라 변환이므로 Service를 진짜로 부를 필요가 없다.**


```java
@WebMvcTest(ReservationController.class)
class ReservationControllerTest {

    @Autowired MockMvc mockMvc;
    @MockitoBean ReservationService reservationService;
    // Spring Boot 3.4부터 @MockBean은 deprecated → @MockitoBean

    @Test
    void 필수값이_없으면_400을_반환한다() throws Exception {
        mockMvc.perform(post("/reservations")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isBadRequest());
    }
}
```


**어떤 결정을 내리는가**


하나도 없는 순수 위임 컨트롤러면 테스트하지 않고 API 테스트에 맡깁니다. 
controller에 변환·검증·예외 매핑이 한 줄이라도 있으면 그건 자체 로직이므로 `@WebMvcTest`로 검증한다. 



## 4. API 계층


### 무엇을 검증하는가


핵심 시나리오가 계층을 가로질러 실제로 연결되는가 (예약 생성 → 조회 → 취소의 happy path)


### 어떻게 테스트 할까


`@SpringBootTest(webEnvironment = RANDOM_PORT)` + RestAssured. RestAssured는 실제 포트로 요청하므로 `MOCK`이 아니라 `RANDOM_PORT`여야 합니다.


```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ReservationApiTest {

    @LocalServerPort int port;

    @BeforeEach
    void setUp() {
        RestAssured.port = port; // 랜덤으로 뜬 실제 포트를 RestAssured에 연결
    }
}
```


### 어떤 결정을 내리는가


**범위 : "연결되는가"만 본다.** 경계값·예외·분기 같은 엣지 케이스는 하위 계층에서 이미 검증했어야 하고, 여기서는 시나리오가 계층을 가로질러 연결되는지만 확인합니다. 통합 테스트에 엣지 케이스를 욱여넣으면 느려지고 깨지기 쉬워집니다.


**비용 : 컨텍스트를 재사용한다.** `@SpringBootTest` 설정(프로파일·프로퍼티)을 통일하면 스프링이 ApplicationContext를 캐싱·재사용합니다. 테스트마다 설정이 제각각이면 컨텍스트를 매번 새로 띄워 급격히 느려집니다.


**격리 : truncate를 쓴다.** 실제 HTTP를 타면 요청 스레드가 분리돼 테스트 스레드의 `@Transactional` 롤백이 적용되지 않는 경우가 많습니다. 따라서 롤백에 의존하지 말고, 각 테스트 전후로 테이블을 truncate하는 방식이 더 안전합니다.


## 정리 표


| 계층         | 무엇을              | 어떻게                                          | 결정 기준                                                       |
| ---------- | ---------------- | -------------------------------------------- | ----------------------------------------------------------- |
| API        | 계층 횡단 핵심 시나리오 연결 | `@SpringBootTest(RANDOM_PORT)` + RestAssured | happy path만, 엣지는 하위에서                                       |
| Controller | 검증·예외변환·직렬화·바인딩  | `@WebMvcTest` + MockMvc                      | 자체 로직 있으면 검증, 순수 위임이면 스킵                                    |
| Service    | 오케스트레이션·비즈니스 규칙  | Mock / Fake / `@SpringBootTest`              | 외부·비결정 → Mock / 통제가능 협력자 → Fake / 프록시·트랜잭션 → SpringBootTest |
| Repository | 쿼리·매핑·제약         | `@JdbcTest` + H2                             | 표준 SQL → H2 / 벤더 기능·락 → Testcontainers                      |


