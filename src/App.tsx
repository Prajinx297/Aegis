import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useMemo, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { DemoModeButton } from "@/components/DemoModeButton";
import { Sidebar } from "@/components/Sidebar";
import { ToastViewport } from "@/components/Toast";
import { TopBar } from "@/components/TopBar";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DeepfakePage } from "@/pages/DeepfakePage";
import { DetectPage } from "@/pages/DetectPage";
import { DmcaPage } from "@/pages/DmcaPage";
import { ExplainabilityPage } from "@/pages/ExplainabilityPage";
import { LandingPage } from "@/pages/LandingPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ThreatsPage } from "@/pages/ThreatsPage";
import { IntelligencePage } from "@/pages/IntelligencePage";
import { AttackSimulatorPage } from "@/pages/AttackSimulatorPage";

const titles: Record<string, string> = {
  "/dashboard": "Main Command Center",
  "/register": "IP Asset Registration",
  "/detect": "AI Infringement Detection Engine",
  "/threats": "Cyber Threat Intelligence Feed",
  "/deepfake": "Deepfake & Adversarial AI Detector",
  "/dmca": "Automated DMCA Workflow Manager",
  "/analytics": "Analytics Suite",
  "/explainability": "AI Decision Explainability",
  "/settings": "Preferences & Security Settings",
  "/intelligence": "Intelligence Center",
  "/attack-simulator": "Adversarial Robustness Test",
};

function ShellLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = useMemo(() => titles[location.pathname] ?? "AEGIS", [location.pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-aegis-black dark:text-aegis-text">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="min-w-0 flex-1 px-4 pb-10 pt-4 md:px-6 xl:px-8">
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="mb-3 rounded-2xl border border-aegis-border bg-aegis-card p-3 text-aegis-text"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <TopBar title={title} />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<ShellLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/detect" element={<DetectPage />} />
          <Route path="/threats" element={<ThreatsPage />} />
          <Route path="/deepfake" element={<DeepfakePage />} />
          <Route path="/dmca" element={<DmcaPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/explainability" element={<ExplainabilityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/intelligence" element={<IntelligencePage />} />
          <Route path="/attack-simulator" element={<AttackSimulatorPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <DemoModeButton />
      <ToastViewport />
    </>
  );
}
