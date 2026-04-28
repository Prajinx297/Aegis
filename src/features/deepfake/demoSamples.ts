export const deepfakePipeline = [
  { id: "load", label: "Loading EfficientNet-B4 detection model...", duration: 700 },
  { id: "landmarks", label: "Extracting facial landmarks (468 keypoints)...", duration: 900 },
  { id: "dct", label: "Analyzing frequency domain artifacts via DCT...", duration: 1000 },
  { id: "gan", label: "Running GAN fingerprint detector...", duration: 850 },
  { id: "signatures", label: "Cross-referencing against known generator signatures...", duration: 950 },
  { id: "heatmap", label: "Generating explainability heatmap...", duration: 800 },
];

export const deepfakeSamples = [
  {
    id: "authentic",
    title: "Authentic Photo",
    confidence: 3.1,
    verdict: "AUTHENTIC",
    generator: "None detected",
    features: [12, 18, 10, 8, 6],
  },
  {
    id: "gan",
    title: "GAN-Generated Face",
    confidence: 96.4,
    verdict: "LIKELY AI-GENERATED",
    generator: "StyleGAN3 (84% confidence)",
    features: [91, 78, 65, 88, 84],
  },
  {
    id: "partial",
    title: "Partially Manipulated",
    confidence: 61.2,
    verdict: "LIKELY AI-GENERATED",
    generator: "FaceSwap Hybrid (63% confidence)",
    features: [64, 52, 71, 58, 49],
  },
];
