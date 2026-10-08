"use client";

import { StatCard } from "@/components/data/stat-card";
import { ErrorState } from "@/components/data/states";
import type { QueryUiState } from "@/hooks/use-analytics";
import type { KpiMetric, TrendPoint } from "@/types/analytics";
import { sparklineFromTrend } from "./overview-helpers";
import { formatDateShort } from "@/lib/format";

/** Singkatan hari (Bahasa Indonesia) untuk label sumbu sparkline KPI. */
const WEEKDAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function weekdayLabel(iso: string): string {
  const day = new Date(`${iso}T00:00:00`).getDay();
  return WEEKDAY_LABELS[day] ?? "";
}

interface KpiSectionProps {
  status: QueryUiState;
  kpis: KpiMetric[];
  /** Titik tren periode berjalan (solid). */
  trendPoints: TrendPoint[];
  /** Titik tren periode sebelumnya (garis putus-putus). */
  previousPoints: TrendPoint[];
  onRetry: () => void;
  /** Label periode berjalan pada legenda, mis. "7 hari ini". */
  currentLabel?: string;
  /** Label pembanding pada legenda, mis. "hari yang sama minggu lalu". */
  previousLabel?: string;
}

export function KpiSection({
  status,
  kpis,
  trendPoints,
  previousPoints,
  onRetry,
  currentLabel = "periode ini",
  previousLabel = "periode sebelumnya",
}: KpiSectionProps) {
  if (status === "error") {
    return <ErrorState onRetry={onRetry} />;
  }

  const axisLabels =
    trendPoints.length > 1 ? trendPoints.map((point) => weekdayLabel(point.date)) : null;
  const pointLabels = trendPoints.map((point) => formatDateShort(point.date));

  if (status === "loading") {
    return (
      <div className="grid gap-3 min-[600px]:grid-cols-2 min-[1100px]:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <StatCard key={index} label="" value={0} loading />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid gap-3 min-[600px]:grid-cols-2 min-[1100px]:grid-cols-4">
        {kpis.map((kpi) => (
          <StatCard
            key={kpi.key}
            label={kpi.label}
            value={kpi.value}
            format={kpi.format}
            deltaPercent={kpi.deltaPercent}
            deltaUnit="%"
            sparkline={sparklineFromTrend(trendPoints, kpi.key)}
            previousSparkline={sparklineFromTrend(previousPoints, kpi.key)}
            sparklineLabels={pointLabels}
            axisLabels={axisLabels}
          />
        ))}
      </div>
      <div
        className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
        aria-hidden
      >
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-0.5 w-4 rounded-full bg-[var(--chart-1)]"
            aria-hidden
          />
          {currentLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 border-t border-dashed border-muted-foreground" />
          {previousLabel}
        </span>
      </div>
    </div>
  );
}
