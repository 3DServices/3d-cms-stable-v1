/**
 * parts.tsx — small building blocks shared by the Waswa AI Console.
 */
import React from "react";
import { toneCls, type Tone } from "./format";

export function Pill({ tone = "grey", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold whitespace-nowrap ${toneCls[tone]}`}>
      {children}
    </span>
  );
}

export function Btn({
  children, onClick, kind = "ghost", disabled, type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  kind?: "primary" | "ghost" | "danger" | "blue";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const cls = {
    primary: "bg-[#25D366] text-[#075E54] border-transparent",
    blue:    "bg-[#34B7F1] text-white border-transparent",
    danger:  "bg-white text-[#B91C1C] border-[#FECACA] hover:bg-[#FEF2F2]",
    ghost:   "bg-white text-[#111B21] border-[#E9EDEF] hover:bg-[#F0F2F5]",
  }[kind];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`h-8 px-3 rounded-full border text-[11px] font-extrabold cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-default ${cls}`}
    >
      {children}
    </button>
  );
}

/** Right-hand slide-over for detail and editing. */
export function SidePanel({
  open, title, onClose, children, footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-[299] bg-black/20" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 z-[300] w-full max-w-[560px] bg-white border-l border-[#E9EDEF] flex flex-col shadow-[-8px_0_40px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E9EDEF] shrink-0">
          <div className="font-black text-[14px] text-[#111B21] truncate">{title}</div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-lg bg-[#F0F2F5] hover:bg-[#E9EDEF] grid place-items-center border-none cursor-pointer text-[13px]"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4">{children}</div>
        {footer && (
          <div className="px-4 py-3 border-t border-[#E9EDEF] flex flex-wrap gap-2 justify-end shrink-0">{footer}</div>
        )}
      </div>
    </>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-extrabold text-[#111B21]">{label}</span>
      {children}
      {hint && <span className="text-[10px] text-[#667781]">{hint}</span>}
    </label>
  );
}

export function Notice({ tone = "grey", children }: { tone?: "grey" | "red" | "green" | "amber"; children: React.ReactNode }) {
  const cls = {
    grey:  "bg-[#F8F9FA] border-[#E9EDEF] text-[#667781]",
    red:   "bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]",
    green: "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]",
    amber: "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]",
  }[tone];
  return <div className={`rounded-lg border px-3 py-2 text-[12px] leading-snug ${cls}`}>{children}</div>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="py-10 text-center text-[12px] text-[#667781]">{children}</div>;
}
