"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { chartTooltipFormatter, chartValueFormatter, seriesColor } from "./chart-common";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";

export type BarRow = Record<string, string | number | null>;

export interface BarSeriesDef {
  key: string;
  label: string;
  color?: string;
  /** Isi bila ingin beberapa seri bertumpuk. */
  stackId?: string;
}

/** Geometri bar yang dikirim ke renderBarLabel. */
export interface BarShapeInput {
  row: BarRow;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}

interface AxisTickProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  payload?: { value?: string | number };
}

/** tickSize (6) + tickMargin (6) default recharts untuk sumbu kiri. */
const Y_TICK_INSET = 12;

interface BarChartProps {
  data: BarRow[];
  /** Field kategori pada tiap baris. */
  xKey: string;
  bars: BarSeriesDef[];
  orientation?: "vertical" | "horizontal";
  /** Warna per kategori (single-seri; mis. warna brand platform). */
  barColors?: Record<string, string>;
  height?: number;
  showLegend?: boolean;
  className?: string;
  /** Lebar sumbu Y (default 96). */
  yAxisWidth?: number;
  /** Ruang kanan di dalam chart (untuk label akhir bar). */
  marginRight?: number;
  /**
   * Kustomisasi tick sumbu Y (horizontal). Konten dirender pada koordinat
   * lokal berpusat di tepi kiri area sumbu (≈ tepi kiri chart bila margin 0).
   */
  renderYTick?: (row: BarRow) => ReactNode;
  /**
   * Kustomisasi isi bar (rect + label). Bila diisi, rendering bar
   * berpindah ke fungsi ini sehingga label bisa menempel pada ujung bar.
   */
  renderBarShape?: (input: BarShapeInput) => ReactNode;
}

/**
 * Bar chart vertikal/horizontal, single/stacked.
 * Sumbu nilai selalu mulai dari 0 (pedoman PRD).
 */
export function BarChart({
  data,
  xKey,
  bars,
  orientation = "vertical",
  barColors,
  height = 280,
  showLegend,
  className,
  yAxisWidth = 96,
  marginRight = 16,
  renderYTick,
  renderBarShape,
}: BarChartProps) {
  const isHorizontal = orientation === "horizontal";
  const withLegend = showLegend ?? bars.length > 1;
  const { ref, inView, prefersReducedMotion } = useInView<HTMLDivElement>();
  const animated = inView && !prefersReducedMotion;

  const config: ChartConfig = {};
  bars.forEach((bar, index) => {
    config[bar.key] = {
      label: bar.label,
      color: bar.color ?? seriesColor(index),
    };
  });

  const rowByName = new Map<string, BarRow>(
    data.map((row) => [String(row[xKey] ?? ""), row])
  );

  const yTick = renderYTick
    ? (props: AxisTickProps) => {
        const row = rowByName.get(String(props.payload?.value ?? "")) ?? {};
        const tickX = Number(props.x ?? 0);
        const axisWidth = Number(props.width ?? 0);
        const x =
          axisWidth > 0 ? tickX - Math.max(0, axisWidth - Y_TICK_INSET) : tickX;
        const y = Number(props.y ?? 0);
        return <g transform={`translate(${x},${y})`}>{renderYTick(row)}</g>;
      }
    : undefined;

  const barShape = renderBarShape
    ? (props: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        fill?: string;
        payload?: BarRow;
      }) => {
        const x = Number(props.x ?? 0);
        const y = Number(props.y ?? 0);
        const width = Math.max(0, Number(props.width ?? 0));
        const height = Math.max(1, Number(props.height ?? 0));
        const fill = String(props.fill ?? seriesColor(0));
        const row = props.payload ?? {};
        return (
          <g>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              rx={3}
              fill={fill}
            />
            {renderBarShape({ row, x, y, width, height, fill })}
          </g>
        );
      }
    : undefined;

  return (
    <div
      ref={ref}
      data-state={inView ? "in-view" : "idle"}
      className={cn("chart-reveal", className)}
    >
      <ChartContainer
        config={config}
        className="aspect-auto [&_.recharts-bar-rectangle]:transition-[filter] [&_.recharts-bar-rectangle]:duration-150 [&_.recharts-bar-rectangle:hover]:brightness-[1.12]"
        style={{ height, minHeight: height }}
      >
      <RechartsBarChart
        data={data}
        layout={isHorizontal ? "vertical" : "horizontal"}
        margin={{ top: 8, right: marginRight, bottom: 0, left: isHorizontal ? 0 : 0 }}
        barCategoryGap="24%"
      >
        <CartesianGrid
          vertical={isHorizontal}
          horizontal={!isHorizontal}
          strokeDasharray="3 3"
          opacity={0.5}
        />
        {isHorizontal ? (
          <>
            <XAxis
              type="number"
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) =>
                chartValueFormatter(Number(value))
              }
              fontSize={11}
            />
            <YAxis
              type="category"
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              width={yAxisWidth}
              fontSize={11}
              tick={yTick}
            />
          </>
        ) : (
          <>
            <XAxis
              type="category"
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
              interval={0}
              angle={data.length > 6 ? -30 : 0}
              textAnchor={data.length > 6 ? "end" : "middle"}
              height={data.length > 6 ? 56 : 32}
            />
            <YAxis
              type="number"
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(value: number) =>
                chartValueFormatter(Number(value))
              }
              fontSize={11}
            />
          </>
        )}
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.5 }}
          content={<ChartTooltipContent formatter={chartTooltipFormatter()} />}
          labelFormatter={(label) => String(label)}
        />
        {withLegend && <ChartLegend content={<ChartLegendContent />} />}
        {bars.map((bar) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.label}
            fill={bar.color ?? `var(--color-${bar.key})`}
            stackId={bar.stackId}
            radius={isHorizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]}
            maxBarSize={40}
            isAnimationActive={animated}
            animationDuration={700}
            animationEasing="ease-out"
            shape={barShape}
          >
            {barColors &&
              bars.length === 1 &&
              data.map((row) => {
                const category = String(row[xKey] ?? "");
                const color = barColors[category];
                return color ? <Cell key={category} fill={color} /> : null;
              })}
          </Bar>
        ))}
      </RechartsBarChart>
      </ChartContainer>
    </div>
  );
}
