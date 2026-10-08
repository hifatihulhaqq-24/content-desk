"use client";

import { ArrowRight, Check, TrendingUp } from "lucide-react";
import type { TopicIdea } from "@/types/ideation";
import { cn } from "@/lib/utils";

/**
 * Tile ikon pastel — rotasi dari token chart yang sudah ada
 * (content biru, impressions teal, engagements oranye, shade blue tua).
 * Warna tile memakai color-mix transparan supaya ikut tema light/dark.
 */
const TILE_TINTS = [
  "bg-[color-mix(in_oklab,var(--chart-content)_13%,transparent)] text-[var(--chart-content)] dark:text-chart-1",
  "bg-[color-mix(in_oklab,var(--chart-impressions)_15%,transparent)] text-[var(--chart-impressions-dark)] dark:text-chart-2",
  "bg-[color-mix(in_oklab,var(--chart-engagements)_15%,transparent)] text-[var(--chart-engagements-dark)] dark:text-chart-3",
  "bg-[color-mix(in_oklab,var(--chart-block-content)_15%,transparent)] text-[var(--chart-block-content)] dark:text-chart-4",
] as const;

interface TopicCardProps {
  topic: TopicIdea;
  /** Indeks kartu untuk rotasi warna tile. */
  index?: number;
  /** Terpilih di flow create; tidak di-set di landing. */
  selected?: boolean;
  /** Label aksi di footer kartu. */
  actionLabel?: string;
  onSelect: () => void;
}

/** Kartu rekomendasi topik — dipakai landing /briefs dan Step 1 /create. */
export function TopicCard({
  topic,
  index = 0,
  selected,
  actionLabel = "Mulai brief dengan topik ini",
  onSelect,
}: TopicCardProps) {
  const tint = TILE_TINTS[index % TILE_TINTS.length];
  const score = Math.min(100, Math.max(0, topic.score));

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative flex w-full flex-col rounded-xl border bg-card p-4 text-left shadow-xs",
        "transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring",
        selected
          ? "border-primary ring-1 ring-primary"
          : "border-border hover:border-primary/40"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            tint
          )}
        >
          <TrendingUp className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 pr-6 text-sm font-semibold leading-snug">
            {topic.title}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span
              aria-hidden
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
            >
              <span
                className="block h-full rounded-full bg-[var(--chart-content)]"
                style={{ width: `${score}%` }}
              />
            </span>
            <span className="shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground">
              Skor {topic.score}
            </span>
          </div>
        </div>
      </div>

      {selected && (
        <span
          aria-hidden
          className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <Check className="size-3" />
        </span>
      )}

      <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
        {topic.reason}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="inline-flex items-center gap-1 font-medium text-positive">
          <TrendingUp className="size-3.5" aria-hidden />
          {topic.trendSignal}
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
          {topic.source}
        </span>
      </div>

      <span
        className={cn(
          "mt-3 inline-flex items-center gap-1 text-xs font-medium transition-colors",
          selected
            ? "text-primary"
            : "text-muted-foreground group-hover:text-primary"
        )}
      >
        {actionLabel}
        <ArrowRight
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </button>
  );
}
