import { Bell, CalendarDays } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSimulation } from "@/hooks/useSimulation";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const { notifications } = useSimulation();

  return (
    <header className="sticky top-0 z-20 mb-6 flex flex-col gap-4 border-b border-aegis-border bg-white/80 pb-4 pt-2 backdrop-blur-xl dark:bg-aegis-black/70 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
        <div className="mt-1 text-sm text-aegis-muted">Operational snapshot for {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-2xl border border-aegis-border bg-aegis-card px-4 py-3 text-sm text-aegis-text/70 md:flex">
          <CalendarDays className="h-4 w-4 text-aegis-primary" />
          Live monitoring window
        </div>
        <ThemeToggle />
        <button
          type="button"
          className="relative rounded-2xl border border-aegis-border bg-aegis-card p-3 text-aegis-text transition hover:border-aegis-primary/30 hover:text-aegis-primary"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-aegis-danger px-1 text-[10px] font-semibold text-white">
            {Math.min(notifications, 9)}+
          </span>
        </button>
      </div>
    </header>
  );
}
