/**
 * asset-digital-twin/metrics.ts — Per-asset scoring for the Digital Twin Card.
 *
 * Pure scoring functions for: Health, Productivity, Risk, Opportunity, Spend.
 * Each takes an Asset and optional AssetEnrichment, returns a MetricResult.
 */

import type { Asset } from "./components/types";

export type MetricTier = "good" | "warn" | "critical" | "unknown";

export interface MetricResult {
  value:       number;
  tier:        MetricTier;
  label:       string;
  sourceNote:  string;
  placeholder: boolean;
}

export interface AssetEnrichment {
  utilization?: {
    hours_active: number;
    hours_total:  number;
    job_count?:   number;
    distance_km?: number;
  };
  spend?: {
    total:        number;
    currency:     string;
    fuel?:        number;
    maintenance?: number;
    parts?:       number;
    tokens?:      number;
  };
  marketplace?: {
    impressions: number;
    requests:    number;
    bookings:    number;
    idle_hours:  number;
  };
  risk_signals?: {
    predictive_flags: number;
    open_incidents:   number;
    compliance_gaps:  number;
  };
}

function tierFromValue(value: number): MetricTier {
  if (value < 0)   return "unknown";
  if (value >= 70) return "good";
  if (value >= 40) return "warn";
  return "critical";
}

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

export function scoreHealth(a: Asset): MetricResult {
  const statusMap: Record<Asset["status"], number> = {
    Online:  95,
    Warn:    65,
    Alarm:   35,
    Crit:    15,
    Offline: 5,
  };
  const value = statusMap[a.status] ?? 0;
  return {
    value,
    tier:  tierFromValue(value),
    label: a.status,
    sourceNote: "Status: " + a.status + ". Last seen " + a.lastSeen + ".",
    placeholder: false,
  };
}

export function scoreProductivity(a: Asset, e?: AssetEnrichment): MetricResult {
  if (e?.utilization && e.utilization.hours_total > 0) {
    const ratio = e.utilization.hours_active / e.utilization.hours_total;
    const value = clamp(Math.round(ratio * 100));
    return {
      value,
      tier: tierFromValue(value),
      label: value + "%",
      sourceNote: "Utilization " + value + "% over window.",
      placeholder: false,
    };
  }
  const burning = /[1-9]/.test(a.tokensAB ?? "");
  const online  = a.status === "Online";
  let value = 0;
  if (online && burning) value = 70;
  else if (online)       value = 55;
  else if (burning)      value = 40;
  else                   value = 20;
  return {
    value,
    tier: tierFromValue(value),
    label: online && burning ? "Active" : online ? "Idle" : "Inactive",
    sourceNote: "Estimated from status + token burn. Real utilization lands with Phase B.",
    placeholder: true,
  };
}

export function scoreRisk(a: Asset, e?: AssetEnrichment): MetricResult {
  const riskBase: Record<Asset["risk"], number> = { Low: 85, Med: 55, High: 20 };
  let value = riskBase[a.risk];
  const safetyNum = Number(a.safety);
  if (Number.isFinite(safetyNum)) {
    value = Math.round(value * 0.5 + safetyNum * 0.5);
  }
  let placeholder = !e?.risk_signals;
  if (e?.risk_signals) {
    const penalty =
      e.risk_signals.predictive_flags * 6 +
      e.risk_signals.open_incidents   * 10 +
      e.risk_signals.compliance_gaps  * 4;
    value = clamp(value - penalty);
    placeholder = false;
  }
  return {
    value,
    tier:  tierFromValue(value),
    label: a.risk,
    sourceNote: "Risk tier " + a.risk + " + safety " + (a.safety || "-") + ".",
    placeholder,
  };
}

export function scoreOpportunity(a: Asset, e?: AssetEnrichment): MetricResult {
  if (e?.marketplace) {
    const m = e.marketplace;
    const idleness    = clamp((m.idle_hours / Math.max(m.impressions + 1, 24)) * 100);
    const realisation = clamp((m.bookings / Math.max(m.requests, 1)) * 100);
    const value = clamp(Math.round(idleness * 0.6 + (100 - realisation) * 0.4));
    return {
      value,
      tier: tierFromValue(value),
      label: value >= 70 ? "High" : value >= 40 ? "Some" : "Low",
      sourceNote: m.idle_hours + "h idle, " + m.bookings + " booked.",
      placeholder: false,
    };
  }
  const listable = a.veba !== "N/A";
  let value: number;
  let label: string;
  if (!listable) { value = 0; label = "N/A"; }
  else if (a.veba === "Listed") { value = 45; label = "Listed"; }
  else { value = 80; label = "Unlisted"; }
  return {
    value,
    tier: listable ? tierFromValue(value) : "unknown",
    label,
    sourceNote:
      a.veba === "N/A" ? "Not VEBA-eligible." :
      a.veba === "Off" ? "Eligible but not listed." :
      "Listed on VEBA.",
    placeholder: true,
  };
}

export function scoreSpend(a: Asset, e?: AssetEnrichment): MetricResult {
  if (e?.spend) {
    const s = e.spend.total;
    const value =
      s < 100000  ? 90 :
      s < 500000  ? 70 :
      s < 1500000 ? 45 :
      s < 3000000 ? 25 : 10;
    return {
      value,
      tier: tierFromValue(value),
      label: e.spend.currency + " " + s.toLocaleString(),
      sourceNote: "Total spend over window.",
      placeholder: false,
    };
  }
  const m = (a.tokensAB ?? "").match(/([\d.]+)([kKmM]?)/);
  let burn = 0;
  if (m) {
    const n = parseFloat(m[1]);
    const mul = m[2]?.toLowerCase() === "m" ? 1000000 :
                m[2]?.toLowerCase() === "k" ? 1000 : 1;
    burn = n * mul;
  }
  const value =
    burn === 0    ? 50 :
    burn < 1000   ? 90 :
    burn < 5000   ? 70 :
    burn < 15000  ? 45 :
    burn < 30000  ? 25 : 10;
  return {
    value,
    tier: tierFromValue(value),
    label: a.tokensAB || "-",
    sourceNote: "Token burn: " + a.tokensAB + ". Cost breakdown lands with Phase B.",
    placeholder: true,
  };
}

export interface AssetMetrics {
  health:       MetricResult;
  productivity: MetricResult;
  risk:         MetricResult;
  opportunity:  MetricResult;
  spend:        MetricResult;
}

export function computeAssetMetrics(a: Asset, e?: AssetEnrichment): AssetMetrics {
  return {
    health:       scoreHealth(a),
    productivity: scoreProductivity(a, e),
    risk:         scoreRisk(a, e),
    opportunity:  scoreOpportunity(a, e),
    spend:        scoreSpend(a, e),
  };
}

export const TIER_COLORS: Record<MetricTier, { bg: string; fg: string; bar: string }> = {
  good:     { bg: "#E9F7F4", fg: "#075E54", bar: "#25D366" },
  warn:     { bg: "#FFF4E5", fg: "#9A6700", bar: "#F97316" },
  critical: { bg: "#FFF5F5", fg: "#B00020", bar: "#EF4444" },
  unknown:  { bg: "#F0F2F5", fg: "#667781", bar: "#9CA3AF" },
};
