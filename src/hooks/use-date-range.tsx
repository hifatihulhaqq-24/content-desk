"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import type { DateRangeQuery } from "@/types/analytics";
import {
  defaultDateRange,
  rangeToQuery,
  type DateRange,
} from "@/lib/date";

/**
 * Placeholder tanpa pembacaan waktu (prerender aman). Nilai sesungguhnya
 * diambil via useSyncExternalStore setelah hydration — larangan
 * blocking-prerender-current-time dan react-hooks/set-state-in-effect
 * sama-sama terpenuhi.
 */
const PLACEHOLDER_RANGE: DateRange = {
  from: new Date(2026, 8, 1),
  to: new Date(2026, 8, 30),
};

const subscribeNoop = () => () => {};
const getServerRange = () => PLACEHOLDER_RANGE;

let cachedClientRange: DateRange | null = null;
function getClientRange(): DateRange {
  cachedClientRange ??= defaultDateRange();
  return cachedClientRange;
}

interface DateRangeContextValue {
  range: DateRange;
  query: DateRangeQuery;
  /** false selama hydration — query menunggu nilai tanggal yang asli. */
  ready: boolean;
  /** Preset tunggal: 7 hari (1 minggu) terakhir. */
  presetDays: number;
}

const DateRangeContext = createContext<DateRangeContextValue | null>(null);

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const defaultRange = useSyncExternalStore(
    subscribeNoop,
    getClientRange,
    getServerRange
  );

  const value = useMemo<DateRangeContextValue>(() => {
    // Filter tanggal selalu 7 hari terakhir — tanpa preset/custom range lain.
    const range = defaultRange;
    return {
      range,
      query: rangeToQuery(range),
      ready: defaultRange !== PLACEHOLDER_RANGE,
      presetDays: 7,
    };
  }, [defaultRange]);

  return (
    <DateRangeContext.Provider value={value}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange(): DateRangeContextValue {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange harus dipakai di dalam DateRangeProvider");
  }
  return context;
}
