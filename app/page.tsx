"use client";

import { useState } from "react";
import ResultView from "./components/ResultView";

export interface AnalysisResult {
  title: string;
  date: string | null;
  meetingType: string;
  decisions: { content: string; importance: string }[];
  pending: { content: string; reason: string }[];
  actionItems: { assignee: string; task: string; deadline: string | null }[];
  risks: { content: string; severity: string }[];
  followUpQuestions: string[];
  draftNotice: string;
}

const MEETING_TYPES = ["주간 정기", "프로젝트", "브레인스토밍", "의사결정", "1:1 미팅"];

const PLACEHOLDER = `회의록을 여기에 붙여넣으세요.

예시)
오늘 회의에서 김팀장이 다음 주까지 디자인 시안을
완성하기로 했고, 이대리는 백엔드 API를 금요일까지
마무리하기로 했습니다.
예산 관련해서는 재무팀과 추가 논의가 필요합니다.`;

export default function Home() {
  const [meetingType, setMeetingType] = useState("주간 정기");
  const [activeTab, setActiveTab] = useState<"text" | "file">("text");
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
        body: JSON.stringify({ content: input, meetingType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "분석 중 오류가 발생했습니다.");
        return;
      }

      setResult({ ...data, meetingType });
    } catch {
      setError("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setInput("");
    setError("");
  };

  if (result) {
    return <ResultView data={result} onReset={handleReset} />;
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 88 }}>
      {/* App Header */}
      <div
        style={{
          background: "#fff",
          padding: "24px 20px 16px",
          margin: "0 0 10px",
          textAlign: "center",
          boxShadow: "var(--shadow)",
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "var(--gray-900)",
          }}
        >
          Meet<span style={{ color: "var(--kakao-700)" }}>Flow</span>
        </div>
        <div style={{ color: "var(--gray-400)", fontSize: 13, marginTop: 2 }}>
          회의 끝, 정리는 5초
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 4,
            marginTop: 14,
          }}
        >
          <span
            style={{
              padding: "7px 16px",
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 600,
              background: "var(--kakao-100)",
              color: "var(--gray-800)",
            }}
          >
            새 분석
          </span>
          <span
            style={{
              padding: "7px 16px",
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--gray-400)",
            }}
          >
            히스토리
          </span>
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* 회의 유형 선택 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 20,
            marginBottom: 10,
            boxShadow: "var(--shadow)",
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              marginBottom: 14,
              letterSpacing: "-0.02em",
            }}
          >
            어떤 회의였나요?
          </h3>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {MEETING_TYPES.map((type) => (
              <button
                key={type}
                className={`chip${meetingType === type ? " active" : ""}`}
                onClick={() => setMeetingType(type)}
              >
                {type}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "var(--gray-400)" }}>
            회의 유형에 맞춰 AI 분석이 최적화됩니다.
          </p>
        </div>

        {/* 입력 영역 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 20,
            marginBottom: 10,
            boxShadow: "var(--shadow)",
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              background: "var(--gray-100)",
              padding: 3,
              borderRadius: 9999,
              marginBottom: 14,
            }}
          >
            {(["text", "file"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: activeTab === tab ? "var(--kakao-500)" : "transparent",
                  color: activeTab === tab ? "var(--gray-800)" : "var(--gray-400)",
                  boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {tab === "text" ? "텍스트" : "파일 업로드"}
              </button>
            ))}
          </div>

          {activeTab === "text" ? (
            <>
              <textarea
                style={{
                  width: "100%",
                  minHeight: 160,
                  border: "1.5px solid var(--gray-200)",
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 15,
                  fontFamily: "inherit",
                  background: "var(--gray-50)",
                  color: "var(--gray-700)",
                  resize: "none",
                  lineHeight: 1.6,
                  transition: "all 0.15s",
                  outline: "none",
                }}
                placeholder={PLACEHOLDER}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--kakao-400)";
                  e.target.style.background = "#fff";
                  e.target.style.boxShadow = "0 0 0 3px var(--kakao-100)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--gray-200)";
                  e.target.style.background = "var(--gray-50)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <p style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 6 }}>
                녹취록, 메모, 채팅 로그 등 어떤 형태든 가능해요.
              </p>
              {input.length > 0 && (
                <p style={{ fontSize: 12, color: "var(--gray-300)", marginTop: 4 }}>
                  {input.length.toLocaleString()}자
                </p>
              )}
            </>
          ) : (
            <div
              style={{
                border: "1.5px dashed var(--gray-300)",
                borderRadius: 16,
                padding: "32px 16px",
                textAlign: "center",
                background: "var(--gray-50)",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
              <div style={{ fontSize: 14, color: "var(--gray-500)", fontWeight: 500 }}>
                파일을 드래그하거나 탭하여 선택
              </div>
              <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>
                .txt .docx .pdf — 최대 10MB
              </div>
              <p style={{ fontSize: 12, color: "var(--gray-300)", marginTop: 12 }}>
                파일 업로드 기능은 곧 추가됩니다
              </p>
            </div>
          )}
        </div>

        {error && (
          <div
            style={{
              background: "var(--danger-bg)",
              border: "1px solid #fecaca",
              color: "var(--danger)",
              padding: "12px 16px",
              borderRadius: 12,
              fontSize: 14,
              marginBottom: 10,
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="bottom-bar" style={{ maxWidth: 480, margin: "0 auto" }}>
        <button
          onClick={handleAnalyze}
          disabled={loading || !input.trim()}
          style={{
            width: "100%",
            padding: 16,
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 700,
            background:
              loading || !input.trim() ? "var(--gray-200)" : "var(--kakao-500)",
            color:
              loading || !input.trim() ? "var(--gray-400)" : "var(--gray-800)",
            border: "none",
            cursor: loading || !input.trim() ? "default" : "pointer",
            transition: "all 0.15s",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {loading ? (
            <>
              <svg
                style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }}
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  style={{ opacity: 0.25 }}
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  style={{ opacity: 0.75 }}
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              분석 중...
            </>
          ) : (
            "분석하기"
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
