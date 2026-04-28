import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { ScanSearch, UploadCloud } from "lucide-react";
import { RealTimeBadge } from "@/components/Badges";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { detectFile, detectUrl, getAssets } from "@/lib/api";
import { imageFromFile } from "@/lib/browserFiles";
import { computePHash } from "@/lib/perceptualHash";
import { tfEngine } from "@/lib/tfjs";
import type { Asset, DetectionResult } from "@/lib/types";

export function DetectPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"url" | "file" | "bulk">("url");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [localInfo, setLocalInfo] = useState<string[]>([]);
  const [domains, setDomains] = useState("");
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const { getRootProps, getInputProps } = useDropzone({ multiple: false, onDrop: ([file]: File[]) => scanFile(file) });

  useEffect(() => {
    getAssets().then(setAssets).catch(() => setAssets([]));
    if (user) {
      getDocs(collection(db, "users", user.uid, "watchlist")).then((snap) => setWatchlist(snap.docs.map((d) => d.id)));
    }
  }, [user]);

  async function scanUrl() {
    setResult(null);
    try {
      setResult(await detectUrl(url));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "URL scan failed");
    }
  }

  async function scanFile(file: File) {
    try {
      const info: string[] = [];
      if (file.type.startsWith("image/")) {
        const phash = await computePHash(file);
        info.push(`Local pHash: ${phash}`);
        const predictions = await tfEngine.classifyImage(await imageFromFile(file));
        info.push(`MobileNet: ${predictions[0].className} (${(predictions[0].probability * 100).toFixed(1)}%)`);
      } else {
        info.push("Non-image file: backend SHA-256 matching only");
      }
      setLocalInfo(info);
      setResult(await detectFile(file));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "File scan failed");
    }
  }

  async function saveWatchlist() {
    if (!user) return;
    const items = domains.split(/\n+/).map((item) => item.trim()).filter(Boolean);
    await Promise.all(items.map((domain) => setDoc(doc(db, "users", user.uid, "watchlist", domain), { domain, saved_at: new Date().toISOString() })));
    setWatchlist(items);
    toast.success("Watchlist saved to Firestore");
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div><h1 className="text-3xl font-black">Detection Engine</h1><p className="text-slate-400">Backend pHash matching against registered Firestore assets.</p></div>
        <RealTimeBadge />
      </header>
      {assets.length === 0 && <div className="surface border-amber-400/50 p-4 text-sm text-amber-100">No registered assets were found. Register an asset first for meaningful matching.</div>}
      <div className="surface p-2">
        {(["url", "file", "bulk"] as const).map((item) => <button key={item} className={`rounded-md px-4 py-2 text-sm ${tab === item ? "bg-accent text-ink" : "text-slate-300"}`} onClick={() => setTab(item)}>{item === "url" ? "URL Scan" : item === "file" ? "File Upload" : "Bulk Monitor"}</button>)}
      </div>
      {tab === "url" && (
        <section className="surface p-5">
          <div className="flex flex-col gap-3 md:flex-row">
            <input className="field" placeholder="https://example.com/page" value={url} onChange={(e) => setUrl(e.target.value)} />
            <button className="button" onClick={scanUrl}><ScanSearch className="h-4 w-4" /> Scan</button>
          </div>
        </section>
      )}
      {tab === "file" && (
        <section className="surface p-5">
          <div {...getRootProps()} className="grid cursor-pointer place-items-center rounded-lg border border-dashed border-line p-8 text-center">
            <input {...getInputProps()} />
            <UploadCloud className="h-9 w-9 text-accent" />
            <p className="mt-3 font-semibold">Drop file for browser pHash + TF.js + backend matching</p>
          </div>
          {localInfo.length > 0 && <div className="mt-4 rounded-lg border border-line bg-ink p-4 text-sm">{localInfo.map((line) => <p key={line}>{line}</p>)}</div>}
        </section>
      )}
      {tab === "bulk" && (
        <section className="surface p-5">
          <textarea className="field min-h-36" placeholder="Enter domains to monitor, one per line" value={domains} onChange={(e) => setDomains(e.target.value)} />
          <button className="button mt-3" onClick={saveWatchlist}>Save watchlist to Firestore</button>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {watchlist.map((domain) => <button className="button-secondary justify-between" key={domain} onClick={() => { setUrl(`https://${domain}`); setTab("url"); }}>{domain}<span>Scan Now</span></button>)}
          </div>
        </section>
      )}
      {result && (
        <section className="surface p-5">
          <h2 className="text-xl font-bold">Scan Results</h2>
          <p className="mt-2 text-sm text-slate-400">Images found: {result.images_found} | analyzed: {result.images_analyzed} | duration: {result.scan_duration_seconds}s</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-slate-400"><tr><th className="p-2">Page Image</th><th>Asset</th><th>Similarity</th><th>Distance</th><th>Verdict</th></tr></thead>
              <tbody>
                {result.matches.map((match, index) => (
                  <tr key={`${match.matched_asset_id}-${index}`} className="border-t border-line">
                    <td className="p-2 max-w-xs truncate">{match.page_image_url ?? "Uploaded file"}</td>
                    <td>{match.matched_asset_title}</td>
                    <td>{match.similarity_percent.toFixed(2)}%</td>
                    <td>{match.hamming_distance}</td>
                    <td>{match.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.matches.length === 0 && <p className="mt-4 text-sm text-slate-400">No matches under the Hamming distance threshold.</p>}
        </section>
      )}
    </div>
  );
}
