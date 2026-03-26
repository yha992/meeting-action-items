"use client";

import { useState } from "react";
import {
  CheckSquare,
  CircleCheck,
  CircleHelp,
  AlertTriangle,
  MessageCircle,
  Mail,
  Calendar,
  Pencil,
  Copy,
  ChevronDown,
} from "lucide-react";

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

const MEETING_TYPE_LABELS: Record<string, string> = {
  weekly: "주간 정기",
  project: "프로젝트",
  brainstorm: "브레인스토밍",
  decision: "의사결정",
  "one-on-one": "1:1 미팅",
};

const AVATAR_COLORS = [
  "bg-kakao-100 text-brown-700",
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-purple-100 text-purple-600",
  "bg-orange-100 text-orange-600",
];

function Badge({ label, variant }: { label: string; variant: "red" | "yellow" | "green" | "gray" }) {
  const styles = {
    red: "bg-red-50 text-red-500",
    yellow: "bg-amber-50 text-amber-500",
    green: "bg-emerald-50 text-emerald-500",
    gray: "bg-brown-100 text-brown-500",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${styles[variant]}`}>
      {label}
    </span>
  );
}

function importanceBadge(level: string) {
  if (level === "high") return <Badge label="high" variant="red" />;
  if (level === "medium") return <Badge label="medium" variant="yellow" />;
  return <Badge label="low" variant="green" />;
}

function severityBadge(level: string) {
  if (level === "high") return <Badge label="high" variant="red" />;
  if (level === "medium") return <Badge label="medium" variant="yellow" />;
  return <Badge label="low" variant="green" />;
}

function Accordion({
  icon,
  iconBg,
  title,
  count,
  children,
  defaultOpen = false,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3.5 hover:bg-brown-50 transition-colors"
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <h4 className="flex-1 text-left text-[15px] font-bold text-brown-800">{title}</h4>
        <span className="text-xs font-bold text-brown-400">{count}건</span>
        <ChevronDown
          size={14}
          className={`text-brown-300 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export default function ResultView({
  data,
  meetingType,
}: {
  data: AnalysisResult;
  meetingType: string;
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
    <div className="space-y-2.5">
      {/* Meeting Info */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between">
        <div>
          <div className="text-base font-bold">{data.title}</div>
          <div className="text-xs text-brown-400 mt-0.5">
            {data.date || "날짜 미상"} · {MEETING_TYPE_LABELS[meetingType] || meetingType}
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-kakao-100 text-brown-700">
          분석 완료
        </span>
      </div>

      {/* Hero Card: Action Items */}
      {data.actionItems.length > 0 && (
        <div className="bg-kakao-50 border-[1.5px] border-kakao-300 rounded-2xl p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <h3 className="text-[17px] font-extrabold text-brown-900 flex items-center gap-2">
              <CheckSquare size={18} className="text-brown-700" />
              담당자별 할 일
            </h3>
            <span className="bg-kakao-500 text-brown-800 text-xs font-extrabold px-2 py-0.5 rounded-full">
              {data.actionItems.length}건
            </span>
          </div>

          <div className="space-y-1.5">
            {data.actionItems.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-3 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0 mt-0.5 ${
                    a.assignee === "미지정"
                      ? "bg-brown-100 text-brown-400"
                      : AVATAR_COLORS[i % AVATAR_COLORS.length]
                  }`}
                >
                  {a.assignee === "미지정" ? "?" : a.assignee.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-brown-800">{a.assignee}</div>
                  <div className="text-sm text-brown-700 mt-0.5 leading-snug">{a.task}</div>
                  {a.deadline && (
                    <div className="text-xs text-brown-400 mt-1 flex items-center gap-1">
                      <Calendar size={12} />
                      {a.deadline}
                    </div>
                  )}
                </div>
                <Pencil size={12} className="text-brown-300 flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decisions */}
      {data.decisions.length > 0 && (
        <Accordion
          icon={<CircleCheck size={16} className="text-emerald-500" />}
          iconBg="bg-emerald-50"
          title="결정 사항"
          count={data.decisions.length}
          defaultOpen
        >
          <div className="space-y-2">
            {data.decisions.map((d, i) => (
              <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-brown-100 last:border-0 text-sm text-brown-700">
                <span>{d.content}</span>
                {importanceBadge(d.importance)}
              </div>
            ))}
          </div>
        </Accordion>
      )}

      {/* Pending */}
      {data.pending.length > 0 && (
        <Accordion
          icon={<CircleHelp size={16} className="text-amber-500" />}
          iconBg="bg-amber-50"
          title="미결정 사항"
          count={data.pending.length}
        >
          <div className="space-y-2">
            {data.pending.map((p, i) => (
              <div key={i} className="py-2 border-b border-brown-100 last:border-0 text-sm text-brown-700">
                {p.content}
                <div className="text-xs text-brown-400 mt-0.5">{p.reason}</div>
              </div>
            ))}
          </div>
        </Accordion>
      )}

      {/* Risks */}
      {data.risks.length > 0 && (
        <Accordion
          icon={<AlertTriangle size={16} className="text-red-500" />}
          iconBg="bg-red-50"
          title="일정 리스크"
          count={data.risks.length}
        >
          <div className="space-y-2">
            {data.risks.map((r, i) => (
              <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-brown-100 last:border-0 text-sm text-brown-700">
                <div>
                  {r.content}
                </div>
                {severityBadge(r.severity)}
              </div>
            ))}
          </div>
        </Accordion>
      )}

      {/* Follow-up Questions */}
      {data.followUpQuestions.length > 0 && (
        <Accordion
          icon={<MessageCircle size={16} className="text-brown-600" />}
          iconBg="bg-kakao-50"
          title="후속 질문"
          count={data.followUpQuestions.length}
        >
          <div className="space-y-2">
            {data.followUpQuestions.map((q, i) => (
              <div key={i} className="py-2 border-b border-brown-100 last:border-0 text-sm text-brown-700">
                {q}
              </div>
            ))}
          </div>
        </Accordion>
      )}

      {/* Draft Notice */}
      {data.draftNotice && (
        <Accordion
          icon={<Mail size={16} className="text-blue-500" />}
          iconBg="bg-blue-50"
          title="공지 / 메일 초안"
          count={0}
        >
          <div className="bg-brown-50 rounded-xl p-4 text-sm leading-relaxed text-brown-600 whitespace-pre-wrap">
            {data.draftNotice}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brown-100 text-brown-600 text-[13px] font-semibold rounded-lg hover:bg-brown-200 transition-colors"
            >
              <Copy size={13} />
              {copied ? "복사 완료!" : "전체 복사"}
            </button>
          </div>
        </Accordion>
      )}

      {/* Footer */}
      <p className="text-center text-[11px] text-brown-400 pt-4 pb-8">
        MeetFlow v2 · Powered by Claude
      </p>
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
