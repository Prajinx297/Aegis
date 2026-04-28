/**
 * AEGIS — Perceptual Hash Engine
 *
 * Implements a real pHash algorithm entirely in-browser using Canvas:
 *   1. Load image → draw to offscreen canvas
 *   2. Convert to grayscale
 *   3. Downscale to 32×32 via area-average resampling
 *   4. Apply 2-D DCT (Discrete Cosine Transform) on the 32×32 block
 *   5. Extract top-left 8×8 low-frequency coefficients
 *   6. Compute median of those 64 values (excluding DC)
 *   7. Threshold → 64-bit binary hash
 *
 * Also provides hamming distance and similarity percentage.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PHashResult {
  /** 64-char binary string ("0" | "1") */
  hash: string;
  /** 16-char hex representation */
  hex: string;
  /** The 8×8 low-frequency DCT matrix used for thresholding */
  dctBlock: number[];
  /** Intermediate 32×32 grayscale pixels (for debug / XAI) */
  grayscale32: number[];
}

export interface PHashComparison {
  hashA: string;
  hashB: string;
  hammingDistance: number;
  /** 0–100 similarity */
  similarity: number;
  /** Per-bit diff mask: true = bits differ */
  diffMask: boolean[];
}

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                   */
/* ------------------------------------------------------------------ */

/** Load an image source (URL, data-URI, Blob URL) into an HTMLImageElement. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/** Extract raw RGBA pixel data from an image at the requested size. */
function getPixels(
  img: HTMLImageElement,
  width: number,
  height: number,
): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}

/** Convert RGBA ImageData to a flat grayscale array (luminance). */
function toGrayscale(imageData: ImageData): number[] {
  const { data, width, height } = imageData;
  const gray = new Array<number>(width * height);
  for (let i = 0; i < gray.length; i++) {
    const offset = i * 4;
    // ITU-R BT.601 luminance
    gray[i] =
      0.299 * data[offset] +
      0.587 * data[offset + 1] +
      0.114 * data[offset + 2];
  }
  return gray;
}

/**
 * 1-D Type-II DCT (unscaled).
 * C(u) = Σ_{x=0}^{N-1} f(x) * cos( π(2x+1)u / 2N )
 */
function dct1d(input: number[]): number[] {
  const N = input.length;
  const output = new Array<number>(N);
  for (let u = 0; u < N; u++) {
    let sum = 0;
    for (let x = 0; x < N; x++) {
      sum += input[x] * Math.cos((Math.PI * (2 * x + 1) * u) / (2 * N));
    }
    output[u] = sum;
  }
  return output;
}

/**
 * 2-D DCT via separable row-then-column 1-D DCTs.
 * Input: NxN flat array (row-major).  Output: NxN flat array.
 */
function dct2d(input: number[], N: number): number[] {
  // Row-wise DCT
  const afterRows = new Array<number>(N * N);
  for (let row = 0; row < N; row++) {
    const rowData = input.slice(row * N, (row + 1) * N);
    const transformed = dct1d(rowData);
    for (let col = 0; col < N; col++) {
      afterRows[row * N + col] = transformed[col];
    }
  }

  // Column-wise DCT
  const result = new Array<number>(N * N);
  for (let col = 0; col < N; col++) {
    const colData: number[] = [];
    for (let row = 0; row < N; row++) {
      colData.push(afterRows[row * N + col]);
    }
    const transformed = dct1d(colData);
    for (let row = 0; row < N; row++) {
      result[row * N + col] = transformed[row];
    }
  }

  return result;
}

/**
 * Extract the top-left 8×8 block from an NxN matrix (row-major).
 * These are the lowest-frequency DCT coefficients.
 */
function extractBlock(matrix: number[], N: number, blockSize: number): number[] {
  const block: number[] = [];
  for (let row = 0; row < blockSize; row++) {
    for (let col = 0; col < blockSize; col++) {
      block.push(matrix[row * N + col]);
    }
  }
  return block;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Compute the perceptual hash of an image source.
 * Works entirely in-browser — no server calls.
 */
export async function computePHash(imageSrc: string): Promise<PHashResult> {
  const img = await loadImage(imageSrc);
  const SIZE = 32;
  const BLOCK = 8;

  // 1. Downscale to 32×32 and convert to grayscale
  const imageData = getPixels(img, SIZE, SIZE);
  const grayscale32 = toGrayscale(imageData);

  // 2. Apply 2-D DCT
  const dctFull = dct2d(grayscale32, SIZE);

  // 3. Extract top-left 8×8 low-frequency block
  const dctBlock = extractBlock(dctFull, SIZE, BLOCK);

  // 4. Compute median (excluding DC coefficient at [0])
  const acCoeffs = dctBlock.slice(1);
  const sorted = [...acCoeffs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];

  // 5. Generate 64-bit binary hash
  const bits = dctBlock.map((v) => (v > median ? "1" : "0"));
  const hash = bits.join("");

  // 6. Convert to hex
  let hex = "";
  for (let i = 0; i < 64; i += 4) {
    const nibble = parseInt(hash.slice(i, i + 4), 2);
    hex += nibble.toString(16);
  }

  return { hash, hex, dctBlock, grayscale32 };
}

/** Compute the Hamming distance between two 64-bit pHash strings. */
export function hammingDistance(a: string, b: string): number {
  let dist = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) dist++;
  }
  return dist;
}

/** Compare two pHash strings and return detailed comparison data. */
export function comparePHash(hashA: string, hashB: string): PHashComparison {
  const dist = hammingDistance(hashA, hashB);
  const similarity = ((64 - dist) / 64) * 100;
  const diffMask: boolean[] = [];
  for (let i = 0; i < 64; i++) {
    diffMask.push(hashA[i] !== hashB[i]);
  }
  return { hashA, hashB, hammingDistance: dist, similarity, diffMask };
}
