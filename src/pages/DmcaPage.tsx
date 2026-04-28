import { Fragment, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ScanPipeline } from "@/components/ScanPipeline";
import { useSimulation } from "@/hooks/useSimulation";
import { dmcaPipeline, generateDmcaNotice } from "@/features/dmca/templates";

type DmcaTab = "file" | "active" | "history";

export function DmcaPage() {
  const { assets, dmcaCases, addDmcaCase, dmcaDemoNonce } = useSimulation();
  const [tab, setTab] = useState<DmcaTab>("file");
  const [assetId, setAssetId] = useState(assets[0]?.id ?? "");
  const [url, setUrl] = useState("https://mirrorclips.cc/tactics-room");
  const [platform, setPlatform] = useState("YouTube");
  const [type, setType] = useState("Unauthorized Distribution");
  const [evidence, setEvidence] = useState("Gemini verification confirmed a 94.8% match with re-encoding artifacts.");
  const [currentStep, setCurrentStep] = useState(-1);
  const [complete, setComplete] = useState(false);
  const [notice, setNotice] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const selectedAsset = useMemo(() => assets.find((asset) => asset.id === assetId) ?? assets[0], [assetId, assets]);

  const runSubmission = (demo = false) => {
    setTab("file");
    setCurrentStep(0);
    setComplete(false);
    setNotice("");
    let elapsed = 0;
    dmcaPipeline.forEach((step, index) => {
      window.setTimeout(() => setCurrentStep(index), elapsed);
      elapsed += step.duration;
    });
    window.setTimeout(() => {
      const generated = generateDmcaNotice({
        assetName: selectedAsset.name,
        url,
        platform,
        type,
        evidence,
        fingerprint: selectedAsset.fingerprint,
      });
      setNotice(generated);
      setComplete(true);
      addDmcaCase({
        assetId: selectedAsset.id,
        assetName: selectedAsset.name,
        platform,
        infringingUrl: url,
        filedDate: new Date().toISOString(),
        status: "Pending",
        expectedResolution: demo ? "Within 4 hours" : "Within 12 hours",
        infringementType: type,
        notice: generated,
      });
    }, elapsed + 150);
  };

  useEffect(() => {
    if (dmcaDemoNonce > 0) {
      setUrl("https://demo-threats.example/mirror/ucl-opening-cut");
      setPlatform("Google");
      setType("Exact Copy");
      setEvidence("Demo Mode generated a verified near-exact match with supporting blockchain proof.");
      runSubmission(true);
    }
  }, [dmcaDemoNonce]);

  const activeCases = dmcaCases.filter((item) => item.status !== "Content Removed");
  const historyCases = dmcaCases.filter((item) => item.status === "Content Removed");

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-aegis-border bg-aegis-card p-6">
        <div className="flex flex-wrap gap-3">
          {[
            ["file", "File Takedown"],
            ["active", "Active Cases"],
            ["history", "History"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key as DmcaTab)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${tab === key ? "bg-aegis-primary text-white shadow-glow" : "border border-aegis-border text-aegis-text/70"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "file" ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-aegis-text/80">Your Asset</span>
                <select value={assetId} onChange={(event) => setAssetId(event.target.value)} className="w-full rounded-2xl border border-aegis-border bg-aegis-black/30 px-4 py-3 text-aegis-text outline-none">
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>{asset.name}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-aegis-text/80">Infringing URL</span>
                <input value={url} onChange={(event) => setUrl(event.target.value)} className="w-full rounded-2xl border border-aegis-border bg-aegis-black/30 px-4 py-3 text-aegis-text outline-none" />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-aegis-text/80">Platform</span>
                  <select value={platform} onChange={(event) => setPlatform(event.target.value)} className="w-full rounded-2xl border border-aegis-border bg-aegis-black/30 px-4 py-3 text-aegis-text outline-none">
                    {["YouTube", "Google", "Twitter", "Custom"].map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-aegis-text/80">Infringement Type</span>
                  <select value={type} onChange={(event) => setType(event.target.value)} className="w-full rounded-2xl border border-aegis-border bg-aegis-black/30 px-4 py-3 text-aegis-text outline-none">
                    {["Exact Copy", "Derivative Work", "Unauthorized Distribution"].map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="space-y-2">
                <span className="text-sm font-medium text-aegis-text/80">Additional Evidence</span>
                <textarea value={evidence} onChange={(event) => setEvidence(event.target.value)} rows={5} className="w-full rounded-2xl border border-aegis-border bg-aegis-black/30 px-4 py-3 text-aegis-text outline-none" />
              </label>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => runSubmission()}
                className="rounded-2xl bg-aegis-primary px-5 py-3 font-semibold text-white shadow-glow"
              >
                Generate & File Takedown
              </motion.button>
            </div>

            <div className="space-y-6">
              <ScanPipeline steps={dmcaPipeline} currentStep={Math.max(currentStep, 0)} completed={complete} />
              {notice ? (
                <div className="rounded-3xl border border-aegis-border bg-aegis-black/25 p-5">
                  <div className="text-lg font-semibold text-white">Generated Notice</div>
                  <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-aegis-border bg-aegis-surface p-4 font-mono text-xs leading-6 text-aegis-text/80">
                    {notice}
                  </pre>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {tab !== "file" ? (
          <div className="mt-6 space-y-4">
            {tab === "history" ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: "Successful", value: 47 },
                  { label: "Appealed", value: 3 },
                  { label: "Withdrawn", value: 1 },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-aegis-border bg-aegis-black/20 p-4">
                    <div className="text-sm text-aegis-muted">{item.label}</div>
                    <div className="mt-2 text-3xl font-bold text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="overflow-hidden rounded-2xl border border-aegis-border">
              <table className="min-w-full divide-y divide-aegis-border text-sm">
                <thead className="bg-aegis-black/20 text-left text-aegis-muted">
                  <tr>
                    <th className="px-4 py-3">Case ID</th>
                    <th className="px-4 py-3">Asset</th>
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3">Filed Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Expected Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aegis-border">
                  {(tab === "active" ? activeCases : historyCases).map((item) => (
                    <Fragment key={item.id}>
                      <tr key={item.id} className="cursor-pointer transition hover:bg-aegis-primary/5" onClick={() => setExpandedId((current) => (current === item.id ? null : item.id))}>
                        <td className="px-4 py-3 font-mono text-aegis-accent">{item.id}</td>
                        <td className="px-4 py-3 text-aegis-text">{item.assetName}</td>
                        <td className="px-4 py-3 text-aegis-muted">{item.platform}</td>
                        <td className="px-4 py-3 text-aegis-muted">{new Date(item.filedDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-aegis-primary">{item.status}</td>
                        <td className="px-4 py-3 text-aegis-text/70">{item.expectedResolution}</td>
                      </tr>
                      {expandedId === item.id ? (
                        <tr>
                          <td colSpan={6} className="bg-aegis-black/20 px-4 py-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <div className="text-sm font-semibold text-white">Case timeline</div>
                                <div className="mt-3 space-y-3">
                                  {item.timeline.map((step) => (
                                    <div key={`${item.id}-${step.label}`} className="rounded-2xl border border-aegis-border bg-aegis-card p-3">
                                      <div className="text-sm font-medium text-white">{step.label}</div>
                                      <div className="mt-1 text-xs font-mono text-aegis-accent">{step.at}</div>
                                      <div className="mt-2 text-sm text-aegis-text/70">{step.note}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-white">Notice summary</div>
                                <div className="mt-3 rounded-2xl border border-aegis-border bg-aegis-card p-4 text-sm text-aegis-text/70">
                                  {item.notice}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
