"use client";

import type { ReactNode } from "react";
import { EmptyState, ErrorState } from "./states";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type ChartStatus = "pending" | "error" | "success";

interface ChartCardProps {
  title: string;
  /** Kelas judul h2 — default 14px; section Overview memakai 18px. */
  titleClassName?: string;
  description?: string;
  /** Aksi kanan atas (tombol, link, dll.). */
  actions?: ReactNode;
  /** Filter periode/aksi di area header. */
  filter?: ReactNode;
  status?: ChartStatus;
  isEmpty?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyMessage?: string;
  /** Tinggi area konten chart (px). Nilai "content" = hug konten (tanpa minHeight). */
  height?: number | "content";
  /** Legend/catatan di bawah chart. */
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Wrapper standar semua chart: judul, deskripsi, filter, aksi,
 * serta state loading / empty / error (UI States Guarantee PRD).
 */
export function ChartCard({
  title,
  titleClassName,
  description,
  actions,
  filter,
  status = "success",
  isEmpty = false,
  onRetry,
  emptyTitle,
  emptyMessage,
  height = 280,
  footer,
  children,
  className,
}: ChartCardProps) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-xl bg-card text-card-foreground shadow-xs",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 p-4 pb-0">
        <div className="min-w-0">
          <h2 className={cn("text-sm font-semibold", titleClassName)}>{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {filter}
          {actions}
        </div>
      </div>

      <div
        className="flex flex-1 flex-col p-4"
        style={{
          minHeight: height === "content" ? undefined : height,
        }}
      >
        {status === "pending" && (
          <Skeleton
            className="h-full w-full"
            style={{ minHeight: height === "content" ? undefined : height }}
          />
        )}
        {status === "error" && <ErrorState onRetry={onRetry} />}
        {status === "success" && isEmpty && (
          <EmptyState title={emptyTitle} message={emptyMessage} />
        )}
        {status === "success" && !isEmpty && children}
      </div>

      {footer && (
        <div className="border-t px-4 py-3 text-xs text-muted-foreground">
          {footer}
        </div>
      )}
    </section>
  );
}
