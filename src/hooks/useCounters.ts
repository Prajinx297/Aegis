import { useMemo } from "react";
import { useCountUp } from "@/hooks/useCountUp";

export function useCounters(metrics: Array<{ value: number; duration?: number; decimals?: number }>) {
  const animated = metrics.map((metric) =>
    useCountUp(metric.value, metric.duration ?? 1200, metric.decimals ?? 0),
  );

  return useMemo(() => animated, [animated]);
}
