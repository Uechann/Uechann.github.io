# 의찬의 개발 블로그 — 자주 쓰는 명령어
# 사용법: make <target> [SLUG=글-제목-영어]

.PHONY: dev build new-backend new-cs new-troubleshooting new-retrospect help

## 로컬 서버 (draft 포함, 저장 시 해당 페이지로 자동 이동)
dev:
	@scripts/dev.sh

## 프로덕션 빌드 확인
build:
	hugo build --gc --minify

# ── 새 글 생성 ────────────────────────────────────────────────────
# SLUG: 영어 소문자와 하이픈만 사용 (예: spring-transaction-propagation)

## 백엔드 글 생성  예: make new-backend SLUG=spring-transaction
new-backend:
	@[ "$(SLUG)" ] || (echo "SLUG을 지정해주세요. 예: make new-backend SLUG=spring-transaction" && exit 1)
	hugo new content "posts/backend/$(SLUG)/index.md" --kind posts/backend
	@echo ""
	@echo "생성됨 → content/posts/backend/$(SLUG)/index.md"
	@echo "커버 이미지를 추가하려면 같은 폴더에 cover.png 를 넣고 front matter에 image: cover.png 를 추가하세요."

## CS 기초 글 생성  예: make new-cs SLUG=tcp-handshake
new-cs:
	@[ "$(SLUG)" ] || (echo "SLUG을 지정해주세요. 예: make new-cs SLUG=tcp-handshake" && exit 1)
	hugo new content "posts/cs/$(SLUG)/index.md" --kind posts/cs
	@echo ""
	@echo "생성됨 → content/posts/cs/$(SLUG)/index.md"

## 트러블슈팅 글 생성  예: make new-troubleshooting SLUG=datasource-connection-pool
new-troubleshooting:
	@[ "$(SLUG)" ] || (echo "SLUG을 지정해주세요. 예: make new-troubleshooting SLUG=my-error" && exit 1)
	hugo new content "posts/troubleshooting/$(SLUG)/index.md" --kind posts/troubleshooting
	@echo ""
	@echo "생성됨 → content/posts/troubleshooting/$(SLUG)/index.md"

## 회고 글 생성  예: make new-retrospect SLUG=woowacourse-week-1
new-retrospect:
	@[ "$(SLUG)" ] || (echo "SLUG을 지정해주세요. 예: make new-retrospect SLUG=june-retrospect" && exit 1)
	hugo new content "posts/retrospect/$(SLUG)/index.md" --kind posts/retrospect
	@echo ""
	@echo "생성됨 → content/posts/retrospect/$(SLUG)/index.md"

## 도움말
help:
	@echo ""
	@echo "사용 가능한 명령어:"
	@echo "  make dev                              로컬 서버 시작 (draft 포함)"
	@echo "  make build                            프로덕션 빌드"
	@echo "  make new-backend     SLUG=post-name   백엔드 글 생성"
	@echo "  make new-cs          SLUG=post-name   CS 기초 글 생성"
	@echo "  make new-troubleshooting SLUG=post-name  트러블슈팅 글 생성"
	@echo "  make new-retrospect  SLUG=post-name   회고 글 생성"
	@echo ""
