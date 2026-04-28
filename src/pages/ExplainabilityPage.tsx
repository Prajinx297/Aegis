import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "@/components/ChartCard";
import { explainabilityScenarios } from "@/features/explainability/scenarios";

type ScenarioKey = keyof typeof explainabilityScenarios;

export function ExplainabilityPage() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>("image");
  const [typedText, setTypedText] = useState("");
  const scenario = useMemo(() => explainabilityScenarios[scenarioKey], [scenarioKey]);

  useEffect(() => {
    setTypedText("");
    const text = scenario.explanation;
    const timers = text.split("").map((char, index) =>
      window.setTimeout(() => {
        setTypedText((previous) => previous + char);
      }, index * 16),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [scenario]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-aegis-border bg-aegis-card p-6">
        <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Why did AEGIS flag this content?</div>
        <div className="mt-2 text-aegis-text/70">AEGIS is built on explainable AI. Every decision comes with a full reasoning trace.</div>

        <div className="mt-6 flex flex-wrap gap-3">
          {([
            ["image", "Image Similarity Match"],
            ["deepfake", "Deepfake Detection"],
            ["threat", "Threat Classification"],
          ] as Array<[ScenarioKey, string]>).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setScenarioKey(key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${scenarioKey === key ? "bg-aegis-primary text-white shadow-glow" : "border border-aegis-border text-aegis-text/70"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <ChartCard title="Model Decision" subtitle={scenario.label}>
          <div className="rounded-3xl border border-aegis-border bg-aegis-black/20 p-5">
            <div className="text-sm text-aegis-muted">Verdict</div>
            <div className="mt-3 text-2xl font-semibold text-white">{scenario.verdict}</div>
            <div className="mt-2 font-mono text-sm text-aegis-accent">{scenario.confidence}% confidence</div>
          </div>
        </ChartCard>

        <ChartCard title="Feature Importance" subtitle="Top six SHAP-style contributing signals">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenario.features} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={150} stroke="#64748B" tick={{ fontSize: 11 }} />
                <RechartsTooltip contentStyle={{ backgroundColor: "#111118", border: "1px solid #2A2A3A", borderRadius: 16 }} />
                <Bar dataKey="score" radius={[0, 12, 12, 0]}>
                  {scenario.features.map((feature) => (
                    <Cell key={feature.name} fill={feature.tone === "positive" ? "#10B981" : "#EF4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <ChartCard title="Decision Path" subtitle="Three-level tree showing model branching">
          <div className="overflow-hidden rounded-2xl border border-aegis-border bg-aegis-black/20 p-4">
            <svg viewBox="0 0 520 320" className="w-full">
              {[
                { x: 220, y: 28, label: "Input asset" },
                { x: 80, y: 122, label: "Preprocessing" },
                { x: 220, y: 122, label: "Embedding" },
                { x: 360, y: 122, label: "Signals" },
                { x: 80, y: 230, label: "Threshold check" },
                { x: 220, y: 230, label: "Similarity engine" },
                { x: 360, y: 230, label: "Final verdict" },
              ].map((node, index) => (
                <motion.g key={node.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.08 }}>
                  <title>{`${node.label}: part of the reasoning trace used to produce the final decision.`}</title>
                  <rect x={node.x} y={node.y} rx="22" width="120" height="46" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.35)" />
                  <text x={node.x + 60} y={node.y + 28} textAnchor="middle" fill="#E2E8F0" fontSize="14">{node.label}</text>
                </motion.g>
              ))}
              {[
                [280, 74, 140, 122],
                [280, 74, 280, 122],
                [280, 74, 420, 122],
                [140, 168, 140, 230],
                [280, 168, 280, 230],
                [420, 168, 420, 230],
              ].map(([x1, y1, x2, y2], index) => (
                <motion.line
                  key={`${x1}-${y1}-${x2}-${y2}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#22D3EE"
                  strokeDasharray="6 6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.2 + index * 0.05, duration: 0.5 }}
                />
              ))}
            </svg>
          </div>
        </ChartCard>

        <div className="space-y-6">
          <ChartCard title="Confidence Breakdown" subtitle="Top-three class probabilities">
            <div className="space-y-3">
              {scenario.probabilities.map((item) => (
                <div key={item.className}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-aegis-text/80">{item.className}</span>
                    <span className="font-mono text-aegis-accent">{item.value}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-aegis-border">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-aegis-primary to-aegis-accent" initial={{ width: 0 }} animate={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Natural Language Explanation" subtitle="Typed reasoning trace">
            <div className="rounded-2xl border border-aegis-border bg-aegis-black/20 p-5 text-sm leading-7 text-aegis-text/80">
              {typedText}
              <span className="animate-pulse text-aegis-accent">|</span>
            </div>
          </ChartCard>
        </div>
      </div>

      <ChartCard title="Model Architecture Overview" subtitle="Input -> preprocessing -> encoder -> embedding -> decision">
        <div className="overflow-hidden rounded-2xl border border-aegis-border bg-aegis-black/20 p-4">
          <svg viewBox="0 0 940 220" className="w-full">
            {[
              { x: 24, label: "Input" },
              { x: 190, label: "Preprocessing" },
              { x: 378, label: "CNN Encoder" },
              { x: 560, label: "Embedding Space" },
              { x: 746, label: "Similarity Engine" },
            ].map((node, index) => (
              <g key={node.label}>
                <title>{`${node.label}: hover tooltip describing the role of this stage in the AEGIS inference pipeline.`}</title>
                <rect x={node.x} y="72" width="140" height="56" rx="24" fill="rgba(34,211,238,0.08)" stroke="rgba(34,211,238,0.28)" />
                <text x={node.x + 70} y="104" textAnchor="middle" fill="#E2E8F0" fontSize="14">{node.label}</text>
                {index < 4 ? <line x1={node.x + 140} y1="100" x2={node.x + 166} y2="100" stroke="#6366F1" strokeDasharray="8 6" /> : null}
              </g>
            ))}
            <rect x="780" y="152" width="120" height="44" rx="22" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.35)" />
            <text x="840" y="178" textAnchor="middle" fill="#E2E8F0" fontSize="14">Decision Layer</text>
            <line x1="816" y1="128" x2="840" y2="152" stroke="#22D3EE" strokeDasharray="8 6" />
          </svg>
        </div>
      </ChartCard>
    </div>
  );
}
