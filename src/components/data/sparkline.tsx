"use client";

import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { useInView } from "@/hooks/use-in-view";

interface SparklineProps {
  values: number[];
  color?: string;
  height?: number;
  className?: string;
}

/** Garis kecil (sparkline) untuk StatCard — tanpa sumbu/label. */
export function Sparkline({
  values,
  color = "var(--chart-1)",
  height = 36,
  className,
}: SparklineProps) {
  const { ref, inView, prefersReducedMotion } = useInView<HTMLDivElement>();
  const animated = inView && !prefersReducedMotion;
  if (values.length < 2) return null;
  const data = values.map((value, index) => ({ index, value }));

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
          <YAxis hide dataKey="value" domain={["dataMin", "dataMax"]} />
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
