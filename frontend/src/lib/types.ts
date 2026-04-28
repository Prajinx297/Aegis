export interface FingerprintResult {
  sha256: string;
  phash: string | null;
  ahash: string | null;
  dhash: string | null;
  colorhash: string | null;
  fingerprint_vector: number[];
  timestamp: string;
  file_size_bytes: number;
  mime_type: string;
}

export interface CompareResult {
  hamming_distance: number;
  similarity_percent: number;
  verdict: "IDENTICAL" | "NEAR_DUPLICATE" | "SIMILAR" | "DIFFERENT";
  threshold_used: number;
}

export interface BlockchainResult {
  tx_hash: string | null;
  block_number: number | null;
  block_timestamp: number | null;
  gas_used: number | null;
  etherscan_url: string | null;
  anchored_hash: string;
  status: "CONFIRMED" | "FAILED";
  error?: string;
}

export interface Asset {
  asset_id: string;
  owner_uid: string;
  title: string;
  asset_type: string;
  license: string;
  tags: string[];
  fingerprints: { sha256: string; phash: string | null; ahash: string | null; dhash: string | null; colorhash?: string | null };
  blockchain: { tx_hash?: string; block_number?: number; etherscan_url?: string; status?: string; error?: string } | null;
  registered_at?: string;
  status: string;
}

export interface DetectionResult {
  url_scanned: string | null;
  images_found: number;
  images_analyzed: number;
  matches: Array<{
    page_image_url?: string | null;
    matched_asset_id: string;
    matched_asset_title: string;
    hamming_distance: number;
    similarity_percent: number;
    verdict: string;
  }>;
  scan_duration_seconds: number;
  scanned_at: string;
  fingerprint?: FingerprintResult;
}

export interface DmcaResult {
  notice_text: string;
  word_count: number;
  generated_at: string;
  model_used: string;
  case_id: string;
}

export interface ThreatClassification {
  threat_type: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  confidence: number;
  reasoning: string;
  recommended_action: "BLOCK" | "MONITOR" | "IGNORE";
  log_entry: string;
  timestamp: string;
  model_used: string;
}

export interface IpIntelResult {
  status: string;
  country?: string;
  countryCode?: string;
  city?: string;
  isp?: string;
  org?: string;
  is_proxy?: boolean;
  is_hosting?: boolean;
}
