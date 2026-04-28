/**
 * AEGIS — Explainability Panel (Advanced)
 *
 * Provides three layers of XAI visualization:
 *   1. 64-bit pHash comparison grid (bit-by-bit with flip highlighting)
 *   2. Embedding vector bar chart (grouped by feature family)
 *   3. Similarity reasoning chain with weighted contributions
 */

import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, ChevronDown, Eye, Fingerprint, Lightbulb } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import type { EmbeddingVector } from "@/lib/embeddingSimilarity";
import type { PHashComparison } from "@/lib/perceptualHash";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ExplainabilityPanelProps {
  /** pHash comparison data (optional — panel gracefully degrades) */
  pHashComparison?: PHashComparison;
  /** Embedding vectors for both images (optional) */
  embeddingA?: EmbeddingVector;
  embeddingB?: EmbeddingVector;
  /** Embedding cosine similarity (0–1) */
  cosineSimilarity?: number;
  /** Overall reasoning text */
  reasoning?: string;
}

/* ------------------------------------------------------------------ */
/*  Sub-Components                                                     */
/* ------------------------------------------------------------------ */

/** 8×8 grid showing the 64-bit pHash with highlighted bit flips */
function PHashGrid({
  comparison,
}: {
  comparison: PHashComparison;
}) {
  const bitsA = comparison.hashA.split("");
  const bitsB = comparison.hashB.split("");

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-xs text-aegis-muted">
        <Fingerprint className="h-3.5 w-3.5 text-aegis-primary" />
        <span className="font-medium text-aegis-text">
          pHash Bit Comparison
        </span>
        <span className="ml-auto tabular-nums">
          Hamming Distance: {comparison.hammingDistance}/64
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Hash A grid */}
        <div>
          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-aegis-muted">
            Original
          </div>
          <div className="grid grid-cols-8 gap-0.5">
            {bitsA.map((bit, i) => (
              <motion.div
                key={`a-${i}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.008, duration: 0.15 }}
                className={cn(
                  "flex h-6 w-full items-center justify-center rounded text-[9px] font-mono font-bold",
                  comparison.diffMask[i]
                    ? "bg-red-500/30 text-red-300 ring-1 ring-red-500/50"
                    : bit === "1"
                      ? "bg-aegis-primary/20 text-aegis-primary"
                      : "bg-white/5 text-aegis-muted/50",
                )}
              >
                {bit}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Hash B grid */}
        <div>
          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-aegis-muted">
            Compared
          </div>
          <div className="grid grid-cols-8 gap-0.5">
            {bitsB.map((bit, i) => (
              <motion.div
                key={`b-${i}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.008, duration: 0.15 }}
                className={cn(
                  "flex h-6 w-full items-center justify-center rounded text-[9px] font-mono font-bold",
                  comparison.diffMask[i]
                    ? "bg-red-500/30 text-red-300 ring-1 ring-red-500/50"
                    : bit === "1"
                      ? "bg-aegis-primary/20 text-aegis-primary"
                      : "bg-white/5 text-aegis-muted/50",
                )}
              >
                {bit}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-4 text-[10px] text-aegis-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded bg-aegis-primary/30" />
          Bit = 1
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded bg-white/5" />
          Bit = 0
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded bg-red-500/30 ring-1 ring-red-500/50" />
          Bit Flip
        </span>
      </div>

      <p className="mt-2 text-[10px] text-aegis-muted leading-relaxed">
        {comparison.hammingDistance <= 5
          ? `Only ${comparison.hammingDistance} bit(s) differ — these hashes are nearly identical, indicating a very close structural match despite potential compression or resizing.`
          : comparison.hammingDistance <= 15
            ? `${comparison.hammingDistance} bits differ — moderate structural divergence detected. This is consistent with geometric transformations or partial content modifications.`
            : `${comparison.hammingDistance} bits differ — significant structural change. The images share little perceptual structure at the DCT frequency level.`}
      </p>
    </div>
  );
}

/** Horizontal bar chart of embedding vector dimensions grouped by feature */
function EmbeddingVisualization({
  embeddingA,
  embeddingB,
}: {
  embeddingA: EmbeddingVector;
  embeddingB?: EmbeddingVector;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-xs text-aegis-muted">
        <BrainCircuit className="h-3.5 w-3.5 text-amber-400" />
        <span className="font-medium text-aegis-text">
          Embedding Vector Analysis
        </span>
        <span className="ml-auto text-[10px]">{embeddingA.values.length} dimensions</span>
      </div>

      <div className="space-y-3">
        {embeddingA.groups.map((group) => {
          const valuesA = embeddingA.values.slice(
            group.startIndex,
            group.startIndex + group.length,
          );
          const valuesB = embeddingB
            ? embeddingB.values.slice(
                group.startIndex,
                group.startIndex + group.length,
              )
            : undefined;

          return (
            <div key={group.name}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] font-medium" style={{ color: group.color }}>
                  {group.name}
                </span>
                <span className="text-[9px] text-aegis-muted">
                  dims [{group.startIndex}–{group.startIndex + group.length - 1}]
                </span>
              </div>
              <div className="flex items-end gap-px" style={{ height: 32 }}>
                {valuesA.map((val, i) => (
                  <div key={i} className="relative flex-1">
                    <motion.div
                      className="w-full rounded-t-sm"
                      style={{
                        backgroundColor: group.color,
                        opacity: 0.7,
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(2, val * 32)}px` }}
                      transition={{ delay: i * 0.02, duration: 0.3 }}
                    />
                    {valuesB && (
                      <motion.div
                        className="absolute bottom-0 w-full rounded-t-sm border border-white/20"
                        style={{
                          backgroundColor: "transparent",
                          borderColor: `${group.color}88`,
                        }}
                        initial={{ height: 0 }}
                        animate={{
                          height: `${Math.max(2, valuesB[i] * 32)}px`,
                        }}
                        transition={{ delay: i * 0.02 + 0.1, duration: 0.3 }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {embeddingB && (
        <div className="mt-2 flex items-center gap-3 text-[10px] text-aegis-muted">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 rounded-sm bg-aegis-primary/70" />
            Original
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 rounded-sm border border-aegis-primary/50" />
            Compared
          </span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function ExplainabilityPanel({
  pHashComparison,
  embeddingA,
  embeddingB,
  cosineSimilarity,
  reasoning,
}: ExplainabilityPanelProps) {
  const [activeTab, setActiveTab] = useState<"phash" | "embedding" | "reasoning">(
    pHashComparison ? "phash" : embeddingA ? "embedding" : "reasoning",
  );
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs = [
    ...(pHashComparison
      ? [{ id: "phash" as const, label: "pHash Grid", icon: Fingerprint }]
      : []),
    ...(embeddingA
      ? [{ id: "embedding" as const, label: "Embeddings", icon: BrainCircuit }]
      : []),
    { id: "reasoning" as const, label: "Reasoning", icon: Lightbulb },
  ];

  return (
    <div className="rounded-2xl border border-aegis-border bg-aegis-card">
      {/* Title bar */}
      <button
        type="button"
        onClick={() => setIsCollapsed((v) => !v)}
        className="flex w-full items-center justify-between rounded-t-2xl px-5 py-4 text-left transition hover:bg-aegis-surface/50"
      >
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-aegis-accent" />
          <h3 className="text-sm font-semibold text-white">
            AI Decision Explainability
          </h3>
          {cosineSimilarity !== undefined && (
            <span className="ml-2 rounded-full bg-aegis-accent/10 px-2 py-0.5 text-[10px] font-semibold text-aegis-accent">
              cos={cosineSimilarity.toFixed(4)}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-aegis-muted transition-transform",
            isCollapsed && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex gap-1 border-t border-aegis-border px-5 pt-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition",
                    activeTab === tab.id
                      ? "bg-aegis-primary/15 text-aegis-primary"
                      : "text-aegis-muted hover:bg-white/5 hover:text-white",
                  )}
                >
                  <tab.icon className="h-3 w-3" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-5">
              {activeTab === "phash" && pHashComparison && (
                <PHashGrid comparison={pHashComparison} />
              )}

              {activeTab === "embedding" && embeddingA && (
                <EmbeddingVisualization
                  embeddingA={embeddingA}
                  embeddingB={embeddingB}
                />
              )}

              {activeTab === "reasoning" && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs text-aegis-muted">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                    <span className="font-medium text-aegis-text">
                      Decision Reasoning Chain
                    </span>
                  </div>
                  <div className="rounded-xl border border-aegis-border/50 bg-aegis-surface/50 p-4">
                    <p className="text-xs leading-relaxed text-aegis-text/80">
                      {reasoning ??
                        "No reasoning data available for the current analysis context. Run a scan or comparison to generate explainability insights."}
                    </p>
                  </div>
                  {pHashComparison && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-aegis-border/30 bg-white/[0.02] p-3">
                        <div className="text-[10px] font-medium uppercase tracking-wider text-aegis-muted">
                          pHash Similarity
                        </div>
                        <div className="mt-1 text-lg font-bold text-aegis-primary tabular-nums">
                          {pHashComparison.similarity.toFixed(1)}%
                        </div>
                      </div>
                      <div className="rounded-lg border border-aegis-border/30 bg-white/[0.02] p-3">
                        <div className="text-[10px] font-medium uppercase tracking-wider text-aegis-muted">
                          Embedding Similarity
                        </div>
                        <div className="mt-1 text-lg font-bold text-aegis-accent tabular-nums">
                          {cosineSimilarity !== undefined
                            ? `${(cosineSimilarity * 100).toFixed(1)}%`
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
