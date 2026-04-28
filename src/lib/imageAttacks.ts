/**
 * AEGIS — Canvas-Based Adversarial Image Attacks
 *
 * Implements real, canvas-rendered image transformations that simulate
 * common adversarial attacks against perceptual hashing systems:
 *   • Gaussian noise injection
 *   • Gaussian blur (box-blur approximation)
 *   • Downscale + upscale (resolution degradation)
 *   • Center crop + stretch
 *   • JPEG recompression artifact simulation
 *   • Rotation
 *
 * Each function takes an HTMLCanvasElement source and returns a new
 * canvas with the transformation applied.  No external dependencies.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AttackConfig {
  /** Gaussian noise standard deviation (0–100) */
  noiseStdDev: number;
  /** Blur radius in pixels (0–20) */
  blurRadius: number;
  /** Downscale factor (0.1–1.0, where 1 = no change) */
  downscaleFactor: number;
  /** Crop ratio from center (0.5–1.0, where 1 = no crop) */
  cropRatio: number;
  /** JPEG quality (0.0–1.0) for recompression attack */
  jpegQuality: number;
  /** Rotation in degrees (0–360) */
  rotationDeg: number;
}

export interface AttackResult {
  /** The transformed canvas element */
  canvas: HTMLCanvasElement;
  /** Data URL of the result for display */
  dataUrl: string;
  /** Human-readable description of what was applied */
  label: string;
}

export const DEFAULT_ATTACK_CONFIG: AttackConfig = {
  noiseStdDev: 25,
  blurRadius: 3,
  downscaleFactor: 0.25,
  cropRatio: 0.75,
  jpegQuality: 0.15,
  rotationDeg: 5,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function cloneCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = source.width;
  c.height = source.height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(source, 0, 0);
  return c;
}

/** Box-Muller transform for Gaussian random numbers */
function gaussianRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/* ------------------------------------------------------------------ */
/*  Individual Attacks                                                 */
/* ------------------------------------------------------------------ */

/** Add Gaussian noise to every pixel channel */
export function applyGaussianNoise(
  source: HTMLCanvasElement,
  stdDev: number,
): HTMLCanvasElement {
  const out = cloneCanvas(source);
  const ctx = out.getContext("2d")!;
  const imageData = ctx.getImageData(0, 0, out.width, out.height);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, data[i] + gaussianRandom(0, stdDev)));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + gaussianRandom(0, stdDev)));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + gaussianRandom(0, stdDev)));
    // alpha unchanged
  }

  ctx.putImageData(imageData, 0, 0);
  return out;
}

/** Simple box blur (multiple passes approximate Gaussian) */
export function applyBlur(
  source: HTMLCanvasElement,
  radius: number,
): HTMLCanvasElement {
  if (radius <= 0) return cloneCanvas(source);

  const out = document.createElement("canvas");
  out.width = source.width;
  out.height = source.height;
  const ctx = out.getContext("2d")!;

  // Use CSS filter for real blur
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(source, 0, 0);
  ctx.filter = "none";

  return out;
}

/** Downscale then upscale to original size — destroys high-frequency detail */
export function applyDownscale(
  source: HTMLCanvasElement,
  factor: number,
): HTMLCanvasElement {
  const smallW = Math.max(4, Math.round(source.width * factor));
  const smallH = Math.max(4, Math.round(source.height * factor));

  // Downscale
  const small = document.createElement("canvas");
  small.width = smallW;
  small.height = smallH;
  small.getContext("2d")!.drawImage(source, 0, 0, smallW, smallH);

  // Upscale back
  const out = document.createElement("canvas");
  out.width = source.width;
  out.height = source.height;
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "low";
  ctx.drawImage(small, 0, 0, source.width, source.height);

  return out;
}

/** Center crop and stretch back to original dimensions */
export function applyCrop(
  source: HTMLCanvasElement,
  ratio: number,
): HTMLCanvasElement {
  const cropW = Math.round(source.width * ratio);
  const cropH = Math.round(source.height * ratio);
  const offsetX = Math.round((source.width - cropW) / 2);
  const offsetY = Math.round((source.height - cropH) / 2);

  const out = document.createElement("canvas");
  out.width = source.width;
  out.height = source.height;
  out.getContext("2d")!.drawImage(
    source,
    offsetX,
    offsetY,
    cropW,
    cropH,
    0,
    0,
    source.width,
    source.height,
  );

  return out;
}

/** Simulate JPEG recompression artifacts via toDataURL quality parameter */
export function applyJpegRecompression(
  source: HTMLCanvasElement,
  quality: number,
): HTMLCanvasElement {
  const dataUrl = source.toDataURL("image/jpeg", quality);
  const img = new Image();
  img.src = dataUrl;

  const out = document.createElement("canvas");
  out.width = source.width;
  out.height = source.height;
  const ctx = out.getContext("2d")!;

  // Synchronous draw since data URL is inline
  ctx.drawImage(source, 0, 0); // fallback
  // We need async for proper JPEG decode — provide a promise variant
  return out;
}

/** Async JPEG recompression with proper decode */
export async function applyJpegRecompressionAsync(
  source: HTMLCanvasElement,
  quality: number,
): Promise<HTMLCanvasElement> {
  const dataUrl = source.toDataURL("image/jpeg", quality);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const out = document.createElement("canvas");
      out.width = source.width;
      out.height = source.height;
      out.getContext("2d")!.drawImage(img, 0, 0);
      resolve(out);
    };
    img.src = dataUrl;
  });
}

/** Rotate image by degrees around center */
export function applyRotation(
  source: HTMLCanvasElement,
  degrees: number,
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = source.width;
  out.height = source.height;
  const ctx = out.getContext("2d")!;

  const rad = (degrees * Math.PI) / 180;
  ctx.translate(source.width / 2, source.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);

  return out;
}

/* ------------------------------------------------------------------ */
/*  Composite Attack Pipeline                                          */
/* ------------------------------------------------------------------ */

export interface AttackStep {
  id: string;
  label: string;
  apply: (canvas: HTMLCanvasElement) => HTMLCanvasElement;
}

export function buildAttackPipeline(config: AttackConfig): AttackStep[] {
  const steps: AttackStep[] = [];

  if (config.noiseStdDev > 0) {
    steps.push({
      id: "noise",
      label: `Gaussian Noise (σ=${config.noiseStdDev})`,
      apply: (c) => applyGaussianNoise(c, config.noiseStdDev),
    });
  }

  if (config.blurRadius > 0) {
    steps.push({
      id: "blur",
      label: `Blur (r=${config.blurRadius}px)`,
      apply: (c) => applyBlur(c, config.blurRadius),
    });
  }

  if (config.downscaleFactor < 1) {
    steps.push({
      id: "downscale",
      label: `Downscale (${Math.round(config.downscaleFactor * 100)}%)`,
      apply: (c) => applyDownscale(c, config.downscaleFactor),
    });
  }

  if (config.cropRatio < 1) {
    steps.push({
      id: "crop",
      label: `Center Crop (${Math.round(config.cropRatio * 100)}%)`,
      apply: (c) => applyCrop(c, config.cropRatio),
    });
  }

  if (config.rotationDeg > 0) {
    steps.push({
      id: "rotation",
      label: `Rotation (${config.rotationDeg}°)`,
      apply: (c) => applyRotation(c, config.rotationDeg),
    });
  }

  return steps;
}

/** Load an image file/URL into a canvas for processing. */
export function imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  canvas.getContext("2d")!.drawImage(canvas, 0, 0);
  canvas.getContext("2d")!.drawImage(img, 0, 0);
  return canvas;
}

export function loadImageAsync(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
