"use client";

import Image from "next/image";
import { ArrowRight, Check, TrendingUp } from "lucide-react";
import type { TopicIdea } from "@/types/ideation";
import { bucketImageFor } from "@/lib/mock-bucket-images";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Aksen tint per kartu — rotasi dari token chart yang sudah ada
 * (content biru, impressions teal, engagements oranye, shade blue tua).
 * `stroke` untuk cincin skor, `soft`/`accent` untuk chip sumber.
 * Nilai color-mix transparan supaya ikut tema light/dark.
 */
const CARD_TINTS = [
  {
    soft: "bg-[color-mix(in_oklab,var(--chart-content)_13%,transparent)]",
    accent: "text-[var(--chart-content)] dark:text-chart-1",
    stroke: "stroke-[var(--chart-content)] dark:stroke-chart-1",
  },
  {
    soft: "bg-[color-mix(in_oklab,var(--chart-impressions)_15%,transparent)]",
    accent: "text-[var(--chart-impressions-dark)] dark:text-chart-2",
    stroke: "stroke-[var(--chart-impressions)] dark:stroke-chart-2",
  },
  {
    soft: "bg-[color-mix(in_oklab,var(--chart-engagements)_15%,transparent)]",
    accent: "text-[var(--chart-engagements-dark)] dark:text-chart-3",
    stroke: "stroke-[var(--chart-engagements)] dark:stroke-chart-3",
  },
  {
    soft: "bg-[color-mix(in_oklab,var(--chart-block-content)_15%,transparent)]",
    accent: "text-[var(--chart-block-content)] dark:text-chart-4",
    stroke: "stroke-[var(--chart-block-content)] dark:stroke-chart-4",
  },
] as const;

const RING_RADIUS = 15.5;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const IMAGE_SIZES =
  "(min-width: 1280px) 128px, (min-width: 640px) 112px, 96px";

interface TopicCardProps {
  topic: TopicIdea;
  /** Indeks kartu untuk rotasi aksen tint. */
  index?: number;
  /** Terpilih di flow create; tidak di-set di landing. */
  selected?: boolean;
  /** Label aksi pendek di footer kartu. */
  actionLabel?: string;
  onSelect: () => void;
}

/** Cincin skor SVG — strokeDasharray mengikuti persentase skor (0–100). */
function ScoreRing({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const filled = (Math.min(100, Math.max(0, score)) / 100) * RING_CIRCUMFERENCE;
  return (
    <svg viewBox="0 0 36 36" aria-hidden className="size-full -rotate-90">
      <circle
        cx="18"
        cy="18"
        r={RING_RADIUS}
        fill="none"
        strokeWidth="3"
        className="stroke-border"
      />
      <circle
        cx="18"
        cy="18"
        r={RING_RADIUS}
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${RING_CIRCUMFERENCE}`}
        className={className}
      />
    </svg>
  );
}

/**
 * Kartu rekomendasi topik — dipakai landing /briefs dan Step 1 /create.
 * Layout ramping: thumbnail kiri (membentang seukuran tinggi kartu) +
 * cincin skor di atasnya, konten & footer tren/aksi di kanan.
 */
export function TopicCard({
  topic,
  index = 0,
  selected,
  actionLabel = "Mulai brief",
  onSelect,
}: TopicCardProps) {
  const tint = CARD_TINTS[index % CARD_TINTS.length];
  const score = Math.min(100, Math.max(0, topic.score));

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group grid w-full grid-cols-[auto_minmax(0,1fr)] overflow-hidden rounded-xl border bg-card text-left shadow-xs",
        "transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring",
        selected
          ? "border-primary ring-1 ring-primary"
          : "border-border hover:border-primary/40"
      )}
    >
      {/* Thumbnail kiri — foto bersih, tanpa overlay */}
      <div className="relative w-24 self-stretch overflow-hidden sm:w-28 xl:w-32">
        <Image
          src={bucketImageFor(topic.id)}
          alt=""
          fill
          sizes={IMAGE_SIZES}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Cincin skor di pojok thumbnail */}
        <span
          title={`Skor ${topic.score}`}
          className="absolute bottom-1.5 left-1.5 flex size-9 items-center justify-center rounded-full border border-border bg-card shadow-sm"
        >
          <ScoreRing score={score} className={tint.stroke} />
          <span className="absolute text-[10px] font-bold tabular-nums text-foreground">
            {topic.score}
          </span>
          <span className="sr-only">Skor {topic.score}</span>
        </span>

        {selected && (
          <span
            aria-hidden
            className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
          >
            <Check className="size-3" />
          </span>
        )}
      </div>

      {/* Konten kanan: judul + alasan + chip, lalu footer tren/aksi */}
      <div className="flex min-w-0 flex-col">
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
            {topic.title}
          </h3>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {topic.reason}
          </p>
          <span
            className={cn(
              "mt-auto w-fit rounded-full px-2 py-0.5 text-[11px] font-medium",
              tint.soft,
              tint.accent
            )}
          >
            {topic.source}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-border px-3 py-2 text-xs">
          <span className="inline-flex items-center gap-1 font-medium text-positive">
            <TrendingUp className="size-3.5" aria-hidden />
            {topic.trendSignal}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 whitespace-nowrap font-medium transition-colors",
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
        </div>
      </div>
    </button>
  );
}

/** Skeleton kartu topik — dipakai landing dan Step 1 saat data belum datang. */
export function TopicCardSkeleton() {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <Skeleton className="w-24 self-stretch rounded-none sm:w-28 xl:w-32" />
      <div className="flex flex-col">
        <div className="flex-1 space-y-2 p-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="mt-2 h-5 w-24 rounded-full" />
        </div>
        <div className="border-t border-border px-3 py-2">
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  );
}
