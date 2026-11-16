/**
 * ClientBrandingCard — Tenant Tower: a client's own colours and assistant name
 * for the OLIWA web console and mobile app (navas-core-apis branding.py).
 *
 *   Access  (branding.control)   may the client customise, which parts, and
 *                                all of its administrators or chosen ones.
 *                                Switching off keeps the client's current
 *                                look; Reset is separate.
 *   Look    (branding.override)  change or reset the look for the client.
 *
 * Shown only to staff holding one of the two permissions; without the other,
 * that half is read-only.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useCan } from "../../../auth/guards";
import {
  getClientBranding, resetClientLook, setBrandingControl, setClientLook,
} from "../../../api/services/branding.service";
import { ApiError } from "../../../api/types/api.types";
import type { BrandingAdminScope, ClientBranding } from "../../../api/types/branding.types";

type FieldErrors = Partial<Record<string, string>>;

const HEX = /^#[0-9A-Fa-f]{6}$/;
const BTN = "h-8 px-3 rounded-lg text-[11px] font-black border border-[#E9EDEF] bg-white text-[#111B21] cursor-pointer hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-default";
const BTN_PRIMARY = "h-8 px-3 rounded-lg text-[11px] font-black border-0 bg-[#128C7E] text-white cursor-pointer hover:bg-[#0D7466] disabled:opacity-50 disabled:cursor-default";
const INPUT = "h-8 px-2 rounded-lg border border-[#E9EDEF] text-[12px] text-[#111B21] bg-white w-full disabled:bg-[#F8FAFC]";

function problem(e: unknown): { message: string; fields: FieldErrors } {
  if (e instanceof ApiError) {
    const data = e.apiData as { errors?: FieldErrors } | undefined;
    if (e.status === 404 && /no such endpoint|does not have that endpoint/i.test(e.message)) {
      return { message: "Branding is not available on the server yet.", fields: {} };
    }
    return { message: e.apiMessage ?? e.message, fields: data?.errors ?? {} };
  }
  return { message: e instanceof Error ? e.message : "Something went wrong.", fields: {} };
}

function when(stamp: string | null): string {
  if (!stamp) return "";
  const d = new Date(stamp);
  return Number.isNaN(d.getTime()) ? stamp : d.toLocaleString();
}

function Switch({ on, disabled, onChange, label }: { on: boolean; disabled?: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className={`flex items-center justify-between gap-3 py-1 ${disabled ? "opacity-70" : "cursor-pointer"}`}>
      <span className="text-[12px] text-[#111B21] font-extrabold">{label}</span>
      <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled}
        onClick={() => onChange(!on)}
        className={`w-9 h-5 rounded-full relative border-0 shrink-0 ${on ? "bg-[#128C7E]" : "bg-[#CBD5E1]"} ${disabled ? "cursor-default" : "cursor-pointer"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </label>
  );
}

function ColourField({ label, value, onChange, disabled, error }: {
  label: string; value: string; onChange: (v: string) => void; disabled?: boolean; error?: string;
}) {
  return (
    <div>
      <div className="text-[10px] font-black text-[#667781] mb-1">{label}</div>
      <div className="flex gap-1.5 items-center">
        <input type="color" aria-label={`${label} picker`} disabled={disabled}
          value={HEX.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="w-8 h-8 p-0 border border-[#E9EDEF] rounded-lg bg-white cursor-pointer disabled:cursor-default" />
        <input className={`${INPUT} font-mono ${error ? "border-[#EF4444]" : ""}`} aria-label={label}
          value={value} disabled={disabled} maxLength={7} placeholder="#RRGGBB"
          onChange={(e) => onChange(e.target.value.trim().toUpperCase())} />
      </div>
      {error && <div className="text-[10px] text-[#B00020] mt-1">{error}</div>}
    </div>
  );
}

/** Text that reads on [hex]: the server sends on_brand/on_accent for saved
 *  colours; this keeps the preview right while a colour is being edited. */
function inkOn(hex: string): string {
  if (!HEX.test(hex)) return "#FFFFFF";
  const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const lum = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  const white = 1.05 / (lum + 0.05);
  const ink = (lum + 0.05) / (0.0108 + 0.05);
  return white >= ink ? "#FFFFFF" : "#111B21";
}

export function ClientBrandingCard({ clientUid, clientName }: { clientUid: string; clientName: string }) {
  const canControl = useCan("branding.control");
  const canOverride = useCan("branding.override");

  const [branding, setBranding] = useState<ClientBranding | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Access draft
  const [enabled, setEnabled] = useState(false);
  const [allowColors, setAllowColors] = useState(true);
  const [allowName, setAllowName] = useState(true);
  const [scope, setScope] = useState<BrandingAdminScope>("all");
  const [chosen, setChosen] = useState<string[]>([]);
  // Look draft
  const [brand, setBrand] = useState("");
  const [accent, setAccent] = useState("");
  const [name, setName] = useState("");

  const [busy, setBusy] = useState<null | "control" | "look" | "reset">(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [confirmReset, setConfirmReset] = useState(false);

  const latest = useRef(clientUid);

  const fill = useCallback((b: ClientBranding) => {
    setBranding(b);
    setEnabled(b.control.enabled);
    setAllowColors(b.control.allow_colors);
    setAllowName(b.control.allow_assistant_name);
    setScope(b.control.admin_scope);
    setChosen(b.control.allowed_admins);
    setBrand(b.look.brand_color);
    setAccent(b.look.accent_color);
    setName(b.look.assistant_name);
  }, []);

  useEffect(() => {
    latest.current = clientUid;
    setBranding(null);
    setLoadError(null);
    setNotice(null);
    setError(null);
    setFieldErrors({});
    setConfirmReset(false);
    if (!canControl && !canOverride) return;
    setLoading(true);
    getClientBranding(clientUid)
      .then((r) => { if (latest.current === clientUid) fill(r.data); })
      .catch((e) => { if (latest.current === clientUid) setLoadError(problem(e).message); })
      .finally(() => { if (latest.current === clientUid) setLoading(false); });
  }, [clientUid, canControl, canOverride, fill]);

  if (!canControl && !canOverride) return null;

  const run = async (kind: "control" | "look" | "reset", call: () => Promise<{ data: ClientBranding }>, done: string) => {
    const uid = clientUid;
    setBusy(kind);
    setNotice(null);
    setError(null);
    setFieldErrors({});
    try {
      const r = await call();
      if (latest.current !== uid) return;
      fill(r.data);
      setNotice(done);
    } catch (e) {
      if (latest.current !== uid) return;
      const p = problem(e);
      setError(p.message);
      setFieldErrors(p.fields);
    } finally {
      if (latest.current === uid) setBusy(null);
    }
  };

  const saveControl = () => {
    if (scope === "selected" && chosen.length === 0) {
      setFieldErrors({ allowed_admins: "Choose at least one administrator." });
      return;
    }
    void run("control", () => setBrandingControl(clientUid, {
      enabled, allow_colors: allowColors, allow_assistant_name: allowName,
      admin_scope: scope, ...(scope === "selected" ? { allowed_admins: chosen } : {}),
    }), enabled ? `Branding is on for ${clientName}.` : `Branding is off for ${clientName}. Their current look stays.`);
  };

  const saveLook = () => {
    const local: FieldErrors = {};
    if (!HEX.test(brand)) local.brand_color = "Enter the brand colour as #RRGGBB.";
    if (!HEX.test(accent)) local.accent_color = "Enter the accent colour as #RRGGBB.";
    if (Object.keys(local).length) { setFieldErrors(local); return; }
    void run("look", () => setClientLook(clientUid, {
      brand_color: brand, accent_color: accent, assistant_name: name.trim(),
    }), `Look saved for ${clientName}.`);
  };

  const doReset = () => {
    setConfirmReset(false);
    void run("reset", () => resetClientLook(clientUid), `${clientName} is back to the OLIWA defaults.`);
  };

  const controlDirty = !!branding && (
    enabled !== branding.control.enabled || allowColors !== branding.control.allow_colors
    || allowName !== branding.control.allow_assistant_name || scope !== branding.control.admin_scope
    || (scope === "selected" && [...chosen].sort().join() !== [...branding.control.allowed_admins].sort().join()));
  const lookDirty = !!branding && (
    brand !== branding.look.brand_color || accent !== branding.look.accent_color
    || name.trim() !== branding.look.assistant_name);
  const customised = !!branding && Object.values(branding.look.customised).some(Boolean);

  const previewBrand = HEX.test(brand) ? brand : branding?.look.brand_color ?? "#128C7E";
  const previewAccent = HEX.test(accent) ? accent : branding?.look.accent_color ?? "#25D366";

  return (
    <div className="bg-white border border-[#E9EDEF] rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-black text-[13px] text-[#111B21]">Branding</div>
          <div className="text-[11px] text-[#667781] mt-0.5">Colours and assistant name in this client's OLIWA console and app.</div>
        </div>
        {branding && (
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ${branding.control.enabled ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#F0F2F5] text-[#667781]"}`}>
            {branding.control.enabled ? "ON" : "OFF"}
          </span>
        )}
      </div>

      {loading && <div className="text-[12px] text-[#667781] mt-2">Loading branding…</div>}
      {loadError && <div className="text-[12px] text-[#667781] mt-2">{loadError}</div>}

      {branding && (
        <>
          {notice && <div className="mt-2 text-[11px] rounded-lg px-2.5 py-1.5 bg-[#ECFDF5] text-[#166534]">{notice}</div>}
          {error && <div className="mt-2 text-[11px] rounded-lg px-2.5 py-1.5 bg-[#FEF2F2] text-[#B00020]">{error}</div>}

          {/* ── Access ── */}
          <div className="mt-3 border-t border-[#E9EDEF] pt-2">
            <div className="text-[10px] font-black text-[#667781] mb-1">ACCESS{!canControl && " · view only"}</div>
            <Switch label="Client may customise" on={enabled} disabled={!canControl} onChange={setEnabled} />
            <div className={enabled ? "" : "opacity-60"}>
              <Switch label="Colours" on={allowColors} disabled={!canControl || !enabled} onChange={setAllowColors} />
              <Switch label="Assistant name" on={allowName} disabled={!canControl || !enabled} onChange={setAllowName} />
              <div className="text-[12px] font-extrabold text-[#111B21] mt-1.5">Who may change it</div>
              {(["all", "selected"] as BrandingAdminScope[]).map((s) => (
                <label key={s} className="flex items-center gap-2 text-[12px] text-[#111B21] py-0.5 cursor-pointer">
                  <input type="radio" name={`branding-scope-${clientUid}`} checked={scope === s}
                    disabled={!canControl || !enabled} onChange={() => setScope(s)} />
                  {s === "all" ? "All client administrators (default)" : "Selected administrators"}
                </label>
              ))}
              {scope === "selected" && (
                <div className="mt-1 ml-5 max-h-[120px] overflow-auto border border-[#E9EDEF] rounded-lg">
                  {branding.admins.length === 0
                    ? <div className="px-2.5 py-2 text-[11px] text-[#667781]">This client has no administrators.</div>
                    : branding.admins.map((a) => (
                      <label key={a.account_uid} className="flex items-center gap-2 px-2.5 py-1.5 border-b border-[#E9EDEF] last:border-0 text-[12px] cursor-pointer">
                        <input type="checkbox" disabled={!canControl || !enabled}
                          checked={chosen.includes(a.account_uid)}
                          onChange={(e) => setChosen((c) => e.target.checked ? [...c, a.account_uid] : c.filter((u) => u !== a.account_uid))} />
                        <span className="font-extrabold text-[#111B21]">{a.name}</span>
                        {a.username && a.username !== a.name && <span className="text-[10px] text-[#667781]">{a.username}</span>}
                      </label>
                    ))}
                </div>
              )}
              {fieldErrors.allowed_admins && <div className="text-[10px] text-[#B00020] mt-1 ml-5">{fieldErrors.allowed_admins}</div>}
            </div>
            <div className="text-[10px] text-[#667781] mt-1.5">
              Operators and viewers can never change it. Switching off stops further changes and keeps the client's current look; use Reset below to go back to the defaults.
            </div>
            {canControl && (
              <div className="flex justify-end mt-2">
                <button type="button" className={BTN_PRIMARY} disabled={!controlDirty || busy !== null} onClick={saveControl}>
                  {busy === "control" ? "Saving…" : "Save access"}
                </button>
              </div>
            )}
            {branding.controlled_at && (
              <div className="text-[10px] text-[#667781] mt-1">Access last changed {when(branding.controlled_at)}{branding.controlled_by ? ` by ${branding.controlled_by}` : ""}</div>
            )}
          </div>

          {/* ── Look ── */}
          <div className="mt-3 border-t border-[#E9EDEF] pt-2">
            <div className="text-[10px] font-black text-[#667781] mb-1.5">LOOK{!canOverride && " · view only"}</div>

            <div className="rounded-lg overflow-hidden border border-[#E9EDEF]" aria-label="Preview">
              <div className="px-3 py-2 text-[12px] font-black" style={{ background: previewBrand, color: "#FFFFFF" }}>OLIWA · {clientName}</div>
              <div className="px-3 py-2.5 flex items-center justify-between gap-2 bg-[#F8FAFC]">
                <span className="text-[11px] font-black px-2.5 py-1 rounded-lg" style={{ background: previewAccent, color: inkOn(previewAccent) }}>Record fuel</span>
                <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full border" style={{ borderColor: previewBrand, color: previewBrand }}>
                  ✦ Ask {name.trim() || branding.defaults.assistant_name}
                </span>
              </div>
            </div>

            {canOverride && (
              <div className="flex gap-1.5 flex-wrap mt-2">
                {branding.defaults.presets.map((p) => (
                  <button key={p.name} type="button" title={p.name} disabled={busy !== null}
                    onClick={() => { setBrand(p.brand_color); setAccent(p.accent_color); }}
                    className="h-6 px-2 rounded-full border border-[#E9EDEF] bg-white text-[10px] font-black text-[#111B21] cursor-pointer flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.brand_color }} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.accent_color }} />
                    {p.name}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-2">
              <ColourField label="Brand colour" value={brand} onChange={setBrand} disabled={!canOverride} error={fieldErrors.brand_color} />
              <ColourField label="Accent colour" value={accent} onChange={setAccent} disabled={!canOverride} error={fieldErrors.accent_color} />
            </div>
            <div className="mt-2">
              <div className="text-[10px] font-black text-[#667781] mb-1">Assistant name</div>
              <input className={`${INPUT} ${fieldErrors.assistant_name ? "border-[#EF4444]" : ""}`} aria-label="Assistant name"
                value={name} maxLength={24} disabled={!canOverride}
                placeholder={branding.defaults.assistant_name} onChange={(e) => setName(e.target.value)} />
              {fieldErrors.assistant_name && <div className="text-[10px] text-[#B00020] mt-1">{fieldErrors.assistant_name}</div>}
            </div>

            {canOverride && (
              <div className="flex justify-between gap-2 mt-2">
                <button type="button" className={BTN} disabled={!customised || busy !== null} onClick={() => setConfirmReset(true)}>
                  {busy === "reset" ? "Resetting…" : "Reset to default"}
                </button>
                <button type="button" className={BTN_PRIMARY} disabled={!lookDirty || busy !== null} onClick={saveLook}>
                  {busy === "look" ? "Saving…" : "Save look"}
                </button>
              </div>
            )}
            {branding.updated_at && (
              <div className="text-[10px] text-[#667781] mt-1">Look last changed {when(branding.updated_at)}{branding.updated_by ? ` by ${branding.updated_by}` : ""}</div>
            )}
          </div>
        </>
      )}

      {confirmReset && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-[600]" onClick={() => setConfirmReset(false)}>
          <div className="bg-white rounded-xl p-5 w-[360px] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="font-black text-[14px] text-[#111B21] mb-2">Reset branding</div>
            <div className="text-[12px] text-[#667781] mb-4">
              {clientName} goes back to the OLIWA colours and the assistant is called {branding?.defaults.assistant_name ?? "Waswa"} again, in their console and app. Their access settings stay as they are.
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmReset(false)} className={BTN}>Cancel</button>
              <button type="button" onClick={doReset} className="h-8 px-4 rounded-lg text-[12px] font-black border-0 bg-[#EF4444] text-white cursor-pointer">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
