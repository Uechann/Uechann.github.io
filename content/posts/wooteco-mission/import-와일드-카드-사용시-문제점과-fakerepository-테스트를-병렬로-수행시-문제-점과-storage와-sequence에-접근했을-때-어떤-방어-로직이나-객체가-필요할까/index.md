---
title: "import * 와일드 카드 사용시 문제점과 FakeRepository 테스트를 병렬로 수행시 문제 점과 storage와 sequence에 접근했을 때 어떤 방어 로직이나 객체가 필요할까?"
date: "2026-05-31"
draft: false
categories: ["우아한테크코스"]
tags: []
description: ""
image: ""
notionID: "37178738-4b0a-8043-bfcf-f372f9f3d80e"
notionEdited: "2026-06-30T06:58:00.000Z"
---

## 어떤 개념일까?


## 1. `import java.util.*;` 와일드카드의 문제


### 이름 충돌


와일드카드를 여러 패키지에 쓰면 같은 단순 이름의 클래스가 부딪힌다.
나중에 와일드 카드 임포트가 추가되거나 JDK버전이 올라가서 새로운 클래스가 생긴다면 멀쩡하던 코드가 문제가 생길 수 있다.


### 명시성이 떨어진다.


이 파일은 실제로 Map, HashMap, List, Optional, Objects를 쓰는데, java.util.*로 쓰면 이러한 명시성이 드러나지 않는다.


그래서 Google Java Style Guide를 비롤해 여러 곳에서 와일드카드를 금지하고 있다.


## 2. 병렬 테스트에서 생기는 문제


### 1) 테스트 격리의 붕괴


Fake는 storage와 sequence를 인스턴스 필드로 들고 있어서 상태를 갖는다.
그래서 여러 테스트가 같은 Fake 인스턴스를 공유한다면 한 테스트에서 저장한 데이터가 다른 테스트에서 보이게 된다.


즉, 실제 DB라면 롤백, 테이블 삭제 등등 데이터로 격리를 시키거나하는데,
이 인메모리에서는 그러한 장치가 존재하지 않는다.


### 2) thread-safety 부재


### AtomicLong으로 값 원자적 방어


AtomicLong은 CPU 차원에서 읽기-증가-쓰기를 처리하여 Id의 유일성을 보장해준다.


### storage 단일 읽기/쓰기 → ConcurrentHashMap


HashMap은 동시 put/remove 중 내부 구조가 손상되면 데이터 유실이나 잘못된 size를 일으킬 수 있다.
save의 put, deleteById의 remove, findById의 get 같은 단일 연산을 안정하게 만드려면 자료구조를 ConcurrentHashMap을 사용해야한다.


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


