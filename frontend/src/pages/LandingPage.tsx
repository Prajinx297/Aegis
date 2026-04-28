import { Link } from "react-router-dom";
import { ArrowRight, Bot, Fingerprint, Network, ShieldCheck } from "lucide-react";
import { AegisMark, RealTimeBadge } from "@/components/Badges";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6">
        <nav className="flex items-center justify-between">
          <AegisMark />
          <Link to="/login" className="button-secondary">Sign in</Link>
        </nav>
        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <RealTimeBadge mode="LIVE" />
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-tight md:text-7xl">AEGIS v2</h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-300">
              Production-grade IP protection and cyber threat intelligence with real perceptual hashing, TensorFlow.js inference, Claude analysis, Firestore persistence, and Sepolia anchoring.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="button" to="/dashboard">
                Open command center <ArrowRight className="h-4 w-4" />
              </Link>
              <a className="button-secondary" href="https://sepolia.etherscan.io" target="_blank" rel="noreferrer">Sepolia explorer</a>
            </div>
          </div>
          <div className="surface p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["SubtleCrypto + pHash", Fingerprint],
                ["TensorFlow.js inference", Bot],
                ["Claude Sonnet 4.5", ShieldCheck],
                ["Ethereum Sepolia", Network],
              ].map(([label, Icon]) => (
                <div key={label as string} className="rounded-lg border border-line bg-ink p-5">
                  <Icon className="h-7 w-7 text-accent" />
                  <p className="mt-4 font-semibold">{label as string}</p>
                  <p className="mt-2 text-sm text-slate-400">Real computation, real API calls, visible source paths.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
