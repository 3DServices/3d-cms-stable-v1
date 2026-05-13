/**
 * UI Primitives — shared building blocks used across Dashboard blades.
 * All styles use Tailwind utility classes only; no external CSS required.
 */
import React from "react";
import type { Severity} from "../types";
import { sevLabel } from "../types";

// ── Severity colour maps ─────────────────────────────────────────────────────
const sevAccent: Record<Severity, string> = {
  green:    "bg-[#25D366]",
  warning:  "bg-[#F4B400]",
  alarm:    "bg-[#FB8C00]",
  critical: "bg-[#D93025]",
};

const sevPill: Record<Severity, string> = {
  green:    "bg-[#25D366] text-white",
  warning:  "bg-[#F4B400] text-[#111]",
  alarm:    "bg-[#FB8C00] text-[#111]",
  critical: "bg-[#D93025] text-white",
};

// ── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiProps { title: string; value: string; sub: string; sev: Severity; }

export function Kpi({ title, value, sub, sev }: KpiProps) {
  return (
    <div className="relative border border-[#E9EDEF] rounded-xl p-3 bg-white min-h-[84px]">
      {/* Left accent bar */}
      <span className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${sevAccent[sev]}`} />

      <div className="text-[11px] text-[#667781] pl-1">{title}</div>
      <div className="text-[18px] font-black text-[#111B21] mt-1 pl-1">{value}</div>
      <div className="text-[11px] text-[#667781] mt-0.5 max-w-[78%] pl-1">{sub}</div>

      {/* Badge */}
      <span className={`
        absolute right-2.5 top-2.5
        rounded-full px-2 py-0.5 text-[11px] font-extrabold
        ${sevPill[sev]}
      `}>
        {sevLabel[sev]}
      </span>
    </div>
  );
}

// ── Generic Card ─────────────────────────────────────────────────────────────

interface CardProps { title: string; subtitle?: string; children: React.ReactNode; }

export function Card({ title, subtitle, children }: CardProps) {
  return (
    <div className="border border-[#E9EDEF] rounded-xl bg-white">
      <div className="px-3 py-2.5 border-b border-[#E9EDEF]">
        <div className="font-black text-[13px] text-[#111B21]">{title}</div>
        {subtitle && <div className="text-[11px] text-[#667781] mt-0.5">{subtitle}</div>}
      </div>
      <div className="p-3 flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

// ── Resource Bar ─────────────────────────────────────────────────────────────

interface BarProps { label: string; pct: number; meta: string; warn?: boolean; }

export function Bar({ label, pct, meta, warn = false }: BarProps) {
  const fill = `${Math.max(0, Math.min(1, pct)) * 100}%`;
  return (
    <div className="grid grid-cols-[60px_1fr] sm:grid-cols-[70px_1fr_180px] gap-2 items-center">
      <div className="text-[11px] text-[#667781]">{label}</div>

      <div className="h-3 bg-[#E6E9EC] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${warn ? "bg-[#F4B400]" : "bg-[#25D366]"}`}
          style={{ width: fill }}
        />
      </div>

      {/* Meta: wraps under bar on xs, inline on sm+ */}
      <div className="col-span-2 sm:col-span-1 text-[11px] text-[#667781] sm:pl-0 pl-[68px] -mt-1 sm:mt-0">
        {meta}
      </div>
    </div>
  );
}

// ── Mini Gateway ─────────────────────────────────────────────────────────────

interface MiniGatewayProps { name: string; status: string; meta: string; sev: Severity; }

export function MiniGateway({ name, status, meta, sev }: MiniGatewayProps) {
  return (
    <div className="border border-[#E9EDEF] rounded-xl bg-[#F8F9FA] p-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="font-extrabold text-[#667781] text-[12px] truncate min-w-0">{name}</div>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold shrink-0 ${sevPill[sev]}`}>
          {status}
        </span>
      </div>
      <div className="text-[11px] text-[#667781] mt-1.5 leading-snug">{meta}</div>
    </div>
  );
}

// ── Mini Stat ────────────────────────────────────────────────────────────────

interface MiniStatProps { label: string; value: string; }

export function MiniStat({ label, value }: MiniStatProps) {
  return (
    <div className="border border-[#E9EDEF] rounded-xl bg-white p-2.5">
      <div className="text-[11px] text-[#667781]">{label}</div>
      <div className="mt-1.5 font-black text-[14px] text-[#111B21]">{value}</div>
    </div>
  );
}