import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell, ProtectedRoute } from "@/components/Layout";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DeepfakePage } from "@/pages/DeepfakePage";
import { DetectPage } from "@/pages/DetectPage";
import { DmcaPage } from "@/pages/DmcaPage";
import { ExplainabilityPage } from "@/pages/ExplainabilityPage";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ThreatsPage } from "@/pages/ThreatsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/detect" element={<DetectPage />} />
          <Route path="/threats" element={<ThreatsPage />} />
          <Route path="/deepfake" element={<DeepfakePage />} />
          <Route path="/dmca" element={<DmcaPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/explainability" element={<ExplainabilityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
