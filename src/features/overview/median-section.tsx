"use client";

import { useRef, useState, type MouseEvent } from "react";
import { EmptyState, ErrorState } from "@/components/data/states";
import { HoverTooltip } from "@/components/data/hover-tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import type { QueryUiState } from "@/hooks/use-analytics";
import { formatCompact, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MedianInsight, MedianRow } from "@/types/analytics";

interface MedianSectionProps {
  status: QueryUiState;
  medians: MedianInsight[];
  onRetry: () => void;
}

/** Warna pita baris: di bawah (merah), sekitar (slate), di atas (hijau). */
const BAR_BELOW = "var(--color-red-500)";
const BAR_AROUND = "var(--color-slate-300)";
const BAR_ABOVE = "var(--color-green-600)";

/** Delta vs standar — persis format mock: "▲ 8%" / "▼ 5%". */
function ratioDelta(ratio: number): { text: string; up: boolean } {
  const pct = Math.round((ratio - 1) * 100);
  return {
    text: `${pct >= 0 ? "▲" : "▼"} ${Math.abs(pct)}%`,
    up: pct >= 0,
  };
}

function MedianSkeleton() {
  return (
    <div className="rounded-xl bg-card p-4 text-card-foreground shadow-xs">
      <Skeleton className="h-4 w-40" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </div>
      <div className="mt-3 flex gap-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}

/** Posisi pointer + baris median yang sedang di-hover pada kartu. */
interface MedianBarHover {
  x: number;
  y: number;
  row: MedianRow;
}

function MedianCard({ insight }: { insight: MedianInsight }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<MedianBarHover | null>(null);

  const trackBar = (event: MouseEvent<HTMLTableRowElement>, row: MedianRow) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    setHover({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      row,
    });
  };

  return (
    <div
      ref={cardRef}
      className="relative rounded-xl bg-card p-4 text-card-foreground shadow-xs"
    >
      <h3 className="text-[15px] font-bold">{insight.label}</h3>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="px-2.5 py-2 text-left text-[11.5px] font-medium text-muted-foreground">
                Platform
              </th>
              <th className="px-2.5 py-2 text-right text-[11.5px] font-medium text-muted-foreground">
                Nilai tengah
              </th>
              <th className="px-2.5 py-2 text-right text-[11.5px] font-medium text-muted-foreground">
                Standar
              </th>
              <th className="w-[40%] px-2.5 py-2 text-left text-[11.5px] font-medium text-muted-foreground">
                Jumlah konten vs standar
              </th>
            </tr>
          </thead>
          <tbody>
            {insight.rows.map((row) => (
              <MedianRowCells
                key={row.platform}
                row={row}
                onBarMove={trackBar}
                onBarLeave={() => setHover(null)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-3.5 gap-y-1 text-[11.5px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span
            aria-hidden
            className="size-[9px] shrink-0 rounded-sm"
            style={{ background: BAR_BELOW }}
          />
          Di bawah standar (&lt; −30%)
        </span>
        <span className="flex items-center gap-1">
          <span
            aria-hidden
            className="size-[9px] shrink-0 rounded-sm"
            style={{ background: BAR_AROUND }}
          />
          Sekitar standar (±30%)
        </span>
        <span className="flex items-center gap-1">
          <span
            aria-hidden
            className="size-[9px] shrink-0 rounded-sm"
            style={{ background: BAR_ABOVE }}
          />
          Di atas standar (&gt; +30%)
        </span>
      </div>

      {hover && (
        <HoverTooltip
          x={hover.x}
          y={hover.y}
          label={`${hover.row.name} · ${formatCompact(hover.row.value)}`}
          rows={[
            {
              label: "Di bawah standar",
              color: BAR_BELOW,
              value: formatNumber(hover.row.counts.below),
            },
            {
              label: "Sekitar standar",
              color: BAR_AROUND,
              value: formatNumber(hover.row.counts.around),
            },
            {
              label: "Di atas standar",
              color: BAR_ABOVE,
              value: formatNumber(hover.row.counts.above),
            },
          ]}
        />
      )}
    </div>
  );
}

interface MedianRowCellsProps {
  row: MedianRow;
  /** Hover pada pita distribusi → tampilkan tooltip rincian. */
  onBarMove?: (event: MouseEvent<HTMLTableRowElement>, row: MedianRow) => void;
  onBarLeave?: () => void;
}

function MedianRowCells({ row, onBarMove, onBarLeave }: MedianRowCellsProps) {
  const total = row.counts.below + row.counts.around + row.counts.above;
  const pct = (count: number) => (total > 0 ? (count / total) * 100 : 0);
  const delta = ratioDelta(row.ratio);

  return (
    <tr
      className="transition-colors hover:bg-muted/50"
      onMouseMove={(event) => onBarMove?.(event, row)}
      onMouseLeave={onBarLeave}
    >
      <th
        scope="row"
        className="whitespace-nowrap border-b px-2.5 py-2.5 text-left font-semibold"
      >
        <span
          aria-hidden
          className="mr-1.5 inline-block size-[9px] rounded-sm align-middle"
          style={{ background: row.color }}
        />
        {row.name}
      </th>
      <td className="whitespace-nowrap border-b px-2.5 py-2.5 text-right tabular-nums">
        <span className="font-bold">{formatCompact(row.value)}</span>{" "}
        <span
          className={cn(
            "text-[11.5px] font-semibold",
            delta.up
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          )}
        >
          {delta.text}
        </span>
      </td>
      <td className="whitespace-nowrap border-b px-2.5 py-2.5 text-right tabular-nums text-muted-foreground">
        {formatCompact(row.threshold)}
      </td>
      <td className="min-w-[160px] border-b px-2.5 py-2.5">
        <div
          className="flex h-2 gap-0.5 overflow-hidden rounded-full"
          role="img"
          aria-label={`${row.name}: ${row.counts.below} di bawah standar, ${row.counts.around} sekitar standar, ${row.counts.above} di atas standar`}
        >
          <div
            style={{ width: `${pct(row.counts.below)}%`, background: BAR_BELOW }}
          />
          <div
            style={{ width: `${pct(row.counts.around)}%`, background: BAR_AROUND }}
          />
          <div
            style={{ width: `${pct(row.counts.above)}%`, background: BAR_ABOVE }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[11.5px] tabular-nums">
          <span className="font-semibold text-red-700 dark:text-red-400">
            {row.counts.below}
          </span>
          <span className="text-muted-foreground">{row.counts.around}</span>
          <span className="font-semibold text-green-700 dark:text-green-400">
            {row.counts.above}
          </span>
        </div>
      </td>
    </tr>
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
      <div className="grid gap-3 min-[900px]:grid-cols-2">
        <MedianSkeleton />
        <MedianSkeleton />
      </div>
    );
  }

  if (
    status === "empty" ||
    medians.length === 0 ||
    medians.every((insight) => insight.rows.every((row) => row.sampleSize === 0))
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
      <div className="grid gap-3 min-[900px]:grid-cols-2">
        {medians.map((insight) => (
          <MedianCard key={insight.key} insight={insight} />
        ))}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        <b className="font-medium text-foreground">Cara membaca:</b> nilai
        tengah (median) = angka di posisi tengah kalau semua konten diurutkan,
        jadi separuh konten di atasnya dan separuh di bawahnya; tidak terdorong
        oleh satu konten viral. Standar = nilai tengah Impression/Engagement
        hari ke-7 konten cluster ini{" "}
        <b className="font-medium text-foreground">di platform yang sama</b>{" "}
        selama 8 minggu terakhir, jadi konten TikTok dibanding TikTok, YouTube
        dibanding YouTube. Angka di bawah bar = jumlah konten per kelompok.
      </p>
    </div>
  );
}
