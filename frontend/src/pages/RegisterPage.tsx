import { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { Download, ExternalLink, UploadCloud } from "lucide-react";
import { BlockchainBadge, RealTimeBadge } from "@/components/Badges";
import { Pipeline, type PipelineStep } from "@/components/Pipeline";
import { useAuth } from "@/context/AuthContext";
import { anchorToBlockchain, getAssets, registerAsset } from "@/lib/api";
import { imageFromFile, l2Norm, sha256Hex } from "@/lib/browserFiles";
import { computePHash } from "@/lib/perceptualHash";
import { tfEngine } from "@/lib/tfjs";
import type { Asset, BlockchainResult } from "@/lib/types";

interface RegistrationState {
  sha256?: string;
  phash?: string;
  embeddingNorm?: number;
  anchor?: BlockchainResult;
  asset?: Asset;
}

export function RegisterPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [assetType, setAssetType] = useState("Image");
  const [license, setLicense] = useState("All Rights Reserved");
  const [tags, setTags] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [state, setState] = useState<RegistrationState>({});
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ multiple: false, onDrop: ([next]: File[]) => setFile(next) });

  useEffect(() => {
    getAssets().then(setAssets).catch(() => setAssets([]));
  }, []);

  const steps = useMemo<PipelineStep[]>(() => {
    if (!file || !user) return [];
    return [
      {
        id: "sha",
        label: "Computing SHA-256 fingerprint",
        fn: async () => {
          const sha256 = await sha256Hex(file);
          setState((s) => ({ ...s, sha256 }));
          return sha256;
        },
        display: (result) => <code className="break-all">{String(result)}</code>,
      },
      {
        id: "phash",
        label: "Computing perceptual hash (pHash)",
        fn: async () => {
          if (!file.type.startsWith("image/")) return "Non-image asset; pHash unavailable";
          const phash = await computePHash(file);
          setState((s) => ({ ...s, phash }));
          return phash;
        },
        display: (result) => <code>{String(result)}</code>,
      },
      {
        id: "embedding",
        label: "Running neural feature extraction",
        fn: async () => {
          if (!file.type.startsWith("image/")) return "Non-image asset - SHA-256 content addressing used";
          const image = await imageFromFile(file);
          const vector = await tfEngine.computeImageFeatures(image);
          const norm = l2Norm(vector);
          setState((s) => ({ ...s, embeddingNorm: norm }));
          return `Embedding: ${vector.length}-dim vector computed. L2 norm: ${norm.toFixed(3)}`;
        },
        display: (result) => <span>{String(result)}</span>,
      },
      {
        id: "anchor",
        label: "Anchoring to Ethereum Sepolia blockchain",
        fn: async () => {
          const sha256 = await sha256Hex(file);
          const phash = file.type.startsWith("image/") ? await computePHash(file) : null;
          const anchor = await anchorToBlockchain({ asset_id: crypto.randomUUID(), sha256_hash: sha256, phash, owner_uid: user.uid });
          setState((s) => ({ ...s, anchor }));
          return anchor;
        },
        display: (result) => {
          const anchor = result as BlockchainResult;
          return anchor.status === "CONFIRMED" ? (
            <div className="space-y-1">
              <BlockchainBadge tx_hash={anchor.tx_hash} />
              <p>Block {anchor.block_number} | Gas {anchor.gas_used}</p>
            </div>
          ) : (
            <span className="text-danger">FAILED: {anchor.error}</span>
          );
        },
      },
      {
        id: "registry",
        label: "Saving to secure registry",
        fn: async () => {
          const form = new FormData();
          form.append("file", file);
          form.append("title", title || file.name);
          form.append("asset_type", assetType);
          form.append("license", license);
          form.append("tags", tags);
          const asset = await registerAsset(form);
          setState((s) => ({ ...s, asset }));
          setAssets((items) => [asset, ...items]);
          return asset;
        },
        display: (result) => {
          const asset = result as Asset;
          return <span>Asset ID: <code>{asset.asset_id}</code></span>;
        },
      },
    ];
  }, [assetType, file, license, tags, title, user]);

  function certificate() {
    const html = `<html><title>AEGIS Certificate</title><body><h1>AEGIS Asset Certificate</h1><pre>${JSON.stringify(state.asset ?? state, null, 2)}</pre></body></html>`;
    const popup = window.open("", "_blank");
    if (popup) {
      popup.document.write(html);
      popup.document.close();
      popup.print();
    } else toast.error("Popup blocked; enable popups to print the certificate.");
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">IP Asset Registration</h1>
          <p className="text-slate-400">Real browser hashing, TF.js embedding extraction, Sepolia anchoring, and Firestore storage.</p>
        </div>
        <RealTimeBadge />
      </header>
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="surface p-5">
          <div {...getRootProps()} className={`grid cursor-pointer place-items-center rounded-lg border border-dashed p-8 text-center ${isDragActive ? "border-accent" : "border-line"}`}>
            <input {...getInputProps()} />
            <UploadCloud className="h-10 w-10 text-accent" />
            <p className="mt-3 font-semibold">{file ? file.name : "Drop image, video, audio, PDF, or code"}</p>
            <p className="text-sm text-slate-400">The pipeline starts only when you click execute.</p>
          </div>
          <div className="mt-4 space-y-3">
            <input className="field" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <select className="field" value={assetType} onChange={(e) => setAssetType(e.target.value)}>
              {["Image", "Video", "Audio", "Document", "Code"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <input className="field" placeholder="License" value={license} onChange={(e) => setLicense(e.target.value)} />
            <input className="field" placeholder="Tags, comma separated" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
        </section>
        <section className="surface p-5">
          <Pipeline steps={steps} onComplete={() => toast.success("Asset registration pipeline completed")} />
          {state.asset && (
            <div className="mt-5 rounded-lg border border-accent/50 bg-accent/10 p-4">
              <h2 className="font-bold">Asset Certificate</h2>
              <p className="mt-2 text-sm">Asset ID: <code>{state.asset.asset_id}</code></p>
              <p className="text-sm">SHA-256: <code className="break-all">{state.asset.fingerprints.sha256}</code></p>
              <button className="button mt-3" onClick={certificate}><Download className="h-4 w-4" /> Download Certificate</button>
            </div>
          )}
        </section>
      </div>
      <section className="surface overflow-hidden p-5">
        <h2 className="text-xl font-bold">Registered Assets</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-slate-400"><tr><th className="p-2">Title</th><th>Type</th><th>pHash</th><th>Blockchain TX</th><th>Status</th></tr></thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.asset_id} className="border-t border-line">
                  <td className="p-2 font-semibold">{asset.title}</td>
                  <td>{asset.asset_type}</td>
                  <td><code>{asset.fingerprints?.phash ?? "n/a"}</code></td>
                  <td>{asset.blockchain?.tx_hash ? <BlockchainBadge tx_hash={asset.blockchain.tx_hash} /> : <span className="text-slate-500">No tx</span>}</td>
                  <td>{asset.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {assets.length === 0 && <p className="mt-4 text-sm text-slate-400">No Firestore assets yet. Register one to populate this table.</p>}
      </section>
    </div>
  );
}
