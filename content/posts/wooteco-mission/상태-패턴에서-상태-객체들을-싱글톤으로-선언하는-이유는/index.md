---
title: "상태 패턴에서 상태 객체들을 싱글톤으로 선언하는 이유는?"
date: "2026-05-31"
draft: false
categories: ["우아한테크코스"]
tags: []
description: ""
image: ""
notionID: "37178738-4b0a-80c6-bdbc-f31093e2e6e8"
notionEdited: "2026-06-30T06:58:00.000Z"
---

## 어떤 개념일까?


## 상태 패턴에서 상태 객체를 왜 싱글톤으로 선언하는가?


### 1. 상태 객체는 필드가 없고 행위만 있는 `무상태(stateless)` 객체입니다.


상태 객체들은 내부에 인스턴스 필드를 소유하지 않고 있고, 오직 행위 행동만 정의되어 있습니다.


즉, 이 객체들이 들고 있는 고유한 데이터가 없으므로, 예를 들어서 두 개의 PendingStatus 인스턴스를 만들어도 서로 구별, 식별할 수 있는 방법이 없습니다. 동작도, 들고 있는 값도 완전히 동일한 객체입니다.


객체가 자신만의 상태를 갖지 않는다면, 인스턴스가 여러 개 존재해야할 이유 자체가 사라지기 때문에,
싱글톤을 선택한 가장 근본적인 이유입니다.


### 2. 예약마다 상태 객체를 새로 생성하는 `낭비` 이다.


싱글톤이 아니라고 가정을 해보겠습니다.


PENDING 상태인 예약이 수천 건이 존재할 때 동일하게 행동하는 PendingStatus 인스턴스가 수 천개가 생성될 것입니다.


의미 없이 동일한 객체를 계속해서 찍어낸다면 힙에 일회성 객체가 쌓이게 되고, 결국 불필요한 GC의 압박으로 이어진다고 생각합니다.


하나의 인스턴스를 모든 예약이 공유하게 하면 이러한 불필요한 비용을 완전히 제거할 수 있다고 생각합니다.


### 3. 도메인의 의미상으로 상태는 `공유되는 단 하나의 개념`입니다.


PENDING이라는 예약 상태는 특정 예약 한 것에 종속된 데이터가 아니고, 모든 대기 중인 예약이 함께 의미하는 하나의 개념입니다. 예약마다 각자의 PENDING을 따로 갖는 것오 오히려 도메인의 개념을 어색하게 표현합니다.


싱글톤으로 단 하나의 인스턴스만 둔다면 PENDING이라는 상태는 `단 하나의 개념` 이고 도메인의 실제 모습과 코드가 일치하게 된다고 생각합니다.


이 점에서 상태 객체는 enum 상수가 본래 갖던 `상태 당 단일 인스턴스 성질`을 그대로 이어받게 된다고 생각합니다.


## 4. Holder 를 통한 별도 동기화 없이 thread-safe한 지연 초기화 목적이다.


### thread-safe라는 것이 왜 필요할까?


스레드와 동시성


스레드는 프로그램 안에서 코드를 실행하는 흐름의 단위입니다..
중요한 건, 여러 스레드가 같은 코드를 동시에 실행할 수 있다는 점입니다.


톰캣은 들어오는 HTTP 요청마다 스레드 풀에서 스레드를 하나씩 꺼내어 처리하게 됩니다.
즉 사용자가 100명이 동시에 예약 API를 호출하며, 100개의 스레드가 같은 getInstance() 코드를 같은 순간에 실행할 수 있다는 것입니다.


### thread-safe란 무엇인가


thread-safe은 여러 스레드가 동시에 실행하여도, 실행 순서가 어떻게 엇갈리든지 항상 올바른 결과가 나온다는 성질입니다.


반대로 스레드들의 실행 타이밍이 엇갈렸을 때 결과가 깨지는 현상을 `경쟁 상태` 라고 합니다.
싱글톤을 잘못 만들게 되면 이런 문제들이 발생하게 됩니다.


### 싱글톤 지연 초기화가 깨지는 과정


```java
private static PendingStatus instance;

public static PendingStatus getInstance() {
    if (instance == null) {              // (1) 검사
        instance = new PendingStatus();  // (2) 생성
    }
    return instance;
}
```


```java
스레드 A: instance == null?  → true
스레드 B: instance == null?  → true   (A가 아직 (2)를 안 했으니 여전히 null)
스레드 A: new 생성, 대입
스레드 B: new 생성, 대입            ← 인스턴스가 두 번 만들어짐!
```


다음과 같이 되었을 떄, 하나만 존재해야한다는 싱글톤의 약속이 깨지게 됩니다.


### synchronized로 잠그는 방법


```java
public static synchronized PendingStatus getInstance() { ... }
```


synchronized로 락을 걸게 되면 한 번에 한 스레드만 들어오게 되어 안전하게 됩니다.
하지만 이미 인스턴스가 만들어진 후에도 호출할 때마다 매번 락을 잡게되는 문제가 있습니다.


락이 필요한건 최초 생성 단 한 순간인데, 그 비용이 영원히 발생하게 됩니다.


### double-checked locking 방법


```java
private static volatile PendingStatus instance;

public static PendingStatus getInstance() {
    if (instance == null) {                    // 락 없이 1차 검사
        synchronized (PendingStatus.class) {
            if (instance == null) {            // 락 안에서 2차 검사
                instance = new PendingStatus();
            }
        }
    }
    return instance;
}
```


이렇게 하게 되면 성능 문제는 해결이 되지만, volatile을 빠뜨리게 되면 미묘하게 깨지게 된다.
왜냐하면 `instance = new PendingStatus()`도 사실 한 동작이 아니라 
"메모리 할당 → 생성자 실행 → 참조 대입" 세 단계인데, JVM이 순서를 재배치하면 **생성이 다 끝나기 전에 참조부터 대입**될 수 있습니다.
다른 스레드가 "null은 아닌데 아직 덜 만들어진 객체"를 보게 될 수 있습니다.



### Holder 방법으로 JVM에게 일을 맡기기


```java
private static class Holder {
    private static final PendingStatus INSTANCE = new PendingStatus();
}
public static PendingStatus getInstance() {
    return Holder.INSTANCE;
}
```


이 방법은 동기화를 내가 작성하지 않고, JVM의 클래스 초기화 규칙에 맡기는 것입니다.
자바 언어 명세 JLS는 다음 두 가지를 보장한다고 합니다.

1. 클래스는 처음 실제로 사용되는 시점에 딱 한번만 초기화된다.
Holder는 바깥 클래스가 로딩될 때 같이 로딩되는게 아니라, getInstance() 안에서
Holder.INSTANCE가 처음 호출되는 순간에야 로딩이 된다.
2. 이 초기화 과정은 JVM이 알아서 thread-safe하게 보장한다.
여러 스레그다 동시에 Holder.INTANCE에 접근해도, JVM이 클래스 초기화 단계에서 내부적으로 락을 걸어 new PendingStatus()가 정확히 한번만 실행이되도록 해준다.
즉 위에서 synchronized나 volitile로 직접 막아야 했던 일을 클래스 로더가 대신 하도록 하는 것이다.
> 핵심은 초기화가 끝난 뒤에는 락이 사라진다는 것이다.  
> 한번 초기화된 클래스의 Holder.INSTANCE를 읽는 건 그냥 필드 하나 읽는 동작일 뿐이라,  
> 이후 호출은 락 비용이 0이 된다.

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


