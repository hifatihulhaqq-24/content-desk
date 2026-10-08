"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import type { DateRangeQuery } from "@/types/analytics";
import {
  defaultDateRange,
  presetDateRange,
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
  presetDays: number | null;
  setRange: (range: DateRange) => void;
  applyPreset: (days: 7 | 30 | 90) => void;
}

const DateRangeContext = createContext<DateRangeContextValue | null>(null);

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const defaultRange = useSyncExternalStore(
    subscribeNoop,
    getClientRange,
    getServerRange
  );
  const [override, setOverride] = useState<{
    range: DateRange;
    presetDays: number | null;
  } | null>(null);

  const value = useMemo<DateRangeContextValue>(() => {
    const range = override?.range ?? defaultRange;
    return {
      range,
      query: rangeToQuery(range),
      ready: defaultRange !== PLACEHOLDER_RANGE,
      presetDays: override ? override.presetDays : 30,
      setRange: (next) => setOverride({ range: next, presetDays: null }),
      applyPreset: (days) =>
        setOverride({ range: presetDateRange(days), presetDays: days }),
    };
  }, [defaultRange, override]);

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
