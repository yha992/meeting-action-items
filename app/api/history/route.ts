import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json([]);
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 11), 50);
  const offset = Number(searchParams.get("offset") ?? 0);
  const type = searchParams.get("type");
  const q = searchParams.get("q");

  let query = supabase
    .from("analyses")
    .select("id, meeting_type, result_json, share_id, created_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) {
    query = query.eq("meeting_type", type);
  }

  if (q) {
    query = query.ilike("result_json->>title", `%${q}%`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
