import type { MetricFormat } from "@/config/metrics";

const ID_LOCALE = "id-ID";

/** Angka ringkas ala dashboard: 999, 1,2K, 3,4M, 1,1M+ (sesuai PRD). */
export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const trim = (n: number) =>
    n.toLocaleString(ID_LOCALE, { maximumFractionDigits: 1 });
  if (abs >= 1_000_000_000) return `${sign}${trim(abs / 1_000_000_000)}M`;
  if (abs >= 1_000_000) return `${sign}${trim(abs / 1_000_000)}M`;
  if (abs >= 1_000) return `${sign}${trim(abs / 1_000)}K`;
  return value.toLocaleString(ID_LOCALE, { maximumFractionDigits: 0 });
}

/** Angka penuh dengan pemisah ribuan lokal: 12.450. */
export function formatNumber(value: number, maxFractionDigits = 0): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(ID_LOCALE, { maximumFractionDigits: maxFractionDigits });
}

export function formatPercent(value: number, fractionDigits = 1): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toLocaleString(ID_LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}%`;
}

/** Ukuran file → label ringkas (mis. 1,2 MB). */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toLocaleString(ID_LOCALE, { maximumFractionDigits: 1 })} ${units[unit]}`;
}

/** Durasi detik → m:ss (mis. 2:45). */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}:${String(m % 60).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatHours(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${formatNumber(value, 1)} jam`;
}

export function formatMetricValue(value: number, format: MetricFormat): string {
  switch (format) {
    case "percent":
      return formatPercent(value);
    case "hours":
      return formatHours(value);
    case "duration":
      return formatDuration(value);
    case "decimal":
      return formatNumber(value, 1);
    default:
      return formatCompact(value);
  }
}

export function formatDate(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(`${iso}T00:00:00`) : iso;
  return date.toLocaleDateString(ID_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(`${iso}T00:00:00`) : iso;
  return date.toLocaleDateString(ID_LOCALE, { day: "numeric", month: "short" });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString(ID_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRange(from: string, to: string): string {
  return `${formatDate(from)} – ${formatDate(to)}`;
}
