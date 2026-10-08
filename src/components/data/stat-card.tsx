"use client";

import type { ReactNode } from "react";
import { DeltaBadge } from "./delta-badge";
import { Sparkline } from "./sparkline";
import { formatMetricValue } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MetricFormat } from "@/types/analytics";

interface StatCardProps {
  label: string;
  value: number | string;
  format?: MetricFormat;
  deltaPercent?: number | null;
  /** Satuan delta (lihat DeltaBadge): "%" atau "pp". */
  deltaUnit?: "%" | "pp";
  /** Deret nilai untuk sparkline opsional (mis. 30 titik terakhir). */
  sparkline?: number[] | null;
  /** Deret pembanding (periode sebelumnya) — garis putus-putus abu. */
  previousSparkline?: number[] | null;
  /** Label sumbu X di bawah sparkline (mis. hari: "Rab", "Kam", …). */
  axisLabels?: string[] | null;
  /** Keterangan kecil di bawah nilai. */
  hint?: ReactNode;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  format = "number",
  deltaPercent = null,
  deltaUnit = "%",
  sparkline = null,
  previousSparkline = null,
  axisLabels = null,
  hint,
  loading = false,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "rounded-xl bg-card p-4 text-card-foreground shadow-xs",
          className
        )}
      >
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-7 w-32" />
        <Skeleton className="mt-3 h-9 w-full" />
      </div>
    );
  }

  const displayValue =
    typeof value === "number" ? formatMetricValue(value, format) : value;

  return (
    <div
      className={cn(
        "rounded-xl bg-card p-4 text-card-foreground shadow-xs",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <DeltaBadge value={deltaPercent} unit={deltaUnit} />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
        {displayValue}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {sparkline && sparkline.length > 1 && (
        <>
          <Sparkline
            values={sparkline}
            previousValues={previousSparkline}
            className="mt-3"
          />
          {axisLabels && axisLabels.length > 0 && (
            <div
              className="mt-1 flex justify-between text-[10px] leading-none text-muted-foreground tabular-nums"
              aria-hidden
            >
              {axisLabels.map((labelText, index) => (
                <span key={`${index}-${labelText}`}>{labelText}</span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
