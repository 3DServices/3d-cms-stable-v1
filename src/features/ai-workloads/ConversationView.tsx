/**
 * ConversationView — one Waswa conversation, with the evidence behind each
 * answer and any flags on it. This is where a reviewer decides what went wrong:
 * missing knowledge (write a correction), an outdated document, wrong data, or
 * nothing (dismiss).
 */
import React, { useEffect, useState } from "react";
import { getWaswaConversation, resolveWaswaFeedback } from "../../api/services/waswa.service";
import type { WaswaConversation, WaswaEvidence, WaswaMessage, WaswaMessageFeedback, WaswaResolution } from "../../api/types";
import type { AnswerPrefill } from "./AnswerEditor";
import { Btn, Notice, Pill, SidePanel } from "./parts";
import { errText, inputCls, statusTone, when } from "./format";

interface Props {
  open: boolean;
  conversationUid: string | null;
  focusMessageUid?: string | null;
  onClose: () => void;
  onWriteCorrection: (prefill: AnswerPrefill) => void;
  onChanged: () => void;
}

const kindText: Record<string, string> = {
  account_context: "Live account data",
  tool: "Product catalogue",
  document: "Company document",
  verified_answer: "Verified answer",
};

function EvidenceList({ items }: { items: WaswaEvidence[] }) {
  if (!items.length) return <div className="text-[10px] text-[#667781]">No sources recorded.</div>;
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((e, i) => (
        <li key={i} className="text-[10px] text-[#667781] flex gap-1.5">
          <span className="font-extrabold text-[#111B21] shrink-0">{kindText[e.source_kind] ?? e.source_kind}</span>
          <span className="truncate" title={e.source_ref}>{e.source_ref}</span>
          {e.authority_level != null && <span className="shrink-0">· L{e.authority_level}</span>}
        </li>
      ))}
    </ul>
  );
}

export function ConversationView({ open, conversationUid, focusMessageUid, onClose, onWriteCorrection, onChanged }: Props) {
  const [conv, setConv] = useState<WaswaConversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const load = () => {
    if (!conversationUid) return;
    getWaswaConversation(conversationUid)
      .then((res) => setConv(res.data))
      .catch((e) => setError(errText(e)));
  };

  useEffect(() => {
    if (!open) return;
    setConv(null);
    setError(null);
    setInfo(null);
    setNotes({});
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, conversationUid]);

  const questionFor = (msg: WaswaMessage): string => {
    if (!conv) return "";
    const prior = conv.messages.filter((m) => m.role === "user" && m.turn_index < msg.turn_index);
    return prior.length ? prior[prior.length - 1].content : "";
  };

  const resolve = async (fb: WaswaMessageFeedback, resolution: WaswaResolution) => {
    setBusy(true);
    setError(null);
    try {
      await resolveWaswaFeedback(fb.feedback_uid, resolution, notes[fb.feedback_uid] || undefined);
      setInfo(resolution === "dismissed" ? "Flag dismissed." : "Flag resolved.");
      onChanged();
      load();
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SidePanel open={open} title="Conversation" onClose={onClose}>
      {error && <Notice tone="red">{error}</Notice>}
      {info && <Notice tone="green">{info}</Notice>}
      {!conv && !error && <div className="text-[12px] text-[#667781]">Loading…</div>}

      {conv && (
        <div className="flex flex-wrap gap-1.5 text-[11px] text-[#667781] items-center">
          <Pill tone="blue">{conv.surface}</Pill>
          <span>Account {conv.account_uid}</span>
          <span>· started {when(conv.started_at)}</span>
        </div>
      )}

      {conv?.messages.map((m) => {
        const focused = m.message_uid === focusMessageUid;
        const openFlags = m.feedback.filter((f) => f.verdict !== "good" && ["open", "in_review"].includes(f.status));
        return (
          <div key={m.message_uid}
            className={`flex flex-col gap-1.5 ${m.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`
              max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed whitespace-pre-wrap
              ${m.role === "user" ? "bg-[#25D366] text-white rounded-br-sm" : "bg-[#F0F2F5] text-[#111B21] rounded-bl-sm"}
              ${focused ? "ring-2 ring-[#EF4444]" : ""}
            `}>
              {m.content}
            </div>

            {m.role === "assistant" && (
              <div className="w-[90%] flex flex-col gap-1.5">
                <div className="flex flex-wrap gap-1.5 items-center text-[10px] text-[#667781]">
                  {m.blocked_reason && <Pill tone="amber">{m.blocked_reason.replace(/_/g, " ")}</Pill>}
                  {m.prompt_version != null && <span>prompt v{m.prompt_version}</span>}
                  {m.latency_ms != null && <span>· {(m.latency_ms / 1000).toFixed(1)}s</span>}
                  <span>· {when(m.created_at)}</span>
                </div>
                <EvidenceList items={m.evidence} />

                {m.feedback.map((f) => (
                  <div key={f.feedback_uid} className="rounded-lg border border-[#E9EDEF] px-2.5 py-2 flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <Pill tone={f.verdict === "good" ? "green" : "red"}>{f.verdict}</Pill>
                      <Pill tone={statusTone[f.status] ?? "grey"}>{f.status.replace("_", " ")}</Pill>
                      <span className="text-[#667781]">by {f.by} · {when(f.at)}</span>
                    </div>
                    {f.note && <div className="text-[12px] text-[#111B21]">“{f.note}”</div>}
                    {f.resolution && f.status !== "open" && f.status !== "in_review" && (
                      <div className="text-[10px] text-[#667781]">Resolution: {f.resolution.replace("_", " ")}</div>
                    )}
                  </div>
                ))}

                {openFlags.map((f) => (
                  <div key={`act-${f.feedback_uid}`} className="flex flex-col gap-1.5">
                    <input
                      className={inputCls}
                      placeholder="Note — required to dismiss"
                      value={notes[f.feedback_uid] ?? ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [f.feedback_uid]: e.target.value }))}
                      disabled={busy}
                    />
                    <div className="flex flex-wrap gap-1.5">
                      <Btn kind="primary" disabled={busy}
                        onClick={() => onWriteCorrection({
                          question: questionFor(m), feedback_uid: f.feedback_uid,
                          note: f.note ?? undefined, wrongAnswer: m.content,
                        })}>
                        Write correction
                      </Btn>
                      <Btn disabled={busy} onClick={() => resolve(f, "document")}>Fixed in a document</Btn>
                      <Btn disabled={busy} onClick={() => resolve(f, "data_fix")}>Data fixed</Btn>
                      <Btn kind="danger" disabled={busy || !(notes[f.feedback_uid] ?? "").trim()}
                        onClick={() => resolve(f, "dismissed")}>
                        Dismiss
                      </Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </SidePanel>
  );
}
