"use client";

import { StatCard } from "@/components/data/stat-card";
import { ErrorState } from "@/components/data/states";
import type { QueryUiState } from "@/hooks/use-analytics";
import type { KpiMetric, TrendPoint } from "@/types/analytics";
import { sparklineFromTrend } from "./overview-helpers";

interface KpiSectionProps {
  status: QueryUiState;
  kpis: KpiMetric[];
  trendPoints: TrendPoint[];
  onRetry: () => void;
}

export function KpiSection({
  status,
  kpis,
  trendPoints,
  onRetry,
}: KpiSectionProps) {
  if (status === "error") {
    return <ErrorState onRetry={onRetry} />;
  }

  if (status === "loading") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <StatCard key={index} label="" value={0} loading />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <StatCard
          key={kpi.key}
          label={kpi.label}
          value={kpi.value}
          format={kpi.format}
          deltaPercent={kpi.deltaPercent}
          sparkline={sparklineFromTrend(trendPoints, kpi.key)}
        />
      ))}
    </div>
  );
}
