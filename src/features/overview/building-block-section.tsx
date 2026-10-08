"use client";

import { useState } from "react";
import { ChartCard } from "@/components/data/chart-card";
import { PlatformChips } from "./platform-chips";
import { getQueryUiState, useBuildingBlock } from "@/hooks/use-analytics";
import { formatCompact, formatNumber } from "@/lib/format";
import type { PlatformId } from "@/types/analytics";
import { BUILDING_BLOCK_LABELS } from "@/config/content-elements";

interface BuildingBlockSectionProps {
  cluster: string;
}

interface MetricColumn {
  key: "content" | "impressions" | "engagements";
  title: string;
  format: (value: number) => string;
  fill: string;
  track: string;
}

/**
 * 3 part dalam satu section — persis warna bar mock kumparanDesk —
 * PRODUCT MVP: Total konten (biru), Impression (teal), Engagement (orange).
 */
const COLUMNS: MetricColumn[] = [
  {
    key: "content",
    title: "Total konten",
    format: (value) => formatNumber(value),
    fill: "var(--chart-block-content)",
    track: "var(--chart-block-content-track)",
  },
  {
    key: "impressions",
    title: "Impression",
    format: (value) => formatCompact(value),
    fill: "var(--chart-block-impressions)",
    track: "var(--chart-block-impressions-track)",
  },
  {
    key: "engagements",
    title: "Engagement",
    format: (value) => formatCompact(value),
    fill: "var(--chart-block-engagements)",
    track: "var(--chart-block-engagements-track)",
  },
];

/**
 * Building Block Analysis — satu card, dibagi 3 part: Total konten,
 * Impression, dan Engagement. Tiap part daftar 10 elemen dengan bar inline
 * (rank + nama + nilai + bar), diurutkan desc sesuai metrik part tsb.
 */
export function BuildingBlockSection({ cluster }: BuildingBlockSectionProps) {
  const [platforms, setPlatforms] = useState<PlatformId[]>([]);
  const query = useBuildingBlock({
    platforms,
    cluster,
    accountId: "all",
    platform: "all",
  });
  const status = getQueryUiState(query, (data) =>
    data.blocks.every((block) => block.content === 0)
  );
  const data = query.data;
  const isEmpty = status === "empty";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold">Building Block Analysis</h2>
          <p className="text-[13px] text-muted-foreground">
            Semua elemen penyusun konten · 7 hari terakhir · diurutkan per
            metrik
          </p>
        </div>
        <PlatformChips
          value={platforms}
          onChange={setPlatforms}
          label="Filter platform"
        />
      </div>

      <ChartCard
        title="Building Block"
        titleClassName="text-sm font-semibold sr-only"
        status={
          status === "loading" ? "pending" : status === "error" ? "error" : "success"
        }
        isEmpty={isEmpty}
        onRetry={() => void query.refetch()}
        emptyTitle="Belum ada konten"
        emptyMessage="Belum ada konten terbit pada rentang tanggal ini."
        height="content"
      >
        <div className="grid gap-5 min-[1100px]:grid-cols-3">
          {COLUMNS.map((column) => {
            const rows = [...(data?.blocks ?? [])].sort(
              (a, b) => b[column.key] - a[column.key]
            );
            const max = Math.max(
              ...rows.map((row) => row[column.key]),
              1
            );
            return (
              <div key={column.key} className="flex min-w-0 flex-col gap-2">
                <h3 className="text-sm font-semibold">{column.title}</h3>
                <ol className="flex flex-col">
                  {rows.map((block, index) => {
                    const value = block[column.key];
                    const width =
                      value > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
                    return (
                      <li
                        key={block.block}
                        className="flex items-center gap-2 border-b border-border/70 py-2 last:border-b-0"
                      >
                        <span className="w-4 shrink-0 text-[11px] font-bold tabular-nums text-blue-600 dark:text-blue-400">
                          {index + 1}
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-xs font-semibold">
                              {BUILDING_BLOCK_LABELS[block.block]}
                            </span>
                            <span className="shrink-0 text-xs font-semibold tabular-nums">
                              {column.format(value)}
                            </span>
                          </div>
                          <div
                            className="h-1.5 overflow-hidden rounded-full"
                            style={{ background: column.track }}
                            role="img"
                            aria-label={`${BUILDING_BLOCK_LABELS[block.block]}: ${column.format(value)}`}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${width}%`,
                                background: column.fill,
                              }}
                            />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );
}
