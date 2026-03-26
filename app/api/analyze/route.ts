import { NextRequest, NextResponse } from "next/server";

// ============================================================
// API 비활성화 — 보안 조치
// 모델 게이트웨이 이슈로 인해 외부 AI API 호출을 일시 중단합니다.
// 재활성화 시 아래 주석을 해제하고 ANTHROPIC_API_KEY를 재설정하세요.
// ============================================================

/*
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `당신은 회의록을 분석하여 실행 항목으로 변환하는 전문 비서입니다.
사용자가 회의 녹취록이나 메모를 제공하면, 반드시 아래 JSON 형식으로만 응답하세요.
마크다운이나 설명 없이 순수 JSON만 출력하세요.

{
  "title": "회의 제목 (내용에서 추론)",
  "date": "회의 날짜 (내용에서 추론, 없으면 null)",
  "decisions": [
    { "content": "결정된 사항", "importance": "high | medium | low" }
  ],
  "pending": [
    { "content": "아직 결정되지 않은 사항", "reason": "미결정 이유" }
  ],
  "actionItems": [
    { "assignee": "담당자", "task": "할 일 내용", "deadline": "기한 (없으면 null)" }
  ],
  "risks": [
    { "content": "일정 또는 프로젝트 리스크", "severity": "high | medium | low" }
  ],
  "followUpQuestions": [
    "후속으로 확인해야 할 질문"
  ],
  "draftNotice": "공지 또는 메일 초안 (회의 결과를 요약한 공지문)"
}

규칙:
- 모든 필드를 빠짐없이 채우세요. 해당 사항이 없으면 빈 배열 []을 사용하세요.
- 담당자가 명시되지 않은 할 일은 assignee를 "미지정"으로 하세요.
- draftNotice는 실제 발송 가능한 수준의 공지문/메일 초안으로 작성하세요.
- 반드시 유효한 JSON만 출력하세요.`;
*/

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

  /*
  // === 원본 AI API 호출 코드 ===
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
  */
}
