import type { DefaultTooltipContentProps, TooltipValueType } from "recharts";
import { formatCompact, formatNumber } from "@/lib/format";

/** Pasangan warna chart dari token tema (--chart-1 … --chart-5). */
export const SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export function seriesColor(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length];
}

/** Format angka ringkas default untuk tooltip chart (1,2K / 3,4M). */
export function chartValueFormatter(value: number): string {
  return formatCompact(value);
}

type TooltipFormatter = NonNullable<
  DefaultTooltipContentProps<TooltipValueType, string | number>["formatter"]
>;

/**
 * Formatter baris tooltip ChartTooltipContent: mempertahankan dot warna
 * tetapi memformat nilai secara ringkas (pedoman visual PRD).
 */
export function chartTooltipFormatter(
  format: (value: number) => string = chartValueFormatter
): TooltipFormatter {
  return function formatTooltipValue(value, name, item) {
    return (
      <div className="flex w-full flex-1 items-center justify-between gap-3 leading-none">
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-muted-foreground">{String(name ?? "")}</span>
        </span>
        <span className="font-mono font-medium tabular-nums">
          {typeof value === "number" ? format(value) : String(value ?? "—")}
        </span>
      </div>
    );
  };
}

/** Angka penuh dengan format Indonesia (untuk kebutuhan tabel/dll.). */
export function fullNumberFormatter(value: number): string {
  return formatNumber(value);
}
