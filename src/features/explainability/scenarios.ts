export const explainabilityScenarios = {
  image: {
    label: "Image Similarity Match",
    verdict: "Near-duplicate match confirmed",
    confidence: 87.3,
    features: [
      { name: "Cosine similarity", score: 0.91, tone: "positive" as const },
      { name: "pHash hamming distance", score: 0.82, tone: "positive" as const },
      { name: "Frequency artifact score", score: 0.64, tone: "positive" as const },
      { name: "Crop variance", score: -0.18, tone: "negative" as const },
      { name: "Watermark visibility", score: 0.51, tone: "positive" as const },
      { name: "JPEG recompression", score: 0.48, tone: "positive" as const },
    ],
    explanation:
      "The model flagged this image as a near-duplicate (87.3% confidence) primarily because the neural fingerprint cosine similarity exceeded the 0.82 threshold. The perceptual hash Hamming distance was 4 bits, indicating structural identity despite JPEG recompression. The frequency-domain artifact score also crossed the alert threshold, suggesting the copy may have been re-encoded to evade hash-based detection.",
    probabilities: [
      { className: "Near-duplicate", value: 87.3 },
      { className: "Derivative", value: 8.5 },
      { className: "Benign", value: 4.2 },
    ],
  },
  deepfake: {
    label: "Deepfake Detection",
    verdict: "Synthetic face likely detected",
    confidence: 96.4,
    features: [
      { name: "Facial inconsistency", score: 0.91, tone: "positive" as const },
      { name: "GAN fingerprint", score: 0.84, tone: "positive" as const },
      { name: "Blending boundary", score: 0.88, tone: "positive" as const },
      { name: "Lighting continuity", score: -0.23, tone: "negative" as const },
      { name: "Temporal coherence", score: 0.65, tone: "positive" as const },
      { name: "DCT anomaly score", score: 0.78, tone: "positive" as const },
    ],
    explanation:
      "The detector rated this sample as likely AI-generated because multiple independent signals converged on the same conclusion. The GAN fingerprint classifier matched a StyleGAN3-like signature, while the facial landmark graph showed asymmetric motion around the mouth and eyelids. Those patterns raised confidence well above the deployment threshold.",
    probabilities: [
      { className: "Synthetic", value: 96.4 },
      { className: "Manipulated", value: 2.7 },
      { className: "Authentic", value: 0.9 },
    ],
  },
  threat: {
    label: "Threat Classification",
    verdict: "Coordinated proxy crawler",
    confidence: 92.1,
    features: [
      { name: "IP rotation velocity", score: 0.87, tone: "positive" as const },
      { name: "User-agent entropy", score: 0.72, tone: "positive" as const },
      { name: "Request burst pattern", score: 0.83, tone: "positive" as const },
      { name: "Geo consistency", score: -0.11, tone: "negative" as const },
      { name: "Asset targeting overlap", score: 0.69, tone: "positive" as const },
      { name: "Historical correlation", score: 0.77, tone: "positive" as const },
    ],
    explanation:
      "AEGIS classified this event as a coordinated proxy crawler because the source rotated across multiple subnets while preserving a consistent scrape cadence and target asset pattern. Historical correlation with prior takedown evasion campaigns amplified the confidence score and reduced the likelihood of a benign crawler.",
    probabilities: [
      { className: "Proxy crawler", value: 92.1 },
      { className: "IP scraper", value: 5.4 },
      { className: "Benign bot", value: 2.5 },
    ],
  },
};
