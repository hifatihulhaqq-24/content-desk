"use client";

import { EmptyState, ErrorState } from "@/components/data/states";
import { Skeleton } from "@/components/ui/skeleton";
import type { QueryUiState } from "@/hooks/use-analytics";
import { formatCompact, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MedianBucket, MedianInsight } from "@/types/analytics";

interface MedianSectionProps {
  status: QueryUiState;
  medians: MedianInsight[];
  onRetry: () => void;
}

/** Warna pita: di bawah (amber), sesuai (abu), di atas (biru chart-1). */
const BUCKET_STYLES: Record<MedianBucket["key"], { bar: string; dot: string }> = {
  below: { bar: "var(--color-amber-500)", dot: "bg-amber-500" },
  normal: { bar: "var(--color-muted-foreground)", dot: "bg-muted-foreground" },
  above: { bar: "var(--color-chart-1)", dot: "bg-[var(--chart-1)]" },
};

function MedianSkeleton() {
  return (
    <div className="rounded-xl bg-card p-4 shadow-xs">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-3 h-8 w-24" />
      <Skeleton className="mt-4 h-2 w-full" />
      <div className="mt-3 flex gap-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

function MedianCard({ insight }: { insight: MedianInsight }) {
  const total = insight.buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  return (
    <div className="rounded-xl bg-card p-4 text-card-foreground shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-semibold">{insight.label}</p>
        <p className="text-xs text-muted-foreground">
          Standar cluster:{" "}
          <b className="font-medium text-foreground tabular-nums">
            {formatCompact(insight.threshold)}
          </b>
        </p>
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {formatCompact(insight.median)}
        </p>
        <p className="text-xs text-muted-foreground">
          nilai tengah{" "}
          <b className="font-medium text-foreground tabular-nums">
            {formatNumber(insight.sampleSize)}
          </b>{" "}
          konten
          {insight.ratioToThreshold > 0 && (
            <>
              {" · "}
              <b className="font-medium text-foreground tabular-nums">
                {formatNumber(insight.ratioToThreshold, 1)}×
              </b>{" "}
              standar
            </>
          )}
        </p>
      </div>

      {/* Bar distribusi relatif terhadap standar cluster */}
      <div
        className="mt-4 flex h-2 overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`Distribusi: ${insight.buckets
          .map((bucket) => `${bucket.label} ${bucket.count} konten`)
          .join(", ")}`}
      >
        {insight.buckets.map((bucket) => (
          <div
            key={bucket.key}
            className="h-full transition-all"
            style={{
              width: total > 0 ? `${(bucket.count / total) * 100}%` : "0%",
              backgroundColor: BUCKET_STYLES[bucket.key].bar,
            }}
          />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {insight.buckets.map((bucket) => (
          <div key={bucket.key} className="min-w-0">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className={cn("size-2 shrink-0 rounded-full", BUCKET_STYLES[bucket.key].dot)}
                aria-hidden
              />
              <span className="truncate">{bucket.label}</span>
            </span>
            <p className="mt-1 text-sm font-medium tabular-nums">
              {formatNumber(bucket.count)}{" "}
              <span className="font-normal text-muted-foreground">konten</span>
            </p>
            <p className="text-[11px] text-muted-foreground">{bucket.rule}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MedianSection({
  status,
  medians,
  onRetry,
}: MedianSectionProps) {
  if (status === "error") {
    return <ErrorState onRetry={onRetry} className="min-h-40" />;
  }

  if (status === "loading") {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <MedianSkeleton />
        <MedianSkeleton />
      </div>
    );
  }

  if (
    status === "empty" ||
    medians.length === 0 ||
    medians.every((insight) => insight.sampleSize === 0)
  ) {
    return (
      <EmptyState
        title="Belum ada konten"
        message="Belum ada konten terbit pada periode ini, sehingga median belum bisa dihitung."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-4 lg:grid-cols-2">
        {medians.map((insight) => (
          <MedianCard key={insight.key} insight={insight} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        <b className="font-medium text-foreground">Cara membaca:</b> Median
        adalah nilai tengah dari seluruh konten pada periode ini (setengah konten
        di atas, setengah di bawah). Standar cluster adalah median impression /
        engagement per konten dari 8 minggu terakhir; konten dengan nilai
        0,7–1,3× standar termasuk normal, di bawah itu di bawah standar, dan di
        atas itu di atas standar.
      </p>
    </div>
  );
}
