---
title: "스키마 변경에 따른 변경 전파"
date: "2026-05-28"
draft: false
categories: ["우아한테크코스"]
tags: []
description: ""
image: ""
notionID: "2be78738-4b0a-82d4-aacd-01f3acd40f7b"
notionEdited: "2026-06-30T06:58:00.000Z"
---

# **스키마 변경 영향 분석:** **`reservation.theme_slot_id`** **FK 도입**


## **변경 개요**


`reservation` 테이블의 `date`, `time_id`, `theme_id` 컬럼을 제거하고,


`theme_slot(id)`를 참조하는 외래키 `theme_slot_id` 단일 컬럼으로 대체한다.


```sql
-- 변경 전CREATETABLE reservation(    id       BIGINTNOTNULL AUTO_INCREMENT,nameVARCHAR(255)NOTNULL,    statusVARCHAR(255)NOTNULL,dateDATENOTNULL,    time_id  BIGINTNOTNULL,    theme_id BIGINTNOTNULL,PRIMARYKEY(id),FOREIGNKEY(time_id)REFERENCEStime(id),FOREIGNKEY(theme_id)REFERENCES theme(id));-- 변경 후CREATETABLE reservation(    id            BIGINTNOTNULL AUTO_INCREMENT,nameVARCHAR(255)NOTNULL,    statusVARCHAR(255)NOTNULL,    theme_slot_id BIGINTNOTNULL,PRIMARYKEY(id),FOREIGNKEY(theme_slot_id)REFERENCES theme_slot(id));
```


---


## **영향 파일 목록**


| **레이어**     | **파일**                               | **변경 규모**            |
| ----------- | ------------------------------------ | -------------------- |
| DB 스키마      | `schema.sql`                         | 컬럼 교체                |
| 초기 데이터      | `data.sql`                           | 전면 재작성               |
| 도메인         | `Reservation.java`                   | 필드·생성자·검증 전체         |
| 리포지토리 인터페이스 | `ReservationRepository.java`         | 메서드 시그니처 변경          |
| 리포지토리 구현    | `JdbcReservationRepository.java`     | SQL 쿼리 전체            |
| 리포지토리 인터페이스 | `ThemeSlotRepository.java`           | 신규 메서드 추가            |
| 리포지토리 구현    | `JdbcThemeSlotRepository.java`       | 신규 메서드 구현            |
| 서비스         | `ReservationService.java`            | 조회·검증·생성 로직          |
| 컨트롤러        | `ReservationController.java`         | `toResponse()` 위임 확인 |
| DTO         | `ReservationModifyRequest.java`      | 검증 로직 이동 고려          |
| 테스트 Fake    | `FakeReservationDao.java`            | 인터페이스 변경 동기화         |
| 테스트 Fake    | `FakeThemeSlotDao.java`              | 신규 메서드 구현            |
| 단위 테스트      | `ReservationTest.java`               | 생성자 호출부 전체           |
| 통합 테스트      | `JdbcReservationRepositoryTest.java` | 테스트 픽스처 전체           |
| 서비스 테스트     | `ReservationServiceTest.java`        | 픽스처·어설션 일부           |


---


## **파일별 상세 변경 내용**


---


### **1.** **`src/main/resources/schema.sql`**


```sql
-- reservation 테이블 재정의CREATETABLE IFNOTEXISTS reservation(    id            BIGINTNOTNULL AUTO_INCREMENT,nameVARCHAR(255)NOTNULL,    statusVARCHAR(255)NOTNULL,    theme_slot_id BIGINTNOTNULL,-- 신규PRIMARYKEY(id),FOREIGNKEY(theme_slot_id)REFERENCES theme_slot(id)-- 신규-- 제거: date DATE, time_id BIGINT, theme_id BIGINT, 기존 FK 2개);
```

> **주의**: `theme_slot` 테이블 CREATE 문이 `reservation`보다 먼저 위치해야 FK 참조가 성립한다.
>
> 현재 DROP 순서(`theme_slot` → `reservation`)도 의존성 방향이 바뀌므로 확인 필요.
>
>

---


### **2.** **`src/main/resources/data.sql`**


### **현재 문제**

- `reservation` INSERT가 `(name, date, status, time_id, theme_id)` 컬럼을 사용한다.
- `theme_slot`은 reservations에서 MERGE로 역방향 동기화된다.

### **변경 후 요구 순서**


`theme_slot`이 먼저 존재해야 `reservation`이 `theme_slot_id`를 참조할 수 있으므로


데이터 삽입 순서를 아래와 같이 바꿔야 한다.


```plain text
1. theme INSERT (기존 유지)2. time  INSERT (기존 유지)3. theme_slot INSERT ← 이 시점에 명시적으로 삽입 (현재는 맨 마지막 MERGE로 자동 생성)4. reservation INSERT (name, status, theme_slot_id) ← subquery로 theme_slot_id 조회
```


### **reservation INSERT 예시 (subquery 방식)**


```sql
INSERTINTO reservation(name, status, theme_slot_id)VALUES('게스트','CONFIRMED',(SELECT idFROM theme_slotWHERE theme_id =1ANDdate ='2026-05-07'AND time_id =1)),('게스트','CONFIRMED',(SELECT idFROM theme_slotWHERE theme_id =1ANDdate ='2026-05-07'AND time_id =4)),...;
```

> **제거 대상**: 파일 하단의 `MERGE INTO theme_slot ... SELECT ... FROM reservation` 블록
>
> (reservation → theme_slot 역방향 동기화 쿼리, 불필요해짐)
>
>

---


### **3.** **`src/main/java/roomescape/domain/Reservation.java`**


### **필드 변경**


```java
// 제거privatefinal LocalDate date;privatefinal Time time;privatefinal Theme theme;// 추가privatefinal ThemeSlot themeSlot;
```


### **생성자 변경**


```java
// 변경 전public Reservation(String name, LocalDate date, Time time, Theme theme)public Reservation(Long id, String name, LocalDate date, Time time, Theme theme, ReservationStatus status)// 변경 후public Reservation(String name, ThemeSlot themeSlot)public Reservation(Long id, String name, ThemeSlot themeSlot, ReservationStatus status)
```


### **`of()`** **정적 팩토리 변경**


```java
publicstatic Reservation of(Long id, Reservation reservation){returnnew Reservation(id, reservation.getName(), reservation.getThemeSlot(), reservation.getReservationStatus());}
```


### **`validate()`** **변경**


```java
// 변경 전: name, date, time, theme 각각 null 체크// 변경 후: name, themeSlot null 체크 (date/time/theme 검증은 ThemeSlot 생성 시점으로 이동)privatevoid validate(String name, ThemeSlot themeSlot){if(name==null|| name.isBlank()){ ...}if(themeSlot==null){ ...}}
```


### **게터 전략 (컨트롤러·응답 DTO 영향 최소화)**


```java
// 위임 게터로 유지하면 ReservationController.toResponse() 수정 불필요public LocalDate getDate(){return themeSlot.getDate();}public Time getTime(){return themeSlot.getTime();}public Theme getTheme(){return themeSlot.getTheme();}public ThemeSlot getThemeSlot(){return themeSlot;}
```


---


### **4.** **`src/main/java/roomescape/repository/ReservationRepository.java`**


### **변경 메서드**


```java
// 변경 전boolean isExistBy(Long themeId, LocalDate date, Long reservationTimeId);void updateDateAndTimeAndTheme(Reservation reservation);// 변경 후boolean isExistBy(Long themeSlotId);// themeSlot의 is_reserved 또는 reservation 존재 여부void updateThemeSlot(Reservation reservation);// theme_slot_id 컬럼만 UPDATE
```

> `existsByThemeId(long themeId)`, `existsByTimeId(long timeId)` 시그니처는 유지,
>
> 내부 SQL이 theme_slot JOIN으로 바뀐다.
>
>

---


### **5.** **`src/main/java/roomescape/repository/JdbcReservationRepository.java`**


### **`findAll()`****,** **`findById()`****,** **`findByName()`** **SQL — JOIN 구조 변경**


```sql
-- 변경 전FROM reservation rINNERJOINtime tON r.time_id = t.idINNERJOIN theme themeON r.theme_id = theme.id-- 변경 후FROM reservation rINNERJOIN theme_slot tsON r.theme_slot_id = ts.idINNERJOINtime tON ts.time_id  = t.idINNERJOIN theme thON ts.theme_id = th.id
```


SELECT 목록에서 `r.date` 제거 → `ts.date AS date` 로 교체 (또는 ThemeSlot 전체 매핑)


### **`createParams()`** **변경**


```java
// 변경 전Map.of("name", ...,"date", ...,"time_id", ...,"theme_id", ...,"status", ...)// 변경 후Map.of("name", ...,"theme_slot_id", reservation.getThemeSlot().getId(),"status", ...)
```


### **`isExistBy(Long themeId, LocalDate date, Long reservationTimeId)`** **변경**


```java
// 변경 후 시그니처boolean isExistBy(Long themeSlotId)// SQLSELECT EXISTS(    SELECT1 FROM reservation WHERE theme_slot_id=?)
```


### **`updateDateAndTimeAndTheme()`** **→** **`updateThemeSlot()`** **변경**


```sql
-- 변경 전UPDATE reservationSETdate = ?, time_id = ?, theme_id = ?WHERE id = ?-- 변경 후UPDATE reservationSET theme_slot_id = ?WHERE id = ?
```


### **`existsByThemeId()`****,** **`existsByTimeId()`** **SQL 변경**


```sql
-- existsByThemeId 변경 후SELECTEXISTS(SELECT1FROM reservation rINNERJOIN theme_slot tsON r.theme_slot_id = ts.idWHERE ts.theme_id = ?)-- existsByTimeId 변경 후SELECTEXISTS(SELECT1FROM reservation rINNERJOIN theme_slot tsON r.theme_slot_id = ts.idWHERE ts.time_id = ?)
```


### **`rowMapper()`** **변경**


```java
// 변경 후: ThemeSlot을 먼저 조립하여 Reservation에 전달return(rs, rowNum) ->{    ThemeSlot themeSlot=new ThemeSlot(        rs.getLong("ts_id"),new Theme(rs.getLong("theme_id"), rs.getString("theme_name"), ...),        rs.getObject("date", LocalDate.class),new Time(rs.getLong("t_id"), rs.getObject("start_at", LocalTime.class)),        rs.getBoolean("is_reserved"));returnnew Reservation(rs.getLong("r_id"), rs.getString("name"), themeSlot, toStatus(rs.getString("status")));};
```


---


### **6.** **`src/main/java/roomescape/repository/ThemeSlotRepository.java`** **— 신규 메서드 추가**


```java
// 서비스에서 (themeId, date, timeId) 조합으로 슬롯을 조회할 수 있어야 함Optional<ThemeSlot> findBy(long themeId, LocalDate date,long timeId);
```


---


### **7.** **`src/main/java/roomescape/repository/JdbcThemeSlotRepository.java`** **— 신규 메서드 구현**


```java
@Overridepublic Optional<ThemeSlot> findBy(long themeId, LocalDate date,long timeId){    String sql="""            SELECT ... FROM theme_slot ts            INNER JOIN time t ON ts.time_id = t.id            INNER JOIN theme th ON ts.theme_id = th.id            WHERE ts.theme_id = ? AND ts.date = ? AND ts.time_id = ?            """;return jdbcTemplate.query(sql, rowMapper(), themeId, date, timeId).stream().findFirst();}
```


---


### **8.** **`src/main/java/roomescape/service/ReservationService.java`**


### **`saveReservation()`** **변경**


```java
// 변경 전public Reservation saveReservation(String name, LocalDate date, Long reservationTimeId, Long themeId){    validateBeforeDate(date);    validateIsExistBy(date, reservationTimeId, themeId);    Theme theme= getThemeOrElseThrow(themeId);    Time time= getTimeOrElseThrow(reservationTimeId);    validateDateTime(date, time);    Reservation reservation= reservationRepository.save(new Reservation(name, date, time, theme));    themeSlotRepository.update(new ThemeSlot(theme, date, time,true));return reservation;}// 변경 후 (Theme/Time 개별 조회 불필요 → ThemeSlot 단일 조회)public Reservation saveReservation(String name, LocalDate date, Long reservationTimeId, Long themeId){    validateBeforeDate(date);    ThemeSlot themeSlot= getThemeSlotOrElseThrow(themeId, date, reservationTimeId);    validateIsExistBy(themeSlot.getId());    validateDateTime(date, themeSlot.getTime());    Reservation reservation= reservationRepository.save(new Reservation(name, themeSlot));    themeSlotRepository.update(ThemeSlot.of(themeSlot.getId(),/* isReserved=true */));return reservation;}
```

> `getThemeOrElseThrow()`, `getTimeOrElseThrow()` 메서드는 이 메서드에서 불필요해진다.
>
> (다른 서비스 메서드에서 사용 중이면 유지)
>
>

### **`removeReservation()`****,** **`cancelReservation()`** **변경**


```java
// 변경 전themeSlotRepository.update(new ThemeSlot(reservation.getTheme(), reservation.getDate(), reservation.getTime(),false));// 변경 후 (위임 게터를 사용하면 코드 변경 없음, ThemeSlot 직접 접근하면 더 명확)themeSlotRepository.update(ThemeSlot.of(reservation.getThemeSlot().getId(),/* isReserved=false */));
```


### **`modifyReservation()`** **변경**


```java
// 변경 전public Reservation modifyReservation(Long reservationId, LocalDate date, Long timeId, Long themeId){    Time time= getTimeOrElseThrow(timeId);    Theme theme= getThemeOrElseThrow(themeId);    ...    reservationRepository.updateDateAndTimeAndTheme(updateReservation);}// 변경 후public Reservation modifyReservation(Long reservationId, LocalDate date, Long timeId, Long themeId){    ThemeSlot newSlot= getThemeSlotOrElseThrow(themeId, date, timeId);    Reservation reservation= getReservationOrElseThrow(reservationId);    validateIsExistBy(newSlot.getId());    validateDateTime(date, newSlot.getTime());    Reservation updated=new Reservation(reservationId, reservation.getName(), newSlot, reservation.getReservationStatus());    reservationRepository.updateThemeSlot(updated);return updated;}
```


### **`validateIsExistBy()`** **변경**


```java
// 변경 전privatevoid validateIsExistBy(LocalDate date, Long reservationTimeId, Long themeId){if(reservationRepository.isExistBy(themeId, date, reservationTimeId)){ ...}}// 변경 후privatevoid validateIsExistBy(Long themeSlotId){if(reservationRepository.isExistBy(themeSlotId)){ ...}}
```


### **신규 헬퍼 메서드 추가**


```java
private ThemeSlot getThemeSlotOrElseThrow(Long themeId, LocalDate date, Long timeId){return themeSlotRepository.findBy(themeId, date, timeId).orElseThrow(() ->new CustomException(ErrorCode.THEME_SLOT_NOT_FOUND));}
```

> `ErrorCode.THEME_SLOT_NOT_FOUND` 에러 코드가 없으면 추가 필요.

---


### **9.** **`src/main/java/roomescape/controller/ReservationController.java`**


`toResponse()` 내부에서 `reservation.getDate()`, `reservation.getTime()`, `reservation.getTheme()`을 호출한다.


`Reservation` 도메인에서 위임 게터를 유지하면 **변경 없음**.


위임 게터를 제거하면 `toResponse()`에서 `reservation.getThemeSlot().getDate()` 등으로 수정 필요.


---


### **10.** **`src/main/java/roomescape/controller/dto/ReservationModifyRequest.java`**


현재 record 생성자에 `validateBeforeDate(date)` 로직이 포함되어 있다.


이 검증을 서비스 레이어로 옮기는 것을 고려 (DTO에서 도메인 예외를 던지는 것은 부자연스럽다).


→ **선택적 리팩토링**, 기능 변경 없음.


---


### **11.** **`src/test/java/roomescape/repository/FakeReservationDao.java`**


### **`save()`** **변경**


```java
// 변경 전Reservation savedReservation=new Reservation(id, reservation.getName(),    reservation.getDate(), reservation.getTime(), reservation.getTheme(), reservation.getReservationStatus());// 변경 후Reservation savedReservation=new Reservation(id, reservation.getName(),    reservation.getThemeSlot(), reservation.getReservationStatus());
```


### **`isExistBy(Long themeId, LocalDate date, Long reservationTimeId)`** **변경**


```java
// 변경 후 시그니처publicboolean isExistBy(Long themeSlotId){return storage.values().stream().anyMatch(r -> Objects.equals(r.getThemeSlot().getId(), themeSlotId));}
```


### **`updateDateAndTimeAndTheme()`** **→** **`updateThemeSlot()`** **변경**


```java
// 변경 후publicvoid updateThemeSlot(Reservation reservation){    Long id= reservation.getId();    Reservation existing= storage.get(id);    storage.put(id,new Reservation(id, existing.getName(),            reservation.getThemeSlot(), existing.getReservationStatus()));}
```


### **`existsByThemeId()`****,** **`existsByTimeId()`** **변경**


```java
// themeSlot을 통해 접근publicboolean existsByThemeId(long themeId){return storage.values().stream().anyMatch(r -> Objects.equals(r.getThemeSlot().getTheme().getId(), themeId));}publicboolean existsByTimeId(long timeId){return storage.values().stream().anyMatch(r -> Objects.equals(r.getThemeSlot().getTime().getId(), timeId));}
```


---


### **12.** **`src/test/java/roomescape/repository/FakeThemeSlotDao.java`** **— 신규 메서드 구현**


```java
@Overridepublic Optional<ThemeSlot> findBy(long themeId, LocalDate date,long timeId){return storage.values().stream().filter(ts -> ts.getTheme().getId()== themeId&& ts.getDate().equals(date)&& ts.getTime().getId()== timeId).findFirst();}
```


---


### **13.** **`src/test/java/roomescape/domain/ReservationTest.java`**


모든 `new Reservation(...)` 호출을 `ThemeSlot`을 인자로 받는 생성자로 교체한다.


```java
// 변경 전Time time=new Time(1L, LocalTime.of(10,0));new Reservation(1L,"브라운", LocalDate.now().plusDays(1), time,new Theme(1L,null,null,null), PendingStatus.getInstance())// 변경 후ThemeSlot slot=new ThemeSlot(1L,new Theme(1L,null,null,null), LocalDate.now().plusDays(1),new Time(1L, LocalTime.of(10,0)),false);new Reservation(1L,"브라운", slot, PendingStatus.getInstance())
```


영향 줄: 22-23, 31-32, 39-40, 47-49


---


### **14.** **`src/test/java/roomescape/repository/JdbcReservationRepositoryTest.java`**


테스트 픽스처의 `new Reservation(name, date, time, theme)` 호출을 ThemeSlot 기반으로 교체.


`test-data.sql`에도 `theme_slot` 데이터가 먼저 삽입되어야 한다 (또는 테스트에서 직접 생성).


```java
// 변경 전 (예: save 테스트)Reservation reservation=new Reservation("브라운", LocalDate.now(), TIME_10, THEME_1);// 변경 후ThemeSlot slot=new ThemeSlot(1L, THEME_1, LocalDate.now(), TIME_10,false);Reservation reservation=new Reservation("브라운", slot);
```

> `test-data.sql`이 있다면 해당 파일에도 `theme_slot` INSERT 추가 필요.

---


### **15.** **`src/test/java/roomescape/service/ReservationServiceTest.java`**


`FakeThemeSlotDao`에 `findBy()` 메서드가 추가되면, 서비스 API(`saveReservation(name, date, timeId, themeId)`)는 유지되므로


테스트 호출부는 변경 없다.


단, `saveReservation` 내부에서 `themeSlotRepository.findBy(themeId, date, timeId)`를 호출하므로


`FakeThemeSlotDao`에 해당 슬롯 데이터가 미리 저장되어 있어야 한다.


```java
// setUp()에 ThemeSlot 사전 저장 추가 필요FakeThemeSlotDao fakeThemeSlotDao=new FakeThemeSlotDao();ThemeSlot savedSlot= fakeThemeSlotDao.save(new ThemeSlot(savedTheme, futureDate, savedTime,false));
```


---


## **변경 순서 권장안**

1. `schema.sql` 수정 (테이블 구조 변경)
2. `ThemeSlotRepository` + `JdbcThemeSlotRepository` + `FakeThemeSlotDao`에 `findBy()` 추가
3. `Reservation` 도메인 클래스 수정 (필드·생성자·게터)
4. `ReservationRepository` 인터페이스 메서드 시그니처 변경
5. `JdbcReservationRepository` SQL 및 구현 전체 변경
6. `ReservationService` 로직 변경
7. `FakeReservationDao` 변경 (인터페이스 동기화)
8. 단위·통합·인수 테스트 픽스처 수정
9. `data.sql` 재작성 (삽입 순서 역전 + reservation INSERT 방식 변경)

---


## **주요 고려사항**


### **데이터 정합성**

- `theme_slot`이 없는 (date, timeId, themeId) 조합으로 예약 요청 시 404가 발생한다.현재는 date/timeId/themeId 각각이 존재하면 예약 가능했으나, 이제는 **해당 슬롯이 사전에 생성되어 있어야** 한다.

### **`PolicyAcceptanceTest`**

- `중복_예약_등록시_409` 테스트: 현재는 `isExistBy(themeId, date, timeId)`로 DB를 직접 조회.변경 후 중복 여부 판단이 `theme_slot.is_reserved` 기반인지 `reservation` 존재 여부인지 정책 결정 필요.

### **`ErrorCode`** **추가**

- `THEME_SLOT_NOT_FOUND` 에러 코드를 `ErrorCode` enum에 추가해야 한다.

