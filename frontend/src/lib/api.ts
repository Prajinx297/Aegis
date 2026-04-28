import axios from "axios";
import { auth } from "@/lib/firebase";
import type {
  Asset,
  BlockchainResult,
  CompareResult,
  DetectionResult,
  DmcaResult,
  FingerprintResult,
  IpIntelResult,
  ThreatClassification,
} from "@/lib/types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use(async (config) => {
  const token = await auth.currentUser?.getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const fileForm = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return form;
};

export async function fingerprintFile(file: File) {
  const { data } = await api.post<FingerprintResult>("/api/fingerprint", fileForm(file));
  return data;
}

export async function compareFingerprints(phash1: string, phash2: string) {
  const { data } = await api.post<CompareResult>("/api/fingerprint/compare", { phash1, phash2 });
  return data;
}

export async function anchorToBlockchain(input: { asset_id: string; sha256_hash: string; phash?: string | null; owner_uid: string }) {
  const { data } = await api.post<BlockchainResult>("/api/blockchain/anchor", input);
  return data;
}

export async function verifyBlockchain(txHash: string) {
  const { data } = await api.get(`/api/blockchain/verify/${txHash}`);
  return data;
}

export async function generateDmcaNotice(input: Record<string, string>) {
  const { data } = await api.post<DmcaResult>("/api/dmca/generate", input);
  return data;
}

export async function analyzeUrl(url: string) {
  const { data } = await api.post("/api/dmca/analyze-url", { url });
  return data;
}

export async function classifyThreat(log_entry: string) {
  const { data } = await api.post<ThreatClassification>("/api/threats/classify", { log_entry });
  return data;
}

export async function getIpIntel(ip: string) {
  const { data } = await api.get<IpIntelResult>(`/api/threats/ip-intel/${ip}`);
  return data;
}

export async function registerAsset(formData: FormData) {
  const { data } = await api.post<Asset>("/api/assets", formData);
  return data;
}

export async function getAssets() {
  const { data } = await api.get<Asset[]>("/api/assets");
  return data;
}

export async function detectUrl(url: string) {
  const { data } = await api.post<DetectionResult>("/api/detect/url", { url, owner_uid: auth.currentUser?.uid });
  return data;
}

export async function detectFile(file: File) {
  const { data } = await api.post<DetectionResult>("/api/detect/file", fileForm(file));
  return data;
}
