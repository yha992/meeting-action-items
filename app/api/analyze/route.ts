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
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // JSON 블록만 추출 재시도
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json({ error: "AI 응답을 파싱할 수 없습니다. 다시 시도해주세요." }, { status: 500 });
      }
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        return NextResponse.json({ error: "AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요." }, { status: 500 });
      }
    }

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
    let message = "알 수 없는 오류가 발생했습니다.";
    if (error instanceof Error) {
      if (error.message.includes("credit balance is too low")) {
        message = "Anthropic API 크레딧이 부족합니다. console.anthropic.com/settings/billing 에서 충전해주세요.";
      } else if (error.message.includes("invalid_api_key") || error.message.includes("authentication")) {
        message = "API 키가 올바르지 않습니다. .env.local의 ANTHROPIC_API_KEY를 확인해주세요.";
      } else {
        message = error.message;
      }
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
