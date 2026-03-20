import { NextRequest, NextResponse } from "next/server";
import { updateAnalysisResult } from "@/lib/analyses";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { result_json } = await request.json();

    if (!result_json) {
      return NextResponse.json({ error: "result_json이 필요합니다." }, { status: 400 });
    }

    const success = await updateAnalysisResult(id, result_json);
    if (!success) {
      return NextResponse.json({ error: "업데이트에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
