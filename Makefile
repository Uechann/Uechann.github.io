# 의찬의 개발 블로그 — 자주 쓰는 명령어
# 사용법: make <target> [SLUG=글-제목-영어]

.PHONY: dev build \
        new-java new-spring new-database new-network new-infra \
        new-wooteco-mission new-wooteco-study new-wooteco-activity \
        new-troubleshooting new-retrospect help

## 로컬 서버 (draft 포함, 저장 시 해당 페이지로 자동 이동)
dev:
	@scripts/dev.sh

## 프로덕션 빌드 확인
build:
	hugo build --gc --minify

# ── 새 글 생성 ────────────────────────────────────────────────────
# SLUG: 영어 소문자와 하이픈만 사용 (예: generic-type-erasure)

## ── 개념학습 ──────────────────────────────────────────────────────

## Java 글 생성  예: make new-java SLUG=generic-type-erasure
new-java:
	@[ "$(SLUG)" ] || (echo "SLUG을 지정해주세요. 예: make new-java SLUG=generic-type-erasure" && exit 1)
	hugo new content "posts/java/$(SLUG)/index.md" --kind posts/java
	@echo "" && echo "생성됨 → content/posts/java/$(SLUG)/index.md"

## Spring 글 생성  예: make new-spring SLUG=transaction-propagation
new-spring:
	@[ "$(SLUG)" ] || (echo "SLUG을 지정해주세요. 예: make new-spring SLUG=transaction-propagation" && exit 1)
	hugo new content "posts/spring/$(SLUG)/index.md" --kind posts/spring
	@echo "" && echo "생성됨 → content/posts/spring/$(SLUG)/index.md"

## Database 글 생성  예: make new-database SLUG=index-b-tree
new-database:
	@[ "$(SLUG)" ] || (echo "SLUG을 지정해주세요. 예: make new-database SLUG=index-b-tree" && exit 1)
	hugo new content "posts/database/$(SLUG)/index.md" --kind posts/database
	@echo "" && echo "생성됨 → content/posts/database/$(SLUG)/index.md"

## Network 글 생성  예: make new-network SLUG=tcp-three-way-handshake
new-network:
	@[ "$(SLUG)" ] || (echo "SLUG을 지정해주세요. 예: make new-network SLUG=tcp-three-way-handshake" && exit 1)
	hugo new content "posts/network/$(SLUG)/index.md" --kind posts/network
	@echo "" && echo "생성됨 → content/posts/network/$(SLUG)/index.md"

## Infra 글 생성  예: make new-infra SLUG=docker-compose-setup
new-infra:
	@[ "$(SLUG)" ] || (echo "SLUG을 지정해주세요. 예: make new-infra SLUG=docker-compose-setup" && exit 1)
	hugo new content "posts/infra/$(SLUG)/index.md" --kind posts/infra
	@echo "" && echo "생성됨 → content/posts/infra/$(SLUG)/index.md"

## ── 우아한테크코스 ────────────────────────────────────────────────

## 우테코 미션 글 생성  예: make new-wooteco-mission SLUG=level1-racing-car
new-wooteco-mission:
	@[ "$(SLUG)" ] || (echo "SLUG을 지정해주세요. 예: make new-wooteco-mission SLUG=level1-racing-car" && exit 1)
	hugo new content "posts/wooteco-mission/$(SLUG)/index.md" --kind posts/wooteco-mission
	@echo "" && echo "생성됨 → content/posts/wooteco-mission/$(SLUG)/index.md"

## 우테코 스터디 글 생성  예: make new-wooteco-study SLUG=db-index-study
new-wooteco-study:
	@[ "$(SLUG)" ] || (echo "SLUG을 지정해주세요. 예: make new-wooteco-study SLUG=db-index-study" && exit 1)
	hugo new content "posts/wooteco-study/$(SLUG)/index.md" --kind posts/wooteco-study
	@echo "" && echo "생성됨 → content/posts/wooteco-study/$(SLUG)/index.md"

## 우테코 활동 글 생성  예: make new-wooteco-activity SLUG=level1-demo-day
new-wooteco-activity:
	@[ "$(SLUG)" ] || (echo "SLUG을 지정해주세요. 예: make new-wooteco-activity SLUG=level1-demo-day" && exit 1)
	hugo new content "posts/wooteco-activity/$(SLUG)/index.md" --kind posts/wooteco-activity
	@echo "" && echo "생성됨 → content/posts/wooteco-activity/$(SLUG)/index.md"

## ── 기타 ──────────────────────────────────────────────────────────

## 트러블슈팅 글 생성  예: make new-troubleshooting SLUG=datasource-connection-pool
new-troubleshooting:
	@[ "$(SLUG)" ] || (echo "SLUG을 지정해주세요. 예: make new-troubleshooting SLUG=my-error" && exit 1)
	hugo new content "posts/troubleshooting/$(SLUG)/index.md" --kind posts/troubleshooting
	@echo "" && echo "생성됨 → content/posts/troubleshooting/$(SLUG)/index.md"

## 회고 글 생성  예: make new-retrospect SLUG=june-retrospect
new-retrospect:
	@[ "$(SLUG)" ] || (echo "SLUG을 지정해주세요. 예: make new-retrospect SLUG=june-retrospect" && exit 1)
	hugo new content "posts/retrospect/$(SLUG)/index.md" --kind posts/retrospect
	@echo "" && echo "생성됨 → content/posts/retrospect/$(SLUG)/index.md"

## 도움말
help:
	@echo ""
	@echo "── 개념학습 ───────────────────────────────────────────────────"
	@echo "  make new-java              SLUG=post-name   Java 글 생성"
	@echo "  make new-spring            SLUG=post-name   Spring 글 생성"
	@echo "  make new-database          SLUG=post-name   Database 글 생성"
	@echo "  make new-network           SLUG=post-name   Network 글 생성"
	@echo "  make new-infra             SLUG=post-name   Infra 글 생성"
	@echo ""
	@echo "── 우아한테크코스 ─────────────────────────────────────────────"
	@echo "  make new-wooteco-mission   SLUG=post-name   미션 기록 글 생성"
	@echo "  make new-wooteco-study     SLUG=post-name   스터디 기록 글 생성"
	@echo "  make new-wooteco-activity  SLUG=post-name   활동 기록 글 생성"
	@echo ""
	@echo "── 기타 ───────────────────────────────────────────────────────"
	@echo "  make new-troubleshooting   SLUG=post-name   트러블슈팅 글 생성"
	@echo "  make new-retrospect        SLUG=post-name   회고 글 생성"
	@echo ""
	@echo "── 빌드 ───────────────────────────────────────────────────────"
	@echo "  make dev                                    로컬 서버 시작"
	@echo "  make build                                  프로덕션 빌드"
	@echo ""
