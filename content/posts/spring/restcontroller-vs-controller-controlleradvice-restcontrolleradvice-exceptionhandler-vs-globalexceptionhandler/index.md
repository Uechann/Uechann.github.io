---
title: "RestController vs Controller, ControllerAdvice, RestControllerAdvice, ExceptionHandler vs GlobalExceptionHandler"
date: "2026-05-28"
draft: false
categories: ["Spring"]
tags: []
description: ""
image: ""
notionID: "27278738-4b0a-827b-bdcb-0112a652b2e3"
notionEdited: "2026-05-28T07:24:00.000Z"
---

## 어떤 개념인가요 ?


### Controller vs RestController 


Controller는 Spring MVC 부터 있었고, 메서드가 반환하는 문자열을 View 이름으로 해석한다.


즉, Server Side Rendering SSR 방식 서버가 직접 HTML을 만드는 전통적인 방식에서 사용한다.


RestController는 REST API 시대에 등장했다.


Controller + ResponseBody를 합친 것으로, 메서드 반환값을 View가 아닌 HTTP 응답 body에 직접 JSON으로 직렬화한다.


Controller는 Thymeleaf 같은 서버사이트 템플릿 엔진에서 사용하고,


RestController는 React/Vue 처럼 프론트엔드와 분리된 API 서버를 만든다.


### ExceptionHandler vs GlobalExceptionHandler


ExceptionHandler는 메서드 레벨 어노테이션이다.


@ControllerAdvice를 통해서 중복된 모든 컨트롤러에서 발생한 예외 처리를 해결하였다.


### ControllerAdvice vs RestControllerAdvice


RestControllerAdvice = ControllerAdvice + ResponseBody이다.


Rest API 서버에서는 ControllerAdvice를 사용한다면 모든 메서드에 ResponseBody를 붙여줘야 한다.


```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(UserNotFoundException.class)
    @ResponseBody  // 매번 이걸 붙여야 함
    public ErrorResponse handle(UserNotFoundException e) { ... }
}

@RestControllerAdvice  // @ResponseBody 자동 포함
public class GlobalExceptionHandler {
    @ExceptionHandler(UserNotFoundException.class)
    public ErrorResponse handle(UserNotFoundException e) { ... }  // 그냥 반환하면 JSON
}
```


## 어떤 문제를 해결하려고 나왔나?


ExceptionHandler를 모든 컨트롤러 클래스에 붙여 놓는다면 코드가 흩어지게 된다.


이를 해결하기 위해서 ControllerAdvice가 나왔다.


하지만 이때 REST API를 사용하는 서버라면 RestControllerAdvice를 사용하도록 권장된다.


## 어떻게 동작하나? (큰 그림)


## 언제 쓰고, 언제 안 쓰나?

- 쓸 때:
- 안 쓸 때:

## 남에게 설명한다면 어떻게 설명할 것인가?


