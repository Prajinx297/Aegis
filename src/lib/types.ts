export type AssetType = "Image" | "Video" | "Audio" | "Code" | "Document";
export type LicenseType = "CC-BY" | "CC-BY-SA" | "All Rights Reserved" | "Custom";
export type ThreatSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type ThreatType =
  | "IP Scraper"
  | "Content Bot"
  | "Deepfake Generator"
  | "Unauthorized API Access"
  | "Proxy Crawler"
  | "DMCA Evader"
  | "Adversarial Probe";

export type ThreatStatus =
  | "ACTIVE"
  | "INVESTIGATING"
  | "BLOCKED"
  | "DMCA_FILED"
  | "MONITORING";

export type DmcaStatus = "Pending" | "Under Review" | "Content Removed" | "Escalated";

export interface AssetRecord {
  id: string;
  name: string;
  type: AssetType;
  license: LicenseType;
  tags: string[];
  size: string;
  createdAt: string;
  fingerprint: string;
  phash: string;
  sha256: string;
  chainHash: string;
  certificateId: string;
  status: "Anchored" | "Protected" | "Monitoring";
}

export interface ThreatEntry {
  id: string;
  timestamp: string;
  type: ThreatType;
  ip: string;
  country: string;
  countryCode: string;
  severity: ThreatSeverity;
  targetAsset: string;
  status: ThreatStatus;
  description: string;
}

export interface DmcaCase {
  id: string;
  assetId: string;
  assetName: string;
  platform: string;
  infringingUrl: string;
  filedDate: string;
  status: DmcaStatus;
  expectedResolution: string;
  infringementType: string;
  timeline: Array<{ label: string; at: string; note: string }>;
  notice: string;
}

export interface DailyMetric {
  date: string;
  threats: number;
  resolved: number;
  accuracy: number;
  revenueProtected: number;
}

export interface CountryThreat {
  country: string;
  code: string;
  threats: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  tone: "success" | "error" | "info";
}

export interface WatchDomain {
  id: string;
  domain: string;
  lastScanned: string;
  threatsFound: number;
  status: "Healthy" | "Monitoring" | "Flagged";
}

export interface DetectionMatch {
  id: string;
  assetName: string;
  similarity: number;
  matchType: "Exact" | "Near-Duplicate" | "Derivative";
}
