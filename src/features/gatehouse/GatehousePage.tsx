/**
<<<<<<< HEAD
<<<<<<< HEAD
 * GatehousePage — stub.
 * The original implementation was corrupted by external file operations.
 * Restore via: git checkout HEAD -- src/features/gatehouse/GatehousePage.tsx
 */
import React from "react";

export default function GatehousePage() {
  return (
    <div className="flex-1 min-w-0 min-h-0 flex items-center justify-center bg-[#F0F2F5]">
      <div className="bg-white border border-[#E9EDEF] rounded-xl p-8 text-center max-w-md">
        <h1 className="font-black text-[20px] text-[#111B21] mb-2">Gatehouse</h1>
        <p className="text-[12px] text-[#667781]">
          Module is being restored. Use `git checkout HEAD -- src/features/gatehouse/GatehousePage.tsx`.
        </p>
      </div>
=======
 * NavasGatehouseAlpha.tsx
 * Gatehouse Alpha — Intelligent Command & Control Entry
 *
 * Three scroll sections rendered as one long scrollable page:
 *   S01A TOP    — KPI cards + Waswa AI blade + HITL Queue
 *   S01B MID    — Universal Token Definition Engine + Token Economy Analytics + Context blade
 *   S01C BOTTOM — Security/Audit/SSO watchlist + Audit Stream + Ops Diagnostics
 */
import React, { useState } from "react";
import { NavLink } from "react-router-dom";

=======
 * NavasGatehouseAlpha.tsx
 * Gatehouse Alpha — Intelligent Command & Control Entry
 *
 * Three scroll sections rendered as one long scrollable page:
 *   S01A TOP    — KPI cards + Waswa AI blade + HITL Queue
 *   S01B MID    — Universal Token Definition Engine + Token Economy Analytics + Context blade
 *   S01C BOTTOM — Security/Audit/SSO watchlist + Audit Stream + Ops Diagnostics
 */
import React, { useState } from "react";
import { NavLink } from "react-router-dom";

>>>>>>> parent of ba9189e (Live Monitoring and New Device Configuration)
import { StatusStrip, } from "../../components/navigation";
import { StatCard }                from "../../components/ui";
import { WaswaAIBlade }            from "../../components/waswa";
import { HITLQueueBlade,} from "./components/HITLQueueBlade";
import type { StatusChip } from "../../components/navigation";
import type { HITLQueueItem } from "./components/HITLQueueBlade";
import { HITLMintApprovalModal }   from "./components/HITLMintApprovalModal";

// ─────────────────────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────────────────────
<<<<<<< HEAD

const CHIPS: StatusChip[] = [
  { id: "tenant",    label: "Tenant: 3D UG → BodaUnion → KLA Zone 3 ▾" },
  { id: "rbac",      label: "RBAC: Super‑Admin",                      variant: "ok"      },
  { id: "tokens",    label: "Tokens: 1,245,000 | Burn: 12.4 tok/s | run‑out ~27h", variant: "success" },
  { id: "system",    label: "System: 🟢 Green | last incident 18m"    },
  { id: "freshness", label: "Freshness: median 2.4s | last msg 5s"    },
  { id: "alerts",    label: "Alerts: P1=2 P2=17 | unacked 9",         variant: "warn"    },
  { id: "pay",       label: "Pay: M‑Pesa✅ MTN⚠ Airtel✅",            variant: "info"    },
  { id: "waswa",     label: "Waswa AI: ON | HITL pending: 3",         variant: "ok"      },
  { id: "range",     label: "Range: 1h ▾"                             },
  { id: "audit",     label: "Audit: ON | retention 365d"              },
];

const NAV_ITEMS = [
  { key: "home",     glyph: "⌂", label: "Home",     path: "/"           },
  { key: "health",   glyph: "♥", label: "Health",   path: "/noc-bridge" },
  { key: "alarms",   glyph: "⚑", label: "Alarms",   path: "/alarms"     },
  { key: "modules",  glyph: "⧉", label: "Modules",  path: "/health"     },
  { key: "billing",  glyph: "₳", label: "Billing",  path: "/billing"    },
  { key: "tokens",   glyph: "₿", label: "Tokens",   path: "/tokens"     },
  { key: "settings", glyph: "⚙", label: "Settings", path: "/rbac"       },
  { key: "stream",   glyph: "≋", label: "Stream",   path: "/audit"      },
  { key: "ai",       glyph: "✦", label: "AI",       path: "/ai"         },
  { key: "refresh",  glyph: "↻", label: "Refresh",  path: "/"           },
  { key: "help",     glyph: "?", label: "Help",     path: "/"           },
];

// Full sidebar from screenshots — all groups visible
const SIDEBAR_GROUPS = [
  {
    title: "Core Ops",
    items: [
      { label: "Dashboard Entry",  path: "/"           },
      { label: "System Health",    path: "/noc-bridge" },
      { label: "Alarm Center",     path: "/alarms"     },
      { label: "Ops + Business",   path: "/"           },
    ],
  },
  {
    title: "Monetization",
    items: [
      { label: "Token Engine",      path: "/tokens"   },
      { label: "Billing & Invoices",path: "/billing"  },
      { label: "Payments Gateways", path: "/payments" },
      { label: "Revenue Hub",       path: "/"         },
    ],
  },
  {
    title: "Tenants & Access",
    items: [
      { label: "Clients & Accounts",  path: "/" },
      { label: "Resources Manager",   path: "/" },
      { label: "RBAC & Access",       path: "/rbac" },
      { label: "Audit Logs",          path: "/audit" },
    ],
  },
  {
    title: "Assets & Ops",
    items: [
      { label: "Devices",        path: "/" },
      { label: "Assets",         path: "/" },
      { label: "Drivers",        path: "/" },
      { label: "Geofences",      path: "/" },
      { label: "Trip Playback",  path: "/" },
    ],
  },
  {
    title: "VEBA",
    items: [
      { label: "VEBA Governance",   path: "/veba" },
      { label: "VEBA Bookings Ops", path: "/veba" },
    ],
  },
];

// Token registry rows — MID section
const TOKEN_ROWS = [
  { code: "VIDEO_SNAPSHOT",   type: "A", domain: "OLIWA", meter: "video_snapshot", unit: "per img",     rps: 10.0, price: "UGX 120", ver: "v2" },
  { code: "BANDWIDTH_HR",     type: "A", domain: "UKO",   meter: "bandwidth_usage",unit: "per hr",      rps: 10.1, price: "KES 35",  ver: "v5" },
  { code: "UBI_SPEED_HR",     type: "A", domain: "PIKI",  meter: "speed",          unit: "per hr",      rps:  9.4, price: "UGX 13",  ver: "v3" },
  { code: "FUEL_THEFT_EVT",   type: "A", domain: "MAFUTA",meter: "fuel_level",     unit: "per evt",     rps:  8.1, price: "UGX 250", ver: "v4" },
  { code: "VEBA_LEAD_UNLOCK", type: "B", domain: "VEBA",  meter: "contact_unlock", unit: "per unlock",  rps:  9.2, price: "KES 15",  ver: "v1" },
  { code: "VEBA_ESCROW_HOLD", type: "B", domain: "VEBA",  meter: "escrow_hold",    unit: "per booking", rps:  8.8, price: "UGX 400", ver: "v1" },
  { code: "GEOFENCE_EVT",     type: "A", domain: "OLIWA", meter: "geofence_id",    unit: "per evt",     rps:  8.4, price: "UGX 20",  ver: "v6" },
];

// Auth/SSO watchlist rows — BOTTOM section
const AUTH_ROWS = [
  { metric: "Login success rate (24h)", value: "98.9%", status: "🟢", notes: "Stable"                                    },
  { metric: "Auth latency p95",         value: "2.6s",  status: "🟡", notes: "Investigate MTN callback delays"           },
  { metric: "Failed logins / min",      value: "14",    status: "🟡", notes: "Possible credential-stuffing from 2 IPs"   },
  { metric: "MFA delivery failure",     value: "4.2%",  status: "🔴", notes: "WhatsApp OTP template throttling"           },
];

// Audit stream rows — BOTTOM section
const AUDIT_ROWS = [
  { time: "13:22:09", actor: "SystemAdmin",   action: "APPROVED", detail: "Token mint 5,000 (VEBA) → BodaUnion‑KLA",          dot: "bg-[#25D366]" },
  { time: "13:20:41", actor: "Waswa AI",      action: "SUGGEST",  detail: "Leakage case opened: VEBA_BODA_#1182",             dot: "bg-[#34B7F1]" },
  { time: "13:18:10", actor: "CreditBot",     action: "AUTO",     detail: "Sent payment reminder (WhatsApp) to 12 overdue accounts", dot: "bg-[#25D366]" },
  { time: "13:16:53", actor: "PlatformAdmin", action: "REJECTED", detail: "Price rule change without approval (blocked)",      dot: "bg-[#D93025]" },
  { time: "13:15:02", actor: "System",        action: "ALERT",    detail: "Auth failed logins spike (14/min) from 2 IPs",     dot: "bg-[#FB8C00]" },
];

// Core processes — BOTTOM right blade
const PROCESSES = [
  { name: "python_sockets", cpu: "42%", ram: "680MB", net: "3.1 Mb/s", ok: true  },
  { name: "kafka_broker",   cpu: "18%", ram: "512MB", net: "1.8 Mb/s", ok: true  },
  { name: "cassandra",      cpu: "27%", ram: "220MB", net: "0.6 Mb/s", ok: true  },
  { name: "redis",          cpu:  "6%", ram: "240MB", net: "0.2 Mb/s", ok: true  },
  { name: "node_sse",       cpu:  "9%", ram: "310MB", net: "2.7 Mb/s", ok: true  },
  { name: "flask_api",      cpu:  "4%", ram: "180MB", net: "0.4 Mb/s", ok: true  },
  { name: "Waswa@lmg",      cpu: ">85%",ram: "free<1",net: "0.9 Mb/s", ok: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// Reusable sub-components (page-scoped)
// ─────────────────────────────────────────────────────────────────────────────

function SectionCard({ title, subtitle, badge, badgeColor = "bg-[#128C7E]", children }: {
  title: string; subtitle?: string;
  badge?: string; badgeColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#E9EDEF] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#E9EDEF]">
        <div>
          <div className="font-black text-[15px] text-[#111B21]">{title}</div>
          {subtitle && <div className="text-[12px] text-[#667781] mt-0.5">{subtitle}</div>}
        </div>
        {badge && (
          <span className={`shrink-0 text-[11px] font-extrabold text-white px-2.5 py-1 rounded-full ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="p-4">{children}</div>
=======

const CHIPS: StatusChip[] = [
  { id: "tenant",    label: "Tenant: 3D UG → BodaUnion → KLA Zone 3 ▾" },
  { id: "rbac",      label: "RBAC: Super‑Admin",                      variant: "ok"      },
  { id: "tokens",    label: "Tokens: 1,245,000 | Burn: 12.4 tok/s | run‑out ~27h", variant: "success" },
  { id: "system",    label: "System: 🟢 Green | last incident 18m"    },
  { id: "freshness", label: "Freshness: median 2.4s | last msg 5s"    },
  { id: "alerts",    label: "Alerts: P1=2 P2=17 | unacked 9",         variant: "warn"    },
  { id: "pay",       label: "Pay: M‑Pesa✅ MTN⚠ Airtel✅",            variant: "info"    },
  { id: "waswa",     label: "Waswa AI: ON | HITL pending: 3",         variant: "ok"      },
  { id: "range",     label: "Range: 1h ▾"                             },
  { id: "audit",     label: "Audit: ON | retention 365d"              },
];

const NAV_ITEMS = [
  { key: "home",     glyph: "⌂", label: "Home",     path: "/"           },
  { key: "health",   glyph: "♥", label: "Health",   path: "/noc-bridge" },
  { key: "alarms",   glyph: "⚑", label: "Alarms",   path: "/alarms"     },
  { key: "modules",  glyph: "⧉", label: "Modules",  path: "/health"     },
  { key: "billing",  glyph: "₳", label: "Billing",  path: "/billing"    },
  { key: "tokens",   glyph: "₿", label: "Tokens",   path: "/tokens"     },
  { key: "settings", glyph: "⚙", label: "Settings", path: "/rbac"       },
  { key: "stream",   glyph: "≋", label: "Stream",   path: "/audit"      },
  { key: "ai",       glyph: "✦", label: "AI",       path: "/ai"         },
  { key: "refresh",  glyph: "↻", label: "Refresh",  path: "/"           },
  { key: "help",     glyph: "?", label: "Help",     path: "/"           },
];

// Full sidebar from screenshots — all groups visible
const SIDEBAR_GROUPS = [
  {
    title: "Core Ops",
    items: [
      { label: "Dashboard Entry",  path: "/"           },
      { label: "System Health",    path: "/noc-bridge" },
      { label: "Alarm Center",     path: "/alarms"     },
      { label: "Ops + Business",   path: "/"           },
    ],
  },
  {
    title: "Monetization",
    items: [
      { label: "Token Engine",      path: "/tokens"   },
      { label: "Billing & Invoices",path: "/billing"  },
      { label: "Payments Gateways", path: "/payments" },
      { label: "Revenue Hub",       path: "/"         },
    ],
  },
  {
    title: "Tenants & Access",
    items: [
      { label: "Clients & Accounts",  path: "/" },
      { label: "Resources Manager",   path: "/" },
      { label: "RBAC & Access",       path: "/rbac" },
      { label: "Audit Logs",          path: "/audit" },
    ],
  },
  {
    title: "Assets & Ops",
    items: [
      { label: "Devices",        path: "/" },
      { label: "Assets",         path: "/" },
      { label: "Drivers",        path: "/" },
      { label: "Geofences",      path: "/" },
      { label: "Trip Playback",  path: "/" },
    ],
  },
  {
    title: "VEBA",
    items: [
      { label: "VEBA Governance",   path: "/veba" },
      { label: "VEBA Bookings Ops", path: "/veba" },
    ],
  },
];

// Token registry rows — MID section
const TOKEN_ROWS = [
  { code: "VIDEO_SNAPSHOT",   type: "A", domain: "OLIWA", meter: "video_snapshot", unit: "per img",     rps: 10.0, price: "UGX 120", ver: "v2" },
  { code: "BANDWIDTH_HR",     type: "A", domain: "UKO",   meter: "bandwidth_usage",unit: "per hr",      rps: 10.1, price: "KES 35",  ver: "v5" },
  { code: "UBI_SPEED_HR",     type: "A", domain: "PIKI",  meter: "speed",          unit: "per hr",      rps:  9.4, price: "UGX 13",  ver: "v3" },
  { code: "FUEL_THEFT_EVT",   type: "A", domain: "MAFUTA",meter: "fuel_level",     unit: "per evt",     rps:  8.1, price: "UGX 250", ver: "v4" },
  { code: "VEBA_LEAD_UNLOCK", type: "B", domain: "VEBA",  meter: "contact_unlock", unit: "per unlock",  rps:  9.2, price: "KES 15",  ver: "v1" },
  { code: "VEBA_ESCROW_HOLD", type: "B", domain: "VEBA",  meter: "escrow_hold",    unit: "per booking", rps:  8.8, price: "UGX 400", ver: "v1" },
  { code: "GEOFENCE_EVT",     type: "A", domain: "OLIWA", meter: "geofence_id",    unit: "per evt",     rps:  8.4, price: "UGX 20",  ver: "v6" },
];

// Auth/SSO watchlist rows — BOTTOM section
const AUTH_ROWS = [
  { metric: "Login success rate (24h)", value: "98.9%", status: "🟢", notes: "Stable"                                    },
  { metric: "Auth latency p95",         value: "2.6s",  status: "🟡", notes: "Investigate MTN callback delays"           },
  { metric: "Failed logins / min",      value: "14",    status: "🟡", notes: "Possible credential-stuffing from 2 IPs"   },
  { metric: "MFA delivery failure",     value: "4.2%",  status: "🔴", notes: "WhatsApp OTP template throttling"           },
];

// Audit stream rows — BOTTOM section
const AUDIT_ROWS = [
  { time: "13:22:09", actor: "SystemAdmin",   action: "APPROVED", detail: "Token mint 5,000 (VEBA) → BodaUnion‑KLA",          dot: "bg-[#25D366]" },
  { time: "13:20:41", actor: "Waswa AI",      action: "SUGGEST",  detail: "Leakage case opened: VEBA_BODA_#1182",             dot: "bg-[#34B7F1]" },
  { time: "13:18:10", actor: "CreditBot",     action: "AUTO",     detail: "Sent payment reminder (WhatsApp) to 12 overdue accounts", dot: "bg-[#25D366]" },
  { time: "13:16:53", actor: "PlatformAdmin", action: "REJECTED", detail: "Price rule change without approval (blocked)",      dot: "bg-[#D93025]" },
  { time: "13:15:02", actor: "System",        action: "ALERT",    detail: "Auth failed logins spike (14/min) from 2 IPs",     dot: "bg-[#FB8C00]" },
];

// Core processes — BOTTOM right blade
const PROCESSES = [
  { name: "python_sockets", cpu: "42%", ram: "680MB", net: "3.1 Mb/s", ok: true  },
  { name: "kafka_broker",   cpu: "18%", ram: "512MB", net: "1.8 Mb/s", ok: true  },
  { name: "cassandra",      cpu: "27%", ram: "220MB", net: "0.6 Mb/s", ok: true  },
  { name: "redis",          cpu:  "6%", ram: "240MB", net: "0.2 Mb/s", ok: true  },
  { name: "node_sse",       cpu:  "9%", ram: "310MB", net: "2.7 Mb/s", ok: true  },
  { name: "flask_api",      cpu:  "4%", ram: "180MB", net: "0.4 Mb/s", ok: true  },
  { name: "Waswa@lmg",      cpu: ">85%",ram: "free<1",net: "0.9 Mb/s", ok: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// Reusable sub-components (page-scoped)
// ─────────────────────────────────────────────────────────────────────────────

function SectionCard({ title, subtitle, badge, badgeColor = "bg-[#128C7E]", children }: {
  title: string; subtitle?: string;
  badge?: string; badgeColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#E9EDEF] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#E9EDEF]">
        <div>
          <div className="font-black text-[15px] text-[#111B21]">{title}</div>
          {subtitle && <div className="text-[12px] text-[#667781] mt-0.5">{subtitle}</div>}
        </div>
        {badge && (
          <span className={`shrink-0 text-[11px] font-extrabold text-white px-2.5 py-1 rounded-full ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ActionBtn({ variant = "teal", onClick, children }: {
  variant?: "green" | "teal" | "azure" | "dark" | "red" | "orange";
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const cls: Record<string, string> = {
    green:  "bg-[#25D366] text-[#075E54]",
    teal:   "bg-[#128C7E] text-white",
    azure:  "bg-[#34B7F1] text-white",
    dark:   "bg-[#111B21] text-white",
    red:    "bg-[#D93025] text-white",
    orange: "bg-[#FB8C00] text-white",
  };
  return (
    <button onClick={onClick} className={`h-9 rounded-lg px-3.5 text-[12px] font-extrabold border-none cursor-pointer hover:brightness-105 active:opacity-85 transition-all ${cls[variant]}`}>
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function NavasGatehouseAlpha() {
  const [hitlOpen,      setHitlOpen]      = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");

  const hitlItems: HITLQueueItem[] = [
    { id: "h1", sev: "success",  title: "Token Mint Override", meta: "Mint 5,000 Type‑B tokens to BodaUnion‑KLA", onReview: () => setHitlOpen(true) },
    { id: "h2", sev: "warn",     title: "Price Rule Change",   meta: "VEBA commission 5% → 6% (KE only)"         },
    { id: "h3", sev: "critical", title: "Suspend Account",     meta: 'DPD 61 days: "Kampala Rentals Ltd"'        },
  ];

  const filteredGroups = SIDEBAR_GROUPS
    .map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(sidebarSearch.toLowerCase())) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="h-screen flex flex-col bg-[#F0F2F5] overflow-hidden">



      {/* Shell */}
      <div className="flex flex-1 min-h-0 overflow-hidden">




        {/* ── Workspace ───────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">

          {/* All scroll sections in one scrollable column */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">

            {/* ══════════════════════════════════════════════════════════════
                S01A — TOP SCROLL: Dashboard Entry
            ══════════════════════════════════════════════════════════════ */}
            <section className="px-[18px] pt-4 pb-6 border-b-2 border-dashed border-[#E9EDEF]">
              <h1 className="text-[22px] font-black text-[#111B21] m-0 mb-1">Gatehouse Alpha — Intelligent Command &amp; Control Entry</h1>
              <p className="text-[12px] text-[#667781] m-0 mb-4">AI-first ops, tokenized billing, VEBA governance, and mobile money health in one blade workspace.</p>

              {/* 4-col KPI grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
                <StatCard title="System Health"  badge="ok"      badgeLabel="🟢 GREEN" meta="Uptime 99.8% • CPU 42% • RAM 68%" />
                <StatCard title="Token Wallet"   badge="success" badgeLabel="TOP‑UP"   meta="Balance 1.245M • Burn 12.4/s • 27h left" cta={{ label: "Top‑up via Mobile Money", variant: "green" }} />
                <StatCard title="Payments"       badge="info"    badgeLabel="LIVE"     meta="M‑Pesa ✅  MTN ⚠  Airtel ✅" />
                <StatCard title="Alerts"         badge="warn"    badgeLabel="ACTION"   meta="P1=2 • P2=17 • Unacked 9" />
              </div>

              {/* Blade row */}
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-3">
                <WaswaAIBlade onApproveMint={() => setHitlOpen(true)} />
                <HITLQueueBlade items={hitlItems} />
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                S01B — MID SCROLL: Universal Token Definition Engine
            ══════════════════════════════════════════════════════════════ */}
            <section className="px-[18px] pt-6 pb-6 border-b-2 border-dashed border-[#E9EDEF]">
              <div className="text-[10px] text-[#667781] mb-1.5">Home &gt; Token Engine &gt; Universal Token Definition Engine</div>
              <h1 className="text-[22px] font-black text-[#111B21] m-0 mb-1">Universal Token Definition Engine — Dual Token Architecture (Type-A + Type-B)</h1>
              <p className="text-[12px] text-[#667781] m-0 mb-4">CRUD: Create • Copy • Version • Archive (Trash) • Export. Sorted by Revenue Potential Score (RPS).</p>

              <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-3">

                {/* Left: Token registry + analytics */}
                <div className="flex flex-col gap-3">

                  {/* Token Definitions Registry */}
                  <SectionCard title="Token Definitions (Registry)"
                    subtitle="Filter: [Hardware Origin] [Domain] [RPS] [Country] • Sort: RPS ↓"
                    badge="CRUD" badgeColor="bg-[#128C7E]">

                    {/* Table */}
                    <div className="overflow-x-auto rounded-xl border border-[#E9EDEF]" style={{ scrollbarWidth: "none" }}>
                      <table className="w-full text-[12px] border-collapse min-w-[560px]">
                        <thead>
                          <tr className="bg-[#F8F9FA] border-b border-[#E9EDEF]">
                            {["Token Code","Type","Domain","Meter","Unit","RPS","Price","Ver",""].map((h) => (
                              <th key={h} className="text-left px-3 py-2.5 font-extrabold text-[#667781] whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {TOKEN_ROWS.map((r, i) => (
                            <tr key={r.code} className={`border-b border-[#E9EDEF] ${i % 2 === 0 ? "" : "bg-[#FAFAFA]"} hover:bg-[#F0F2F5] transition-colors`}>
                              <td className="px-3 py-2.5 font-mono font-bold text-[#111B21] text-[11px] whitespace-nowrap">{r.code}</td>
                              <td className="px-3 py-2.5 text-center">
                                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${r.type === "A" ? "bg-[#E3F2FD] text-[#1565C0]" : "bg-[#E8F5F2] text-[#128C7E]"}`}>{r.type}</span>
                              </td>
                              <td className="px-3 py-2.5 text-[#667781] whitespace-nowrap">{r.domain}</td>
                              <td className="px-3 py-2.5 font-mono text-[11px] text-[#111B21] whitespace-nowrap">{r.meter}</td>
                              <td className="px-3 py-2.5 text-[#667781] whitespace-nowrap">{r.unit}</td>
                              <td className="px-3 py-2.5 font-extrabold text-[#111B21]">{r.rps}</td>
                              <td className="px-3 py-2.5 font-extrabold text-[#111B21] whitespace-nowrap">{r.price}</td>
                              <td className="px-3 py-2.5 text-[#667781]">{r.ver}</td>
                              <td className="px-3 py-2.5 text-[#667781] cursor-pointer hover:text-[#111B21]">⋮</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Actions row */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <ActionBtn variant="green">+ New Token</ActionBtn>
                      <ActionBtn variant="azure">Import</ActionBtn>
                      <ActionBtn variant="azure">Export</ActionBtn>
                      <ActionBtn variant="dark">Trash</ActionBtn>
                      <span className="text-[11px] text-[#667781] italic ml-1">Tip: Versioned tokens prevent pricing drift. Any price cha…</span>
                    </div>
                  </SectionCard>

                  {/* Token Economy Analytics */}
                  <SectionCard title="Token Economy Analytics"
                    subtitle="Compare AI vs Vanilla Python burn + safeguard caps to avoid billing shock."
                    badge="PAYG" badgeColor="bg-[#34B7F1]">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Burn rate bar chart */}
                      <div>
                        <div className="text-[12px] font-extrabold text-[#667781] mb-3">Burn Rate (tok/s) — AI vs Vanilla</div>
                        <div className="flex items-end gap-6 h-[80px] px-4">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-14 bg-[#34B7F1] rounded-t-md" style={{ height: "52px" }} />
                            <span className="text-[12px] font-black text-[#111B21]">7.2</span>
                            <span className="text-[10px] text-[#667781]">Vanilla</span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-14 bg-[#25D366] rounded-t-md" style={{ height: "80px" }} />
                            <span className="text-[12px] font-black text-[#111B21]">12.4</span>
                            <span className="text-[10px] text-[#667781]">Waswa AI</span>
                          </div>
                        </div>
                      </div>

                      {/* Safeguards */}
                      <div>
                        <div className="text-[12px] font-extrabold text-[#667781] mb-3">Safeguards</div>
                        <div className="flex flex-col gap-2.5">
                          <SafeguardRow label="Daily Cap"      fill={0.72} color="bg-[#25D366]" value="150k tok" />
                          <SafeguardRow label="80% Soft Alert" fill={0.80} color="bg-[#F4B400]" value="ON"       />
                          <div className="flex items-center justify-between gap-2 text-[12px] mt-1">
                            <span className="bg-[#F8F9FA] border border-[#E9EDEF] rounded px-2 py-1 font-extrabold text-[#667781]">LOCK: OFF</span>
                            <span className="text-[#667781]">Grace: 2h</span>
                            <span className="text-[#667781]">Any override → Audit</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </div>

                {/* Right context blade: Gateway Health + VEBA Leakage */}
                <div className="flex flex-col gap-3">
                  <SectionCard title="Mobile Money + VEBA Governance"
                    subtitle="PAYG culture: top-ups, escrow, settlement, leakage prevention."
                    badge="LI" badgeColor="bg-[#128C7E]">

                    {/* Gateway Health */}
                    <div className="text-[11px] font-extrabold text-[#667781] mb-2">Gateway Health</div>
                    <div className="flex flex-col gap-2 mb-4">
                      {[
                        { name: "M-Pesa (KE)",   pct: "98.7%", color: "bg-[#25D366]" },
                        { name: "MTN MoMo (UG)", pct: "94.2%", color: "bg-[#F4B400]" },
                        { name: "Airtel Money",  pct: "99.1%", color: "bg-[#25D366]" },
                      ].map((g) => (
                        <div key={g.name} className="flex items-center justify-between gap-2 text-[12px]">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${g.color}`} />
                            <span className="text-[#111B21]">{g.name}</span>
                          </div>
                          <span className="font-extrabold text-[#111B21]">{g.pct}</span>
                        </div>
                      ))}
                    </div>

                    {/* VEBA Leakage Watch */}
                    <div className="text-[11px] font-extrabold text-[#667781] mb-2">VEBA Leakage Watch</div>
                    <div className="flex flex-col gap-2 mb-4">
                      {[
                        { label: "Contact unlocks (24h)",  value: "73",       dot: "bg-[#25D366]" },
                        { label: "Bookings completed",     value: "18",        dot: "bg-[#25D366]" },
                        { label: "Suspected offline deals",value: "11",        dot: "bg-[#D93025]" },
                        { label: "Commission recovered",   value: "UGX 1.2M", dot: "bg-[#25D366]" },
                      ].map((r) => (
                        <div key={r.label} className="flex items-center justify-between text-[12px]">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${r.dot}`} />
                            <span className="text-[#111B21]">{r.label}</span>
                          </div>
                          <span className="font-extrabold text-[#111B21]">{r.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] text-right text-[#667781] mb-3">MID</div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2">
                      <ActionBtn variant="dark">Open Case</ActionBtn>
                      <ActionBtn variant="teal">Tighten Gating</ActionBtn>
                      <ActionBtn variant="azure">Send WhatsApp</ActionBtn>
                    </div>

                    {/* Context panel */}
                    <div className="mt-4 border-t border-[#E9EDEF] pt-3">
                      <div className="text-[11px] font-extrabold text-[#667781] mb-1.5">Context: Selected Token — BANDWIDTH_HR v5</div>
                      <p className="text-[11px] text-[#667781] leading-relaxed m-0">
                        Meter: bandwidth_usage (kbps/hr) • RPS 10.1 Country: KE • Price floor: KES 22 • Sell: KES 35 (margin guard ✓) Applies to: UKO + OLIWA-PLUS • AI video streaming sessions Next: Recommend 'Roaming Pack' for cross-border units (mcc changes).
                      </p>
                    </div>
                  </SectionCard>
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                S01C — BOTTOM SCROLL: Security, Audit & Session Integrity
            ══════════════════════════════════════════════════════════════ */}
            <section className="px-[18px] pt-6 pb-8">
              <div className="text-[10px] text-[#667781] mb-1.5">Home &gt; Login &amp; SSO &gt; Security &amp; Audit</div>
              <h1 className="text-[22px] font-black text-[#111B21] m-0 mb-1">Security, Audit &amp; Session Integrity — Irrefutable Admin Control</h1>
              <p className="text-[12px] text-[#667781] m-0 mb-4">All high-risk actions are HITL/HIC gated. Every action is immutable in Audit Logs (hash-chained).</p>

              <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-3">

                {/* Left: Auth watchlist + Audit stream */}
                <div className="flex flex-col gap-3">

                  {/* Auth & SSO Watchlist */}
                  <SectionCard title="Auth & SSO Watchlist"
                    subtitle="Login success, MFA coverage, suspicious access — by tenant."
                    badge="LIVE" badgeColor="bg-[#25D366]">
                    <div className="overflow-x-auto rounded-xl border border-[#E9EDEF]" style={{ scrollbarWidth: "none" }}>
                      <table className="w-full text-[12px] border-collapse min-w-[480px]">
                        <thead>
                          <tr className="bg-[#F8F9FA] border-b border-[#E9EDEF]">
                            {["Metric","Value","Status","Notes"].map((h) => (
                              <th key={h} className="text-left px-3 py-2.5 font-extrabold text-[#667781]">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {AUTH_ROWS.map((r) => (
                            <tr key={r.metric} className="border-b border-[#E9EDEF] hover:bg-[#F0F2F5] transition-colors">
                              <td className="px-3 py-2.5 font-extrabold text-[#111B21]">{r.metric}</td>
                              <td className="px-3 py-2.5 font-extrabold text-[#111B21]">{r.value}</td>
                              <td className="px-3 py-2.5 text-center">{r.status}</td>
                              <td className="px-3 py-2.5 text-[#667781]">{r.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </SectionCard>

                  {/* Audit Stream */}
                  <SectionCard title="Audit Stream (Immutable)"
                    subtitle="Every click has a hash. Retention tied to billing plan."
                    badge="AUDIT ON" badgeColor="bg-[#25D366]">
                    <div className="flex flex-col gap-0 rounded-xl border border-[#E9EDEF] overflow-hidden">
                      {AUDIT_ROWS.map((r, i) => (
                        <div key={i} className={`flex items-center gap-3 px-3 py-2.5 text-[12px] border-b border-[#E9EDEF] last:border-b-0 ${i % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}`}>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${r.dot}`} />
                          <span className="font-mono text-[11px] text-[#667781] shrink-0 w-[60px]">{r.time}</span>
                          <span className="font-extrabold text-[#111B21] shrink-0 w-[100px] truncate">{r.actor}</span>
                          <span className={`shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded w-[74px] text-center ${
                            r.action === "APPROVED" ? "bg-[#E8F5F2] text-[#128C7E]" :
                            r.action === "REJECTED" ? "bg-[#FFEBEE] text-[#C62828]" :
                            r.action === "ALERT"    ? "bg-[#FFF8E1] text-[#7A5E00]" :
                            r.action === "SUGGEST"  ? "bg-[#E3F2FD] text-[#1565C0]" :
                                                      "bg-[#F8F9FA] text-[#667781]"
                          }`}>{r.action}</span>
                          <span className="text-[#667781] truncate">{r.detail}</span>
                        </div>
                      ))}
                    </div>

                    {/* Audit footer */}
                    <div className="flex items-center gap-3 mt-3 text-[11px] text-[#667781]">
                      <span>Hash Chain: ON</span>
                      <span>•</span>
                      <span>Last Write: 4s ago</span>
                      <span>•</span>
                      <span>Retention remaining: 365d</span>
                    </div>
                  </SectionCard>
                </div>

                {/* Right: Ops Diagnostics + Break-Glass + Session Summary */}
                <div className="flex flex-col gap-3">
                  <SectionCard title="Ops Diagnostics — Task Manager View"
                    subtitle="Real-time system resource usage (Server processes)."
                    badge="S" badgeColor="bg-[#34B7F1]">

                    {/* Process table */}
                    <div className="text-[11px] font-extrabold text-[#667781] mb-2">NAVAS Core Processes</div>
                    <div className="rounded-xl border border-[#E9EDEF] overflow-hidden mb-4">
                      <div className="grid grid-cols-[1fr_52px_64px_72px] gap-0 text-[11px]">
                        <div className="px-2.5 py-2 font-extrabold text-[#667781] bg-[#F8F9FA] border-b border-[#E9EDEF]">Process</div>
                        <div className="px-2 py-2 font-extrabold text-[#667781] bg-[#F8F9FA] border-b border-[#E9EDEF]">CPU</div>
                        <div className="px-2 py-2 font-extrabold text-[#667781] bg-[#F8F9FA] border-b border-[#E9EDEF]">RAM</div>
                        <div className="px-2 py-2 font-extrabold text-[#667781] bg-[#F8F9FA] border-b border-[#E9EDEF]">NET</div>
                        {PROCESSES.map((p, i) => (
                          <React.Fragment key={p.name}>
                            <div className={`px-2.5 py-2 font-mono text-[10px] ${p.ok ? "text-[#111B21]" : "text-[#D93025] font-bold"} ${i < PROCESSES.length-1 ? "border-b border-[#E9EDEF]" : ""}`}>{p.name}</div>
                            <div className={`px-2 py-2 flex items-center gap-1 ${i < PROCESSES.length-1 ? "border-b border-[#E9EDEF]" : ""}`}>
                              <span className={`w-2 h-2 rounded-full ${p.ok ? "bg-[#25D366]" : "bg-[#D93025]"}`} />
                              <span className="text-[10px] text-[#667781]">{p.cpu}</span>
                            </div>
                            <div className={`px-2 py-2 text-[10px] text-[#667781] ${i < PROCESSES.length-1 ? "border-b border-[#E9EDEF]" : ""}`}>{p.ram}</div>
                            <div className={`px-2 py-2 text-[10px] text-[#667781] ${i < PROCESSES.length-1 ? "border-b border-[#E9EDEF]" : ""}`}>{p.net}</div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Break-Glass */}
                    <div className="border border-[#FFE08A] bg-[#FFF8E1] rounded-xl p-3 mb-3">
                      <div className="font-extrabold text-[#111B21] text-[13px] mb-1">Break-Glass (HIC) Controls</div>
                      <p className="text-[11px] text-[#667781] m-0 mb-3 leading-snug">
                        Use only for safety/legal incidents. Every action is irreversible and escalates to Postmortem + CFO review.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <ActionBtn variant="red">AI Kill-Switch</ActionBtn>
                        <ActionBtn variant="orange">Lock Tokens</ActionBtn>
                        <ActionBtn variant="azure">Export Audit B…</ActionBtn>
                      </div>
                    </div>

                    {/* Session Summary */}
                    <div className="border border-[#E9EDEF] rounded-xl p-3 bg-white">
                      <div className="font-extrabold text-[#111B21] text-[12px] mb-1.5">Session Summary</div>
                      <p className="text-[11px] text-[#667781] m-0 mb-2 leading-snug">
                        Before logout: review open HITL items, check token run-out, and send 1-click payment links to overdue tenants.
                      </p>
                      <div className="text-[10px] text-right text-[#667781]">BOTTOM</div>
                    </div>
                  </SectionCard>
                </div>
              </div>
            </section>

          </div>{/* end scrollable */}
        </main>
      </div>

      {/* HITL Modal */}
      <HITLMintApprovalModal open={hitlOpen} onClose={() => setHitlOpen(false)} />
>>>>>>> parent of ba9189e (Live Monitoring and New Device Configuration)
    </div>
  );
}

<<<<<<< HEAD
function ActionBtn({ variant = "teal", onClick, children }: {
  variant?: "green" | "teal" | "azure" | "dark" | "red" | "orange";
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const cls: Record<string, string> = {
    green:  "bg-[#25D366] text-[#075E54]",
    teal:   "bg-[#128C7E] text-white",
    azure:  "bg-[#34B7F1] text-white",
    dark:   "bg-[#111B21] text-white",
    red:    "bg-[#D93025] text-white",
    orange: "bg-[#FB8C00] text-white",
  };
  return (
    <button onClick={onClick} className={`h-9 rounded-lg px-3.5 text-[12px] font-extrabold border-none cursor-pointer hover:brightness-105 active:opacity-85 transition-all ${cls[variant]}`}>
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function NavasGatehouseAlpha() {
  const [hitlOpen,      setHitlOpen]      = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");

  const hitlItems: HITLQueueItem[] = [
    { id: "h1", sev: "success",  title: "Token Mint Override", meta: "Mint 5,000 Type‑B tokens to BodaUnion‑KLA", onReview: () => setHitlOpen(true) },
    { id: "h2", sev: "warn",     title: "Price Rule Change",   meta: "VEBA commission 5% → 6% (KE only)"         },
    { id: "h3", sev: "critical", title: "Suspend Account",     meta: 'DPD 61 days: "Kampala Rentals Ltd"'        },
  ];

  const filteredGroups = SIDEBAR_GROUPS
    .map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(sidebarSearch.toLowerCase())) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="h-screen flex flex-col bg-[#F0F2F5] overflow-hidden">



      {/* Shell */}
      <div className="flex flex-1 min-h-0 overflow-hidden">




        {/* ── Workspace ───────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">

          {/* All scroll sections in one scrollable column */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">

            {/* ══════════════════════════════════════════════════════════════
                S01A — TOP SCROLL: Dashboard Entry
            ══════════════════════════════════════════════════════════════ */}
            <section className="px-[18px] pt-4 pb-6 border-b-2 border-dashed border-[#E9EDEF]">
              <h1 className="text-[22px] font-black text-[#111B21] m-0 mb-1">Gatehouse Alpha — Intelligent Command &amp; Control Entry</h1>
              <p className="text-[12px] text-[#667781] m-0 mb-4">AI-first ops, tokenized billing, VEBA governance, and mobile money health in one blade workspace.</p>

              {/* 4-col KPI grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
                <StatCard title="System Health"  badge="ok"      badgeLabel="🟢 GREEN" meta="Uptime 99.8% • CPU 42% • RAM 68%" />
                <StatCard title="Token Wallet"   badge="success" badgeLabel="TOP‑UP"   meta="Balance 1.245M • Burn 12.4/s • 27h left" cta={{ label: "Top‑up via Mobile Money", variant: "green" }} />
                <StatCard title="Payments"       badge="info"    badgeLabel="LIVE"     meta="M‑Pesa ✅  MTN ⚠  Airtel ✅" />
                <StatCard title="Alerts"         badge="warn"    badgeLabel="ACTION"   meta="P1=2 • P2=17 • Unacked 9" />
              </div>

              {/* Blade row */}
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-3">
                <WaswaAIBlade onApproveMint={() => setHitlOpen(true)} />
                <HITLQueueBlade items={hitlItems} />
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                S01B — MID SCROLL: Universal Token Definition Engine
            ══════════════════════════════════════════════════════════════ */}
            <section className="px-[18px] pt-6 pb-6 border-b-2 border-dashed border-[#E9EDEF]">
              <div className="text-[10px] text-[#667781] mb-1.5">Home &gt; Token Engine &gt; Universal Token Definition Engine</div>
              <h1 className="text-[22px] font-black text-[#111B21] m-0 mb-1">Universal Token Definition Engine — Dual Token Architecture (Type-A + Type-B)</h1>
              <p className="text-[12px] text-[#667781] m-0 mb-4">CRUD: Create • Copy • Version • Archive (Trash) • Export. Sorted by Revenue Potential Score (RPS).</p>

              <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-3">

                {/* Left: Token registry + analytics */}
                <div className="flex flex-col gap-3">

                  {/* Token Definitions Registry */}
                  <SectionCard title="Token Definitions (Registry)"
                    subtitle="Filter: [Hardware Origin] [Domain] [RPS] [Country] • Sort: RPS ↓"
                    badge="CRUD" badgeColor="bg-[#128C7E]">

                    {/* Table */}
                    <div className="overflow-x-auto rounded-xl border border-[#E9EDEF]" style={{ scrollbarWidth: "none" }}>
                      <table className="w-full text-[12px] border-collapse min-w-[560px]">
                        <thead>
                          <tr className="bg-[#F8F9FA] border-b border-[#E9EDEF]">
                            {["Token Code","Type","Domain","Meter","Unit","RPS","Price","Ver",""].map((h) => (
                              <th key={h} className="text-left px-3 py-2.5 font-extrabold text-[#667781] whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {TOKEN_ROWS.map((r, i) => (
                            <tr key={r.code} className={`border-b border-[#E9EDEF] ${i % 2 === 0 ? "" : "bg-[#FAFAFA]"} hover:bg-[#F0F2F5] transition-colors`}>
                              <td className="px-3 py-2.5 font-mono font-bold text-[#111B21] text-[11px] whitespace-nowrap">{r.code}</td>
                              <td className="px-3 py-2.5 text-center">
                                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${r.type === "A" ? "bg-[#E3F2FD] text-[#1565C0]" : "bg-[#E8F5F2] text-[#128C7E]"}`}>{r.type}</span>
                              </td>
                              <td className="px-3 py-2.5 text-[#667781] whitespace-nowrap">{r.domain}</td>
                              <td className="px-3 py-2.5 font-mono text-[11px] text-[#111B21] whitespace-nowrap">{r.meter}</td>
                              <td className="px-3 py-2.5 text-[#667781] whitespace-nowrap">{r.unit}</td>
                              <td className="px-3 py-2.5 font-extrabold text-[#111B21]">{r.rps}</td>
                              <td className="px-3 py-2.5 font-extrabold text-[#111B21] whitespace-nowrap">{r.price}</td>
                              <td className="px-3 py-2.5 text-[#667781]">{r.ver}</td>
                              <td className="px-3 py-2.5 text-[#667781] cursor-pointer hover:text-[#111B21]">⋮</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Actions row */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <ActionBtn variant="green">+ New Token</ActionBtn>
                      <ActionBtn variant="azure">Import</ActionBtn>
                      <ActionBtn variant="azure">Export</ActionBtn>
                      <ActionBtn variant="dark">Trash</ActionBtn>
                      <span className="text-[11px] text-[#667781] italic ml-1">Tip: Versioned tokens prevent pricing drift. Any price cha…</span>
                    </div>
                  </SectionCard>

                  {/* Token Economy Analytics */}
                  <SectionCard title="Token Economy Analytics"
                    subtitle="Compare AI vs Vanilla Python burn + safeguard caps to avoid billing shock."
                    badge="PAYG" badgeColor="bg-[#34B7F1]">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Burn rate bar chart */}
                      <div>
                        <div className="text-[12px] font-extrabold text-[#667781] mb-3">Burn Rate (tok/s) — AI vs Vanilla</div>
                        <div className="flex items-end gap-6 h-[80px] px-4">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-14 bg-[#34B7F1] rounded-t-md" style={{ height: "52px" }} />
                            <span className="text-[12px] font-black text-[#111B21]">7.2</span>
                            <span className="text-[10px] text-[#667781]">Vanilla</span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-14 bg-[#25D366] rounded-t-md" style={{ height: "80px" }} />
                            <span className="text-[12px] font-black text-[#111B21]">12.4</span>
                            <span className="text-[10px] text-[#667781]">Waswa AI</span>
                          </div>
                        </div>
                      </div>

                      {/* Safeguards */}
                      <div>
                        <div className="text-[12px] font-extrabold text-[#667781] mb-3">Safeguards</div>
                        <div className="flex flex-col gap-2.5">
                          <SafeguardRow label="Daily Cap"      fill={0.72} color="bg-[#25D366]" value="150k tok" />
                          <SafeguardRow label="80% Soft Alert" fill={0.80} color="bg-[#F4B400]" value="ON"       />
                          <div className="flex items-center justify-between gap-2 text-[12px] mt-1">
                            <span className="bg-[#F8F9FA] border border-[#E9EDEF] rounded px-2 py-1 font-extrabold text-[#667781]">LOCK: OFF</span>
                            <span className="text-[#667781]">Grace: 2h</span>
                            <span className="text-[#667781]">Any override → Audit</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </div>

                {/* Right context blade: Gateway Health + VEBA Leakage */}
                <div className="flex flex-col gap-3">
                  <SectionCard title="Mobile Money + VEBA Governance"
                    subtitle="PAYG culture: top-ups, escrow, settlement, leakage prevention."
                    badge="LI" badgeColor="bg-[#128C7E]">

                    {/* Gateway Health */}
                    <div className="text-[11px] font-extrabold text-[#667781] mb-2">Gateway Health</div>
                    <div className="flex flex-col gap-2 mb-4">
                      {[
                        { name: "M-Pesa (KE)",   pct: "98.7%", color: "bg-[#25D366]" },
                        { name: "MTN MoMo (UG)", pct: "94.2%", color: "bg-[#F4B400]" },
                        { name: "Airtel Money",  pct: "99.1%", color: "bg-[#25D366]" },
                      ].map((g) => (
                        <div key={g.name} className="flex items-center justify-between gap-2 text-[12px]">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${g.color}`} />
                            <span className="text-[#111B21]">{g.name}</span>
                          </div>
                          <span className="font-extrabold text-[#111B21]">{g.pct}</span>
                        </div>
                      ))}
                    </div>

                    {/* VEBA Leakage Watch */}
                    <div className="text-[11px] font-extrabold text-[#667781] mb-2">VEBA Leakage Watch</div>
                    <div className="flex flex-col gap-2 mb-4">
                      {[
                        { label: "Contact unlocks (24h)",  value: "73",       dot: "bg-[#25D366]" },
                        { label: "Bookings completed",     value: "18",        dot: "bg-[#25D366]" },
                        { label: "Suspected offline deals",value: "11",        dot: "bg-[#D93025]" },
                        { label: "Commission recovered",   value: "UGX 1.2M", dot: "bg-[#25D366]" },
                      ].map((r) => (
                        <div key={r.label} className="flex items-center justify-between text-[12px]">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${r.dot}`} />
                            <span className="text-[#111B21]">{r.label}</span>
                          </div>
                          <span className="font-extrabold text-[#111B21]">{r.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] text-right text-[#667781] mb-3">MID</div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2">
                      <ActionBtn variant="dark">Open Case</ActionBtn>
                      <ActionBtn variant="teal">Tighten Gating</ActionBtn>
                      <ActionBtn variant="azure">Send WhatsApp</ActionBtn>
                    </div>

                    {/* Context panel */}
                    <div className="mt-4 border-t border-[#E9EDEF] pt-3">
                      <div className="text-[11px] font-extrabold text-[#667781] mb-1.5">Context: Selected Token — BANDWIDTH_HR v5</div>
                      <p className="text-[11px] text-[#667781] leading-relaxed m-0">
                        Meter: bandwidth_usage (kbps/hr) • RPS 10.1 Country: KE • Price floor: KES 22 • Sell: KES 35 (margin guard ✓) Applies to: UKO + OLIWA-PLUS • AI video streaming sessions Next: Recommend 'Roaming Pack' for cross-border units (mcc changes).
                      </p>
                    </div>
                  </SectionCard>
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                S01C — BOTTOM SCROLL: Security, Audit & Session Integrity
            ══════════════════════════════════════════════════════════════ */}
            <section className="px-[18px] pt-6 pb-8">
              <div className="text-[10px] text-[#667781] mb-1.5">Home &gt; Login &amp; SSO &gt; Security &amp; Audit</div>
              <h1 className="text-[22px] font-black text-[#111B21] m-0 mb-1">Security, Audit &amp; Session Integrity — Irrefutable Admin Control</h1>
              <p className="text-[12px] text-[#667781] m-0 mb-4">All high-risk actions are HITL/HIC gated. Every action is immutable in Audit Logs (hash-chained).</p>

              <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-3">

                {/* Left: Auth watchlist + Audit stream */}
                <div className="flex flex-col gap-3">

                  {/* Auth & SSO Watchlist */}
                  <SectionCard title="Auth & SSO Watchlist"
                    subtitle="Login success, MFA coverage, suspicious access — by tenant."
                    badge="LIVE" badgeColor="bg-[#25D366]">
                    <div className="overflow-x-auto rounded-xl border border-[#E9EDEF]" style={{ scrollbarWidth: "none" }}>
                      <table className="w-full text-[12px] border-collapse min-w-[480px]">
                        <thead>
                          <tr className="bg-[#F8F9FA] border-b border-[#E9EDEF]">
                            {["Metric","Value","Status","Notes"].map((h) => (
                              <th key={h} className="text-left px-3 py-2.5 font-extrabold text-[#667781]">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {AUTH_ROWS.map((r) => (
                            <tr key={r.metric} className="border-b border-[#E9EDEF] hover:bg-[#F0F2F5] transition-colors">
                              <td className="px-3 py-2.5 font-extrabold text-[#111B21]">{r.metric}</td>
                              <td className="px-3 py-2.5 font-extrabold text-[#111B21]">{r.value}</td>
                              <td className="px-3 py-2.5 text-center">{r.status}</td>
                              <td className="px-3 py-2.5 text-[#667781]">{r.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </SectionCard>

                  {/* Audit Stream */}
                  <SectionCard title="Audit Stream (Immutable)"
                    subtitle="Every click has a hash. Retention tied to billing plan."
                    badge="AUDIT ON" badgeColor="bg-[#25D366]">
                    <div className="flex flex-col gap-0 rounded-xl border border-[#E9EDEF] overflow-hidden">
                      {AUDIT_ROWS.map((r, i) => (
                        <div key={i} className={`flex items-center gap-3 px-3 py-2.5 text-[12px] border-b border-[#E9EDEF] last:border-b-0 ${i % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}`}>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${r.dot}`} />
                          <span className="font-mono text-[11px] text-[#667781] shrink-0 w-[60px]">{r.time}</span>
                          <span className="font-extrabold text-[#111B21] shrink-0 w-[100px] truncate">{r.actor}</span>
                          <span className={`shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded w-[74px] text-center ${
                            r.action === "APPROVED" ? "bg-[#E8F5F2] text-[#128C7E]" :
                            r.action === "REJECTED" ? "bg-[#FFEBEE] text-[#C62828]" :
                            r.action === "ALERT"    ? "bg-[#FFF8E1] text-[#7A5E00]" :
                            r.action === "SUGGEST"  ? "bg-[#E3F2FD] text-[#1565C0]" :
                                                      "bg-[#F8F9FA] text-[#667781]"
                          }`}>{r.action}</span>
                          <span className="text-[#667781] truncate">{r.detail}</span>
                        </div>
                      ))}
                    </div>

                    {/* Audit footer */}
                    <div className="flex items-center gap-3 mt-3 text-[11px] text-[#667781]">
                      <span>Hash Chain: ON</span>
                      <span>•</span>
                      <span>Last Write: 4s ago</span>
                      <span>•</span>
                      <span>Retention remaining: 365d</span>
                    </div>
                  </SectionCard>
                </div>

                {/* Right: Ops Diagnostics + Break-Glass + Session Summary */}
                <div className="flex flex-col gap-3">
                  <SectionCard title="Ops Diagnostics — Task Manager View"
                    subtitle="Real-time system resource usage (Server processes)."
                    badge="S" badgeColor="bg-[#34B7F1]">

                    {/* Process table */}
                    <div className="text-[11px] font-extrabold text-[#667781] mb-2">NAVAS Core Processes</div>
                    <div className="rounded-xl border border-[#E9EDEF] overflow-hidden mb-4">
                      <div className="grid grid-cols-[1fr_52px_64px_72px] gap-0 text-[11px]">
                        <div className="px-2.5 py-2 font-extrabold text-[#667781] bg-[#F8F9FA] border-b border-[#E9EDEF]">Process</div>
                        <div className="px-2 py-2 font-extrabold text-[#667781] bg-[#F8F9FA] border-b border-[#E9EDEF]">CPU</div>
                        <div className="px-2 py-2 font-extrabold text-[#667781] bg-[#F8F9FA] border-b border-[#E9EDEF]">RAM</div>
                        <div className="px-2 py-2 font-extrabold text-[#667781] bg-[#F8F9FA] border-b border-[#E9EDEF]">NET</div>
                        {PROCESSES.map((p, i) => (
                          <React.Fragment key={p.name}>
                            <div className={`px-2.5 py-2 font-mono text-[10px] ${p.ok ? "text-[#111B21]" : "text-[#D93025] font-bold"} ${i < PROCESSES.length-1 ? "border-b border-[#E9EDEF]" : ""}`}>{p.name}</div>
                            <div className={`px-2 py-2 flex items-center gap-1 ${i < PROCESSES.length-1 ? "border-b border-[#E9EDEF]" : ""}`}>
                              <span className={`w-2 h-2 rounded-full ${p.ok ? "bg-[#25D366]" : "bg-[#D93025]"}`} />
                              <span className="text-[10px] text-[#667781]">{p.cpu}</span>
                            </div>
                            <div className={`px-2 py-2 text-[10px] text-[#667781] ${i < PROCESSES.length-1 ? "border-b border-[#E9EDEF]" : ""}`}>{p.ram}</div>
                            <div className={`px-2 py-2 text-[10px] text-[#667781] ${i < PROCESSES.length-1 ? "border-b border-[#E9EDEF]" : ""}`}>{p.net}</div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Break-Glass */}
                    <div className="border border-[#FFE08A] bg-[#FFF8E1] rounded-xl p-3 mb-3">
                      <div className="font-extrabold text-[#111B21] text-[13px] mb-1">Break-Glass (HIC) Controls</div>
                      <p className="text-[11px] text-[#667781] m-0 mb-3 leading-snug">
                        Use only for safety/legal incidents. Every action is irreversible and escalates to Postmortem + CFO review.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <ActionBtn variant="red">AI Kill-Switch</ActionBtn>
                        <ActionBtn variant="orange">Lock Tokens</ActionBtn>
                        <ActionBtn variant="azure">Export Audit B…</ActionBtn>
                      </div>
                    </div>

                    {/* Session Summary */}
                    <div className="border border-[#E9EDEF] rounded-xl p-3 bg-white">
                      <div className="font-extrabold text-[#111B21] text-[12px] mb-1.5">Session Summary</div>
                      <p className="text-[11px] text-[#667781] m-0 mb-2 leading-snug">
                        Before logout: review open HITL items, check token run-out, and send 1-click payment links to overdue tenants.
                      </p>
                      <div className="text-[10px] text-right text-[#667781]">BOTTOM</div>
                    </div>
                  </SectionCard>
                </div>
              </div>
            </section>

          </div>{/* end scrollable */}
        </main>
      </div>

      {/* HITL Modal */}
      <HITLMintApprovalModal open={hitlOpen} onClose={() => setHitlOpen(false)} />
>>>>>>> parent of ba9189e (Live Monitoring and New Device Configuration)
    </div>
  );
}

<<<<<<< HEAD
// Also expose as named export for moduleRoutes.tsx if it imports that way.
export { GatehousePage };
=======
=======
>>>>>>> parent of ba9189e (Live Monitoring and New Device Configuration)
// ── Safeguard bar row helper ─────────────────────────────────────────────────
function SafeguardRow({ label, fill, color, value }: { label: string; fill: number; color: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-[#667781] w-[100px] shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-[#E6E9EC] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${fill * 100}%` }} />
      </div>
      <span className="text-[11px] font-extrabold text-[#111B21] w-[54px] text-right shrink-0">{value}</span>
    </div>
  );
<<<<<<< HEAD
}
>>>>>>> parent of ba9189e (Live Monitoring and New Device Configuration)
=======
}
>>>>>>> parent of ba9189e (Live Monitoring and New Device Configuration)
