"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

interface SparklineProps {
  values: number[];
  /**
   * Deret pembanding (periode sebelumnya / minggu lalu) —
   * digambar sebagai garis putus-putus abu (legenda di bawah KPI).
   */
  previousValues?: number[] | null;
  /** Label per titik (mis. "3 Okt") untuk judul tooltip hover. */
  labels?: string[] | null;
  color?: string;
  height?: number;
  className?: string;
}

/** Baris tooltip sparkline — selaras gaya ChartTooltipContent. */
interface SparklineTooltipProps
  extends Partial<TooltipContentProps<number, string>> {
  labels?: string[] | null;
  color?: string;
}

interface SparklinePoint {
  index: number;
  value: number;
  previous?: number;
}

function SparklineTooltip({
  active,
  payload,
  labels,
  color = "var(--chart-1)",
}: SparklineTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as SparklinePoint | undefined;
  if (!point) return null;

  const title = labels?.[point.index] ?? `Hari ke-${point.index + 1}`;
  const rows: { label: string; color: string; value: number }[] = [];
  if (typeof point.previous === "number") {
    rows.push({
      label: "Periode sebelumnya",
      color: "var(--muted-foreground)",
      value: point.previous,
    });
  }
  rows.push({ label: "Periode ini", color, value: point.value });

  return (
    <div className="grid min-w-32 gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <div className="font-medium">{title}</div>
      <div className="grid gap-1.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex w-full flex-wrap items-center justify-between gap-3 leading-none"
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: row.color }}
              />
              <span className="truncate text-muted-foreground">{row.label}</span>
            </span>
            <span className="font-mono font-medium tabular-nums">
              {row.value.toLocaleString("id-ID")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Garis kecil (sparkline) untuk StatCard — tanpa sumbu/label, ada tooltip hover. */
export function Sparkline({
  values,
  previousValues = null,
  labels = null,
  color = "var(--chart-1)",
  height = 36,
  className,
}: SparklineProps) {
  const { ref, inView, prefersReducedMotion } = useInView<HTMLDivElement>();
  const animated = inView && !prefersReducedMotion;
  if (values.length < 2) return null;
  const previous =
    previousValues && previousValues.length >= 2 ? previousValues : null;
  const data = values.map((value, index) => ({
    index,
    value,
    previous: previous ? previous[index] : undefined,
  }));

  const all = previous ? values.concat(previousValues ?? []) : values;
  let domainMin = Math.min(...all);
  let domainMax = Math.max(...all);
  if (domainMin === domainMax) {
    domainMin = domainMin - Math.abs(domainMin) * 0.1;
    domainMax = domainMax + Math.abs(domainMax) * 0.1 + 1;
  }

  return (
    <div
      ref={ref}
      data-state={inView ? "in-view" : "idle"}
      className={cn("relative", className)}
      style={{ height }}
      aria-hidden
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 120, height }}
      >
        <AreaChart data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
          <YAxis hide domain={[domainMin, domainMax]} />
          <Tooltip
            isAnimationActive={false}
            cursor={false}
            content={<SparklineTooltip labels={labels} color={color} />}
          />
          {previous && (
            <Area
              type="monotone"
              dataKey="previous"
              stroke="var(--muted-foreground)"
              strokeOpacity={0.8}
              strokeWidth={1.25}
              strokeDasharray="4 3"
              fill="transparent"
              isAnimationActive={false}
              dot={false}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={color}
            fillOpacity={0.12}
            isAnimationActive={animated}
            animationDuration={900}
            animationEasing="ease-out"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
