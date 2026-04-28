import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { AIBadge, RealTimeBadge } from "@/components/Badges";
import { useAuth } from "@/context/AuthContext";
import { threatSeed, type ThreatSeed } from "@/data/threatSeed";
import { classifyThreat, getIpIntel } from "@/lib/api";
import { db } from "@/lib/firebase";
import type { IpIntelResult, ThreatClassification } from "@/lib/types";

export function ThreatsPage() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<ThreatSeed[]>(threatSeed);
  const [custom, setCustom] = useState("");
  const [classification, setClassification] = useState<ThreatClassification | null>(null);
  const [intel, setIntel] = useState<IpIntelResult | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const updates = await Promise.all(threatSeed.slice(0, 5).map(async (entry, index) => {
        const ref = doc(db, "users", user.uid, "threat_classifications", `seed-${index}`);
        const cached = await getDoc(ref);
        if (cached.exists()) return { ...entry, ...cached.data(), ai: true } as ThreatSeed;
        const ai = await classifyThreat(entry.raw_log);
        await setDoc(ref, ai);
        return { ...entry, threat_type: ai.threat_type, severity: ai.severity, status: ai.recommended_action, ai: true };
      }));
      setFeed([...updates, ...threatSeed.slice(5)]);
    })().catch(() => toast.error("Claude classification unavailable; showing labeled seed data."));
  }, [user]);

  async function classifyCustom() {
    setClassification(await classifyThreat(custom));
  }

  async function openIntel(ip: string) {
    setIntel(await getIpIntel(ip));
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-black">Threat Intelligence</h1><p className="text-slate-400">Hybrid: seed HTTP logs plus real Claude classification and real IP enrichment.</p></div>
        <div className="flex gap-2"><RealTimeBadge mode="SIMULATED" /><AIBadge /></div>
      </header>
      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="surface overflow-hidden p-5">
          <h2 className="text-xl font-bold">Threat Feed Table</h2>
          <p className="text-sm text-slate-400">Charts and unclassified rows are labeled sample dataset - 30-day simulation.</p>
          <div className="mt-4 max-h-[520px] overflow-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="sticky top-0 bg-panel text-slate-400"><tr><th className="p-2">Timestamp</th><th>IP</th><th>Type</th><th>Severity</th><th>Country</th><th>Status</th><th>AI</th></tr></thead>
              <tbody>
                {feed.map((entry, index) => (
                  <tr key={`${entry.ip}-${index}`} className="border-t border-line">
                    <td className="p-2">{new Date(entry.timestamp).toLocaleString()}</td>
                    <td><button className="text-accent underline" onClick={() => openIntel(entry.ip)}>{entry.ip}</button></td>
                    <td>{entry.threat_type}</td>
                    <td>{entry.severity}</td>
                    <td>{entry.country}</td>
                    <td>{entry.status}</td>
                    <td>{entry.ai ? "AI Classified" : "Seed"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-5">
          <section className="surface p-5">
            <h2 className="text-xl font-bold">Analyze Custom Log</h2>
            <textarea className="field mt-3 min-h-36" placeholder="Paste an HTTP log entry" value={custom} onChange={(e) => setCustom(e.target.value)} />
            <button className="button mt-3" onClick={classifyCustom} disabled={!custom}>Classify with AI</button>
            {classification && <pre className="mt-4 overflow-auto rounded bg-ink p-3 text-xs">{JSON.stringify(classification, null, 2)}</pre>}
          </section>
          {intel && (
            <section className="surface p-5">
              <h2 className="text-xl font-bold">IP Intelligence</h2>
              <div className="mt-3 space-y-2 text-sm">
                <p>Country: {intel.country ?? "unknown"}</p><p>City: {intel.city ?? "unknown"}</p><p>ISP: {intel.isp ?? "unknown"}</p>
                <p>Proxy: {intel.is_proxy ? "Yes" : "No"} | Hosting: {intel.is_hosting ? "Yes" : "No"}</p>
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
