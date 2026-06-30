---
title: "synchronized vs volatile vs Atomic 차이점"
date: "2026-06-04"
draft: false
categories: ["Java"]
tags: []
description: ""
image: ""
notionID: "37578738-4b0a-80b4-b65b-dadd58144f5b"
notionEdited: "2026-06-30T06:57:00.000Z"
---

## 어떤 개념일까?


### `synchronized` vs `volatile` vs `Atomic`


세가지 모두 멀티스레드 환경에서 공유 변수를 안전하게 다루기 위한 도구이다.
하지만, 해결하는 문제의 범위가 각각 다르다.


동시성 문제에는 크게 3가지의 보장으로 나눠볼 수 있다.


### 가시성 Visibility


한 스레드가 바꾼 값을 다른 스레드가 즉시 볼 수 있는가?


### 원자성 Atomicity


복합 연산 (읽기 → 수정 → 쓰기)이 중간에 끼어들지 않고 한 덩어리로 실행이 되는가?


### 순서 Ordering


컴파일러의 명령어 재배치로 인해 코드 순서가 뒤바뀌지 않는가?


## 3가지 도구 차이점 


| 도구             | 가시성 | 원자성 | 순서 | 방식           |
| -------------- | --- | --- | -- | ------------ |
| `volatile`     | ✅   | ❌   | ✅  | 메모리 배리어      |
| `synchronized` | ✅   | ✅   | ✅  | 락(lock), 블로킹 |
| `Atomic*`      | ✅   | ✅   | ✅  | CAS, 논블로킹    |


---


## 어떤 문제를 해결하려고 나왔을까? 왜 사용 할까?


근본 원인은 JMM (Java Memory Model)과 CPU 캐시 구조에 있다.

- `각 스레드(CPU 코어)`는 메인 메모리의 값을 `자기 캐시`에 복사해서 사용한다.
- 스레드 A가 값을 바꿔도, 스레드 B가 옛날 캐시값을 계속 읽어서 `가시성 문제`가 생긴다.
- count++를 실행하여도, 두개의 스레드가 같이 진행하면, 갱신이 유실되는 `원자성 문제`가 생긴다.
- 컴파일러/JIT/CPU는 성능을 위해 명령어 순서를 바꾸는데, 멀티 스레드에서는 예상치 못한 `순서 문제`가 생긴다.

---


## 어떻게 동작하나?


### volatile

- 변수 읽기/쓰기 시에 항상 메인 메모리에서 직접 읽고 쓰게 한다. (캐시 우회)
- 읽기/쓰기 시점에 `메모리 베리어` 를 삽입해서 재배치를 막는다.
- 단일 읽기, 단일 쓰기만 원자적이다.
- i++처럼 읽고 쓰는 복합 연삼은 원자성을 보장하지 못한다.

```java
private volatile boolean running = true; // 플래그 가시성 보장
```


### synchronized

- 객체마다 가진 `모니터 락`을  획득해야 임계 영역에 진입한다.
- 한 번에 `하나의 스레드`만 들어가므로 원자성을 확보한다. (상호 배제)
- 락, 획득 시점에 캐시 무효화 → 메인 메모리에서 읽기, 해제 시점에 변경분을 메인 메모리에 flush 
→ `가시성 확보`
- 락을 못잡으면 블로킹(대기) 상태가 된다. 그만큼 비용이 크고 컨텍스트 스위칭이 발생할 수 있다.

```java
public synchronized void increment() { count++; } // 원자성+가시성
// 또는
synchronized (lock) { /* 임계 영역 */ }
```


### Atomic*

- 내부적으로 CAS (Compare And Swap)라는 CPU 단일 명령어를 사용한다.
- 원리: 누가 바꿨으면 실패하고 다시 시도
- 락을 잡지 않으므로 `논블로킹 (lock free)`, 대기 없이 계속 `재시도(spin)` 한다.
- 단일 변수에 대한 원자적 연산을 락 없이 해결 하기 때문에 `synchronized`보다 가볍다.

```java
private AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet(); // 락 없이 원자적 +1
```


---


## 언제 쓰고, 언제 안 쓰나?


### `volatile`

- **쓸 때:**
    - 한 스레드가 쓰고 나머지는 **읽기만** 하는 상태 플래그 (`boolean running`, 종료 신호 등)
    - 값을 **단순히 읽고 쓰기만** 하고 이전 값에 의존하지 않을 때
    - 가벼운 가시성만 필요할 때
- **안 쓸 때:**
    - `count++`, `count = count + n` 처럼 **이전 값에 의존하는 복합 연산** → 원자성 깨짐
    - 여러 변수를 묶어 하나의 일관된 상태로 다뤄야 할 때

### `synchronized`

- **쓸 때:**
    - **여러 변수**나 **여러 단계의 로직**을 하나의 원자적 단위로 묶어야 할 때
    - 복잡한 임계 영역, 조건부 갱신, 불변식(invariant) 유지가 필요할 때
- **안 쓸 때:**
    - 단순한 카운터 하나 증가 → `Atomic`이 더 가벼움
    - 단순 플래그 → `volatile`로 충분
    - 락 경합이 심해 성능 병목이 우려될 때(단, 대안 설계 필요)

### `Atomic*`

- **쓸 때:**
    - **단일 변수**에 대한 카운터, 누적기, 시퀀스 발급 등
    - 락 오버헤드 없이 간단한 원자 연산이 필요할 때
    - 적당한 경합 수준에서 성능이 중요할 때
- **안 쓸 때:**
    - **여러 변수**의 일관성을 동시에 지켜야 할 때 (CAS는 단일 변수 기준)
    - 경합이 극심해 재시도가 폭증할 때 → 차라리 락이 나을 수 있음

---


## 남에게 설명한다면 어떻게 설명할 것인가?


---


## 추가 궁금한 질문들

- `happens-before` 관계란 정확히 무엇이고, volatile/synchronized가 각각 어떤 happens-before를 만드는가?
- CAS의 **ABA 문제**란? `AtomicStampedReference`는 이걸 어떻게 푸는가?
- `synchronized` 메서드 vs 블록 vs `ReentrantLock`의 차이는? Lock이 주는 추가 기능(tryLock, 공정성, 인터럽트)은?
- `synchronized`의 락 최적화(biased/lightweight/heavyweight lock, lock coarsening)는 JVM이 어떻게 처리하나?
- `LongAdder`는 `AtomicLong`과 뭐가 다른가? 고경합에서 왜 더 빠른가? (셀 분산)
- `AtomicReference`로 여러 필드를 묶어 원자적으로 다루는 패턴(불변 객체 통째 교체)은 어떻게 설계하나?
- Java 21+ 가상 스레드(Virtual Thread) 환경에서 `synchronized` 블로킹이 왜 문제(pinning)가 되고, 어떻게 대응하나?
- 동시성 컬렉션(`ConcurrentHashMap` 등)은 내부적으로 이 셋 중 무엇을 어떻게 조합해 쓰나?

