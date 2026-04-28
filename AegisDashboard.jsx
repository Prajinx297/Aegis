import { useEffect, useMemo, useRef, useState } from "react";

const COLORS = {
  background: "#0a0f1e",
  surface: "#111827",
  border: "#1e2d40",
  primary: "#3b82f6",
  accent: "#06b6d4",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  text: "#f1f5f9",
  secondary: "#94a3b8",
  muted: "#475569",
  codeBg: "#0d1117",
  codeBorder: "#30363d",
  codeText: "#c9d1d9",
};

const TABS = [
  { id: "command", label: "Command Center" },
  { id: "register", label: "Register Asset" },
  { id: "detect", label: "Detect Violation" },
  { id: "blockchain", label: "Blockchain Proof" },
  { id: "analytics", label: "Analytics" },
];

const FEED_ITEMS = [
  {
    id: 1,
    severity: "HIGH",
    platform: "YouTube",
    icon: "YT",
    url: "youtube.com/watch?v=dK7x9p2",
    similarity: 94,
    deepfake: "No",
    verdict: "Confirmed",
    asset: "UCL_Final_2026.mp4",
  },
  {
    id: 2,
    severity: "MED",
    platform: "TikTok",
    icon: "TT",
    url: "tiktok.com/@streamer99/clip",
    similarity: 71,
    deepfake: "Pending",
    verdict: "Gemini Verifying...",
    asset: "MatchDay_Promo.jpg",
  },
  {
    id: 3,
    severity: "HIGH",
    platform: "Telegram",
    icon: "TG",
    url: "t.me/sportsfree/2847",
    similarity: 89,
    deepfake: "YES",
    verdict: "Confirmed",
    asset: "UCL_Final_2026.mp4",
  },
  {
    id: 4,
    severity: "LOW",
    platform: "Reddit",
    icon: "RD",
    url: "reddit.com/r/soccer/post",
    similarity: 52,
    deepfake: "No",
    verdict: "False Positive",
    asset: "Training_Reel_April.mp4",
  },
  {
    id: 5,
    severity: "HIGH",
    platform: "StreamEast",
    icon: "SE",
    url: "streameast.live/ucl",
    similarity: 97,
    deepfake: "No",
    verdict: "Confirmed",
    asset: "UCL_Final_2026.mp4",
  },
];

const INITIAL_LOGS = [
  { id: 1, time: "14:23:01", model: "Gemini 1.5 Pro", action: "verify_match()", latency: "2.1s", status: "CONFIRMED" },
  { id: 2, time: "14:22:47", model: "Vision AI", action: "analyze_asset()", latency: "0.8s", status: "OK" },
  { id: 3, time: "14:21:33", model: "Gemini 1.5 Pro", action: "verify_match()", latency: "1.9s", status: "FALSE_POSITIVE" },
  { id: 4, time: "14:20:11", model: "Gemini 1.5 Pro", action: "verify_match()", latency: "2.4s", status: "CONFIRMED" },
];

const REGISTER_STEPS = [
  { label: "Extracting frames with FFmpeg...", duration: 600 },
  { label: "Generating perceptual embedding via ResNet-50...", duration: 800 },
  { label: "Indexing into FAISS vector store...", duration: 400 },
  { label: "Anchoring SHA-3 hash on Polygon blockchain...", duration: 700 },
];

const BLOCKCHAIN_RECORDS = [
  {
    id: "a1",
    asset: "UCL_Final_2026.mp4",
    tx: "0x7f4a2b91c37d64aa9e1d",
    block: "#47,291,883",
    timestamp: "2026-04-24 14:23",
    sha: "e0c91c7a4db1f3fe...78ab",
  },
  {
    id: "a2",
    asset: "MatchDay_Promo.jpg",
    tx: "0x3c8f1a77d1bb40ce2b7e",
    block: "#47,291,701",
    timestamp: "2026-04-24 13:58",
    sha: "b8f4401a82dc6f1b...2cd1",
  },
  {
    id: "a3",
    asset: "Training_Reel_April.mp4",
    tx: "0x6d9a0bc2f74e8217d4aa",
    block: "#47,291,402",
    timestamp: "2026-04-24 12:47",
    sha: "d334af194bcb0d89...48ef",
  },
  {
    id: "a4",
    asset: "LockerRoom_Story.mov",
    tx: "0x90ab72f5c119e84d1f9c",
    block: "#47,291,145",
    timestamp: "2026-04-24 11:31",
    sha: "f1b29d8ce44a1c9f...17c3",
  },
  {
    id: "a5",
    asset: "PressConference_Clip.mp4",
    tx: "0x2e11c07da0f5b1ce47ab",
    block: "#47,290,980",
    timestamp: "2026-04-24 10:54",
    sha: "ab89e1d411c0ff23...aa72",
  },
];

const REGISTER_RESULT = {
  assetId: "AEG-2026-04124",
  sha: "0x8f3a2e1db7fc4c1a9df1be147de45a67d3c4f2e18b9a7f5ac2e11398af57c301",
  faiss: "IDX-004281",
  tx: "0x7f4a2b91c37d64aa9e1dcb77f1002e4c3a0d90ef",
  timestamp: "2026-04-24 14:24:19 UTC+5:30",
  sport: "Football / UEFA Champions League",
  venue: "Olympiastadion, Berlin",
  teams: "Manchester City vs Real Madrid",
};

const GEMINI_OBJECT = {
  match: true,
  confidence: 0.94,
  manipulation_detected: false,
  reasoning:
    "Clip contains identical stadium camera angle and team uniforms consistent with registered asset. Watermark degraded due to re-encoding. Unauthorized redistribution confirmed.",
};

const LINE_DATA = [8, 13, 11, 17, 21, 26, 31, 29, 38, 41, 44, 47];
const PLATFORM_DATA = [
  { label: "Telegram", value: 16, color: COLORS.danger },
  { label: "YouTube", value: 13, color: COLORS.primary },
  { label: "TikTok", value: 9, color: COLORS.accent },
  { label: "Mirror Sites", value: 6, color: COLORS.warning },
  { label: "Forums", value: 3, color: COLORS.success },
];
const HISTOGRAM_DATA = [4, 8, 11, 14, 9, 6, 3];

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function formatMetric(metric, value) {
  if (metric === "avgDetection") {
    return `${value.toFixed(1)}s`;
  }
  return `${Math.round(value)}`;
}

function truncateMiddle(value, start = 10, end = 8) {
  if (!value || value.length <= start + end) {
    return value;
  }
  return `${value.slice(0, start)}...${value.slice(-end)}`;
}

function shieldPath() {
  return "M32 6l18 7v13c0 12.8-7.8 24.1-18 29-10.2-4.9-18-16.2-18-29V13l18-7z";
}

function buildDmcaNotice(violation) {
  return [
    "DMCA TAKEDOWN NOTICE",
    "",
    `Date: 2026-04-24`,
    "To: Designated Copyright Agent",
    `Platform / Service: ${violation.platform}`,
    `Infringing URL: ${violation.url}`,
    "",
    "I am writing on behalf of the rights holder for the sports media asset identified below.",
    `Protected Asset: ${violation.asset}`,
    `Observed Similarity Score: ${violation.similarity}%`,
    `Gemini Verification Status: ${violation.verdict}`,
    "",
    "We have a good-faith belief that the use of this material is not authorized by the copyright owner, its agent, or the law.",
    "The information contained in this notice is accurate, and under penalty of perjury, the undersigned is authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.",
    "",
    "Requested action:",
    "1. Expeditious removal or disablement of access to the infringing material.",
    "2. Preservation of relevant account, upload, and IP logs for enforcement review.",
    "3. Confirmation of takedown to the contact below.",
    "",
    "Authorized Contact:",
    "League Media Integrity Office",
    "legal@aegis-integrity.ai",
    "+1 (415) 555-0194",
    "",
    "Signature:",
    "AEGIS Enforcement Console / Authorized Agent",
  ].join("\n");
}

function TabButton({ tab, active, onClick, innerRef, onKeyDown }) {
  return (
    <button
      ref={innerRef}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={`panel-${tab.id}`}
      id={`tab-${tab.id}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={cx(
        "rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0",
        active ? "shadow-lg" : "hover:-translate-y-0.5"
      )}
      style={{
        backgroundColor: active ? "rgba(59,130,246,0.16)" : "rgba(17,24,39,0.72)",
        borderColor: active ? COLORS.primary : COLORS.border,
        color: active ? COLORS.text : COLORS.secondary,
        boxShadow: active ? "0 10px 30px rgba(59,130,246,0.16)" : "none",
      }}
    >
      {tab.label}
    </button>
  );
}

function SurfaceCard({ children, className = "", style = {} }) {
  return (
    <div
      className={cx("rounded-2xl border p-5", className)}
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, ...style }}
    >
      {children}
    </div>
  );
}

function MetricCard({ label, value, accent, sublabel }) {
  return (
    <SurfaceCard className="relative overflow-hidden p-0">
      <div className="flex h-full">
        <div className="w-1.5 rounded-l-2xl" style={{ backgroundColor: accent }} />
        <div className="flex-1 p-5">
          <div className="text-xs uppercase tracking-[0.18em]" style={{ color: COLORS.secondary }}>
            {label}
          </div>
          <div className="mt-3 text-3xl font-semibold" style={{ color: COLORS.text }}>
            {value}
          </div>
          <div className="mt-2 text-sm" style={{ color: COLORS.secondary }}>
            {sublabel}
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}

function SeverityBadge({ level }) {
  const palette =
    level === "HIGH"
      ? { bg: "rgba(239,68,68,0.16)", fg: "#fecaca", border: "rgba(239,68,68,0.35)" }
      : level === "MED"
        ? { bg: "rgba(245,158,11,0.16)", fg: "#fde68a", border: "rgba(245,158,11,0.35)" }
        : { bg: "rgba(16,185,129,0.16)", fg: "#a7f3d0", border: "rgba(16,185,129,0.35)" };

  return (
    <span
      className="inline-flex min-w-[66px] items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide"
      style={{ backgroundColor: palette.bg, color: palette.fg, borderColor: palette.border }}
    >
      {level}
    </span>
  );
}

function VerdictChip({ text }) {
  let color = COLORS.accent;
  if (text === "False Positive") {
    color = COLORS.success;
  }
  if (text === "Gemini Verifying...") {
    color = COLORS.warning;
  }
  return (
    <span
      className="inline-flex rounded-full border px-2.5 py-1 text-xs"
      style={{ backgroundColor: "rgba(6,182,212,0.08)", borderColor: "rgba(6,182,212,0.22)", color }}
    >
      {text}
    </span>
  );
}

function PlatformIcon({ icon, label }) {
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-semibold"
      style={{
        background:
          "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(6,182,212,0.08))",
        borderColor: COLORS.border,
        color: COLORS.text,
      }}
      aria-label={label}
      title={label}
    >
      {icon}
    </div>
  );
}

function StatusDot({ active }) {
  return (
    <span className="relative flex h-3 w-3 items-center justify-center">
      <span
        className="absolute h-3 w-3 rounded-full transition-all duration-500"
        style={{
          backgroundColor: COLORS.success,
          opacity: active ? 0.24 : 0.08,
          transform: active ? "scale(2.2)" : "scale(1.2)",
        }}
      />
      <span
        className="relative h-2.5 w-2.5 rounded-full transition-all duration-500"
        style={{ backgroundColor: COLORS.success, opacity: active ? 1 : 0.55 }}
      />
    </span>
  );
}

function ProgressStep({ step, index, currentStep, completedSteps }) {
  const isActive = currentStep === index;
  const isComplete = completedSteps.includes(index);

  return (
    <div
      className="rounded-xl border px-4 py-3 transition-all duration-300"
      style={{
        borderColor: isComplete || isActive ? COLORS.primary : COLORS.border,
        backgroundColor: isComplete ? "rgba(16,185,129,0.12)" : isActive ? "rgba(59,130,246,0.12)" : "rgba(10,15,30,0.4)",
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300"
            style={{
              borderColor: isComplete ? COLORS.success : isActive ? COLORS.primary : COLORS.border,
              color: isComplete ? COLORS.success : isActive ? COLORS.primary : COLORS.secondary,
              backgroundColor: isComplete ? "rgba(16,185,129,0.12)" : "transparent",
            }}
          >
            {isComplete ? "OK" : index + 1}
          </div>
          <div>
            <div className="text-sm font-medium" style={{ color: COLORS.text }}>
              {step.label}
            </div>
            <div className="text-xs" style={{ color: COLORS.secondary }}>
              {step.duration}ms
            </div>
          </div>
        </div>
        <div className="text-xs font-medium" style={{ color: isComplete ? COLORS.success : isActive ? COLORS.primary : COLORS.secondary }}>
          {isComplete ? "Complete" : isActive ? "Running" : "Queued"}
        </div>
      </div>
    </div>
  );
}

function ChartShell({ title, subtitle, children }) {
  return (
    <SurfaceCard className="h-full">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: COLORS.text }}>
            {title}
          </h3>
          <p className="mt-1 text-sm" style={{ color: COLORS.secondary }}>
            {subtitle}
          </p>
        </div>
      </div>
      {children}
    </SurfaceCard>
  );
}

function DmcaModal({ violation, onClose, onDispatch, dispatched }) {
  if (!violation) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(2,6,23,0.72)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />
      <div
        className="relative z-10 max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-3xl border"
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, boxShadow: "0 25px 60px rgba(2,6,23,0.55)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dmca-title"
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: COLORS.border }}>
          <div>
            <h2 id="dmca-title" className="text-xl font-semibold" style={{ color: COLORS.text }}>
              DMCA Notice Draft
            </h2>
            <p className="mt-1 text-sm" style={{ color: COLORS.secondary }}>
              Prepared for {violation.platform} enforcement queue
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-3 py-2 text-sm transition-colors"
            style={{ borderColor: COLORS.border, color: COLORS.secondary }}
          >
            Close
          </button>
        </div>
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border-r p-6" style={{ borderColor: COLORS.border }}>
            <div
              className="rounded-2xl border p-4 text-sm leading-7"
              style={{
                backgroundColor: COLORS.codeBg,
                borderColor: COLORS.codeBorder,
                color: COLORS.codeText,
                whiteSpace: "pre-wrap",
                fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              {buildDmcaNotice(violation)}
            </div>
          </div>
          <div className="space-y-4 p-6">
            <SurfaceCard className="p-4">
              <div className="text-xs uppercase tracking-[0.18em]" style={{ color: COLORS.secondary }}>
                Enforcement Metadata
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: COLORS.secondary }}>Severity</span>
                  <SeverityBadge level={violation.severity} />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: COLORS.secondary }}>Similarity</span>
                  <span style={{ color: COLORS.text }}>{violation.similarity}%</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: COLORS.secondary }}>Deepfake</span>
                  <span style={{ color: COLORS.text }}>{violation.deepfake}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: COLORS.secondary }}>Source</span>
                  <span className="max-w-[160px] truncate text-right" style={{ color: COLORS.text }}>
                    {violation.url}
                  </span>
                </div>
              </div>
            </SurfaceCard>
            <SurfaceCard className="p-4">
              <div className="text-xs uppercase tracking-[0.18em]" style={{ color: COLORS.secondary }}>
                Dispatch Path
              </div>
              <div className="mt-3 text-sm leading-6" style={{ color: COLORS.secondary }}>
                Route to platform legal queue, archive case metadata, and preserve platform identifiers for follow-up enforcement.
              </div>
            </SurfaceCard>
            <button
              type="button"
              onClick={onDispatch}
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: dispatched ? COLORS.success : COLORS.primary,
                color: "#ffffff",
              }}
            >
              {dispatched ? "Notice Dispatched" : "Dispatch Notice"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AegisDashboard() {
  const [activeTab, setActiveTab] = useState("command");
  const [livePulse, setLivePulse] = useState(true);
  const [topCounter, setTopCounter] = useState(0);
  const [metrics, setMetrics] = useState({
    assetsProtected: 0,
    violationsToday: 0,
    avgDetection: 0,
    deepfakesCaught: 0,
  });
  const [activityLog, setActivityLog] = useState(INITIAL_LOGS);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [sentNotices, setSentNotices] = useState({});

  const [registerFile, setRegisterFile] = useState("UCL_Final_2026.mp4");
  const [registerHover, setRegisterHover] = useState(false);
  const [registerRunning, setRegisterRunning] = useState(false);
  const [registerCurrentStep, setRegisterCurrentStep] = useState(-1);
  const [registerCompletedSteps, setRegisterCompletedSteps] = useState([]);
  const [registerResult, setRegisterResult] = useState(null);

  const [detectFile, setDetectFile] = useState("telegram_ucl_restream.mp4");
  const [detectHover, setDetectHover] = useState(false);
  const [detectRunning, setDetectRunning] = useState(false);
  const [distanceScore, setDistanceScore] = useState(0.42);
  const [similarityScore, setSimilarityScore] = useState(0);
  const [geminiInvoked, setGeminiInvoked] = useState(false);
  const [typedGemini, setTypedGemini] = useState("");
  const [deepfakeScore, setDeepfakeScore] = useState(0);
  const [detectComplete, setDetectComplete] = useState(false);
  const [detectVerdict, setDetectVerdict] = useState(null);
  const [showNotice, setShowNotice] = useState(false);

  const [verificationStates, setVerificationStates] = useState({});

  const tabRefs = useRef([]);
  const registerInputRef = useRef(null);
  const detectInputRef = useRef(null);
  const registerTimersRef = useRef([]);
  const detectTimersRef = useRef([]);
  const metricRafsRef = useRef([]);

  const geminiJson = useMemo(() => JSON.stringify(GEMINI_OBJECT, null, 2), []);

  useEffect(() => {
    const pulseTimer = setInterval(() => {
      setLivePulse((value) => !value);
    }, 850);

    return () => clearInterval(pulseTimer);
  }, []);

  useEffect(() => {
    const targets = {
      topCounter: 47,
      assetsProtected: 12,
      violationsToday: 47,
      avgDetection: 2.1,
      deepfakesCaught: 9,
    };

    const animateNumber = (setter, from, to, duration) => {
      const start = performance.now();
      let rafId = 0;

      const frame = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setter(from + (to - from) * eased);
        if (progress < 1) {
          rafId = window.requestAnimationFrame(frame);
          metricRafsRef.current.push(rafId);
        }
      };

      rafId = window.requestAnimationFrame(frame);
      metricRafsRef.current.push(rafId);
    };

    animateNumber(setTopCounter, 0, targets.topCounter, 1500);
    animateNumber(
      (value) => setMetrics((prev) => ({ ...prev, assetsProtected: value })),
      0,
      targets.assetsProtected,
      1450
    );
    animateNumber(
      (value) => setMetrics((prev) => ({ ...prev, violationsToday: value })),
      0,
      targets.violationsToday,
      1550
    );
    animateNumber(
      (value) => setMetrics((prev) => ({ ...prev, avgDetection: value })),
      0,
      targets.avgDetection,
      1400
    );
    animateNumber(
      (value) => setMetrics((prev) => ({ ...prev, deepfakesCaught: value })),
      0,
      targets.deepfakesCaught,
      1480
    );

    return () => {
      metricRafsRef.current.forEach((id) => window.cancelAnimationFrame(id));
      metricRafsRef.current = [];
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivityLog((prev) => {
        const nextId = prev[0]?.id ? prev[0].id + 1 : 1;
        const now = new Date();
        const stamp = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
        const entry = {
          id: nextId,
          time: stamp,
          model: "Sentinel Sync",
          action: "stream_watchdog()",
          latency: "0.4s",
          status: "ACTIVE",
        };
        return [entry, ...prev].slice(0, 6);
      });
    }, 9000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      registerTimersRef.current.forEach((timer) => clearTimeout(timer));
      detectTimersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const queueRegisterTimer = (callback, delay) => {
    const timer = setTimeout(callback, delay);
    registerTimersRef.current.push(timer);
  };

  const queueDetectTimer = (callback, delay) => {
    const timer = setTimeout(callback, delay);
    detectTimersRef.current.push(timer);
  };

  const handleTabKeyDown = (event, index) => {
    const max = TABS.length - 1;
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) {
      return;
    }
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowRight") {
      nextIndex = index === max ? 0 : index + 1;
    }
    if (event.key === "ArrowLeft") {
      nextIndex = index === 0 ? max : index - 1;
    }
    if (event.key === "Home") {
      nextIndex = 0;
    }
    if (event.key === "End") {
      nextIndex = max;
    }
    setActiveTab(TABS[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  const pushActivity = (entry) => {
    setActivityLog((prev) => [{ id: (prev[0]?.id || 0) + 1, ...entry }, ...prev].slice(0, 6));
  };

  const handleRegister = () => {
    if (registerRunning) {
      return;
    }

    registerTimersRef.current.forEach((timer) => clearTimeout(timer));
    registerTimersRef.current = [];

    setRegisterRunning(true);
    setRegisterCurrentStep(0);
    setRegisterCompletedSteps([]);
    setRegisterResult(null);

    let elapsed = 0;
    REGISTER_STEPS.forEach((step, index) => {
      queueRegisterTimer(() => {
        setRegisterCurrentStep(index);
      }, elapsed);

      elapsed += step.duration;

      queueRegisterTimer(() => {
        setRegisterCompletedSteps((prev) => [...prev, index]);
        if (index < REGISTER_STEPS.length - 1) {
          setRegisterCurrentStep(index + 1);
        }
      }, elapsed);
    });

    queueRegisterTimer(() => {
      setRegisterRunning(false);
      setRegisterCurrentStep(-1);
      setRegisterResult(REGISTER_RESULT);
      pushActivity({
        time: "14:24:19",
        model: "Vision AI",
        action: "analyze_asset()",
        latency: "0.9s",
        status: "OK",
      });
      pushActivity({
        time: "14:24:20",
        model: "Polygon Anchor",
        action: "write_hash()",
        latency: "0.7s",
        status: "VERIFIED",
      });
    }, elapsed + 40);
  };

  const handleAnalyze = () => {
    if (detectRunning) {
      return;
    }

    detectTimersRef.current.forEach((timer) => clearTimeout(timer));
    detectTimersRef.current = [];

    setDetectRunning(true);
    setDistanceScore(0.42);
    setSimilarityScore(0);
    setGeminiInvoked(false);
    setTypedGemini("");
    setDeepfakeScore(0);
    setDetectComplete(false);
    setDetectVerdict(null);
    setShowNotice(false);

    const distanceDuration = 950;
    const similarityDuration = 1200;
    const typeInterval = 14;
    const distanceStart = performance.now();

    const distanceTick = () => {
      const progress = Math.min((performance.now() - distanceStart) / distanceDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = 0.42 - (0.42 - 0.072) * eased;
      setDistanceScore(value);
      if (progress < 1) {
        queueDetectTimer(distanceTick, 16);
      }
    };
    distanceTick();

    const similarityStart = performance.now();
    const similarityTick = () => {
      const progress = Math.min((performance.now() - similarityStart) / similarityDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = 82 * eased;
      setSimilarityScore(value);
      if (progress < 1) {
        queueDetectTimer(similarityTick, 20);
      }
    };
    queueDetectTimer(similarityTick, 250);

    queueDetectTimer(() => {
      setGeminiInvoked(true);
      pushActivity({
        time: "14:25:08",
        model: "Gemini 1.5 Pro",
        action: "verify_match()",
        latency: "2.2s",
        status: "RUNNING",
      });
    }, 1450);

    queueDetectTimer(() => {
      let index = 0;
      const typeNext = () => {
        index += 1;
        setTypedGemini(geminiJson.slice(0, index));
        if (index < geminiJson.length) {
          queueDetectTimer(typeNext, typeInterval);
        }
      };
      typeNext();
    }, 1700);

    queueDetectTimer(() => {
      setDeepfakeScore(0.18);
    }, 3000);

    queueDetectTimer(() => {
      setDetectVerdict("VIOLATION CONFIRMED");
      setDetectComplete(true);
      setDetectRunning(false);
      pushActivity({
        time: "14:25:10",
        model: "Gemini 1.5 Pro",
        action: "verify_match()",
        latency: "2.2s",
        status: "CONFIRMED",
      });
    }, 4200);
  };

  const handleVerifyRecord = (recordId) => {
    setVerificationStates((prev) => ({ ...prev, [recordId]: "HASHING" }));
    const phase1 = setTimeout(() => {
      setVerificationStates((prev) => ({ ...prev, [recordId]: "COMPARING" }));
    }, 650);
    const phase2 = setTimeout(() => {
      setVerificationStates((prev) => ({ ...prev, [recordId]: "VERIFIED" }));
    }, 1450);
    detectTimersRef.current.push(phase1, phase2);
  };

  const handleDispatchNotice = () => {
    if (!selectedViolation) {
      return;
    }
    setSentNotices((prev) => ({ ...prev, [selectedViolation.id]: true }));
  };

  const linePoints = LINE_DATA.map((value, index) => {
    const x = 22 + index * 46;
    const y = 180 - value * 3.2;
    return `${x},${y}`;
  }).join(" ");

  const linePath = LINE_DATA.map((value, index) => {
    const x = 22 + index * 46;
    const y = 180 - value * 3.2;
    return `${index === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  const analyticsMax = Math.max(...PLATFORM_DATA.map((item) => item.value));

  const renderCommandCenter = () => (
    <div className="grid gap-6 xl:grid-cols-[1.55fr_0.75fr]">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Assets Protected"
            value={formatMetric("assetsProtected", metrics.assetsProtected)}
            accent={COLORS.primary}
            sublabel="12 registered media fingerprints across live matchday inventory"
          />
          <MetricCard
            label="Violations Today"
            value={formatMetric("violationsToday", metrics.violationsToday)}
            accent={COLORS.danger}
            sublabel="92% auto-triaged within the first 3 minutes of upload"
          />
          <MetricCard
            label="Avg Detection Time"
            value={formatMetric("avgDetection", metrics.avgDetection)}
            accent={COLORS.accent}
            sublabel="Async Gemini verification + FAISS shortlist pipeline"
          />
          <MetricCard
            label="Deepfakes Caught"
            value={formatMetric("deepfakesCaught", metrics.deepfakesCaught)}
            accent={COLORS.warning}
            sublabel="Frequency anomaly and frame consistency analysis enabled"
          />
        </div>

        <SurfaceCard className="overflow-hidden">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold" style={{ color: COLORS.text }}>
                Live Violation Feed
              </h3>
              <p className="mt-1 text-sm" style={{ color: COLORS.secondary }}>
                Real-time cross-platform infringement detection with Gemini-assisted adjudication
              </p>
            </div>
            <div
              className="rounded-full border px-3 py-1 text-xs font-medium"
              style={{ borderColor: "rgba(239,68,68,0.24)", color: "#fda4af", backgroundColor: "rgba(239,68,68,0.08)" }}
            >
              47 monitored events
            </div>
          </div>
          <div className="aegis-scroll max-h-[480px] space-y-3 overflow-y-auto pr-1">
            {FEED_ITEMS.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 lg:grid-cols-[auto_auto_1fr_auto_auto_auto_auto]"
                style={{ borderColor: COLORS.border, backgroundColor: "rgba(10,15,30,0.48)" }}
              >
                <SeverityBadge level={item.severity} />
                <PlatformIcon icon={item.icon} label={item.platform} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium" style={{ color: COLORS.text }}>
                    {item.url}
                  </div>
                  <div className="mt-1 text-xs" style={{ color: COLORS.secondary }}>
                    Matched against {item.asset}
                  </div>
                </div>
                <div className="text-sm">
                  <div style={{ color: COLORS.secondary }}>Similarity</div>
                  <div className="mt-1 font-semibold" style={{ color: COLORS.text }}>
                    {item.similarity}%
                  </div>
                </div>
                <div className="text-sm">
                  <div style={{ color: COLORS.secondary }}>Deepfake</div>
                  <div className="mt-1 font-semibold" style={{ color: item.deepfake === "YES" ? COLORS.danger : COLORS.text }}>
                    {item.deepfake}
                  </div>
                </div>
                <div className="flex items-center">
                  <VerdictChip text={item.verdict} />
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setSelectedViolation(item)}
                    className="rounded-xl px-3 py-2 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5"
                    style={{
                      backgroundColor: sentNotices[item.id] ? COLORS.success : COLORS.primary,
                      color: "#ffffff",
                    }}
                  >
                    {sentNotices[item.id] ? "DMCA Sent" : "Send DMCA"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <div className="space-y-6">
        <SurfaceCard>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold" style={{ color: COLORS.text }}>
                AI Activity Log
              </h3>
              <p className="mt-1 text-sm" style={{ color: COLORS.secondary }}>
                Live Gemini API and indexing activity with end-to-end latency
              </p>
            </div>
            <div className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: COLORS.border, color: COLORS.secondary }}>
              Vertex AI Trace
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {activityLog.map((entry) => {
              const statusColor =
                entry.status === "CONFIRMED"
                  ? COLORS.danger
                  : entry.status === "OK" || entry.status === "VERIFIED" || entry.status === "ACTIVE"
                    ? COLORS.success
                    : entry.status === "FALSE_POSITIVE"
                      ? COLORS.warning
                      : COLORS.primary;
              return (
                <div
                  key={`${entry.id}-${entry.time}`}
                  className="rounded-2xl border p-4"
                  style={{ borderColor: COLORS.border, backgroundColor: "rgba(10,15,30,0.45)" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div
                        className="text-xs uppercase tracking-[0.18em]"
                        style={{
                          color: COLORS.secondary,
                          fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
                        }}
                      >
                        [{entry.time}]
                      </div>
                      <div className="mt-2 text-sm font-medium" style={{ color: COLORS.text }}>
                        {entry.model} | {entry.action}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div style={{ color: COLORS.text }}>{entry.latency}</div>
                      <div className="mt-1 font-medium" style={{ color: statusColor }}>
                        {entry.status}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <div className="text-xs uppercase tracking-[0.18em]" style={{ color: COLORS.secondary }}>
            Enforcement Flow
          </div>
          <div className="mt-4 grid gap-3">
            {["Register", "Monitor", "Enforce"].map((step, index) => (
              <div
                key={step}
                className="rounded-xl border p-4"
                style={{ borderColor: COLORS.border, backgroundColor: "rgba(10,15,30,0.42)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold"
                    style={{ borderColor: index === 0 ? COLORS.primary : index === 1 ? COLORS.accent : COLORS.danger, color: COLORS.text }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: COLORS.text }}>
                      {step}
                    </div>
                    <div className="text-sm" style={{ color: COLORS.secondary }}>
                      {index === 0
                        ? "Fingerprint assets and anchor rights proofs"
                        : index === 1
                          ? "Continuously scan public platforms and mirrors"
                          : "Prepare takedown packets with forensic evidence"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );

  const renderRegister = () => (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <SurfaceCard>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold" style={{ color: COLORS.text }}>
                Register New Broadcast Asset
              </h3>
              <p className="mt-1 text-sm" style={{ color: COLORS.secondary }}>
                Generate a resilient media fingerprint before syndication or live distribution begins
              </p>
            </div>
            <div className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: COLORS.border, color: COLORS.secondary }}>
              12 assets indexed
            </div>
          </div>

          <input
            ref={registerInputRef}
            type="file"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setRegisterFile(file.name);
              }
            }}
          />

          <button
            type="button"
            onClick={() => registerInputRef.current?.click()}
            onDragEnter={() => setRegisterHover(true)}
            onDragLeave={() => setRegisterHover(false)}
            onDragOver={(event) => {
              event.preventDefault();
              setRegisterHover(true);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setRegisterHover(false);
              const file = event.dataTransfer.files?.[0];
              if (file) {
                setRegisterFile(file.name);
              }
            }}
            className="mt-6 w-full rounded-3xl border-2 border-dashed px-6 py-12 text-left transition-all duration-200"
            style={{
              borderColor: registerHover ? COLORS.accent : COLORS.border,
              backgroundColor: registerHover ? "rgba(6,182,212,0.08)" : "rgba(10,15,30,0.45)",
              boxShadow: registerHover ? "0 0 0 1px rgba(6,182,212,0.18) inset" : "none",
            }}
            aria-label="Upload media asset to register"
          >
            <div className="mx-auto max-w-2xl text-center">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border"
                style={{ borderColor: COLORS.border, backgroundColor: "rgba(17,24,39,0.72)", color: COLORS.text }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 16V5m0 0l-4 4m4-4l4 4M5 19h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="mt-5 text-lg font-semibold" style={{ color: COLORS.text }}>
                Drop broadcast media here or browse securely
              </div>
              <div className="mt-2 text-sm" style={{ color: COLORS.secondary }}>
                Current selection: <span style={{ color: COLORS.text }}>{registerFile}</span>
              </div>
              <div className="mt-4 text-xs uppercase tracking-[0.18em]" style={{ color: COLORS.muted }}>
                FFmpeg frame sampling | ResNet-50 embeddings | FAISS indexing | Polygon proof
              </div>
            </div>
          </button>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRegister}
              className="rounded-xl px-4 py-3 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={registerRunning}
              style={{ backgroundColor: COLORS.primary, color: "#ffffff" }}
            >
              {registerRunning ? "Registering..." : "Register Asset"}
            </button>
            <div className="rounded-full border px-3 py-2 text-sm" style={{ borderColor: COLORS.border, color: COLORS.secondary }}>
              Rights scope: Broadcast Ops / Legal
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <h3 className="text-lg font-semibold" style={{ color: COLORS.text }}>
            Registration Pipeline
          </h3>
          <p className="mt-1 text-sm" style={{ color: COLORS.secondary }}>
            Sequential proof generation designed for courtroom-ready provenance
          </p>
          <div className="mt-5 space-y-3">
            {REGISTER_STEPS.map((step, index) => (
              <ProgressStep
                key={step.label}
                step={step}
                index={index}
                currentStep={registerCurrentStep}
                completedSteps={registerCompletedSteps}
              />
            ))}
          </div>
        </SurfaceCard>
      </div>

      <div className="space-y-6">
        <SurfaceCard>
          <div className="text-xs uppercase tracking-[0.18em]" style={{ color: COLORS.secondary }}>
            Gemini Metadata Analysis
          </div>
          <div className="mt-4 text-sm leading-7" style={{ color: COLORS.secondary }}>
            Gemini 1.5 Pro extracts sport context, venue semantics, and team identity to enrich enforcement evidence and improve downstream search recall.
          </div>
          {registerResult ? (
            <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: COLORS.border, backgroundColor: "rgba(10,15,30,0.42)" }}>
              <div className="grid gap-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: COLORS.secondary }}>Sport Type</span>
                  <span style={{ color: COLORS.text }}>{registerResult.sport}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: COLORS.secondary }}>Venue</span>
                  <span className="text-right" style={{ color: COLORS.text }}>{registerResult.venue}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: COLORS.secondary }}>Teams Detected</span>
                  <span className="text-right" style={{ color: COLORS.text }}>{registerResult.teams}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border p-4 text-sm" style={{ borderColor: COLORS.border, backgroundColor: "rgba(10,15,30,0.42)", color: COLORS.secondary }}>
              Ready to enrich the next asset with venue, competition, and roster intelligence.
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard>
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold" style={{ color: COLORS.text }}>
              Fingerprint Card
            </h3>
            <div className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: COLORS.border, color: COLORS.secondary }}>
              SHA-3 Anchored
            </div>
          </div>
          {registerResult ? (
            <div className="mt-5 space-y-4">
              {[
                ["Asset ID", registerResult.assetId],
                ["SHA-3 Hash", truncateMiddle(registerResult.sha, 16, 10)],
                ["FAISS Index Position", registerResult.faiss],
                ["Blockchain Tx", truncateMiddle(registerResult.tx, 14, 8)],
                ["Timestamp", registerResult.timestamp],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-3"
                  style={{ borderColor: COLORS.border, backgroundColor: "rgba(10,15,30,0.42)" }}
                >
                  <span className="text-sm" style={{ color: COLORS.secondary }}>
                    {label}
                  </span>
                  <span
                    className="max-w-[60%] truncate text-right text-sm"
                    style={{ color: COLORS.text, fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace" }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border p-5 text-sm" style={{ borderColor: COLORS.border, backgroundColor: "rgba(10,15,30,0.42)", color: COLORS.secondary }}>
              Register an asset to generate its immutable fingerprint, searchable vector position, and blockchain proof record.
            </div>
          )}
        </SurfaceCard>
      </div>
    </div>
  );

  const renderDetect = () => (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <SurfaceCard>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold" style={{ color: COLORS.text }}>
                Analyze Suspected Infringing Content
              </h3>
              <p className="mt-1 text-sm" style={{ color: COLORS.secondary }}>
                Shortlist via FAISS, escalate ambiguous matches to Gemini 1.5 Pro, and generate evidence-backed enforcement output
              </p>
            </div>
            <div className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: COLORS.border, color: COLORS.secondary }}>
              Monitor {"->"} Enforce
            </div>
          </div>

          <input
            ref={detectInputRef}
            type="file"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setDetectFile(file.name);
              }
            }}
          />

          <button
            type="button"
            onClick={() => detectInputRef.current?.click()}
            onDragEnter={() => setDetectHover(true)}
            onDragLeave={() => setDetectHover(false)}
            onDragOver={(event) => {
              event.preventDefault();
              setDetectHover(true);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDetectHover(false);
              const file = event.dataTransfer.files?.[0];
              if (file) {
                setDetectFile(file.name);
              }
            }}
            className="mt-6 w-full rounded-3xl border-2 border-dashed px-6 py-10 text-left transition-all duration-200"
            style={{
              borderColor: detectHover ? COLORS.primary : COLORS.border,
              backgroundColor: detectHover ? "rgba(59,130,246,0.08)" : "rgba(10,15,30,0.45)",
            }}
            aria-label="Upload suspected infringing content"
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl border"
                style={{ borderColor: COLORS.border, backgroundColor: "rgba(17,24,39,0.72)", color: COLORS.text }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 5v14m7-7H5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <div className="mt-4 text-lg font-semibold" style={{ color: COLORS.text }}>
                Suspected sample queued for adjudication
              </div>
              <div className="mt-2 text-sm" style={{ color: COLORS.secondary }}>
                Selected file: <span style={{ color: COLORS.text }}>{detectFile}</span>
              </div>
            </div>
          </button>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleAnalyze}
              className="rounded-xl px-4 py-3 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={detectRunning}
              style={{ backgroundColor: COLORS.primary, color: "#ffffff" }}
            >
              {detectRunning ? "Analyzing..." : "Analyze"}
            </button>
            <button
              type="button"
              onClick={() => setShowNotice((value) => !value)}
              className="rounded-xl border px-4 py-3 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5"
              style={{ borderColor: COLORS.primary, color: COLORS.primary }}
            >
              {showNotice ? "Hide DMCA Notice" : "Generate DMCA Notice"}
            </button>
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-[0.18em]" style={{ color: COLORS.secondary }}>
                FAISS ANN Search
              </div>
              <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: COLORS.border, backgroundColor: "rgba(10,15,30,0.42)" }}>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-sm" style={{ color: COLORS.secondary }}>
                      Best vector distance
                    </div>
                    <div
                      className="mt-2 text-3xl font-semibold"
                      style={{ color: COLORS.text, fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace" }}
                    >
                      {distanceScore.toFixed(3)}
                    </div>
                  </div>
                  <div className="text-right text-sm" style={{ color: COLORS.secondary }}>
                    1 of 12 assets shortlisted
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-6 gap-2">
                  {[0.31, 0.27, 0.19, 0.15, 0.11, 0.072].map((value, index) => (
                    <div key={value} className="space-y-2">
                      <div
                        className="rounded-t-lg transition-all duration-300"
                        style={{
                          height: `${48 + (5 - index) * 12}px`,
                          backgroundColor: index === 5 ? COLORS.primary : "rgba(148,163,184,0.18)",
                        }}
                      />
                      <div className="text-center text-[11px]" style={{ color: COLORS.secondary }}>
                        {value.toFixed(3)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-[0.18em]" style={{ color: COLORS.secondary }}>
                Similarity Score
              </div>
              <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: COLORS.border, backgroundColor: "rgba(10,15,30,0.42)" }}>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm" style={{ color: COLORS.secondary }}>
                    Confidence meter
                  </span>
                  <span className="text-xl font-semibold" style={{ color: COLORS.text }}>
                    {Math.round(similarityScore)}%
                  </span>
                </div>
                <div className="mt-4 h-4 overflow-hidden rounded-full" style={{ backgroundColor: "rgba(148,163,184,0.14)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(similarityScore, 100)}%`,
                      background: "linear-gradient(90deg, #06b6d4, #3b82f6, #ef4444)",
                    }}
                  />
                </div>
                <div className="mt-4 text-sm leading-6" style={{ color: COLORS.secondary }}>
                  {similarityScore >= 60 && similarityScore <= 85
                    ? "Invoking Gemini 1.5 Pro for verification..."
                    : "Awaiting sufficient evidence threshold to escalate."}
                </div>
              </div>
            </div>
          </div>
        </SurfaceCard>

        {showNotice ? (
          <SurfaceCard>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold" style={{ color: COLORS.text }}>
                Generated DMCA Notice
              </h3>
              <div className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: COLORS.border, color: COLORS.secondary }}>
                Legal-ready output
              </div>
            </div>
            <div
              className="mt-4 rounded-2xl border p-4 text-sm leading-7"
              style={{
                backgroundColor: COLORS.codeBg,
                borderColor: COLORS.codeBorder,
                color: COLORS.codeText,
                whiteSpace: "pre-wrap",
                fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              {buildDmcaNotice({
                platform: "Telegram",
                url: "t.me/sportsfree/2847",
                asset: "UCL_Final_2026.mp4",
                similarity: Math.round(similarityScore) || 82,
                verdict: detectComplete ? "Confirmed by Gemini 1.5 Pro" : "Pending Analysis",
              })}
            </div>
          </SurfaceCard>
        ) : null}
      </div>

      <div className="space-y-6">
        <SurfaceCard>
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold" style={{ color: COLORS.text }}>
              Gemini Verification Response
            </h3>
            <div className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: COLORS.border, color: COLORS.secondary }}>
              JSON stream
            </div>
          </div>
          <div
            className="mt-4 min-h-[240px] rounded-2xl border p-4 text-sm leading-7"
            style={{
              backgroundColor: COLORS.codeBg,
              borderColor: COLORS.codeBorder,
              color: COLORS.codeText,
              whiteSpace: "pre-wrap",
              fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            {typedGemini || '{\n  "match": false,\n  "confidence": 0.00,\n  "manipulation_detected": false,\n  "reasoning": "Awaiting Gemini verification."\n}'}
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <div className="text-xs uppercase tracking-[0.18em]" style={{ color: COLORS.secondary }}>
            Deepfake Analysis
          </div>
          <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: COLORS.border, backgroundColor: "rgba(10,15,30,0.42)" }}>
            <div className="flex items-center justify-between gap-4">
              <span style={{ color: COLORS.secondary }}>Frequency anomaly score</span>
              <span className="text-xl font-semibold" style={{ color: COLORS.text }}>
                {deepfakeScore.toFixed(2)}
              </span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full" style={{ backgroundColor: "rgba(148,163,184,0.14)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${deepfakeScore * 100}%`, backgroundColor: COLORS.success }}
              />
            </div>
            <div className="mt-4 text-sm leading-6" style={{ color: COLORS.secondary }}>
              No GAN harmonic spikes detected. Compression ladder and edge ringing patterns are consistent with Telegram re-encoding rather than synthetic generation.
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard
          style={{
            background:
              detectComplete
                ? "linear-gradient(180deg, rgba(239,68,68,0.12), rgba(17,24,39,1))"
                : COLORS.surface,
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em]" style={{ color: COLORS.secondary }}>
                Verdict
              </div>
              <div className="mt-3 text-2xl font-semibold" style={{ color: detectComplete ? "#fecaca" : COLORS.text }}>
                {detectVerdict || "Awaiting Analysis"}
              </div>
            </div>
            <div
              className="rounded-full border px-3 py-1 text-xs font-semibold"
              style={{
                borderColor: detectComplete ? "rgba(239,68,68,0.35)" : COLORS.border,
                color: detectComplete ? "#fecaca" : COLORS.secondary,
                backgroundColor: detectComplete ? "rgba(239,68,68,0.12)" : "transparent",
              }}
            >
              {detectComplete ? "ENFORCE NOW" : "PENDING"}
            </div>
          </div>
          <div className="mt-4 text-sm leading-7" style={{ color: COLORS.secondary }}>
            Registered camera angle, kit colors, venue geometry, and broadcast timing all match the original protected asset. Evidence quality exceeds enforcement threshold.
          </div>
        </SurfaceCard>
      </div>
    </div>
  );

  const renderBlockchain = () => (
    <div className="space-y-6">
      <SurfaceCard>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold" style={{ color: COLORS.text }}>
              Blockchain Proof Explorer
            </h3>
            <p className="mt-1 text-sm" style={{ color: COLORS.secondary }}>
              Immutable proof-of-ownership records anchored on Polygon with SHA-3 fingerprints
            </p>
          </div>
          <div className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: COLORS.border, color: COLORS.secondary }}>
            5 latest proofs
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {BLOCKCHAIN_RECORDS.map((record) => {
            const state = verificationStates[record.id];
            return (
              <div
                key={record.id}
                className="grid gap-4 rounded-2xl border p-4 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto]"
                style={{ borderColor: COLORS.border, backgroundColor: "rgba(10,15,30,0.45)" }}
              >
                <div>
                  <div className="text-xs uppercase tracking-[0.18em]" style={{ color: COLORS.secondary }}>
                    Asset / Tx Hash
                  </div>
                  <div className="mt-2 text-sm font-medium" style={{ color: COLORS.text }}>
                    {record.asset}
                  </div>
                  <div
                    className="mt-1 text-xs"
                    style={{ color: COLORS.secondary, fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace" }}
                  >
                    {truncateMiddle(record.tx, 12, 8)}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em]" style={{ color: COLORS.secondary }}>
                    Block
                  </div>
                  <div className="mt-2 text-sm" style={{ color: COLORS.text }}>
                    {record.block}
                  </div>
                  <div className="mt-1 text-xs" style={{ color: COLORS.secondary }}>
                    {record.timestamp}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em]" style={{ color: COLORS.secondary }}>
                    SHA-3 Hash
                  </div>
                  <div
                    className="mt-2 text-sm"
                    style={{ color: COLORS.text, fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace" }}
                  >
                    {record.sha}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em]" style={{ color: COLORS.secondary }}>
                    Status
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium" style={{ color: COLORS.success }}>
                    VERIFIED <span aria-hidden="true">[OK]</span>
                  </div>
                  <div className="mt-2 text-xs" style={{ color: COLORS.secondary }}>
                    {state === "HASHING"
                      ? "Reading local asset digest..."
                      : state === "COMPARING"
                        ? "Comparing on-chain and local proofs..."
                        : state === "VERIFIED"
                          ? "Hash match confirmed."
                          : "Ready for integrity check."}
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleVerifyRecord(record.id)}
                    className="rounded-xl px-4 py-3 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5"
                    style={{
                      backgroundColor: state === "VERIFIED" ? COLORS.success : COLORS.primary,
                      color: "#ffffff",
                    }}
                  >
                    {state === "HASHING"
                      ? "Hashing..."
                      : state === "COMPARING"
                        ? "Comparing..."
                        : state === "VERIFIED"
                          ? "Integrity Verified"
                          : "Verify Integrity"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </SurfaceCard>
    </div>
  );

  const renderAnalytics = () => (
    <div className="grid gap-6 xl:grid-cols-2">
      <ChartShell title="Violations Over Time" subtitle="Hourly infringing detections across monitored sports channels">
        <svg viewBox="0 0 560 220" className="w-full" aria-label="Violations over time line chart">
          <defs>
            <linearGradient id="aegisLineFill" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.35" />
              <stop offset="100%" stopColor={COLORS.primary} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((row) => (
            <line
              key={row}
              x1="18"
              y1={36 + row * 44}
              x2="540"
              y2={36 + row * 44}
              stroke="rgba(148,163,184,0.12)"
              strokeWidth="1"
            />
          ))}
          <path d={`${linePath} L 528 180 L 22 180 Z`} fill="url(#aegisLineFill)" />
          <path d={linePath} fill="none" stroke={COLORS.primary} strokeWidth="3" strokeLinecap="round" />
          {linePoints.split(" ").map((point, index) => {
            const [x, y] = point.split(",");
            return <circle key={point} cx={x} cy={y} r="4.5" fill={index > 8 ? COLORS.danger : COLORS.accent} />;
          })}
          {["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"].map((label, index) => (
            <text key={label} x={26 + index * 92} y="208" fill={COLORS.secondary} fontSize="11">
              {label}
            </text>
          ))}
        </svg>
      </ChartShell>

      <ChartShell title="Platform Breakdown" subtitle="Distribution of confirmed cases by source platform">
        <div className="space-y-4">
          {PLATFORM_DATA.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span style={{ color: COLORS.text }}>{item.label}</span>
                <span style={{ color: COLORS.secondary }}>{item.value} cases</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full" style={{ backgroundColor: "rgba(148,163,184,0.12)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(item.value / analyticsMax) * 100}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </ChartShell>

      <ChartShell title="Detection Time Histogram" subtitle="Time-to-verdict distribution for the current monitoring window">
        <svg viewBox="0 0 560 220" className="w-full" aria-label="Detection time histogram">
          {[0, 1, 2, 3].map((row) => (
            <line
              key={row}
              x1="26"
              y1={30 + row * 42}
              x2="540"
              y2={30 + row * 42}
              stroke="rgba(148,163,184,0.12)"
              strokeWidth="1"
            />
          ))}
          {HISTOGRAM_DATA.map((value, index) => (
            <g key={index}>
              <rect
                x={50 + index * 68}
                y={180 - value * 11}
                width="38"
                height={value * 11}
                rx="8"
                fill={index >= 4 ? COLORS.accent : COLORS.primary}
              />
              <text x={69 + index * 68} y="200" textAnchor="middle" fill={COLORS.secondary} fontSize="11">
                {`${index + 1}s`}
              </text>
            </g>
          ))}
        </svg>
      </ChartShell>

      <SurfaceCard className="flex flex-col justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.18em]" style={{ color: COLORS.secondary }}>
            Impact Summary
          </div>
          <div className="mt-4 text-3xl font-semibold leading-tight" style={{ color: COLORS.text }}>
            12 DMCA notices sent | $2.3M estimated value protected
          </div>
          <div className="mt-4 text-sm leading-7" style={{ color: COLORS.secondary }}>
            AEGIS reduced average manual review time by 78%, surfaced 9 deepfake-driven piracy attempts, and preserved high-confidence evidence packages for legal escalation.
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Enforcement Rate", "91%"],
            ["False Positives Avoided", "14"],
            ["Median Takedown Prep", "2.6m"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border p-4"
              style={{ borderColor: COLORS.border, backgroundColor: "rgba(10,15,30,0.42)" }}
            >
              <div className="text-xs uppercase tracking-[0.18em]" style={{ color: COLORS.secondary }}>
                {label}
              </div>
              <div className="mt-3 text-2xl font-semibold" style={{ color: COLORS.text }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );

  return (
    <div
      className="min-h-screen w-full overflow-hidden px-4 py-6 sm:px-6 lg:px-10"
      style={{
        backgroundColor: COLORS.background,
        color: COLORS.text,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .aegis-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
        .aegis-scroll::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.22); border-radius: 999px; }
        .aegis-scroll::-webkit-scrollbar-track { background: rgba(15,23,42,0.3); }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-28 left-[10%] h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(59,130,246,0.12)" }}
        />
        <div
          className="absolute right-[6%] top-24 h-80 w-80 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(6,182,212,0.1)" }}
        />
        <div
          className="absolute bottom-[-80px] left-[28%] h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(239,68,68,0.08)" }}
        />
      </div>

      <div className="relative mx-auto max-w-[1560px]">
        <header
          className="rounded-[28px] border px-6 py-6"
          style={{
            borderColor: COLORS.border,
            background:
              "linear-gradient(135deg, rgba(17,24,39,0.94), rgba(10,15,30,0.92))",
            boxShadow: "0 25px 60px rgba(2,6,23,0.35)",
          }}
        >
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border"
                style={{
                  borderColor: "rgba(59,130,246,0.28)",
                  background: "linear-gradient(135deg, rgba(59,130,246,0.16), rgba(6,182,212,0.1))",
                }}
              >
                <svg width="40" height="40" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <path d={shieldPath()} fill="rgba(59,130,246,0.16)" stroke={COLORS.primary} strokeWidth="2" />
                  <path d="M20 34l7 7 17-18" stroke={COLORS.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">AEGIS</h1>
                  <div
                    className="rounded-full border px-3 py-1 text-xs font-medium"
                    style={{ borderColor: COLORS.border, color: COLORS.secondary }}
                  >
                    Adaptive Embedded Guardian for Integrity in Sports Media
                  </div>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-7 sm:text-base" style={{ color: COLORS.secondary }}>
                  AI-native sports media defense platform combining perceptual search, Gemini reasoning, and blockchain proofs to stop piracy before it erodes broadcast value.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-2 rounded-full border px-3 py-2" style={{ borderColor: COLORS.border }}>
                    <StatusDot active={livePulse} />
                    <span style={{ color: COLORS.text }}>LIVE</span>
                    <span style={{ color: COLORS.secondary }}>Realtime monitoring active</span>
                  </div>
                  <div className="rounded-full border px-3 py-2" style={{ borderColor: COLORS.border, color: COLORS.secondary }}>
                    Powered by Gemini 1.5 Pro | Vertex AI | Google Cloud
                  </div>
                  <div className="rounded-full border px-3 py-2" style={{ borderColor: COLORS.border, color: COLORS.secondary }}>
                    SSO: League Operations | RBAC: Legal + Broadcast Security
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:min-w-[430px]">
              <div
                className="rounded-2xl border p-5"
                style={{
                  borderColor: COLORS.border,
                  background:
                    "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(17,24,39,0.88))",
                }}
              >
                <div className="text-xs uppercase tracking-[0.18em]" style={{ color: "#fecaca" }}>
                  Live Threat Count
                </div>
                <div className="mt-3 text-4xl font-semibold" style={{ color: COLORS.text }}>
                  {Math.round(topCounter)}
                </div>
                <div className="mt-2 text-sm" style={{ color: COLORS.secondary }}>
                  violations detected today
                </div>
              </div>
              <div
                className="rounded-2xl border p-5"
                style={{
                  borderColor: COLORS.border,
                  background:
                    "linear-gradient(135deg, rgba(6,182,212,0.12), rgba(17,24,39,0.88))",
                }}
              >
                <div className="text-xs uppercase tracking-[0.18em]" style={{ color: "#a5f3fc" }}>
                  Protected Value
                </div>
                <div className="mt-3 text-4xl font-semibold" style={{ color: COLORS.text }}>
                  $2.3M
                </div>
                <div className="mt-2 text-sm" style={{ color: COLORS.secondary }}>
                  estimated revenue preserved this cycle
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div role="tablist" aria-label="AEGIS dashboard tabs" className="flex flex-wrap gap-3">
            {TABS.map((tab, index) => (
              <TabButton
                key={tab.id}
                tab={tab}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                innerRef={(node) => {
                  tabRefs.current[index] = node;
                }}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              />
            ))}
          </div>
          <div className="rounded-full border px-4 py-2 text-sm" style={{ borderColor: COLORS.border, color: COLORS.secondary }}>
            Register {"->"} Monitor {"->"} Enforce
          </div>
        </div>

        <main
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="aegis-scroll mt-6 rounded-[28px] border p-6"
          style={{
            borderColor: COLORS.border,
            backgroundColor: "rgba(10,15,30,0.72)",
            backdropFilter: "blur(18px)",
          }}
        >
          {activeTab === "command" ? renderCommandCenter() : null}
          {activeTab === "register" ? renderRegister() : null}
          {activeTab === "detect" ? renderDetect() : null}
          {activeTab === "blockchain" ? renderBlockchain() : null}
          {activeTab === "analytics" ? renderAnalytics() : null}
        </main>
      </div>

      <DmcaModal
        violation={selectedViolation}
        dispatched={selectedViolation ? !!sentNotices[selectedViolation.id] : false}
        onClose={() => setSelectedViolation(null)}
        onDispatch={() => {
          handleDispatchNotice();
          const closeTimer = setTimeout(() => setSelectedViolation(null), 650);
          detectTimersRef.current.push(closeTimer);
        }}
      />
    </div>
  );
}
