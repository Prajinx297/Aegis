/**
 * AEGIS — Embedding-Based Similarity Engine
 *
 * Computes image similarity using feature-vector embeddings derived
 * from pixel-level analysis.  This is a real computation pipeline:
 *
 *   1. Resize image to a canonical size (64×64)
 *   2. Extract a multi-channel histogram feature vector:
 *      - 16-bin luminance histogram
 *      - 8-bin per-channel RGB histograms (24 dims)
 *      - 8-bin edge magnitude histogram (Sobel)
 *      - 4 spatial quadrant average luminance values
 *      - 4 texture energy values (local variance per quadrant)
 *      Total: 56-dimensional feature vector
 *   3. Compute cosine similarity between two vectors
 *   4. Provide interpretable comparison with pHash similarity
 *
 * No TensorFlow or external ML libraries required.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface EmbeddingVector {
  /** The raw feature vector */
  values: number[];
  /** Human-readable labels for each dimension */
  labels: string[];
  /** Grouped breakdown for UI */
  groups: EmbeddingGroup[];
}

export interface EmbeddingGroup {
  name: string;
  startIndex: number;
  length: number;
  color: string;
}

export interface SimilarityComparison {
  /** Cosine similarity (0–1) */
  cosineSimilarity: number;
  /** Euclidean distance (lower = more similar) */
  euclideanDistance: number;
  /** pHash similarity (0–100) for side-by-side comparison */
  pHashSimilarity: number;
  /** Human-readable interpretation */
  interpretation: string;
  /** Confidence level */
  confidence: "HIGH" | "MEDIUM" | "LOW";
  /** Per-group similarity breakdown */
  groupBreakdown: Array<{ name: string; similarity: number }>;
}

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                   */
/* ------------------------------------------------------------------ */

const CANONICAL_SIZE = 64;

function getImageData(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext("2d")!;
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function resizeToCanonical(source: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = CANONICAL_SIZE;
  out.height = CANONICAL_SIZE;
  out.getContext("2d")!.drawImage(source, 0, 0, CANONICAL_SIZE, CANONICAL_SIZE);
  return out;
}

/** ITU-R BT.601 luminance from RGB */
function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** Build a normalized histogram from values in [0, maxVal) with `bins` buckets. */
function histogram(values: number[], bins: number, maxVal: number): number[] {
  const hist = new Array<number>(bins).fill(0);
  const binSize = maxVal / bins;
  for (const v of values) {
    const idx = Math.min(bins - 1, Math.floor(v / binSize));
    hist[idx]++;
  }
  // Normalize to [0, 1]
  const total = values.length || 1;
  return hist.map((count) => count / total);
}

/** Sobel edge magnitude at pixel (x, y) in a grayscale image. */
function sobelMagnitude(
  gray: number[],
  width: number,
  x: number,
  y: number,
): number {
  if (x <= 0 || x >= width - 1 || y <= 0 || y >= width - 1) return 0;
  const idx = (row: number, col: number) => row * width + col;
  const gx =
    -gray[idx(y - 1, x - 1)] +
    gray[idx(y - 1, x + 1)] +
    -2 * gray[idx(y, x - 1)] +
    2 * gray[idx(y, x + 1)] +
    -gray[idx(y + 1, x - 1)] +
    gray[idx(y + 1, x + 1)];
  const gy =
    -gray[idx(y - 1, x - 1)] +
    -2 * gray[idx(y - 1, x)] +
    -gray[idx(y - 1, x + 1)] +
    gray[idx(y + 1, x - 1)] +
    2 * gray[idx(y + 1, x)] +
    gray[idx(y + 1, x + 1)];
  return Math.sqrt(gx * gx + gy * gy);
}

/* ------------------------------------------------------------------ */
/*  Feature Extraction                                                 */
/* ------------------------------------------------------------------ */

export function extractEmbedding(canvas: HTMLCanvasElement): EmbeddingVector {
  const resized = resizeToCanonical(canvas);
  const imageData = getImageData(resized);
  const { data } = imageData;
  const N = CANONICAL_SIZE;
  const totalPixels = N * N;

  // Extract per-pixel data
  const reds: number[] = [];
  const greens: number[] = [];
  const blues: number[] = [];
  const grays: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    reds.push(data[i]);
    greens.push(data[i + 1]);
    blues.push(data[i + 2]);
    grays.push(luminance(data[i], data[i + 1], data[i + 2]));
  }

  // 1. Luminance histogram — 16 bins [0, 256)
  const lumHist = histogram(grays, 16, 256);

  // 2. RGB channel histograms — 8 bins each
  const rHist = histogram(reds, 8, 256);
  const gHist = histogram(greens, 8, 256);
  const bHist = histogram(blues, 8, 256);

  // 3. Edge magnitude histogram — 8 bins
  const edgeMags: number[] = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      edgeMags.push(sobelMagnitude(grays, N, x, y));
    }
  }
  const maxEdge = Math.max(...edgeMags, 1);
  const edgeHist = histogram(edgeMags, 8, maxEdge + 1);

  // 4. Spatial quadrant averages (2×2 grid)
  const half = N / 2;
  const quadrants = [
    { startR: 0, endR: half, startC: 0, endC: half },
    { startR: 0, endR: half, startC: half, endC: N },
    { startR: half, endR: N, startC: 0, endC: half },
    { startR: half, endR: N, startC: half, endC: N },
  ];

  const quadAvg: number[] = [];
  const quadVar: number[] = [];

  for (const q of quadrants) {
    let sum = 0;
    let count = 0;
    const values: number[] = [];
    for (let r = q.startR; r < q.endR; r++) {
      for (let c = q.startC; c < q.endC; c++) {
        const val = grays[r * N + c];
        sum += val;
        values.push(val);
        count++;
      }
    }
    const avg = sum / count;
    quadAvg.push(avg / 255); // Normalize to [0, 1]

    // Variance (texture energy)
    let varSum = 0;
    for (const v of values) {
      varSum += (v - avg) ** 2;
    }
    quadVar.push(Math.sqrt(varSum / count) / 128); // Normalized std dev
  }

  // Assemble the full feature vector
  const values = [
    ...lumHist, // 0–15: luminance
    ...rHist, // 16–23: red channel
    ...gHist, // 24–31: green channel
    ...bHist, // 32–39: blue channel
    ...edgeHist, // 40–47: edge magnitude
    ...quadAvg, // 48–51: spatial luminance
    ...quadVar, // 52–55: texture energy
  ];

  // Build labels
  const labels: string[] = [
    ...lumHist.map((_, i) => `Lum Bin ${i}`),
    ...rHist.map((_, i) => `Red Bin ${i}`),
    ...gHist.map((_, i) => `Green Bin ${i}`),
    ...bHist.map((_, i) => `Blue Bin ${i}`),
    ...edgeHist.map((_, i) => `Edge Bin ${i}`),
    "Q1 Avg Lum",
    "Q2 Avg Lum",
    "Q3 Avg Lum",
    "Q4 Avg Lum",
    "Q1 Texture",
    "Q2 Texture",
    "Q3 Texture",
    "Q4 Texture",
  ];

  const groups: EmbeddingGroup[] = [
    { name: "Luminance", startIndex: 0, length: 16, color: "#6366F1" },
    { name: "Red Channel", startIndex: 16, length: 8, color: "#EF4444" },
    { name: "Green Channel", startIndex: 24, length: 8, color: "#10B981" },
    { name: "Blue Channel", startIndex: 32, length: 8, color: "#3B82F6" },
    { name: "Edge Magnitude", startIndex: 40, length: 8, color: "#F59E0B" },
    { name: "Spatial", startIndex: 48, length: 4, color: "#22D3EE" },
    { name: "Texture", startIndex: 52, length: 4, color: "#A855F7" },
  ];

  return { values, labels, groups };
}

/* ------------------------------------------------------------------ */
/*  Similarity Computation                                             */
/* ------------------------------------------------------------------ */

/** Cosine similarity between two vectors. */
export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

/** Euclidean distance between two vectors. */
export function euclideanDistance(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < len; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

/** Per-group cosine similarity. */
function groupSimilarity(
  a: number[],
  b: number[],
  groups: EmbeddingGroup[],
): Array<{ name: string; similarity: number }> {
  return groups.map((g) => {
    const sliceA = a.slice(g.startIndex, g.startIndex + g.length);
    const sliceB = b.slice(g.startIndex, g.startIndex + g.length);
    return { name: g.name, similarity: cosineSimilarity(sliceA, sliceB) };
  });
}

/** Interpret the relationship between embedding similarity and pHash similarity. */
function interpret(
  cosine: number,
  pHash: number,
): { text: string; confidence: "HIGH" | "MEDIUM" | "LOW" } {
  const embPct = cosine * 100;

  if (embPct > 90 && pHash > 90) {
    return {
      text: "Both perceptual hash and embedding analysis strongly agree — these are near-identical images. The structural layout and color distribution are virtually unchanged.",
      confidence: "HIGH",
    };
  }

  if (embPct > 75 && pHash > 75) {
    return {
      text: "High agreement between hash and embedding similarity. The images share substantial visual features, consistent with a copy or minor edit.",
      confidence: "HIGH",
    };
  }

  if (Math.abs(embPct - pHash) > 25) {
    if (embPct > pHash) {
      return {
        text: "Embedding similarity is significantly higher than pHash similarity. This pattern is typical of spatial/geometric attacks (rotation, crop) that break hash alignment but preserve visual content.",
        confidence: "MEDIUM",
      };
    }
    return {
      text: "pHash similarity is higher than embedding similarity. This may indicate color-space manipulation (saturation, hue shifts) that preserves structure but alters feature distributions.",
      confidence: "MEDIUM",
    };
  }

  if (embPct < 50 && pHash < 50) {
    return {
      text: "Both methods indicate low similarity — the images are likely unrelated or have undergone extreme transformation.",
      confidence: "LOW",
    };
  }

  return {
    text: "Moderate similarity detected. The images share some visual elements but differ enough that manual review is recommended.",
    confidence: "MEDIUM",
  };
}

/** Full comparison between two images using both embedding and pHash similarity. */
export function compareEmbeddings(
  embA: EmbeddingVector,
  embB: EmbeddingVector,
  pHashSimilarity: number,
): SimilarityComparison {
  const cosine = cosineSimilarity(embA.values, embB.values);
  const euclidean = euclideanDistance(embA.values, embB.values);
  const { text, confidence } = interpret(cosine, pHashSimilarity);
  const groupBreakdown = groupSimilarity(embA.values, embB.values, embA.groups);

  return {
    cosineSimilarity: cosine,
    euclideanDistance: euclidean,
    pHashSimilarity,
    interpretation: text,
    confidence,
    groupBreakdown,
  };
}
