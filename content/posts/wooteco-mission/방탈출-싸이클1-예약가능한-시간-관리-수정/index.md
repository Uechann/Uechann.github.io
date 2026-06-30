---
title: "방탈출-싸이클1 예약가능한 시간 관리 수정"
date: "2026-05-28"
draft: false
categories: ["우아한테크코스"]
tags: []
description: ""
image: ""
notionID: "8c978738-4b0a-82f1-8d36-018a64f8f7be"
notionEdited: "2026-06-30T06:58:00.000Z"
---
> 
>
> **대상:**
>
>

---


## 문제 인식 — 무엇이 문제였나?

> 현재 코드 혹은 구조에서 느낀 불편함, 버그, 유지보수 어려움 등을 구체적으로 기록하세요.

### 문제 상황


예약 가능한 시간 조회할 때, 모든 시간들을 다 조회하고, reseration 테이블에서 조회 후에 
예약이 존재하는 timeId들에 대해서 다시 비교 하는 로직을 거친 후에 예약 가능한 시간에 대한 데이터를 생성 후 반환해주고 있다.


그래서 이게 왜 문제가 될까?


비즈니스 요구사항이 어떻게 변경된다면 로직이 복잡해질 수 있을까 ?


예약에 존재하는 timeId에 대해서 모든 시간을 비교하게 되는데,


테마 마다 예약을 운영하기 시작 시간, 종료시간, 예약의 단위가 다를 경우가 있다.


이럴 경우 모든 시간을 생성 후에 각 테마별로 다른 예약 가능 여부에 대한 record를 생성해야한다.


### 문제가 되는 코드 / 구조


```java
@GetMapping(params = {"themeId", "date"})
    public ResponseEntity<List<TimeResponse>> getAvailableTimes(long themeId, LocalDate date) {
        List<Time> allTimes = timeService.allTimes();
        List<Long> reservedTimeId = timeService.findReserved(themeId, date);
        return ResponseEntity.ok(TimeResponse.availableOf(allTimes, reservedTimeId));
        // return ResponseEntity.ok(convertToTimeResponsesFromThemeSlots(timeService.findThemeSlotBy(themeId, date)));
    }
```


### 문제 유형 체크

- [ ] 중복 코드 / 로직
- [ ] 불명확한 이름 (변수, 메서드, 클래스 등)
- [x] 단일 책임 원칙(SRP) 위반 — 너무 많은 역할
- [ ] 높은 결합도 — 변경 시 여러 곳에 영향
- [ ] 낮은 응집도 — 관련 없는 것들이 한곳에
- [ ] 확장하기 어려운 구조 (OCP 위반)
- [ ] 테스트하기 어려운 구조
- [ ] 성능 문제
- [ ] 가독성 / 이해하기 어려움
- [ ] 기타:

---


## 3. 변경 이유 — 왜 바꿔야 하는가?

> 지금 당장 동작하더라도 왜 바꾸어야 하는지 그 필요성을 설득력 있게 정리하세요.
- **유지보수 측면: 
유지 보수 측면에서, 이렇게 예약 가능 시간에 대한 관리를 한다면
테마 별로 다른 예약 규칙 방식에 대해서 대처하기에 어려워진다.**
- **확장성 측면:
테마 별로 예약의 시작 시간과 단위를 다르게 확장할수 있다.**

---


## 4. 변경 방향 — 어떻게 바꿀 것인가?

> 어떤 방식으로 접근할지, 어떤 기법·패턴·원칙을 적용할지 계획을 기록하세요.

### 접근 전략


themeSlot 테이블 추가하여 
테마별 날짜, 시간에 대한 예약 여부 타임 슬롯을 관리한다.


그리고 일단은 사용자가 예약을 진행하기 전에 예약가능한 시간을 조회했을 때,
해당 데이터가 없다면 그날의 데이터를 생성하고, 있다면 조회해온다.


그리고 사용자가 예약 가능한 시간을 조회한 결과로 조회했을 때, 예약 테이블에 row를 추가하고, 추가적으로 themeSlot에 해당 timeSlot을 is_reserved를 true로 업데이트 한다.


### 적용할 기법 / 패턴 / 원칙

- [ ] 메서드 추출 (Extract Method)
- [ ] 클래스 / 인터페이스 추출
- [ ] 디자인 패턴 적용 (패턴명: )
- [ ] 레이어 / 모듈 분리
- [ ] 의존성 역전 (DIP) 적용
- [ ] 불변 객체 / VO 도입
- [x] 기타: 테이블 추가

---


## 5. 변경 결과 — 어떻게 바뀌었나?


### 변경된 코드 / 구조


```plain text
// 리팩터링 후 코드나 구조를 붙여넣으세요
```


### Before / After 비교


---


## 8. 회고


### 배운 점

- 예약 시간 관리 방법

