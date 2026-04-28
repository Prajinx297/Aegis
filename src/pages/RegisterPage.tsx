import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { motion } from "framer-motion";
import { Download, FileCode2, FileImage, FileText, FileVideo, Music4, UploadCloud } from "lucide-react";
import { ScanPipeline } from "@/components/ScanPipeline";
import { useSimulation } from "@/hooks/useSimulation";
import { generateCertificateId, generateTxHash } from "@/features/chain/chainUtils";
import { registrationSteps } from "@/features/fingerprint/pipeline";
import { randomHex, truncateMiddle } from "@/lib/format";
import type { AssetRecord, AssetType, LicenseType } from "@/lib/types";

const assetTypes: AssetType[] = ["Image", "Video", "Audio", "Code", "Document"];
const licenseTypes: LicenseType[] = ["CC-BY", "CC-BY-SA", "All Rights Reserved", "Custom"];

function getAssetIcon(type: AssetType) {
  switch (type) {
    case "Image":
      return FileImage;
    case "Video":
      return FileVideo;
    case "Audio":
      return Music4;
    case "Code":
      return FileCode2;
    default:
      return FileText;
  }
}

export function RegisterPage() {
  const { addAsset, assets, pushToast } = useSimulation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assetType, setAssetType] = useState<AssetType>("Video");
  const [licenseType, setLicenseType] = useState<LicenseType>("All Rights Reserved");
  const [tags, setTags] = useState("sports,broadcast,live");
  const [currentStep, setCurrentStep] = useState(-1);
  const [complete, setComplete] = useState(false);
  const [sha, setSha] = useState("");
  const [fingerprint, setFingerprint] = useState("");
  const [phash, setPhash] = useState("");
  const [txHash, setTxHash] = useState("");
  const [certificate, setCertificate] = useState("");
  const [result, setResult] = useState<AssetRecord | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const selectedIcon = useMemo(() => getAssetIcon(assetType), [assetType]);
  const SelectedIcon = selectedIcon;

  const runTyping = (target: string, setter: Dispatch<SetStateAction<string>>, duration: number) => {
    setter("");
    const interval = Math.max(15, duration / target.length);
    target.split("").forEach((char, index) => {
      const timer = window.setTimeout(() => {
        setter((previous) => previous + char);
      }, index * interval);
      timers.current.push(timer);
    });
  };

  const startRegistration = () => {
    if (!selectedFile) {
      pushToast({
        tone: "info",
        title: "Upload required",
        description: "Drop or browse for an asset to begin registration.",
      });
      return;
    }

    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setCurrentStep(0);
    setComplete(false);
    setResult(null);

    const nextSha = randomHex(64);
    const nextFingerprint = randomHex(64);
    const nextPHash = randomHex(16);
    const nextTx = generateTxHash();
    const nextCertificate = generateCertificateId();

    const schedule = registrationSteps.reduce((elapsed, step, index) => {
      const startTimer = window.setTimeout(() => {
        setCurrentStep(index);
        if (step.id === "signature") {
          runTyping(nextSha, setSha, 1000);
        }
        if (step.id === "fingerprint") {
          runTyping(nextFingerprint, setFingerprint, 1300);
        }
        if (step.id === "phash") {
          runTyping(nextPHash, setPhash, 700);
        }
        if (step.id === "chain") {
          runTyping(nextTx, setTxHash, 1200);
        }
        if (step.id === "complete") {
          setCertificate(nextCertificate);
        }
      }, elapsed);
      timers.current.push(startTimer);
      return elapsed + step.duration;
    }, 0);

    const completeTimer = window.setTimeout(() => {
      setCurrentStep(registrationSteps.length);
      setComplete(true);
      const newAsset: AssetRecord = {
        id: `asset-${randomHex(6)}`,
        name: selectedFile.name,
        type: assetType,
        license: licenseType,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        createdAt: new Date().toISOString(),
        fingerprint: nextFingerprint,
        phash: nextPHash,
        sha256: nextSha,
        chainHash: nextTx,
        certificateId: nextCertificate,
        status: "Anchored",
      };
      addAsset(newAsset);
      setResult(newAsset);
    }, schedule + 150);
    timers.current.push(completeTimer);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <motion.section whileHover={{ scale: 1.01 }} className="rounded-3xl border border-aegis-border bg-aegis-card p-6">
          <div className="text-xl font-semibold text-slate-900 dark:text-white">Register New Asset</div>
          <div className="mt-2 text-sm text-aegis-muted">Drag and drop an image, video, audio file, code archive, or document.</div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-6 flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-aegis-primary/30 bg-aegis-primary/5 px-6 py-12 text-center transition hover:border-aegis-primary hover:shadow-glow"
          >
            <UploadCloud className="h-10 w-10 text-aegis-primary" />
            <div className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Drop your asset here</div>
            <div className="mt-2 text-sm text-aegis-muted">or browse your local files</div>
            {selectedFile ? (
              <div className="mt-5 rounded-2xl border border-aegis-border bg-aegis-card px-4 py-3 text-sm text-aegis-text">
                {selectedFile.name} · {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
              </div>
            ) : null}
          </button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-aegis-text/80">Asset Type</span>
              <select
                value={assetType}
                onChange={(event) => setAssetType(event.target.value as AssetType)}
                className="w-full rounded-2xl border border-aegis-border bg-aegis-black/30 px-4 py-3 text-aegis-text outline-none"
              >
                {assetTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-aegis-text/80">License Type</span>
              <select
                value={licenseType}
                onChange={(event) => setLicenseType(event.target.value as LicenseType)}
                className="w-full rounded-2xl border border-aegis-border bg-aegis-black/30 px-4 py-3 text-aegis-text outline-none"
              >
                {licenseTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 block space-y-2">
            <span className="text-sm font-medium text-aegis-text/80">Tags</span>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              className="w-full rounded-2xl border border-aegis-border bg-aegis-black/30 px-4 py-3 text-aegis-text outline-none"
            />
          </label>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={startRegistration}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-aegis-primary px-5 py-3 font-semibold text-white shadow-glow"
          >
            <SelectedIcon className="h-4 w-4" />
            Register & Fingerprint
          </motion.button>
        </motion.section>

        <section className="rounded-3xl border border-aegis-border bg-aegis-card p-6">
          <div className="text-lg font-semibold text-slate-900 dark:text-white">Your Registered Assets</div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-aegis-border">
            <table className="min-w-full divide-y divide-aegis-border text-sm">
              <thead className="bg-aegis-black/20 text-left text-aegis-muted">
                <tr>
                  <th className="px-4 py-3">Asset Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Fingerprint</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aegis-border">
                {assets.slice(0, 5).map((asset) => (
                  <tr key={asset.id} className="transition hover:bg-aegis-primary/5">
                    <td className="px-4 py-3 text-aegis-text">{asset.name}</td>
                    <td className="px-4 py-3 text-aegis-muted">{asset.type}</td>
                    <td className="px-4 py-3 text-aegis-muted">{new Date(asset.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-mono text-aegis-accent">{truncateMiddle(asset.fingerprint, 10, 8)}</td>
                    <td className="px-4 py-3 text-aegis-success">{asset.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="rounded-3xl border border-aegis-border bg-aegis-card p-6">
          <div className="text-xl font-semibold text-slate-900 dark:text-white">Live Registration Pipeline</div>
          <div className="mt-5">
            <ScanPipeline steps={registrationSteps} currentStep={Math.max(currentStep, 0)} completed={complete} />
          </div>

          {(sha || fingerprint || phash || txHash || certificate) ? (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-aegis-border bg-aegis-black/25 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-aegis-muted">SHA-256</div>
                <div className="mt-2 break-all font-mono text-sm text-aegis-accent">{sha || "Pending..."}</div>
              </div>
              <div className="rounded-2xl border border-aegis-border bg-aegis-black/25 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-aegis-muted">Neural fingerprint</div>
                <div className="mt-2 break-all font-mono text-sm text-aegis-accent">{fingerprint || "Pending..."}</div>
              </div>
              <div className="rounded-2xl border border-aegis-border bg-aegis-black/25 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-aegis-muted">pHash</div>
                <div className="mt-2 break-all font-mono text-sm text-aegis-accent">{phash || "Pending..."}</div>
              </div>
              <div className="rounded-2xl border border-aegis-border bg-aegis-black/25 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-aegis-muted">Blockchain tx hash</div>
                <div className="mt-2 break-all font-mono text-sm text-aegis-accent">{txHash || "Pending..."}</div>
              </div>
            </div>
          ) : null}
        </section>

        {result ? (
          <section className="rounded-3xl border border-aegis-success/30 bg-aegis-success/10 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-semibold text-white">Registered Asset Card</div>
                <div className="mt-2 text-sm text-aegis-text/75">Certificate ID: {result.certificateId}</div>
              </div>
              <button
                type="button"
                onClick={() =>
                  pushToast({
                    tone: "success",
                    title: "Certificate downloaded",
                    description: `Saved ${result.certificateId}.pdf to your secure archive.`,
                  })
                }
                className="inline-flex items-center gap-2 rounded-2xl border border-aegis-success/30 bg-aegis-success/10 px-4 py-3 text-sm font-medium text-aegis-success"
              >
                <Download className="h-4 w-4" />
                Download Certificate
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                ["Asset", result.name],
                ["Type", result.type],
                ["License", result.license],
                ["Tags", result.tags.join(", ")],
                ["Fingerprint", truncateMiddle(result.fingerprint, 10, 10)],
                ["Chain proof", truncateMiddle(result.chainHash, 12, 8)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-aegis-success/20 bg-aegis-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-aegis-muted">{label}</div>
                  <div className="mt-2 text-sm text-aegis-text">{value}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
