/**
 * AEGIS — Adversarial Attack Simulator Page
 *
 * Full interactive page where users can:
 *   1. Upload or generate a test image
 *   2. Apply real adversarial transformations (noise, blur, crop, downscale, rotation)
 *   3. See the REAL pHash recomputed before and after
 *   4. View the embedding similarity drop
 *   5. Observe detection resilience metrics
 *   6. Inspect the XAI explainability panel
 *
 * All computation happens in-browser — zero server calls.
 */

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Download,
  ImagePlus,
  Play,
  RotateCcw,
  Shield,
  Sliders,
  XCircle,
  Zap,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { ExplainabilityPanel } from "@/components/ExplainabilityPanel";
import { cn } from "@/lib/cn";
import {
  type EmbeddingVector,
  cosineSimilarity,
  compareEmbeddings,
  extractEmbedding,
} from "@/lib/embeddingSimilarity";
import {
  type AttackConfig,
  DEFAULT_ATTACK_CONFIG,
  applyBlur,
  applyCrop,
  applyDownscale,
  applyGaussianNoise,
  applyRotation,
  imageToCanvas,
  loadImageAsync,
} from "@/lib/imageAttacks";
import {
  type PHashComparison,
  type PHashResult,
  comparePHash,
  computePHash,
} from "@/lib/perceptualHash";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AnalysisResult {
  originalHash: PHashResult;
  attackedHash: PHashResult;
  comparison: PHashComparison;
  embeddingOriginal: EmbeddingVector;
  embeddingAttacked: EmbeddingVector;
  embeddingCosine: number;
  resilient: boolean;
}

/* ------------------------------------------------------------------ */
/*  Slider Component                                                   */
/* ------------------------------------------------------------------ */

function AttackSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-aegis-text/80">{label}</span>
        <span className="tabular-nums text-aegis-muted">
          {value}
          {unit ?? ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full accent-aegis-primary"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export function AttackSimulatorPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [originalSrc, setOriginalSrc] = useState<string | null>(null);
  const [attackedSrc, setAttackedSrc] = useState<string | null>(null);
  const [config, setConfig] = useState<AttackConfig>(DEFAULT_ATTACK_CONFIG);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [currentStep, setCurrentStep] = useState("");

  // Generate a procedural test image using canvas
  const generateTestImage = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, "#6366F1");
    grad.addColorStop(0.5, "#22D3EE");
    grad.addColorStop(1, "#10B981");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Geometric shapes
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath();
    ctx.arc(128, 100, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(60, 160, 136, 60);

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "bold 18px monospace";
    ctx.textAlign = "center";
    ctx.fillText("AEGIS TEST", 128, 198);

    // Small details for hash sensitivity
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `hsl(${i * 18}, 70%, 60%)`;
      ctx.fillRect(
        30 + i * 10,
        230,
        8,
        8,
      );
    }

    setOriginalSrc(canvas.toDataURL("image/png"));
    setAttackedSrc(null);
    setResult(null);
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        setOriginalSrc(ev.target?.result as string);
        setAttackedSrc(null);
        setResult(null);
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  // Run the attack pipeline
  const runAttack = useCallback(async () => {
    if (!originalSrc) return;
    setRunning(true);
    setResult(null);

    try {
      // Step 1: Load original image
      setCurrentStep("Loading image…");
      const img = await loadImageAsync(originalSrc);
      let canvas = imageToCanvas(img);

      // Step 2: Compute original hash
      setCurrentStep("Computing original pHash (32×32 → DCT → 64-bit)…");
      await sleep(300);
      const originalHash = await computePHash(originalSrc);

      // Step 3: Extract original embedding
      setCurrentStep("Extracting 56-dim feature embedding…");
      await sleep(200);
      const embeddingOriginal = extractEmbedding(canvas);

      // Step 4: Apply attacks
      if (config.noiseStdDev > 0) {
        setCurrentStep(`Injecting Gaussian noise (σ=${config.noiseStdDev})…`);
        await sleep(200);
        canvas = applyGaussianNoise(canvas, config.noiseStdDev);
      }

      if (config.blurRadius > 0) {
        setCurrentStep(`Applying blur (r=${config.blurRadius}px)…`);
        await sleep(200);
        canvas = applyBlur(canvas, config.blurRadius);
      }

      if (config.downscaleFactor < 1) {
        setCurrentStep(
          `Downscaling to ${Math.round(config.downscaleFactor * 100)}% and upscaling…`,
        );
        await sleep(200);
        canvas = applyDownscale(canvas, config.downscaleFactor);
      }

      if (config.cropRatio < 1) {
        setCurrentStep(
          `Center-cropping to ${Math.round(config.cropRatio * 100)}%…`,
        );
        await sleep(200);
        canvas = applyCrop(canvas, config.cropRatio);
      }

      if (config.rotationDeg > 0) {
        setCurrentStep(`Rotating ${config.rotationDeg}°…`);
        await sleep(200);
        canvas = applyRotation(canvas, config.rotationDeg);
      }

      // Step 5: Get attacked image
      const attackedDataUrl = canvas.toDataURL("image/png");
      setAttackedSrc(attackedDataUrl);

      // Step 6: Compute attacked hash
      setCurrentStep("Recomputing pHash on attacked image…");
      await sleep(300);
      const attackedHash = await computePHash(attackedDataUrl);

      // Step 7: Compare
      setCurrentStep("Comparing hashes and embeddings…");
      await sleep(200);
      const comparison = comparePHash(originalHash.hash, attackedHash.hash);
      const embeddingAttacked = extractEmbedding(canvas);
      const embeddingCosine = cosineSimilarity(
        embeddingOriginal.values,
        embeddingAttacked.values,
      );

      // Detection resilience: if similarity > 75% on either method, we still detect it
      const resilient =
        comparison.similarity > 75 || embeddingCosine > 0.75;

      setResult({
        originalHash,
        attackedHash,
        comparison,
        embeddingOriginal,
        embeddingAttacked,
        embeddingCosine,
        resilient,
      });
      setCurrentStep("");
    } catch (err) {
      console.error("Attack simulation failed:", err);
      setCurrentStep("Error during simulation");
    } finally {
      setRunning(false);
    }
  }, [originalSrc, config]);

  const reset = useCallback(() => {
    setOriginalSrc(null);
    setAttackedSrc(null);
    setResult(null);
    setCurrentStep("");
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-500/10 p-2.5">
            <Zap className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              Adversarial Robustness Test
            </h1>
            <p className="text-xs text-aegis-muted">
              Apply real image transformations and measure AEGIS detection
              resilience
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: controls */}
        <div className="space-y-4">
          {/* Image source */}
          <div className="rounded-2xl border border-aegis-border bg-aegis-card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <ImagePlus className="h-4 w-4 text-aegis-primary" />
              Test Image
            </h3>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={generateTestImage}
                className="flex-1 rounded-lg border border-aegis-border bg-aegis-primary/10 px-3 py-2 text-xs font-medium text-aegis-primary transition hover:bg-aegis-primary/20"
              >
                Generate Test Image
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 rounded-lg border border-aegis-border px-3 py-2 text-xs font-medium text-aegis-text transition hover:bg-white/5"
              >
                Upload Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Attack parameters */}
          <div className="rounded-2xl border border-aegis-border bg-aegis-card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <Sliders className="h-4 w-4 text-amber-400" />
              Attack Parameters
            </h3>

            <div className="space-y-4">
              <AttackSlider
                label="Gaussian Noise (σ)"
                value={config.noiseStdDev}
                min={0}
                max={100}
                step={5}
                onChange={(v) =>
                  setConfig((c) => ({ ...c, noiseStdDev: v }))
                }
                disabled={running}
              />
              <AttackSlider
                label="Blur Radius"
                value={config.blurRadius}
                min={0}
                max={20}
                step={1}
                unit="px"
                onChange={(v) =>
                  setConfig((c) => ({ ...c, blurRadius: v }))
                }
                disabled={running}
              />
              <AttackSlider
                label="Downscale Factor"
                value={config.downscaleFactor}
                min={0.1}
                max={1}
                step={0.05}
                onChange={(v) =>
                  setConfig((c) => ({ ...c, downscaleFactor: v }))
                }
                disabled={running}
              />
              <AttackSlider
                label="Crop Ratio"
                value={config.cropRatio}
                min={0.5}
                max={1}
                step={0.05}
                onChange={(v) =>
                  setConfig((c) => ({ ...c, cropRatio: v }))
                }
                disabled={running}
              />
              <AttackSlider
                label="Rotation"
                value={config.rotationDeg}
                min={0}
                max={45}
                step={1}
                unit="°"
                onChange={(v) =>
                  setConfig((c) => ({ ...c, rotationDeg: v }))
                }
                disabled={running}
              />
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={runAttack}
                disabled={!originalSrc || running}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition",
                  originalSrc && !running
                    ? "bg-aegis-primary text-white hover:bg-aegis-primary/90"
                    : "cursor-not-allowed bg-aegis-border/30 text-aegis-muted",
                )}
              >
                {running ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Zap className="h-4 w-4" />
                    </motion.div>
                    Running…
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Attack
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-aegis-border px-3 py-2 text-aegis-muted transition hover:bg-white/5 hover:text-white"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Pipeline status */}
          <AnimatePresence>
            {currentStep && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-xl border border-aegis-primary/30 bg-aegis-primary/5 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "linear",
                    }}
                  >
                    <Zap className="h-3.5 w-3.5 text-aegis-primary" />
                  </motion.div>
                  <span className="text-xs text-aegis-primary">
                    {currentStep}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Center column: image comparison */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Original */}
            <div className="rounded-2xl border border-aegis-border bg-aegis-card p-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-aegis-muted">
                Original
              </div>
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-aegis-surface">
                {originalSrc ? (
                  <img
                    src={originalSrc}
                    alt="Original"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-xs text-aegis-muted">
                    <ImagePlus className="mx-auto mb-1 h-8 w-8 opacity-30" />
                    No image loaded
                  </div>
                )}
              </div>
              {result && (
                <div className="mt-2 space-y-1">
                  <div className="text-[9px] text-aegis-muted">pHash</div>
                  <div className="font-mono text-[10px] text-aegis-primary break-all">
                    {result.originalHash.hex}
                  </div>
                </div>
              )}
            </div>

            {/* Attacked */}
            <div className="rounded-2xl border border-aegis-border bg-aegis-card p-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-aegis-muted">
                Attacked
              </div>
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-aegis-surface">
                {attackedSrc ? (
                  <img
                    src={attackedSrc}
                    alt="Attacked"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-xs text-aegis-muted">
                    <Zap className="mx-auto mb-1 h-8 w-8 opacity-30" />
                    Run attack first
                  </div>
                )}
              </div>
              {result && (
                <div className="mt-2 space-y-1">
                  <div className="text-[9px] text-aegis-muted">pHash</div>
                  <div className="font-mono text-[10px] text-amber-400 break-all">
                    {result.attackedHash.hex}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resilience verdict */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "rounded-2xl border p-5",
                  result.resilient
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-red-500/30 bg-red-500/5",
                )}
              >
                <div className="flex items-center gap-3">
                  {result.resilient ? (
                    <CheckCircle className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-400" />
                  )}
                  <div>
                    <div
                      className={cn(
                        "text-sm font-bold",
                        result.resilient
                          ? "text-emerald-400"
                          : "text-red-400",
                      )}
                    >
                      {result.resilient
                        ? "DETECTION RESILIENT"
                        : "DETECTION EVADED"}
                    </div>
                    <p className="text-xs text-aegis-muted">
                      {result.resilient
                        ? "AEGIS can still identify this asset despite adversarial manipulation."
                        : "The attack degraded similarity below detection thresholds. Additional fingerprinting methods recommended."}
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-aegis-border/30 bg-white/[0.02] p-3 text-center">
                    <div className="text-[10px] text-aegis-muted">
                      pHash Similarity
                    </div>
                    <div
                      className={cn(
                        "mt-1 text-xl font-bold tabular-nums",
                        result.comparison.similarity > 75
                          ? "text-emerald-400"
                          : result.comparison.similarity > 50
                            ? "text-amber-400"
                            : "text-red-400",
                      )}
                    >
                      {result.comparison.similarity.toFixed(1)}%
                    </div>
                  </div>
                  <div className="rounded-lg border border-aegis-border/30 bg-white/[0.02] p-3 text-center">
                    <div className="text-[10px] text-aegis-muted">
                      Embedding Cosine
                    </div>
                    <div
                      className={cn(
                        "mt-1 text-xl font-bold tabular-nums",
                        result.embeddingCosine > 0.75
                          ? "text-emerald-400"
                          : result.embeddingCosine > 0.5
                            ? "text-amber-400"
                            : "text-red-400",
                      )}
                    >
                      {(result.embeddingCosine * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="rounded-lg border border-aegis-border/30 bg-white/[0.02] p-3 text-center">
                    <div className="text-[10px] text-aegis-muted">
                      Hamming Dist.
                    </div>
                    <div className="mt-1 text-xl font-bold tabular-nums text-aegis-accent">
                      {result.comparison.hammingDistance}/64
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right column: XAI explainability */}
        <div className="space-y-4">
          {result ? (
            <ExplainabilityPanel
              pHashComparison={result.comparison}
              embeddingA={result.embeddingOriginal}
              embeddingB={result.embeddingAttacked}
              cosineSimilarity={result.embeddingCosine}
              reasoning={
                compareEmbeddings(
                  result.embeddingOriginal,
                  result.embeddingAttacked,
                  result.comparison.similarity,
                ).interpretation
              }
            />
          ) : (
            <div className="rounded-2xl border border-aegis-border bg-aegis-card p-8 text-center">
              <Shield className="mx-auto h-10 w-10 text-aegis-muted/30" />
              <p className="mt-3 text-sm text-aegis-muted">
                Run an attack to see the explainability analysis
              </p>
              <p className="mt-1 text-[10px] text-aegis-muted/60">
                The panel will show pHash bit comparison, embedding vector
                visualization, and decision reasoning
              </p>
            </div>
          )}

          {/* Applied attacks summary */}
          {result && (
            <div className="rounded-2xl border border-aegis-border bg-aegis-card p-4">
              <h4 className="mb-2 text-xs font-semibold text-aegis-muted">
                Applied Transformations
              </h4>
              <div className="space-y-1.5">
                {config.noiseStdDev > 0 && (
                  <AttackTag label={`Gaussian Noise σ=${config.noiseStdDev}`} />
                )}
                {config.blurRadius > 0 && (
                  <AttackTag label={`Blur r=${config.blurRadius}px`} />
                )}
                {config.downscaleFactor < 1 && (
                  <AttackTag
                    label={`Downscale ${Math.round(config.downscaleFactor * 100)}%`}
                  />
                )}
                {config.cropRatio < 1 && (
                  <AttackTag
                    label={`Crop ${Math.round(config.cropRatio * 100)}%`}
                  />
                )}
                {config.rotationDeg > 0 && (
                  <AttackTag label={`Rotate ${config.rotationDeg}°`} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function AttackTag({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-xs text-amber-300">
      <AlertTriangle className="h-3 w-3" />
      {label}
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
