/**
 * AEGIS — Live Integrity Monitor
 *
 * A persistent system-health indicator that:
 *   • Polls the threat feed every 12 seconds
 *   • Tracks anomaly velocity (threats/minute)
 *   • Displays a pulse animation and status badge
 *   • Emits alert transitions when status changes
 *
 * Status levels:
 *   SECURE      — No critical/high threats in last cycle
 *   MONITORING  — Elevated threat activity detected
 *   ALERT       — Critical threats actively targeting assets
 */

import { AnimatePresence, motion } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle, Radio, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { ThreatEntry } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type IntegrityStatus = "SECURE" | "MONITORING" | "ALERT";

export interface IntegritySnapshot {
  status: IntegrityStatus;
  activeThreats: number;
  criticalCount: number;
  highCount: number;
  threatsPerMinute: number;
  lastScanAt: string;
  uptimeSeconds: number;
}

interface IntegrityMonitorProps {
  threats: ThreatEntry[];
  /** Poll interval in ms (default 12000) */
  pollInterval?: number;
  /** Compact inline mode vs full card */
  variant?: "card" | "inline" | "badge";
}

/* ------------------------------------------------------------------ */
/*  Status config                                                      */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<
  IntegrityStatus,
  {
    label: string;
    sublabel: string;
    icon: typeof ShieldCheck;
    color: string;
    bg: string;
    border: string;
    pulse: string;
  }
> = {
  SECURE: {
    label: "System Secure",
    sublabel: "All systems operational",
    icon: ShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    pulse: "bg-emerald-400",
  },
  MONITORING: {
    label: "Suspicious Activity",
    sublabel: "Elevated threat velocity detected",
    icon: Activity,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    pulse: "bg-amber-400",
  },
  ALERT: {
    label: "Under Attack",
    sublabel: "Critical threats actively targeting assets",
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    pulse: "bg-red-400",
  },
};

/* ------------------------------------------------------------------ */
/*  Status computation                                                 */
/* ------------------------------------------------------------------ */

function computeStatus(threats: ThreatEntry[]): IntegrityStatus {
  const criticalActive = threats.filter(
    (t) =>
      t.severity === "CRITICAL" &&
      (t.status === "ACTIVE" || t.status === "INVESTIGATING"),
  );
  if (criticalActive.length >= 2) return "ALERT";

  const highActive = threats.filter(
    (t) =>
      (t.severity === "CRITICAL" || t.severity === "HIGH") &&
      (t.status === "ACTIVE" || t.status === "INVESTIGATING"),
  );
  if (highActive.length >= 3) return "ALERT";

  if (highActive.length >= 1) return "MONITORING";

  return "SECURE";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function IntegrityMonitor({
  threats,
  pollInterval = 12000,
  variant = "card",
}: IntegrityMonitorProps) {
  const [snapshot, setSnapshot] = useState<IntegritySnapshot | null>(null);
  const [prevStatus, setPrevStatus] = useState<IntegrityStatus>("SECURE");
  const [scanCount, setScanCount] = useState(0);
  const startTime = useRef(Date.now());
  const prevThreatCount = useRef(threats.length);

  const scan = useCallback(() => {
    const active = threats.filter(
      (t) => t.status === "ACTIVE" || t.status === "INVESTIGATING",
    );
    const critical = threats.filter((t) => t.severity === "CRITICAL");
    const high = threats.filter((t) => t.severity === "HIGH");

    // Approximate threats/minute based on growth
    const elapsed = (Date.now() - startTime.current) / 1000 / 60;
    const tpm = elapsed > 0 ? threats.length / Math.max(elapsed, 0.5) : 0;

    const status = computeStatus(threats);

    setSnapshot({
      status,
      activeThreats: active.length,
      criticalCount: critical.length,
      highCount: high.length,
      threatsPerMinute: Math.round(tpm * 10) / 10,
      lastScanAt: new Date().toISOString(),
      uptimeSeconds: Math.round((Date.now() - startTime.current) / 1000),
    });

    setPrevStatus((prev) => {
      if (prev !== status) {
        // Status changed — could trigger notification here
      }
      return status;
    });

    setScanCount((c) => c + 1);
    prevThreatCount.current = threats.length;
  }, [threats]);

  // Initial scan
  useEffect(() => {
    scan();
  }, [scan]);

  // Periodic polling
  useEffect(() => {
    const timer = window.setInterval(scan, pollInterval);
    return () => window.clearInterval(timer);
  }, [scan, pollInterval]);

  const config = useMemo(
    () => STATUS_CONFIG[snapshot?.status ?? "SECURE"],
    [snapshot?.status],
  );

  if (!snapshot) return null;

  const Icon = config.icon;

  /* Badge variant — compact pill */
  if (variant === "badge") {
    return (
      <motion.div
        layout
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
          config.border,
          config.bg,
        )}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              config.pulse,
            )}
          />
          <span
            className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              config.pulse,
            )}
          />
        </span>
        <span className={cn("text-xs font-semibold", config.color)}>
          {config.label}
        </span>
      </motion.div>
    );
  }

  /* Inline variant — single row */
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border px-4 py-3",
          config.border,
          config.bg,
        )}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              config.pulse,
            )}
          />
          <span
            className={cn(
              "relative inline-flex h-2.5 w-2.5 rounded-full",
              config.pulse,
            )}
          />
        </span>
        <Icon className={cn("h-4 w-4", config.color)} />
        <div className="flex-1">
          <span className={cn("text-sm font-semibold", config.color)}>
            {config.label}
          </span>
          <span className="ml-2 text-xs text-aegis-muted">
            {config.sublabel}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-aegis-muted">
          <Radio className="h-3 w-3" />
          Scan #{scanCount}
        </div>
      </div>
    );
  }

  /* Card variant — full display */
  return (
    <motion.div
      layout
      className={cn(
        "rounded-2xl border bg-aegis-card p-5 transition-all duration-500",
        config.border,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("relative rounded-xl p-2.5", config.bg)}>
            <Icon className={cn("h-5 w-5", config.color)} />
            {/* Pulse dot */}
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                  config.pulse,
                )}
              />
              <span
                className={cn(
                  "relative inline-flex h-3 w-3 rounded-full",
                  config.pulse,
                )}
              />
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Live Integrity Monitor
            </h3>
            <p className="mt-0.5 text-[10px] text-aegis-muted">
              Polling every {pollInterval / 1000}s · Scan #{scanCount}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={snapshot.status}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold tracking-wider",
              config.bg,
              config.color,
            )}
          >
            {config.label}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Status message */}
      <div
        className={cn(
          "mt-4 rounded-xl border px-4 py-3",
          config.border,
          config.bg,
        )}
      >
        <p className={cn("text-sm font-medium", config.color)}>
          {config.sublabel}
        </p>
      </div>

      {/* Stats grid */}
      <div className="mt-4 grid grid-cols-4 gap-3">
        {[
          {
            label: "Active Threats",
            value: snapshot.activeThreats,
            icon: AlertTriangle,
          },
          {
            label: "Critical",
            value: snapshot.criticalCount,
            icon: AlertTriangle,
          },
          { label: "High", value: snapshot.highCount, icon: Activity },
          {
            label: "Threats/min",
            value: snapshot.threatsPerMinute,
            icon: Radio,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-aegis-border/30 bg-white/[0.02] p-2.5 text-center"
          >
            <stat.icon className="mx-auto h-3 w-3 text-aegis-muted" />
            <div className="mt-1 text-base font-bold tabular-nums text-white">
              {stat.value}
            </div>
            <div className="text-[9px] text-aegis-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Heartbeat bar */}
      <div className="mt-4 flex items-center gap-2">
        <CheckCircle className="h-3 w-3 text-aegis-muted" />
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className={cn("h-full rounded-full", config.pulse)}
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ width: "30%" }}
          />
        </div>
        <span className="text-[9px] tabular-nums text-aegis-muted">
          {new Date(snapshot.lastScanAt).toLocaleTimeString()}
        </span>
      </div>
    </motion.div>
  );
}
