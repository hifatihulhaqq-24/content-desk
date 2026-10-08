"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { DeltaBadge } from "@/components/data/delta-badge";
import { HoverTooltip } from "@/components/data/hover-tooltip";
import { EmptyState, ErrorState } from "@/components/data/states";
import { Skeleton } from "@/components/ui/skeleton";
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

interface ShareBarProps {
  color: string;
  impressionsSharePercent: number;
  postsSharePercent: number;
}

/**
 * Bar kontribusi impression pada kartu Data Platform — hover menampilkan
 * tooltip kontribusi + sorotan bar, selaras interaksi chart lain di Overview.
 */
function ShareBar({
  color,
  impressionsSharePercent,
  postsSharePercent,
}: ShareBarProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);

  return (
    <div
      ref={boxRef}
      className="group relative flex flex-col gap-1 rounded-lg bg-muted/50 p-2.5 transition-colors hover:bg-muted"
      onMouseMove={(event) => {
        const box = boxRef.current;
        if (!box) return;
        const rect = box.getBoundingClientRect();
        setHover({ x: event.clientX - rect.left, y: event.clientY - rect.top });
      }}
      onMouseLeave={() => setHover(null)}
    >
      <p className="text-xs text-muted-foreground">
        Kontribusi Impression{" "}
        <b className="font-semibold text-foreground tabular-nums">
          {formatPercent(impressionsSharePercent)}
        </b>{" "}
        · konten{" "}
        <b className="font-semibold text-foreground tabular-nums">
          {formatPercent(postsSharePercent)}
        </b>
      </p>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`Kontribusi impression ${formatPercent(impressionsSharePercent)}`}
      >
        <div
          className="h-full rounded-full transition-[filter] duration-150 group-hover:brightness-125"
          style={{
            width: `${Math.max(0, Math.min(100, impressionsSharePercent))}%`,
            background: color,
          }}
        />
      </div>
      {hover && (
        <HoverTooltip
          x={hover.x}
          y={hover.y}
          label="Kontribusi"
          rows={[
            {
              label: "Impression",
              color,
              value: formatPercent(impressionsSharePercent),
            },
            {
              label: "Konten",
              value: formatPercent(postsSharePercent),
            },
          ]}
        />
      )}
    </div>
  );
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
      <div className="grid gap-3 min-[600px]:grid-cols-2 min-[1100px]:grid-cols-4">
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
      <h2 className="text-[17px] font-bold">Data Platform</h2>
      <div className="flex items-center gap-2">
        <span className="text-[13px] text-muted-foreground">Tagging</span>
        <Select value={tagging} onValueChange={onTaggingChange}>
          <SelectTrigger
            className="h-10 w-40"
            aria-label="Filter tagging"
          >
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
      <div className="grid gap-3 min-[600px]:grid-cols-2 min-[1100px]:grid-cols-4">
        {summaries.map((summary) => (
          <Link
            key={summary.platform}
            href={`/analytics/${summary.platform}`}
            className="group flex flex-col gap-2.5 rounded-xl bg-card p-4 text-card-foreground shadow-xs transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-[3px]"
                style={{ background: summary.color }}
              />
              <span className="truncate text-sm font-semibold">
                {summary.name}
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <div>
                <p className="text-[22px] font-bold tabular-nums">
                  {formatCompact(summary.impressions)}
                </p>
                <p className="text-xs text-muted-foreground">Impression</p>
              </div>
              <DeltaBadge value={summary.impressionsGrowthPercent} />
            </div>

            <ShareBar
              color={summary.color}
              impressionsSharePercent={summary.impressionsSharePercent}
              postsSharePercent={summary.postsSharePercent}
            />

            <dl className="flex flex-col gap-2 border-t pt-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Engagement</dt>
                <dd className="flex items-center gap-1.5">
                  <span className="font-semibold tabular-nums">
                    {formatCompact(summary.engagement)}
                  </span>
                  <DeltaBadge
                    value={summary.engagementGrowthPercent}
                    className="text-[11px]"
                  />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Engagement Rate</dt>
                <dd className="flex items-center gap-1.5">
                  <span className="font-semibold tabular-nums">
                    {summary.engagementRate !== null
                      ? formatPercent(summary.engagementRate)
                      : "—"}
                  </span>
                  <DeltaBadge
                    value={summary.engagementRateGrowthPercent}
                    className="text-[11px]"
                  />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Jumlah konten</dt>
                <dd className="flex items-center gap-1.5">
                  <span className="font-semibold tabular-nums">
                    {formatNumber(summary.posts)}
                  </span>
                  <DeltaBadge
                    value={summary.postsGrowthPercent}
                    className="text-[11px]"
                  />
                </dd>
              </div>
            </dl>
          </Link>
        ))}
      </div>
    </div>
  );
}
