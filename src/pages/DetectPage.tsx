import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Cell,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { ChartCard } from "@/components/ChartCard";
import { ScanPipeline } from "@/components/ScanPipeline";
import { useSimulation } from "@/hooks/useSimulation";
import { detectMatches, detectScanSteps } from "@/features/detect/scanEngine";

export function DetectPage() {
  const { detectDemoNonce, watchDomains, addWatchDomain, pushToast } = useSimulation();
  const [mode, setMode] = useState<"url" | "file">("url");
  const [url, setUrl] = useState("https://mirrorclips.cc/finals/day-24");
  const [watchDomain, setWatchDomain] = useState("");
  const [currentStep, setCurrentStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);

  const scanResult = useMemo(
    () => ({
      score: 87.3,
      infringements: 3,
    }),
    [],
  );

  const runScan = () => {
    setRunning(true);
    setComplete(false);
    setResultVisible(false);
    let elapsed = 0;
    detectScanSteps.forEach((step, index) => {
      window.setTimeout(() => setCurrentStep(index), elapsed);
      elapsed += step.duration;
    });
    window.setTimeout(() => {
      setCurrentStep(detectScanSteps.length);
      setRunning(false);
      setComplete(true);
      setResultVisible(true);
      pushToast({
        tone: "success",
        title: "Scan complete",
        description: "AEGIS finished the similarity analysis and found 3 suspicious matches.",
      });
    }, elapsed + 120);
  };

  useEffect(() => {
    if (detectDemoNonce > 0) {
      setMode("url");
      setUrl("https://demo-threats.example/ucl-clip-archive");
      runScan();
    }
  }, [detectDemoNonce]);

  const resultData = [{ name: "match", value: scanResult.score, fill: "#ef4444" }];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-aegis-border bg-aegis-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          {[
            { id: "url", label: "URL Scan" },
            { id: "file", label: "File Upload" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id as "url" | "file")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === tab.id
                  ? "bg-aegis-primary text-white shadow-glow"
                  : "border border-aegis-border text-aegis-text/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            {mode === "url" ? (
              <>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-aegis-text/80">Enter a URL to scan for infringement</span>
                  <input
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    className="w-full rounded-2xl border border-aegis-border bg-aegis-black/30 px-4 py-3 text-aegis-text outline-none"
                  />
                </label>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={runScan}
                  disabled={running}
                  className="rounded-2xl bg-aegis-primary px-5 py-3 font-semibold text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {running ? "Scanning..." : "Scan Now"}
                </motion.button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={runScan}
                  className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-aegis-primary/30 bg-aegis-primary/5 px-6 py-12 text-center transition hover:border-aegis-primary hover:shadow-glow"
                >
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">Drop a suspected copy here</div>
                  <div className="mt-2 text-sm text-aegis-muted">AEGIS will compare it against your fingerprinted originals.</div>
                </button>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-aegis-border bg-aegis-black/20 p-4">
                    <div className="text-sm font-medium text-white">Your Original</div>
                    <div className="mt-3 h-48 rounded-2xl bg-gradient-to-br from-aegis-primary/20 to-aegis-accent/10" />
                  </div>
                  <div className="rounded-3xl border border-aegis-border bg-aegis-black/20 p-4">
                    <div className="text-sm font-medium text-white">Suspected Copy</div>
                    <div className="mt-3 h-48 rounded-2xl bg-gradient-to-br from-aegis-danger/20 to-aegis-warn/10" />
                    <div className="pointer-events-none relative -mt-48 h-48 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(239,68,68,0.35),transparent_22%),radial-gradient(circle_at_72%_64%,rgba(245,158,11,0.32),transparent_20%)]" />
                  </div>
                </div>
              </>
            )}

            <ChartCard title="Bulk Scan Panel" subtitle="Monitor domains with scheduled scans">
              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  value={watchDomain}
                  onChange={(event) => setWatchDomain(event.target.value)}
                  className="flex-1 rounded-2xl border border-aegis-border bg-aegis-black/30 px-4 py-3 text-aegis-text outline-none"
                  placeholder="Add domain to watchlist"
                />
                <button
                  type="button"
                  onClick={() => {
                    addWatchDomain(watchDomain);
                    setWatchDomain("");
                  }}
                  className="rounded-2xl border border-aegis-primary/30 px-4 py-3 text-sm font-medium text-aegis-primary transition hover:bg-aegis-primary/10"
                >
                  Add Domain
                </button>
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-aegis-border">
                <table className="min-w-full divide-y divide-aegis-border text-sm">
                  <thead className="bg-aegis-black/20 text-left text-aegis-muted">
                    <tr>
                      <th className="px-4 py-3">Domain</th>
                      <th className="px-4 py-3">Last Scanned</th>
                      <th className="px-4 py-3">Threats Found</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-aegis-border">
                    {watchDomains.map((domain) => (
                      <tr key={domain.id} className="transition hover:bg-aegis-primary/5">
                        <td className="px-4 py-3 text-aegis-text">{domain.domain}</td>
                        <td className="px-4 py-3 text-aegis-muted">{domain.lastScanned}</td>
                        <td className="px-4 py-3 text-aegis-text">{domain.threatsFound}</td>
                        <td className="px-4 py-3 text-aegis-accent">{domain.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>

          <div className="space-y-6">
            <ChartCard title="Scan Pipeline" subtitle="The analysis stages always execute sequentially">
              <ScanPipeline steps={detectScanSteps} currentStep={Math.max(currentStep, 0)} completed={complete} />
            </ChartCard>

            <AnimatePresence>
              {resultVisible ? (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                  <ChartCard title="Match Confidence" subtitle="Large radial score for the strongest evidence hit">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                          cx="50%"
                          cy="50%"
                          innerRadius="55%"
                          outerRadius="85%"
                          barSize={18}
                          data={resultData}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <RadialBar background dataKey="value" cornerRadius={18} />
                          <RechartsTooltip
                            contentStyle={{ backgroundColor: "#111118", border: "1px solid #2A2A3A", borderRadius: 16, color: "#E2E8F0" }}
                          />
                          <Cell fill="#ef4444" />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="-mt-28 text-center">
                      <div className="text-4xl font-bold text-white">{scanResult.score}%</div>
                      <div className="mt-2 text-sm text-aegis-muted">Infringing Assets Found: <span className="font-semibold text-aegis-danger">{scanResult.infringements}</span></div>
                    </div>
                  </ChartCard>

                  <ChartCard title="Detected Matches" subtitle="Actionable candidates ranked by similarity">
                    <div className="overflow-hidden rounded-2xl border border-aegis-border">
                      <table className="min-w-full divide-y divide-aegis-border text-sm">
                        <thead className="bg-aegis-black/20 text-left text-aegis-muted">
                          <tr>
                            <th className="px-4 py-3">Thumbnail</th>
                            <th className="px-4 py-3">Your Asset</th>
                            <th className="px-4 py-3">Similarity</th>
                            <th className="px-4 py-3">Match Type</th>
                            <th className="px-4 py-3">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-aegis-border">
                          {detectMatches.map((match) => (
                            <tr key={match.id} className="transition hover:bg-aegis-primary/5">
                              <td className="px-4 py-3">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-aegis-primary/25 to-aegis-danger/20" />
                              </td>
                              <td className="px-4 py-3 text-aegis-text">{match.assetName}</td>
                              <td className="px-4 py-3 text-aegis-accent">{match.similarity}%</td>
                              <td className="px-4 py-3 text-aegis-muted">{match.matchType}</td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  className="rounded-xl border border-aegis-danger/30 px-3 py-2 text-aegis-danger transition hover:bg-aegis-danger/10"
                                >
                                  Escalate
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ChartCard>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
