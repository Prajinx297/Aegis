/**
 * AEGIS — Trust Score Card Component
 *
 * Animated circular progress ring with color-coded risk assessment,
 * expandable reasoning panel, and weighted signal breakdown bars.
 */

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Info, Shield, ShieldAlert, ShieldOff } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import type { TrustLabel, TrustScoreResult } from "@/lib/trustScore";

interface TrustScoreCardProps {
  result: TrustScoreResult;
  assetName?: string;
  compact?: boolean;
}

const LABEL_CONFIG: Record<
  TrustLabel,
  { color: string; bg: string; border: string; icon: typeof Shield; ring: string }
> = {
  TRUSTED: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: Shield,
    ring: "#10B981",
  },
  RISKY: {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: ShieldAlert,
    ring: "#F59E0B",
  },
  COMPROMISED: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    icon: ShieldOff,
    ring: "#EF4444",
  },
};

const RING_SIZE = 140;
const RING_STROKE = 10;
const RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function TrustScoreCard({ result, assetName, compact }: TrustScoreCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = LABEL_CONFIG[result.label];
  const Icon = config.icon;
  const offset = CIRCUMFERENCE - (result.score / 100) * CIRCUMFERENCE;

  const sortedBreakdown = useMemo(
    () => [...result.breakdown].sort((a, b) => b.weight - a.weight),
    [result.breakdown],
  );

  return (
    <div
      className={cn(
        "rounded-2xl border bg-aegis-card transition-all duration-300",
        config.border,
        compact ? "p-4" : "p-6",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn("rounded-xl p-2.5", config.bg)}>
            <Icon className={cn("h-5 w-5", config.color)} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Trust & Risk Score
            </h3>
            {assetName && (
              <p className="mt-0.5 text-xs text-aegis-muted">{assetName}</p>
            )}
          </div>
        </div>

        <div
          className={cn(
            "rounded-full px-3 py-1 text-xs font-bold tracking-wider",
            config.bg,
            config.color,
          )}
        >
          {result.label}
        </div>
      </div>

      {/* Score Ring + Summary */}
      <div className={cn("mt-5 flex items-center gap-6", compact && "mt-3 gap-4")}>
        {/* Circular progress ring */}
        <div className="relative flex-shrink-0">
          <svg
            width={compact ? 100 : RING_SIZE}
            height={compact ? 100 : RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          >
            {/* Background ring */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={RING_STROKE}
            />
            {/* Animated score ring */}
            <motion.circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={config.ring}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              style={{ filter: `drop-shadow(0 0 8px ${config.ring}55)` }}
            />
          </svg>
          {/* Center score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={cn("text-2xl font-black tabular-nums", config.color)}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
            >
              {result.score}
            </motion.span>
            <span className="text-[10px] text-aegis-muted">/100</span>
          </div>
        </div>

        {/* Reasoning preview */}
        <div className="min-w-0 flex-1 space-y-1.5">
          {result.reasoning.slice(0, compact ? 1 : 2).map((reason, i) => (
            <p key={i} className="text-xs leading-relaxed text-aegis-text/70">
              {reason}
            </p>
          ))}
          <p className="text-[10px] text-aegis-muted">
            Computed {new Date(result.computedAt).toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Expand toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-aegis-border/50 bg-aegis-surface/50 py-2 text-xs text-aegis-muted transition hover:bg-aegis-border/20 hover:text-white"
      >
        <Info className="h-3 w-3" />
        {expanded ? "Hide" : "Show"} Signal Breakdown
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {/* Expandable breakdown panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
              {sortedBreakdown.map((signal) => (
                <div key={signal.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-aegis-text">
                      {signal.name}
                    </span>
                    <span className="tabular-nums text-aegis-muted">
                      {signal.rawScore}/100
                      <span className="ml-1 text-[10px]">
                        (w: {Math.round(signal.weight * 100)}%)
                      </span>
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: signal.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${signal.rawScore}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed text-aegis-muted">
                    {signal.reasoning}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
