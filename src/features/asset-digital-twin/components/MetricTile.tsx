/**
 * MetricTile — One tile inside a DigitalTwinCard.
 *
 * Renders one of the five dimensions (Health / Productivity / Risk /
 * Opportunity / Spend) as a small panel with a label, value, tier color,
 * and a source-note tooltip.
 *
 * Pure presentation — receives a MetricResult from metrics.ts and renders.
 */

import React from "react";
import type { MetricResult } from "../metrics";
import { TIER_COLORS } from "../metrics";

interface MetricTileProps {
  /** Display name of the dimension. */
  name: string;
  /** Computed metric. */
  metric: MetricResult;
  /** Optional click handler — Phase C will route to drill-downs. */
  onClick?: () => void;
}

export function MetricTile({ name, metric, onClick }: MetricTileProps) {
  const colors = TIER_COLORS[metric.tier];

  return (
    <div
      title={metric.sourceNote}
      onClick={onClick}
      className="flex flex-col gap-0.5 px-2.5 py-2 rounded-lg border transition-colors"
      style={{
        background: colors.bg,
        borderColor: colors.bar + "33",
        cursor: onClick ? "pointer" : "default",
        minWidth: 0,
      }}
    >
      <div className="flex items-center justify-between gap-1">
        <span
          className="text-[10px] font-extrabold uppercase tracking-wide truncate"
          style={{ color: colors.fg }}
        >
          {name}
        </span>
        {metric.placeholder && (
          <span
            className="text-[9px] font-medium px-1 rounded-full opacity-70"
            style={{ background: "rgba(255,255,255,0.6)", color: colors.fg }}
            title="Score uses a placeholder proxy until backend enrichment lands."
          >
            ~
          </span>
        )}
      </div>
      <div
        className="text-[13px] font-black leading-tight truncate"
        style={{ color: colors.fg }}
      >
        {metric.label}
      </div>
      {/* Score bar */}
      <div
        className="mt-1 h-1 rounded-full overflow-hidden"
        style={{ background: "rgba(0,0,0,0.06)" }}
      >
        <div
          style={{
            width: Math.max(0, Math.min(100, metric.value)) + "%",
            height: "100%",
            background: colors.bar,
          }}
        />
      </div>
    </div>
  );
}
