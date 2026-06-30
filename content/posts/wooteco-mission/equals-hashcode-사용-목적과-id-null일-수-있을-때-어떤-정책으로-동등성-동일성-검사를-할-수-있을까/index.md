---
title: "equals & hashCode 사용 목적과 id null일 수 있을 때, 어떤 정책으로 동등성, 동일성 검사를 할 수 있을까?"
date: "2026-05-31"
draft: false
categories: ["우아한테크코스"]
tags: []
description: ""
image: ""
notionID: "37178738-4b0a-80af-984b-c3e89a5b8c90"
notionEdited: "2026-06-30T06:58:00.000Z"
---

엔티티의 동등성을 무엇으로 정의할 것인가?


## equals / hashCode 사용 목적

- 동일성 (identity, `==`): 두 참조가 같은 객체 인스턴스를 가리키는가. JVM 메모리 주소 비교
- 동등성(equality, `equals`): 두 객체가 논리적으로 같은 것을 의미하는가.

`a.equals(b)`가 true 이면, `a.hashCode() == b.hashCode()`이어야 한다.


## 현재 내 동등성 비교 코드의 문제점


```java
public boolean equals(Object o) {
    if (o == null || getClass() != o.getClass()) return false;
    Reservation that = (Reservation) o;
    return Objects.equals(id, that.id);  // 둘 다 null이면 true!
}
public int hashCode() {
    return Objects.hashCode(id);  // id 바뀌면 hashCode도 바뀜
}
```


영속화 전 객체 (id == null)를 보면 두가지 버그가 있다.


### 1. null끼리 같다고 판단됨


Objects.equals(null, null)은 true로 판단됩니다.


### 2. hashCode가 가변적이다.


저장 전 hashCode와 저장 후 hashCode가 다르게 된다.


만약 저장 전에 HashSet에 넣었다가 contains로 호출하게 된다면, 객체는 다른 버킷으로 이동하게 되어 찾지 못하게 된다.


## 해결책


Id 기반으로 동등성 검사 + null-safe 안전으로 비교


```java
@Override
public boolean equals(Object o) {
    if (this == o) return true; // 같은 인스턴스면 무조건 같음
    if (o == null || getClass() != o.getClass()) return false;
    Reservation that = (Reservation) o;
    return id != null && Objects.equals(id, that.id); // id 없으면 false
}

@Override
public int hashCode() {
    return getClass().hashCode();  // id에 의존하지 않는 안정적인 값
}
```


id를 식별자로 사용하되, id가 null이라면 아직 정체성이 없다고 보고 자기 자신하고만 같게 한다.

- id ≠ null 때문에 저장 전 객체 두개는 같지 않고,
this == 0로 자기 자신만 같다.
- hashCode를 id가 아니라 클래스 단위 상수로 고정해 Id가 할당 돼도 변하지 않게 한다.

## 어떤 개념일까?


AI를 이용해 핵심 개념을 빠르게 파악한다.
깊은 이해보다는 새로운 기술이 어떤 기술인지 어떤 문제를 해결하기 위해 등장했는지 지도만 그린다.


---


## 어떤 문제를 해결하려고 나왔을까? 왜 사용 할까?


---


## 어떻게 동작하나?


---


## 언제 쓰고, 언제 안 쓰나?


### 쓸 때:


### 안 쓸 때:


---


## 남에게 설명한다면 어떻게 설명할 것인가?


---


## 추가 궁금한 질문들


