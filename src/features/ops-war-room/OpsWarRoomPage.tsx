/**
 * OpsWarRoomDashboard — NAVAS v26 Screen 03: OPS WAR ROOM
 *
 * System Admin / Executive view. Three-column blade layout:
 *   Left:   AccordionSidebar (CMS module tree)
 *   Center: Main workspace (KPIs → alarms → gateways → token burn → HITL table)
 *   Right:  WaswaAIPanel (insights + HITL queue + chat)
 *
 * ─── Reused from the shared component library ───────────────────────────────
 *   TopBar            primary nav bar with search + RBAC
 *   StatusStrip       scrollable context chips bar
 *   NavRail           primary icon rail (desktop) / bottom tab bar (mobile)
 *   OpsKpiCard        KPI card with tone accent + delta badge
 *
 * ─── New components built for this screen ───────────────────────────────────
 *   AccordionSidebar  collapsible grouped module nav (replaces flat Sidebar)
 *   AlarmTable        live alarms P1/P2/P3 with severity dots
 *   GatewayTable      payment gateway health + VEBA mini stats
 *   TokenBurnChart    horizontal bar chart for token burn by product
 *   HITLApprovalTable HITL/HIC approval queue table
 *   WaswaAIPanel      right AI panel: insights + HITL + quick actions + chat
 *   OpsBriefModal     5-section daily ops brief modal
 *
 * Backend integration points (suggested):
 *   GET  /api/ops/summary?tenant=...
 *   GET  /api/alarms/top?tenant=...
 *   GET  /api/token/health?tenant=...
 *   GET  /api/payments/health?tenant=...
 *   GET  /api/veba/health?tenant=...
 *   GET  /api/audit/approvals?tenant=...
 *   SSE  /api/stream/ops?tenant=...   (real-time updates)
 */
import React, { useEffect, useMemo, useState } from "react";

// ── Shared library components ─────────────────────────────────────────────────
import { TopBar }      from "../../components/navigation";
import { StatusStrip } from "../../components/navigation";
import { NavRail }     from "../../components/navigation";

import { OpsKpiCard }  from "./components/OpsKpiCard";

// ── New components (this screen) ──────────────────────────────────────────────
import { AccordionSidebar, } from "../../components/navigation";
import type { AccordionNavGroup } from "../../components/navigation";
import { AlarmTable,  }             from "./components/AlarmTable";
import type { AlarmRow } from "./components/AlarmTable";
import { GatewayTable,} from "./components/GatewayTable";
import type { VebaMiniStat } from "./components/GatewayTable";
import type { GatewayRow } from "./components/GatewayTable";
import { TokenBurnChart,  }            from "./components/TokenBurnChart";
import type { BurnRow } from "./components/TokenBurnChart";
import { HITLApprovalTable, }     from "../aegis/components/HITLApprovalTable";
import type { ApprovalRow } from "../aegis/components/HITLApprovalTable";
import { WaswaAIPanel }    from "../../components/waswa";
import { OpsBriefModal }   from "./components/OpsBriefModal";




// ─────────────────────────────────────────────────────────────────────────────
// Nav data
// ─────────────────────────────────────────────────────────────────────────────
const NAV_GROUPS: AccordionNavGroup[] = [
  {
    id: "command", title: "Command & Control",
    items: [
      { id: "login",   label: "Login & SSO"              },
      { id: "ops",     label: "Ops + Business Dashboard", badge: "LIVE" },
      { id: "health",  label: "System Health CMS",        path: "/health"  },
      { id: "alarms",  label: "Alarm Center",             path: "/alarms"  },
      { id: "ai",      label: "AI Console",               path: "/ai"      },
      { id: "logout",  label: "Logout & Post-Logout"      },
    ],
  },
  {
    id: "token", title: "Tokenomics & Revenue",
    items: [
      { id: "token_engine", label: "Token Engine",           path: "/tokens"   },
      { id: "rev",          label: "Revenue Hub"             },
      { id: "billing",      label: "Billing & Invoicing",    path: "/billing"  },
      { id: "payments",     label: "Payments & Mobile Money",path: "/payments" },
    ],
  },
  {
    id: "infra", title: "Infrastructure & Connectivity",
    items: [
      { id: "devices",      label: "Devices Inventory"   },
      { id: "integrations", label: "Device Integrations" },
      { id: "ota",          label: "Firmware & OTA"      },
      { id: "sims",         label: "SIMs & Connectivity" },
      { id: "api",          label: "Integrations (API)"  },
    ],
  },
  {
    id: "governance", title: "Asset & Resource Governance",
    items: [
      { id: "assets",   label: "Assets (Digital Twin)" },
      { id: "clients",  label: "Clients & Accounts"    },
      { id: "resources",label: "Resources Manager"     },
      { id: "rbac",     label: "RBAC & Access",        path: "/rbac"  },
      { id: "drivers",  label: "Driver & Personnel"    },
      { id: "audit",    label: "Audit Logs & Compliance", path: "/audit" },
    ],
  },
  {
    id: "gis", title: "Telematics & GIS Ops",
    items: [
      { id: "dispatch",  label: "Live Dispatch"    },
      { id: "playback",  label: "Trip Playback"    },
      { id: "geofences", label: "Geofences & POIs" },
      { id: "jms",       label: "Journey MS"       },
      { id: "fuel",      label: "Fuel & Sensors"   },
      { id: "video",     label: "Video Telematics" },
    ],
  },
  {
    id: "veba", title: "VEBA Marketplace & Mobility",
    items: [
      { id: "veba_gov", label: "VEBA Governance",   path: "/veba"   },
      { id: "veba_ops", label: "VEBA Bookings Ops"  },
    ],
  },
  {
    id: "utility", title: "Utility & Support Services",
    items: [
      { id: "msg",      label: "Messaging Portal" },
      { id: "reports",  label: "Reports & BI"     },
      { id: "helpdesk", label: "Helpdesk & Field"  },
      { id: "apps",     label: "Add-on Apps"       },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// StatusStrip chips — Ops War Room context
// ─────────────────────────────────────────────────────────────────────────────
const OPS_CHIPS = [
  { id: "tenant",  label: "Tenant: 3D / DEMO-UG (Dealer)"   },
  { id: "tokens",  label: "Pool: 4,120,500"                  },
  { id: "burn",    label: "Burn: 1.62 t/s"                   },
  { id: "health",  label: "Health: 🟢 Green"                 },
  { id: "kafka",   label: "Kafka OK"                         },
  { id: "redis",   label: "Redis 12ms"                       },
  { id: "api",     label: "API 5xx 0.8%"                     },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mock data (replace with API hooks)
// ─────────────────────────────────────────────────────────────────────────────
const ALARMS: AlarmRow[] = [
  { id: "a1", name: "Offline spike — Kampala Boda",      count: 318, severity: "alarm",    age: "12m", channel: "WhatsApp" },
  { id: "a2", name: "Fuel drop cluster — MAFUTA",        count: 44,  severity: "critical", age: "3m",  channel: "In-app"   },
  { id: "a3", name: "Overspeed in geofence — TEPU",      count: 96,  severity: "warning",  age: "21m", channel: "WhatsApp" },
  { id: "a4", name: "Payment callbacks failing (p95 9.4s)",count: 19, severity: "alarm",   age: "8m",  channel: "Email"    },
];

const GATEWAYS: GatewayRow[] = [
  { id: "g1", provider: "M-Pesa",       successRate: 89.4, p95LatencySec: 7.2, backlog: 28, status: "Degraded" },
  { id: "g2", provider: "MTN MoMo",     successRate: 96.2, p95LatencySec: 3.1, backlog: 6,  status: "OK"       },
  { id: "g3", provider: "Airtel Money", successRate: 93.7, p95LatencySec: 4.6, backlog: 9,  status: "OK"       },
  { id: "g4", provider: "Cards",        successRate: 98.1, p95LatencySec: 2.0, backlog: 1,  status: "OK"       },
];

const VEBA_MINIS: VebaMiniStat[] = [
  { id: "v1", metric: "Escrow settlement delay",     value: "p95 42m",  tone: "warn"    },
  { id: "v2", metric: "Disputes aging >7d",          value: "13",       tone: "warn"    },
  { id: "v3", metric: "Leakage prevented",           value: "11 (24h)", tone: "good"    },
  { id: "v4", metric: "Owner verification pending",  value: "7",        tone: "neutral" },
];

const BURN_ROWS: BurnRow[] = [
  { label: "OLIWA",      value: 42, tone: "good" },
  { label: "PIKI",       value: 29, tone: "good" },
  { label: "VEBA",       value: 18, tone: "warn" },
  { label: "AI / Video", value: 66, tone: "bad"  },
  { label: "Messaging",  value: 24, tone: "warn" },
];

const APPROVALS: ApprovalRow[] = [
  { id: "p1", time: "14:06", action: "Price rule edit", state: "Pending",  actor: "sysadmin" },
  { id: "p2", time: "13:52", action: "Refund",          state: "Pending",  actor: "finance"  },
  { id: "p3", time: "12:31", action: "Kill-switch",     state: "Approved", actor: "noclead"  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page component
// ─────────────────────────────────────────────────────────────────────────────
export default function OpsWarRoomDashboard() {
  const [tenant, setTenant]             = useState("3D / DEMO-UG (Dealer)");
  const [activeNavItem, setActiveNavItem] = useState("ops");
  const [opsBriefOpen, setOpsBriefOpen] = useState(false);

  // Live-update strip chips (demo — replace with SSE)
  const [chips, setChips] = useState(OPS_CHIPS);
  useEffect(() => {
    const t = setInterval(() => {
      setChips((prev) => {
        const ms = Math.max(8, Math.min(34, 8 + Math.floor(Math.random() * 24)));
        return prev.map((c) =>
          c.id === "redis" ? { ...c, label: `Redis ${ms}ms` } : c
        );
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen min-h-dvh flex flex-col bg-[#F0F2F5] overflow-x-hidden w-full pb-14 md:pb-0">

    
      
      

      {/* 3. Shell: rail + sidebar + workspace + AI panel */}
      <div className="flex flex-1 min-h-0 min-w-0 overflow-x-hidden">

        

    
        {/* Main workspace */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden flex flex-col">

          {/* Page header */}
          <div className="px-4 pt-4 pb-2 border-b border-[#E9EDEF] bg-white shrink-0">
           
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[20px] font-black text-[#111B21] m-0 leading-tight">
                NAVAS v26 • OPS WAR ROOM
              </h1>
              <div className="flex gap-2 ml-auto flex-wrap">
                <HeaderBtn onClick={() => setOpsBriefOpen(true)}>Send Brief</HeaderBtn>
                <HeaderBtn>Export</HeaderBtn>
                <HeaderBtn>+ New Rule</HeaderBtn>
                <HeaderBtn variant="green">Top-up Tokens</HeaderBtn>
              </div>
            </div>
            <p className="text-[12px] text-[#667781] m-0 mt-0.5">
              Unified tokens + payments + VEBA + AI — Strategic overseer view
            </p>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 p-4 flex flex-col gap-4 min-h-0 overflow-x-hidden">

            {/* ── KPI grid ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <OpsKpiCard label="Units online"    value="42,118 / 44,930" delta="+0.7% (1h)"       helper="93.7% online"          tone="good" />
              <OpsKpiCard label="Token burn"      value="1.62 t/s"        delta="+3.6× baseline"   helper="Run-out: 17h (soft @72h)" tone="warn" />
              <OpsKpiCard label="Payments today"  value="UGX 84.2M"       delta="Success: 92.4%"   helper="Webhooks backlog: 41"  tone="warn" />
              <OpsKpiCard label="VEBA bookings"   value="812"             delta="Conv: 8.7%"        helper="Escrow: UGX 23.4M"     tone="good" />
            </div>

            {/* ── Row 1: Alarms + Gateways ─────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <AlarmTable
                rows={ALARMS}
                onAckAll={() => {}}
                onOpenCenter={() => {}}
                onOpenRow={() => {}}
              />
              <GatewayTable
                rows={GATEWAYS}
                vebaMinis={VEBA_MINIS}
                onRerun={() => {}}
                onOpenGateways={() => {}}
              />
            </div>

            {/* ── Row 2: Token burn + HITL table ───────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <TokenBurnChart
                rows={BURN_ROWS}
                note="* High-risk actions (price changes, refunds, caps, kill-switch) require approval + audit trail."
                onOpenEngine={() => {}}
                onSetCap={() => {}}
              />
              <HITLApprovalTable
                rows={APPROVALS}
                onViewBrief={() => setOpsBriefOpen(true)}
                onOpenAuditLog={() => {}}
                onReview={() => setOpsBriefOpen(true)}
              />
            </div>
          </div>
        </main>

        {/* Right AI panel */}
        <WaswaAIPanel
          onGenerateBrief={() => setOpsBriefOpen(true)}
          onAlertTuning={() => {}}
          onDetectLeakage={() => {}}
          onSendChat={(msg) => console.log("Ask Waswa:", msg)}
        />
      </div>

    

      {/* Ops Brief Modal */}
      <OpsBriefModal
        tenant={tenant}
        open={opsBriefOpen}
        onClose={() => setOpsBriefOpen(false)}
        onSendWhatsApp={() => setOpsBriefOpen(false)}
        onSavePDF={() => {}}
      />
    </div>
  );
}

// ── Internal header button ────────────────────────────────────────────────────
function HeaderBtn({
  variant = "default",
  onClick,
  children,
}: {
  variant?: "green" | "default";
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const cls =
    variant === "green"
      ? "bg-[#25D366] text-[#075E54] border-transparent font-extrabold hover:brightness-105"
      : "bg-white border-[#E9EDEF] text-[#111B21] hover:bg-[#F8F9FA]";
  return (
    <button
      onClick={onClick}
      className={`h-8 px-3 rounded-lg border text-[12px] cursor-pointer transition-all ${cls}`}
    >
      {children}
    </button>
  );
}