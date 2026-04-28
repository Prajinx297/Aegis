import type { ThreatEntry, ThreatSeverity, ThreatType } from "@/lib/types";
import { randomHex, timeLabel } from "@/lib/format";

const threatTypes: ThreatType[] = [
  "IP Scraper",
  "Content Bot",
  "Deepfake Generator",
  "Unauthorized API Access",
  "Proxy Crawler",
  "DMCA Evader",
  "Adversarial Probe",
];

const severities: ThreatSeverity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

const origins = [
  { country: "Germany", code: "DE", prefix: "185.220.101" },
  { country: "United States", code: "US", prefix: "45.33.90" },
  { country: "Singapore", code: "SG", prefix: "103.56.149" },
  { country: "Netherlands", code: "NL", prefix: "91.219.236" },
  { country: "Romania", code: "RO", prefix: "176.126.84" },
  { country: "Canada", code: "CA", prefix: "198.54.117" },
  { country: "France", code: "FR", prefix: "185.246.188" },
  { country: "Poland", code: "PL", prefix: "194.87.233" },
];

const descriptions = {
  "IP Scraper": "Automated client scraped protected frames at abnormal request velocity.",
  "Content Bot": "Mirror bot redistributed a monitored asset through a syndication loop.",
  "Deepfake Generator": "Synthetic transformation attempt matched a known generator signature.",
  "Unauthorized API Access": "Repeated token replay pattern hit a protected API route.",
  "Proxy Crawler": "Residential proxy network enumerated alternate CDN mirrors.",
  "DMCA Evader": "Previously removed media resurfaced on a fresh domain and file path.",
  "Adversarial Probe": "Perturbation payload attempted to degrade similarity confidence.",
} satisfies Record<ThreatType, string>;

export function generateThreat(targetAsset: string): ThreatEntry {
  const type = threatTypes[Math.floor(Math.random() * threatTypes.length)];
  const severity = severities[Math.floor(Math.random() * severities.length)];
  const origin = origins[Math.floor(Math.random() * origins.length)];
  const stamp = new Date();

  return {
    id: `threat-${randomHex(10)}`,
    timestamp: stamp.toISOString(),
    type,
    ip: `${origin.prefix}.${Math.floor(Math.random() * 220) + 10}`,
    country: origin.country,
    countryCode: origin.code,
    severity,
    targetAsset,
    status: severity === "LOW" ? "MONITORING" : "ACTIVE",
    description: descriptions[type],
  };
}

export function makeThreatLogLine(entry: ThreatEntry) {
  return `[${timeLabel(new Date(entry.timestamp))}] ${entry.severity.padEnd(8, " ")} ${entry.type} @ ${entry.ip} -> ${entry.targetAsset}`;
}
