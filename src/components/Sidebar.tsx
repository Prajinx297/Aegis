import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  BrainCircuit,
  FileWarning,
  Home,
  LayoutDashboard,
  Radar,
  SearchCheck,
  Settings,
  Shield,
  ShieldAlert,
  X,
  Zap,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { AegisLogo } from "@/components/AegisLogo";
import { cn } from "@/lib/cn";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/register", label: "Register", icon: Shield },
  { to: "/detect", label: "Detect", icon: SearchCheck, live: true },
  { to: "/threats", label: "Threats", icon: ShieldAlert, live: true },
  { to: "/deepfake", label: "Deepfake", icon: Bot },
  { to: "/dmca", label: "DMCA", icon: FileWarning },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/explainability", label: "XAI", icon: BrainCircuit },
  { to: "/intelligence", label: "Intelligence", icon: Radar, live: true },
  { to: "/attack-simulator", label: "Attack Sim", icon: Zap },
  { to: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const content = (
    <div className="flex h-full flex-col gap-6 overflow-y-auto border-r border-aegis-border bg-aegis-surface p-5">
      <div className="flex items-center justify-between">
        <AegisLogo />
        <button
          type="button"
          className="rounded-xl border border-aegis-border p-2 text-aegis-muted lg:hidden"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <NavLink
        to="/"
        className="inline-flex items-center gap-2 rounded-2xl border border-aegis-border bg-aegis-card px-4 py-3 text-sm text-aegis-text transition hover:border-aegis-primary/30 hover:text-aegis-primary"
        onClick={onClose}
      >
        <Home className="h-4 w-4" />
        Back to landing
      </NavLink>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition",
                isActive
                  ? "border-aegis-primary/40 bg-aegis-primary/10 text-white shadow-glow"
                  : "border-transparent text-aegis-text/75 hover:border-aegis-border hover:bg-aegis-card hover:text-white",
              )
            }
          >
            <span className="flex items-center gap-3">
              <item.icon className="h-4 w-4" />
              {item.label}
            </span>
            {item.live ? <span className="rounded-full bg-aegis-danger/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-aegis-danger animate-pulse">Live</span> : null}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-aegis-border bg-aegis-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-aegis-primary/15 text-aegis-primary">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="font-medium text-white">Ava Chen</div>
            <div className="text-sm text-aegis-muted">Chief Integrity Officer</div>
          </div>
        </div>
        <div className="mt-4 inline-flex rounded-full bg-aegis-success/15 px-3 py-1 text-xs font-medium text-aegis-success">
          Pro Plan
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden h-screen w-72 shrink-0 lg:block">{content}</aside>
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.aside
              className="h-full w-72"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              {content}
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
