import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { mockAnalytics } from "@/data/mockAnalytics";
import { mockAssets } from "@/data/mockAssets";
import { mockCountries } from "@/data/mockCountries";
import { mockDmcaCases } from "@/data/mockDmcaCases";
import { mockThreats } from "@/data/mockThreats";
import { generateThreat } from "@/data/threatGenerator";
import { randomHex } from "@/lib/format";
import type {
  AssetRecord,
  DmcaCase,
  ThreatEntry,
  ToastMessage,
  WatchDomain,
} from "@/lib/types";

interface SimulationContextValue {
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: () => void;
  assets: AssetRecord[];
  addAsset: (asset: AssetRecord) => void;
  threats: ThreatEntry[];
  addThreat: (assetName?: string) => void;
  blockThreat: (id: string) => void;
  fileDmcaFromThreat: (id: string) => void;
  dmcaCases: DmcaCase[];
  addDmcaCase: (input: Omit<DmcaCase, "id" | "timeline"> & { timeline?: DmcaCase["timeline"] }) => void;
  blockedIps: number;
  notifications: number;
  watchDomains: WatchDomain[];
  addWatchDomain: (domain: string) => void;
  demoThreatPulse: number;
  detectDemoNonce: number;
  dmcaDemoNonce: number;
  runDetectionDemo: () => void;
  triggerDmcaDemo: () => void;
  toasts: ToastMessage[];
  pushToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (id: string) => void;
  analytics: typeof mockAnalytics;
  countries: typeof mockCountries;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

const initialWatchDomains: WatchDomain[] = [
  { id: "watch-1", domain: "streameast.live", lastScanned: "2 min ago", threatsFound: 3, status: "Flagged" },
  { id: "watch-2", domain: "mirrorclips.cc", lastScanned: "5 min ago", threatsFound: 1, status: "Monitoring" },
  { id: "watch-3", domain: "fanarchive.stream", lastScanned: "12 min ago", threatsFound: 0, status: "Healthy" },
];

export function SimulationProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<"dark" | "light">(
    () => (window.localStorage.getItem("aegis-theme") as "dark" | "light") || "dark",
  );
  const [assets, setAssets] = useState<AssetRecord[]>(mockAssets);
  const [threats, setThreats] = useState<ThreatEntry[]>(mockThreats);
  const [dmcaCases, setDmcaCases] = useState<DmcaCase[]>(mockDmcaCases);
  const [blockedIps, setBlockedIps] = useState(142);
  const [watchDomains, setWatchDomains] = useState(initialWatchDomains);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [demoThreatPulse, setDemoThreatPulse] = useState(0);
  const [detectDemoNonce, setDetectDemoNonce] = useState(0);
  const [dmcaDemoNonce, setDmcaDemoNonce] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("aegis-theme", theme);
  }, [theme]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setThreats((current) => [generateThreat(current[0]?.targetAsset ?? "UCL_Final_Opening_Cut.mp4"), ...current].slice(0, 80));
    }, 2500);

    return () => window.clearInterval(timer);
  }, []);

  const pushToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = `toast-${randomHex(8)}`;
    setToasts((current) => [...current, { id, ...toast }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const setTheme = useCallback((nextTheme: "dark" | "light") => {
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const addAsset = useCallback(
    (asset: AssetRecord) => {
      setAssets((current) => [asset, ...current]);
      pushToast({
        tone: "success",
        title: "Asset registered",
        description: `${asset.name} has been fingerprinted and anchored.`,
      });
    },
    [pushToast],
  );

  const addThreat = useCallback(
    (assetName?: string) => {
      setThreats((current) => [generateThreat(assetName ?? current[0]?.targetAsset ?? "MatchDay_Promo_Poster.png"), ...current]);
      setDemoThreatPulse((value) => value + 1);
      pushToast({
        tone: "error",
        title: "Critical threat simulated",
        description: "A new live threat was injected into the intelligence feed.",
      });
    },
    [pushToast],
  );

  const blockThreat = useCallback(
    (id: string) => {
      setThreats((current) =>
        current.map((entry) => (entry.id === id ? { ...entry, status: "BLOCKED" } : entry)),
      );
      setBlockedIps((current) => current + 1);
      pushToast({
        tone: "success",
        title: "Source blocked",
        description: "The offending IP has been added to the enforcement blocklist.",
      });
    },
    [pushToast],
  );

  const addDmcaCase = useCallback(
    (input: Omit<DmcaCase, "id" | "timeline"> & { timeline?: DmcaCase["timeline"] }) => {
      const newCase: DmcaCase = {
        ...input,
        id: `AEGIS-DMCA-${Math.floor(Math.random() * 9000) + 1000}`,
        timeline:
          input.timeline ?? [
            { label: "Case created", at: "Just now", note: "Generated through AEGIS legal workflow." },
            { label: "Awaiting platform review", at: "Pending", note: "Automated filing complete." },
          ],
      };
      setDmcaCases((current) => [newCase, ...current]);
      pushToast({
        tone: "success",
        title: "DMCA filed",
        description: `${newCase.id} has been submitted to ${newCase.platform}.`,
      });
    },
    [pushToast],
  );

  const fileDmcaFromThreat = useCallback(
    (id: string) => {
      const threat = threats.find((entry) => entry.id === id);
      if (!threat) {
        return;
      }

      setThreats((current) =>
        current.map((entry) => (entry.id === id ? { ...entry, status: "DMCA_FILED" } : entry)),
      );
      addDmcaCase({
        assetId: assets.find((asset) => asset.name === threat.targetAsset)?.id ?? assets[0].id,
        assetName: threat.targetAsset,
        platform: threat.type === "DMCA Evader" ? "Custom" : "Google",
        infringingUrl: `https://evidence.aegis.local/${threat.id}`,
        filedDate: new Date().toISOString(),
        status: "Pending",
        expectedResolution: "Within 12 hours",
        infringementType: "Unauthorized Distribution",
        notice: `AEGIS automatically prepared a takedown notice for ${threat.targetAsset} based on a ${threat.severity.toLowerCase()}-severity intelligence event.`,
      });
    },
    [addDmcaCase, assets, threats],
  );

  const addWatchDomain = useCallback(
    (domain: string) => {
      const cleanDomain = domain.trim();
      if (!cleanDomain) {
        return;
      }
      setWatchDomains((current) => [
        {
          id: `watch-${randomHex(6)}`,
          domain: cleanDomain,
          lastScanned: "Just now",
          threatsFound: Math.floor(Math.random() * 3),
          status: "Monitoring",
        },
        ...current,
      ]);
      pushToast({
        tone: "info",
        title: "Watchlist updated",
        description: `${cleanDomain} is now under scheduled scan coverage.`,
      });
    },
    [pushToast],
  );

  const runDetectionDemo = useCallback(() => {
    setDetectDemoNonce((value) => value + 1);
  }, []);

  const triggerDmcaDemo = useCallback(() => {
    setDmcaDemoNonce((value) => value + 1);
  }, []);

  const notifications = useMemo(
    () => threats.filter((entry) => entry.severity === "CRITICAL" || entry.status === "ACTIVE").length,
    [threats],
  );

  const value = useMemo<SimulationContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      assets,
      addAsset,
      threats,
      addThreat,
      blockThreat,
      fileDmcaFromThreat,
      dmcaCases,
      addDmcaCase,
      blockedIps,
      notifications,
      watchDomains,
      addWatchDomain,
      demoThreatPulse,
      detectDemoNonce,
      dmcaDemoNonce,
      runDetectionDemo,
      triggerDmcaDemo,
      toasts,
      pushToast,
      dismissToast,
      analytics: mockAnalytics,
      countries: mockCountries,
    }),
    [
      addAsset,
      addDmcaCase,
      addThreat,
      addWatchDomain,
      assets,
      blockedIps,
      demoThreatPulse,
      detectDemoNonce,
      dismissToast,
      dmcaCases,
      dmcaDemoNonce,
      fileDmcaFromThreat,
      notifications,
      pushToast,
      runDetectionDemo,
      setTheme,
      theme,
      threats,
      toasts,
      toggleTheme,
      triggerDmcaDemo,
      watchDomains,
    ],
  );

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used inside SimulationProvider");
  }
  return context;
}
