import { randomHex } from "@/lib/format";

export function generateCertificateId() {
  return `AEGIS-${randomHex(4).toUpperCase()}-${randomHex(4).toUpperCase()}`;
}

export function generateTxHash() {
  return `0x${randomHex(64)}`;
}
