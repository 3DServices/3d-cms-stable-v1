export type Severity = "green" | "warning" | "alarm" | "critical";

export type HitlAction = {
  id: string;
  sev: Severity;
  title: string;
  reason: string;
  primaryCta: "Approve" | "HIC";
  secondaryCta: string;
};

export const sevLabel: Record<Severity, string> = {
  green:    "Active",
  warning:  "Warning",
  alarm:    "Alarm",
  critical: "Critical",
};
