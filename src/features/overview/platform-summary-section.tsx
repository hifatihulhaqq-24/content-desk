"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DeltaBadge } from "@/components/data/delta-badge";
import { EmptyState, ErrorState } from "@/components/data/states";
import { PlatformIcon } from "@/components/icons/platform-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { QueryUiState } from "@/hooks/use-analytics";
import { formatCompact, formatNumber, formatPercent } from "@/lib/format";
import type { PlatformSummary } from "@/types/analytics";
import { TAGGING_OPTIONS, TAGGING_ALL } from "@/config/tagging";

interface PlatformSummarySectionProps {
  status: QueryUiState;
  summaries: PlatformSummary[];
  tagging: string;
  onTaggingChange: (tagging: string) => void;
  onRetry: () => void;
}

export function PlatformSummarySection({
  status,
  summaries,
  tagging,
  onTaggingChange,
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
            <Skeleton className="mt-2 h-2 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (status === "empty" || summaries.length === 0) {
    return (
      <EmptyState
        title="Belum ada data platform"
        message="Belum ada konten terbit pada periode ini."
      />
    );
  }

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold">Data Platform</h2>
        <p className="text-xs text-muted-foreground">
          Performa per platform berdasarkan Impression, kontribusi, Engagement dan Jumlah konten.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Tagging</span>
        <Select value={tagging} onValueChange={onTaggingChange}>
          <SelectTrigger className="h-8 w-36" aria-label="Filter tagging">
            <SelectValue placeholder="Semua tagging" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TAGGING_ALL}>Semua tagging</SelectItem>
            {TAGGING_OPTIONS.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {header}
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
              {formatCompact(summary.impressions)}
            </p>
            <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>Impression</span>
              <DeltaBadge value={summary.impressionsGrowthPercent} />
            </div>

            <dl className="mt-3 space-y-2 border-t pt-3 text-xs">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Kontribusi Impression</dt>
                  <dd className="font-medium tabular-nums">
                    {formatPercent(summary.impressionsSharePercent)}
                  </dd>
                </div>
                <Progress
                  value={Math.max(5, Math.min(100, summary.impressionsSharePercent))}
                  className="mt-1 h-1.5"
                  aria-hidden
                />
              </div>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Kontribusi konten</dt>
                  <dd className="font-medium tabular-nums">
                    {formatPercent(summary.postsSharePercent)}
                  </dd>
                </div>
                <Progress
                  value={Math.max(5, Math.min(100, summary.postsSharePercent))}
                  className="mt-1 h-1.5"
                  aria-hidden
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Engagement</dt>
                <dd className="font-medium tabular-nums">
                  {formatCompact(summary.engagement)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Engagement Rate</dt>
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
    </div>
  );
}
