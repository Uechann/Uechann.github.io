# PRD-01 — 블로그 테마 디자인 개선

## 배경 및 문제 정의

현재 테마(PaperMod)는 기능적이지만 **"밤티 느낌"** — 전형적인 개발 블로그 기본 틀에서 벗어나지 못하는 디자인이다. 참조 블로그([minyeamer.github.io](https://minyeamer.github.io))는 Hugo Book 테마 기반으로 사이드바 카테고리 트리, 커버 이미지, giscus 댓글 등을 갖춰 완성도 높은 기술 블로그 느낌을 준다.

### 현재 상태 (PaperMod 기본값)

- 단순 목록형 홈 화면
- 상단 네비게이션만 존재, 사이드바 없음
- 커버 이미지 없음 (설정 가능하지만 기본 미적용)
- 댓글 기능 없음
- 폰트가 시스템 기본체

---

## 목표

참조 블로그 스타일을 벤치마크하되, PaperMod의 장점(빠른 빌드, 가독성)을 유지하면서 **개성 있고 완성도 높은 기술 블로그**로 발전시킨다.

---

## 요구사항

### R1. 테마 전환 — Hugo Book

**현재**: PaperMod  
**목표**: [Hugo Book 테마](https://github.com/alex-shpak/hugo-book)

Hugo Book을 선택하는 이유:
- 참조 블로그와 동일한 테마 → 사이드바 카테고리 트리 구조 기본 지원
- 문서형 레이아웃으로 기술 블로그에 최적
- 라이트/다크 자동 전환 내장
- Fuse.js 기반 검색 기능 내장
- 다국어 지원

**작업 항목:**
- [ ] PaperMod submodule 제거
- [ ] hugo-book submodule 추가
- [ ] `hugo.yaml` theme 키 및 params 재작성
- [ ] 기존 샘플 글 front matter 호환성 확인

---

### R2. 사이드바 카테고리 트리 구성

참조 블로그처럼 왼쪽에 카테고리 트리가 항상 노출되어야 한다.

Hugo Book의 사이드바는 `content/` 폴더 구조를 그대로 반영한다.

**목표 구조 예시:**
```
content/
├── _index.md          # 홈
└── posts/
    ├── _index.md      # "글" 섹션 헤더
    ├── backend/
    │   └── _index.md  # "백엔드" 카테고리
    ├── cs/
    │   └── _index.md  # "CS" 카테고리
    └── troubleshooting/
        └── _index.md  # "트러블슈팅" 카테고리
```

**작업 항목:**
- [ ] 카테고리 구조 설계 (3~5개 상위 카테고리)
- [ ] `_index.md` 파일 생성
- [ ] `hugo.yaml`에 `BookSection: posts` 설정

---

### R3. 글 목록에 커버 이미지 표시

참조 블로그는 각 글에 커버 이미지가 표시된다. 커버 이미지가 없는 글은 기본 이미지 또는 텍스트만 표시.

**작업 항목:**
- [ ] 글 front matter에 `cover.image` 필드 추가 (Hugo Book은 `cover` 파라미터 사용)
- [ ] 기존 샘플 글에 커버 이미지 적용 예시 추가
- [ ] 기본 커버 이미지(fallback) 지정

---

### R4. 한국어 폰트 개선

시스템 기본 폰트 대신 가독성 높은 한국어 폰트 적용.

**후보:**
| 폰트 | 특징 |
|------|------|
| Noto Sans KR | Google Fonts, 웹 표준, 무난 |
| Pretendard | 국내 개발 블로그 사실상 표준, 가독성 우수 |
| Spoqa Han Sans Neo | 깔끔, 기술 문서에 잘 어울림 |

**추천: Pretendard** — 현재 한국 개발 블로그에서 가장 많이 쓰이고, Apple SD Gothic Neo 스타일로 친숙함.

**작업 항목:**
- [ ] `assets/custom.css` 생성
- [ ] Pretendard CDN(`cdn.jsdelivr.net/gh/orioncactus/pretendard`) 적용
- [ ] `hugo.yaml`에 `BookCustomCSS: custom.css` 설정
- [ ] 코드 블록 폰트: JetBrains Mono 또는 Fira Code 적용

---

### R5. 댓글 기능 — giscus

참조 블로그와 동일하게 GitHub Discussions 기반 댓글을 달 수 있어야 한다. 별도 서버 불필요, GitHub 계정으로 댓글 가능.

**설정 흐름:**
1. `https://giscus.app`에서 레포 연결 → script 태그 생성
2. GitHub 레포에서 Discussions 탭 활성화
3. giscus 앱을 레포에 설치
4. 생성된 `data-repo`, `data-repo-id`, `data-category-id` 등을 Hugo 설정에 삽입

**Hugo Book에서의 적용 방법:**
```yaml
# hugo.yaml
params:
  BookComments: true
```
+ `layouts/partials/docs/comments.html` 오버라이드로 giscus script 삽입

**작업 항목:**
- [ ] GitHub Discussions 활성화 (사용자가 직접 — 브라우저)
- [ ] giscus.app에서 설정값 생성 (사용자가 직접 — 브라우저)
- [ ] `layouts/partials/docs/comments.html` 작성
- [ ] `hugo.yaml`에 giscus 파라미터 추가

---

### R6. 라이트/다크 모드

Hugo Book은 시스템 설정에 따라 자동 전환 + 수동 토글 버튼을 기본 제공한다. 별도 작업 없이 테마 적용만으로 충족.

---

### R7. Fuse.js 기반 검색

Hugo Book에 내장된 검색 기능을 활성화한다.

```yaml
# hugo.yaml
params:
  BookSearch: true
```

단축키 `/` 또는 `s`로 검색창 포커스.

---

## 구현 순서

```
1. Hugo Book 테마 전환 및 기본 빌드 확인
2. 사이드바 카테고리 구조 잡기
3. Pretendard 폰트 적용
4. 커버 이미지 설정
5. giscus 댓글 연동
```

---

## 비고 — PaperMod 유지 vs Book 전환

| 기준 | PaperMod 유지 | Hugo Book 전환 |
|------|--------------|----------------|
| 구현 난이도 | 낮음 (현재 설정 유지) | 중간 (테마 재설정 필요) |
| 사이드바 | 없음 (추가 커스텀 필요) | 기본 제공 |
| 참조 블로그 유사도 | 낮음 | 높음 |
| 문서형 레이아웃 | 미지원 | 핵심 기능 |

→ **Hugo Book으로 전환 권장**
