/**
 * StatusStrip — Secondary Navigation / Context Bar
 *
 * Chips are always visible and horizontally scrollable on all screen sizes.
 * The scrollbar is hidden (cross-browser, no plugin required).
 * Proper min-w-0 + overflow-hidden containment prevents layout blowout.
 */
import React from "react";

const btnVariant: Record<string, string> = {
  green: "bg-[#25D366] text-white",
  azure: "bg-[#34B7F1] text-white",
  teal:  "bg-[#128C7E] text-white",
  red:   "bg-[#D93025] text-white",
  ghost: "bg-[#F8F9FA] border border-[#E9EDEF] text-[#667781]",
};

interface StatusChip  { id: string; label: string; }
interface StripAction { id: string; label: string; variant: "green" | "azure" | "teal" | "ghost" | "red"; onClick?: () => void; }
interface StatusStripProps { chips?: StatusChip[]; actions?: StripAction[]; }

const DEFAULT_CHIPS: StatusChip[] = [
  { id: "scope",  label: "Scope: Dealer→Client→Org" },
  { id: "rbac",   label: "RBAC: SYSADMIN / Admin" },
  { id: "wallet", label: "Wallet: UGX 8.6M • 1.24M Tok" },
  { id: "burn",   label: "Burn: 1.7 Tok/s" },
  { id: "runout", label: "Run-out: ≈ 8.1 days" },
  { id: "status", label: "Status: 🟢 Green • 99.82%" },
  { id: "fresh",  label: "Fresh: p95 22s • last msg 7s" },
  { id: "alerts", label: "Alerts: P1:2  P2:11" },
  { id: "pay",    label: "Pay: M-Pesa OK • MTN OK" },
  { id: "waswa",  label: "Waswa: ON • HITL 3" },
  { id: "range",  label: "Range: 24h" },
  { id: "audit",  label: "Audit: ON • 89d" },
];

const DEFAULT_ACTIONS: StripAction[] = [
  { id: "new",    label: "+ New",  variant: "green" },
  { id: "export", label: "Export", variant: "azure" },
];

/** Inline style to hide scrollbar cross-browser without a Tailwind plugin. */
const hideScrollbar: React.CSSProperties = {
  overflowX:          "auto",
  scrollbarWidth:     "none",   /* Firefox */
  msOverflowStyle:    "none",   /* IE/Edge legacy */
};

export function StatusStrip({ chips = DEFAULT_CHIPS, actions = DEFAULT_ACTIONS }: StatusStripProps) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white border-b border-[#E9EDEF] sticky top-12 z-[90] shrink-0 overflow-hidden">

      {/*
        Chips container:
          flex-1 min-w-0  → takes remaining width, never overflows the row
          overflow-hidden  → clips so the inner scroll div doesn't push siblings
        Inner scroll div:
          flex + whitespace-nowrap chips → scrolls horizontally
          scrollbar hidden via inline style (guaranteed, no plugin needed)
      */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex gap-1.5" style={hideScrollbar}>
          {chips.map((c) => (
            <span
              key={c.id}
              className="shrink-0 whitespace-nowrap bg-[#F8F9FA] border border-[#E9EDEF] rounded-full px-2.5 py-1 text-[11px] text-[#667781]"
            >
              {c.label}
            </span>
          ))}
        </div>
      </div>

      {/* Action buttons — always visible, never shrink */}
      <div className="flex gap-2 shrink-0 pl-1">
        {actions.map((a) => (
          <button
            key={a.id}
            onClick={a.onClick}
            className={`h-[28px] rounded-full px-3 text-[12px] font-bold cursor-pointer transition-all hover:brightness-105 active:opacity-85 ${btnVariant[a.variant]}`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}