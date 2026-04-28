import { useState } from "react";
import { AIBadge, RealTimeBadge } from "@/components/Badges";
import { demoImages } from "@/data/demoImages";
import { classifyThreat } from "@/lib/api";
import { computePHash, hammingDistance } from "@/lib/perceptualHash";
import { tfEngine } from "@/lib/tfjs";
import type { ThreatClassification } from "@/lib/types";

async function fileFromDataUrl(dataUrl: string, name: string) {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], name, { type: blob.type });
}

async function imageFromDataUrl(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export function ExplainabilityPage() {
  const [hashes, setHashes] = useState<{ a: string; b: string; distance: number } | null>(null);
  const [predictions, setPredictions] = useState<Array<{ className: string; probability: number }>>([]);
  const [heatmap, setHeatmap] = useState<number[]>([]);
  const [threat, setThreat] = useState<ThreatClassification | null>(null);

  async function runHashDemo() {
    const a = await computePHash(await fileFromDataUrl(demoImages[0].dataUrl, "a.svg"));
    const b = await computePHash(await fileFromDataUrl(demoImages[2].dataUrl, "b.svg"));
    setHashes({ a, b, distance: hammingDistance(a, b) });
  }

  async function runTfDemo() {
    const image = await imageFromDataUrl(demoImages[0].dataUrl);
    const base = await tfEngine.classifyImage(image);
    setPredictions(base);
    const topClass = base[0].className;
    const topProbability = base[0].probability;
    const canvas = document.createElement("canvas");
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext("2d")!;
    const patchScores: number[] = [];
    for (let y = 0; y < 4; y += 1) {
      for (let x = 0; x < 4; x += 1) {
        ctx.drawImage(image, 0, 0, 224, 224);
        ctx.fillStyle = "rgba(20, 20, 20, 0.88)";
        ctx.fillRect(x * 56, y * 56, 56, 56);
        const masked = await tfEngine.classifyImage(canvas);
        const sameClass = masked.find((item) => item.className === topClass)?.probability ?? 0;
        patchScores.push(Math.max(0, topProbability - sameClass));
      }
    }
    const max = Math.max(...patchScores, 0.001);
    setHeatmap(patchScores.map((score) => score / max));
  }

  async function runThreatDemo() {
    setThreat(await classifyThreat("GET /api/assets/export?asset=full-resolution HTTP/1.1 - 185.220.101.47 - python-requests/2.31"));
  }

  const bitsA = hashes ? BigInt(`0x${hashes.a}`).toString(2).padStart(64, "0") : "";
  const bitsB = hashes ? BigInt(`0x${hashes.b}`).toString(2).padStart(64, "0") : "";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-black">XAI Panel</h1><p className="text-slate-400">Real hash, TF.js, and Claude reasoning demos.</p></div>
        <RealTimeBadge />
      </header>
      <section className="surface p-5">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Demo A: pHash Similarity Explanation</h2><button className="button" onClick={runHashDemo}>Compute pHash comparison</button></div>
        {hashes && <div className="mt-4"><p className="text-sm">pHash A: <code>{hashes.a}</code> | pHash B: <code>{hashes.b}</code> | Hamming distance: {hashes.distance}</p><div className="mt-4 grid max-w-xl grid-cols-8 gap-1">{bitsA.split("").map((bit, i) => <div key={i} className={`grid aspect-square place-items-center rounded text-xs ${bit === bitsB[i] ? "bg-emerald-500/30" : "bg-danger/40"}`}>{bit}</div>)}</div></div>}
      </section>
      <section className="surface p-5">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Demo B: TensorFlow.js Classification Explanation</h2><button className="button" onClick={runTfDemo}>Run MobileNet</button></div>
        <p className="mt-2 text-sm text-slate-400">Approximate saliency via occlusion sensitivity (16 masked patches). More intense cells changed the winning class confidence more.</p>
        <div className="mt-4 space-y-3">{predictions.map((item) => <div key={item.className}><div className="flex justify-between text-sm"><span>{item.className}</span><span>{(item.probability * 100).toFixed(1)}%</span></div><div className="mt-1 h-2 rounded bg-ink"><div className="h-2 rounded bg-accent" style={{ width: `${item.probability * 100}%` }} /></div></div>)}</div>
        {heatmap.length > 0 && <div className="mt-5 grid max-w-xs grid-cols-4 gap-1">{heatmap.map((score, i) => <div key={i} className="aspect-square rounded border border-line" style={{ background: `rgba(245, 158, 11, ${0.15 + score * 0.85})` }} />)}</div>}
      </section>
      <section className="surface p-5">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Demo C: Claude Threat Classification Reasoning</h2><button className="button" onClick={runThreatDemo}>Ask Claude</button></div>
        {threat && <div className="mt-4 rounded-lg border border-line bg-ink p-4"><AIBadge model={threat.model_used} /><p className="mt-3 text-lg font-bold">{threat.threat_type} - {threat.severity}</p><p className="mt-2 text-slate-300">{threat.reasoning}</p><pre className="mt-3 overflow-auto text-xs">{JSON.stringify(threat, null, 2)}</pre></div>}
      </section>
    </div>
  );
}
