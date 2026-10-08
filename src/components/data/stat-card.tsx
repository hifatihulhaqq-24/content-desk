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
  /** Deret nilai untuk sparkline opsional (mis. 30 titik terakhir). */
  sparkline?: number[] | null;
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
  sparkline = null,
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
        <DeltaBadge value={deltaPercent} />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
        {displayValue}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {sparkline && sparkline.length > 1 && (
        <Sparkline values={sparkline} className="mt-3" />
      )}
    </div>
  );
}
