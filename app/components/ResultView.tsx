"use client";

import { useState } from "react";

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

function Badge({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[color] || colors.gray}`}
    >
      {label}
    </span>
  );
}

function importanceBadge(level: string) {
  switch (level) {
    case "high":
      return <Badge label="높음" color="red" />;
    case "medium":
      return <Badge label="중간" color="yellow" />;
    default:
      return <Badge label="낮음" color="green" />;
  }
}

function severityBadge(level: string) {
  switch (level) {
    case "high":
      return <Badge label="위험" color="red" />;
    case "medium":
      return <Badge label="주의" color="yellow" />;
    default:
      return <Badge label="낮음" color="green" />;
  }
}

function Section({
  title,
  icon,
  children,
  count,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span>{icon}</span>
        {title}
        {count !== undefined && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </h3>
      {children}
    </div>
  );
}

export default function ResultView({ data }: { data: AnalysisResult }) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    const text = buildPlainText(data);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">{data.title}</h2>
          {data.date && (
            <p className="text-sm text-gray-500 mt-1">{data.date}</p>
          )}
        </div>
        <button
          onClick={handleCopyAll}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {copied ? "복사 완료!" : "전체 복사"}
        </button>
      </div>

      <div className="grid gap-5">
        {data.decisions.length > 0 && (
          <Section title="결정 사항" icon="✅" count={data.decisions.length}>
            <ul className="space-y-2">
              {data.decisions.map((d, i) => (
                <li
                  key={i}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <span>{d.content}</span>
                  {importanceBadge(d.importance)}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {data.pending.length > 0 && (
          <Section title="미결정 사항" icon="⏳" count={data.pending.length}>
            <ul className="space-y-2">
              {data.pending.map((p, i) => (
                <li key={i} className="text-sm">
                  <p className="font-medium">{p.content}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    사유: {p.reason}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {data.actionItems.length > 0 && (
          <Section
            title="담당자별 할 일"
            icon="📋"
            count={data.actionItems.length}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="pb-2 font-medium">담당자</th>
                    <th className="pb-2 font-medium">할 일</th>
                    <th className="pb-2 font-medium">기한</th>
                  </tr>
                </thead>
                <tbody>
                  {data.actionItems.map((a, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 pr-4">
                        <Badge label={a.assignee} color="blue" />
                      </td>
                      <td className="py-2 pr-4">{a.task}</td>
                      <td className="py-2 text-gray-500">
                        {a.deadline || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {data.risks.length > 0 && (
          <Section title="일정 리스크" icon="⚠️" count={data.risks.length}>
            <ul className="space-y-2">
              {data.risks.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <span>{r.content}</span>
                  {severityBadge(r.severity)}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {data.followUpQuestions.length > 0 && (
          <Section
            title="후속 질문"
            icon="❓"
            count={data.followUpQuestions.length}
          >
            <ul className="space-y-1.5">
              {data.followUpQuestions.map((q, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-gray-400">{i + 1}.</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {data.draftNotice && (
          <Section title="공지/메일 초안" icon="✉️">
            <pre className="text-sm whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl p-4">
              {data.draftNotice}
            </pre>
          </Section>
        )}
      </div>
    </div>
  );
}

function buildPlainText(data: AnalysisResult): string {
  const lines: string[] = [];
  lines.push(`# ${data.title}`);
  if (data.date) lines.push(`날짜: ${data.date}`);
  lines.push("");

  if (data.decisions.length) {
    lines.push("## 결정 사항");
    data.decisions.forEach((d) => lines.push(`- [${d.importance}] ${d.content}`));
    lines.push("");
  }

  if (data.pending.length) {
    lines.push("## 미결정 사항");
    data.pending.forEach((p) => lines.push(`- ${p.content} (사유: ${p.reason})`));
    lines.push("");
  }

  if (data.actionItems.length) {
    lines.push("## 담당자별 할 일");
    data.actionItems.forEach((a) =>
      lines.push(`- [${a.assignee}] ${a.task} (기한: ${a.deadline || "미정"})`)
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
