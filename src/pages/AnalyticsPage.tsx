import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "@/components/ChartCard";
import { useSimulation } from "@/hooks/useSimulation";

type RangeKey = "7d" | "30d" | "90d";

export function AnalyticsPage() {
  const { analytics, countries, assets } = useSimulation();
  const [range, setRange] = useState<RangeKey>("30d");

  const filtered = useMemo(() => {
    const slice = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    return analytics.slice(-slice);
  }, [analytics, range]);

  const platformBars = [
    { platform: "YouTube", value: 18 },
    { platform: "Google", value: 10 },
    { platform: "Twitter", value: 5 },
    { platform: "Other", value: 4 },
  ];

  const assetTypes = useMemo(() => {
    const counts = assets.reduce<Record<string, number>>((accumulator, asset) => {
      accumulator[asset.type] = (accumulator[asset.type] ?? 0) + 1;
      return accumulator;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [assets]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-aegis-border bg-aegis-card p-6">
        <div className="flex flex-wrap gap-3">
          {[
            ["7d", "Last 7d"],
            ["30d", "Last 30d"],
            ["90d", "Last 90d"],
            ["custom", "Custom"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => key !== "custom" && setRange(key as RangeKey)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${range === key ? "bg-aegis-primary text-white shadow-glow" : "border border-aegis-border text-aegis-text/70"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <ChartCard title="Daily threat volume" subtitle="Detected vs resolved over the selected period">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filtered}>
              <defs>
                <linearGradient id="analytics-threats" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.04} />
                </linearGradient>
                <linearGradient id="analytics-resolved" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(99,102,241,0.1)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#64748B", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} />
              <RechartsTooltip contentStyle={{ backgroundColor: "#111118", border: "1px solid #2A2A3A", borderRadius: 16 }} />
              <Legend />
              <Area type="monotone" dataKey="threats" stroke="#ef4444" fill="url(#analytics-threats)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="url(#analytics-resolved)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Takedowns by platform" subtitle="Filed case distribution">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformBars}>
                <CartesianGrid stroke="rgba(99,102,241,0.1)" vertical={false} />
                <XAxis dataKey="platform" tick={{ fill: "#64748B", fontSize: 11 }} />
                <YAxis tick={{ fill: "#64748B", fontSize: 11 }} />
                <RechartsTooltip contentStyle={{ backgroundColor: "#111118", border: "1px solid #2A2A3A", borderRadius: 16 }} />
                <Bar dataKey="value" fill="#6366F1" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Model accuracy over time" subtitle="Training and index refresh effect">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filtered}>
                <CartesianGrid stroke="rgba(99,102,241,0.1)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#64748B", fontSize: 11 }} hide={range === "90d"} />
                <YAxis domain={[92, 100]} tick={{ fill: "#64748B", fontSize: 11 }} />
                <RechartsTooltip contentStyle={{ backgroundColor: "#111118", border: "1px solid #2A2A3A", borderRadius: 16 }} />
                <Line type="monotone" dataKey="accuracy" stroke="#22D3EE" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Asset types registered" subtitle="Protected inventory mix">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={assetTypes} dataKey="value" innerRadius={60} outerRadius={100}>
                  {assetTypes.map((entry, index) => (
                    <Cell key={entry.name} fill={["#6366F1", "#22D3EE", "#10B981", "#F59E0B", "#EF4444"][index % 5]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: "#111118", border: "1px solid #2A2A3A", borderRadius: 16 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Threat origins by country" subtitle="Top eight source regions">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countries.slice(0, 8)}>
                <CartesianGrid stroke="rgba(99,102,241,0.1)" vertical={false} />
                <XAxis dataKey="code" tick={{ fill: "#64748B", fontSize: 11 }} />
                <YAxis tick={{ fill: "#64748B", fontSize: 11 }} />
                <RechartsTooltip contentStyle={{ backgroundColor: "#111118", border: "1px solid #2A2A3A", borderRadius: 16 }} />
                <Bar dataKey="threats" fill="#EF4444" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Revenue protected estimate" subtitle="Cumulative line plus daily threat bars">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={filtered}>
              <CartesianGrid stroke="rgba(99,102,241,0.1)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#64748B", fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fill: "#64748B", fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748B", fontSize: 11 }} />
              <RechartsTooltip contentStyle={{ backgroundColor: "#111118", border: "1px solid #2A2A3A", borderRadius: 16 }} />
              <Legend />
              <Bar yAxisId="left" dataKey="threats" fill="#6366F1" radius={[8, 8, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="revenueProtected" stroke="#22D3EE" strokeWidth={3} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid gap-4 xl:grid-cols-3">
        {[
          "Threat volume increased 23% this week — primarily scraper bots targeting your image assets.",
          "Your DMCA success rate (94.1%) is above the platform average of 71%.",
          "Model confidence improved after last Tuesday's index refresh.",
        ].map((insight) => (
          <div key={insight} className="rounded-2xl border border-aegis-border bg-aegis-card p-5 text-sm leading-6 text-aegis-text/75">
            {insight}
          </div>
        ))}
      </div>
    </div>
  );
}
