/**
 * DocumentsTab — what Waswa may read, managed by product managers, the CEO and
 * administrators.
 *
 *   Upload        PDF, Word, Excel, Markdown or text. Lands "pending": Waswa
 *                 cannot use it until someone other than the uploader approves.
 *   New version   upload against an existing document. The old version keeps
 *                 answering until the new one is approved, then retires.
 *   Remove        Waswa stops using it at once. Reversible; nothing is deleted.
 *   Details       title, type, authority level, version label.
 *
 * Currency amounts are withheld on upload (Waswa never states prices); the
 * upload result says what was withheld.
 */
import React, { useCallback, useEffect, useState } from "react";
import {
  getWaswaAuthorityLevels,
  getWaswaSource,
  getWaswaSources,
  removeWaswaSource,
  restoreWaswaSource,
  reviewWaswaSource,
  setWaswaSourceAudience,
  updateWaswaSourceDetails,
  uploadWaswaSource,
} from "../../api/services/waswa.service";
import type {
  WaswaAudience,
  WaswaAuthorityLevel,
  WaswaSource,
  WaswaSourceDetail,
  WaswaUploadCheck,
  WaswaUploadResult,
} from "../../api/types";
import { Btn, Empty, Field, Notice, Pill, SidePanel } from "./parts";
import { day, errText, inputCls, when } from "./format";

interface Props {
  canApprove: boolean;
  myAccountUid: string | null;
  onChanged: () => void;
  /** Open this document's panel on arrival (from the review queue). */
  openSourceUid?: string | null;
  onOpened?: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  procedure: "Procedure", policy: "Policy", manual: "User manual", faq: "FAQ",
  strategy: "Strategy", user_stories: "User stories", kpi: "KPI definitions",
  journey_map: "Journey map", catalogue: "Catalogue", other: "Other",
};

function reviewTone(s: WaswaSource): "green" | "red" | "amber" | "grey" {
  if (!s.active) return "grey";
  return s.review_status === "approved" ? "green" : s.review_status === "rejected" ? "red" : "amber";
}

function reviewLabel(s: WaswaSource): string {
  if (!s.active) return "removed";
  if (s.superseded_by) return "older version";
  return s.review_status === "pending" ? "awaiting approval" : s.review_status;
}

// ── Upload panel ─────────────────────────────────────────────────────────────

function UploadPanel({
  open, replaces, levels, types, maxMb, accept, onClose, onDone,
}: {
  open: boolean;
  replaces: WaswaSource | null;
  levels: WaswaAuthorityLevel[];
  types: string[];
  maxMb: number;
  accept: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("other");
  const [level, setLevel] = useState<number>(4);
  const [audience, setAudience] = useState<WaswaAudience>("staff");
  const [versionLabel, setVersionLabel] = useState("");
  const [docDate, setDocDate] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WaswaUploadResult | null>(null);

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setTitle(replaces?.title ?? "");
    setDocType(replaces?.document_type ?? "other");
    setLevel(replaces?.authority_level ?? 4);
    setAudience(replaces?.audience ?? "staff");
    setVersionLabel("");
    setDocDate("");
    setNotes("");
    setError(null);
    setResult(null);
  }, [open, replaces]);

  const submit = async () => {
    if (!file) return;
    if (file.size > maxMb * 1024 * 1024) {
      setError(`The file is larger than ${maxMb} MB.`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await uploadWaswaSource(file, {
        title: title.trim() || undefined,
        document_type: docType,
        authority_level: level,
        audience,
        version_label: versionLabel.trim() || undefined,
        document_date: docDate || undefined,
        notes: notes.trim() || undefined,
        replaces_source_uid: replaces?.source_uid,
      });
      setResult(res.data);
      onDone();
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  };

  const chosen = levels.find((l) => l.level === level);

  return (
    <SidePanel
      open={open}
      title={replaces ? `New version of "${replaces.title}"` : "Upload a document"}
      onClose={onClose}
      footer={result ? <Btn kind="primary" onClick={onClose}>Done</Btn> : (
        <>
          <Btn onClick={onClose} disabled={busy}>Cancel</Btn>
          <Btn kind="primary" onClick={submit} disabled={busy || !file}>
            {busy ? "Uploading…" : "Upload for review"}
          </Btn>
        </>
      )}
    >
      {error && <Notice tone="red">{error}</Notice>}

      {result ? (
        <>
          <Notice tone="green">
            <b>{result.title}</b> uploaded — {result.chunk_count} passage{result.chunk_count === 1 ? "" : "s"}. It is <b>awaiting approval</b>:
            Waswa won't use it until someone other than you approves it in the Review queue.
            {replaces && " The current version keeps answering until then."}
          </Notice>
          {result.withheld.length > 0 && (
            <Notice tone="amber">
              {result.withheld.length} price{result.withheld.length === 1 ? " was" : "s were"} withheld
              (Waswa never states prices): {result.withheld.join(", ")}
            </Notice>
          )}
          <div className="flex flex-col gap-2">
            <div className="text-[11px] font-extrabold text-[#111B21]">How Waswa will read it (first passages)</div>
            {result.preview.map((p, i) => (
              <div key={i} className="rounded-lg border border-[#E9EDEF] px-3 py-2">
                {p.heading && <div className="text-[10px] font-extrabold text-[#667781] mb-1">{p.heading}</div>}
                <div className="text-[12px] text-[#111B21] whitespace-pre-wrap line-clamp-6">{p.text}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {replaces && (
            <Notice>
              The new file replaces this document once it is approved. Until then Waswa keeps answering
              from the current version, and any corrections based on it will be flagged for a recheck.
            </Notice>
          )}
          <Field label="File" hint={`PDF, Word (.docx), Excel (.xlsx), Markdown or text · up to ${maxMb} MB. Scanned PDFs without selectable text can't be read.`}>
            <input
              type="file"
              accept={accept}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              disabled={busy}
              className="text-[12px]"
            />
          </Field>
          <Field label="Title" hint={replaces ? "Leave as is to keep the same title." : "Leave blank to use the file name."}>
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} disabled={busy} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Type of document">
              <select className={inputCls} value={docType} onChange={(e) => setDocType(e.target.value)} disabled={busy}>
                {types.map((t) => <option key={t} value={t}>{TYPE_LABEL[t] ?? t}</option>)}
              </select>
            </Field>
            <Field label="Version / edition" hint="e.g. v26.2 or March 2026">
              <input className={inputCls} value={versionLabel} onChange={(e) => setVersionLabel(e.target.value)} disabled={busy} />
            </Field>
          </div>
          <Field label="How authoritative is it?" hint={chosen?.description}>
            <select className={inputCls} value={level} onChange={(e) => setLevel(Number(e.target.value))} disabled={busy}>
              {levels.filter((l) => l.uploadable).map((l) => (
                <option key={l.level} value={l.level}>
                  Level {l.level} — {l.label}{l.may_quote ? "" : " (Waswa may not quote it)"}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Who can Waswa answer from it?">
            <div className="flex flex-col gap-1.5 text-[12px]">
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="radio" checked={audience === "staff"} onChange={() => setAudience("staff")} disabled={busy} />
                <span><b>Staff only</b> — internal procedures, strategy, pricing policy.</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="radio" checked={audience === "everyone"} onChange={() => setAudience("everyone")} disabled={busy} />
                <span><b>Customers and staff</b> — only if every part of it is fit for a customer to read.</span>
              </label>
            </div>
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Document date">
              <input type="date" className={inputCls} value={docDate} onChange={(e) => setDocDate(e.target.value)} disabled={busy} />
            </Field>
          </div>
          <Field label="Notes for the approver">
            <textarea className={inputCls} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={busy} />
          </Field>
        </>
      )}
    </SidePanel>
  );
}

// ── Document panel ───────────────────────────────────────────────────────────

function DocumentPanel({
  open, sourceUid, levels, types, canApprove, myAccountUid, onClose, onNewVersion, onChanged,
}: {
  open: boolean;
  sourceUid: string | null;
  levels: WaswaAuthorityLevel[];
  types: string[];
  canApprove: boolean;
  myAccountUid: string | null;
  onClose: () => void;
  onNewVersion: (doc: WaswaSource) => void;
  onChanged: () => void;
}) {
  const [doc, setDoc] = useState<WaswaSourceDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState({ title: "", document_type: "other", authority_level: 4, version_label: "" });

  const load = useCallback(() => {
    if (!sourceUid) return;
    getWaswaSource(sourceUid)
      .then((r) => {
        setDoc(r.data);
        setEdit({
          title: r.data.title, document_type: r.data.document_type ?? "other",
          authority_level: r.data.authority_level, version_label: r.data.version_label ?? "",
        });
      })
      .catch((e) => setError(errText(e)));
  }, [sourceUid]);

  useEffect(() => {
    if (!open) return;
    setDoc(null); setError(null); setInfo(null); setReason(""); setNote(""); setEditing(false);
    load();
  }, [open, load]);

  const act = async (label: string, work: () => Promise<unknown>) => {
    setBusy(true); setError(null); setInfo(null);
    try {
      await work();
      setInfo(label);
      onChanged();
      load();
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  };

  const isUploader = !!doc && !!myAccountUid && doc.ingested_by === myAccountUid;
  const pending = doc?.active && doc.review_status === "pending";
  const levelInfo = levels.find((l) => l.level === doc?.authority_level);

  const footer = doc && (
    <>
      {doc.active && !doc.superseded_by && (
        <Btn onClick={() => onNewVersion(doc)} disabled={busy}>Upload new version</Btn>
      )}
      {pending && canApprove && !isUploader && (
        <>
          <Btn kind="danger" disabled={busy || !note.trim()}
            onClick={() => act("Rejected.", () => reviewWaswaSource(doc.source_uid, "reject", note))}>Reject</Btn>
          <Btn kind="primary" disabled={busy}
            onClick={() => act(doc.replaces_source_uid ? "Approved — the previous version is now retired." : "Approved — Waswa can now use it.",
              () => reviewWaswaSource(doc.source_uid, "approve", note || undefined))}>Approve</Btn>
        </>
      )}
      {!doc.active && canApprove && !doc.superseded_by && (
        <Btn kind="primary" disabled={busy} onClick={() => act("Restored.", () => restoreWaswaSource(doc.source_uid))}>Restore</Btn>
      )}
    </>
  );

  return (
    <SidePanel open={open} title={doc?.title ?? "Document"} onClose={onClose} footer={footer}>
      {error && <Notice tone="red">{error}</Notice>}
      {info && <Notice tone="green">{info}</Notice>}
      {!doc && !error && <div className="text-[12px] text-[#667781]">Loading…</div>}

      {doc && (
        <>
          <div className="flex flex-wrap gap-1.5">
            <Pill tone={reviewTone(doc)}>{reviewLabel(doc)}</Pill>
            <Pill tone={doc.audience === "everyone" ? "teal" : "blue"}>{doc.audience === "everyone" ? "Customers + staff" : "Staff only"}</Pill>
            <Pill>L{doc.authority_level} · {levelInfo?.label ?? ""}</Pill>
            <Pill>{TYPE_LABEL[doc.document_type ?? ""] ?? doc.document_type}</Pill>
            {doc.version_label && <Pill>{doc.version_label}</Pill>}
          </div>

          <div className="text-[11px] text-[#667781] leading-relaxed">
            {doc.original_filename && <>File: {doc.original_filename} · </>}
            {doc.chunk_count} passages · uploaded {when(doc.ingested_at)} by {doc.ingested_by ?? "—"}
            {doc.reviewed_at && <> · {doc.review_status} {when(doc.reviewed_at)} by {doc.reviewed_by}</>}
            {doc.redactions > 0 && <> · {doc.redactions} price{doc.redactions === 1 ? "" : "s"} withheld</>}
          </div>

          {!doc.active && (
            <Notice tone="amber">Removed {when(doc.removed_at)} by {doc.removed_by}: {doc.removed_reason}. Waswa does not use it.</Notice>
          )}
          {doc.superseded_by && <Notice>A newer version has replaced this one. Waswa no longer uses it.</Notice>}
          {doc.replaces_source_uid && pending && (
            <Notice>This is a new version. The current version keeps answering until this is approved.</Notice>
          )}
          {pending && isUploader && <Notice>You uploaded this, so someone else has to approve it.</Notice>}
          {pending && !canApprove && <Notice>Waiting for someone with the waswa.approve permission.</Notice>}
          {doc.newer_versions.filter((v) => v.active && v.review_status === "pending").map((v) => (
            <Notice key={v.source_uid} tone="amber">A new version is awaiting approval (uploaded {when(v.ingested_at)}).</Notice>
          ))}
          {doc.corrections_relying > 0 && (
            <Notice>{doc.corrections_relying} live correction{doc.corrections_relying === 1 ? " relies" : "s rely"} on this document and will be flagged for recheck if it changes.</Notice>
          )}
          {doc.notes && <div className="text-[12px] text-[#111B21]"><b>Notes:</b> {doc.notes}</div>}

          {pending && canApprove && !isUploader && (
            <Field label="Decision note" hint="Required to reject — tell the uploader what to fix.">
              <textarea className={inputCls} rows={2} value={note} onChange={(e) => setNote(e.target.value)} disabled={busy} />
            </Field>
          )}

          {canApprove && doc.active && !doc.superseded_by && (
            <div className="flex flex-wrap gap-2 items-center">
              {doc.audience === "staff" ? (
                <Btn disabled={busy} onClick={() => act("Now visible to customers.", () => setWaswaSourceAudience(doc.source_uid, "everyone"))}>Release to customers</Btn>
              ) : (
                <Btn disabled={busy} onClick={() => act("Now staff only.", () => setWaswaSourceAudience(doc.source_uid, "staff"))}>Make staff-only</Btn>
              )}
              <Btn disabled={busy} onClick={() => setEditing((v) => !v)}>{editing ? "Close details" : "Edit details"}</Btn>
            </div>
          )}

          {editing && (
            <div className="rounded-lg border border-[#E9EDEF] p-3 flex flex-col gap-3">
              <Field label="Title">
                <input className={inputCls} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} disabled={busy} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Type">
                  <select className={inputCls} value={edit.document_type} onChange={(e) => setEdit({ ...edit, document_type: e.target.value })} disabled={busy}>
                    {types.map((t) => <option key={t} value={t}>{TYPE_LABEL[t] ?? t}</option>)}
                  </select>
                </Field>
                <Field label="Version / edition">
                  <input className={inputCls} value={edit.version_label} onChange={(e) => setEdit({ ...edit, version_label: e.target.value })} disabled={busy} />
                </Field>
              </div>
              <Field label="Authority level" hint={levels.find((l) => l.level === edit.authority_level)?.description}>
                <select className={inputCls} value={edit.authority_level} onChange={(e) => setEdit({ ...edit, authority_level: Number(e.target.value) })} disabled={busy}>
                  {levels.filter((l) => l.uploadable).map((l) => (
                    <option key={l.level} value={l.level}>Level {l.level} — {l.label}{l.may_quote ? "" : " (not quotable)"}</option>
                  ))}
                </select>
              </Field>
              <div>
                <Btn kind="primary" disabled={busy || !edit.title.trim()}
                  onClick={() => act("Details saved.", () => updateWaswaSourceDetails(doc.source_uid, edit))}>Save details</Btn>
              </div>
            </div>
          )}

          {canApprove && doc.active && (
            <div className="border-t border-[#E9EDEF] pt-3 flex flex-col gap-2">
              <Field label="Remove this document" hint="Waswa stops using it immediately. Nothing is deleted and it can be restored.">
                <input className={inputCls} placeholder="Reason, e.g. policy withdrawn" value={reason} onChange={(e) => setReason(e.target.value)} disabled={busy} />
              </Field>
              <div>
                <Btn kind="danger" disabled={busy || !reason.trim()}
                  onClick={() => act("Removed — Waswa no longer uses it.", () => removeWaswaSource(doc.source_uid, reason))}>Remove</Btn>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="text-[11px] font-extrabold text-[#111B21]">
              What Waswa reads {doc.passages.length < doc.chunk_count && `(first ${doc.passages.length} of ${doc.chunk_count} passages)`}
            </div>
            {doc.passages.map((p) => (
              <div key={p.ordinal} className="rounded-lg border border-[#E9EDEF] px-3 py-2">
                <div className="text-[10px] font-extrabold text-[#667781] mb-1">
                  {p.heading || "—"}{p.pages ? ` · p.${p.pages}` : ""}
                </div>
                <div className="text-[12px] text-[#111B21] whitespace-pre-wrap line-clamp-5">{p.text}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </SidePanel>
  );
}

// ── Tab ──────────────────────────────────────────────────────────────────────

export function DocumentsTab({ canApprove, myAccountUid, onChanged, openSourceUid, onOpened }: Props) {
  const [sources, setSources] = useState<WaswaSource[]>([]);
  const [types, setTypes] = useState<string[]>(Object.keys(TYPE_LABEL));
  const [maxMb, setMaxMb] = useState(25);
  const [accept, setAccept] = useState(".pdf,.docx,.xlsx,.md,.txt");
  const [levels, setLevels] = useState<WaswaAuthorityLevel[]>([]);
  const [check, setCheck] = useState<WaswaUploadCheck | null>(null);
  const [showRemoved, setShowRemoved] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upload, setUpload] = useState<{ open: boolean; replaces: WaswaSource | null }>({ open: false, replaces: null });
  const [panel, setPanel] = useState<string | null>(openSourceUid ?? null);
  useEffect(() => { if (openSourceUid) onOpened?.(); }, [openSourceUid, onOpened]);

  const load = useCallback(() => {
    getWaswaSources({ includeRemoved: showRemoved, includeOld: showOld })
      .then((r) => {
        setSources(r.data.sources);
        if (r.data.document_types?.length) setTypes(r.data.document_types);
        if (r.data.max_upload_mb) setMaxMb(r.data.max_upload_mb);
        if (r.data.allowed_extensions?.length) setAccept(r.data.allowed_extensions.join(","));
        setCheck(r.data.upload_check ?? null);
        setError(null);
        setLoading(false);
      })
      .catch((e) => { setError(errText(e)); setLoading(false); });
  }, [showRemoved, showOld]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    getWaswaAuthorityLevels().then((r) => setLevels(r.data.levels)).catch(() => {});
  }, []);

  const changed = () => { load(); onChanged(); };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-3 items-center text-[12px] text-[#111B21]">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={showRemoved} onChange={(e) => setShowRemoved(e.target.checked)} /> Show removed
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={showOld} onChange={(e) => setShowOld(e.target.checked)} /> Show older versions
          </label>
        </div>
        <Btn kind="primary" onClick={() => setUpload({ open: true, replaces: null })}>Upload document</Btn>
      </div>

      {error && <Notice tone="red">{error}</Notice>}
      {check && !check.storage_writable && (
        <Notice tone="red">
          Uploads will fail: the API server can't write to its upload folder
          (<code className="font-mono">{check.storage_path}</code>). Give the API process write access to it.
        </Notice>
      )}
      {check && (!check.pdf || !check.xlsx) && (
        <Notice tone="amber">
          {!check.pdf && <>PDF uploads need the <b>pdfplumber</b> package on the API server. </>}
          {!check.xlsx && <>Excel uploads need the <b>openpyxl</b> package on the API server. </>}
          Install with <code className="font-mono">pip install {[!check.pdf && "pdfplumber", !check.xlsx && "openpyxl"].filter(Boolean).join(" ")}</code> and
          restart the API. Word, Markdown and text files work now.
        </Notice>
      )}

      <div className="border border-[#E9EDEF] rounded-xl bg-white overflow-x-auto">
        <table className="w-full text-[12px] min-w-[760px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wide text-[#667781] border-b border-[#E9EDEF]">
              <th className="px-3 py-2 font-extrabold">Document</th>
              <th className="px-3 py-2 font-extrabold">Status</th>
              <th className="px-3 py-2 font-extrabold">Who sees it</th>
              <th className="px-3 py-2 font-extrabold">Authority</th>
              <th className="px-3 py-2 font-extrabold text-right">Passages</th>
              <th className="px-3 py-2 font-extrabold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!sources.length && (
              <tr><td colSpan={6}><Empty>{loading ? "Loading…" : error ? "Documents could not be loaded." : "No documents yet. Upload the first one."}</Empty></td></tr>
            )}
            {sources.map((s) => (
              <tr key={s.source_uid} className={`border-b border-[#F0F2F5] last:border-0 ${s.active && !s.superseded_by ? "" : "opacity-60"}`}>
                <td className="px-3 py-2.5 max-w-[340px]">
                  <button onClick={() => setPanel(s.source_uid)}
                    className="text-left bg-transparent border-none p-0 cursor-pointer">
                    <div className="font-extrabold text-[#111B21] truncate hover:underline">{s.title}</div>
                  </button>
                  <div className="text-[11px] text-[#667781] truncate">
                    {TYPE_LABEL[s.document_type ?? ""] ?? s.document_type ?? "—"}
                    {s.version_label && ` · ${s.version_label}`}
                    {" · "}{day(s.ingested_at)}
                    {s.replaces_source_uid && " · new version"}
                  </div>
                </td>
                <td className="px-3 py-2.5"><Pill tone={reviewTone(s)}>{reviewLabel(s)}</Pill></td>
                <td className="px-3 py-2.5 whitespace-nowrap">{s.audience === "everyone" ? "Customers + staff" : "Staff only"}</td>
                <td className="px-3 py-2.5">L{s.authority_level}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{s.chunk_count}</td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    <Btn onClick={() => setPanel(s.source_uid)}>Open</Btn>
                    {s.active && !s.superseded_by && (
                      <Btn onClick={() => setUpload({ open: true, replaces: s })}>New version</Btn>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!canApprove && (
        <Notice>You can upload documents and new versions. Approving, removing and changing who can see a
          document needs the waswa.approve permission.</Notice>
      )}

      <UploadPanel
        open={upload.open}
        replaces={upload.replaces}
        levels={levels}
        types={types}
        maxMb={maxMb}
        accept={accept}
        onClose={() => setUpload({ open: false, replaces: null })}
        onDone={changed}
      />
      <DocumentPanel
        open={!!panel}
        sourceUid={panel}
        levels={levels}
        types={types}
        canApprove={canApprove}
        myAccountUid={myAccountUid}
        onClose={() => setPanel(null)}
        onNewVersion={(doc) => { setPanel(null); setUpload({ open: true, replaces: doc }); }}
        onChanged={changed}
      />
    </div>
  );
}
