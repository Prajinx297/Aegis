import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FirestoreBadge, RealTimeBadge } from "@/components/Badges";
import { useAuth } from "@/context/AuthContext";
import { getAssets } from "@/lib/api";
import { db } from "@/lib/firebase";
import type { Asset } from "@/lib/types";

export function AnalyticsPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [cases, setCases] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    getAssets().then(setAssets).catch(() => setAssets([]));
    if (user) getDocs(query(collection(db, "dmca_cases"), where("owner_uid", "==", user.uid))).then((snap) => setCases(snap.docs.map((d) => d.data() as Record<string, string>)));
  }, [user]);

  const assetsOverTime = useMemo(() => Object.values(assets.reduce<Record<string, { date: string; assets: number }>>((acc, asset) => {
    const date = asset.registered_at ? new Date(String(asset.registered_at)).toLocaleDateString() : "Today";
    acc[date] = acc[date] ?? { date, assets: 0 };
    acc[date].assets += 1;
    return acc;
  }, {})), [assets]);
  const assetTypes = useMemo(() => Object.values(assets.reduce<Record<string, { name: string; value: number }>>((acc, asset) => {
    acc[asset.asset_type] = acc[asset.asset_type] ?? { name: asset.asset_type, value: 0 };
    acc[asset.asset_type].value += 1;
    return acc;
  }, {})), [assets]);
  const statusData = useMemo(() => Object.values(cases.reduce<Record<string, { status: string; count: number }>>((acc, item) => {
    const status = item.status || "Pending";
    acc[status] = acc[status] ?? { status, count: 0 };
    acc[status].count += 1;
    return acc;
  }, {})), [cases]);
  const platformData = useMemo(() => Object.values(cases.reduce<Record<string, { platform: string; count: number }>>((acc, item) => {
    const platform = item.platform || "Unknown";
    acc[platform] = acc[platform] ?? { platform, count: 0 };
    acc[platform].count += 1;
    return acc;
  }, {})), [cases]);
  const projection = Array.from({ length: 7 }, (_, i) => ({ day: `D${i + 1}`, threats: 8 + i * i + assets.length }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-black">Analytics</h1><p className="text-slate-400">Asset data: Live from Firestore | Threat data: Illustrative</p></div>
        <div className="flex gap-2"><FirestoreBadge /><RealTimeBadge mode="SIMULATED" /></div>
      </header>
      <div className="grid gap-5 xl:grid-cols-2">
        <Chart title="My Assets Over Time" live><ResponsiveContainer height={260}><AreaChart data={assetsOverTime}><CartesianGrid stroke="#243047" /><XAxis dataKey="date" /><YAxis allowDecimals={false} /><Tooltip /><Area dataKey="assets" stroke="#2dd4bf" fill="#2dd4bf55" /></AreaChart></ResponsiveContainer></Chart>
        <Chart title="Asset Types" live><ResponsiveContainer height={260}><PieChart><Pie data={assetTypes} dataKey="value" nameKey="name" outerRadius={95}>{assetTypes.map((_, i) => <Cell key={i} fill={["#2dd4bf", "#60a5fa", "#f59e0b", "#fb7185"][i % 4]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></Chart>
        <Chart title="DMCA Cases by Status" live><ResponsiveContainer height={260}><BarChart data={statusData}><CartesianGrid stroke="#243047" /><XAxis dataKey="status" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#2dd4bf" /></BarChart></ResponsiveContainer></Chart>
        <Chart title="DMCA Cases by Platform" live><ResponsiveContainer height={260}><BarChart data={platformData}><CartesianGrid stroke="#243047" /><XAxis dataKey="platform" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#60a5fa" /></BarChart></ResponsiveContainer></Chart>
        <Chart title="Threat Volume Projection - Illustrative simulation"><ResponsiveContainer height={260}><AreaChart data={projection}><CartesianGrid stroke="#243047" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Area dataKey="threats" stroke="#f59e0b" fill="#f59e0b44" /></AreaChart></ResponsiveContainer></Chart>
        <Chart title="Industry Threat Benchmarks - Market research data"><div className="grid gap-3 p-4">{["Image scraping", "Model training misuse", "Marketplace reposting", "DMCA evasion"].map((name, i) => <div key={name}><div className="flex justify-between text-sm"><span>{name}</span><span>{[72, 64, 48, 37][i]}%</span></div><div className="mt-2 h-2 rounded bg-ink"><div className="h-2 rounded bg-accent" style={{ width: `${[72, 64, 48, 37][i]}%` }} /></div></div>)}</div></Chart>
      </div>
    </div>
  );
}

function Chart({ title, children, live = false }: { title: string; children: React.ReactNode; live?: boolean }) {
  return <section className="surface p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold">{title}</h2><RealTimeBadge mode={live ? "CACHED" : "SIMULATED"} /></div>{children}</section>;
}
