---
title: "ArgumentResolver와 ReturnValueHandler 란?"
date: "2026-05-28"
draft: false
categories: ["Spring"]
tags: []
description: ""
image: ""
notionID: "e1478738-4b0a-838a-900c-012d9a113f92"
notionEdited: "2026-06-28T08:59:00.000Z"
---

## 어떤 개념인가요 ?


Spring MVC에서 컨트롤러 메서드의 파라미터를 만들어주는 역할과 반환값을 처리해주는 역할을 담당하는 두개의 확장 포인트이다.


## 어떤 문제를 해결하려고 나왔나?


초기 Spring MVC는 시그니처가 정해져 있었다.


하지만 파라미터의 종류는 매우 다양하였다.


이렇게 많은 종류의 파라미터를 받으려면 dispatcherServlet이 조건문으로 처리하면 코드가 폭발하게 된다.


이러한 상황에서 어떻게 하면 파라미터/반환값 처리 로직을 모듈처럼 끼워 넣을 수 있을까?


이 해결을 하기 위해서 등장한 것이 ArgumentResolver와 ReturnValueHandler이다.


## 어떻게 동작하나? (큰 그림)


요청이 들어오면 `RequestMappingHandlerAdapter`가 컨트롤러 메서드를 호출하기 직전에 이런 흐름을 탑니다.


```java
HTTP 요청
   ↓
DispatcherServlet → HandlerAdapter (컨트롤러 호출 책임)
   ↓
[메서드 파라미터마다 반복]
   → ArgumentResolver 목록을 순회하며 supportsParameter()로 묻기
   → "이 파라미터 내가 처리할 수 있어?" → Yes인 첫 번째 리졸버가 resolveArgument()로 값 생성
   ↓
컨트롤러 메서드 실행 (만들어진 인자들로)
   ↓
반환값을 ReturnValueHandler 목록에 넘김
   → supportsReturnType()으로 "내가 처리할 수 있어?" 묻기
   → Yes인 첫 번째 핸들러가 handleReturnValue()로 응답 처리
   ↓
HTTP 응답
```


## 언제 쓰고, 언제 안 쓰나?


### 언제 쓰고, 언제 안 쓰나?


**쓸 때:**

- 커스텀 어노테이션을 만들어서 파라미터에 적용하고 싶을 때 (예: `@LoginUser User user`처럼 세션에서 사용자를 자동으로 꺼내오기)
- 모든 컨트롤러에서 반복되는 파라미터 추출 로직을 한 곳에 모으고 싶을 때 (헤더 파싱, 토큰 검증 후 사용자 정보 주입 등)
- 특정 타입의 반환값을 공통된 형식으로 감싸서 응답하고 싶을 때 (예: 모든 응답을 `ApiResponse<T>`로 래핑)

**안 쓸 때:**

- `@PathVariable`, `@RequestParam`, `@RequestBody`처럼 Spring이 이미 제공하는 걸로 충분할 때 (대부분의 경우)
- 단순히 값 가공이 필요한 거라면 그냥 서비스 레이어에서 처리하는 게 명확함
- 인터셉터나 필터로 해결 가능한 횡단 관심사 (인증 통과 여부 같은 건 인터셉터가 더 적합)

## 남에게 설명한다면 어떻게 설명할 것인가?

> Spring MVC에서 컨트롤러 메서드는 파라미터랑 반환 타입이 정말 자유롭잖아요? `@PathVariable Long id` 써도 되고, `Principal` 받아도 되고, `ResponseEntity` 반환해도 되고. 이게 가능한 이유가 ArgumentResolver랑 ReturnValueHandler 덕분이에요.
>
> DispatcherServlet이 컨트롤러를 호출하기 전에, '이 파라미터는 누가 만들어줄래?' 하고 리졸버들한테 차례로 물어봅니다. 손드는 놈이 그 파라미터 값을 만들어주는 거예요. 반환값도 마찬가지로 '이 반환 타입은 누가 응답으로 바꿔줄래?' 물어보고 처리하고요.
>
>
> 직접 만들 일은 자주 없는데, 예를 들어 `@LoginUser`라는 어노테이션을 만들어서 `public Post create(@LoginUser User user, ...)` 이렇게 쓰고 싶다면 ArgumentResolver를 하나 만들어서 등록하면 돼요. 매번 컨트롤러마다 세션에서 사용자 꺼내는 코드 안 써도 되니까 깔끔해지죠."
>
>

핵심은 **확장 포인트**라는 점입니다. 프레임워크 수정 없이 파라미터/반환값 처리 방식을 추가할 수 있는, Spring MVC의 가장 우아한 설계 중 하나로 꼽힙니다.


