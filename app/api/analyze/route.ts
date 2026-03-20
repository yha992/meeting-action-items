import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/prompts";
import { saveAnalysis } from "@/lib/analyses";

export async function POST(request: NextRequest) {
  try {
    const { content, meetingType } = await request.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "회의록 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인해주세요." },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });
    const systemPrompt = buildSystemPrompt(meetingType);

    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20251001",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    const cleaned = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleaned);

    // Supabase에 결과 저장 (설정된 경우)
    const saved = await saveAnalysis(meetingType ?? "주간 정기", content, parsed);

    return NextResponse.json({
      ...parsed,
      _meta: {
        analysisId: saved?.id ?? null,
        shareId: saved?.shareId ?? null,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
