/**
 * TaskManagerModal
 *
 * Full-screen dark overlay modal showing live NAVAS core process stats.
 * All styles use Tailwind utility classes only.
 */
import React, { useMemo } from "react";

interface TaskManagerModalProps { onClose: () => void; }

export function TaskManagerModal({ onClose }: TaskManagerModalProps) {
  const rows = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => ({
      name:   i % 5 === 0
                ? `airtel_webhook_worker_${String(i).padStart(2, "0")}`
                : `python_socket_ingestor_${String(i).padStart(2, "0")}`,
      status: i % 5 === 0 ? "Degraded" : "Running",
      cpu:    (Math.random() * 10).toFixed(1),
      mem:    (Math.random() * 4).toFixed(1),
      disk:   (Math.random() * 1).toFixed(1),
      net:    (Math.random() * 1).toFixed(1),
      tok:    (Math.random() * 0.2).toFixed(2),
    })),
  []);

  const summary = [
    ["CPU", "63%"], ["Memory", "82%"], ["Disk", "76%"], ["Network", "1.2%"], ["GPU", "41%"],
  ];

  // Shared grid columns for head + body rows
  const ROW_GRID = "grid grid-cols-[2.2fr_0.9fr_0.6fr_0.6fr_0.6fr_0.6fr_0.6fr] gap-2 items-center min-w-[540px]";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/60 grid place-items-center p-0 xs:p-4 z-[500] overflow-hidden"
    >
      <div className="
        flex flex-col overflow-hidden
        w-full h-[100dvh]
        xs:w-[min(1080px,96vw)] xs:h-[min(700px,90dvh)]
        xs:rounded-xl
        bg-[#121417] border border-[#2B3137]
        shadow-[0_20px_60px_rgba(0,0,0,0.5)]
      ">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="h-12 flex items-center justify-between px-3.5 bg-[#1A1E23] text-white shrink-0 gap-2.5">
          <span className="font-black text-[13px] truncate">Task Manager — NAVAS Core (Live)</span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-full px-2.5 py-1 text-[12px] font-extrabold bg-[#25D366] text-white">Live</span>
            <button className="h-[28px] rounded-full px-3 text-[12px] font-bold bg-[#D93025] text-white cursor-pointer hover:brightness-105">
              End task
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-[34px] h-[34px] rounded-lg border border-[#2B3137] text-[#9AA6B2] cursor-pointer hover:bg-[#2B3137] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Summary stats ────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3.5 px-3.5 py-2.5 text-white shrink-0">
          {summary.map(([k, v]) => (
            <div key={k} className="min-w-[80px]">
              <div className="font-black">{v}</div>
              <div className="text-[12px] text-[#9AA6B2]">{k}</div>
            </div>
          ))}
        </div>

        {/* ── Process table ────────────────────────────────────────────── */}
        <div className="
          flex flex-col min-h-0 flex-1
          mx-3.5 mb-3.5 rounded-xl overflow-hidden
          bg-[#0F1216] border border-[#2B3137]
        ">
          {/* Table head */}
          <div className={`${ROW_GRID} px-2.5 py-2.5 text-[#9AA6B2] font-black text-[12px] border-b border-[#20262D] shrink-0`}>
            <div>Name</div><div>Status</div><div>CPU</div>
            <div>Mem</div><div>Disk</div><div>Net</div><div>Tok/s</div>
          </div>

          {/* Scrollable body */}
          <div className="overflow-auto">
            {rows.map((r) => (
              <div key={r.name} className={`${ROW_GRID} px-2.5 py-2 border-b border-[#20262D] text-[#D7DEE6] text-[12px]`}>
                <div className="truncate font-mono text-[11px]">{r.name}</div>
                <div className={r.status !== "Running" ? "text-[#FFB74D]" : ""}>{r.status}</div>
                <Cell>{r.cpu}%</Cell>
                <Cell>{r.mem}%</Cell>
                <Cell>{r.disk}MB/s</Cell>
                <Cell>{r.net}Mbps</Cell>
                <Cell green>{r.tok}</Cell>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div className="px-3.5 py-2 text-[#9AA6B2] text-[11px] border-t border-[#2B3137] shrink-0">
          HIC/HITL actions are cryptographically logged (audit hash chain).
        </div>
      </div>
    </div>
  );
}

function Cell({ children, green = false }: { children: React.ReactNode; green?: boolean }) {
  return (
    <div className={`rounded-md px-2 py-1.5 text-[11px] ${green ? "bg-[#10361C] text-[#EAF2FA]" : "bg-[#0B2A3C] text-[#EAF2FA]"}`}>
      {children}
    </div>
  );
}