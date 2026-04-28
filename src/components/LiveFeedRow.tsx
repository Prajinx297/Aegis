import { motion } from "framer-motion";
import { ArrowRight, Globe2 } from "lucide-react";
import { ThreatBadge } from "@/components/ThreatBadge";
import { formatRelativeTime } from "@/lib/format";
import type { ThreatEntry } from "@/lib/types";

interface LiveFeedRowProps {
  threat: ThreatEntry;
  onBlock?: () => void;
  onDmca?: () => void;
  compact?: boolean;
}

export function LiveFeedRow({ threat, onBlock, onDmca, compact = false }: LiveFeedRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-2xl border border-aegis-border bg-aegis-card/80 p-4 transition hover:border-aegis-primary/30 hover:shadow-glow"
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <ThreatBadge severity={threat.severity} />
            <span className="font-mono text-xs text-aegis-accent">{formatRelativeTime(threat.timestamp)}</span>
            <span className="text-sm font-medium text-white">{threat.type}</span>
          </div>
          <p className="text-sm text-aegis-text/75">{threat.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-aegis-muted">
            <span className="inline-flex items-center gap-1">
              <Globe2 className="h-3.5 w-3.5" />
              {threat.country} · {threat.ip}
            </span>
            <span>{threat.targetAsset}</span>
            <span className="font-mono text-aegis-accent">{threat.status}</span>
          </div>
        </div>
        {!compact ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onBlock}
              className="rounded-xl border border-aegis-border px-3 py-2 text-sm text-aegis-text transition hover:border-aegis-danger/30 hover:text-aegis-danger"
            >
              Block IP
            </button>
            <button
              type="button"
              onClick={onDmca}
              className="rounded-xl bg-aegis-primary px-3 py-2 text-sm font-medium text-white transition hover:shadow-glow"
            >
              File DMCA
            </button>
          </div>
        ) : (
          <ArrowRight className="h-4 w-4 shrink-0 text-aegis-muted" />
        )}
      </div>
    </motion.div>
  );
}
