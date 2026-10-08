"use client";

import { PlatformIcon } from "@/components/icons/platform-icon";
import { VISIBLE_PLATFORMS, type PlatformId } from "@/config/platforms";
import { cn } from "@/lib/utils";

interface PlatformChipsProps {
  /** Platform terpilih; kosong = semua platform. */
  value: PlatformId[];
  onChange: (value: PlatformId[]) => void;
  /** Label grup untuk aksesibilitas. */
  label?: string;
}

function chipClass(active: boolean): string {
  return cn(
    "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring",
    active
      ? "border-primary bg-primary/10 font-medium text-foreground"
      : "bg-transparent text-muted-foreground hover:bg-muted/60"
  );
}

/**
 * Chips filter platform multi-toggle (ikut layout mock kumparanDesk):
 * "Semua" aktif bila tidak ada pilihan; chip platform men-toggle dirinya.
 */
export function PlatformChips({
  value,
  onChange,
  label = "Filter platform",
}: PlatformChipsProps) {
  const allActive = value.length === 0;
  const toggle = (id: PlatformId) =>
    onChange(
      value.includes(id)
        ? value.filter((item) => item !== id)
        : [...value, id]
    );

  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-wrap items-center gap-1.5"
    >
      <button
        type="button"
        aria-pressed={allActive}
        onClick={() => onChange([])}
        className={chipClass(allActive)}
      >
        Semua
      </button>
      {VISIBLE_PLATFORMS.map((platform) => {
        const active = value.includes(platform.id);
        return (
          <button
            key={platform.id}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(platform.id)}
            className={chipClass(active)}
          >
            <PlatformIcon
              platform={platform.id}
              className="size-3.5 shrink-0"
              style={{ color: platform.color }}
              aria-hidden
            />
            {platform.name}
          </button>
        );
      })}
    </div>
  );
}
