"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DeltaBadge } from "@/components/data/delta-badge";
import { ErrorState } from "@/components/data/states";
import { PlatformIcon } from "@/components/icons/platform-icon";
import { Skeleton } from "@/components/ui/skeleton";
import type { QueryUiState } from "@/hooks/use-analytics";
import { formatCompact, formatNumber, formatPercent } from "@/lib/format";
import type { PlatformSummary } from "@/types/analytics";

interface PlatformSummarySectionProps {
  status: QueryUiState;
  summaries: PlatformSummary[];
  onRetry: () => void;
}

export function PlatformSummarySection({
  status,
  summaries,
  onRetry,
}: PlatformSummarySectionProps) {
  if (status === "error") {
    return <ErrorState onRetry={onRetry} />;
  }

  if (status === "loading") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-xl bg-card p-4 shadow-xs"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-7 w-20" />
            <Skeleton className="mt-3 h-4 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summaries.map((summary) => (
        <Link
          key={summary.platform}
          href={`/analytics/${summary.platform}`}
          className="group rounded-xl bg-card p-4 text-card-foreground shadow-xs transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
              <PlatformIcon
                platform={summary.platform}
                className="size-4 shrink-0"
                style={{ color: summary.color }}
              />
              <span className="truncate">{summary.name}</span>
            </span>
            <ArrowUpRight
              className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
              aria-hidden
            />
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">
            {formatCompact(summary.views)}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Total tayangan</span>
            <DeltaBadge value={summary.viewsGrowthPercent} />
          </div>
          <dl className="mt-3 space-y-1.5 border-t pt-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Interaksi pembaca</dt>
              <dd className="font-medium tabular-nums">
                {formatCompact(summary.engagement)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Tingkat interaksi</dt>
              <dd className="font-medium tabular-nums">
                {summary.engagementRate !== null
                  ? formatPercent(summary.engagementRate)
                  : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Jumlah konten</dt>
              <dd className="font-medium tabular-nums">
                {formatNumber(summary.posts)}
              </dd>
            </div>
          </dl>
        </Link>
      ))}
    </div>
  );
}
