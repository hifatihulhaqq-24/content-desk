"use client";

import { useState } from "react";
import { EmptyState, ErrorState } from "@/components/data/states";
import { Skeleton } from "@/components/ui/skeleton";
import { DonutChart, type DonutDatum } from "@/components/data/donut-chart";
import { PlatformChips } from "./platform-chips";
import { DONUT_PALETTES } from "@/config/content-elements";
import { getQueryUiState, useContentType } from "@/hooks/use-analytics";
import type { PlatformId } from "@/types/analytics";

interface ContentTypeSectionProps {
  cluster: string;
}

interface MetricSpec {
  key: "content" | "impressions" | "engagements";
  title: string;
  palette: string[];
  centerLabel: string;
}

const METRICS: MetricSpec[] = [
  {
    key: "content",
    title: "Total konten",
    palette: DONUT_PALETTES.content,
    centerLabel: "konten",
  },
  {
    key: "impressions",
    title: "Impression",
    palette: DONUT_PALETTES.impressions,
    centerLabel: "Impression",
  },
  {
    key: "engagements",
    title: "Engagement",
    palette: DONUT_PALETTES.engagements,
    centerLabel: "Engagement",
  },
];

/**
 * Content Type Analysis — satu card, 3 donut (g3) dengan palet warna
 * per metrik persis mock kumparanDesk — PRODUCT MVP: segmen & dot legend
 * memakai shade per index (bukan monokrom), legend `pct% nilai` di sebelah
 * donut sehingga tidak ada elemen yang tabrakan.
 */
export function ContentTypeSection({ cluster }: ContentTypeSectionProps) {
  const [platforms, setPlatforms] = useState<PlatformId[]>([]);
  const query = useContentType({
    platforms,
    cluster,
    accountId: "all",
    platform: "all",
  });
  const status = getQueryUiState(query, (data) => data.totals.content === 0);
  const data = query.data;
  const onRetry = () => void query.refetch();

  return (
    <section className="flex flex-col gap-3.5 rounded-xl bg-card p-4 text-card-foreground shadow-xs md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[17px] font-bold">Content Type Analysis</h2>
          <p className="text-[13px] text-muted-foreground">
            Porsi per tipe konten · 7 hari terakhir · 5 tipe teratas + lainnya
          </p>
        </div>
        <PlatformChips value={platforms} onChange={setPlatforms} />
      </div>

      {status === "error" ? (
        <ErrorState onRetry={onRetry} className="min-h-40" />
      ) : status === "loading" ? (
        <div className="grid gap-6 min-[1100px]:grid-cols-3">
          {METRICS.map((metric) => (
            <div key={metric.key} className="flex min-w-0 flex-col gap-2.5">
              <Skeleton className="h-4 w-28" />
              <div className="flex gap-4">
                <Skeleton className="size-36 shrink-0 rounded-full" />
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                  {Array.from({ length: 6 }, (_, index) => (
                    <Skeleton key={index} className="h-3 w-full" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : status === "empty" ? (
        <EmptyState
          title="Belum ada konten"
          message="Belum ada konten terbit pada periode ini, sehingga komposisi tipe konten belum bisa ditampilkan."
        />
      ) : (
        <div className="grid gap-6 min-[1100px]:grid-cols-3">
          {METRICS.map((metric) => {
            const segments: DonutDatum[] = (data?.formats ?? []).map(
              (point, index) => ({
                label: point.format,
                value: point[metric.key],
                color: metric.palette[index % metric.palette.length],
              })
            );
            return (
              <div
                key={metric.key}
                className="flex min-w-0 flex-col gap-2.5"
              >
                <h3 className="text-sm font-semibold">{metric.title}</h3>
                <DonutChart
                  data={segments}
                  centerLabel={metric.centerLabel}
                  centerValue={data?.totals[metric.key] ?? 0}
                  height={160}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
