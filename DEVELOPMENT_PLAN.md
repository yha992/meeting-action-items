# MeetFlow 개발 계획서

## 현재 상태

### 완료된 작업
- Next.js 16 + TypeScript + Tailwind CSS 프로젝트 초기화
- Claude API 연동 백엔드 (`/api/analyze`) 구현
- 텍스트 입력 → AI 분석 → 결과 화면 (6가지 항목) 구현
- 결과 전체 복사 (클립보드) 기능 구현
- GitHub 저장소 생성 및 푸시

### 기술 스택
| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js 16 + TypeScript + Tailwind CSS 4 |
| 백엔드 | Next.js API Routes |
| AI | Claude API (Anthropic SDK) |
| DB | Supabase (예정) |
| 이메일 | Resend (예정) |
| 배포 | Vercel (예정) |

---

## Phase 1 — 핵심 입력 강화 (Day 1~2)

### Issue #1: UI 리디자인 — 토스 스타일 + 회의 유형 선택
- 현재 기본 Tailwind UI → 목업 기반 리디자인
- 회의 유형 칩 선택 (주간 정기, 프로젝트, 브레인스토밍, 의사결정, 1:1)
- 결과 화면: 할 일 히어로 카드 + 나머지 아코디언
- 모바일 반응형 기본 지원

### Issue #2: 파일 업로드 기능 (.txt, .docx, .pdf)
- 프론트엔드: 드래그 앤 드롭 + 파일 선택 UI
- 백엔드: 파일 파싱 API (`/api/upload`)
  - .txt → 텍스트 직접 읽기
  - .docx → mammoth 라이브러리로 텍스트 추출
  - .pdf → pdf-parse 라이브러리로 텍스트 추출
- 파싱된 텍스트를 기존 `/api/analyze`로 전달

### Issue #3: 회의 유형별 AI 프롬프트 최적화
- 회의 유형을 `/api/analyze`에 전달
- 유형별 시스템 프롬프트 분기
  - 주간 정기: 지난 주 대비 진척도, 이번 주 할 일 강조
  - 브레인스토밍: 아이디어 목록화, 실행 가능성 평가
  - 의사결정: 결정/미결정 항목 강조
  - 1:1: 피드백, 성장 관련 항목 추출

---

## Phase 2 — 저장 + 공유 (Day 3~4)

### Issue #4: Supabase 연동 및 DB 스키마 설계
- Supabase 프로젝트 생성 및 연결
- 테이블 설계:
  - `analyses`: id, meeting_type, input_text, result_json, share_id, created_at
- Supabase 클라이언트 설정 (`lib/supabase.ts`)
- 환경변수: SUPABASE_URL, SUPABASE_ANON_KEY

### Issue #5: 분석 결과 저장 및 히스토리 화면
- 분석 완료 시 자동으로 Supabase에 저장
- 히스토리 페이지 (`/history`) 구현
  - 분석 목록 (제목, 날짜, 할 일 수, 회의 유형)
  - 키워드 검색
  - 회의 유형 필터링
  - 클릭 시 상세 결과 보기
- Empty State: 첫 사용자 안내 화면

### Issue #6: 결과 링크 공유 (고유 URL)
- 분석 저장 시 고유 share_id (nanoid) 생성
- 공유 페이지 (`/share/[id]`) 구현
  - 로그인 없이 접근 가능
  - 결과를 읽기 전용으로 표시
- 공유 링크 복사 버튼
- 7일 후 자동 만료 정책 (optional)

### Issue #7: Slack Webhook 전송
- Slack Incoming Webhook URL 입력/저장 UI
- 분석 결과를 Slack Block Kit 형식으로 변환
- 백엔드 API (`/api/share/slack`) 구현
- 전송 성공/실패 피드백

### Issue #8: 이메일 발송 (공지 초안)
- Resend 연동 설정
- 이메일 발송 API (`/api/share/email`) 구현
- 이메일 작성 모달/화면
  - 받는 사람 입력
  - 제목 자동 채움 (회의 제목 기반)
  - 본문 자동 채움 (AI 생성 공지 초안)
- 발송 결과 피드백

---

## Phase 3 — 마무리 (Day 5~7)

### Issue #9: 결과 인라인 편집
- 할 일 항목의 담당자, 내용, 기한 인라인 수정
- 수정된 결과 저장 (Supabase 업데이트)
- 수정 이력 표시 (AI 원본 vs 수정본)

### Issue #10: UI 다듬기 + 모바일 반응형
- 목업 디자인 완전 적용
- 로딩 화면 (프로그레스 스텝)
- Bottom CTA 고정 버튼
- 모바일 터치 최적화
- 다크모드 지원 (optional)

### Issue #11: Vercel 배포 + 환경변수 설정
- Vercel 프로젝트 연결
- 환경변수 설정 (ANTHROPIC_API_KEY, SUPABASE_URL 등)
- 프로덕션 빌드 테스트
- 커스텀 도메인 설정 (optional)

---

## 이슈 의존성 관계

```
Issue #1 (UI 리디자인) ──────────────────────────────────────┐
Issue #2 (파일 업로드) ← 독립                                 │
Issue #3 (회의 유형 프롬프트) ← Issue #1 (유형 선택 UI 필요)   │
Issue #4 (Supabase 연동) ← 독립                               │
Issue #5 (히스토리) ← Issue #4 (DB 필요)                      │
Issue #6 (링크 공유) ← Issue #4 (DB 필요)                     │
Issue #7 (Slack) ← 독립                                       │
Issue #8 (이메일) ← 독립                                      │
Issue #9 (인라인 편집) ← Issue #1 + Issue #4                  │
Issue #10 (UI 다듬기) ← Issue #1~9 전체                       │
Issue #11 (배포) ← Issue #1~10 전체 ─────────────────────────┘
```

## 우선순위 요약

| 순위 | 이슈 | Phase |
|------|------|-------|
| P0 | #1 UI 리디자인 | 1 |
| P0 | #2 파일 업로드 | 1 |
| P0 | #3 회의 유형 프롬프트 | 1 |
| P0 | #4 Supabase 연동 | 2 |
| P0 | #5 히스토리 | 2 |
| P0 | #6 링크 공유 | 2 |
| P1 | #7 Slack 전송 | 2 |
| P1 | #8 이메일 발송 | 2 |
| P1 | #9 인라인 편집 | 3 |
| P1 | #10 UI 다듬기 | 3 |
| P0 | #11 Vercel 배포 | 3 |
