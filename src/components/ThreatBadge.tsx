import { cn } from "@/lib/cn";
import type { ThreatSeverity } from "@/lib/types";

const severityStyles: Record<ThreatSeverity, string> = {
  CRITICAL: "bg-aegis-danger/20 text-aegis-danger ring-1 ring-aegis-danger/40",
  HIGH: "bg-red-500/15 text-red-300 ring-1 ring-red-400/30",
  MEDIUM: "bg-aegis-warn/15 text-aegis-warn ring-1 ring-aegis-warn/30",
  LOW: "bg-aegis-success/15 text-aegis-success ring-1 ring-aegis-success/30",
};

export function ThreatBadge({ severity }: { severity: ThreatSeverity }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-[0.18em]",
        severityStyles[severity],
        severity === "CRITICAL" && "animate-pulse",
      )}
    >
      {severity}
    </span>
  );
}
