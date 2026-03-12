/**
 * AuditPage — Screen 12: IRREFUTABLE CONTROL VAULT
 *
 * CMS-wide audit trail covering every module: Tenant Tower, Billing, VEBA,
 * Money Switchboard, RBAC, Tokens, Payments, Firmware, SIM, Protocol,
 * Alarm Factory, AI Workloads, and the Audit module itself.
 *
 * Matches v26 mockups (6 screenshots):
 *   TOP:    Header + Export/Approvals → 4 KPIs (bar accent) → Filters + Live Stream
 *           → Audit Stream table (20 rows) + right sidebar (Waswa AI + Approval Queue)
 *   MID:    Table cont. → Tamper Evidence Hash Chain (5 blocks) + Compliance Snapshot
 *   BOTTOM: Retention + Export Controls (4 cards)
 *   MODAL:  Export Audit Pack (HIC) — 4-step wizard (Scope, Format, Redaction, Approval)
 */
import React, { useEffect, useState, useCallback } from "react";
import {
  getAuditEvents,
  getAuditKpis,
  // getHashChain,
  // getAuditApprovals,
  getComplianceSnapshot,
} from "../../api";
import type {
  AuditEvent,
  AuditKpis,
  // HashBlock,
  // AuditApproval,
  ComplianceSnapshot,
  AuditDomain,
  AuditSeverity,
  AuditFilters,
} from "../../api";

// ─── Severity dot colors ─────────────────────────────────────────────────────
const sevDot: Record<string, string> = {
  Info: "bg-[#9CA3AF]", Warn: "bg-[#FBBF24]", Alarm: "bg-[#F97316]", Crit: "bg-[#EF4444]",
};

// ─── Domain labels ───────────────────────────────────────────────────────────
const DOMAIN_OPTIONS: { value: AuditDomain | "ALL"; label: string }[] = [
  { value: "ALL",      label: "ALL" },
  { value: "TENANT",   label: "Tenant Tower" },
  { value: "BILLING",  label: "Billing" },
  { value: "VEBA",     label: "VEBA" },
  { value: "MONEY",    label: "Money" },
  { value: "RBAC",     label: "RBAC" },
  { value: "TOKEN",    label: "Tokens" },
  { value: "PAYMENT",  label: "Payments" },
  { value: "FIRMWARE", label: "Firmware" },
  { value: "SIM",      label: "SIM" },
  { value: "PROTOCOL", label: "Protocol" },
  { value: "ALARM",    label: "Alarms" },
  { value: "AI",       label: "AI" },
  { value: "AUDIT",    label: "Audit" },
  { value: "CLIENT",   label: "Clients" },
  { value: "SYSTEM",   label: "System" },
];

const SEVERITY_OPTIONS: { value: AuditSeverity | "ANY"; label: string }[] = [
  { value: "ANY",   label: "ANY" },
  { value: "Info",  label: "Info" },
  { value: "Warn",  label: "Warn" },
  { value: "Alarm", label: "Alarm" },
  { value: "Crit",  label: "Crit" },
];

const RANGE_OPTIONS = [
  { value: "1h",  label: "1h" },
  { value: "6h",  label: "6h" },
  { value: "24h", label: "24h" },
  { value: "7d",  label: "7d" },
  { value: "30d", label: "30d" },
];

// const ARTIFACTS = [
//   "Audit stream (Kafka) — immutable event log",
//   "HIC Overrides log (kill-switch / suspensions)",
//   "HITL Approvals log (pricing / refunds / deployments)",
//   "Payments reconciliations (M-Pesa/MTN/Airtel) + webhooks",
//   "Token ledger snapshot (FIFO instances) + burn history",
//   "VEBA escrow settlements + dispute events",
//   "RBAC changes + privileged access review",
//   "Exports + data access proofs",
//   "Hash chain blocks + signatures",
//   "System health microstats (Kafka lag / DB p95)",
//   "Waswa AI suggestions + acceptance/reject trail",
//   "Redaction policy + applied masks",
//   "Checksum manifest (SHA256)",
// ];

// ─── Page Component ──────────────────────────────────────────────────────────
export function AuditPage() {
  // const [modalOpen, setModalOpen] = useState(false);
  const [liveStream, setLiveStream] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Filters ────────────────────────────────────────────────────────────────
  const [domainFilter, setDomainFilter] = useState<AuditDomain | "ALL">("ALL");
  const [severityFilter, setSeverityFilter] = useState<AuditSeverity | "ANY">("ANY");
  const [rangeFilter, setRangeFilter] = useState("24h");

  // ── API state: Audit Events ────────────────────────────────────────────────
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // ── API state: KPIs ────────────────────────────────────────────────────────
  const [kpis, setKpis] = useState<AuditKpis | null>(null);
  const [kpisLoading, setKpisLoading] = useState(true);

  // ── API state: Hash Chain (commented out — section disabled) ───────────────
  // const [hashBlocks, setHashBlocks] = useState<HashBlock[]>([]);
  // const [hashLoading, setHashLoading] = useState(true);

  // ── API state: Approvals (commented out — section disabled) ────────────────
  // const [approvals, setApprovals] = useState<AuditApproval[]>([]);
  // const [approvalsLoading, setApprovalsLoading] = useState(true);

  // ── API state: Compliance ──────────────────────────────────────────────────
  const [compliance, setCompliance] = useState<ComplianceSnapshot | null>(null);
  const [complianceLoading, setComplianceLoading] = useState(true);

  // ── Fetch helpers ──────────────────────────────────────────────────────────

  const buildFilters = useCallback((): AuditFilters => {
    const f: AuditFilters = { range: rangeFilter };
    if (domainFilter !== "ALL")    f.domain   = domainFilter;
    if (severityFilter !== "ANY")  f.severity = severityFilter;
    return f;
  }, [domainFilter, severityFilter, rangeFilter]);

  const fetchEvents = useCallback(() => {
    return getAuditEvents(buildFilters())
      .then(res => setEvents(res.data))
      .catch(() => {});
  }, [buildFilters]);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getAuditKpis().then(res => { if (!cancelled) setKpis(res.data); }).catch(() => {}),
      // getHashChain().then(res => { if (!cancelled) setHashBlocks(res.data); }).catch(() => {}),
      // getAuditApprovals().then(res => { if (!cancelled) setApprovals(res.data); }).catch(() => {}),
      getComplianceSnapshot().then(res => { if (!cancelled) setCompliance(res.data); }).catch(() => {}),
    ]).finally(() => {
      if (!cancelled) {
        setKpisLoading(false);
        // setHashLoading(false);
        // setApprovalsLoading(false);
        setComplianceLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, []);

  // Re-fetch events whenever filters change
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await getAuditEvents(buildFilters());
        if (!cancelled) setEvents(res.data);
      } catch { /* swallow */ }
      if (!cancelled) setEventsLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [buildFilters]);

  // ── Live stream polling ────────────────────────────────────────────────────
  useEffect(() => {
    if (!liveStream) return;
    const interval = setInterval(() => { fetchEvents(); }, 15_000);
    return () => clearInterval(interval);
  }, [liveStream, fetchEvents]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function formatTime(iso: string): string {
    try {
      return new Date(iso).toLocaleTimeString("en-GB", { hour12: false });
    } catch {
      return iso;
    }
  }

  // const pendingApprovals = approvals.filter(a => a.status === "pending");
  const complianceStatusDot: Record<string, string> = {
    ok: "bg-[#25D366]", warn: "bg-[#FBBF24]", alert: "bg-[#F97316]",
  };

  return (
    <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden relative">
      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col gap-3 p-3">

          {/* Header */}
          <div className="bg-white border border-[#E9EDEF] rounded-xl px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-black text-[16px] text-[#111B21]">Audit Logs &amp; Compliance</div>
                <div className="text-[11px] text-[#667781] mt-0.5">Home &gt; Asset &amp; Resource Gov &gt; Audit Logs</div>
              </div>
              {/* <div className="flex gap-2 shrink-0">
                <Pill color="green" onClick={() => setModalOpen(true)}>Export</Pill>
                <Pill onClick={() => { getAuditApprovals().then(res => setApprovals(res.data)).catch(() => {}); }}>Approvals</Pill>
              </div> */}
            </div>
          </div>

          {/* ════════════════════ TOP SCROLL ════════════════════════════ */}

          {/* 4 KPIs with vertical bar accent */}
          <div className="grid grid-cols-4 gap-3">
            <KpiCard
              label="Audit ingest p95"
              value={kpisLoading ? "—" : `${kpis?.ingest_p95_seconds ?? 0}s`}
              sub="Target <60s"
              bar="bg-[#34B7F1]"
              loading={kpisLoading}
            />
            <KpiCard
              label="Log gaps"
              value={kpisLoading ? "—" : String(kpis?.log_gaps_24h ?? 0)}
              sub="Last 24h"
              bar="bg-[#EF4444]"
              loading={kpisLoading}
            />
            <KpiCard
              label="Sensitive actions"
              value={kpisLoading ? "—" : String(kpis?.sensitive_actions_24h ?? 0)}
              sub="Pricing/Refund/RBAC"
              bar="bg-[#F97316]"
              loading={kpisLoading}
            />
            <KpiCard
              label="Retention"
              value={kpisLoading ? "—" : `${kpis?.retention_days ?? 0}d`}
              sub="Plan entitlement"
              bar="bg-[#25D366]"
              loading={kpisLoading}
            />
          </div>

          {/* Filters + Live Stream toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] font-black text-[#111B21]">Filters</span>

            {/* Domain filter */}
            <select
              value={domainFilter}
              onChange={e => setDomainFilter(e.target.value as AuditDomain | "ALL")}
              className="h-8 px-3 rounded-lg bg-white border border-[#E9EDEF] text-[12px] text-[#111B21] outline-none cursor-pointer"
            >
              {DOMAIN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Severity filter */}
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value as AuditSeverity | "ANY")}
              className="h-8 px-3 rounded-lg bg-white border border-[#E9EDEF] text-[12px] text-[#111B21] outline-none cursor-pointer"
            >
              {SEVERITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Range filter */}
            <div className="flex gap-1">
              {RANGE_OPTIONS.map(o => (
                <button
                  key={o.value}
                  onClick={() => setRangeFilter(o.value)}
                  className={`h-8 px-3 rounded-lg text-[12px] border cursor-pointer transition-all ${
                    rangeFilter === o.value
                      ? "bg-[#128C7E]/10 border-[#128C7E]/30 text-[#128C7E] font-black"
                      : "bg-white border-[#E9EDEF] text-[#667781]"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            {/* Live stream toggle */}
            <button
              onClick={() => setLiveStream(p => !p)}
              className={`ml-auto h-8 px-4 rounded-full text-[11px] font-black flex items-center cursor-pointer border-none transition-all ${
                liveStream
                  ? "bg-[#075E54] text-white"
                  : "bg-[#F0F2F5] text-[#667781]"
              }`}
            >
              Live Stream: {liveStream ? "ON" : "OFF"}
            </button>
          </div>

          {/* Audit Stream Table */}
          <div className="bg-white border border-[#E9EDEF] rounded-xl overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 320px)" }}>
            <div className="px-4 py-3 border-b border-[#E9EDEF] flex items-center gap-3 shrink-0">
              <span className="font-black text-[13px] text-[#111B21]">AUDIT STREAM (CMS-wide)</span>
              <span className="text-[11px] text-[#667781]">
                {eventsLoading ? "Loading…" : `${events.length} events`}
              </span>
              <div className="ml-auto flex gap-2">
                {/* <Pill color="green" onClick={() => setModalOpen(true)}>Export Pack</Pill> */}
                <Pill onClick={fetchEvents}>Refresh</Pill>
                <Pill onClick={() => setSidebarOpen(p => !p)}>{sidebarOpen ? "Hide Panel" : "Show Panel"}</Pill>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
              <table className="w-full text-[12px]">
                <thead><tr className="border-b-2 border-[#128C7E]/30">
                  {["Time", "Actor", "Action", "Object", "Domain", "Sev", ""].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-black text-[#667781]">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {eventsLoading ? (
                    <tr><td colSpan={7} className="px-3 py-8 text-center text-[#667781]">
                      Loading audit events…
                    </td></tr>
                  ) : events.length === 0 ? (
                    <tr><td colSpan={7} className="px-3 py-8 text-center text-[#667781]">
                      No audit events match current filters.
                    </td></tr>
                  ) : (
                    events.map(e => (
                      <tr key={e.id} className="border-b border-[#E9EDEF] last:border-0 hover:bg-[#F8FAFC] cursor-pointer">
                        <td className="px-3 py-2 font-mono text-[#667781] whitespace-nowrap">{formatTime(e.timestamp)}</td>
                        <td className="px-3 py-2 text-[#667781]">{e.actor}</td>
                        <td className="px-3 py-2">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-[#128C7E] text-white">{e.action}</span>
                        </td>
                        <td className="px-3 py-2 text-[#111B21]">{e.object}</td>
                        <td className="px-3 py-2 text-[#667781]">{e.domain}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`w-2.5 h-2.5 rounded-full inline-block align-middle ${sevDot[e.severity] ?? "bg-[#9CA3AF]"}`} />
                          <span className="ml-1.5 text-[#667781] align-middle">{e.severity}</span>
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={(ev) => { ev.stopPropagation(); setEvents(prev => prev.filter(evt => evt.id !== e.id)); }}
                            className="w-7 h-7 rounded-lg bg-[#FEF2F2] border border-[#EF4444]/20 text-[#EF4444] text-[12px] font-black cursor-pointer hover:bg-[#EF4444] hover:text-white transition-all grid place-items-center"
                            title="Delete audit event"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-3 py-2 text-[10px] text-[#667781] italic border-t border-[#E9EDEF]">
              Tip: click a row → right blade (Event Details) • High-risk actions require HITL/HIC + hash-chain proof.
            </div>
          </div>

          {/* ════════════════════ MID SCROLL ════════════════════════════ */}

          {/* Tamper Evidence (Hash Chain) — commented out
          <div className="bg-white border border-[#E9EDEF] rounded-xl p-4">
            <div className="font-black text-[13px] text-[#111B21]">Tamper Evidence (Hash Chain)</div>
            <div className="text-[11px] text-[#667781] mt-0.5 mb-3">
              Irrefutable logs: every event signed + chained. Any gap triggers auto-escalation.
            </div>
            {hashLoading ? (
              <div className="text-[12px] text-[#667781] py-4 text-center">Loading hash chain…</div>
            ) : hashBlocks.length === 0 ? (
              <div className="text-[12px] text-[#667781] py-4 text-center">No hash blocks available.</div>
            ) : (
              <div className="flex gap-0 items-center overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {hashBlocks.map((block, i) => (
                  <React.Fragment key={block.block_id}>
                    <div className="min-w-[150px] bg-[#F8FAFC] border border-[#E9EDEF] rounded-xl p-3 relative shrink-0">
                      <span className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${
                        block.status === "valid" ? "bg-[#25D366]" :
                        block.status === "gap"   ? "bg-[#FBBF24]" : "bg-[#EF4444]"
                      }`} />
                      <div className="font-black text-[13px] text-[#111B21]">Block {block.block_id}</div>
                      <div className="text-[11px] text-[#667781] mt-0.5 font-mono truncate" title={block.hash}>
                        {block.hash.slice(0, 12)}…
                      </div>
                      <div className="text-[10px] text-[#667781] mt-1">{block.event_count} events</div>
                    </div>
                    {i < hashBlocks.length - 1 && (
                      <div className="flex items-center shrink-0 px-1">
                        <span className="w-5 h-0.5 bg-[#25D366] rounded-full" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
          */}

          {/* ════════════════════ BOTTOM SCROLL ═════════════════════════ */}

          {/* Retention + Export Controls — commented out
          <div className="bg-white border border-[#E9EDEF] rounded-xl p-4">
            <div className="font-black text-[13px] text-[#111B21] mb-3">Retention + Export Controls</div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { k: "Plan Entitlement",  v: kpis ? `${kpis.retention_days} days` : "—", sub: "Tied to billing plan" },
                { k: "Export Rate Limit",  v: "500 rows/min", sub: "Prevents data exfil" },
                { k: "Redaction",          v: "PII masked",   sub: "RBAC + audit proofs" },
                { k: "Archive",            v: "S3/Blob",      sub: "Immutable cold storage" },
              ].map(c => (
                <div key={c.k} className="border border-[#E9EDEF] rounded-xl p-3">
                  <div className="text-[11px] text-[#667781] mb-1">{c.k}</div>
                  <div className="font-black text-[16px] text-[#128C7E] leading-tight">{c.v}</div>
                  <div className="text-[10px] text-[#667781] mt-1">{c.sub}</div>
                </div>
              ))}
            </div>
          </div>
          */}

        </div>
      </main>

      {/* ── Right Sidebar: Waswa AI + Approval Queue ─────────────── */}
      {sidebarOpen && (
      <aside className="w-[380px] shrink-0 bg-white border-l border-[#E9EDEF] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-4 flex flex-col gap-3">

        {/* Waswa AI Co-Pilot */}
        <div className="bg-[#128C7E] text-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-black text-[13px]">Waswa AI • Co-Pilot</span>
            <span className="text-[10px] font-black bg-[#25D366] text-[#075E54] px-2 py-0.5 rounded-full">ON</span>
          </div>
          <div className="text-[11px] leading-relaxed opacity-90 mb-3">
            {[
              "Leakage risk ↑ in VEBA Boda: 2.1x baseline",
              "Suggest: enable 'Info Gating' + token unlock",
              "Payments: Airtel UG p95 latency 11s → retry window",
              "AI cost: route low-risk events to Local Engine (Tier 1)",
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#25D366] mt-1 shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>
          <input
            placeholder="Ask Waswa...  (e.g., 'show HIC overrides last 24h')"
            className="w-full h-8 rounded-lg bg-white/15 border-none px-3 text-[11px] text-white placeholder:text-white/60 outline-none"
          />
        </div>

        {/* Compliance Snapshot */}
        <div className="bg-[#075E54] text-white rounded-xl p-4">
          <div className="font-black text-[13px] mb-2.5">Compliance Snapshot</div>
          {complianceLoading ? (
            <div className="text-[11px] opacity-70 text-center py-2">Loading…</div>
          ) : !compliance ? (
            <div className="text-[11px] opacity-70 text-center py-2">Unavailable</div>
          ) : (
            compliance.items.map(c => (
              <div key={c.key} className="flex items-center justify-between mb-1.5 text-[12px]">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${complianceStatusDot[c.status] ?? "bg-[#9CA3AF]"} shrink-0`} />{c.key}
                </span>
                <span className="font-black">{c.value}</span>
              </div>
            ))
          )}
        </div>
      </aside>
      )}

      {/* ── Modal: Export Audit Pack (HIC) — commented out
      {modalOpen && (
        <div className="fixed inset-0 bg-black/35 z-50 grid place-items-center" onClick={() => setModalOpen(false)}>
          <div className="w-[min(720px,calc(100vw-24px))] max-h-[calc(100vh-24px)] bg-white rounded-xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-[#E9EDEF] flex items-center justify-between shrink-0">
              <div>
                <div className="font-black text-[16px] text-[#111B21]">Export Audit Pack (HIC)</div>
                <div className="text-[11px] text-[#667781] mt-0.5">PDF/CSV + signatures + redaction • requires approval</div>
              </div>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-lg bg-[#F0F2F5] border border-[#E9EDEF] text-[#667781] font-black text-[14px] cursor-pointer grid place-items-center hover:bg-[#E9EDEF]">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-5">
              <div className="bg-[#FEF2F2] border border-[#EF4444]/20 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EF4444] shrink-0" />
                <span className="text-[12px] font-black text-[#111B21]">High-risk export: cross-tenant leakage prevention enforced.</span>
              </div>
              <div className="flex gap-2 mb-5">
                {["1. Scope", "2. Format", "3. Redaction", "4. Approval"].map((s, i) => (
                  <span key={s} className={`flex-1 h-9 rounded-lg text-[12px] font-black flex items-center justify-center border cursor-pointer ${i === 0 ? "bg-[#128C7E]/10 border-[#128C7E]/30 text-[#128C7E]" : "bg-white border-[#E9EDEF] text-[#667781]"}`}>{s}</span>
                ))}
              </div>
              <div className="text-[12px] font-black text-[#667781] mb-2">Scope</div>
              <div className="border border-[#E9EDEF] rounded-xl p-3 mb-4">
                <div className="flex gap-6 text-[12px] mb-2">
                  <span><span className="text-[#667781]">Tenant</span> <span className="font-black text-[#111B21] ml-2">3D-TEPU (UG) ▾</span></span>
                </div>
                <div className="flex gap-6 text-[12px]">
                  <span><span className="text-[#667781]">Date range</span> <span className="font-black text-[#111B21] ml-2">Last 24h</span></span>
                  <span><span className="text-[#667781]">Include sub-tenants:</span> <span className="font-black text-[#111B21] ml-2">NO</span></span>
                </div>
              </div>
              <div className="text-[12px] font-black text-[#667781] mb-2">Artifacts included</div>
              <div className="border border-[#E9EDEF] rounded-xl p-3 mb-4">
                {ARTIFACTS.map(a => (
                  <div key={a} className="flex items-center gap-2 text-[12px] text-[#111B21] mb-1.5 last:mb-0">
                    <span className="w-2 h-2 rounded-full bg-[#25D366] shrink-0" />{a}
                  </div>
                ))}
              </div>
              <div className="text-[12px] font-black text-[#667781] mb-2">Formats</div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { fmt: "PDF (signed)", on: true }, { fmt: "CSV", on: true },
                  { fmt: "XLSX", on: false }, { fmt: "JSON", on: true },
                ].map(f => (
                  <div key={f.fmt} className="flex items-center gap-2 border border-[#E9EDEF] rounded-xl px-3 py-2.5 text-[12px]">
                    <span className={`w-2.5 h-2.5 rounded-full ${f.on ? "bg-[#25D366]" : "bg-[#9CA3AF]"} shrink-0`} />
                    <span className="text-[#111B21]">{f.fmt}</span>
                  </div>
                ))}
              </div>
              <div className="text-[12px] font-black text-[#667781] mb-2">Redaction</div>
              <div className="bg-[#FEF3C7] border border-[#FBBF24]/30 rounded-xl p-4 mb-4">
                <div className="font-black text-[12px] text-[#F97316] mb-1.5">Mask PII (phone, email, ID)</div>
                <div className="text-[12px] text-[#111B21] leading-relaxed">
                  Policy: RBAC-driven. System Admin sees masked fields unless escalated.<br />
                  <strong>Include raw payloads: NO (recommended)</strong><br />
                  <strong>Export watermark: ON</strong><br />
                  <strong>Recipient channels: Email + WhatsApp (link)</strong>
                </div>
              </div>
              <div className="text-[12px] font-black text-[#667781] mb-2">Approval</div>
              <div className="bg-[#FEF3C7] border border-[#FBBF24]/30 rounded-xl p-4">
                <div className="font-black text-[12px] text-[#EF4444] mb-1.5">HIC required</div>
                <div className="text-[12px] text-[#111B21] mb-2"><strong>Select approvers (2):</strong></div>
                <div className="border border-[#E9EDEF] rounded-lg px-3 py-2 text-[12px] text-[#111B21] bg-white mb-2">
                  Finance Lead ▾ &ensp;+ &ensp;Compliance Officer ▾
                </div>
                <div className="text-[11px] text-[#667781]">Audit seal will be appended to manifest.</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 px-5 py-3 border-t border-[#E9EDEF] bg-white shrink-0">
              <button onClick={() => setModalOpen(false)} className="h-10 px-6 rounded-lg bg-white border border-[#E9EDEF] text-[13px] font-black text-[#111B21] cursor-pointer hover:bg-[#F8FAFC]">Cancel</button>
              <button onClick={() => setModalOpen(false)} className="h-10 px-6 rounded-lg bg-[#25D366] text-[#075E54] text-[13px] font-black border-none cursor-pointer hover:brightness-105">Request</button>
            </div>
          </div>
        </div>
      )}
      */}
    </div>
  );
}

// ─── Reusable Components ─────────────────────────────────────────────────────
const pillStyles: Record<string, string> = {
  green: "bg-[#25D366] text-[#075E54]",
  ghost: "bg-white border border-[#E9EDEF] text-[#667781]",
};

function Pill({ color = "ghost", onClick, children }: { color?: string; onClick?: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`h-7 px-3 rounded-full text-[11px] font-black border-none cursor-pointer hover:brightness-105 active:opacity-85 transition-all whitespace-nowrap ${pillStyles[color] ?? pillStyles.ghost}`}>{children}</button>;
}

function KpiCard({ label, value, sub, bar, loading }: { label: string; value: string; sub: string; bar: string; loading?: boolean }) {
  return (
    <div className="bg-white border border-[#E9EDEF] rounded-xl p-3 relative overflow-hidden">
      <div className={`absolute top-0 right-3 w-1.5 h-full ${bar} rounded-b-full`} />
      <div className="text-[11px] text-[#667781]">{label}</div>
      <div className={`text-[22px] font-black text-[#111B21] mt-1 leading-tight ${loading ? "animate-pulse" : ""}`}>{value}</div>
      <div className="text-[10px] text-[#667781] mt-1">{sub}</div>
    </div>
  );
}
