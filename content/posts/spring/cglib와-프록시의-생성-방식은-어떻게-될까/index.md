---
title: "CGLIB와 프록시의 생성 방식은 어떻게 될까 ?"
date: "2026-05-28"
draft: false
categories: ["Spring"]
tags: []
description: ""
image: ""
notionID: "06d78738-4b0a-823e-9ecb-81097ae8e37b"
notionEdited: "2026-05-28T07:24:00.000Z"
---

## 어떤 개념인가요 ?


### Proxy 프록시


프록시란 원본 객체를 대신해서 앞에 서는 대리 객체이다.
클라이언트는 프록시를 원본인줄 알고 호출하고, 프록시가 중간에서 일을 수행하고 원본에 위임한다.


### CGLIB (Code Generation Library)


런타임에 바이트 코드를 조작해서 클래스의 서브 클래스를 동적으로 생성하는 라이브러리이다.


Spring AOP, Hibernate, Mockito 등이 사용한다.


## 어떤 문제를 해결하려고 나왔나?


### JDK의 동적 프록시의 한계를 해결하고자 등장


Java의 기본 프록시 (java.lang.relect.Proxy)가 존재하는데,
인터페이스 기반이어서 인터페이스가 없다면은 프록시를 만들 수가 없었다.

> Spring AOP에서는 트랜잭션, 로깅 등 부가 기능을 붙이려면 모든 클래스에 프록시가 필요한 상황이다.  
> 인터페이스 강제 작성에는 너무 번거롭고 비현실적인 대안이어서, CGLIB가 등장하게 되었다.

## 어떻게 동작하나? (큰 그림)


기존 JDK에서 동적 프록시 방식은


인터페이스를 구현한 프록시 클래스를 런타임에 생성하고,
리플렉션 기반으로 메서드를 호출하였다면,


CGLIB 방식은


원본 클래스를 상속한 서브 클래스를 바이트코드로 생성한다.
그리고 메서드를 오버라이딩해서 부가 로직을 삽입하게 된다.


```java
// 원본
public class OrderService {
    public void order() { ... }
}

// CGLIB가 런타임에 이런 클래스를 바이트코드로 만듦
public class OrderService$$EnhancerByCGLIB extends OrderService {
    @Override
    public void order() {
        // 부가 로직 (트랜잭션, 로깅 등)
        super.order();
    }
}
```


## 언제 쓰고, 언제 안 쓰나?


쓸 때:

- 인터페이스 없는 구체 클래스에 AOP를 적용해야 할 때
- Spring의 @Transactional, @Cachable 등 인터페이스 없이 사용해야할 때
- Mockito로 구체 클래스를 모킹할 때

안 쓸 때:

- final 클래스 메서드에서는 적용이 불가능하다.
- 생성자 로직이 복잡하거나 이팩트가 있는 클래스
- 성능이 민감한 경우 (바이트 코드의 생성 비용)

## 남에게 설명한다면 어떻게 설명할 것인가?


프록시란 원본 클래스 앞에 대리인을 세우고 싶은데, Java에서 기본 방식은 인터페이스가 있어야만 가능했다.
하지만 CGLIB는 그 제약을 깨기 위해서 런타임에 원본 클래스를 상속한 자식 클래스를 바이트코드로 직접 만들어준다.
이를 통해 클라이언트는 자식 객체를 쓰는 것이지만, 부모인 척 행동하기 때문에 모르게 된다.
Spring에서는 @Transactional 같은 기능을 인터페이스 없이도 만들어서 붙여줄 수 있게 된게 CGLIB 덕분이다.
하지만, 상속 기반으로 프록시를 구현하기 때문에 불변 객체 final은 사용하지 못하게 된다.


