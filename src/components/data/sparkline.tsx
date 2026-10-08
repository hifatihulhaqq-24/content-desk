"use client";

import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { useInView } from "@/hooks/use-in-view";

interface SparklineProps {
  values: number[];
  /**
   * Deret pembanding (periode sebelumnya / minggu lalu) —
   * digambar sebagai garis putus-putus abu (legenda di bawah KPI).
   */
  previousValues?: number[] | null;
  color?: string;
  height?: number;
  className?: string;
}

/** Garis kecil (sparkline) untuk StatCard — tanpa sumbu/label. */
export function Sparkline({
  values,
  previousValues = null,
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
      className={className}
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
