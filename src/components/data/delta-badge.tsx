import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DeltaBadgeProps {
  /** Persentase perubahan vs periode sebelumnya; null bila tidak tersedia. */
  value: number | null;
  className?: string;
}

/**
 * Indikator perubahan (%). Tidak hanya mengandalkan warna —
 * selalu ada ikon panah dan teks persentase (pedoman aksesibilitas PRD).
 */
export function DeltaBadge({ value, className }: DeltaBadgeProps) {
  if (value === null || !Number.isFinite(value)) {
    return (
      <span className="text-xs text-muted-foreground" aria-label="Tidak ada data pembanding">
        —
      </span>
    );
  }

  const isUp = value > 0;
  const isFlat = value === 0;
  const Icon = isFlat ? Minus : isUp ? ArrowUpRight : ArrowDownRight;
  const tone = isFlat
    ? "text-muted-foreground"
    : isUp
      ? "text-emerald-600 dark:text-emerald-500"
      : "text-red-600 dark:text-red-500";
  const word = isFlat ? "tetap" : isUp ? "naik" : "turun";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
        tone,
        className
      )}
      aria-label={`${word} ${formatPercent(Math.abs(value))} dibanding periode sebelumnya`}
    >
      <Icon className="size-3.5" aria-hidden />
      {formatPercent(Math.abs(value))}
    </span>
  );
}
