---
title: "유니크 키"
date: "2026-05-28"
draft: false
categories: ["Database"]
tags: []
description: ""
image: ""
notionID: "e9a78738-4b0a-824f-ac9a-81cb4617af63"
notionEdited: "2026-05-28T07:24:00.000Z"
---

## 어떤 개념인가요 ?


AI를 이용해 핵심 개념을 빠르게 파악한다.
깊은 이해보다는 새로운 기술이 어떤 기술인지 어떤 문제를 해결하기 위해 등장했는지 지도만 그린다.


### 유니크 키 Unique Key


테이블에서 특정 컬럼 또는 컬럼 조합의 값이 중복되지 않도록 강제하는 제약조건이다.


## 어떤 문제를 해결하려고 나왔나?


같은 테마, 날짜, 시간대에 슬롯이 2개 이상 생기면 안된다는 제약조건이 필요하다.


이걸 애플리케이션 레벨에서만 막으면, 동시에 요청이 들어오거나 실수로 직접 INSERT할 때 뚫릴 수 있다.


DB 단에서도 직접 보장을 해줘야 한다.


## 어떻게 동작하나? (큰 그림)


```java
CREATE TABLE theme_slot
(
    id          BIGINT  NOT NULL AUTO_INCREMENT,
    theme_id    BIGINT  NOT NULL,
    date        DATE    NOT NULL,
    time_id     BIGINT  NOT NULL,
    is_reserved BOOLEAN NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (time_id) REFERENCES time (id),
    FOREIGN KEY (theme_id) REFERENCES theme (id),
    UNIQUE (theme_id, date, time_id)   -- 추가
);
```


INSERT, UPDATE 시점에 DB가 해당 조합이 이미 존재하는지 자동으로 체크한다.


중복이면 즉시 오류 반환한다.


내부적으로 `인덱스`를 생성해서 빠르게 중복 여부를 탐색한다.


## 언제 쓰고, 언제 안 쓰나?

- 쓸 때:
- 안 쓸 때:

## 남에게 설명한다면 어떻게 설명할 것인가?


더 공부하고 싶은거

- INDEX? 는 어떻게 작동하는가?

