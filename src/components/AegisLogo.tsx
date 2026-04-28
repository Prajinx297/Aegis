import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";

interface AegisLogoProps {
  className?: string;
  compact?: boolean;
}

export function AegisLogo({ className, compact = false }: AegisLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-aegis-primary/30 bg-aegis-primary/10 text-aegis-primary shadow-glow">
        <ShieldCheck className="h-5 w-5" />
      </div>
      {!compact ? (
        <div>
          <div className="text-lg font-bold tracking-tight text-white dark:text-white">AEGIS</div>
          <div className="text-xs text-aegis-muted">Immutable. Intelligent. Invincible.</div>
        </div>
      ) : null}
    </div>
  );
}
