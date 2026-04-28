import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bar, BarChart, Cell, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "@/components/ChartCard";
import { ScanPipeline } from "@/components/ScanPipeline";
import { deepfakePipeline, deepfakeSamples } from "@/features/deepfake/demoSamples";

export function DeepfakePage() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [complete, setComplete] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState("gan");
  const [epsilon, setEpsilon] = useState(0.2);

  const selectedSample = useMemo(
    () => deepfakeSamples.find((sample) => sample.id === selectedSampleId) ?? deepfakeSamples[1],
    [selectedSampleId],
  );

  const runPipeline = (sampleId = selectedSampleId) => {
    setSelectedSampleId(sampleId);
    setComplete(false);
    let elapsed = 0;
    deepfakePipeline.forEach((step, index) => {
      window.setTimeout(() => setCurrentStep(index), elapsed);
      elapsed += step.duration;
    });
    window.setTimeout(() => {
      setCurrentStep(deepfakePipeline.length);
      setComplete(true);
    }, elapsed + 120);
  };

  useEffect(() => {
    runPipeline("gan");
  }, []);

  const authenticity = [{ name: "synthetic", value: selectedSample.confidence }];
  const featureData = [
    { label: "Facial Inconsistency", value: selectedSample.features[0] },
    { label: "Frequency Artifacts", value: selectedSample.features[1] },
    { label: "Temporal Flickering", value: selectedSample.features[2] },
    { label: "Blending Boundary", value: selectedSample.features[3] },
    { label: "GAN Fingerprint Match", value: selectedSample.features[4] },
  ];

  const adversarialConfidence = Math.round(98 - epsilon * 62);
  const adversarialLabel = epsilon > 0.55 ? "Ostrich" : epsilon > 0.28 ? "Tabby Cat" : "Cat";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-aegis-border bg-aegis-card p-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Deepfake & Adversarial AI Detection</h2>
          <span className="rounded-full bg-aegis-warn/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-aegis-warn">Beta</span>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => runPipeline()}
              className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-aegis-primary/30 bg-aegis-primary/5 px-6 py-12 text-center transition hover:border-aegis-primary hover:shadow-glow"
            >
              <div className="text-lg font-semibold text-slate-900 dark:text-white">Upload image or video</div>
              <div className="mt-2 text-sm text-aegis-muted">Run full synthetic media analysis pipeline</div>
            </button>

            <ChartCard title="Detection Pipeline" subtitle="Six technical phases, each executed in order">
              <ScanPipeline steps={deepfakePipeline} currentStep={Math.max(currentStep, 0)} completed={complete} />
            </ChartCard>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-6 xl:grid-cols-2">
              <ChartCard title="Authenticity Score" subtitle="Synthetic confidence estimate">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart data={authenticity} innerRadius="55%" outerRadius="85%" startAngle={90} endAngle={-270}>
                      <RadialBar background dataKey="value" cornerRadius={18} fill={selectedSample.confidence > 50 ? "#ef4444" : "#10B981"} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="-mt-28 text-center">
                  <div className="text-3xl font-bold text-white">{selectedSample.confidence}%</div>
                  <div className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${selectedSample.confidence > 50 ? "bg-aegis-danger/15 text-aegis-danger" : "bg-aegis-success/15 text-aegis-success"}`}>
                    {selectedSample.verdict === "AUTHENTIC" ? "✅ AUTHENTIC" : "⚠️ LIKELY AI-GENERATED"}
                  </div>
                  <div className="mt-3 text-sm text-aegis-muted">Detected Generator: {selectedSample.generator}</div>
                </div>
              </ChartCard>

              <ChartCard title="Feature Analysis" subtitle="Signals that triggered the decision">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={featureData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="label" type="category" width={130} stroke="#64748B" tick={{ fontSize: 11 }} />
                      <RechartsTooltip contentStyle={{ backgroundColor: "#111118", border: "1px solid #2A2A3A", borderRadius: 16 }} />
                      <Bar dataKey="value" radius={[0, 12, 12, 0]}>
                        {featureData.map((entry, index) => (
                          <Cell key={entry.label} fill={["#ef4444", "#f97316", "#f59e0b", "#fb7185", "#6366f1"][index]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            <ChartCard title="Explanation Heatmap" subtitle="Warm regions correspond to suspicious areas">
              <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
                <div className="relative h-72 overflow-hidden rounded-3xl border border-aegis-border bg-gradient-to-br from-slate-200 to-slate-500 dark:from-slate-700 dark:to-slate-900">
                  <div className="absolute left-1/2 top-8 h-24 w-24 -translate-x-1/2 rounded-full bg-white/40" />
                  <div className="absolute left-[39%] top-[42%] h-40 w-28 rounded-[40%] bg-white/30" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(239,68,68,0.58),transparent_22%),radial-gradient(circle_at_41%_54%,rgba(239,68,68,0.42),transparent_18%),radial-gradient(circle_at_62%_61%,rgba(34,211,238,0.15),transparent_24%),radial-gradient(circle_at_32%_72%,rgba(245,158,11,0.32),transparent_14%)]" />
                </div>
                <div className="space-y-2 rounded-2xl border border-aegis-border bg-aegis-black/20 p-4 text-sm">
                  <div className="font-semibold text-white">Legend</div>
                  <div className="flex items-center gap-2 text-aegis-text/70"><span className="h-3 w-3 rounded-full bg-red-500" /> Warm = suspicious region</div>
                  <div className="flex items-center gap-2 text-aegis-text/70"><span className="h-3 w-3 rounded-full bg-yellow-500" /> Amber = unstable consistency</div>
                  <div className="flex items-center gap-2 text-aegis-text/70"><span className="h-3 w-3 rounded-full bg-cyan-400" /> Cool = authentic evidence</div>
                </div>
              </div>
            </ChartCard>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartCard title="Try Demo Samples" subtitle="Click any sample to re-run the full pipeline">
          <div className="grid gap-4 md:grid-cols-3">
            {deepfakeSamples.map((sample) => (
              <motion.button
                key={sample.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => runPipeline(sample.id)}
                className={`rounded-3xl border p-5 text-left transition ${selectedSampleId === sample.id ? "border-aegis-primary bg-aegis-primary/10 shadow-glow" : "border-aegis-border bg-aegis-card"}`}
              >
                <div className="h-32 rounded-2xl bg-gradient-to-br from-aegis-primary/20 via-slate-500/20 to-aegis-danger/20" />
                <div className="mt-4 text-lg font-semibold text-white">{sample.title}</div>
                <div className="mt-2 text-sm text-aegis-text/70">{sample.confidence}% synthetic confidence</div>
              </motion.button>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Adversarial Attack Simulator" subtitle="Watch a benign class flip under perturbation">
          <div className="space-y-5">
            <label className="block text-sm font-medium text-aegis-text/75">
              Perturbation Strength (ε): <span className="font-mono text-aegis-accent">{epsilon.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={epsilon}
              onChange={(event) => setEpsilon(Number(event.target.value))}
              className="w-full accent-aegis-primary"
            />
            <div className="rounded-3xl border border-aegis-border bg-aegis-black/20 p-5">
              <div className="text-sm text-aegis-muted">Model prediction</div>
              <div className="mt-2 text-3xl font-bold text-white">{adversarialLabel}</div>
              <div className="mt-2 text-sm text-aegis-accent">{adversarialConfidence}% confidence</div>
            </div>
            <p className="text-sm leading-6 text-aegis-text/70">
              This demonstrates how imperceptible pixel changes can fool neural networks. AEGIS tracks these perturbation patterns and surfaces them as evasion attempts.
            </p>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
