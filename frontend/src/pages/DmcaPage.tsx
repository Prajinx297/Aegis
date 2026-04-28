import { FormEvent, useEffect, useState } from "react";
import { addDoc, collection, getDocs, query, updateDoc, where, doc } from "firebase/firestore";
import toast from "react-hot-toast";
import { AIBadge, FirestoreBadge, RealTimeBadge } from "@/components/Badges";
import { useAuth } from "@/context/AuthContext";
import { analyzeUrl, generateDmcaNotice, getAssets } from "@/lib/api";
import { downloadText } from "@/lib/browserFiles";
import { db } from "@/lib/firebase";
import type { Asset, DmcaResult } from "@/lib/types";

interface CaseDoc {
  id: string;
  case_id: string;
  asset_title: string;
  platform: string;
  status: string;
  notice_text: string;
}

export function DmcaPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"file" | "active" | "history">("file");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [cases, setCases] = useState<CaseDoc[]>([]);
  const [result, setResult] = useState<DmcaResult | null>(null);
  const [form, setForm] = useState({ asset: "", infringing_url: "", platform: "", infringement_type: "", owner_name: "", additional_evidence: "" });

  useEffect(() => {
    getAssets().then(setAssets).catch(() => setAssets([]));
    loadCases();
  }, [user]);

  async function loadCases() {
    if (!user) return;
    const snap = await getDocs(query(collection(db, "dmca_cases"), where("owner_uid", "==", user.uid)));
    setCases(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CaseDoc, "id">) })));
  }

  async function runAnalyze() {
    const risk = await analyzeUrl(form.infringing_url);
    setForm((current) => ({ ...current, additional_evidence: [...(risk.indicators ?? []), risk.recommendation].filter(Boolean).join("\n") }));
    toast.success(`URL risk: ${risk.risk_level}`);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const asset = assets.find((item) => item.asset_id === form.asset);
    const dmca = await generateDmcaNotice({
      owner_name: form.owner_name,
      asset_title: asset?.title ?? form.asset,
      asset_description: `${asset?.asset_type ?? "Asset"} protected by AEGIS fingerprint ${asset?.fingerprints?.sha256 ?? ""}`,
      asset_registration_date: String(asset?.registered_at ?? new Date().toISOString()),
      infringing_url: form.infringing_url,
      platform: form.platform,
      infringement_type: form.infringement_type,
      additional_evidence: form.additional_evidence,
    });
    setResult(dmca);
    if (user) {
      await addDoc(collection(db, "dmca_cases"), { ...dmca, owner_uid: user.uid, asset_title: asset?.title ?? form.asset, platform: form.platform, status: "Pending" });
      await loadCases();
    }
  }

  async function updateStatus(id: string, status: string) {
    await updateDoc(doc(db, "dmca_cases", id), { status });
    await loadCases();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-black">DMCA Manager</h1><p className="text-slate-400">Claude-generated Section 512(c) notices and Firestore case tracking.</p></div>
        <div className="flex gap-2"><RealTimeBadge /><AIBadge /><FirestoreBadge /></div>
      </header>
      <div className="surface p-2">{(["file", "active", "history"] as const).map((item) => <button key={item} className={`rounded-md px-4 py-2 text-sm ${tab === item ? "bg-accent text-ink" : "text-slate-300"}`} onClick={() => setTab(item)}>{item === "file" ? "File Takedown" : item === "active" ? "Active Cases" : "History"}</button>)}</div>
      {tab === "file" && (
        <form className="grid gap-5 xl:grid-cols-2" onSubmit={submit}>
          <section className="surface space-y-3 p-5">
            <select className="field" value={form.asset} onChange={(e) => setForm({ ...form, asset: e.target.value })} required><option value="">Select your asset</option>{assets.map((asset) => <option key={asset.asset_id} value={asset.asset_id}>{asset.title}</option>)}</select>
            <input className="field" placeholder="Infringing URL" value={form.infringing_url} onChange={(e) => setForm({ ...form, infringing_url: e.target.value })} required />
            <input className="field" placeholder="Platform" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} required />
            <input className="field" placeholder="Infringement type" value={form.infringement_type} onChange={(e) => setForm({ ...form, infringement_type: e.target.value })} required />
            <input className="field" placeholder="Your name / organization" value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} required />
            <textarea className="field min-h-32" placeholder="Additional evidence" value={form.additional_evidence} onChange={(e) => setForm({ ...form, additional_evidence: e.target.value })} />
            <div className="flex flex-wrap gap-3"><button type="button" className="button-secondary" onClick={runAnalyze}>Analyze URL First</button><button className="button">Generate DMCA Notice</button></div>
          </section>
          <section className="surface p-5">
            {result ? (
              <div>
                <div className="flex flex-wrap gap-2 text-xs"><span>{result.case_id}</span><span>{result.word_count} words</span><AIBadge model={result.model_used} /></div>
                <article className="mt-4 whitespace-pre-wrap rounded-lg bg-white p-5 font-mono text-sm leading-7 text-slate-950">{result.notice_text}</article>
                <div className="mt-3 flex gap-3"><button type="button" className="button-secondary" onClick={() => navigator.clipboard.writeText(result.notice_text)}>Copy Notice</button><button type="button" className="button-secondary" onClick={() => downloadText(`${result.case_id}.txt`, result.notice_text)}>Download .txt</button></div>
              </div>
            ) : <p className="text-sm text-slate-400">Generated legal document text will appear here.</p>}
          </section>
        </form>
      )}
      {tab !== "file" && (
        <section className="surface p-5">
          <table className="w-full text-left text-sm"><thead className="text-slate-400"><tr><th className="p-2">Case</th><th>Asset</th><th>Platform</th><th>Status</th></tr></thead><tbody>
            {cases.map((item) => <tr key={item.id} className="border-t border-line"><td className="p-2">{item.case_id}</td><td>{item.asset_title}</td><td>{item.platform}</td><td><select className="field max-w-44" value={item.status} onChange={(e) => updateStatus(item.id, e.target.value)}>{["Pending", "Under Review", "Resolved"].map((s) => <option key={s}>{s}</option>)}</select></td></tr>)}
          </tbody></table>
        </section>
      )}
    </div>
  );
}
