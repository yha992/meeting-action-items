"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Analysis } from "@/lib/supabase";

const MEETING_TYPE_FILTERS = ["전체", "주간 정기", "프로젝트", "브레인스토밍", "의사결정", "1:1 미팅"];

const TYPE_ICONS: Record<string, string> = {
  "주간 정기": "📋",
  "프로젝트": "🚀",
  "브레인스토밍": "💡",
  "의사결정": "🎯",
  "1:1 미팅": "👤",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("전체");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchAnalyses(0, true);
  }, [typeFilter]);

  async function fetchAnalyses(pageNum: number, reset: boolean) {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        offset: String(pageNum * 10),
        limit: "11",
        ...(typeFilter !== "전체" && { type: typeFilter }),
        ...(search && { q: search }),
      });
      const res = await fetch(`/api/history?${params}`);
      const data: Analysis[] = await res.json();
      const items = data.slice(0, 10);
      setHasMore(data.length > 10);
      setAnalyses(reset ? items : (prev) => [...prev, ...items]);
      setPage(pageNum);
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalyses(0, true);
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 40 }}>
      {/* Header */}
      <div
        style={{
          background: "#fff",
          padding: "16px 20px",
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "var(--shadow)",
        }}
      >
        <Link href="/" style={{ color: "var(--gray-400)", fontSize: 20, textDecoration: "none" }}>←</Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.03em" }}>
            Meet<span style={{ color: "var(--kakao-700)" }}>Flow</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--gray-400)" }}>분석 기록</div>
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* 검색 + 필터 */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 10, boxShadow: "var(--shadow)" }}>
          <form onSubmit={handleSearch}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="회의 제목, 담당자, 키워드 검색"
              style={{
                width: "100%", padding: "11px 14px", border: "1.5px solid var(--gray-200)",
                borderRadius: 12, fontSize: 14, fontFamily: "inherit",
                background: "var(--gray-50)", color: "var(--gray-700)", outline: "none",
              }}
            />
          </form>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            {MEETING_TYPE_FILTERS.map((t) => (
              <button
                key={t}
                className={`chip${typeFilter === t ? " active" : ""}`}
                onClick={() => setTypeFilter(t)}
                style={{ fontSize: 12, padding: "4px 12px" }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 목록 */}
        {loading && analyses.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--gray-400)" }}>불러오는 중...</div>
        ) : analyses.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, padding: 40, textAlign: "center", boxShadow: "var(--shadow)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--gray-700)", marginBottom: 4 }}>
              {search || typeFilter !== "전체" ? "검색 결과가 없어요" : "아직 분석 기록이 없어요"}
            </div>
            <div style={{ fontSize: 14, color: "var(--gray-400)", marginBottom: 20 }}>
              {search || typeFilter !== "전체" ? "다른 키워드로 검색해보세요" : "회의록을 붙여넣으면 AI가 할 일을 정리해 드려요"}
            </div>
            <Link
              href="/"
              style={{
                display: "inline-block", padding: "10px 20px", background: "var(--kakao-500)",
                color: "var(--gray-800)", borderRadius: 12, fontWeight: 700, textDecoration: "none", fontSize: 14,
              }}
            >
              첫 번째 분석 시작하기
            </Link>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "var(--shadow)", overflow: "hidden" }}>
            {analyses.map((a, i) => {
              const result = a.result_json as Record<string, unknown>;
              const actionItems = (result.actionItems as unknown[]) ?? [];
              const decisions = (result.decisions as unknown[]) ?? [];
              const risks = (result.risks as unknown[]) ?? [];
              const title = (result.title as string) ?? "회의";
              const icon = TYPE_ICONS[a.meeting_type] ?? "📋";

              return (
                <Link
                  key={a.id}
                  href={a.share_id ? `/share/${a.share_id}` : "#"}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                    borderBottom: i < analyses.length - 1 ? "1px solid var(--gray-100)" : "none",
                    textDecoration: "none", color: "inherit",
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, background: "var(--kakao-50)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
                  }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--gray-800)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {title}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 1 }}>
                      {actionItems.length > 0 && `할 일 ${actionItems.length}건`}
                      {decisions.length > 0 && ` · 결정 ${decisions.length}건`}
                      {risks.length > 0 && ` · 리스크 ${risks.length}건`}
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                      <span style={{ padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 600, background: "var(--gray-100)", color: "var(--gray-500)" }}>
                        {a.meeting_type}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--gray-400)", flexShrink: 0 }}>{formatDate(a.created_at)}</div>
                  <div style={{ color: "var(--gray-300)", fontSize: 14 }}>›</div>
                </Link>
              );
            })}
          </div>
        )}

        {hasMore && (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button
              onClick={() => fetchAnalyses(page + 1, false)}
              style={{
                padding: "10px 24px", background: "var(--gray-100)", color: "var(--gray-600)",
                border: "none", borderRadius: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              더 보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
