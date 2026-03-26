import { NextRequest, NextResponse } from "next/server";

// ============================================================
// API 비활성화 — 보안 조치
// 모델 게이트웨이 이슈로 인해 외부 AI API 호출을 일시 중단합니다.
// 재활성화 시 아래 주석을 해제하고 ANTHROPIC_API_KEY를 재설정하세요.
// ============================================================

export async function POST(request: NextRequest) {
  // API 비활성화 상태 — 데모 데이터를 반환합니다
  const { content } = await request.json();

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json(
      { error: "회의록 내용을 입력해주세요." },
      { status: 400 }
    );
  }

  // 데모 모드: AI API 호출 없이 정적 응답 반환
  return NextResponse.json({
    title: "회의록 분석 결과 (데모)",
    date: new Date().toISOString().slice(0, 10),
    decisions: [
      { content: "현재 데모 모드로 동작 중입니다. AI 분석은 일시 중단되었습니다.", importance: "high" },
    ],
    pending: [
      { content: "AI API 재연동", reason: "보안 점검 후 재활성화 예정" },
    ],
    actionItems: [
      { assignee: "관리자", task: "Vercel 환경변수에서 API 키 제거 확인", deadline: null },
      { assignee: "관리자", task: "API 키 재발급 후 .env.local에 설정", deadline: null },
    ],
    risks: [
      { content: "API 키가 노출된 경우 즉시 키를 무효화해야 합니다", severity: "high" },
    ],
    followUpQuestions: [
      "Anthropic Console에서 기존 API 키를 비활성화했나요?",
      "Vercel 환경변수에서 키가 제거되었나요?",
    ],
    draftNotice: "안녕하세요,\n\n현재 MeetFlow는 보안 점검을 위해 데모 모드로 운영 중입니다.\nAI 분석 기능은 점검 완료 후 재활성화됩니다.\n\n감사합니다.",
  });
}
