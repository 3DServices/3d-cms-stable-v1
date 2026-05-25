/**
 * VebaPage — Screen 09: ESCROW & SETTLEMENT CONTROL ROOM
 *
 * Matches v26 mockups (9 screenshots):
 *   TOP:     Header + 4 KPIs → 2-col (Gateway Health | Waswa Co-Pilot) → Settlement Queue
 *   MID:     Settlement Queue (full) with action buttons
 *   BOTTOM:  2-col (Dispute Inbox | Payout Runs Batch)
 *   BLADE:   Booking Review (tabs: Overview, Payments, Telemetry Proof, Audit)
 *   MODAL:   HIC Manual Settlement Override (3 scroll sections)
 */
import React, { useState } from "react";

// ─── Status dots ─────────────────────────────────────────────────────────────
const sDot: Record<string, string> = {
  Online:   "bg-[#25D366]",
  Degraded: "bg-[#F97316]",
  Latency:  "bg-[#F97316]",
  Outage:   "bg-[#EF4444]",
};
const escDot: Record<string, string> = {
  Funded:  "bg-[#25D366]",
  Pending: "bg-[#9CA3AF]",
  Hold:    "bg-[#F97316]",
};
const dspDot: Record<string, string> = {
  warn:  "bg-[#FBBF24]",
  crit:  "bg-[#EF4444]",
  ok:    "bg-[#25D366]",
  alarm: "bg-[#F97316]",
};
const runDot: Record<string, string> = {
  Completed: "bg-[#25D366]",
  Partial:   "bg-[#FBBF24]",
  Failed:    "bg-[#EF4444]",
};

function riskColor(r: number) {
  if (r < 0.3) return "text-[#25D366]";
  if (r < 0.6) return "text-[#FBBF24]";
  if (r < 0.8) return "text-[#F97316]";
  return "text-[#EF4444]";
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const GATEWAYS = [
  { provider:"M-Pesa (Safaricom)", region:"KE", status:"Online",   success:"98.2%", lag:"0.7s" },
  { provider:"Airtel Money",       region:"UG", status:"Degraded", success:"94.6%", lag:"8.9s" },
  { provider:"MTN MoMo",           region:"UG", status:"Online",   success:"97.4%", lag:"1.2s" },
  { provider:"Airtel Money",       region:"KE", status:"Online",   success:"96.9%", lag:"2.2s" },
  { provider:"Cards (DPO/Pesapal)",region:"EA", status:"Latency",  success:"92.8%", lag:"14.1s"},
  { provider:"Flutterwave",        region:"EA", status:"Online",   success:"95.1%", lag:"3.5s" },
];

const SETTLEMENTS = [
  { id:"VEBA-UG-20481", asset:"Boda • UAX 221P",       owner:"Kato Rentals",     amount:"UGX 85,000",    escrow:"Funded",  risk:0.18, eta:"~12m" },
  { id:"VEBA-KE-11802", asset:"Van • KDA 910X",         owner:"Mombasa Shuttles", amount:"KES 6,500",     escrow:"Funded",  risk:0.62, eta:"~45m" },
  { id:"VEBA-UG-20490", asset:"Dozer D6 • D6-03",       owner:"Kampala Plant",    amount:"UGX 5,400,000", escrow:"Hold",    risk:0.71, eta:"—"    },
  { id:"VEBA-KE-11816", asset:"Reefer • KCF 202L",      owner:"FreshChain",       amount:"KES 28,000",    escrow:"Funded",  risk:0.33, eta:"~20m" },
  { id:"VEBA-UG-20501", asset:"Ambulance • UBM 114K",   owner:"CityCare",         amount:"UGX 420,000",   escrow:"Funded",  risk:0.12, eta:"~9m"  },
  { id:"VEBA-KE-11841", asset:"Crane • CR-07",           owner:"Nairobi Lifts",    amount:"KES 95,000",    escrow:"Pending", risk:0.54, eta:"—"    },
  { id:"VEBA-UG-20511", asset:"TukTuk • UGD 553B",      owner:"BodaHub",          amount:"UGX 55,000",    escrow:"Funded",  risk:0.27, eta:"~14m" },
  { id:"VEBA-UG-20515", asset:"Generator 60kVA",         owner:"PowerRent",        amount:"UGX 780,000",   escrow:"Funded",  risk:0.40, eta:"~31m" },
];

const DISPUTES = [
  { case:"DSP-771", booking:"VEBA-KE-11802", reason:"Chargeback",  age:"2d", sev:"warn"  },
  { case:"DSP-776", booking:"VEBA-UG-20490", reason:"Damage claim",age:"9d", sev:"crit"  },
  { case:"DSP-780", booking:"VEBA-UG-20511", reason:"No-show",     age:"6h", sev:"ok"    },
  { case:"DSP-781", booking:"VEBA-KE-11841", reason:"Wrong asset", age:"1d", sev:"alarm" },
];

const PAYOUT_RUNS = [
  { time:"12:00", status:"Completed", payouts:"118", link:true },
  { time:"10:00", status:"Completed", payouts:"95",  link:true },
  { time:"08:00", status:"Partial",   payouts:"81",  link:true },
  { time:"06:00", status:"Failed",    payouts:"0",   link:true },
];

const BLADE_TABS = ["Overview","Payments","Telemetry Proof","Audit"];

// ─── Page ────────────────────────────────────────────────────────────────────
export function VebaPage() {
  const [bladeOpen, setBladeOpen] = useState(false);
  const [bladeTab, setBladeTab] = useState("Overview");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden relative">
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col gap-3 p-3">

          {/* ── Page Header ────────────────────────────────────────────────── */}
          <div className="bg-white border border-[#E9EDEF] rounded-xl px-4 py-3">
            <div className="text-[10px] font-black text-[#128C7E] bg-[#EAF7F3] border border-[#128C7E] px-2 py-0.5 rounded-full inline-block mb-1">SCREEN 09 • VEBA Marketplace</div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-black text-[16px] text-[#111B21]">Escrow &amp; Settlement Control Room</div>
                <nav className="text-[11px] text-[#667781] mt-0.5">VEBA Bookings Ops &rsaquo; Escrow • Disputes • Settlement • Mobile Money</nav>
              </div>
              <div className="flex gap-2 shrink-0">
                <Pill color="green">+ New Case</Pill>
                <Pill color="dark">Run Recon</Pill>
                <Pill>Export</Pill>
                <Pill>Policies</Pill>
              </div>
            </div>
          </div>

          {/* ════════════════════ TOP SCROLL ════════════════════════════════ */}

          {/* ── 4 KPI Cards ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-3">
            <KpiCard id="EBSC-01" title="Escrow Balance" value="UGX 2.84B" sub="Δ +4.1% (24h)" dot="bg-[#25D366]" />
            <KpiCard id="SET-01" title="Settlement p95" value="38m" sub="Target < 15m" dot="bg-[#F97316]" />
            <KpiCard id="DSP-01" title="Disputes Aging" value="71 open" sub="12 > 7d" dot="bg-[#EF4444]" />
            <KpiCard id="LEAK-01" title="Leakage Prevented" value="1,284" sub="Saved est. 3.6%" dot="bg-[#34B7F1]" />
          </div>

          {/* ── 2-col: Gateway Health | Waswa Co-Pilot ───────────────────── */}
          <div className="grid grid-cols-[1.2fr_0.8fr] gap-3 items-start">
            {/* Gateway Health */}
            <div className="bg-white border border-[#E9EDEF] rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#E9EDEF]">
                <div className="font-black text-[12px] text-[#667781]">PAY-01</div>
                <div className="font-black text-[13px] text-[#111B21]">Gateway Health (Realtime)</div>
              </div>
              <table className="w-full text-[12px] table-fixed">
                <thead><tr className="bg-[#F8FAFC] border-b border-[#E9EDEF]">
                  {["Provider","Region","Status","Success%","Webhook lag"].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-black text-[#667781]">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {GATEWAYS.map((g, i) => (
                    <tr key={i} className="border-b border-[#E9EDEF] last:border-0 hover:bg-[#F8FAFC]">
                      <td className="px-3 py-2.5 font-extrabold text-[#111B21]">{g.provider}</td>
                      <td className="px-3 py-2.5 text-[#667781]">{g.region}</td>
                      <td className="px-3 py-2.5">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${sDot[g.status] ?? "bg-[#667781]"}`} />
                          <span className={g.status !== "Online" ? "text-[#F97316] font-black" : "text-[#111B21]"}>{g.status}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-[#111B21]">{g.success}</td>
                      <td className="px-3 py-2.5 text-[#667781]">{g.lag}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Waswa Co-Pilot */}
            <div className="bg-white border border-[#E9EDEF] rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#E9EDEF]">
                <div className="font-black text-[12px] text-[#667781]">AI-01</div>
                <div className="font-black text-[13px] text-[#111B21]">Waswa Co-Pilot (HiC)</div>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="bg-[#F8FAFC] border border-[#E9EDEF] rounded-xl p-3">
                  <div className="font-black text-[12px] text-[#111B21]">Insight: Potential payout leakage</div>
                  <div className="text-[11px] text-[#667781] mt-1">Detected 7 bookings with contact-unlock before escrow funded.</div>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E9EDEF] rounded-xl p-3">
                  <div className="font-black text-[12px] text-[#111B21]">Risk Cluster: chargeback ring (KE)</div>
                  <div className="text-[11px] text-[#667781] mt-1">3 cards, 1 device fingerprint, same refund pattern (HITL).</div>
                </div>
                <div>
                  <div className="font-black text-[12px] text-[#111B21] mb-1.5">Recommended Actions</div>
                  {[
                    { dot:"bg-[#FBBF24]", text:"Hold payouts > UGX 5M pending review" },
                    { dot:"bg-[#34B7F1]", text:"Enable idempotency strict mode (US-03)" },
                    { dot:"bg-[#EF4444]", text:"Auto-escalate disputes > 7d (P2)" },
                  ].map(a => (
                    <div key={a.text} className="flex items-center gap-2 text-[11px] mb-1">
                      <span className={`w-2 h-2 rounded-full ${a.dot} shrink-0`} />
                      <span className="text-[#111B21]">{a.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════════ MID SCROLL ════════════════════════════════ */}

          {/* ── Settlement Queue ──────────────────────────────────────────── */}
          <div className="bg-white border border-[#E9EDEF] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E9EDEF]">
              <div className="font-black text-[13px] text-[#111B21]">SET-02  Settlement Queue (Escrow → Payout) • HITL approvals required for refunds/holds</div>
            </div>
            {/* Filters */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#E9EDEF]">
              <input defaultValue="Status: Pending ▾" className="h-8 rounded-lg border border-[#E9EDEF] bg-[#F8FAFC] px-3 text-[12px] text-[#111B21] w-[160px] outline-none" />
              <input defaultValue="Region: UG/KE ▾" className="h-8 rounded-lg border border-[#E9EDEF] bg-[#F8FAFC] px-3 text-[12px] text-[#111B21] w-[160px] outline-none" />
              <input placeholder="Search Booking/Ref…" className="h-8 rounded-lg border border-[#E9EDEF] bg-[#F8FAFC] px-3 text-[12px] text-[#667781] w-[180px] outline-none" />
              <div className="ml-auto">
                <Pill color="dark">Open Payout Runner →</Pill>
              </div>
            </div>
            <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-[12px] min-w-[900px]">
              <thead><tr className="bg-[#F8FAFC] border-b border-[#E9EDEF]">
                {[
                  {h:"Booking",w:"w-[140px]"},{h:"Asset",w:""},{h:"Owner",w:""},{h:"Amount",w:"w-[110px]"},
                  {h:"Escrow",w:"w-[72px]"},{h:"Risk",w:"w-[60px]"},{h:"ETA",w:"w-[52px]"},{h:"Actions",w:"w-[180px]"},
                ].map(c => (
                  <th key={c.h} className={`text-left px-3 py-2 font-black text-[#667781] ${c.w} ${c.h==="Actions"?"text-center":""}`}>{c.h}</th>
                ))}
              </tr></thead>
              <tbody>
                {SETTLEMENTS.map(s => (
                  <tr key={s.id} className="border-b border-[#E9EDEF] last:border-0 hover:bg-[#F8FAFC]">
                    <td className="px-3 py-2.5 font-black text-[#111B21] whitespace-nowrap">{s.id}</td>
                    <td className="px-3 py-2.5 text-[#111B21]">{s.asset}</td>
                    <td className="px-3 py-2.5 text-[#667781]">{s.owner}</td>
                    <td className="px-3 py-2.5 font-black text-[#111B21] whitespace-nowrap">{s.amount}</td>
                    <td className="px-3 py-2.5">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${escDot[s.escrow] ?? "bg-[#667781]"}`} />
                        <span className="text-[#111B21]">{s.escrow}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${riskColor(s.risk).replace("text-","bg-")}`} />
                        <span className={`font-black ${riskColor(s.risk)}`}>{s.risk.toFixed(2)}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[#667781]">{s.eta}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1.5 justify-center whitespace-nowrap">
                        <button onClick={() => { setBladeOpen(true); setBladeTab("Overview"); }} className="h-6 px-2.5 rounded-md bg-[#128C7E] text-white text-[10px] font-black border-none cursor-pointer">Review</button>
                        <button className="h-6 px-2.5 rounded-md bg-white border border-[#E9EDEF] text-[#111B21] text-[10px] font-black cursor-pointer">Hold</button>
                        <button onClick={() => setModalOpen(true)} className="h-6 px-2.5 rounded-md bg-white border border-[#EF4444] text-[#EF4444] text-[10px] font-black cursor-pointer">Refund</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="px-4 py-2 text-[10px] text-[#667781]">
              US-03: every payout emits immutable usage event → Kafka topic: navas.payments.usage (idempotent)
            </div>
            <div className="px-4 pb-2 text-[10px] text-[#667781]">
              HIC: Manual override requires approval + audit stamp (irreversible / irrefutable).
            </div>
          </div>

          {/* ════════════════════ BOTTOM SCROLL ═════════════════════════════ */}

          {/* ── 2-col: Dispute Inbox | Payout Runs ───────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            {/* Dispute Inbox */}
            <div className="bg-white border border-[#E9EDEF] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E9EDEF]">
                <div className="font-black text-[13px] text-[#111B21]">DSP-02  Dispute Inbox</div>
              </div>
              <table className="w-full text-[12px]">
                <thead><tr className="bg-[#F8FAFC] border-b border-[#E9EDEF]">
                  {["Case","Booking","Reason","Age",""].map((h, i) => (
                    <th key={i} className="text-left px-3 py-2 font-black text-[#667781]">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {DISPUTES.map(d => (
                    <tr key={d.case} className="border-b border-[#E9EDEF] last:border-0">
                      <td className="px-3 py-2.5">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${dspDot[d.sev] ?? "bg-[#667781]"}`} />
                          <span className="font-black text-[#111B21]">{d.case}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-[#111B21]">{d.booking}</td>
                      <td className="px-3 py-2.5 text-[#667781]">{d.reason}</td>
                      <td className="px-3 py-2.5 text-[#667781]">{d.age}</td>
                      <td className="px-3 py-2.5">
                        <span className="text-[#128C7E] font-black text-[11px] cursor-pointer">Open →</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payout Runs */}
            <div className="bg-white border border-[#E9EDEF] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E9EDEF]">
                <div className="font-black text-[13px] text-[#111B21]">SET-03  Payout Runs (Batch)</div>
              </div>
              <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E9EDEF] text-[11px] text-[#111B21]">
                <span className="font-black">Next run: 14:00 EAT</span> • Scope: UG + KE • Mode: Auto (HITL exceptions)
                <div className="text-[#667781] mt-0.5">Pending: 124 payouts • Est. value: UGX 38.4M + KES 1.2M</div>
              </div>
              <div className="flex flex-col">
                {PAYOUT_RUNS.map(r => (
                  <div key={r.time} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#E9EDEF] last:border-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${runDot[r.status] ?? "bg-[#667781]"} shrink-0`} />
                    <span className="font-black text-[12px] text-[#111B21] w-[44px]">{r.time}</span>
                    <span className="text-[12px] text-[#111B21]">• {r.status}</span>
                    <span className="text-[11px] text-[#667781] ml-1">Payouts: {r.payouts}</span>
                    <span className="text-[11px] text-[#128C7E] font-black ml-auto cursor-pointer">View log →</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── Right Blade: Booking Review ───────────────────────────────── */}
      {bladeOpen && (
        <div className="w-[440px] shrink-0 bg-white border-l border-[#E9EDEF] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#E9EDEF] shrink-0">
            <div>
              <div className="font-black text-[14px] text-[#111B21]">Booking Review Blade</div>
              <div className="text-[10px] text-[#667781]">VEBA escrow • Mobile Money payout • HITL/HIC audit</div>
            </div>
            <button onClick={() => setBladeOpen(false)} className="w-7 h-7 rounded-lg bg-[#F0F2F5] border border-[#E9EDEF] text-[#667781] font-black text-[13px] cursor-pointer grid place-items-center hover:bg-[#E9EDEF]">✕</button>
          </div>

          <div className="flex gap-1.5 px-5 py-2.5 border-b border-[#E9EDEF] shrink-0">
            {BLADE_TABS.map(t => (
              <button key={t} onClick={() => setBladeTab(t)} className={`h-8 px-3 rounded-full text-[11px] font-black border-none cursor-pointer transition-all ${bladeTab === t ? "bg-[#128C7E] text-white" : "bg-[#F0F2F5] text-[#667781] hover:bg-[#E9EDEF]"}`}>{t}</button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-5 py-4">
            {bladeTab === "Overview" && (
              <>
                {/* Booking info */}
                <BSection title="Booking: VEBA-KE-11802">
                  <div className="p-4 text-[11px] text-[#667781]">Asset: Van • KDA 910X  •  Route: Nairobi CBD</div>
                </BSection>

                <BSection title="Escrow & Amount">
                  <div className="p-4">
                    <KV rows={[
                      { k:"Quoted",         v:"KES 6,500" },
                      { k:"Escrow funded",  v:"KES 6,500  (Ref: MPX-8821)" },
                      { k:"Commission",     v:"5%  (KES 325)" },
                      { k:"Tokens burned",  v:"~ 420 tok (settlement + messaging + audit)" },
                      { k:"Payout",         v:"KES 6,175  → Owner Wallet" },
                    ]} />
                  </div>
                </BSection>

                <BSection title="Risk & Fraud">
                  <div className="p-4">
                    <KV rows={[
                      { k:"Waswa risk score", v:"0.62  (MED)" },
                      { k:"Signals",          v:"1) device fingerprint reuse  2) refund attempts" },
                    ]} />
                    <div className="mt-3 bg-[#EAF7F3] border border-[#128C7E]/20 rounded-lg p-3">
                      <div className="font-black text-[12px] text-[#128C7E]">Waswa suggestion</div>
                      <div className="text-[11px] text-[#667781] mt-1">Hold payout and request manual review (HITL).</div>
                    </div>
                  </div>
                </BSection>

                <BSection title="Mobile Money Payout">
                  <div className="p-4">
                    <KV rows={[
                      { k:"Channel",  v:"M-Pesa" },
                      { k:"MSISDN",   v:"+254 7XX XXX XXX" },
                      { k:"Name",     v:"Mombasa Shuttles Ltd" },
                      { k:"Provider", v:"Safaricom KE" },
                      { k:"Webhook",  v:"pending (lag 8.9s)" },
                    ]} />
                  </div>
                </BSection>

                <BSection title="Actions (HITL/HIC)">
                  <div className="p-4 flex flex-col gap-2.5">
                    <div className="flex items-center gap-3">
                      <button className="h-9 px-4 rounded-lg bg-[#25D366] text-[#075E54] text-[12px] font-black border-none cursor-pointer flex-1">Approve Payout</button>
                      <span className="text-[11px] text-[#667781]">☐ HITL</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="h-9 px-4 rounded-lg bg-white border border-[#E9EDEF] text-[#111B21] text-[12px] font-black cursor-pointer flex-1">Hold + Open Case</button>
                      <span className="text-[11px] text-[#667781]">Logs audit</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setModalOpen(true)} className="h-9 px-4 rounded-lg bg-[#EF4444] text-white text-[12px] font-black border-none cursor-pointer flex-1">Refund</button>
                      <span className="text-[11px] text-[#667781]">☐ HITL + 2FA</span>
                    </div>
                  </div>
                </BSection>

                <BSection title="Audit Snapshot">
                  <div className="p-4 text-[11px] text-[#667781] leading-relaxed">
                    <div>• 13:22 Escrow funded (MPX-8821)</div>
                    <div>• 13:24 Waswa flagged MED risk (0.62)</div>
                    <div>• 13:25 Admin opened blade (SA)</div>
                    <div>• 13:26 Awaiting HITL approval</div>
                  </div>
                </BSection>

                <div className="text-[10px] text-[#667781] italic mt-1">Scroll note: inner blade has its own scroll</div>
              </>
            )}

            {bladeTab === "Payments" && (
              <BSection title="Payment History">
                <div className="p-4 text-[12px] text-[#667781]">Payment webhook timeline, retry logs, and settlement confirmations for this booking.</div>
              </BSection>
            )}
            {bladeTab === "Telemetry Proof" && (
              <BSection title="Telemetry Evidence">
                <div className="p-4 text-[12px] text-[#667781]">GPS trail, ignition events, trip proof, and sensor data used as settlement evidence.</div>
              </BSection>
            )}
            {bladeTab === "Audit" && (
              <BSection title="Full Audit Chain">
                <div className="p-4 text-[12px] text-[#667781]">Hash-chained immutable audit log for this booking. Every action is recorded with actor, timestamp, and cryptographic proof.</div>
              </BSection>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: HIC Manual Settlement Override ─────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/35 z-50 grid place-items-center" onClick={() => setModalOpen(false)}>
          <div className="w-[min(900px,calc(100vw-24px))] max-h-[calc(100vh-24px)] bg-white rounded-xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="bg-[#075E54] text-white px-5 py-3 flex items-center justify-between shrink-0">
              <div>
                <div className="font-black text-[15px]">HIC Manual Settlement Override</div>
                <div className="text-[11px] opacity-80">Irreversible • Irrevocable • Irrefutable (audit-grade)</div>
              </div>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-lg bg-white/15 text-white font-black text-[14px] border-none cursor-pointer grid place-items-center hover:bg-white/25">✕</button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-5 bg-[#FBFBFB]">
              <MSection title="Override Target">
                <div className="text-[12px] text-[#667781] mb-3">Booking: VEBA-UG-20490 • Amount: UGX 5,400,000 • Escrow: HOLD</div>
              </MSection>

              <MSection title="Reason (Required)">
                <div className="text-[11px] text-[#667781] mb-2">Select the reason + attach evidence. This action is logged and non-repudiable.</div>
                <input defaultValue="Reason: Provider outage / stuck webhook ▾" className="w-full h-9 rounded-lg border border-[#E9EDEF] px-3 text-[12px] text-[#111B21] outline-none mb-3" />
                <div className="text-[10px] font-black text-[#667781] mb-1">Notes:</div>
                <textarea defaultValue={"M-Pesa callback missing > 6h. Customer has proof of payment.\nRequesting manual credit + immediate payout."} className="w-full rounded-lg border border-[#E9EDEF] p-3 text-[12px] text-[#111B21] outline-none min-h-[80px] resize-y" />
              </MSection>

              <MSection title="FX & Multi-currency">
                <div className="text-[11px] text-[#667781] mb-3">Confirm currency, FX source, and effective rate used for settlement.</div>
                <KV rows={[
                  { k:"Currency",       v:"UGX (display)" },
                  { k:"FX mode",        v:"Auto (Daily rate cache)" },
                  { k:"Effective rate",  v:"1 USD = 3,860 UGX" },
                  { k:"Fees",           v:"Gateway fee 1.2% + settlement token fee" },
                ]} />
              </MSection>

              <MSection title="Amounts">
                <div className="text-[11px] text-[#667781] mb-3">Breakdown must match escrow ledger. Token deductions are separate and must be emitted as US-03 events.</div>
                <KV rows={[
                  { k:"Escrow",          v:"UGX 5,400,000" },
                  { k:"Commission (5%)", v:"UGX 270,000" },
                  { k:"Payout to Owner", v:"UGX 5,130,000" },
                  { k:"Token burn estimate", v:"~ 3,200 tok" },
                ]} />
                <div className="mt-3 bg-[#FEF3C7] border border-[#FBBF24]/30 rounded-lg p-3 text-[12px] text-[#111B21]">
                  HITL rule: refunds/credits &gt; UGX 500,000 require approval + 2FA.
                </div>
              </MSection>

              <MSection title="Evidence Attachments">
                <div className="text-[11px] text-[#667781] mb-3">Attach screenshots, receipts, call logs. Stored with retention policy.</div>
                {[1,2,3].map(n => (
                  <div key={n} className="border border-[#E9EDEF] rounded-lg p-3 mb-2 text-[12px] text-[#128C7E] font-black cursor-pointer hover:bg-[#F8FAFC]">
                    + Add evidence file {n}
                  </div>
                ))}
              </MSection>

              <MSection title="Approvals">
                <div className="text-[11px] text-[#667781] mb-3">Select approver(s). Approval creates an immutable audit record (hash-chained).</div>
                <input defaultValue="Primary approver: Finance Admin (Top) ▾" className="w-full h-9 rounded-lg border border-[#E9EDEF] px-3 text-[12px] text-[#111B21] outline-none mb-2" />
                <input defaultValue="Secondary: Ops Lead (On-call) ▾" className="w-full h-9 rounded-lg border border-[#E9EDEF] px-3 text-[12px] text-[#111B21] outline-none mb-2" />
                <input defaultValue="SLA: P2: within 60 min ▾" className="w-full h-9 rounded-lg border border-[#E9EDEF] px-3 text-[12px] text-[#111B21] outline-none" />
              </MSection>

              <MSection title="2FA + Audit Stamp">
                <div className="text-[11px] text-[#667781] mb-3">Confirm your identity. The system records device fingerprint + session ID.</div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input placeholder="2FA code" className="h-9 rounded-lg border border-[#E9EDEF] px-3 text-[12px] text-[#111B21] outline-none" />
                  <input defaultValue="Session: SA-2026-02-24-13:27" className="h-9 rounded-lg border border-[#E9EDEF] px-3 text-[12px] text-[#667781] outline-none" />
                </div>
                <div className="bg-[#F8FAFC] border border-[#E9EDEF] rounded-lg p-3">
                  <div className="font-black text-[12px] text-[#111B21]">Preview audit stamp</div>
                  <div className="text-[11px] text-[#667781] font-mono mt-1">hash: 7b9f…c21a  •  actor: SYSTEM ADMIN  •  action: manual_override_requested</div>
                </div>
              </MSection>

              <div className="text-[11px] text-[#667781] italic mt-2">End of modal content.</div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-[#E9EDEF] bg-white shrink-0">
              <button onClick={() => setModalOpen(false)} className="h-10 px-5 rounded-lg bg-white border border-[#E9EDEF] text-[13px] font-black text-[#111B21] cursor-pointer hover:bg-[#F8FAFC]">Cancel</button>
              <button className="h-10 px-5 rounded-lg bg-[#EF4444] text-white text-[13px] font-black border-none cursor-pointer hover:brightness-110">Request Approval (HITL)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reusable components ─────────────────────────────────────────────────────
const pillStyles: Record<string, string> = {
  green: "bg-[#25D366] text-[#075E54]",
  dark:  "bg-[#075E54] text-white",
  ghost: "bg-white border border-[#E9EDEF] text-[#667781]",
};

function Pill({ color = "ghost", onClick, children }: { color?: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`h-7 px-3 rounded-full text-[11px] font-black border-none cursor-pointer hover:brightness-105 active:opacity-85 transition-all whitespace-nowrap ${pillStyles[color] ?? pillStyles.ghost}`}>{children}</button>
  );
}

function KpiCard({ id, title, value, sub, dot }: { id: string; title: string; value: string; sub: string; dot: string }) {
  return (
    <div className="bg-white border border-[#E9EDEF] rounded-xl p-3 relative">
      <span className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${dot}`} />
      <div className="text-[10px] font-black text-[#667781]">{id}</div>
      <div className="font-black text-[12px] text-[#111B21] mt-0.5">{title}</div>
      <div className="text-[22px] font-black text-[#111B21] mt-1 leading-tight">{value}</div>
      <div className="text-[11px] text-[#667781] mt-0.5">{sub}</div>
    </div>
  );
}

function BSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 border border-[#E9EDEF] rounded-xl overflow-hidden bg-white">
      <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E9EDEF]">
        <div className="font-black text-[12px] text-[#111B21]">{title}</div>
      </div>
      {children}
    </div>
  );
}

function MSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 border border-[#E9EDEF] rounded-xl overflow-hidden bg-white">
      <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E9EDEF]">
        <div className="font-black text-[13px] text-[#111B21]">{title}</div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function KV({ rows }: { rows: { k: string; v: string }[] }) {
  return (
    <div className="flex flex-col gap-2">
      {rows.map(r => (
        <div key={r.k} className="flex gap-3 text-[12px]">
          <span className="text-[#667781] w-[140px] shrink-0">{r.k}</span>
          <span className="font-black text-[#111B21]">{r.v}</span>
        </div>
      ))}
    </div>
  );
}