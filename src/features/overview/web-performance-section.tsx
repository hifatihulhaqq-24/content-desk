"use client";

import { StatCard } from "@/components/data/stat-card";
import { EmptyState, ErrorState } from "@/components/data/states";
import type { QueryUiState } from "@/hooks/use-analytics";
import type { WebStats } from "@/types/analytics";
import { sparklineFromTrend } from "./overview-helpers";

interface WebPerformanceSectionProps {
  status: QueryUiState;
  stats: WebStats;
  onRetry: () => void;
}

export function WebPerformanceSection({
  status,
  stats,
  onRetry,
}: WebPerformanceSectionProps) {
  if (status === "error") {
    return <ErrorState onRetry={onRetry} />;
  }

  if (status === "loading") {
    return (
      <section className="space-y-4">
        <SectionHeading />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <StatCard key={index} label="" value={0} loading />
          ))}
        </div>
      </section>
    );
  }

  if (status === "empty") {
    return (
      <section className="space-y-4">
        <SectionHeading />
        <EmptyState
          title="Belum ada trafik"
          message="Belum ada aktivitas situs web pada periode ini."
        />
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <SectionHeading />
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.kpis.map((kpi) => (
          <StatCard
            key={kpi.key}
            label={kpi.label}
            value={kpi.value}
            format={kpi.format}
            deltaPercent={kpi.deltaPercent}
            sparkline={sparklineFromTrend(stats.points, kpi.key)}
          />
        ))}
      </div>
    </section>
  );
}

function SectionHeading() {
  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <h2 className="text-lg font-semibold">📊 Performa Web</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Aktivitas situs web secara menyeluruh — tidak terfilter cluster.
        </p>
      </div>
    </div>
  );
}
