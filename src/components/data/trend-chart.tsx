"use client";

import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { chartTooltipFormatter, chartValueFormatter } from "./chart-common";
import { formatDate, formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";
import type { TrendPoint } from "@/types/analytics";

export interface TrendSeriesDef {
  key: string;
  label: string;
  color?: string;
}

interface TrendChartProps {
  points: TrendPoint[];
  series: TrendSeriesDef[];
  type?: "line" | "area";
  /** Overlay garis putus-putus periode sebelumnya (maks. 1 seri). */
  previousPoints?: TrendPoint[] | null;
  previousLabel?: string;
  height?: number;
  className?: string;
}

/**
 * Line/area chart tren harian; maksimal 3–4 seri (pedoman PRD).
 * Mendukung perbandingan vs periode sebelumnya.
 */
export function TrendChart({
  points,
  series,
  type = "area",
  previousPoints = null,
  previousLabel = "Periode sebelumnya",
  height = 280,
  className,
}: TrendChartProps) {
  const activeSeries = series.slice(0, 4);
  const hasCompare = Boolean(
    previousPoints && previousPoints.length > 0 && activeSeries.length === 1
  );
  const compareKey = hasCompare ? `${activeSeries[0].key}Prev` : "";

  const data = points.map((point, index) => {
    const row: Record<string, string | number | null> = { ...point };
    if (hasCompare) {
      const prevValue = previousPoints?.[index]?.[activeSeries[0].key];
      row[compareKey] = typeof prevValue === "number" ? prevValue : null;
    }
    return row;
  });

  const config: ChartConfig = {};
  for (const item of activeSeries) {
    config[item.key] = { label: item.label, color: item.color };
  }
  if (hasCompare) {
    config[compareKey] = { label: previousLabel, color: "var(--muted-foreground)" };
  }

  const tooltipFormatter = chartTooltipFormatter();
  const { ref, inView, prefersReducedMotion } = useInView<HTMLDivElement>();
  const animated = inView && !prefersReducedMotion;

  return (
    <div
      ref={ref}
      data-state={inView ? "in-view" : "idle"}
      className={cn("chart-reveal", className)}
    >
      <ChartContainer
        config={config}
        className="aspect-auto"
        style={{ height, minHeight: height }}
      >
      <ComposedChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          interval="preserveStartEnd"
          tickFormatter={(value: string) => formatDateShort(value)}
          fontSize={11}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(value: number) => chartValueFormatter(Number(value))}
          fontSize={11}
        />
        <ChartTooltip
          cursor={{ stroke: "var(--border)" }}
          content={<ChartTooltipContent formatter={tooltipFormatter} />}
          labelFormatter={(label) => formatDate(String(label))}
        />
        <ChartLegend content={<ChartLegendContent />} />
        {activeSeries.map((item) =>
          type === "area" ? (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              stroke={item.color ?? `var(--color-${item.key})`}
              strokeWidth={2}
              fill={item.color ?? `var(--color-${item.key})`}
              fillOpacity={activeSeries.length === 1 ? 0.12 : 0}
              isAnimationActive={animated}
              animationDuration={700}
              animationEasing="ease-out"
              dot={false}
              activeDot={{ r: 4 }}
            />
          ) : (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              stroke={item.color ?? `var(--color-${item.key})`}
              strokeWidth={2}
              isAnimationActive={animated}
              animationDuration={700}
              animationEasing="ease-out"
              dot={false}
              activeDot={{ r: 4 }}
            />
          )
        )}
        {hasCompare && (
          <Line
            type="monotone"
            dataKey={compareKey}
            stroke={`var(--color-${compareKey})`}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            isAnimationActive={animated}
            animationDuration={700}
            animationEasing="ease-out"
            dot={false}
          />
        )}
      </ComposedChart>
      </ChartContainer>
    </div>
  );
}
