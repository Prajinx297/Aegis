import type { DailyMetric } from "@/lib/types";

const today = new Date("2026-04-24T00:00:00Z");

export const mockAnalytics: DailyMetric[] = Array.from({ length: 90 }, (_, index) => {
  const day = new Date(today);
  day.setUTCDate(today.getUTCDate() - (89 - index));
  const wave = Math.sin(index / 5) * 9 + 32;
  const spikes = index % 17 === 0 ? 18 : index % 11 === 0 ? 9 : 0;
  const threats = Math.max(12, Math.round(wave + spikes));
  const resolved = Math.max(10, Math.round(threats * (0.76 + ((index % 7) * 0.02))));
  const accuracy = Math.min(98.7, 92.1 + index * 0.07 + (index % 4) * 0.08);
  const revenueProtected = 32000 + index * 4800 + threats * 620;

  return {
    date: day.toISOString().slice(0, 10),
    threats,
    resolved,
    accuracy: Number(accuracy.toFixed(1)),
    revenueProtected,
  };
});
