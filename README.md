# MeetFlow — 회의 끝, 정리는 5초

> 회의록을 넣으면 AI가 결정 사항, 할 일, 리스크 등을 자동으로 정리해줍니다.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss)](https://tailwindcss.com/)
[![Claude API](https://img.shields.io/badge/Claude-Sonnet_4-8b5cf6)](https://www.anthropic.com/)

---

## 스크린샷

<p align="center">
  <img src="docs/screenshot-input.png" alt="메인 입력 화면" width="280" />
  &nbsp;&nbsp;&nbsp;
  <img src="docs/screenshot-result.png" alt="분석 결과 화면" width="280" />
</p>

<p align="center">
  <sub>왼쪽: 회의 유형 선택 + 회의록 입력 &nbsp;|&nbsp; 오른쪽: AI 분석 결과 (담당자별 할 일, 결정 사항, 리스크 등)</sub>
</p>

---

## 주요 기능

AI가 회의록을 분석하여 6개 카테고리로 자동 정리합니다.

| 카테고리 | 설명 |
|----------|------|
| **결정 사항** | 확정된 내용 + 중요도 (high / medium / low) |
| **미결정 사항** | 결론 나지 않은 건 + 미결 사유 |
| **담당자별 할 일** | 누가 / 무엇을 / 언제까지 |
| **일정 리스크** | 지연·위험 요소 + 심각도 |
| **후속 질문** | 추가 확인이 필요한 사항 |
| **공지·메일 초안** | 바로 발송 가능한 요약문 |

---

## 아키텍처

```mermaid
graph LR
  subgraph Client["Client"]
    P["page.tsx<br/>입력 · 상태 관리"]
    R["ResultView.tsx<br/>히어로 카드 + 아코디언"]
  end

  subgraph Server["Next.js Server"]
    API["POST /api/analyze<br/>route.ts"]
    ENV[".env.local"]
  end

  Claude["Anthropic<br/>Claude API"]

  P -->|"POST"| API
  API -->|"SDK 호출"| Claude
  Claude -->|"JSON"| API
  API -->|"결과"| R
  ENV -. "API Key" .-> API
```

자세한 내용은 [ARCHITECTURE.md](./ARCHITECTURE.md)를 참조하세요.

---

## 시작하기

### 사전 요구사항

- Node.js 18+
- [Anthropic API 키](https://console.anthropic.com/)

### 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
echo "ANTHROPIC_API_KEY=sk-ant-여기에_키_입력" > .env.local

# 3. 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 빌드

```bash
npm run build
npm start
```

---

## 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 16.2.0 |
| 언어 | TypeScript | 5.9.3 |
| UI | React + Lucide Icons | 19.2.4 |
| 스타일링 | Tailwind CSS | 4.2.2 |
| AI/LLM | Claude (Anthropic SDK) | 0.80.0 |
| 폰트 | Pretendard Variable | - |

---

## 프로젝트 구조

```
app/
├── api/analyze/route.ts    # Claude API 엔드포인트
├── components/
│   └── ResultView.tsx      # 결과 렌더링 (히어로 카드 + 아코디언)
├── page.tsx                # 메인 페이지 (4-step 플로우)
├── layout.tsx              # 루트 레이아웃 (Pretendard 폰트)
└── globals.css             # 카카오 컬러 팔레트 정의
docs/
├── screenshot-input.png    # 입력 화면 스크린샷
└── screenshot-result.png   # 결과 화면 스크린샷
```

---

## 개발 로드맵

- [x] **Phase 0** — MVP: 텍스트 입력 → AI 분석 → 결과 표시
- [x] **Phase 1** — UI 개편 (카카오 스타일, Lucide 아이콘, 회의 유형 선택)
- [ ] **Phase 1** — 파일 업로드 (.txt / .docx / .pdf), 회의 유형별 프롬프트 최적화
- [ ] **Phase 2** — Supabase DB 연동, 히스토리, 공유 링크, Slack 웹훅
- [ ] **Phase 3** — 인라인 편집, 모바일 최적화, Vercel 배포

---

## 문서

- [ARCHITECTURE.md](./ARCHITECTURE.md) — 시스템 아키텍처 · 데이터 흐름 · API 명세
- [PRD.md](./PRD.md) — 제품 요구사항 정의서
- [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) — 개발 계획 · 이슈 목록
