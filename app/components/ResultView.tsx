"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { AnalysisResult } from "../page";

/* ── Avatar color helper ─────────────────── */
const AVATAR_COLORS = [
  { bg: "var(--kakao-100)", color: "var(--gray-700)" },
  { bg: "var(--info-bg)", color: "var(--info)" },
  { bg: "var(--success-bg)", color: "var(--success)" },
  { bg: "#fce7f3", color: "#ec4899" },
  { bg: "var(--warn-bg)", color: "var(--warn)" },
  { bg: "var(--danger-bg)", color: "var(--danger)" },
];
function getAvatarColor(name: string) {
  const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

/* ── Badge helpers ───────────────────────── */
function ImportanceBadge({ level }: { level: string }) {
  const map: Record<string, [string, string]> = {
    high: ["var(--danger-bg)", "var(--danger)"],
    medium: ["var(--warn-bg)", "var(--warn)"],
    low: ["var(--success-bg)", "var(--success)"],
  };
  const [bg, color] = map[level] ?? map.low;
  const label = { high: "높음", medium: "중간", low: "낮음" }[level] ?? "낮음";
  return <span style={{ padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 700, background: bg, color }}>{label}</span>;
}
function SeverityBadge({ level }: { level: string }) {
  const map: Record<string, [string, string]> = {
    high: ["var(--danger-bg)", "var(--danger)"],
    medium: ["var(--warn-bg)", "var(--warn)"],
    low: ["var(--success-bg)", "var(--success)"],
  };
  const [bg, color] = map[level] ?? map.low;
  const label = { high: "위험", medium: "주의", low: "낮음" }[level] ?? "낮음";
  return <span style={{ padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 700, background: bg, color }}>{label}</span>;
}

/* ── Accordion ───────────────────────────── */
function Accordion({ title, icon, iconBg, iconColor, count, children, defaultOpen = false }: {
  title: string; icon: string; iconBg: string; iconColor: string;
  count?: number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: "#fff", borderRadius: 16, marginBottom: 8, boxShadow: "var(--shadow)", overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 18px", cursor: "pointer", userSelect: "none" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, color: iconColor }}>{icon}</div>
        <h4 style={{ flex: 1, fontSize: 15, fontWeight: 700, color: "var(--gray-800)", margin: 0 }}>{title}</h4>
        {count !== undefined && <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)" }}>{count}건</span>}
        <span style={{ fontSize: 12, color: "var(--gray-300)", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
      </div>
      {open && <div style={{ padding: "0 18px 16px" }}>{children}</div>}
    </div>
  );
}
function AccItem({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "8px 0", borderBottom: "1px solid var(--gray-100)", fontSize: 14, color: "var(--gray-700)" }}>{children}</div>;
}

/* ── Toast ───────────────────────────────── */
function Toast({ msg }: { msg: string }) {
  return (
    <div style={{
      position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)",
      background: "var(--gray-800)", color: "#fff", padding: "10px 20px",
      borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 999,
      whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
    }}>{msg}</div>
  );
}

/* ── Modal: Slack ────────────────────────── */
function SlackModal({ data, onClose }: { data: AnalysisResult; onClose: () => void }) {
  const [url, setUrl] = useState(() => typeof window !== "undefined" ? localStorage.getItem("slack_webhook") ?? "" : "");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  const send = async () => {
    if (!url) return;
    setSending(true);
    const res = await fetch("/api/share/slack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webhookUrl: url, title: data.title, decisions: data.decisions, actionItems: data.actionItems, meetingType: data.meetingType }),
    });
    const json = await res.json();
    setSending(false);
    if (json.success) {
      localStorage.setItem("slack_webhook", url);
      setMsg("Slack 전송 완료!");
      setTimeout(onClose, 1500);
    } else {
      setMsg(json.error ?? "전송 실패");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 16 }}>Slack 전송</h3>
        <label style={{ fontSize: 13, color: "var(--gray-500)", display: "block", marginBottom: 6 }}>Incoming Webhook URL</label>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://hooks.slack.com/services/..." style={{ width: "100%", padding: "11px 14px", border: "1.5px solid var(--gray-200)", borderRadius: 12, fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 16 }} />
        {msg && <p style={{ fontSize: 13, color: msg.includes("완료") ? "var(--success)" : "var(--danger)", marginBottom: 8 }}>{msg}</p>}
        <button onClick={send} disabled={sending || !url} style={{ width: "100%", padding: 14, borderRadius: 12, background: !url ? "var(--gray-200)" : "var(--kakao-500)", color: !url ? "var(--gray-400)" : "var(--gray-800)", border: "none", fontWeight: 700, fontSize: 15, cursor: !url ? "default" : "pointer", fontFamily: "inherit" }}>
          {sending ? "전송 중..." : "전송하기"}
        </button>
      </div>
    </div>
  );
}

/* ── Modal: Email ────────────────────────── */
function EmailModal({ data, onClose }: { data: AnalysisResult; onClose: () => void }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState(`[회의 결과] ${data.title}`);
  const [body, setBody] = useState(data.draftNotice);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  const send = async () => {
    setSending(true);
    const res = await fetch("/api/share/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, body }),
    });
    const json = await res.json();
    setSending(false);
    if (json.success) {
      setMsg("이메일 발송 완료!");
      setTimeout(onClose, 1500);
    } else {
      setMsg(json.error ?? "발송 실패");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 480, maxHeight: "80vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 16 }}>이메일 발송</h3>
        {[
          { label: "수신자 (쉼표로 구분)", value: to, setter: setTo, placeholder: "email@example.com, ..." },
          { label: "제목", value: subject, setter: setSubject, placeholder: "제목" },
        ].map(({ label, value, setter, placeholder }) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: "var(--gray-500)", display: "block", marginBottom: 4 }}>{label}</label>
            <input value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "11px 14px", border: "1.5px solid var(--gray-200)", borderRadius: 12, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
          </div>
        ))}
        <label style={{ fontSize: 13, color: "var(--gray-500)", display: "block", marginBottom: 4 }}>본문</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} style={{ width: "100%", padding: "11px 14px", border: "1.5px solid var(--gray-200)", borderRadius: 12, fontSize: 13, fontFamily: "inherit", outline: "none", resize: "none", marginBottom: 16 }} />
        {msg && <p style={{ fontSize: 13, color: msg.includes("완료") ? "var(--success)" : "var(--danger)", marginBottom: 8 }}>{msg}</p>}
        <button onClick={send} disabled={sending || !to} style={{ width: "100%", padding: 14, borderRadius: 12, background: !to ? "var(--gray-200)" : "var(--kakao-500)", color: !to ? "var(--gray-400)" : "var(--gray-800)", border: "none", fontWeight: 700, fontSize: 15, cursor: !to ? "default" : "pointer", fontFamily: "inherit" }}>
          {sending ? "발송 중..." : "발송하기"}
        </button>
      </div>
    </div>
  );
}

/* ── Main ResultView ─────────────────────── */
export default function ResultView({
  data: initialData,
  onReset,
  shareId,
  readOnly = false,
  analysisId,
}: {
  data: AnalysisResult;
  onReset: (() => void) | null;
  shareId?: string;
  readOnly?: boolean;
  analysisId?: string;
}) {
  const [data, setData] = useState(initialData);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [toast, setToast] = useState("");
  const [showSlack, setShowSlack] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editBuf, setEditBuf] = useState<{ assignee: string; task: string; deadline: string }>({ assignee: "", task: "", deadline: "" });

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }, []);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(buildPlainText(data)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyLink = () => {
    const url = shareId
      ? `${window.location.origin}/share/${shareId}`
      : window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      showToast("링크가 복사됐어요!");
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  /* 인라인 편집 */
  const startEdit = (idx: number) => {
    const item = data.actionItems[idx];
    setEditBuf({ assignee: item.assignee, task: item.task, deadline: item.deadline ?? "" });
    setEditingIdx(idx);
  };
  const saveEdit = () => {
    if (editingIdx === null) return;
    const newItems = data.actionItems.map((item, i) =>
      i === editingIdx
        ? { ...item, assignee: editBuf.assignee, task: editBuf.task, deadline: editBuf.deadline || null, _edited: true }
        : item
    );
    const newData = { ...data, actionItems: newItems };
    setData(newData);
    setEditingIdx(null);

    if (analysisId) {
      fetch(`/api/analyses/${analysisId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result_json: newData }),
      }).catch(() => {});
    }
  };
  const cancelEdit = () => setEditingIdx(null);

  const originItem = editingIdx !== null ? initialData.actionItems[editingIdx] : null;
  const isEdited = (item: AnalysisResult["actionItems"][number]) =>
    (item as Record<string, unknown>)._edited === true;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 88 }}>
      {/* Header */}
      <div style={{ background: "#fff", padding: "16px 20px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow)" }}>
        {onReset ? (
          <button onClick={onReset} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", fontSize: 20, padding: 0 }}>←</button>
        ) : (
          <Link href="/" style={{ color: "var(--gray-400)", fontSize: 20, textDecoration: "none" }}>←</Link>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.03em" }}>
            Meet<span style={{ color: "var(--kakao-700)" }}>Flow</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--gray-400)" }}>{readOnly ? "공유된 결과" : "분석 완료"}</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ padding: "4px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 700, background: "var(--kakao-100)", color: "var(--gray-700)" }}>{data.meetingType}</span>
          {!readOnly && (
            <Link href="/history" style={{ fontSize: 12, color: "var(--gray-400)", textDecoration: "none" }}>기록 →</Link>
          )}
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* Meeting info */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "16px 20px", marginBottom: 10, boxShadow: "var(--shadow)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{data.title}</div>
            {data.date && <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 2 }}>{data.date} · {data.meetingType}</div>}
          </div>
          <span style={{ padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 700, background: "var(--kakao-100)", color: "var(--gray-700)" }}>분석 완료</span>
        </div>

        {/* Share link */}
        {shareId && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 10, boxShadow: "var(--shadow)" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <input
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/share/${shareId}`}
                style={{ flex: 1, padding: "10px 12px", border: "1.5px solid var(--gray-200)", borderRadius: 10, fontSize: 13, fontFamily: "inherit", background: "var(--gray-50)", color: "var(--gray-600)", outline: "none" }}
              />
              <button
                onClick={handleCopyLink}
                style={{ padding: "10px 14px", borderRadius: 10, background: linkCopied ? "var(--success)" : "var(--kakao-500)", color: linkCopied ? "#fff" : "var(--gray-800)", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
              >
                {linkCopied ? "복사됨" : "복사"}
              </button>
            </div>
            <p style={{ fontSize: 12, color: "var(--gray-400)" }}>링크 공유 · 로그인 없이 접근 가능</p>
          </div>
        )}

        {/* Hero: 담당자별 할 일 */}
        {data.actionItems.length > 0 && (
          <div style={{ background: "var(--kakao-50)", border: "1.5px solid var(--kakao-300)", borderRadius: 16, padding: 20, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: "var(--gray-900)", flex: 1 }}>✅ 담당자별 할 일</h3>
              <span style={{ background: "var(--kakao-500)", color: "var(--gray-800)", fontSize: 12, fontWeight: 800, padding: "2px 8px", borderRadius: 9999 }}>{data.actionItems.length}건</span>
              {!readOnly && <span style={{ fontSize: 11, color: "var(--gray-400)" }}>탭하여 수정</span>}
            </div>

            {data.actionItems.map((item, i) => {
              const avatarColor = getAvatarColor(item.assignee);
              const initial = item.assignee ? item.assignee[0] : "?";
              const editing = editingIdx === i;

              return (
                <div
                  key={i}
                  onClick={() => !readOnly && !editing && startEdit(i)}
                  style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", background: "#fff", borderRadius: 12, marginBottom: 6, boxShadow: "var(--shadow)", cursor: readOnly ? "default" : "pointer", border: editing ? "1.5px solid var(--kakao-400)" : "1.5px solid transparent" }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: avatarColor.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: avatarColor.color, flexShrink: 0, marginTop: 2 }}>
                    {initial}
                  </div>
                  {editing ? (
                    <div style={{ flex: 1 }} onClick={(e) => e.stopPropagation()}>
                      <input value={editBuf.assignee} onChange={(e) => setEditBuf(b => ({ ...b, assignee: e.target.value }))} placeholder="담당자" style={{ width: "100%", border: "none", borderBottom: "1px solid var(--gray-200)", fontSize: 13, fontWeight: 700, outline: "none", marginBottom: 4, fontFamily: "inherit", background: "transparent" }} />
                      <input value={editBuf.task} onChange={(e) => setEditBuf(b => ({ ...b, task: e.target.value }))} placeholder="할 일" style={{ width: "100%", border: "none", borderBottom: "1px solid var(--gray-200)", fontSize: 14, outline: "none", marginBottom: 4, fontFamily: "inherit", background: "transparent" }} />
                      <input value={editBuf.deadline} onChange={(e) => setEditBuf(b => ({ ...b, deadline: e.target.value }))} placeholder="기한 (예: 3/28)" style={{ width: "100%", border: "none", borderBottom: "1px solid var(--gray-200)", fontSize: 12, outline: "none", marginBottom: 8, fontFamily: "inherit", background: "transparent", color: "var(--gray-500)" }} />
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={saveEdit} style={{ padding: "4px 12px", background: "var(--kakao-500)", color: "var(--gray-800)", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>저장</button>
                        <button onClick={cancelEdit} style={{ padding: "4px 12px", background: "var(--gray-100)", color: "var(--gray-600)", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>취소</button>
                        {isEdited(item) && originItem && (
                          <button onClick={() => {
                            const restored = data.actionItems.map((x, j) => j === i ? { ...initialData.actionItems[i] } : x);
                            setData(d => ({ ...d, actionItems: restored }));
                            setEditingIdx(null);
                          }} style={{ padding: "4px 12px", background: "transparent", color: "var(--gray-400)", border: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>원본 복원</button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: item.assignee ? "var(--gray-800)" : "var(--gray-400)", display: "flex", alignItems: "center", gap: 6 }}>
                        {item.assignee || "미지정"}
                        {isEdited(item) && <span style={{ fontSize: 10, padding: "1px 6px", background: "var(--info-bg)", color: "var(--info)", borderRadius: 9999, fontWeight: 700 }}>수정됨</span>}
                      </div>
                      <div style={{ fontSize: 14, color: "var(--gray-700)", marginTop: 2, lineHeight: 1.4 }}>{item.task}</div>
                      {item.deadline && <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>📅 {item.deadline}</div>}
                    </div>
                  )}
                  {!readOnly && !editing && <span style={{ fontSize: 11, color: "var(--gray-300)", flexShrink: 0, marginTop: 4 }}>✏</span>}
                </div>
              );
            })}
          </div>
        )}

        {data.decisions.length > 0 && (
          <Accordion title="결정 사항" icon="✓" iconBg="var(--success-bg)" iconColor="var(--success)" count={data.decisions.length} defaultOpen>
            {data.decisions.map((d, i) => (
              <AccItem key={i}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <span>{d.content}</span>
                  <ImportanceBadge level={d.importance} />
                </div>
              </AccItem>
            ))}
          </Accordion>
        )}

        {data.pending.length > 0 && (
          <Accordion title="미결정 사항" icon="?" iconBg="var(--warn-bg)" iconColor="var(--warn)" count={data.pending.length}>
            {data.pending.map((p, i) => (
              <AccItem key={i}>
                <div style={{ fontWeight: 500 }}>{p.content}</div>
                <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 2 }}>{p.reason}</div>
              </AccItem>
            ))}
          </Accordion>
        )}

        {data.risks.length > 0 && (
          <Accordion title="일정 리스크" icon="⚠" iconBg="var(--danger-bg)" iconColor="var(--danger)" count={data.risks.length}>
            {data.risks.map((r, i) => (
              <AccItem key={i}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <span>{r.content}</span>
                  <SeverityBadge level={r.severity} />
                </div>
              </AccItem>
            ))}
          </Accordion>
        )}

        {data.followUpQuestions.length > 0 && (
          <Accordion title="후속 질문" icon="💬" iconBg="var(--kakao-50)" iconColor="var(--gray-600)" count={data.followUpQuestions.length}>
            {data.followUpQuestions.map((q, i) => (
              <AccItem key={i}><span style={{ color: "var(--gray-400)", marginRight: 6 }}>{i + 1}.</span>{q}</AccItem>
            ))}
          </Accordion>
        )}

        {data.draftNotice && (
          <Accordion title="공지 / 메일 초안" icon="✉" iconBg="var(--info-bg)" iconColor="var(--info)">
            <div style={{ background: "var(--gray-50)", borderRadius: 12, padding: 16, fontSize: 14, lineHeight: 1.8, color: "var(--gray-600)", whiteSpace: "pre-wrap" }}>{data.draftNotice}</div>
            {!readOnly && (
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <button onClick={handleCopyAll} style={{ padding: "7px 12px", fontSize: 13, fontWeight: 600, background: "var(--gray-100)", color: "var(--gray-600)", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>복사</button>
                <button onClick={() => setShowEmail(true)} style={{ padding: "7px 12px", fontSize: 13, fontWeight: 600, background: "var(--gray-100)", color: "var(--gray-600)", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>이메일 발송</button>
              </div>
            )}
          </Accordion>
        )}

        {/* 공유하기 섹션 */}
        {!readOnly && shareId && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", letterSpacing: "0.03em", padding: "8px 0 6px" }}>공유하기</div>
            <div style={{ background: "#fff", borderRadius: 16, boxShadow: "var(--shadow)", overflow: "hidden" }}>
              {[
                { icon: "💬", label: "Slack 전송", desc: "채널에 요약 보내기", onClick: () => setShowSlack(true) },
                { icon: "✉️", label: "이메일 발송", desc: "공지 초안으로 바로 전송", onClick: () => setShowEmail(true) },
              ].map(({ icon, label, desc, onClick }, i) => (
                <div key={label} onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer", borderBottom: i === 0 ? "1px solid var(--gray-100)" : "none" }}>
                  <div style={{ width: 42, height: 42, background: "var(--gray-50)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--gray-800)" }}>{label}</div>
                    <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 1 }}>{desc}</div>
                  </div>
                  <span style={{ color: "var(--gray-300)" }}>›</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="bottom-bar" style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleCopyAll} style={{ flex: 1, padding: "14px 0", borderRadius: 12, fontSize: 14, fontWeight: 600, background: "var(--gray-100)", color: "var(--gray-600)", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            {copied ? "복사 완료!" : "전체 복사"}
          </button>
          {shareId ? (
            <button onClick={handleCopyLink} style={{ flex: 2, padding: "14px 0", borderRadius: 12, fontSize: 14, fontWeight: 700, background: "var(--kakao-500)", color: "var(--gray-800)", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              🔗 링크 공유
            </button>
          ) : (
            <button disabled style={{ flex: 2, padding: "14px 0", borderRadius: 12, fontSize: 14, fontWeight: 700, background: "var(--gray-200)", color: "var(--gray-400)", border: "none", fontFamily: "inherit" }}>
              공유하기
            </button>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast msg={toast} />}

      {/* Modals */}
      {showSlack && <SlackModal data={data} onClose={() => setShowSlack(false)} />}
      {showEmail && <EmailModal data={data} onClose={() => setShowEmail(false)} />}
    </div>
  );
}

/* ── Plain text builder ──────────────────── */
function buildPlainText(data: AnalysisResult): string {
  const lines: string[] = [];
  lines.push(`# ${data.title}`);
  if (data.date) lines.push(`날짜: ${data.date}`);
  lines.push(`유형: ${data.meetingType}`);
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
    data.actionItems.forEach((a) => lines.push(`- [${a.assignee || "미지정"}] ${a.task} (기한: ${a.deadline || "미정"})`));
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
