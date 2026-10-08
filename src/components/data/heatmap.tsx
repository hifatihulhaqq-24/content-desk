"use client";

import type { HeatmapCell } from "@/types/analytics";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as const;

interface HeatmapProps {
  cells: HeatmapCell[];
  /** Nama metrik yang diwakili (untuk tooltip/legend). */
  valueLabel?: string;
  formatValue?: (value: number) => string;
  className?: string;
}

/**
 * Heatmap hari × jam dengan skala satu warna + legend (pedoman PRD).
 * Opsional untuk Overview/halaman akun.
 */
export function Heatmap({
  cells,
  valueLabel = "Engagement",
  formatValue = (v) => String(v),
  className,
}: HeatmapProps) {
  const map = new Map(cells.map((cell) => [`${cell.day}:${cell.hour}`, cell.value]));
  const max = cells.reduce((m, c) => Math.max(m, c.value), 0) || 1;
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });

  return (
    <div
      ref={ref}
      data-state={inView ? "in-view" : "idle"}
      className={cn("chart-reveal space-y-2", className)}
    >
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[560px]">
          {/* Label jam */}
          <div className="grid grid-cols-[2.5rem_repeat(24,minmax(0,1fr))] gap-0.5">
            <span />
            {Array.from({ length: 24 }, (_, hour) => (
              <span
                key={hour}
                className="text-center text-[10px] tabular-nums text-muted-foreground"
              >
                {hour % 3 === 0 ? hour : ""}
              </span>
            ))}
          </div>
          {/* Baris hari */}
          {DAY_LABELS.map((dayLabel, day) => (
            <div
              key={dayLabel}
              className="mt-0.5 grid grid-cols-[2.5rem_repeat(24,minmax(0,1fr))] gap-0.5"
            >
              <span className="self-center text-[11px] text-muted-foreground">
                {dayLabel}
              </span>
              {Array.from({ length: 24 }, (_, hour) => {
                const value = map.get(`${day}:${hour}`) ?? 0;
                const ratio = value / max;
                return (
                  <div
                    key={hour}
                    title={`${dayLabel} ${hour}.00 — ${valueLabel}: ${formatValue(value)}`}
                    aria-label={`${dayLabel} jam ${hour}, ${valueLabel} ${formatValue(value)}`}
                    className="heat-cell h-4 rounded-[2px] border border-border/40"
                    style={{
                      backgroundColor:
                        value > 0
                          ? `color-mix(in oklab, var(--chart-1) ${Math.round(ratio * 100)}%, transparent)`
                          : "var(--muted)",
                      animationDelay: `${Math.min(hour * 18, 432)}ms`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend skala warna */}
      <div className="flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
        <span>Rendah</span>
        <span
          aria-hidden
          className="h-2.5 w-24 rounded-sm border border-border/40"
          style={{
            background:
              "linear-gradient(to right, color-mix(in oklab, var(--chart-1) 10%, transparent), color-mix(in oklab, var(--chart-1) 100%, transparent))",
          }}
        />
        <span>Tinggi</span>
        <span className="sr-only">{valueLabel}</span>
      </div>
    </div>
  );
}
