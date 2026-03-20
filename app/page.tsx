"use client";

import { useState } from "react";
import ResultView from "./components/ResultView";

interface AnalysisResult {
  title: string;
  date: string | null;
  decisions: { content: string; importance: string }[];
  pending: { content: string; reason: string }[];
  actionItems: { assignee: string; task: string; deadline: string | null }[];
  risks: { content: string; severity: string }[];
  followUpQuestions: string[];
  draftNotice: string;
}

const PLACEHOLDER = `예시:
3월 18일 마케팅팀 주간회의

참석자: 김팀장, 이대리, 박사원, 최인턴

1. 신규 캠페인 론칭일을 4월 1일로 확정
2. 디자인 시안은 이대리가 3월 22일까지 완성
3. 예산은 아직 재무팀 승인 대기중
4. SNS 채널별 콘텐츠 기획은 박사원 담당
5. 인플루언서 섭외 건은 다음 회의에서 재논의
6. 최인턴이 경쟁사 분석 보고서 3월 25일까지 제출`;

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!input.trim()) {
      setError("회의록 내용을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "분석 중 오류가 발생했습니다.");
        return;
      }

      setResult(data);
    } catch {
      setError("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">
          회의록 → 실행 항목 변환기
        </h1>
        <p className="text-gray-500">
          회의 녹취나 메모를 붙여넣으면 결정사항, 할 일, 리스크 등을 자동
          정리합니다
        </p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <label
          htmlFor="meeting-input"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          회의록 입력
        </label>
        <textarea
          id="meeting-input"
          className="w-full h-64 p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm leading-relaxed"
          placeholder={PLACEHOLDER}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-400">
            {input.length.toLocaleString()}자
          </span>
          <button
            onClick={handleAnalyze}
            disabled={loading || !input.trim()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                분석 중...
              </span>
            ) : (
              "분석하기"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-8">
          {error}
        </div>
      )}

      {result && <ResultView data={result} />}
    </main>
  );
}
