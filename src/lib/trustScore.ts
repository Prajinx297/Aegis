/**
 * AEGIS — Trust & Risk Scoring Engine
 *
 * Computes a composite trust score for any registered digital asset by
 * combining multiple independent security signals with configurable weights.
 *
 * Signal sources:
 *   1. Blockchain Verification (is the asset chain-anchored?)
 *   2. Similarity Match Risk (how many near-duplicate matches exist?)
 *   3. Deepfake Exposure (has the asset been targeted by generators?)
 *   4. Active Threat Severity (weighted count of current threats)
 *   5. DMCA Case Load (pending/escalated cases reduce trust)
 *
 * Output:
 *   - Score: 0–100  (higher = more trusted)
 *   - Label: "TRUSTED" | "RISKY" | "COMPROMISED"
 *   - Reasoning: human-readable explanation array
 *   - Breakdown: weighted per-signal contributions
 */

import type {
  AssetRecord,
  DmcaCase,
  ThreatEntry,
  ThreatSeverity,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type TrustLabel = "TRUSTED" | "RISKY" | "COMPROMISED";

export interface TrustSignal {
  /** Signal identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Raw score for this signal (0–100, higher = better) */
  rawScore: number;
  /** Weight multiplier (0–1) */
  weight: number;
  /** Weighted contribution to the composite score */
  weightedScore: number;
  /** Explanation of how this signal was computed */
  reasoning: string;
  /** Visual accent color */
  color: string;
}

export interface TrustScoreResult {
  /** Composite trust score (0–100) */
  score: number;
  /** Overall risk label */
  label: TrustLabel;
  /** Array of human-readable reasoning strings */
  reasoning: string[];
  /** Detailed per-signal breakdown */
  breakdown: TrustSignal[];
  /** Timestamp of computation */
  computedAt: string;
}

export interface TrustScoreConfig {
  weights: {
    blockchain: number;
    similarity: number;
    deepfake: number;
    threatSeverity: number;
    dmcaCaseLoad: number;
  };
}

/* ------------------------------------------------------------------ */
/*  Default weights                                                    */
/* ------------------------------------------------------------------ */

export const DEFAULT_TRUST_CONFIG: TrustScoreConfig = {
  weights: {
    blockchain: 0.20,
    similarity: 0.25,
    deepfake: 0.20,
    threatSeverity: 0.20,
    dmcaCaseLoad: 0.15,
  },
};

/* ------------------------------------------------------------------ */
/*  Signal Computations                                                */
/* ------------------------------------------------------------------ */

const SEVERITY_WEIGHTS: Record<ThreatSeverity, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

function computeBlockchainSignal(asset: AssetRecord): number {
  // Anchored = full trust, Protected = partial, Monitoring = lower
  if (asset.status === "Anchored" && asset.chainHash.startsWith("0x")) {
    return 100;
  }
  if (asset.status === "Protected") {
    return 75;
  }
  return 40;
}

function computeSimilaritySignal(
  _asset: AssetRecord,
  matchCount: number,
): number {
  // More matches = higher risk = lower trust
  if (matchCount === 0) return 100;
  if (matchCount <= 1) return 80;
  if (matchCount <= 3) return 55;
  if (matchCount <= 5) return 30;
  return 10;
}

function computeDeepfakeSignal(
  _asset: AssetRecord,
  threats: ThreatEntry[],
): number {
  const deepfakeThreats = threats.filter(
    (t) => t.type === "Deepfake Generator",
  );
  if (deepfakeThreats.length === 0) return 100;

  const hasCritical = deepfakeThreats.some((t) => t.severity === "CRITICAL");
  if (hasCritical) return 15;

  const hasHigh = deepfakeThreats.some((t) => t.severity === "HIGH");
  if (hasHigh) return 35;

  return 60;
}

function computeThreatSeveritySignal(threats: ThreatEntry[]): number {
  if (threats.length === 0) return 100;

  const totalWeight = threats.reduce(
    (sum, t) => sum + SEVERITY_WEIGHTS[t.severity],
    0,
  );
  const maxPossible = threats.length * 4;
  const severityRatio = totalWeight / maxPossible;

  // Active/Investigating threats count more
  const activeCount = threats.filter(
    (t) => t.status === "ACTIVE" || t.status === "INVESTIGATING",
  ).length;
  const activePenalty = Math.min(activeCount * 8, 40);

  return Math.max(0, Math.round(100 - severityRatio * 50 - activePenalty));
}

function computeDmcaSignal(cases: DmcaCase[]): number {
  if (cases.length === 0) return 100;

  const pendingOrEscalated = cases.filter(
    (c) => c.status === "Pending" || c.status === "Escalated",
  ).length;
  const resolved = cases.filter(
    (c) => c.status === "Content Removed",
  ).length;

  // Resolved cases are good, pending/escalated reduce trust
  const score = 100 - pendingOrEscalated * 20 + resolved * 5;
  return Math.max(0, Math.min(100, score));
}

function labelFromScore(score: number): TrustLabel {
  if (score >= 70) return "TRUSTED";
  if (score >= 40) return "RISKY";
  return "COMPROMISED";
}

/* ------------------------------------------------------------------ */
/*  Main Engine                                                        */
/* ------------------------------------------------------------------ */

export function computeTrustScore(
  asset: AssetRecord,
  threats: ThreatEntry[],
  dmcaCases: DmcaCase[],
  options: {
    matchCount?: number;
    config?: TrustScoreConfig;
  } = {},
): TrustScoreResult {
  const config = options.config ?? DEFAULT_TRUST_CONFIG;
  const matchCount = options.matchCount ?? 0;

  // Filter threats and DMCA cases relevant to this asset
  const assetThreats = threats.filter(
    (t) => t.targetAsset === asset.name,
  );
  const assetDmca = dmcaCases.filter(
    (c) => c.assetId === asset.id || c.assetName === asset.name,
  );

  // Compute individual signals
  const blockchainRaw = computeBlockchainSignal(asset);
  const similarityRaw = computeSimilaritySignal(asset, matchCount);
  const deepfakeRaw = computeDeepfakeSignal(asset, assetThreats);
  const threatRaw = computeThreatSeveritySignal(assetThreats);
  const dmcaRaw = computeDmcaSignal(assetDmca);

  const signals: TrustSignal[] = [
    {
      id: "blockchain",
      name: "Blockchain Verification",
      rawScore: blockchainRaw,
      weight: config.weights.blockchain,
      weightedScore: Math.round(blockchainRaw * config.weights.blockchain),
      reasoning:
        blockchainRaw === 100
          ? `Asset is anchored on-chain with hash ${asset.chainHash.slice(0, 12)}…`
          : blockchainRaw >= 75
            ? "Asset is registered but not fully anchored on-chain."
            : "Asset is only under monitoring — no blockchain verification.",
      color: "#6366F1",
    },
    {
      id: "similarity",
      name: "Similarity Match Risk",
      rawScore: similarityRaw,
      weight: config.weights.similarity,
      weightedScore: Math.round(similarityRaw * config.weights.similarity),
      reasoning:
        matchCount === 0
          ? "No duplicate or derivative matches detected across scanned domains."
          : `${matchCount} potential match(es) found — elevated infringement risk.`,
      color: "#22D3EE",
    },
    {
      id: "deepfake",
      name: "Deepfake Exposure",
      rawScore: deepfakeRaw,
      weight: config.weights.deepfake,
      weightedScore: Math.round(deepfakeRaw * config.weights.deepfake),
      reasoning:
        deepfakeRaw === 100
          ? "No deepfake or synthetic manipulation attempts detected."
          : deepfakeRaw < 40
            ? "Critical deepfake generation activity targeting this asset."
            : "Some synthetic manipulation attempts have been observed.",
      color: "#F59E0B",
    },
    {
      id: "threat",
      name: "Active Threat Severity",
      rawScore: threatRaw,
      weight: config.weights.threatSeverity,
      weightedScore: Math.round(threatRaw * config.weights.threatSeverity),
      reasoning:
        assetThreats.length === 0
          ? "No active threats against this asset."
          : `${assetThreats.length} threat(s) detected — ${assetThreats.filter((t) => t.status === "ACTIVE").length} currently active.`,
      color: "#EF4444",
    },
    {
      id: "dmca",
      name: "DMCA Case Load",
      rawScore: dmcaRaw,
      weight: config.weights.dmcaCaseLoad,
      weightedScore: Math.round(dmcaRaw * config.weights.dmcaCaseLoad),
      reasoning:
        assetDmca.length === 0
          ? "No DMCA enforcement cases associated with this asset."
          : `${assetDmca.length} case(s) — ${assetDmca.filter((c) => c.status === "Content Removed").length} resolved.`,
      color: "#10B981",
    },
  ];

  const compositeScore = signals.reduce((sum, s) => sum + s.weightedScore, 0);
  const label = labelFromScore(compositeScore);

  const reasoning = signals
    .filter((s) => s.rawScore < 80)
    .map((s) => `[${s.name}] ${s.reasoning}`);

  if (reasoning.length === 0) {
    reasoning.push(
      "All security signals are within acceptable parameters. Asset integrity is strong.",
    );
  }

  return {
    score: Math.max(0, Math.min(100, compositeScore)),
    label,
    reasoning,
    breakdown: signals,
    computedAt: new Date().toISOString(),
  };
}

/** Batch compute trust scores for all assets. */
export function computeAllTrustScores(
  assets: AssetRecord[],
  threats: ThreatEntry[],
  dmcaCases: DmcaCase[],
  config?: TrustScoreConfig,
): Map<string, TrustScoreResult> {
  const results = new Map<string, TrustScoreResult>();
  for (const asset of assets) {
    results.set(
      asset.id,
      computeTrustScore(asset, threats, dmcaCases, { config }),
    );
  }
  return results;
}
