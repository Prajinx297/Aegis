import { motion } from "framer-motion";
import type { PropsWithChildren, ReactNode } from "react";

interface ChartCardProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function ChartCard({ title, subtitle, action, children }: ChartCardProps) {
  return (
    <motion.section
      whileHover={{ scale: 1.01 }}
      className="rounded-2xl border border-aegis-border bg-aegis-card p-5 shadow-[0_0_30px_rgba(99,102,241,0.08)] transition"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-aegis-muted">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  );
}
