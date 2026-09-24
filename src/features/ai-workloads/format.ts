/**
 * format.ts — non-component helpers for the Waswa AI Console
 * (kept apart from parts.tsx so React fast refresh keeps working).
 */

export function errText(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: string }).message);
  }
  return "Something went wrong. Please try again.";
}

export function when(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export function day(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export type Tone = "green" | "blue" | "red" | "amber" | "grey" | "teal";

export const toneCls: Record<Tone, string> = {
  green: "bg-[#DCFCE7] text-[#166534]",
  blue:  "bg-[#E0F2FE] text-[#075985]",
  red:   "bg-[#FEE2E2] text-[#B91C1C]",
  amber: "bg-[#FEF3C7] text-[#92400E]",
  grey:  "bg-[#F0F2F5] text-[#667781]",
  teal:  "bg-[#CCFBF1] text-[#115E59]",
};

export const statusTone: Record<string, Tone> = {
  draft: "grey", pending: "amber", approved: "green", rejected: "red", retired: "grey",
  open: "red", in_review: "amber", resolved: "green", dismissed: "grey",
};

export const kindLabel: Record<string, { label: string; tone: Tone }> = {
  flag:     { label: "Flagged answer",     tone: "red"   },
  approval: { label: "Awaiting approval",  tone: "amber" },
  recheck:  { label: "Recheck",            tone: "blue"  },
  document: { label: "Document review",    tone: "teal"  },
};

export const inputCls =
  "w-full rounded-lg border border-[#E9EDEF] bg-[#F8F9FA] px-2.5 py-2 text-[12px] outline-none focus:border-[#128C7E] disabled:opacity-60";

