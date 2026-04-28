async function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });
}

export async function computePHash(file: File): Promise<string> {
  const image = await fileToImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable");
  ctx.drawImage(image, 0, 0, 32, 32);
  const pixels = ctx.getImageData(0, 0, 32, 32).data;
  const gray32: number[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    gray32.push(0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]);
  }
  const values: number[] = [];
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      let sum = 0;
      for (let yy = 0; yy < 4; yy += 1) {
        for (let xx = 0; xx < 4; xx += 1) {
          sum += gray32[(y * 4 + yy) * 32 + x * 4 + xx];
        }
      }
      values.push(sum / 16);
    }
  }
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  let bits = "";
  for (const value of values) bits += value > mean ? "1" : "0";
  let hex = "";
  for (let i = 0; i < bits.length; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex.padStart(16, "0");
}

export function hammingDistance(hash1: string, hash2: string): number {
  const a = BigInt(`0x${hash1}`);
  const b = BigInt(`0x${hash2}`);
  let xor = a ^ b;
  let count = 0;
  while (xor > 0n) {
    count += Number(xor & 1n);
    xor >>= 1n;
  }
  return count;
}

export function similarity(hash1: string, hash2: string): number {
  return ((64 - hammingDistance(hash1, hash2)) / 64) * 100;
}
