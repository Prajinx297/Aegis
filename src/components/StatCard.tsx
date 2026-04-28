import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Sparkline } from "@/components/Sparkline";
import { formatNumber } from "@/lib/format";

interface StatCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  detail: string;
  trend: string;
  sparkline: number[];
  accent?: string;
}

export function StatCard({ label, value, suffix, detail, trend, sparkline, accent = "#6366F1" }: StatCardProps) {
  const display = typeof value === "number" ? formatNumber(value) : value;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl border border-aegis-border bg-aegis-card p-5 transition hover:shadow-glow"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-aegis-muted">{label}</div>
          <div className="mt-3 flex items-end gap-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            <span>{display}</span>
            {suffix ? <span className="pb-1 text-base text-aegis-text/60">{suffix}</span> : null}
          </div>
          <div className="mt-2 text-sm text-aegis-text/70">{detail}</div>
        </div>
        <div className="rounded-full bg-aegis-primary/10 p-2 text-aegis-primary">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4">
        <Sparkline values={sparkline} color={accent} />
      </div>
      <div className="mt-2 text-xs font-medium text-aegis-success">{trend}</div>
    </motion.div>
  );
}
