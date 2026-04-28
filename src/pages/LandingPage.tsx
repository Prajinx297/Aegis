import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Blocks,
  BrainCircuit,
  FileWarning,
  ShieldCheck,
  Waves,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AegisLogo } from "@/components/AegisLogo";
import { Tooltip } from "@/components/Tooltip";
import { useCountUp } from "@/hooks/useCountUp";

const stats = [
  { label: "Assets Protected", value: 1247392, suffix: "" },
  { label: "Detection Accuracy", value: 98.7, suffix: "%" },
  { label: "Avg Takedown Filed", value: 3.2, suffix: "s" },
  { label: "False Positives Confirmed", value: 0, suffix: "" },
];

const features = [
  {
    id: "fingerprint",
    icon: Waves,
    title: "Neural Fingerprinting",
    description: "Creates resilient multimodal signatures that survive crops, recompression, and light edits.",
  },
  {
    id: "blockchain",
    icon: Blocks,
    title: "Blockchain Anchoring",
    description: "Anchors fingerprint proofs and certificates to an immutable tamper-evident chain.",
  },
  {
    id: "deepfake",
    icon: ShieldCheck,
    title: "Deepfake Detection",
    description: "Flags synthetic or manipulated media with multi-signal forensic analysis.",
  },
  {
    id: "threats",
    icon: Activity,
    title: "Cyber Threat Feed",
    description: "Streams live scraper, crawler, and adversarial threat intelligence in one view.",
  },
  {
    id: "dmca",
    icon: FileWarning,
    title: "Automated DMCA",
    description: "Builds and files platform-specific takedown notices from evidence-backed detections.",
  },
  {
    id: "xai",
    icon: BrainCircuit,
    title: "XAI Explainability",
    description: "Shows why the model made each decision so legal and ops teams can trust it.",
  },
];

function FeaturePreview({ featureId }: { featureId: string }) {
  if (featureId === "fingerprint") {
    return (
      <div className="rounded-2xl border border-aegis-border bg-aegis-black/40 p-3">
        <div className="mb-2 flex items-end gap-1">
          {[22, 32, 18, 30, 14, 26, 11, 18, 28, 12].map((value, index) => (
            <motion.div
              key={`${featureId}-${index}`}
              className="w-1 rounded-full bg-aegis-accent"
              animate={{ height: [8, value, Math.max(8, value - 8)] }}
              transition={{ repeat: Infinity, repeatType: "mirror", duration: 1.2 + index * 0.07 }}
            />
          ))}
        </div>
        <div className="font-mono text-xs text-aegis-accent">f7ab91ce3d2b...a12e245</div>
      </div>
    );
  }

  if (featureId === "blockchain") {
    return (
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((item) => (
          <motion.div
            key={item}
            className="rounded-xl border border-aegis-primary/30 bg-aegis-primary/10 px-3 py-2 font-mono text-[11px] text-aegis-accent"
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, delay: item * 0.15 }}
          >
            0x{item}ab...{item}f2
          </motion.div>
        ))}
      </div>
    );
  }

  if (featureId === "deepfake") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-aegis-border bg-gradient-to-br from-slate-200 to-slate-400 p-4 dark:from-slate-700 dark:to-slate-900">
        <div className="mx-auto h-16 w-16 rounded-full bg-slate-300 dark:bg-slate-500" />
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.2)_1px,transparent_1px)] bg-[size:16px_16px]"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
        <div className="mt-3 inline-flex rounded-full bg-aegis-danger/15 px-3 py-1 text-xs font-semibold text-aegis-danger">
          98.3% Synthetic
        </div>
      </div>
    );
  }

  if (featureId === "threats") {
    return (
      <div className="space-y-1 rounded-2xl border border-aegis-border bg-aegis-black/40 p-3 font-mono text-xs">
        {[
          "[ALERT] Scraper detected — IP 185.220.101.42",
          "[HIGH] Proxy crawler rotating through DE / NL",
          "[MED] API replay blocked by adaptive rules",
        ].map((line, index) => (
          <motion.div
            key={line}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            viewport={{ once: true }}
            className="text-aegis-accent"
          >
            {line}
          </motion.div>
        ))}
      </div>
    );
  }

  if (featureId === "dmca") {
    return (
      <div className="rounded-2xl border border-aegis-border bg-aegis-black/40 p-3">
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-aegis-border">
          <motion.div
            className="h-full rounded-full bg-aegis-success"
            animate={{ width: ["0%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
          />
        </div>
        <div className="text-sm text-aegis-success">Takedown Filed ✓</div>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-2xl border border-aegis-border bg-aegis-black/40 p-3">
      {[72, 58, 33, 84].map((value, index) => (
        <div key={value} className="flex items-center gap-2">
          <div className="w-24 text-xs text-aegis-muted">Signal {index + 1}</div>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-aegis-border">
            <motion.div
              className="h-full rounded-full bg-aegis-accent"
              animate={{ width: [`${Math.max(12, value - 24)}%`, `${value}%`] }}
              transition={{ repeat: Infinity, duration: 1.3 + index * 0.2, repeatType: "mirror" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LandingPage() {
  const assetCount = useCountUp(stats[0].value, 1500);
  const accuracy = useCountUp(stats[1].value, 1600, 1);
  const takedown = useCountUp(stats[2].value, 1650, 1);
  const falsePositives = useCountUp(stats[3].value, 1300);

  const timeline = [
    {
      title: "Register & Fingerprint",
      description: "Upload an asset and generate cryptographic plus perceptual signatures.",
    },
    {
      title: "AI Monitors Web",
      description: "Simulation engines track suspicious URLs, feeds, mirrors, and upload spikes.",
    },
    {
      title: "Threat Detected",
      description: "AEGIS scores the match, classifies the threat, and checks for deepfake activity.",
    },
    {
      title: "Auto-Action Taken",
      description: "A takedown workflow or analyst action launches with explainable evidence.",
    },
  ];

  return (
    <div className="min-h-screen bg-aegis-black text-aegis-text">
      <section className="relative overflow-hidden border-b border-aegis-border">
        <div className="absolute inset-0 bg-grid bg-[size:44px_44px] opacity-25" />
        <motion.div
          className="absolute -left-20 top-24 h-64 w-64 rounded-full bg-aegis-primary/20 blur-3xl"
          animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 5 }}
        />
        <motion.div
          className="absolute right-0 top-10 h-72 w-72 rounded-full bg-aegis-accent/10 blur-3xl"
          animate={{ opacity: [0.2, 0.45, 0.2], y: [0, 24, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="mb-10 flex items-center justify-between">
            <AegisLogo />
            <div className="hidden items-center gap-3 text-sm text-aegis-muted md:flex">
              <a href="#how-it-works" className="transition hover:text-white">How it works</a>
              <a href="#features" className="transition hover:text-white">Features</a>
              <Link to="/dashboard" className="rounded-full border border-aegis-border px-4 py-2 text-white transition hover:border-aegis-primary/30">
                Launch App
              </Link>
            </div>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl text-5xl font-bold tracking-tight text-white md:text-7xl"
              >
                Your Creative Work. Protected by AI.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="mt-6 max-w-3xl text-lg text-aegis-text/75 md:text-xl"
              >
                AEGIS uses neural fingerprinting, blockchain anchoring, and adversarial ML detection to defend your IP before threats emerge.
              </motion.p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/dashboard"
                  className="rounded-full bg-aegis-primary px-6 py-3 font-semibold text-white shadow-glow transition hover:scale-[1.02]"
                >
                  Launch Dashboard
                </Link>
                <a
                  href="#how-it-works"
                  className="rounded-full border border-aegis-border px-6 py-3 font-medium text-aegis-text transition hover:border-aegis-primary/30 hover:text-white"
                >
                  See How It Works
                </a>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[2rem] border border-aegis-border bg-white/5 p-6 shadow-glow backdrop-blur-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-sm text-aegis-muted">Live integrity snapshot</div>
                  <div className="mt-2 text-2xl font-semibold text-white">Real-time IP defense mesh</div>
                </div>
                <span className="rounded-full bg-aegis-success/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-aegis-success">
                  Live
                </span>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Neural fingerprints", value: "1.2M indexed", width: "92%" },
                  { label: "Threat signals correlated", value: "89 active", width: "74%" },
                  { label: "Automation confidence", value: "98.7% stable", width: "98%" },
                ].map((item, index) => (
                  <div key={item.label} className="rounded-2xl border border-aegis-border bg-aegis-card/80 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="font-mono text-aegis-accent">{item.value}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-aegis-border">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-aegis-primary to-aegis-accent"
                        initial={{ width: 0 }}
                        animate={{ width: item.width }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="mt-16 grid gap-4 rounded-3xl border border-aegis-border bg-aegis-card/60 p-4 md:grid-cols-4">
            {[
              { label: "Assets Protected", value: Math.round(assetCount).toLocaleString() },
              { label: "Detection Accuracy", value: `${accuracy.toFixed(1)}%` },
              { label: "Avg Takedown Filed", value: `${takedown.toFixed(1)}s` },
              { label: "False Positives Confirmed", value: `${Math.round(falsePositives)}` },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-aegis-border bg-aegis-black/30 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-aegis-muted">{item.label}</div>
                <div className="mt-3 text-3xl font-bold text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-10 max-w-3xl">
          <div className="inline-flex rounded-full border border-aegis-primary/20 bg-aegis-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-aegis-primary">
            Product surface
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Every module is built to feel live, explainable, and operational.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl border border-aegis-border bg-aegis-card p-6 transition hover:shadow-glow"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-aegis-primary/10 text-aegis-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-aegis-text/75">{feature.description}</p>
              <div className="mt-5">
                <FeaturePreview featureId={feature.id} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="border-y border-aegis-border bg-aegis-surface/70">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">How AEGIS works</h2>
            <p className="mt-3 text-aegis-text/75">A four-step protection loop designed to tell a clean story in live demos and production workflows.</p>
          </div>
          <div className="relative grid gap-6 md:grid-cols-4">
            <div className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-px bg-gradient-to-r from-aegis-primary/0 via-aegis-primary/60 to-aegis-primary/0 md:block" />
            {timeline.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ delay: index * 0.1 }}
                className="relative rounded-3xl border border-aegis-border bg-aegis-card p-6"
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-aegis-primary/30 bg-aegis-primary/10 text-xl font-bold text-aegis-primary">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-aegis-text/75">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="rounded-3xl border border-aegis-border bg-aegis-card p-6">
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-aegis-accent">Credibility stack</div>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              "PyTorch",
              "Transformer Models",
              "IPFS",
              "Solidity",
              "FastAPI",
              "Perceptual Hashing",
              "BERT NLP",
              "GAN Detection",
            ].map((badge) => (
              <Tooltip key={badge} content={`AEGIS uses ${badge} in its simulated architecture layer for technical credibility and storytelling.`}>
                <span className="rounded-full border border-aegis-border bg-aegis-black/30 px-4 py-2 text-sm text-aegis-text/75">
                  {badge}
                </span>
              </Tooltip>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-aegis-border bg-aegis-surface/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-aegis-muted md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <AegisLogo compact />
            <div className="mt-2">Your IP. Immutable. Intelligent. Invincible.</div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a href="https://github.com/example/aegis" className="transition hover:text-white">GitHub</a>
            <a href="https://demo.example.com" className="transition hover:text-white">Live Demo</a>
            <span>Built for Google Solution Challenge 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
