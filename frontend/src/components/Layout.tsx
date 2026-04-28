import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { BarChart3, Bot, FileWarning, Fingerprint, Home, LogOut, Radar, ScanEye, Settings, ShieldAlert } from "lucide-react";
import { AegisMark, TensorFlowStatus } from "@/components/Badges";
import { useAuth } from "@/context/AuthContext";
import { useModelLoader } from "@/hooks/useModelLoader";

const nav = [
  { to: "/dashboard", label: "Command", icon: Home },
  { to: "/register", label: "Register", icon: Fingerprint },
  { to: "/detect", label: "Detect", icon: ScanEye },
  { to: "/threats", label: "Threats", icon: ShieldAlert },
  { to: "/deepfake", label: "Deepfake", icon: Radar },
  { to: "/dmca", label: "DMCA", icon: FileWarning },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/explainability", label: "XAI", icon: Bot },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function ProtectedRoute() {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();
  if (loading) return <div className="grid min-h-screen place-items-center bg-ink text-white">Loading secure session...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function AppShell() {
  const { user, logout } = useAuth();
  const models = useModelLoader(false);
  return (
    <div className="flex min-h-screen bg-ink">
      <aside className="hidden w-72 shrink-0 border-r border-line bg-panel/95 p-5 lg:block">
        <AegisMark />
        <nav className="mt-8 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${isActive ? "bg-accent text-ink" : "text-slate-300 hover:bg-white/5"}`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 space-y-3">
          <TensorFlowStatus ready={models.ready} status={models.status} />
          <p className="truncate text-xs text-slate-400">{user?.email}</p>
          <button className="button-secondary w-full" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
