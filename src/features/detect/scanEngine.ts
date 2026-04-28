import type { DetectionMatch } from "@/lib/types";

export const detectScanSteps = [
  { id: "fetch", label: "Fetching page content...", duration: 800 },
  { id: "extract", label: "Extracting media assets... Found 14 images, 2 videos", duration: 1500 },
  { id: "match", label: "Running neural similarity matching against your 1,247 registered assets...", duration: 2500 },
  { id: "complete", label: "Analysis complete.", duration: 1000 },
];

export const detectMatches: DetectionMatch[] = [
  { id: "match-1", assetName: "UCL_Final_Opening_Cut.mp4", similarity: 94.8, matchType: "Exact" },
  { id: "match-2", assetName: "MatchDay_Promo_Poster.png", similarity: 86.1, matchType: "Near-Duplicate" },
  { id: "match-3", assetName: "Coach_Tactics_Board.png", similarity: 78.4, matchType: "Derivative" },
];
