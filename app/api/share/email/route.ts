import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "수신자, 제목, 본문을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "이메일 발송 서비스가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const recipients = (to as string)
      .split(",")
      .map((e: string) => e.trim())
      .filter(Boolean);

    const { error } = await resend.emails.send({
      from: "MeetFlow <onboarding@resend.dev>",
      to: recipients,
      subject,
      text: body,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
