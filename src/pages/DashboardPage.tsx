import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { ChartCard } from "@/components/ChartCard";
import { LiveFeedRow } from "@/components/LiveFeedRow";
import { StatCard } from "@/components/StatCard";
import { useSimulation } from "@/hooks/useSimulation";

const areaGradientId = "dashboard-threats-gradient";

export function DashboardPage() {
  const { analytics, assets, threats, dmcaCases, blockThreat, fileDmcaFromThreat } = useSimulation();
  const [paused, setPaused] = useState(false);
  const [displayThreats, setDisplayThreats] = useState(threats.slice(0, 6));

  useEffect(() => {
    if (!paused) {
      setDisplayThreats(threats.slice(0, 6));
    }
  }, [threats, paused]);

  const thirtyDay = analytics.slice(-30);
  const assetBreakdown = useMemo(() => {
    const counts = assets.reduce<Record<string, number>>((accumulator, asset) => {
      accumulator[asset.type] = (accumulator[asset.type] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [assets]);

  const recentActions = dmcaCases.slice(0, 5).map((item) => ({
    id: item.id,
    label: item.status,
    title: `${item.assetName} · ${item.platform}`,
    description: item.timeline[item.timeline.length - 1]?.note ?? item.notice,
  }));

  const mapPoints = [
    { city: "Berlin", x: 54, y: 32, tone: "danger" },
    { city: "Amsterdam", x: 50, y: 31, tone: "warn" },
    { city: "Singapore", x: 80, y: 58, tone: "accent" },
    { city: "Toronto", x: 25, y: 29, tone: "primary" },
    { city: "London", x: 48, y: 28, tone: "danger" },
    { city: "Bucharest", x: 58, y: 35, tone: "accent" },
    { city: "Hong Kong", x: 83, y: 46, tone: "warn" },
    { city: "Dallas", x: 21, y: 36, tone: "primary" },
    { city: "Warsaw", x: 57, y: 28, tone: "danger" },
    { city: "Paris", x: 49, y: 30, tone: "accent" },
    { city: "Kyiv", x: 60, y: 29, tone: "warn" },
    { city: "Stockholm", x: 54, y: 22, tone: "primary" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assets Protected" value={1247} detail="↑12% this week" trend="Healthy growth" sparkline={[18, 22, 24, 28, 31, 33, 37]} />
        <StatCard label="Threats Neutralized" value={89} detail="↑5% this week" trend="Mitigation pace up" sparkline={[14, 16, 15, 18, 20, 23, 22]} accent="#ef4444" />
        <StatCard label="DMCA Filed" value={34} detail="This month" trend="Automation active" sparkline={[5, 8, 7, 9, 12, 13, 16]} accent="#22d3ee" />
        <StatCard label="Detection Accuracy" value={"98.7"} suffix="%" detail="Stable" trend="Model calibrated" sparkline={[94, 95, 96, 97, 97.5, 98.1, 98.7]} accent="#10b981" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <ChartCard title="Threat Activity" subtitle="30-day detected vs resolved threat volume">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={thirtyDay}>
                <defs>
                  <linearGradient id={areaGradientId} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="dashboard-resolved-gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: "#111118", border: "1px solid #2A2A3A", borderRadius: 16, color: "#E2E8F0" }}
                />
                <Area type="monotone" dataKey="threats" stroke="#ef4444" fill={`url(#${areaGradientId})`} strokeWidth={2.5} />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="url(#dashboard-resolved-gradient)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Live Threat Log"
          subtitle="Auto-appending intelligence feed"
          action={
            <button
              type="button"
              onClick={() => setPaused((current) => !current)}
              className="rounded-full border border-aegis-border px-3 py-1.5 text-sm text-aegis-text transition hover:border-aegis-primary/30"
            >
              {paused ? "Resume Feed" : "Pause Feed"}
            </button>
          }
        >
          <div className="space-y-3">
            {displayThreats.map((threat) => (
              <LiveFeedRow
                key={threat.id}
                threat={threat}
                compact
                onBlock={() => blockThreat(threat.id)}
                onDmca={() => fileDmcaFromThreat(threat.id)}
              />
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr_1fr]">
        <ChartCard title="Asset Type Breakdown" subtitle="Protected inventory composition">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={assetBreakdown} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4}>
                  {assetBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={["#6366F1", "#22D3EE", "#10B981", "#F59E0B", "#EF4444"][index % 5]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: "#111118", border: "1px solid #2A2A3A", borderRadius: 16, color: "#E2E8F0" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Geographic Threat Map" subtitle="Recent origin clusters">
          <div className="relative overflow-hidden rounded-2xl border border-aegis-border bg-gradient-to-br from-aegis-surface to-aegis-card p-4">
            <svg viewBox="0 0 800 380" className="w-full">
              <path d="M80 180c50-90 140-130 250-135 70-5 130 10 170 50 45 40 55 85 105 97 75 18 125 34 155 92-50 38-120 48-182 42-70-7-127-38-178-48-70-13-100 9-152 4-60-6-105-40-134-102-18-40-18-64-34-100Z" fill="rgba(255,255,255,0.03)" stroke="rgba(99,102,241,0.14)" />
              {mapPoints.map((point, index) => (
                <g key={point.city}>
                  <circle cx={`${point.x}%`} cy={`${point.y}%`} r="8" fill={point.tone === "danger" ? "#EF4444" : point.tone === "warn" ? "#F59E0B" : point.tone === "accent" ? "#22D3EE" : "#6366F1"} opacity="0.9">
                    <animate attributeName="r" values="6;14;6" dur={`${1.7 + index * 0.1}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0.25;0.9" dur={`${1.7 + index * 0.1}s`} repeatCount="indefinite" />
                  </circle>
                </g>
              ))}
            </svg>
          </div>
        </ChartCard>

        <ChartCard title="Recent Actions" subtitle="Latest DMCA and enforcement activity">
          <div className="space-y-4">
            {recentActions.map((action) => (
              <div key={action.id} className="rounded-2xl border border-aegis-border bg-aegis-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-aegis-accent">{action.label}</div>
                <div className="mt-2 text-sm font-semibold text-white">{action.title}</div>
                <div className="mt-2 text-sm text-aegis-text/70">{action.description}</div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
