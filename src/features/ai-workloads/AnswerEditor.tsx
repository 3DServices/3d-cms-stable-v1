/**
 * AnswerEditor — write, submit, approve, recheck or retire one Waswa correction.
 *
 * The backend enforces every rule (no prices, policy = two approvers, no
 * self-approval, approved edits become a new version). This screen shows the
 * rules before they bite and relays the server's message when they do.
 */
import React, { useEffect, useState } from "react";
import {
  confirmWaswaAnswer,
  createWaswaAnswer,
  decideWaswaAnswer,
  getWaswaAnswer,
  retireWaswaAnswer,
  submitWaswaAnswer,
  updateWaswaAnswer,
} from "../../api/services/waswa.service";
import type { WaswaAnswer, WaswaAnswerInput, WaswaAudience } from "../../api/types";
import { Btn, Field, Notice, Pill, SidePanel } from "./parts";
import { day, errText, inputCls, statusTone, when } from "./format";

export interface AnswerPrefill {
  question?: string;
  feedback_uid?: string;
  note?: string;           // the flagger's note, shown for context
  wrongAnswer?: string;    // what Waswa said, shown for context
}

interface Props {
  open: boolean;
  answerUid: string | null;          // null = new correction
  prefill?: AnswerPrefill;
  canApprove: boolean;
  myAccountUid: string | null;
  onClose: () => void;
  onChanged: () => void;             // refresh lists behind the panel
}

const BLANK: WaswaAnswerInput = {
  question: "", question_variants: "", answer: "", audience: "everyone",
  country_scope: "", based_on_note: "", review_due: "",
};

export function AnswerEditor({ open, answerUid, prefill, canApprove, myAccountUid, onClose, onChanged }: Props) {
  const [uid, setUid] = useState<string | null>(answerUid);
  const [answer, setAnswer] = useState<WaswaAnswer | null>(null);
  const [form, setForm] = useState<WaswaAnswerInput>(BLANK);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [decisionNote, setDecisionNote] = useState("");
  const [retireReason, setRetireReason] = useState("");

  useEffect(() => {
    if (!open) return;
    setUid(answerUid);
    setError(null);
    setInfo(null);
    setDecisionNote("");
    setRetireReason("");
    if (!answerUid) {
      setAnswer(null);
      setForm({ ...BLANK, question: prefill?.question ?? "", feedback_uid: prefill?.feedback_uid });
    }
  }, [open, answerUid, prefill]);

  useEffect(() => {
    if (!open || !uid) return;
    getWaswaAnswer(uid)
      .then((res) => {
        const a = res.data;
        setAnswer(a);
        setForm({
          question: a.question,
          question_variants: a.question_variants ?? "",
          answer: a.answer,
          audience: a.audience,
          country_scope: a.country_scope ?? "",
          based_on_note: a.based_on_note ?? "",
          review_due: a.review_due ?? "",
        });
      })
      .catch((e) => setError(errText(e)));
  }, [open, uid]);

  const set = (key: keyof WaswaAnswerInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const run = async (label: string, work: () => Promise<{ data: WaswaAnswer }>) => {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await work();
      setAnswer(res.data);
      setUid(res.data.answer_uid);
      setInfo(label);
      onChanged();
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  };

  const payload = (): WaswaAnswerInput => {
    const out: WaswaAnswerInput = {};
    (Object.keys(form) as (keyof WaswaAnswerInput)[]).forEach((k) => {
      const v = form[k];
      if (v !== undefined && v !== "") (out as Record<string, unknown>)[k] = v;
    });
    return out;
  };

  const status = answer?.status;
  const isAuthor = !!answer && !!myAccountUid && answer.authored_by === myAccountUid;
  const editable = !answer || ["draft", "rejected", "pending", "approved"].includes(status ?? "");
  const due = answer?.review_due && new Date(answer.review_due) <= new Date();

  const save = () => run(
    answer ? (status === "approved" ? "Saved as a new version — the live one stays until this is approved." : "Draft saved.") : "Draft created.",
    () => (answer ? updateWaswaAnswer(answer.answer_uid, payload()) : createWaswaAnswer(payload())),
  );

  const title = !answer ? "New correction"
    : `Correction v${answer.version}`;

  const footer = (
    <>
      {editable && (
        <Btn onClick={save} disabled={busy || !form.question?.trim() || !form.answer?.trim()}>
          {answer?.status === "approved" ? "Save as new version" : "Save draft"}
        </Btn>
      )}
      {answer && ["draft", "rejected"].includes(answer.status) && (
        <Btn kind="blue" disabled={busy} onClick={() => run("Submitted for approval.", () => submitWaswaAnswer(answer.answer_uid))}>
          Submit for approval
        </Btn>
      )}
      {answer?.status === "pending" && canApprove && !isAuthor && (
        <>
          <Btn kind="danger" disabled={busy || !decisionNote.trim()}
            onClick={() => run("Rejected.", () => decideWaswaAnswer(answer.answer_uid, "reject", decisionNote))}>
            Reject
          </Btn>
          <Btn kind="primary" disabled={busy}
            onClick={() => run("Approval recorded.", () => decideWaswaAnswer(answer.answer_uid, "approve", decisionNote || undefined))}>
            Approve
          </Btn>
        </>
      )}
      {answer?.status === "approved" && canApprove && (answer.needs_recheck || due) && (
        <Btn kind="primary" disabled={busy}
          onClick={() => run("Confirmed — review date moved on.", () => confirmWaswaAnswer(answer.answer_uid, undefined, decisionNote || undefined))}>
          Still correct
        </Btn>
      )}
    </>
  );

  return (
    <SidePanel open={open} title={title} onClose={onClose} footer={footer}>
      {error && <Notice tone="red">{error}</Notice>}
      {info && <Notice tone="green">{info}</Notice>}

      {answer && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Pill tone={statusTone[answer.status]}>{answer.status}</Pill>
          <Pill tone={answer.sensitivity === "policy" ? "red" : "grey"}>
            {answer.sensitivity === "policy" ? "Policy · 2 approvers" : "Routine · 1 approver"}
          </Pill>
          <Pill tone={answer.audience === "everyone" ? "teal" : "blue"}>
            {answer.audience === "everyone" ? "Customers + staff" : "Staff only"}
          </Pill>
          {answer.status === "pending" && (
            <Pill tone="amber">{answer.approvals ?? 0}/{answer.approvals_required} approvals</Pill>
          )}
          {answer.status === "approved" && <Pill tone="grey">Matched {answer.match_count}×</Pill>}
          {answer.status === "approved" && <Pill tone={due ? "red" : "grey"}>Review {day(answer.review_due)}</Pill>}
        </div>
      )}

      {answer?.needs_recheck && (
        <Notice tone="amber"><b>Recheck needed:</b> {answer.recheck_reason}</Notice>
      )}
      {answer?.status === "pending" && isAuthor && (
        <Notice>You wrote this, so someone else has to approve it.</Notice>
      )}
      {answer?.status === "pending" && !canApprove && (
        <Notice>Waiting for someone with the waswa.approve permission.</Notice>
      )}
      {answer?.status === "approved" && (
        <Notice>This answer is live. Editing it creates a new version; this one keeps answering until the new version is approved.</Notice>
      )}
      {answer?.status === "pending" && (
        <Notice tone="amber">Editing a submitted correction returns it to draft and clears its approvals.</Notice>
      )}

      {prefill?.wrongAnswer && !answer && (
        <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2">
          <div className="text-[10px] font-extrabold text-[#B91C1C] uppercase mb-1">What Waswa said</div>
          <div className="text-[12px] text-[#111B21] whitespace-pre-wrap line-clamp-6">{prefill.wrongAnswer}</div>
          {prefill.note && <div className="text-[11px] text-[#B91C1C] mt-1.5"><b>Flag note:</b> {prefill.note}</div>}
        </div>
      )}

      <Field label="Question" hint="Phrase it the way people actually ask.">
        <input className={inputCls} value={form.question ?? ""} onChange={set("question")} disabled={!editable || busy} />
      </Field>
      <Field label="Other ways people ask it" hint="One per line. These make the correction easier to find.">
        <textarea className={inputCls} rows={3} value={form.question_variants ?? ""} onChange={set("question_variants")} disabled={!editable || busy} />
      </Field>
      <Field label="Correct answer" hint="Plain language. Never include prices or currency amounts — they are refused.">
        <textarea className={inputCls} rows={7} value={form.answer ?? ""} onChange={set("answer")} disabled={!editable || busy} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Who can see it">
          <select className={inputCls} value={form.audience ?? "everyone"}
            onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value as WaswaAudience }))}
            disabled={!editable || busy}>
            <option value="everyone">Customers and staff</option>
            <option value="staff">Staff only</option>
          </select>
        </Field>
        <Field label="Country" hint="Leave blank for all countries.">
          <input className={inputCls} placeholder="e.g. Uganda" value={form.country_scope ?? ""} onChange={set("country_scope")} disabled={!editable || busy} />
        </Field>
        <Field label="Based on" hint="Where this comes from, e.g. Sales Procedures §26.6">
          <input className={inputCls} value={form.based_on_note ?? ""} onChange={set("based_on_note")} disabled={!editable || busy} />
        </Field>
        <Field label="Review by" hint="Defaults to 6 months after approval.">
          <input type="date" className={inputCls} value={(form.review_due ?? "").slice(0, 10)} onChange={set("review_due")} disabled={!editable || busy} />
        </Field>
      </div>

      {answer && (answer.status === "pending" || (answer.status === "approved" && (answer.needs_recheck || due))) && canApprove && (
        <Field label={answer.status === "pending" ? "Decision note" : "Confirmation note"}
               hint={answer.status === "pending" ? "Required to reject — tell the author what to fix." : undefined}>
          <textarea className={inputCls} rows={2} value={decisionNote} onChange={(e) => setDecisionNote(e.target.value)} disabled={busy} />
        </Field>
      )}

      {answer && answer.decisions && answer.decisions.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="text-[11px] font-extrabold text-[#111B21]">Decisions</div>
          {answer.decisions.map((d, i) => (
            <div key={i} className="text-[11px] text-[#667781]">
              <Pill tone={d.decision === "approve" ? "green" : "red"}>{d.decision}</Pill>{" "}
              {d.by} · {when(d.at)}{d.note ? ` — ${d.note}` : ""}
            </div>
          ))}
        </div>
      )}

      {answer && (
        <div className="text-[10px] text-[#667781] leading-relaxed">
          Written by {answer.authored_by} · created {when(answer.created_at)}
          {answer.approved_at && <> · approved {when(answer.approved_at)}</>}
          {answer.retired_at && <> · retired {when(answer.retired_at)} ({answer.retired_reason})</>}
        </div>
      )}

      {answer && answer.status !== "retired" && (
        <div className="border-t border-[#E9EDEF] pt-3 flex flex-col gap-2">
          <Field label="Retire this correction" hint="It stops being used immediately. The history is kept.">
            <input className={inputCls} placeholder="Reason, e.g. policy changed" value={retireReason} onChange={(e) => setRetireReason(e.target.value)} disabled={busy} />
          </Field>
          <div>
            <Btn kind="danger" disabled={busy || !retireReason.trim()}
              onClick={() => run("Retired.", () => retireWaswaAnswer(answer.answer_uid, retireReason))}>
              Retire
            </Btn>
          </div>
        </div>
      )}
    </SidePanel>
  );
}
