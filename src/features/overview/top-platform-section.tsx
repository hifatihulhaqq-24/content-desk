"use client";

import { ChartCard } from "@/components/data/chart-card";
import { BarChart, type BarRow } from "@/components/data/bar-chart";
import { BRAND_PATHS } from "@/components/icons/brand-paths";
import type { QueryUiState } from "@/hooks/use-analytics";
import { formatCompact } from "@/lib/format";
import type { PlatformId, PlatformSummary } from "@/types/analytics";

interface TopPlatformSectionProps {
  status: QueryUiState;
  summaries: PlatformSummary[];
  onRetry: () => void;
}

const Y_AXIS_WIDTH = 128;
const LABEL_MARGIN = 24;
const ICON_SIZE = 24;
const ICON_X = 6;
const TEXT_X = ICON_X + ICON_SIZE + 6;

type PlatformBarRow = BarRow & {
  platform: PlatformId;
};

function platformColor(row: BarRow): string {
  const color = row.color;
  return typeof color === "string" ? color : "var(--chart-1)";
}

function renderYTick(row: BarRow) {
  const platform = String(row.platform ?? "");
  const name = String(row.name ?? "");
  const color = platformColor(row);
  const path = BRAND_PATHS[platform as PlatformId];
  return (
    <g>
      {path && (
        <svg
          x={ICON_X}
          y={-ICON_SIZE / 2}
          width={ICON_SIZE}
          height={ICON_SIZE}
          viewBox="0 0 24 24"
          fill={color}
          aria-hidden
        >
          <path d={path} />
        </svg>
      )}
      <text
        x={path ? TEXT_X : ICON_X}
        y={0}
        dominantBaseline="middle"
        fontSize={11}
        fill="var(--muted-foreground)"
      >
        {name}
      </text>
    </g>
  );
}

export function TopPlatformSection({
  status,
  summaries,
  onRetry,
}: TopPlatformSectionProps) {
  const cardStatus =
    status === "loading" ? "pending" : status === "error" ? "error" : "success";
  const ranked = [...summaries].sort((a, b) => b.views - a.views);
  const totalViews = ranked.reduce((sum, item) => sum + item.views, 0);

  const rows: PlatformBarRow[] = ranked.map((summary) => ({
    name: summary.name,
    platform: summary.platform,
    color: summary.color,
    value: summary.views,
  }));

  const barColors = Object.fromEntries(
    rows.map((row) => [String(row.name), platformColor(row)])
  );

  const isEmpty = status === "empty" || rows.length === 0;

  return (
    <ChartCard
      title="👁 Platform Tayangan Terbanyak"
      titleClassName="text-lg font-semibold"
      description="Peringkat platform berdasarkan total tayangan"
      status={cardStatus}
      isEmpty={isEmpty}
      onRetry={onRetry}
      emptyTitle="Belum ada data"
      emptyMessage="Belum ada tayangan pada periode ini."
      height={260}
      footer={
        !isEmpty && (
          <span>
            Total tayangan seluruh platform:{" "}
            <span className="font-medium tabular-nums">
              {formatCompact(totalViews)}
            </span>{" "}
            · Hover bar untuk detail
          </span>
        )
      }
    >
      <BarChart
        data={rows}
        xKey="name"
        bars={[{ key: "value", label: "Tayangan" }]}
        orientation="horizontal"
        barColors={barColors}
        height={260}
        showLegend={false}
        yAxisWidth={Y_AXIS_WIDTH}
        marginRight={LABEL_MARGIN}
        renderYTick={renderYTick}
      />
    </ChartCard>
  );
}
