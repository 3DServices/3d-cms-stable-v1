/**
 * AIWorkloadsPage — Waswa AI Console (/ai)
 *
 * Where administrators and product managers train and correct Waswa.
 *
 *   KPIs:           waiting for review · flagged answers · awaiting approval ·
 *                   live corrections · answers in the last 30 days
 *   Queue:          everything waiting on a person (flags, approvals, rechecks,
 *                   documents), oldest first
 *   Corrections:    every staff-written answer by status, plus a "test a
 *                   question" box showing which live correction would match
 *   Conversations:  what people asked and what Waswa answered, with evidence
 *   Documents:      what Waswa may read, who may see it, review status
 *
 * Permissions come from the server (GET /assistant/console/summary → you):
 * waswa.review to see and write, waswa.approve to sign off. The server
 * enforces them regardless of what this screen shows.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getWaswaConversations,
  getWaswaQueue,
  getWaswaSources,
  getWaswaSummary,
  listWaswaAnswers,
  previewWaswaMatch,
  reviewWaswaSource,
  setWaswaSourceAudience,
} from "../../api/services/waswa.service";
import { getAccountUid } from "../../api/services/auth.service";
import type {
  WaswaAnswer,
  WaswaConversationRow,
  WaswaQueueItem,
  WaswaSource,
  WaswaSummary,
} from "../../api/types";
import { AnswerEditor, type AnswerPrefill } from "./AnswerEditor";
import { ConversationView } from "./ConversationView";
import { Btn, Empty, Notice, Pill } from "./parts";
import { day, errText, inputCls, kindLabel, statusTone, when } from "./format";

type Tab = "queue" | "answers" | "conversations" | "documents";

const TABS: { id: Tab; label: string }[] = [
  { id: "queue",         label: "Review queue"  },
  { id: "answers",       label: "Corrections"   },
  { id: "conversations", label: "Conversations" },
  { id: "documents",     label: "Documents"     },
];

const ANSWER_FILTERS = [
  { id: "approved", label: "Live"     },
  { id: "pending",  label: "Awaiting approval" },
  { id: "draft",    label: "Drafts"   },
  { id: "rejected", label: "Rejected" },
  { id: "retired",  label: "Retired"  },
  { id: "",         label: "All"      },
];

function Stat({ label, value, sub, tone = "#111B21" }: { label: string; value: React.ReactNode; sub?: string; tone?: string }) {
  return (
    <div className="border border-[#E9EDEF] rounded-xl bg-white px-3 py-2.5 min-w-0">
      <div className="text-[11px] text-[#667781] truncate">{label}</div>
      <div className="text-[20px] font-black mt-0.5 tabular-nums" style={{ color: tone }}>{value}</div>
      {sub && <div className="text-[10px] text-[#667781] mt-0.5 truncate">{sub}</div>}
    </div>
  );
}

export function AIWorkloadsPage() {
  const [params, setParams] = useSearchParams();
  const tab = (TABS.some((t) => t.id === params.get("tab")) ? params.get("tab") : "queue") as Tab;
  const setTab = (t: Tab) => setParams((p) => { p.set("tab", t); return p; }, { replace: true });

  const myAccountUid = useMemo(() => getAccountUid(), []);

  // ── Summary / permissions ────────────────────────────────────────────────
  const [summary, setSummary] = useState<WaswaSummary | null>(null);
  const [denied, setDenied] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const perms = summary?.you.permissions ?? [];
  const canApprove = perms.includes("waswa.approve");

  const loadSummary = useCallback(() => {
    getWaswaSummary()
      .then((res) => { setSummary(res.data); setDenied(false); })
      .catch((e: { status?: number }) => {
        if (e?.status === 403) setDenied(true);
        else setPageError(errText(e));
      });
  }, []);

  // ── Data per tab ─────────────────────────────────────────────────────────
  const [queue, setQueue] = useState<WaswaQueueItem[]>([]);
  const [answers, setAnswers] = useState<WaswaAnswer[]>([]);
  const [answerFilter, setAnswerFilter] = useState("approved");
  const [answerSearch, setAnswerSearch] = useState("");
  const [convs, setConvs] = useState<WaswaConversationRow[]>([]);
  const [convSurface, setConvSurface] = useState("");
  const [convFlagged, setConvFlagged] = useState(false);
  const [sources, setSources] = useState<WaswaSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabError, setTabError] = useState<string | null>(null);
  const [tabInfo, setTabInfo] = useState<string | null>(null);

  // State is only set in the promise callbacks, never synchronously, so the
  // effect that calls this does not cascade renders.
  const loadTab = useCallback(() => {
    const ok = () => { setTabError(null); setLoading(false); };
    const fail = (e: unknown) => { setTabError(errText(e)); setLoading(false); };
    if (tab === "queue") {
      getWaswaQueue(undefined, 100).then((r) => { setQueue(r.data.items); ok(); }).catch(fail);
    } else if (tab === "answers") {
      listWaswaAnswers({ status: answerFilter || undefined, q: answerSearch || undefined, limit: 100 })
        .then((r) => { setAnswers(r.data.answers); ok(); }).catch(fail);
    } else if (tab === "conversations") {
      getWaswaConversations({ surface: convSurface || undefined, flagged: convFlagged, limit: 50 })
        .then((r) => { setConvs(r.data.conversations); ok(); }).catch(fail);
    } else {
      getWaswaSources().then((r) => { setSources(r.data.sources); ok(); }).catch(fail);
    }
  }, [tab, answerFilter, answerSearch, convSurface, convFlagged]);

  const refreshAll = useCallback(() => { loadSummary(); loadTab(); }, [loadSummary, loadTab]);

  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { if (!denied) loadTab(); }, [loadTab, denied]);

  // ── Side panels ──────────────────────────────────────────────────────────
  const [editor, setEditor] = useState<{ open: boolean; uid: string | null; prefill?: AnswerPrefill }>({ open: false, uid: null });
  const [convView, setConvView] = useState<{ open: boolean; uid: string | null; focus?: string | null }>({ open: false, uid: null });

  const openItem = (item: WaswaQueueItem) => {
    if (item.item_kind === "flag") {
      setConvView({ open: true, uid: item.conversation_uid, focus: item.message_uid });
    } else if (item.item_kind === "approval" || item.item_kind === "recheck") {
      setEditor({ open: true, uid: item.item_uid });
    } else {
      setTab("documents");
    }
  };

  // ── Match tester ─────────────────────────────────────────────────────────
  const [testQ, setTestQ] = useState("");
  const [testAudience, setTestAudience] = useState<"everyone" | "staff">("everyone");
  const [testResult, setTestResult] = useState<WaswaAnswer[] | null>(null);
  const runTest = () => {
    if (!testQ.trim()) return;
    previewWaswaMatch(testQ.trim(), testAudience)
      .then((r) => setTestResult(r.data.matches))
      .catch((e) => setTabError(errText(e)));
  };

  // ── Document actions ─────────────────────────────────────────────────────
  const docAction = (work: Promise<unknown>, msg: string) => {
    setTabError(null);
    work.then(() => { setTabInfo(msg); refreshAll(); }).catch((e) => setTabError(errText(e)));
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (denied) {
    return (
      <div className="p-6 max-w-[720px]">
        <h1 className="font-black text-[18px] text-[#111B21]">Waswa AI Console</h1>
        <div className="mt-3">
          <Notice tone="amber">
            You don't have access to the Waswa review tools yet. Ask an administrator to give your
            role the <b>waswa.review</b> permission (and <b>waswa.approve</b> if you sign off corrections).
          </Notice>
        </div>
      </div>
    );
  }

  const flagged30 = (summary?.last_30_days.feedback.wrong ?? 0) + (summary?.last_30_days.feedback.unhelpful ?? 0);
  const answered30 = summary?.last_30_days.answers ?? 0;

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-black text-[18px] text-[#111B21]">Waswa AI Console</h1>
          <p className="text-[12px] text-[#667781] mt-0.5 max-w-[640px]">
            Review what Waswa told people, correct what it got wrong, and decide what it may read.
            Corrections go live on mobile, the CMS and the tracking console once approved.
          </p>
        </div>
        <div className="flex gap-2">
          <Btn onClick={refreshAll}>Refresh</Btn>
          <Btn kind="primary" onClick={() => setEditor({ open: true, uid: null })}>New correction</Btn>
        </div>
      </div>

      {pageError && <Notice tone="red">{pageError}</Notice>}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Waiting for review" value={summary?.queue_total ?? "—"}
          tone={(summary?.queue_total ?? 0) > 0 ? "#B91C1C" : "#111B21"} sub="flags, approvals, rechecks, documents" />
        <Stat label="Flagged answers" value={summary?.queue.flag ?? "—"} sub="open or in review" />
        <Stat label="Awaiting approval" value={summary?.queue.approval ?? "—"}
          sub={canApprove ? "you can approve" : "needs waswa.approve"} />
        <Stat label="Live corrections" value={summary?.corrections.approved ?? 0} sub="checked before documents" />
        <Stat label="Answers · 30 days" value={answered30}
          sub={answered30 ? `${flagged30} flagged (${Math.round((flagged30 / answered30) * 100)}%)` : "no answers yet"} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E9EDEF] overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`h-9 px-3 text-[12px] font-extrabold bg-transparent cursor-pointer whitespace-nowrap -mb-px
              border-0 border-b-2 border-solid
              ${tab === t.id ? "text-[#075E54] border-[#25D366]" : "text-[#667781] border-transparent hover:text-[#111B21]"}`}>
            {t.label}
            {t.id === "queue" && (summary?.queue_total ?? 0) > 0 && (
              <span className="ml-1.5 rounded-full bg-[#EF4444] text-white text-[10px] px-1.5 py-0.5">{summary?.queue_total}</span>
            )}
          </button>
        ))}
      </div>

      {tabError && <Notice tone="red">{tabError}</Notice>}
      {tabInfo && <Notice tone="green">{tabInfo}</Notice>}

      {/* ── Queue ─────────────────────────────────────────────────────────── */}
      {tab === "queue" && (
        <div className="border border-[#E9EDEF] rounded-xl bg-white divide-y divide-[#E9EDEF]">
          {loading && !queue.length && <Empty>Loading…</Empty>}
          {!loading && !queue.length && <Empty>Nothing is waiting. New flags from any platform will appear here.</Empty>}
          {queue.map((item) => (
            <div key={`${item.item_kind}-${item.item_uid}`} className="px-4 py-3 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <div className="flex items-center gap-1.5 md:w-[190px] shrink-0">
                <Pill tone={kindLabel[item.item_kind].tone}>{kindLabel[item.item_kind].label}</Pill>
                {item.card.badge === "HIC" && <Pill tone="red">2 approvers</Pill>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-extrabold text-[#111B21] truncate">{item.title || "(no question recorded)"}</div>
                <div className="text-[11px] text-[#667781] truncate">
                  {item.item_kind === "flag" ? (item.note ? `“${item.note}”` : item.detail) : item.note || item.detail}
                </div>
              </div>
              <div className="text-[11px] text-[#667781] md:w-[140px] shrink-0">
                {item.surface && <span className="mr-1">{item.surface} ·</span>}{when(item.raised_at)}
              </div>
              <div className="flex gap-1.5 shrink-0">
                {item.item_kind === "document" && canApprove ? (
                  <>
                    <Btn kind="primary" onClick={() => docAction(reviewWaswaSource(item.item_uid, "approve"), `${item.title}: approved.`)}>Approve</Btn>
                    <Btn kind="danger" onClick={() => docAction(reviewWaswaSource(item.item_uid, "reject"), `${item.title}: rejected.`)}>Reject</Btn>
                  </>
                ) : (
                  <Btn kind="blue" onClick={() => openItem(item)}>
                    {item.item_kind === "flag" ? "Review" : "Open"}
                  </Btn>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Corrections ───────────────────────────────────────────────────── */}
      {tab === "answers" && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 min-w-0">
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex flex-wrap gap-2 items-center">
              {ANSWER_FILTERS.map((f) => (
                <button key={f.id || "all"} onClick={() => setAnswerFilter(f.id)}
                  className={`h-8 px-3 rounded-full text-[11px] font-extrabold border cursor-pointer
                    ${answerFilter === f.id ? "bg-[#075E54] text-white border-[#075E54]" : "bg-white text-[#111B21] border-[#E9EDEF] hover:bg-[#F0F2F5]"}`}>
                  {f.label}
                </button>
              ))}
              <input className={`${inputCls} max-w-[220px] h-8 py-0`} placeholder="Search corrections"
                value={answerSearch} onChange={(e) => setAnswerSearch(e.target.value)} />
            </div>

            <div className="border border-[#E9EDEF] rounded-xl bg-white overflow-x-auto">
              <table className="w-full text-[12px] min-w-[640px]">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wide text-[#667781] border-b border-[#E9EDEF]">
                    <th className="px-3 py-2 font-extrabold">Question</th>
                    <th className="px-3 py-2 font-extrabold">Status</th>
                    <th className="px-3 py-2 font-extrabold">Who sees it</th>
                    <th className="px-3 py-2 font-extrabold text-right">Matched</th>
                    <th className="px-3 py-2 font-extrabold">Review by</th>
                  </tr>
                </thead>
                <tbody>
                  {!answers.length && (
                    <tr><td colSpan={5}><Empty>{loading ? "Loading…" : "No corrections here yet."}</Empty></td></tr>
                  )}
                  {answers.map((a) => {
                    const due = a.status === "approved" && a.review_due && new Date(a.review_due) <= new Date();
                    return (
                      <tr key={a.answer_uid} onClick={() => setEditor({ open: true, uid: a.answer_uid })}
                        className="border-b border-[#F0F2F5] last:border-0 hover:bg-[#F8F9FA] cursor-pointer">
                        <td className="px-3 py-2.5 max-w-[360px]">
                          <div className="font-extrabold text-[#111B21] truncate">{a.question}</div>
                          <div className="text-[11px] text-[#667781] truncate">{a.answer}</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            <Pill tone={statusTone[a.status]}>{a.status}</Pill>
                            {a.sensitivity === "policy" && <Pill tone="red">policy</Pill>}
                            {a.needs_recheck && <Pill tone="amber">recheck</Pill>}
                            {a.version > 1 && <Pill>v{a.version}</Pill>}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {a.audience === "everyone" ? "Customers + staff" : "Staff only"}
                          {a.country_scope && <span className="text-[#667781]"> · {a.country_scope}</span>}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{a.match_count}</td>
                        <td className={`px-3 py-2.5 whitespace-nowrap ${due ? "text-[#B91C1C] font-extrabold" : ""}`}>{day(a.review_due)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Match tester */}
          <div className="border border-[#E9EDEF] rounded-xl bg-white p-3 flex flex-col gap-2.5 h-fit">
            <div className="font-black text-[13px] text-[#111B21]">Test a question</div>
            <div className="text-[11px] text-[#667781]">
              See which live correction Waswa would use. Only approved corrections can match.
            </div>
            <input className={inputCls} placeholder="e.g. how do I top up tokens" value={testQ}
              onChange={(e) => setTestQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runTest()} />
            <div className="flex gap-2 items-center">
              <select className={`${inputCls} flex-1`} value={testAudience}
                onChange={(e) => setTestAudience(e.target.value as "everyone" | "staff")}>
                <option value="everyone">As a customer</option>
                <option value="staff">As staff</option>
              </select>
              <Btn kind="blue" onClick={runTest} disabled={!testQ.trim()}>Test</Btn>
            </div>
            {testResult && !testResult.length && (
              <Notice>No live correction matches. Waswa would answer from documents and data.</Notice>
            )}
            {testResult?.map((m) => (
              <button key={m.answer_uid} onClick={() => setEditor({ open: true, uid: m.answer_uid })}
                className="text-left rounded-lg border border-[#E9EDEF] px-2.5 py-2 bg-white hover:bg-[#F8F9FA] cursor-pointer">
                <div className="text-[12px] font-extrabold text-[#111B21]">{m.question}</div>
                <div className="text-[10px] text-[#667781]">matched on {m.matched_on} · score {m.score}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Conversations ─────────────────────────────────────────────────── */}
      {tab === "conversations" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 items-center">
            <select className={`${inputCls} max-w-[180px] h-8 py-0`} value={convSurface} onChange={(e) => setConvSurface(e.target.value)}>
              <option value="">All platforms</option>
              <option value="mobile">OLIWA mobile</option>
              <option value="cms">CMS</option>
              <option value="console">Tracking console</option>
            </select>
            <label className="flex items-center gap-1.5 text-[12px] text-[#111B21] cursor-pointer">
              <input type="checkbox" checked={convFlagged} onChange={(e) => setConvFlagged(e.target.checked)} />
              Only flagged
            </label>
          </div>
          <div className="border border-[#E9EDEF] rounded-xl bg-white divide-y divide-[#E9EDEF]">
            {!convs.length && <Empty>{loading ? "Loading…" : "No conversations match."}</Empty>}
            {convs.map((c) => (
              <button key={c.conversation_uid} onClick={() => setConvView({ open: true, uid: c.conversation_uid })}
                className="w-full text-left px-4 py-3 flex flex-col md:flex-row md:items-center gap-1 md:gap-4 bg-white hover:bg-[#F8F9FA] border-none cursor-pointer">
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-extrabold text-[#111B21] truncate">{c.first_question || "(no question)"}</div>
                  <div className="text-[11px] text-[#667781]">Account {c.account_uid} · {c.messages} messages</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Pill tone="blue">{c.surface}</Pill>
                  {c.flags > 0 && <Pill tone="red">{c.flags} flagged</Pill>}
                  <span className="text-[11px] text-[#667781] w-[110px] text-right">{when(c.last_activity_at)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Documents ─────────────────────────────────────────────────────── */}
      {tab === "documents" && (
        <div className="flex flex-col gap-3">
          <Notice>
            Staff-only documents are never read to customers. Release a document to customers only if
            every part of it is fit for a customer to see. Uploading new documents from here is coming next;
            for now they are loaded by the knowledge ingest script.
          </Notice>
          <div className="border border-[#E9EDEF] rounded-xl bg-white overflow-x-auto">
            <table className="w-full text-[12px] min-w-[720px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-[#667781] border-b border-[#E9EDEF]">
                  <th className="px-3 py-2 font-extrabold">Document</th>
                  <th className="px-3 py-2 font-extrabold">Authority</th>
                  <th className="px-3 py-2 font-extrabold">Review</th>
                  <th className="px-3 py-2 font-extrabold">Who sees it</th>
                  <th className="px-3 py-2 font-extrabold text-right">Passages</th>
                  {canApprove && <th className="px-3 py-2 font-extrabold">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {!sources.length && (
                  <tr><td colSpan={6}><Empty>{loading ? "Loading…" : "No documents loaded."}</Empty></td></tr>
                )}
                {sources.map((s) => (
                  <tr key={s.source_uid} className="border-b border-[#F0F2F5] last:border-0">
                    <td className="px-3 py-2.5 max-w-[320px]">
                      <div className="font-extrabold text-[#111B21] truncate">{s.title}</div>
                      <div className="text-[11px] text-[#667781]">{s.document_type ?? "—"} · loaded {day(s.ingested_at)}</div>
                    </td>
                    <td className="px-3 py-2.5">L{s.authority_level}</td>
                    <td className="px-3 py-2.5"><Pill tone={s.review_status === "approved" ? "green" : s.review_status === "rejected" ? "red" : "amber"}>{s.review_status}</Pill></td>
                    <td className="px-3 py-2.5"><Pill tone={s.audience === "everyone" ? "teal" : "blue"}>{s.audience === "everyone" ? "Customers + staff" : "Staff only"}</Pill></td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{s.chunk_count}</td>
                    {canApprove && (
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1.5">
                          {s.review_status !== "approved" && (
                            <Btn kind="primary" onClick={() => docAction(reviewWaswaSource(s.source_uid, "approve"), `${s.title}: approved.`)}>Approve</Btn>
                          )}
                          {s.review_status === "approved" && (
                            <Btn kind="danger" onClick={() => docAction(reviewWaswaSource(s.source_uid, "reject"), `${s.title}: withdrawn from Waswa.`)}>Withdraw</Btn>
                          )}
                          {s.audience === "staff" ? (
                            <Btn onClick={() => docAction(setWaswaSourceAudience(s.source_uid, "everyone"), `${s.title}: now visible to customers.`)}>Release to customers</Btn>
                          ) : (
                            <Btn onClick={() => docAction(setWaswaSourceAudience(s.source_uid, "staff"), `${s.title}: staff only.`)}>Make staff-only</Btn>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnswerEditor
        open={editor.open}
        answerUid={editor.uid}
        prefill={editor.prefill}
        canApprove={canApprove}
        myAccountUid={myAccountUid}
        onClose={() => setEditor({ open: false, uid: null })}
        onChanged={refreshAll}
      />
      <ConversationView
        open={convView.open}
        conversationUid={convView.uid}
        focusMessageUid={convView.focus}
        onClose={() => setConvView({ open: false, uid: null })}
        onWriteCorrection={(prefill) => {
          setConvView({ open: false, uid: null });
          setEditor({ open: true, uid: null, prefill });
        }}
        onChanged={refreshAll}
      />
    </div>
  );
}
