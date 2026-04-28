/**
 * AEGIS — Network Topology & Threat Origin Visualization
 *
 * Interactive SVG-based world map visualization showing:
 *   - Threat origin countries with intensity heat
 *   - Connection lines from origins to the protected asset
 *   - Real-time threat count by region
 *   - Animated pulse indicators for active threats
 */

import { AnimatePresence, motion } from "framer-motion";
import { Globe, MapPin, Shield, Zap } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/cn";
import type { ThreatEntry } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Geo coordinates (simplified mapping for demo)                      */
/* ------------------------------------------------------------------ */

const COUNTRY_COORDS: Record<string, { x: number; y: number; name: string }> = {
  DE: { x: 510, y: 160, name: "Germany" },
  US: { x: 200, y: 180, name: "United States" },
  SG: { x: 720, y: 300, name: "Singapore" },
  NL: { x: 500, y: 155, name: "Netherlands" },
  RO: { x: 545, y: 175, name: "Romania" },
  CA: { x: 210, y: 140, name: "Canada" },
  FR: { x: 490, y: 175, name: "France" },
  PL: { x: 530, y: 155, name: "Poland" },
  GB: { x: 480, y: 150, name: "United Kingdom" },
  SE: { x: 520, y: 125, name: "Sweden" },
  HK: { x: 730, y: 240, name: "Hong Kong" },
  ES: { x: 475, y: 195, name: "Spain" },
  UA: { x: 555, y: 160, name: "Ukraine" },
  RU: { x: 600, y: 135, name: "Russia" },
};

// AEGIS HQ location (center of map)
const HQ = { x: 480, y: 200 };

interface ThreatMapProps {
  threats: ThreatEntry[];
  maxDisplay?: number;
}

export function ThreatMap({ threats, maxDisplay = 50 }: ThreatMapProps) {
  // Aggregate threats by country
  const countryData = useMemo(() => {
    const map = new Map<
      string,
      { code: string; count: number; critical: number; active: number }
    >();

    for (const t of threats.slice(0, maxDisplay)) {
      const existing = map.get(t.countryCode) ?? {
        code: t.countryCode,
        count: 0,
        critical: 0,
        active: 0,
      };
      existing.count++;
      if (t.severity === "CRITICAL") existing.critical++;
      if (t.status === "ACTIVE" || t.status === "INVESTIGATING")
        existing.active++;
      map.set(t.countryCode, existing);
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [threats, maxDisplay]);

  const maxCount = Math.max(1, ...countryData.map((c) => c.count));

  return (
    <div className="rounded-2xl border border-aegis-border bg-aegis-card p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-aegis-accent" />
          <h3 className="text-sm font-semibold text-white">
            Threat Origin Network
          </h3>
        </div>
        <span className="text-[10px] text-aegis-muted">
          {countryData.length} source regions · {threats.length} events
        </span>
      </div>

      {/* SVG Map */}
      <div className="relative overflow-hidden rounded-xl border border-aegis-border/30 bg-aegis-surface">
        <svg viewBox="0 0 900 400" className="w-full" style={{ minHeight: 200 }}>
          {/* Background grid */}
          <defs>
            <pattern
              id="threatGrid"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 30 0 L 0 0 0 30"
                fill="none"
                stroke="rgba(99,102,241,0.06)"
                strokeWidth="0.5"
              />
            </pattern>
            <radialGradient id="hqGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="900" height="400" fill="url(#threatGrid)" />

          {/* Connection lines from threat origins to HQ */}
          {countryData.map((country) => {
            const coords = COUNTRY_COORDS[country.code];
            if (!coords) return null;
            const intensity = country.count / maxCount;
            const strokeColor =
              country.critical > 0
                ? `rgba(239, 68, 68, ${0.3 + intensity * 0.5})`
                : `rgba(99, 102, 241, ${0.2 + intensity * 0.4})`;

            return (
              <motion.line
                key={`line-${country.code}`}
                x1={coords.x}
                y1={coords.y}
                x2={HQ.x}
                y2={HQ.y}
                stroke={strokeColor}
                strokeWidth={1 + intensity * 2}
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.2 }}
              />
            );
          })}

          {/* HQ indicator */}
          <circle cx={HQ.x} cy={HQ.y} r="30" fill="url(#hqGlow)" />
          <motion.circle
            cx={HQ.x}
            cy={HQ.y}
            r="8"
            fill="#6366F1"
            animate={{ r: [8, 12, 8] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <circle cx={HQ.x} cy={HQ.y} r="4" fill="white" />

          {/* Threat origin nodes */}
          {countryData.map((country) => {
            const coords = COUNTRY_COORDS[country.code];
            if (!coords) return null;
            const intensity = country.count / maxCount;
            const nodeColor =
              country.critical > 0 ? "#EF4444" : country.active > 0 ? "#F59E0B" : "#6366F1";
            const radius = 4 + intensity * 8;

            return (
              <g key={`node-${country.code}`}>
                {/* Pulse ring for active threats */}
                {country.active > 0 && (
                  <motion.circle
                    cx={coords.x}
                    cy={coords.y}
                    r={radius}
                    fill="none"
                    stroke={nodeColor}
                    strokeWidth="1"
                    animate={{
                      r: [radius, radius + 10, radius],
                      opacity: [0.6, 0, 0.6],
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
                {/* Node */}
                <motion.circle
                  cx={coords.x}
                  cy={coords.y}
                  r={radius}
                  fill={nodeColor}
                  opacity={0.6 + intensity * 0.4}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                />
                {/* Count label */}
                <text
                  x={coords.x}
                  y={coords.y - radius - 4}
                  textAnchor="middle"
                  fill="white"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {country.count}
                </text>
                {/* Country code */}
                <text
                  x={coords.x}
                  y={coords.y + radius + 10}
                  textAnchor="middle"
                  fill="rgba(148,163,184,0.8)"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {coords.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Country table */}
      <div className="mt-3 space-y-1.5">
        {countryData.slice(0, 5).map((country) => {
          const coords = COUNTRY_COORDS[country.code];
          const pct = Math.round((country.count / threats.length) * 100);
          return (
            <div
              key={country.code}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs hover:bg-white/[0.03]"
            >
              <MapPin className="h-3 w-3 text-aegis-muted" />
              <span className="w-24 font-medium text-aegis-text">
                {coords?.name ?? country.code}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor:
                      country.critical > 0
                        ? "#EF4444"
                        : "#6366F1",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              <span className="w-12 text-right tabular-nums text-aegis-muted">
                {country.count}
              </span>
              {country.critical > 0 && (
                <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[9px] font-bold text-red-400">
                  {country.critical} CRIT
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
