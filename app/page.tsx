"use client";

import { useState, useRef, useEffect } from "react";
import ResultView from "./components/ResultView";
import {
  ClipboardList,
  Rocket,
  Lightbulb,
  Scale,
  Users,
} from "lucide-react";

export interface AnalysisResult {
  title: string;
  date: string | null;
  decisions: { content: string; importance: string }[];
  pending: { content: string; reason: string }[];
  actionItems: { assignee: string; task: string; deadline: string | null }[];
  risks: { content: string; severity: string }[];
  followUpQuestions: string[];
  draftNotice: string;
}

const MEETING_TYPES = [
  { id: "weekly", label: "주간 정기", icon: ClipboardList },
  { id: "project", label: "프로젝트", icon: Rocket },
  { id: "brainstorm", label: "브레인스토밍", icon: Lightbulb },
  { id: "decision", label: "의사결정", icon: Scale },
  { id: "one-on-one", label: "1:1 미팅", icon: Users },
] as const;

const PLACEHOLDER = `회의록을 여기에 붙여넣으세요.

예시)
오늘 회의에서 김팀장이 다음 주까지 디자인 시안을
완성하기로 했고, 이대리는 백엔드 API를 금요일까지
마무리하기로 했습니다.
예산 관련해서는 재무팀과 추가 논의가 필요합니다.`;

const LOADING_STEPS = [
  "텍스트 파싱",
  "참석자 · 주제 식별",
  "실행 항목 추출 중",
  "공지문 초안 작성",
  "결과 정리",
];

type Step = "input" | "loading" | "result";

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [input, setInput] = useState("");
  const [meetingType, setMeetingType] = useState("weekly");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleAnalyze = async () => {
    if (!input.trim()) {
      setError("회의록 내용을 입력해주세요.");
      return;
    }

    setStep("loading");
    setError("");
    setResult(null);
    setLoadingStep(0);

    intervalRef.current = setInterval(() => {
      setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 2000);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input, meetingType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "분석 중 오류가 발생했습니다.");
        setStep("input");
        return;
      }

      setResult(data);
      setStep("result");
    } catch {
      setError("서버와 통신 중 오류가 발생했습니다.");
      setStep("input");
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const handleNewAnalysis = () => {
    setStep("input");
    setInput("");
    setResult(null);
    setError("");
  };

  return (
    <div className="max-w-[480px] mx-auto min-h-screen pb-24">
      {/* Header */}
      <header className="bg-white border-b border-brown-200 px-5 py-3 text-center sticky top-0 z-50">
        <h1 className="text-xl font-extrabold tracking-tight">
          Meet<span className="text-kakao-700">Flow</span>
        </h1>
        <p className="text-xs text-brown-400 mt-0.5">회의 끝, 정리는 5초</p>
      </header>

      {/* Step Indicator */}
      <div className="px-5 pt-5 pb-2">
        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-kakao-100 text-brown-700">
          {step === "input" ? "STEP 1 / 3" : step === "loading" ? "STEP 2 / 3" : "STEP 3 / 3"}
        </span>
        <h2 className="text-[22px] font-extrabold tracking-tight mt-2">
          {step === "input" ? "회의록 입력" : step === "loading" ? "AI 분석 중" : "분석 완료"}
        </h2>
        <p className="text-sm text-brown-400 mt-1">
          {step === "input"
            ? "회의록을 넣으면 AI가 할 일을 정리해 드려요."
            : step === "loading"
              ? "Claude가 회의록을 읽고 있어요."
              : "할 일을 중심으로 정리했어요."}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mb-3 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* STEP 1: Input */}
      {step === "input" && (
        <div className="px-5 space-y-3">
          {/* Meeting Type */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-base font-bold mb-3">어떤 회의였나요?</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {MEETING_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setMeetingType(t.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold border-[1.5px] transition-all ${
                      meetingType === t.id
                        ? "bg-kakao-500 border-kakao-500 text-brown-800 font-bold"
                        : "bg-white border-brown-200 text-brown-500 hover:border-brown-300"
                    }`}
                  >
                    <Icon size={14} />
                    {t.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[13px] text-brown-400">
              회의 유형에 맞춰 AI 분석이 최적화됩니다.
            </p>
          </div>

          {/* Text Input */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <textarea
              className="w-full min-h-[160px] border-[1.5px] border-brown-200 rounded-xl p-3.5 text-[15px] bg-brown-50 text-brown-700 resize-none leading-relaxed transition-all placeholder:text-brown-300 focus:outline-none focus:border-kakao-400 focus:bg-white focus:ring-[3px] focus:ring-kakao-100"
              placeholder={PLACEHOLDER}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <p className="text-[13px] text-brown-400 mt-2">
              녹취록, 메모, 채팅 로그 등 어떤 형태든 가능해요. · {input.length.toLocaleString()}자
            </p>
          </div>
        </div>
      )}

      {/* STEP 2: Loading */}
      {step === "loading" && (
        <div className="px-5">
          <div className="bg-white rounded-2xl p-12 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-center">
            <div className="text-5xl mb-4 animate-pulse">🤖</div>
            <h3 className="text-lg font-extrabold mb-1">회의록을 분석하고 있어요</h3>
            <p className="text-sm text-brown-400 mb-7">잠시만 기다려주세요</p>

            <div className="text-left max-w-[260px] mx-auto space-y-2.5">
              {LOADING_STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i < loadingStep
                        ? "bg-kakao-200 text-brown-700"
                        : i === loadingStep
                          ? "bg-kakao-500 text-brown-800"
                          : "bg-brown-100 text-brown-400"
                    }`}
                  >
                    {i < loadingStep ? "✓" : i + 1}
                  </div>
                  <span
                    className={
                      i < loadingStep
                        ? "text-brown-700"
                        : i === loadingStep
                          ? "text-brown-900 font-bold"
                          : "text-brown-400"
                    }
                  >
                    {s}
                  </span>
                </div>
              ))}
            </div>

            <div className="max-w-[260px] mx-auto mt-5">
              <div className="bg-brown-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-kakao-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-brown-400 mt-2">약 5~10초</p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Result */}
      {step === "result" && result && (
        <div className="px-5">
          <ResultView data={result} meetingType={meetingType} />
        </div>
      )}

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-brown-100 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
        <div className="max-w-[480px] mx-auto px-5 py-3">
          {step === "input" && (
            <button
              onClick={handleAnalyze}
              disabled={!input.trim()}
              className="w-full py-4 rounded-xl text-base font-bold bg-kakao-500 text-brown-800 hover:bg-kakao-600 disabled:bg-brown-200 disabled:text-brown-400 disabled:cursor-not-allowed transition-all"
            >
              분석하기
            </button>
          )}
          {step === "result" && (
            <button
              onClick={handleNewAnalysis}
              className="w-full py-4 rounded-xl text-base font-bold bg-kakao-500 text-brown-800 hover:bg-kakao-600 transition-all"
            >
              새 분석하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
