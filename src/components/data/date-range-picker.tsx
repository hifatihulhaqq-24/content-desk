"use client";

import { CalendarIcon } from "lucide-react";
import { useDateRange } from "@/hooks/use-date-range";
import { useMounted } from "@/hooks/use-mounted";
import { countDays } from "@/lib/date";
import { cn } from "@/lib/utils";

/**
 * Filter tanggal versi final: chip statis "7 hari terakhir" tanpa dropdown
 * atau calendar — rentang selalu 7 hari (1 minggu) untuk semua halaman
 * analytics, persis mock kumparanDesk — PRODUCT MVP.
 */
export function DateRangePicker({ className }: { className?: string }) {
  const { range } = useDateRange();
  const mounted = useMounted();
  const days = countDays(range);

  return (
    <div
      className={cn(
        "inline-flex h-8 select-none items-center gap-2 rounded-md border bg-background px-2.5 text-sm shadow-xs",
        className
      )}
      aria-label={`Rentang tanggal: ${days} hari terakhir`}
    >
      <CalendarIcon className="size-4 text-muted-foreground" aria-hidden />
      {mounted ? (
        <span className="text-sm">{days} hari terakhir</span>
      ) : (
        <span
          aria-hidden
          className="h-4 w-28 animate-pulse rounded bg-muted"
        />
      )}
    </div>
  );
}
