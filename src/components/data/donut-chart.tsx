"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { chartTooltipFormatter, seriesColor } from "./chart-common";
import { formatCompact } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";

export interface DonutDatum {
  label: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutDatum[];
  /** Label di tengah donut (mis. "Total followers"). */
  centerLabel?: string;
  /** Nilai di tengah; default total dari data. */
  centerValue?: number;
  height?: number;
  showLegend?: boolean;
  className?: string;
}

/** Donut komposisi — maksimal 6 segmen (mock kumparanDesk — PRODUCT MVP). */
export function DonutChart({
  data,
  centerLabel,
  centerValue,
  height = 240,
  showLegend = true,
  className,
}: DonutChartProps) {
  const segments = data.slice(0, 6);
  const total = centerValue ?? segments.reduce((sum, d) => sum + d.value, 0);
  const { ref, inView, prefersReducedMotion } = useInView<HTMLDivElement>();
  const animated = inView && !prefersReducedMotion;

  const config: ChartConfig = {};
  for (const segment of segments) {
    config[segment.label] = { label: segment.label, color: segment.color };
  }

  return (
    <div
      ref={ref}
      data-state={inView ? "in-view" : "idle"}
      className={cn(
        "chart-reveal flex flex-col gap-4 sm:flex-row sm:items-center",
        className
      )}
    >
      {/* Donut persegi fixed (kiri) — legend fleksibel (kanan) supaya tidak tabrakan. */}
      <div
        className="relative shrink-0 mx-auto sm:mx-0"
        style={{ height, width: height }}
      >
        <ChartContainer
          config={config}
          className="aspect-auto h-full w-full [&_.recharts-sector]:transition-[filter] [&_.recharts-sector]:duration-150 [&_.recharts-sector:hover]:brightness-[1.08]"
          style={{ height }}
        >
          <PieChart>
            <Tooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={chartTooltipFormatter()}
                />
              }
            />
            <Pie
              data={segments}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={1}
              stroke="none"
              isAnimationActive={animated}
              animationDuration={700}
              animationEasing="ease-out"
            >
              {segments.map((segment) => (
                <Cell
                  key={segment.label}
                  fill={segment.color ?? "var(--color-chart-1)"}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        {segments.length > 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold tabular-nums">
              {formatCompact(total)}
            </span>
            {centerLabel && (
              <span className="text-xs text-muted-foreground">{centerLabel}</span>
            )}
          </div>
        )}
      </div>

      {showLegend && (
        <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
          {segments.map((segment, index) => (
            <li
              key={segment.label}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: segment.color ?? seriesColor(index),
                  }}
                />
                <span className="truncate text-muted-foreground">
                  {segment.label}
                </span>
              </span>
              <span className="shrink-0 whitespace-nowrap tabular-nums">
                <span className="font-semibold">
                  {total > 0
                    ? `${Math.round((segment.value / total) * 100)}%`
                    : "—"}
                </span>{" "}
                <span className="text-muted-foreground">
                  {formatCompact(segment.value)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
