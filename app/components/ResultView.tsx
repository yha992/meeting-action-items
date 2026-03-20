"use client";

import { useState } from "react";
import type { AnalysisResult } from "../page";

const AVATAR_COLORS = [
  { bg: "var(--kakao-100)", color: "var(--gray-700)" },
  { bg: "var(--info-bg)", color: "var(--info)" },
  { bg: "var(--success-bg)", color: "var(--success)" },
  { bg: "#fce7f3", color: "#ec4899" },
  { bg: "var(--warn-bg)", color: "var(--warn)" },
  { bg: "var(--danger-bg)", color: "var(--danger)" },
];

function getAvatarColor(name: string) {
  const idx =
    name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function importanceBadge(level: string) {
  if (level === "high")
    return (
      <span
        style={{
          padding: "2px 8px",
          borderRadius: 9999,
          fontSize: 11,
          fontWeight: 700,
          background: "var(--danger-bg)",
          color: "var(--danger)",
        }}
      >
        높음
      </span>
    );
  if (level === "medium")
    return (
      <span
        style={{
          padding: "2px 8px",
          borderRadius: 9999,
          fontSize: 11,
          fontWeight: 700,
          background: "var(--warn-bg)",
          color: "var(--warn)",
        }}
      >
        중간
      </span>
    );
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 700,
        background: "var(--success-bg)",
        color: "var(--success)",
      }}
    >
      낮음
    </span>
  );
}

function severityBadge(level: string) {
  if (level === "high")
    return (
      <span
        style={{
          padding: "2px 8px",
          borderRadius: 9999,
          fontSize: 11,
          fontWeight: 700,
          background: "var(--danger-bg)",
          color: "var(--danger)",
        }}
      >
        위험
      </span>
    );
  if (level === "medium")
    return (
      <span
        style={{
          padding: "2px 8px",
          borderRadius: 9999,
          fontSize: 11,
          fontWeight: 700,
          background: "var(--warn-bg)",
          color: "var(--warn)",
        }}
      >
        주의
      </span>
    );
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 700,
        background: "var(--success-bg)",
        color: "var(--success)",
      }}
    >
      낮음
    </span>
  );
}

function Accordion({
  title,
  icon,
  iconBg,
  iconColor,
  count,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        marginBottom: 8,
        boxShadow: "var(--shadow)",
        overflow: "hidden",
      }}
    >
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "16px 18px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            flexShrink: 0,
            color: iconColor,
          }}
        >
          {icon}
        </div>
        <h4
          style={{
            flex: 1,
            fontSize: 15,
            fontWeight: 700,
            color: "var(--gray-800)",
            margin: 0,
          }}
        >
          {title}
        </h4>
        {count !== undefined && (
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)" }}>
            {count}건
          </span>
        )}
        <span
          style={{
            fontSize: 12,
            color: "var(--gray-300)",
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </div>
      {open && (
        <div style={{ padding: "0 18px 16px" }}>{children}</div>
      )}
    </div>
  );
}

function AccItem({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "8px 0",
        borderBottom: "1px solid var(--gray-100)",
        fontSize: 14,
        color: "var(--gray-700)",
      }}
    >
      {children}
    </div>
  );
}

export default function ResultView({
  data,
  onReset,
}: {
  data: AnalysisResult;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    const text = buildPlainText(data);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 88 }}>
      {/* App Header */}
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
        <button
          onClick={onReset}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--gray-400)",
            fontSize: 20,
            padding: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--gray-900)",
            }}
          >
            Meet<span style={{ color: "var(--kakao-700)" }}>Flow</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--gray-400)" }}>분석 완료</div>
        </div>
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 700,
            background: "var(--kakao-100)",
            color: "var(--gray-700)",
          }}
        >
          {data.meetingType}
        </span>
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* Meeting info */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "16px 20px",
            marginBottom: 10,
            boxShadow: "var(--shadow)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--gray-900)" }}>
              {data.title}
            </div>
            {data.date && (
              <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 2 }}>
                {data.date} · {data.meetingType}
              </div>
            )}
          </div>
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 9999,
              fontSize: 11,
              fontWeight: 700,
              background: "var(--kakao-100)",
              color: "var(--gray-700)",
            }}
          >
            분석 완료
          </span>
        </div>

        {/* Hero: 담당자별 할 일 */}
        {data.actionItems.length > 0 && (
          <div
            style={{
              background: "var(--kakao-50)",
              border: "1.5px solid var(--kakao-300)",
              borderRadius: 16,
              padding: 20,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  margin: 0,
                  color: "var(--gray-900)",
                  flex: 1,
                }}
              >
                ✅ 담당자별 할 일
              </h3>
              <span
                style={{
                  background: "var(--kakao-500)",
                  color: "var(--gray-800)",
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: 9999,
                }}
              >
                {data.actionItems.length}건
              </span>
            </div>

            {data.actionItems.map((item, i) => {
              const avatarColor = getAvatarColor(item.assignee);
              const initial = item.assignee ? item.assignee[0] : "?";
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "12px 14px",
                    background: "#fff",
                    borderRadius: 12,
                    marginBottom: 6,
                    boxShadow: "var(--shadow)",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: avatarColor.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      color: avatarColor.color,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {initial}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: item.assignee ? "var(--gray-800)" : "var(--gray-400)",
                      }}
                    >
                      {item.assignee || "미지정"}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "var(--gray-700)",
                        marginTop: 2,
                        lineHeight: 1.4,
                      }}
                    >
                      {item.task}
                    </div>
                    {item.deadline && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--gray-400)",
                          marginTop: 4,
                        }}
                      >
                        📅 {item.deadline}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 결정 사항 Accordion */}
        {data.decisions.length > 0 && (
          <Accordion
            title="결정 사항"
            icon="✓"
            iconBg="var(--success-bg)"
            iconColor="var(--success)"
            count={data.decisions.length}
            defaultOpen={true}
          >
            {data.decisions.map((d, i) => (
              <AccItem key={i}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span>{d.content}</span>
                  {importanceBadge(d.importance)}
                </div>
              </AccItem>
            ))}
          </Accordion>
        )}

        {/* 미결정 사항 Accordion */}
        {data.pending.length > 0 && (
          <Accordion
            title="미결정 사항"
            icon="?"
            iconBg="var(--warn-bg)"
            iconColor="var(--warn)"
            count={data.pending.length}
          >
            {data.pending.map((p, i) => (
              <AccItem key={i}>
                <div style={{ fontWeight: 500 }}>{p.content}</div>
                <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 2 }}>
                  {p.reason}
                </div>
              </AccItem>
            ))}
          </Accordion>
        )}

        {/* 일정 리스크 Accordion */}
        {data.risks.length > 0 && (
          <Accordion
            title="일정 리스크"
            icon="⚠"
            iconBg="var(--danger-bg)"
            iconColor="var(--danger)"
            count={data.risks.length}
          >
            {data.risks.map((r, i) => (
              <AccItem key={i}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span>{r.content}</span>
                  {severityBadge(r.severity)}
                </div>
              </AccItem>
            ))}
          </Accordion>
        )}

        {/* 후속 질문 Accordion */}
        {data.followUpQuestions.length > 0 && (
          <Accordion
            title="후속 질문"
            icon="💬"
            iconBg="var(--kakao-50)"
            iconColor="var(--gray-600)"
            count={data.followUpQuestions.length}
          >
            {data.followUpQuestions.map((q, i) => (
              <AccItem key={i}>
                <span style={{ color: "var(--gray-400)", marginRight: 6 }}>
                  {i + 1}.
                </span>
                {q}
              </AccItem>
            ))}
          </Accordion>
        )}

        {/* 공지/메일 초안 Accordion */}
        {data.draftNotice && (
          <Accordion
            title="공지 / 메일 초안"
            icon="✉"
            iconBg="var(--info-bg)"
            iconColor="var(--info)"
          >
            <div
              style={{
                background: "var(--gray-50)",
                borderRadius: 12,
                padding: 16,
                fontSize: 14,
                lineHeight: 1.8,
                color: "var(--gray-600)",
                whiteSpace: "pre-wrap",
              }}
            >
              {data.draftNotice}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <button
                onClick={handleCopyAll}
                style={{
                  padding: "7px 12px",
                  fontSize: 13,
                  fontWeight: 600,
                  background: "var(--gray-100)",
                  color: "var(--gray-600)",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                복사
              </button>
            </div>
          </Accordion>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="bottom-bar" style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleCopyAll}
            style={{
              flex: 1,
              padding: "14px 0",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              background: "var(--gray-100)",
              color: "var(--gray-600)",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            {copied ? "복사 완료!" : "전체 복사"}
          </button>
          <button
            style={{
              flex: 2,
              padding: "14px 0",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              background: "var(--kakao-500)",
              color: "var(--gray-800)",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            공유하기
          </button>
        </div>
      </div>
    </div>
  );
}

function buildPlainText(data: AnalysisResult): string {
  const lines: string[] = [];
  lines.push(`# ${data.title}`);
  if (data.date) lines.push(`날짜: ${data.date}`);
  lines.push(`유형: ${data.meetingType}`);
  lines.push("");

  if (data.decisions.length) {
    lines.push("## 결정 사항");
    data.decisions.forEach((d) =>
      lines.push(`- [${d.importance}] ${d.content}`)
    );
    lines.push("");
  }

  if (data.pending.length) {
    lines.push("## 미결정 사항");
    data.pending.forEach((p) =>
      lines.push(`- ${p.content} (사유: ${p.reason})`)
    );
    lines.push("");
  }

  if (data.actionItems.length) {
    lines.push("## 담당자별 할 일");
    data.actionItems.forEach((a) =>
      lines.push(
        `- [${a.assignee || "미지정"}] ${a.task} (기한: ${a.deadline || "미정"})`
      )
    );
    lines.push("");
  }

  if (data.risks.length) {
    lines.push("## 일정 리스크");
    data.risks.forEach((r) => lines.push(`- [${r.severity}] ${r.content}`));
    lines.push("");
  }

  if (data.followUpQuestions.length) {
    lines.push("## 후속 질문");
    data.followUpQuestions.forEach((q, i) => lines.push(`${i + 1}. ${q}`));
    lines.push("");
  }

  if (data.draftNotice) {
    lines.push("## 공지/메일 초안");
    lines.push(data.draftNotice);
  }

  return lines.join("\n");
}
