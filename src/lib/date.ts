import { addDays, format, eachDayOfInterval, parseISO } from "date-fns";
import type { DateRangeQuery } from "@/types/analytics";

export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Filter tanggal hanya punya satu pilihan: 7 hari (1 minggu) terakhir —
 * berlaku untuk seluruh halaman analytics (catetan Prambanan).
 */
export const RANGE_PRESETS = [{ label: "7 hari", days: 7 }] as const;

export type RangePresetDays = (typeof RANGE_PRESETS)[number]["days"];

export function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function defaultDateRange(): DateRange {
  // Default periode 7 hari terakhir (catetan Prambanan 8 Okt 2026).
  return presetDateRange(7);
}

export function presetDateRange(days: RangePresetDays): DateRange {
  return { from: addDays(today(), -(days - 1)), to: today() };
}

export function rangeToQuery(range: DateRange): DateRangeQuery {
  return { from: toIsoDate(range.from), to: toIsoDate(range.to) };
}

export function countDays(range: DateRange): number {
  return eachDayOfInterval({ start: range.from, end: range.to }).length;
}

/** Periode sebelumnya dengan panjang yang sama, tepat di sebelah kiri `range`. */
export function previousRange(range: DateRange): DateRange {
  const length = countDays(range);
  const to = addDays(range.from, -1);
  return { from: addDays(to, -(length - 1)), to };
}

export function listDays(range: DateRange): string[] {
  return eachDayOfInterval({ start: range.from, end: range.to }).map((d) =>
    toIsoDate(d)
  );
}

export function isRangeValid(range: DateRange): boolean {
  return (
    range.from instanceof Date &&
    range.to instanceof Date &&
    !Number.isNaN(range.from.getTime()) &&
    !Number.isNaN(range.to.getTime()) &&
    range.from <= range.to
  );
}

export function parseIso(value: string): Date {
  return parseISO(value);
}
