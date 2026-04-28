import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as tf from "@tensorflow/tfjs";
import toast from "react-hot-toast";
import { SlidersHorizontal, UploadCloud } from "lucide-react";
import { RealTimeBadge, TensorFlowStatus } from "@/components/Badges";
import { demoImages } from "@/data/demoImages";
import { imageFromFile } from "@/lib/browserFiles";
import { tfEngine, type DeepfakeHeuristicResult } from "@/lib/tfjs";
import { useModelLoader } from "@/hooks/useModelLoader";

async function imageFromUrl(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export function DeepfakePage() {
  const models = useModelLoader(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const advRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState<DeepfakeHeuristicResult | null>(null);
  const [epsilon, setEpsilon] = useState(0.02);
  const [advPrediction, setAdvPrediction] = useState("");
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const { getRootProps, getInputProps } = useDropzone({ multiple: false, accept: { "image/*": [] }, onDrop: ([file]: File[]) => loadImage(file) });

  async function analyze(image: HTMLImageElement) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = image.naturalWidth || 420;
    canvas.height = image.naturalHeight || 300;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const faces = await tfEngine.detectFaces(canvas);
    ctx.strokeStyle = "#2dd4bf";
    ctx.fillStyle = "#2dd4bf";
    ctx.lineWidth = 3;
    faces.face_locations.forEach((box, index) => {
      const [x1, y1] = box.topLeft;
      const [x2, y2] = box.bottomRight;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      faces.landmarks[index]?.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    const next = await tfEngine.analyzeForDeepfake(canvas);
    setResult(next);
    setSourceImage(image);
    await renderAdversarial(image, epsilon);
  }

  async function loadImage(file: File) {
    try {
      await analyze(await imageFromFile(file));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image analysis failed");
    }
  }

  async function renderAdversarial(image = sourceImage, eps = epsilon) {
    if (!image || !advRef.current) return;
    const canvas = advRef.current;
    canvas.width = image.naturalWidth || 420;
    canvas.height = image.naturalHeight || 300;
    const scratch = document.createElement("canvas");
    scratch.width = canvas.width;
    scratch.height = canvas.height;
    scratch.getContext("2d")!.drawImage(image, 0, 0, scratch.width, scratch.height);
    const adversarial = tf.tidy(() => {
      const imageTensor = tf.browser.fromPixels(scratch).toFloat().div(255);
      const perturbation = tf.randomUniform(imageTensor.shape, -eps, eps);
      return imageTensor.add(perturbation).clipByValue(0, 1);
    });
    await tf.browser.toPixels(adversarial, canvas);
    adversarial.dispose();
    const predictions = await tfEngine.classifyImage(canvas);
    setAdvPrediction(`${predictions[0].className} (${(predictions[0].probability * 100).toFixed(1)}%)`);
  }

  useEffect(() => {
    renderAdversarial(undefined, epsilon).catch(() => undefined);
  }, [epsilon]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-black">Deepfake & Adversarial Detector</h1><p className="text-slate-400">Heuristic Analysis (Experimental) using real TensorFlow.js inference.</p></div>
        <div className="flex gap-2"><RealTimeBadge /><TensorFlowStatus ready={models.ready} status={models.status} /></div>
      </header>
      <section className="surface p-5">
        <div {...getRootProps()} className="grid cursor-pointer place-items-center rounded-lg border border-dashed border-line p-6 text-center">
          <input {...getInputProps()} />
          <UploadCloud className="h-9 w-9 text-accent" />
          <p className="mt-3 font-semibold">Drop an image or choose a demo sample</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {demoImages.map((sample) => (
            <button key={sample.label} className="rounded-lg border border-line bg-ink p-3 text-left" onClick={async () => analyze(await imageFromUrl(sample.dataUrl))}>
              <img className="h-32 w-full rounded object-cover" src={sample.dataUrl} alt={sample.name} />
              <p className="mt-2 text-sm font-semibold">{sample.name}</p>
            </button>
          ))}
        </div>
      </section>
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="surface p-5">
          <h2 className="text-xl font-bold">Face Detection Overlay</h2>
          <canvas ref={canvasRef} className="mt-4 max-h-[420px] w-full rounded-lg bg-ink object-contain" />
          {result?.face_locations && <pre className="mt-4 max-h-32 overflow-auto rounded bg-ink p-3 text-xs text-slate-300">{JSON.stringify(result.face_locations, null, 2)}</pre>}
        </section>
        <section className="surface p-5">
          <h2 className="text-xl font-bold">AEGIS Heuristic Analysis - Experimental Feature</h2>
          <p className="mt-2 text-sm text-slate-400">Results based on real TensorFlow.js inference (BlazeFace + MobileNet + Laplacian edge analysis). This is not a trained deepfake classifier.</p>
          {result ? (
            <div className="mt-4 grid gap-3">
              <Metric label="Faces detected" value={String(result.faces_detected ?? 0)} />
              <Metric label="Synthetic score" value={String(result.synthetic_score ?? "n/a")} />
              <Metric label="Laplacian variance" value={String(result.laplacian_variance ?? "n/a")} />
              <Metric label="Landmark asymmetry" value={String(result.landmark_asymmetry ?? "n/a")} />
              <Metric label="MobileNet top prediction" value={`${result.mobilenet_top_prediction ?? "n/a"} (${((result.mobilenet_confidence ?? 0) * 100).toFixed(1)}%)`} />
              <div className="rounded-lg border border-accent/50 bg-accent/10 p-4 font-bold">{result.verdict ?? "No face image detected"}</div>
            </div>
          ) : <p className="mt-4 text-sm text-slate-400">Upload or select a sample to run real model inference.</p>}
        </section>
      </div>
      <section className="surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-xl font-bold">FGSM-style perturbation</h2><p className="text-sm text-slate-400">Real TensorFlow.js pixel perturbation and MobileNet reclassification.</p></div>
          <label className="flex items-center gap-3 text-sm"><SlidersHorizontal className="h-4 w-4" /> ε={epsilon.toFixed(3)}<input type="range" min="0" max="0.08" step="0.005" value={epsilon} onChange={(e) => setEpsilon(Number(e.target.value))} /></label>
        </div>
        <canvas ref={advRef} className="mt-4 max-h-[360px] w-full rounded-lg bg-ink object-contain" />
        <p className="mt-3 text-sm text-slate-300">Perturbed prediction: {advPrediction || "Load an image first"}</p>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-lg border border-line bg-ink p-3 text-sm"><span className="text-slate-400">{label}</span><span className="font-semibold">{value}</span></div>;
}
