import { useMemo } from "react";
import { useSimulation } from "@/hooks/useSimulation";
import type { ThreatSeverity, ThreatType } from "@/lib/types";

interface FeedFilters {
  severity?: ThreatSeverity | "ALL";
  type?: ThreatType | "ALL";
  query?: string;
}

export function useThreatFeed(filters?: FeedFilters) {
  const simulation = useSimulation();

  const filteredThreats = useMemo(() => {
    return simulation.threats.filter((threat) => {
      const matchesSeverity = !filters?.severity || filters.severity === "ALL" || threat.severity === filters.severity;
      const matchesType = !filters?.type || filters.type === "ALL" || threat.type === filters.type;
      const query = filters?.query?.trim().toLowerCase();
      const matchesQuery =
        !query ||
        threat.ip.toLowerCase().includes(query) ||
        threat.targetAsset.toLowerCase().includes(query) ||
        threat.description.toLowerCase().includes(query);
      return matchesSeverity && matchesType && matchesQuery;
    });
  }, [filters?.query, filters?.severity, filters?.type, simulation.threats]);

  return {
    ...simulation,
    filteredThreats,
  };
}
