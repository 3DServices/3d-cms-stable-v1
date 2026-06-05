/**
 * AegisStatusStrip — AEGIS Dashboard Secondary Context Bar
 *
 * Matches screenshot exactly:
 *   Tenant selector | BAC badge | Wallet balance + Top-up | Burn rate
 *   Live scrolling ticker (Forecast, API uptime, Kafka, Redis…)
 *   Waswa AI toggle (pill + chevron)
 *
 * This is a standalone strip below AegisTopBar, not a modal.
 * All styles: Tailwind utility classes only.
 */
import React from "react";

interface AegisStatusStripProps {
  tenant?:        string;
  walletBalance?: string;
  burnRate?:      string;
  forecast?:      string;
  waswaOn?:       boolean;
  onToggleWaswa?: () => void;
  onOpenTopup?:   () => void;
  tickerItems?:   string[];
}

const DEFAULT_TICKER = [
  "FrontEnd-APIs: Operational",
  "Server: Online",
  "Bandwidth: 120 Gbps",
  "Bandwidth-Burn: 85 Gbps",
  "Systemd-Process: Running",
  "SSE-Connections: 4,812",
  "Uptime 99.8%"
];

const hideScrollbar: React.CSSProperties = {
  overflowX: "auto",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

export function AegisStatusStrip({
  tenant        = "3D-Services (TOP)",
  walletBalance = "1,284,500 T",
  burnRate      = "2.4 T/s",
  waswaOn       = true,
  onToggleWaswa,
  onOpenTopup,
  tickerItems   = DEFAULT_TICKER,
}: AegisStatusStripProps) {
  return (
    <div className="h-10 flex items-center bg-white border-b border-[#E9EDEF] sticky top-12 z-[90] shrink-0 overflow-hidden">

      

      {/* Live ticker — scrollable, fills remaining space */}
      <div className="flex-1 min-w-0 h-full flex items-center" style={hideScrollbar}>
        <div className="flex items-center gap-3 px-3 whitespace-nowrap text-[11px] text-[#667781]">
          {tickerItems.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-[#E9EDEF]">•</span>}
              <span>{item}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Waswa AI toggle */}
      <div className="flex items-center gap-2 px-3 shrink-0 border-l border-[#E9EDEF] h-full">
        <span className="text-[11px] text-[#667781] hidden sm:block">Waswa AI</span>
        <button
          onClick={onToggleWaswa}
          aria-pressed={waswaOn}
          className={`
            relative w-10 h-5 rounded-full border-none cursor-pointer transition-colors duration-200 shrink-0
            ${waswaOn ? "bg-[#25D366]" : "bg-[#E9EDEF]"}
          `}
        >
          <span className={`
            absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
            ${waswaOn ? "translate-x-5" : "translate-x-0.5"}
          `} />
        </button>
        <span className="text-[11px] text-[#667781]">›</span>
      </div>
    </div>
  );
}
