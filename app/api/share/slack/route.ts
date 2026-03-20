import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { webhookUrl, title, decisions, actionItems, meetingType } =
      await request.json();

    if (!webhookUrl || !webhookUrl.startsWith("https://hooks.slack.com/")) {
      return NextResponse.json(
        { error: "유효한 Slack Webhook URL을 입력해주세요." },
        { status: 400 }
      );
    }

    const decisionsText =
      decisions?.length > 0
        ? decisions.map((d: { content: string }) => `• ${d.content}`).join("\n")
        : "없음";

    const actionText =
      actionItems?.length > 0
        ? actionItems
            .map(
              (a: { assignee: string; task: string; deadline: string | null }) =>
                `• [${a.assignee}] ${a.task}${a.deadline ? ` (${a.deadline})` : ""}`
            )
            .join("\n")
        : "없음";

    const blocks = [
      {
        type: "header",
        text: { type: "plain_text", text: `📋 ${title}`, emoji: true },
      },
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: `회의 유형: *${meetingType ?? "주간 정기"}*` }],
      },
      { type: "divider" },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*✅ 결정 사항*\n${decisionsText}` },
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*📌 담당자별 할 일*\n${actionText}` },
      },
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: "MeetFlow로 분석된 결과입니다." }],
      },
    ];

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Slack 전송에 실패했습니다. Webhook URL을 확인해주세요." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
