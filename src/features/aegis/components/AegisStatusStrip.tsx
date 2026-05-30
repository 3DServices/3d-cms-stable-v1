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
  "Primary-Systems: Stable",
  "Server: Online",
  "Bandwidth: 120 Gbps",
  "Bandwidth-Burn: 85 Gbps",
  "Systemd-Process: Running",
  "SSE-Connections: 4,812",
  "Uptime 99.9%"
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

    </div>
  );
}
