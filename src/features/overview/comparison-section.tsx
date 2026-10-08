"use client";

import { BarChart } from "@/components/data/bar-chart";
import { ChartCard } from "@/components/data/chart-card";
import type { QueryUiState } from "@/hooks/use-analytics";
import type { PlatformComparisonPoint } from "@/types/analytics";

interface ComparisonSectionProps {
  status: QueryUiState;
  comparison: PlatformComparisonPoint[];
  onRetry: () => void;
}

export function ComparisonSection({
  status,
  comparison,
  onRetry,
}: ComparisonSectionProps) {
  const cardStatus =
    status === "loading" ? "pending" : status === "error" ? "error" : "success";

  const rows = comparison.map((point) => ({
    name: point.name,
    value: point.metrics.reach ?? 0,
  }));
  const barColors = Object.fromEntries(
    comparison.map((point) => [point.name, point.color])
  );
  const isEmpty =
    status === "empty" || rows.every((row) => row.value === 0);

  return (
    <ChartCard
      title="Perbandingan Platform"
      description="Kontribusi reach per platform pada periode ini"
      status={cardStatus}
      isEmpty={isEmpty}
      onRetry={onRetry}
      height={260}
    >
      <BarChart
        data={rows}
        xKey="name"
        bars={[{ key: "value", label: "Reach" }]}
        orientation="horizontal"
        barColors={barColors}
        height={260}
        showLegend={false}
      />
    </ChartCard>
  );
}
