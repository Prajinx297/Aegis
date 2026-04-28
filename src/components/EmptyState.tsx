import { ShieldEllipsis } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-aegis-border bg-aegis-card/40 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-aegis-primary/10 text-aegis-primary">
        <ShieldEllipsis className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-aegis-muted">{description}</p>
    </div>
  );
}
