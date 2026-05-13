/**
 * Dashboard — Main Workspace
 *
 * Composes the two content blades:
 *   • System Health God View  (left / primary blade)
 *   • Waswa AI Co-Pilot       (right / AI blade)
 *
 * All styles use Tailwind utility classes only.
 */
import React, { useMemo, useState } from "react";
import type{ HitlAction, Severity } from "../types";
import { Kpi, Card, Bar, MiniGateway, MiniStat } from "./primitives";
import { TaskManagerModal } from "../TaskManagerModal";

// ── Severity helpers ─────────────────────────────────────────────────────────
const sevDot: Record<Severity, string> = {
  green:    "bg-[#25D366]",
  warning:  "bg-[#F4B400]",
  alarm:    "bg-[#FB8C00]",
  critical: "bg-[#D93025]",
};

// ── Button variants ──────────────────────────────────────────────────────────
const btn: Record<string, string> = {
  green: "bg-[#25D366] text-white",
  azure: "bg-[#34B7F1] text-white",
  teal:  "bg-[#128C7E] text-white",
  red:   "bg-[#D93025] text-white",
  ghost: "bg-[#F8F9FA] border border-[#E9EDEF] text-[#667781]",
};

function Btn({ variant = "ghost", onClick, children }: { variant?: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-[28px] rounded-full px-3 text-[12px] font-bold cursor-pointer whitespace-nowrap hover:brightness-105 active:opacity-85 transition-all ${btn[variant]}`}
    >
      {children}
    </button>
  );
}

// ── HITL data ────────────────────────────────────────────────────────────────
const DEFAULT_HITL: HitlAction[] = [
  { id: "a1", sev: "alarm",    title: "Scale Kafka consumer group +1",        reason: "Lag 4.8s trending up • risk: ingest delay + token burn drift", primaryCta: "Approve", secondaryCta: "Review"   },
  { id: "a2", sev: "warning",  title: "Set token burn soft-cap (80%)",        reason: "Tenant: OLIWA_CORP_UG • run-out <72h",                        primaryCta: "Approve", secondaryCta: "Edit"     },
  { id: "a3", sev: "alarm",    title: "Gate VEBA contact unlock",             reason: "Leakage attempts 17 today (KLA_BODA_POOL)",                   primaryCta: "Approve", secondaryCta: "Simulate" },
  { id: "a4", sev: "critical", title: "Suspend webhook retries (Airtel UG)", reason: "Fail 6.7% • risk: paid-not-credited disputes",                 primaryCta: "HIC",     secondaryCta: "Runbook"  },
];

// ── VEBA table rows ──────────────────────────────────────────────────────────
const VEBA_ROWS = [
  { flag: "🔴", entity: "KLA_BODA_POOL", signal: "Leakage ×17",      action: "Gate contact unlock"  },
  { flag: "🟠", entity: "OLIWA_CORP_UG",  signal: "Escrow ∆ 3.1M",   action: "Notify + escrow hold" },
  { flag: "🟡", entity: "PIKI_KLA_POOL",  signal: "Settle delay 22m", action: "Retry STK push"       },
];

// Shared grid for VEBA table
const TABLE_GRID = "grid grid-cols-[50px_1.4fr_1fr_1.8fr_32px] gap-2 items-center";

export function Dashboard() {
  const [showTaskManager, setShowTaskManager] = useState(false);
  const hitl = useMemo(() => DEFAULT_HITL, []);

  return (
    <>
      {/* ── Workspace ─────────────────────────────────────────────────── */}
      <main className="
        flex-1 flex gap-4
        p-3 md:p-4
        min-w-0 min-h-0

        /* Stack vertically on tablet/mobile; side-by-side on xl */
        flex-col xl:flex-row overflow-x-hidden w-full
        overflow-y-auto xl:overflow-hidden
      ">

        {/* ══ Left blade: System Health ═════════════════════════════════ */}
        <section className="
          flex-1 flex flex-col min-w-0
          bg-white border border-[#E9EDEF] rounded-xl
        ">
          {/* Blade header */}
          <div className="relative h-[42px] flex items-center px-3.5 gap-2.5 border-b border-[#E9EDEF] shrink-0">
            <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#128C7E] rounded-tl-xl" />
            <span className="font-extrabold text-[#111B21] text-[13px]">System Health — God View</span>
            <span className="ml-auto text-[11px] text-[#667781]">refresh 30s</span>
          </div>

          {/* Blade content */}
          <div className="p-3 md:p-3.5 flex flex-col gap-3.5 overflow-y-auto flex-1">

            {/* KPI grid — 1 col on xs, 2 col on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Kpi title="Uptime (30d)"    value="99.82%"    sub="p95 API 320ms • 5xx 0.7%"   sev="green"   />
              <Kpi title="Ingest p95"      value="22s"       sub="Drop est 0.04% • dup 0.21%" sev="warning" />
              <Kpi title="Kafka lag"       value="4.8s"      sub="URP 0 • brokers disk 61%"   sev="green"   />
              <Kpi title="Token Burn (ops)" value="1.7 Tok/s" sub="Retry storms +0.3 Tok/s"   sev="alarm"   />
            </div>

            {/* Compute */}
            <Card title="Compute & System Resource Usage" subtitle="Percentages (cluster)">
              <Bar label="CPU"        pct={0.63} meta="63% (🟡>70 🟠>85 🔴>95)"  />
              <Bar label="RAM Free"   pct={0.18} meta="18% (🟡<20 🟠<10 🔴<5)"  warn />
              <Bar label="Disk Free"  pct={0.24} meta="24% (🟡<20 🟠<10 🔴<5)"  />
              <Bar label="Net Errors" pct={0.07} meta="0.7% (🟡>1 🟠>3 🔴>5)"   />
              <div className="flex flex-wrap gap-2 mt-1">
                <Btn variant="azure" onClick={() => setShowTaskManager(true)}>Open Task Manager</Btn>
              </div>
            </Card>

            {/* Payments */}
            <Card title="Payments & Mobile Money Gateways" subtitle="Real-time status • webhook backlog">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <MiniGateway name="M-Pesa KE"   status="OK"       meta="success 98.9% • p95 9.2s"           sev="green" />
                <MiniGateway name="MTN MoMo UG" status="OK"       meta="success 97.6% • p95 11.4s"          sev="green" />
                <MiniGateway name="Airtel UG"   status="DEGRADED" meta="success 91.2% • webhook fail 6.7%"  sev="alarm" />
                <MiniGateway name="Airtel KE"   status="OK"       meta="success 96.8% • settle delay 18m"   sev="green" />
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <Btn variant="azure">View retries</Btn>
                <Btn variant="green">+ New webhook rule</Btn>
                <Btn variant="azure">Export recon</Btn>
              </div>
            </Card>

            {/* VEBA */}
            <Card title="VEBA Governance • Leakage Prevention" subtitle="Listings + tendering + escrow">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <MiniStat label="Bookings today"   value="184"       />
                <MiniStat label="Leakage attempts" value="17"        />
                <MiniStat label="Escrow balance"   value="UGX 42.8M" />
                <MiniStat label="Settlement p95"   value="18m"       />
              </div>

              {/* Scrollable table wrapper */}
              <div className="border border-[#E9EDEF] rounded-xl overflow-hidden overflow-x-auto">
                <div className={`${TABLE_GRID} px-2.5 py-2 bg-[#F8F9FA] text-[11px] text-[#667781] font-extrabold`}>
                  <div>Flag</div><div>Entity</div><div>Signal</div><div>Suggested action</div><div>⋮</div>
                </div>
                {VEBA_ROWS.map((r) => (
                  <div key={r.entity} className={`${TABLE_GRID} px-2.5 py-2 bg-white border-t border-[#E9EDEF] text-[11px] text-[#111B21]`}>
                    <div>{r.flag}</div>
                    <div className="font-mono text-[10px]">{r.entity}</div>
                    <div>{r.signal}</div>
                    <div>{r.action}</div>
                    <div>⋯</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mt-1">
                <Btn variant="azure">View all flags</Btn>
                <Btn variant="green">+ New leakage rule</Btn>
              </div>
            </Card>
          </div>
        </section>

        {/* ══ Right blade: Waswa AI ══════════════════════════════════════ */}
        <section className="
          flex flex-col min-w-0
          bg-white border border-[#E9EDEF] rounded-xl
          xl:max-w-[420px] xl:w-[420px]
        ">
          {/* Blade header — green accent */}
          <div className="relative h-[42px] flex items-center px-3.5 gap-2.5 border-b border-[#E9EDEF] shrink-0">
            <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#25D366] rounded-tl-xl" />
            <span className="font-extrabold text-[#111B21] text-[13px]">Waswa AI — Primary Driver</span>
            <span className="ml-auto text-[11px] text-[#667781]">HITL enforced</span>
          </div>

          {/* Blade content */}
          <div className="p-3 md:p-3.5 flex flex-col gap-3.5 overflow-y-auto flex-1">

            {/* AI status */}
            <Card title="Waswa AI • Ops Co‑Pilot" subtitle="Proactive insights (Revenue + Health + Billing)">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="rounded-full px-2.5 py-1 text-[12px] font-extrabold bg-[#25D366] text-white">ON</span>
                <span className="text-[12px] text-[#667781] leading-snug">
                  System Health 99.82% • leakage risk (VEBA) • suggest 5k mint
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <Btn variant="azure">Open HITL Queue</Btn>
                <Btn variant="teal">Ask why?</Btn>
                <Btn variant="ghost">Mute (1h)</Btn>
              </div>
            </Card>

            {/* HITL actions */}
            <Card title="HITL / HIC Pending Actions" subtitle="High-risk actions require approval + audit">
              <div className="flex flex-col gap-2.5">
                {hitl.map((a) => (
                  <div
                    key={a.id}
                    className="flex gap-2.5 items-start bg-[#F8F9FA] border border-[#E9EDEF] rounded-xl p-2.5 flex-wrap xs:flex-nowrap"
                  >
                    {/* Severity dot */}
                    <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${sevDot[a.sev]}`} title={a.sev} />

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-[12px] text-[#111B21]">{a.title}</div>
                      <div className="text-[11px] text-[#667781] mt-0.5 leading-snug">{a.reason}</div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 items-center shrink-0 w-full xs:w-auto justify-end">
                      <Btn variant={a.primaryCta === "HIC" ? "red" : "green"}>{a.primaryCta}</Btn>
                      <Btn variant="azure">{a.secondaryCta}</Btn>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Chat */}
            <Card title="Ask Waswa (chat)" subtitle="Natural language ops • cost-aware answers (tokenized)">
              <div className="flex flex-col gap-2.5">
                <div className="self-start max-w-[92%] bg-[#E7FFEF] border border-[#BEF0D2] rounded-xl px-3 py-2.5 text-[12px] leading-snug">
                  Why is token burn up today?
                </div>
                <div className="self-end max-w-[92%] bg-[#F1F4F6] border border-[#E9EDEF] rounded-xl px-3 py-2.5 text-[12px] leading-snug">
                  Root cause: 1) Airtel UG retries (+0.18 Tok/s), 2) SSE clients surge (+0.11 Tok/s), 3) Kafka replays (+0.06 Tok/s). Recommend: backoff + per-tenant caps.
                </div>
                <div className="self-start max-w-[92%] bg-[#E7FFEF] border border-[#BEF0D2] rounded-xl px-3 py-2.5 text-[12px] leading-snug">
                  Create an 80% burn alert + WhatsApp notify.
                </div>
                <div className="self-end max-w-[92%] bg-[#F1F4F6] border border-[#E9EDEF] rounded-xl px-3 py-2.5 text-[12px] leading-snug">
                  Draft created (HITL). Impact: +0.02 Tok/s for notifications. Approve to activate for OLIWA_CORP_UG, PIKI_KLA_POOL.
                </div>
              </div>

              {/* Chat input */}
              <div className="flex gap-2 mt-1">
                <input
                  placeholder="Tell Waswa to…"
                  className="flex-1 h-9 rounded-full border border-[#E9EDEF] px-3.5 text-[13px] outline-none focus:border-[#128C7E] transition-colors"
                />
                <button className="w-10 h-9 rounded-full bg-[#25D366] text-white font-black cursor-pointer hover:brightness-105 shrink-0">
                  ➤
                </button>
              </div>
            </Card>
          </div>
        </section>
      </main>

      {showTaskManager && <TaskManagerModal onClose={() => setShowTaskManager(false)} />}
    </>
  );
}