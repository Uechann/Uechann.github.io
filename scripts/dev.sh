#!/bin/bash
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  의찬의 개발 블로그 — 로컬 서버"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  블로그:  http://localhost:1313"
echo "  CMS:     http://localhost:1313/admin/"
echo "           (CMS 로컬 사용 시 config.yml의"
echo "            local_backend: true 주석 해제 후"
echo "            별도 터미널에서 npx @sveltia/cms-backend 실행)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# -D: draft 글 포함
# --disableFastRender: 변경 사항 누락 없이 전체 재빌드
# --navigateToChanged: 파일 저장 시 브라우저가 해당 페이지로 자동 이동
hugo server -D --disableFastRender --navigateToChanged
