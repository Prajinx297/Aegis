/**
 * AEGIS — Intelligence Center Page
 *
 * Unified dashboard composing all v2 Intelligence & Resilience features:
 *   1. Live Integrity Monitor
 *   2. Trust & Risk Scoring (for top assets)
 *   3. Quick link to Attack Simulator
 *   4. System-wide explainability summary
 *
 * This page reads from the existing SimulationContext and displays
 * the new components without modifying any existing files.
 */

import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  ChevronRight,
  Fingerprint,
  Shield,
  Target,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IntegrityMonitor } from "@/components/IntegrityMonitor";
import { TrustScoreCard } from "@/components/TrustScoreCard";
import { ExplainabilityPanel } from "@/components/ExplainabilityPanel";
import { cn } from "@/lib/cn";
import { computeTrustScore, type TrustScoreResult } from "@/lib/trustScore";
import { comparePHash, type PHashComparison } from "@/lib/perceptualHash";
import { useSimulation } from "@/hooks/useSimulation";

export function IntelligencePage() {
  const { assets, threats, dmcaCases } = useSimulation();
  const [selectedAssetIdx, setSelectedAssetIdx] = useState(0);

  // Compute trust scores for the first 6 assets
  const assetScores = useMemo(() => {
    return assets.slice(0, 6).map((asset) => ({
      asset,
      score: computeTrustScore(asset, threats, dmcaCases, {
        matchCount: Math.floor(Math.random() * 4),
      }),
    }));
  }, [assets, threats, dmcaCases]);

  const selectedAsset = assetScores[selectedAssetIdx];

  // Generate a demo pHash comparison using the asset's own phash
  const demoPHashComparison: PHashComparison | undefined = useMemo(() => {
    if (!selectedAsset) return undefined;
    const hash = selectedAsset.asset.phash;
    // Pad to 64 bits if needed (hex → binary)
    let binaryA = "";
    for (const c of hash) {
      binaryA += parseInt(c, 16).toString(2).padStart(4, "0");
    }
    // Create a "similar" hash by flipping a few random bits
    const binaryBArr = binaryA.split("");
    const flipCount = Math.floor(Math.random() * 8) + 2;
    const flipped = new Set<number>();
    while (flipped.size < flipCount) {
      flipped.add(Math.floor(Math.random() * 64));
    }
    for (const idx of flipped) {
      binaryBArr[idx] = binaryBArr[idx] === "1" ? "0" : "1";
    }
    const binaryB = binaryBArr.join("");
    return comparePHash(binaryA, binaryB);
  }, [selectedAsset]);

  // Stats summary
  const stats = useMemo(() => {
    const trusted = assetScores.filter((a) => a.score.label === "TRUSTED").length;
    const risky = assetScores.filter((a) => a.score.label === "RISKY").length;
    const compromised = assetScores.filter(
      (a) => a.score.label === "COMPROMISED",
    ).length;
    const avgScore = Math.round(
      assetScores.reduce((sum, a) => sum + a.score.score, 0) /
        (assetScores.length || 1),
    );
    return { trusted, risky, compromised, avgScore };
  }, [assetScores]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-aegis-primary/10 p-2.5">
            <BrainCircuit className="h-5 w-5 text-aegis-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              Intelligence Center
            </h1>
            <p className="text-xs text-aegis-muted">
              Trust scoring, integrity monitoring, and AI explainability
            </p>
          </div>
        </div>

        <Link
          to="/attack-simulator"
          className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/20"
        >
          <Zap className="h-4 w-4" />
          Adversarial Attack Simulator
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Top row: Integrity monitor + Stats */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IntegrityMonitor threats={threats} pollInterval={12000} variant="card" />
        </div>

        <div className="rounded-2xl border border-aegis-border bg-aegis-card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <Target className="h-4 w-4 text-aegis-accent" />
            Trust Overview
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatBlock label="Avg Score" value={`${stats.avgScore}`} color="text-aegis-primary" />
            <StatBlock label="Trusted" value={`${stats.trusted}`} color="text-emerald-400" />
            <StatBlock label="Risky" value={`${stats.risky}`} color="text-amber-400" />
            <StatBlock label="Compromised" value={`${stats.compromised}`} color="text-red-400" />
          </div>
        </div>
      </div>

      {/* Asset selector + Trust score detail */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Asset list */}
        <div className="rounded-2xl border border-aegis-border bg-aegis-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Shield className="h-4 w-4 text-aegis-primary" />
            Asset Trust Scores
          </h3>
          <div className="space-y-1.5">
            {assetScores.map((item, idx) => (
              <button
                key={item.asset.id}
                type="button"
                onClick={() => setSelectedAssetIdx(idx)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition",
                  idx === selectedAssetIdx
                    ? "bg-aegis-primary/10 text-white ring-1 ring-aegis-primary/30"
                    : "text-aegis-text/70 hover:bg-white/5",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{item.asset.name}</div>
                  <div className="text-[10px] text-aegis-muted">
                    {item.asset.type} · {item.asset.status}
                  </div>
                </div>
                <div className="ml-2 flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      item.score.label === "TRUSTED"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : item.score.label === "RISKY"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-red-500/15 text-red-400",
                    )}
                  >
                    {item.score.score}
                  </span>
                  <ChevronRight className="h-3 w-3 text-aegis-muted" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Trust score detail card */}
        <div>
          {selectedAsset && (
            <TrustScoreCard
              result={selectedAsset.score}
              assetName={selectedAsset.asset.name}
            />
          )}
        </div>

        {/* Explainability preview */}
        <div>
          {demoPHashComparison && (
            <ExplainabilityPanel
              pHashComparison={demoPHashComparison}
              reasoning={
                selectedAsset
                  ? `Trust analysis for "${selectedAsset.asset.name}": The asset's blockchain anchoring status is "${selectedAsset.asset.status}" with chain hash ${selectedAsset.asset.chainHash.slice(0, 18)}…. ${selectedAsset.score.reasoning.join(" ")}`
                  : undefined
              }
              cosineSimilarity={
                selectedAsset
                  ? selectedAsset.score.score / 100
                  : undefined
              }
            />
          )}
        </div>
      </div>

      {/* Inline integrity monitor */}
      <IntegrityMonitor threats={threats} pollInterval={15000} variant="inline" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatBlock({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-aegis-border/30 bg-white/[0.02] p-3 text-center">
      <div className={cn("text-xl font-bold tabular-nums", color)}>{value}</div>
      <div className="text-[10px] text-aegis-muted">{label}</div>
    </div>
  );
}
