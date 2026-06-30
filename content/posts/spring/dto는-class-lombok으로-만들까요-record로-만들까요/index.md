---
title: "DTO는 class + Lombok으로 만들까요, record로 만들까요?"
date: "2026-06-05"
draft: false
categories: ["Spring"]
tags: []
description: ""
image: ""
notionID: "37678738-4b0a-8089-a930-cd0408adc0f2"
notionEdited: "2026-06-13T09:24:00.000Z"
---

## 어떤 개념일까?


### DTO는 class + Lombok vs record 


JSON, 객체와의 변환을 만들기 위해서,
보일러플레이트를 줄이는 도구 Lombok class와 record 중에서 어떤 것을 사요할지에 대한 문제이다.


둘다 @RequestBody로 받지만, Jackson이 객체를 만들어내는 경로 생성 방식이 다르다.



---


## 어떤 문제를 해결하려고 나왔을까? 왜 사용 할까?


### Lombok


자바의 고질적인 보일러플레이트를 어노테이션으로 제거하려고 등장하였다.


### record (java 16+)


이 타입은 값을 담는 투명한 데이터이다라는 의도로 언어 차원에서 표현하려고 등장하였다.


불변 필드 + canonical constructor + accessor + equals/hashCode/toString을 자동으로 제공하고
DTO/VO 라는 의도가 타입 선언 자체에 드러난다.


즉, Lombok은 보일러플레이트 절감을 위한 목적의 수단이고,
record는 불변 데이터 객체라는 의미의 데이터이다.


---


## 어떻게 동작하나?


Jackson의 


### Jackson의 역직렬화 4가지 경로

- 기본 생성자 + setter → @NoargsConstructor +. @Setter @Data
- 기본 생성자 + 필드 주입 → 가시성 설정
- 생성자 기반 → @JsonCreator, @AllargsConstructor, @Value
- record canonical constructor → record 자료형

---


## 언제 쓰고, 언제 안 쓰나?


### record를 쓸 때

- 응답 DTO 만들어서 전달하기만 하면 되고, 불변의 의미 전달이 자연스럽고 명확하다.
- 외부 입력을 모든 필드가 채워진 채로만 존재 시키고 싶을 때

### class + Lombok을 쓸 때

- 가변성/유연성이 필요하거나, no-args + setter에 대한 역직렬화가 필요할 때,

---


## 남에게 설명한다면 어떻게 설명할 것인가?


---


## 추가 궁금한 질문들


---


## 나의 기준


현재 저는 요청 DTO에서는 class + Lombok, 응답 DTO에서는 record를 주로 사용하는 것을 추구합니다.


### 1. 응답 DTO를 record로 사용하는 이유

- 불변성의 의미 전달, 응답 데이터를 반환한다는 의미가이 자연스럽다.
응답을 만들어서 내보내기만 해서 변경될 일이 전혀 업다고 생각합니다.
- 직렬화가 record 자료형과 잘 맞는다고 생각합니다.

### 2. 요청 DTO를 class Lombok으로 사용하는 이유

- 요청 DTO에서 검증 어노테이션 필드와 함께 두는 것이 익숙하고, record보다 가독성이 좋다.
- class를 사용할 때, 역직렬화 과정에서 NoArgsConstructor + setter 를 통한 유연성이 필요할 때
- 요청을 record로 사용한다면, Jackson이 객체 생성 시점 검증 에러가 아닌 Jackson이러가 발생할 수 있다.
그래서 검증 에러에 대한 일관성으로 생성 후에 검증을 진행하는 class + lombok이 일관적이라고 생각한다.

