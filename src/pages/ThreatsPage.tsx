import { useMemo, useState } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "@/components/ChartCard";
import { ThreatBadge } from "@/components/ThreatBadge";
import { useThreatFeed } from "@/hooks/useThreatFeed";
import type { ThreatSeverity, ThreatType } from "@/lib/types";

const severities: Array<ThreatSeverity | "ALL"> = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];
const threatTypes: Array<ThreatType | "ALL"> = ["ALL", "IP Scraper", "Content Bot", "Deepfake Generator", "Unauthorized API Access", "Proxy Crawler", "DMCA Evader", "Adversarial Probe"];

export function ThreatsPage() {
  const [severity, setSeverity] = useState<ThreatSeverity | "ALL">("ALL");
  const [type, setType] = useState<ThreatType | "ALL">("ALL");
  const [query, setQuery] = useState("");

  const { filteredThreats, threats, blockedIps, blockThreat, fileDmcaFromThreat } = useThreatFeed({ severity, type, query });

  const stats = useMemo(
    () => ({
      active: threats.filter((entry) => entry.status === "ACTIVE").length,
      bots: threats.filter((entry) => entry.type === "Content Bot" || entry.type === "IP Scraper").length,
      responseTime: "2.1m",
    }),
    [threats],
  );

  const regionBreakdown = [
    { region: "Americas", value: 24 },
    { region: "Europe", value: 41 },
    { region: "Asia", value: 18 },
    { region: "Other", value: 7 },
  ];

  const typeDistribution = useMemo(() => {
    const grouped = threats.reduce<Record<string, number>>((accumulator, threat) => {
      accumulator[threat.type] = (accumulator[threat.type] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [threats]);

  const attackTimeline = Array.from({ length: 24 }, (_, index) => ({
    hour: `${index}:00`,
    attacks: 4 + ((index * 3) % 11) + (index > 18 ? 5 : 0),
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active Threats", value: stats.active, accent: "text-aegis-danger" },
          { label: "Blocked IPs", value: blockedIps, accent: "text-aegis-success" },
          { label: "Scraper Bots Detected", value: stats.bots, accent: "text-aegis-primary" },
          { label: "Avg Response Time", value: stats.responseTime, accent: "text-aegis-accent" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-aegis-border bg-aegis-card p-5 transition hover:scale-[1.02] hover:shadow-glow">
            <div className="text-sm text-aegis-muted">{card.label}</div>
            <div className={`mt-3 text-3xl font-bold text-white ${card.accent}`}>{card.value}</div>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-aegis-border bg-aegis-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
          <select value={severity} onChange={(event) => setSeverity(event.target.value as ThreatSeverity | "ALL")} className="rounded-2xl border border-aegis-border bg-aegis-black/30 px-4 py-3 text-aegis-text outline-none">
            {severities.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select value={type} onChange={(event) => setType(event.target.value as ThreatType | "ALL")} className="rounded-2xl border border-aegis-border bg-aegis-black/30 px-4 py-3 text-aegis-text outline-none">
            {threatTypes.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by IP or asset"
            className="flex-1 rounded-2xl border border-aegis-border bg-aegis-black/30 px-4 py-3 text-aegis-text outline-none"
          />
          <button type="button" className="rounded-2xl border border-aegis-border px-4 py-3 text-sm text-aegis-text">
            Last 24h
          </button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.65fr_0.9fr]">
        <ChartCard title="Live Threat Feed" subtitle="Auto-updating SOC-style intelligence stream">
          <div className="overflow-hidden rounded-2xl border border-aegis-border">
            <table className="min-w-full divide-y divide-aegis-border text-sm">
              <thead className="bg-aegis-black/20 text-left text-aegis-muted">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Threat Type</th>
                  <th className="px-4 py-3">Source IP</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Target Asset</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aegis-border">
                {filteredThreats.slice(0, 12).map((threat) => (
                  <tr key={threat.id} className="transition hover:bg-aegis-primary/5">
                    <td className="px-4 py-3 font-mono text-aegis-accent">{new Date(threat.timestamp).toLocaleTimeString()}</td>
                    <td className="px-4 py-3 text-aegis-text">{threat.type}</td>
                    <td className="px-4 py-3 font-mono text-aegis-text/75">{threat.ip}</td>
                    <td className="px-4 py-3">{threat.countryCode}</td>
                    <td className="px-4 py-3"><ThreatBadge severity={threat.severity} /></td>
                    <td className="px-4 py-3 text-aegis-text/75">{threat.targetAsset}</td>
                    <td className="px-4 py-3 text-aegis-muted">{threat.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => blockThreat(threat.id)} className="rounded-xl border border-aegis-success/30 px-3 py-2 text-xs text-aegis-success transition hover:bg-aegis-success/10">
                          Block IP
                        </button>
                        <button type="button" onClick={() => fileDmcaFromThreat(threat.id)} className="rounded-xl border border-aegis-danger/30 px-3 py-2 text-xs text-aegis-danger transition hover:bg-aegis-danger/10">
                          File DMCA
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

        <div className="space-y-6">
          <ChartCard title="Threat Origin Map" subtitle="Regional clustering">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionBreakdown} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="region" width={90} stroke="#64748B" />
                  <RechartsTooltip contentStyle={{ backgroundColor: "#111118", border: "1px solid #2A2A3A", borderRadius: 16 }} />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} fill="#22D3EE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Threat Type Distribution" subtitle="Current feed composition">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeDistribution} dataKey="value" innerRadius={48} outerRadius={76}>
                    {typeDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={["#ef4444", "#6366f1", "#22d3ee", "#10b981", "#f59e0b", "#818cf8", "#fb7185"][index % 7]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: "#111118", border: "1px solid #2A2A3A", borderRadius: 16 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Attack Timeline" subtitle="Last 24h activity buckets">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attackTimeline}>
                  <XAxis dataKey="hour" stroke="#64748B" tick={{ fontSize: 11 }} interval={3} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: "#111118", border: "1px solid #2A2A3A", borderRadius: 16 }} />
                  <Bar dataKey="attacks" radius={[8, 8, 0, 0]} fill="#6366F1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
