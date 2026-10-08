"use client";

import { useState } from "react";
import { ChartCard } from "@/components/data/chart-card";
import { PlatformChips } from "./platform-chips";
import { getQueryUiState, useBuildingBlock } from "@/hooks/use-analytics";
import { formatCompact, formatNumber, formatPercent } from "@/lib/format";
import type { PlatformId } from "@/types/analytics";
import { BUILDING_BLOCK_LABELS } from "@/config/content-elements";

interface BuildingBlockSectionProps {
  cluster: string;
}

export function BuildingBlockSection({ cluster }: BuildingBlockSectionProps) {
  const [platforms, setPlatforms] = useState<PlatformId[]>([]);
  const query = useBuildingBlock({ platforms, cluster, accountId: "all", platform: "all" });
  const status = getQueryUiState(query, (data) =>
    data.blocks.every((block) => block.content === 0)
  );
  const cardStatus =
    status === "loading" ? "pending" : status === "error" ? "error" : "success";
  const data = query.data;
  const isEmpty = status === "empty";

  const rows = [...(data?.blocks ?? [])].sort(
    (a, b) => b.impressions - a.impressions
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Building Block Analysis</h2>
          <p className="text-xs text-muted-foreground">
            5 elemen penyusun konten teratas · urut berdasarkan Impression.
          </p>
        </div>
        <PlatformChips value={platforms} onChange={setPlatforms} label="Filter platform" />
      </div>

      <ChartCard
        title="Building Block"
        titleClassName="text-sm font-semibold sr-only"
        status={cardStatus}
        isEmpty={isEmpty}
        onRetry={() => void query.refetch()}
        emptyTitle="Belum ada konten"
        emptyMessage="Belum ada konten terbit pada rentang tanggal ini."
        height="content"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="pb-2 text-left font-medium">#</th>
                <th className="pb-2 text-left font-medium">Building Block</th>
                <th className="pb-2 text-right font-medium">Total konten</th>
                <th className="pb-2 text-right font-medium">Impression</th>
                <th className="pb-2 text-right font-medium">Engagement</th>
                <th className="pb-2 text-right font-medium">Engagement Rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((block, index) => (
                <tr key={block.block} className="border-t">
                  <td className="py-2 pr-2 text-muted-foreground tabular-nums">
                    {index + 1}
                  </td>
                  <td className="py-2 pr-3 font-medium">
                    {BUILDING_BLOCK_LABELS[block.block]}
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums">
                    {formatNumber(block.content)}
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums">
                    {formatCompact(block.impressions)}
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums">
                    {formatCompact(block.engagements)}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {block.engagementRate !== null
                      ? formatPercent(block.engagementRate)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
