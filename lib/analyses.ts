import { supabase, type Analysis } from "./supabase";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 8);

export async function saveAnalysis(
  meetingType: string,
  inputText: string,
  resultJson: Record<string, unknown>
): Promise<{ id: string; shareId: string } | null> {
  if (!supabase) return null;

  const shareId = nanoid();
  const { data, error } = await supabase
    .from("analyses")
    .insert({ meeting_type: meetingType, input_text: inputText, result_json: resultJson, share_id: shareId })
    .select("id, share_id")
    .single();

  if (error) {
    console.error("saveAnalysis error:", error.message);
    return null;
  }
  return { id: data.id, shareId: data.share_id };
}

export async function getAnalyses(limit = 20, offset = 0): Promise<Analysis[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("analyses")
    .select("id, meeting_type, result_json, share_id, created_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("getAnalyses error:", error.message);
    return [];
  }
  return (data ?? []) as Analysis[];
}

export async function getAnalysisByShareId(shareId: string): Promise<Analysis | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("share_id", shareId)
    .single();

  if (error) return null;
  return data as Analysis;
}

export async function updateAnalysisResult(
  id: string,
  resultJson: Record<string, unknown>
): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from("analyses")
    .update({ result_json: resultJson })
    .eq("id", id);

  return !error;
}
