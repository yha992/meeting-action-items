import { notFound } from "next/navigation";
import { getAnalysisByShareId } from "@/lib/analyses";
import ResultView from "@/app/components/ResultView";
import type { AnalysisResult } from "@/app/page";

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const analysis = await getAnalysisByShareId(id);

  if (!analysis) {
    notFound();
  }

  const result = analysis.result_json as Record<string, unknown>;
  const data: AnalysisResult = {
    title: (result.title as string) ?? "회의",
    date: (result.date as string | null) ?? null,
    meetingType: analysis.meeting_type,
    decisions: (result.decisions as AnalysisResult["decisions"]) ?? [],
    pending: (result.pending as AnalysisResult["pending"]) ?? [],
    actionItems: (result.actionItems as AnalysisResult["actionItems"]) ?? [],
    risks: (result.risks as AnalysisResult["risks"]) ?? [],
    followUpQuestions: (result.followUpQuestions as string[]) ?? [],
    draftNotice: (result.draftNotice as string) ?? "",
  };

  return <ResultView data={data} onReset={null} shareId={id} readOnly />;
}
