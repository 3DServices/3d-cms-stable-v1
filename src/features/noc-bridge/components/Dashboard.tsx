/**
 * Dashboard — Main Workspace
 *
 * Composes the two content blades:
 *   • System Health God View  (left / primary blade)
 *   • Waswa AI Co-Pilot       (right / AI blade)
 *
 * All styles use Tailwind utility classes only.
 */
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWaswa, WaswaAskChips, WaswaAskInput } from "../../../components/waswa";
import type{ HitlAction, Severity } from "../../../types";
import { Kpi, Card, Bar, MiniGateway, MiniStat } from "../../../components/ui";
import { TaskManagerModal } from "./TaskManagerModal";
import { GatewayHistoryModal } from "./GatewayHistoryModal";
import { getServerMetrics, getApiPerformance, getMobileMoneyGateways, getVebaStatistics } from "../../../api";
import type { ServerMetrics, ApiPerformanceMetrics, Gateway, VebaStatistics } from "../../../api";

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
// const VEBA_ROWS = [
//   { flag: "🔴", entity: "KLA_BODA_POOL", signal: "Leakage ×17",      action: "Gate contact unlock"  },
//   { flag: "🟠", entity: "OLIWA_CORP_UG",  signal: "Escrow ∆ 3.1M",   action: "Notify + escrow hold" },
//   { flag: "🟡", entity: "PIKI_KLA_POOL",  signal: "Settle delay 22m", action: "Retry STK push"       },
// ];

// Shared grid for VEBA table
// const TABLE_GRID = "grid grid-cols-[50px_1.4fr_1fr_1.8fr_32px] gap-2 items-center";

export function Dashboard() {
  const navigate = useNavigate();
  const waswa = useWaswa();
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [showGatewayHistory, setShowGatewayHistory] = useState(false);
  const hitl = useMemo(() => DEFAULT_HITL, []);

  // ── Server metrics from API ──────────────────────────────────────────────
  const [metrics, setMetrics] = useState<ServerMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // ── API performance metrics ────────────────────────────────────────────
  const [perf, setPerf] = useState<ApiPerformanceMetrics | null>(null);
  const [perfLoading, setPerfLoading] = useState(true);

  // ── Gateway status ────────────────────────────────────────────────────
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(true);

  // ── VEBA statistics ─────────────────────────────────────────────────
  const [veba, setVeba] = useState<VebaStatistics | null>(null);
  const [vebaLoading, setVebaLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    getServerMetrics({ signal: controller.signal })
      .then((data) => {
        setMetrics(data || null);
        setMetricsLoading(false);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setMetricsLoading(false);
      });
    getApiPerformance({ signal: controller.signal })
      .then((data) => {
        setPerf(data || null);
        setPerfLoading(false);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setPerfLoading(false);
      });
    getMobileMoneyGateways({ signal: controller.signal })
      .then((data) => {
        setGateways(data.gateways || []);
        setGatewaysLoading(false);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setGatewaysLoading(false);
      });
    getVebaStatistics({ signal: controller.signal })
      .then((data) => {
        setVeba(data || null);
        setVebaLoading(false);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setVebaLoading(false);
      });
    return () => controller.abort();
  }, []);

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
            <span className="font-extrabold text-[#111B21] text-[13px]">System Health </span>
            <span className="ml-auto text-[11px] text-[#667781]">refresh 30s</span>
          </div>

          {/* Blade content */}
          <div className="p-3 md:p-3.5 flex flex-col gap-3.5 overflow-y-auto flex-1">

            {/* KPI grid — 1 col on xs, 2 col on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Kpi
                title="Uptime (30d)"
                value={perfLoading || !perf || !perf.uptime?.percentage_30d ? "—" : `${perf.uptime.percentage_30d}%`}
                sub={perfLoading || !perf || !perf.api_latency?.p95_ms || !perf.error_rates?.error_5xx_rate_percent ? "Loading…" : `p95 ${perf.api_latency.p95_ms.toFixed(0)}ms • 5xx ${perf.error_rates.error_5xx_rate_percent}%`}
                sev={!perf || !perf.uptime?.percentage_30d ? "green" : perf.uptime.percentage_30d >= 99.5 ? "green" : perf.uptime.percentage_30d >= 99 ? "warning" : "alarm"}
              />
              <Kpi
                title="API Latency p95"
                value={perfLoading || !perf || !perf.api_latency?.p95_ms ? "—" : `${perf.api_latency.p95_ms.toFixed(0)}ms`}
                sub={perfLoading || !perf || !perf.api_latency?.p50_ms || !perf.api_latency?.p99_ms ? "Loading…" : `p50 ${perf.api_latency.p50_ms.toFixed(0)}ms • p99 ${perf.api_latency.p99_ms.toFixed(0)}ms`}
                sev={!perf || !perf.api_latency?.p95_ms ? "green" : perf.api_latency.p95_ms < 500 ? "green" : perf.api_latency.p95_ms < 1000 ? "warning" : "alarm"}
              />
              <Kpi
                title="Kafka Lag"
                value={perfLoading || !perf || !perf.kafka?.consumer_lag?.total_lag ? "—" : perf.kafka.consumer_lag.total_lag.toLocaleString()}
                sub={perfLoading || !perf || !perf.kafka?.consumer_lag ? "Loading…" : `group: ${perf.kafka.consumer_lag.consumer_group || '—'} • ${Object.keys(perf.kafka.consumer_lag.by_topic || {}).length} topics`}
                sev={!perf || !perf.kafka?.consumer_lag?.total_lag ? "green" : perf.kafka.consumer_lag.total_lag < 500 ? "green" : perf.kafka.consumer_lag.total_lag < 1000 ? "warning" : "alarm"}
              />
              <Kpi
                title="Request Rate"
                value={perfLoading || !perf || !perf.request_rates?.requests_per_second ? "—" : `${perf.request_rates.requests_per_second.toFixed(1)} req/s`}
                sub={perfLoading || !perf || !perf.error_rates?.total_requests || !perf.error_rates?.success_rate_percent ? "Loading…" : `${perf.error_rates.total_requests.toLocaleString()} total • ${perf.error_rates.success_rate_percent}% success`}
                sev={!perf || !perf.error_rates?.error_5xx_rate_percent ? "green" : perf.error_rates.error_5xx_rate_percent < 1 ? "green" : perf.error_rates.error_5xx_rate_percent < 3 ? "warning" : "alarm"}
              />
            </div>

            {/* Compute */}
            <Card title="Compute & System Resource Usage" subtitle={metricsLoading ? "Loading…" : metrics && metrics.hostname && metrics.window_sec ? `${metrics.hostname} • window ${metrics.window_sec}s` : "Percentages (cluster)"}>
              <Bar label="CPU"       pct={metrics && metrics.system ? metrics.system.cpu_percent / 100 : 0}                          meta={metrics && metrics.system ? `${metrics.system.cpu_percent}%` : "—"} />
              <Bar label="RAM Used"  pct={metrics && metrics.system ? metrics.system.memory_percent / 100 : 0}                       meta={metrics && metrics.system ? `${metrics.system.memory_percent}%` : "—"} warn={metrics && metrics.system ? metrics.system.memory_percent > 80 : false} />
              <Bar label="Disk Used" pct={metrics && metrics.system ? metrics.system.disk_space_root_percent / 100 : 0}              meta={metrics && metrics.system ? `${metrics.system.disk_space_root_percent}%` : "—"} />
              <div className="flex flex-wrap gap-2 mt-1">
                <Btn variant="azure" onClick={() => setShowTaskManager(true)}>Open Task Manager</Btn>
              </div>
            </Card>

            {/* Payments */}
            <Card title="Payments & Mobile Money Gateways" subtitle={gatewaysLoading ? "Loading…" : `Real-time status • ${gateways.length} gateways`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {gatewaysLoading
                  ? <span className="text-[11px] text-[#667781] col-span-2">Loading gateways…</span>
                  : gateways.map((gw) => (
                    <MiniGateway key={gw.id} name={gw.name} status={gw.status} meta={gw.meta} sev={gw.sev} />
                  ))
                }
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <Btn variant="azure" onClick={() => setShowGatewayHistory(true)}>View retries</Btn>
                {/* <Btn variant="green">+ New webhook rule</Btn>
                <Btn variant="azure">Export recon</Btn> */}
              </div>
            </Card>

            {/* VEBA */}
            <Card title="VEBA Governance • Leakage Prevention" subtitle={vebaLoading ? "Loading…" : "Listings + tendering"}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <MiniStat label="Bookings today"   value={vebaLoading || !veba || veba.bookings_today == null ? "—" : veba.bookings_today.toLocaleString()} />
                <MiniStat label="Leakage attempts" value={vebaLoading || !veba || veba.leakage_attempts == null ? "—" : veba.leakage_attempts.toLocaleString()} />
                <MiniStat label="Settlement p95"   value={vebaLoading || !veba || !veba.settlement_p95 ? "—" : veba.settlement_p95} />
              </div>

              {/* Scrollable table wrapper
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
              </div> */}

              {/* <div className="flex flex-wrap gap-2 mt-1">
                <Btn variant="azure">View all flags</Btn>
                <Btn variant="green">+ New leakage rule</Btn>
              </div> */}
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
            <Card title="Waswa AI • Ops Co‑Pilot" subtitle="Sample insights — live ops insights are not connected yet">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`rounded-full px-2.5 py-1 text-[12px] font-extrabold text-white ${waswa.on ? "bg-[#25D366]" : "bg-[#9CA3AF]"}`}>
                  {waswa.on ? "ON" : "OFF"}
                </span>
                <span className="text-[12px] text-[#667781] leading-snug">
                  System Health 99.82% • leakage risk (VEBA) • suggest 5k mint
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <Btn variant="azure" onClick={() => navigate("/ai?tab=queue")}>Open review queue</Btn>
                <Btn variant="teal" onClick={() => waswa.open("What does the NOC Bridge monitor, and what do its health indicators mean?")}>Ask why?</Btn>
                <Btn variant="ghost" onClick={waswa.toggle}>{waswa.on ? "Turn Waswa off" : "Turn Waswa on"}</Btn>
              </div>
            </Card>

            {/* HITL actions */}
            <Card title="HITL / HIC Pending Actions" subtitle="Sample data — high-risk actions require approval + audit">
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
            <Card title="Ask Waswa (chat)" subtitle="Answers from approved company knowledge · opens the Waswa chat">
              <WaswaAskChips
                label=""
                prompts={[
                  "How is token burn measured?",
                  "Which actions need HIC approval?",
                  "What does the NOC Bridge monitor?",
                ]}
              />
              <WaswaAskInput placeholder="Ask Waswa…" className="mt-1" />
            </Card>
          </div>
        </section>
      </main>

      {showTaskManager && <TaskManagerModal onClose={() => setShowTaskManager(false)} metrics={metrics} />}
      {showGatewayHistory && <GatewayHistoryModal onClose={() => setShowGatewayHistory(false)} gateways={gateways} />}
    </>
  );
}