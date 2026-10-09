"use client";

import {
  ArrowRight,
  Check,
  FileText,
  GalleryHorizontal,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { CONTENT_TYPE_MAP } from "@/config/content-types";
import { cn } from "@/lib/utils";
import type { AngleOption, ContentTypeId } from "@/types/ideation";

const ICONS = {
  FileText,
  Video,
  Image: ImageIcon,
  GalleryHorizontal,
} as const;

/** Tile format — warna dari token chart per tipe konten. */
const TYPE_TINTS: Record<ContentTypeId, string> = {
  article:
    "bg-[color-mix(in_oklab,var(--chart-block-content)_15%,transparent)] text-[var(--chart-block-content)] dark:text-chart-1",
  video:
    "bg-[color-mix(in_oklab,var(--chart-impressions)_15%,transparent)] text-[var(--chart-impressions-dark)] dark:text-chart-2",
  image:
    "bg-[color-mix(in_oklab,var(--chart-content)_13%,transparent)] text-[var(--chart-content)] dark:text-chart-3",
  carousel:
    "bg-[color-mix(in_oklab,var(--chart-engagements)_15%,transparent)] text-[var(--chart-engagements-dark)] dark:text-chart-4",
};

interface AngleCardProps {
  option: AngleOption;
  selected: boolean;
  /** Ringkasan lampiran user, mis. "2 gambar & 1 link referensi". */
  attachmentsLabel?: string | null;
  onSelect: () => void;
}

/**
 * Kartu angle bergaya kartu marketplace: icon tile + judul + meta, badge
 * status di kanan atas, deskripsi, divider, lalu aksi footer.
 *
 * Klik kartu hanya menandai pilihan (tanpa navigasi) — lanjut ke draf lewat
 * tombol "Generate Draft" yang sticky di bawah halaman angle.
 */
export function AngleCard({
  option,
  selected,
  attachmentsLabel,
  onSelect,
}: AngleCardProps) {
  const typeInfo = CONTENT_TYPE_MAP[option.contentType];
  const TypeIcon = ICONS[typeInfo.icon];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group flex h-full flex-col rounded-xl border bg-card p-4 text-left shadow-xs",
        "transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring",
        selected
          ? "border-primary ring-1 ring-primary"
          : "border-border hover:border-primary/40"
      )}
    >
      <span className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            TYPE_TINTS[option.contentType]
          )}
        >
          <TypeIcon className="size-5" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold leading-snug">
              {option.title}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                selected
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {selected ? "Terpilih" : "Tersedia"}
            </span>
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {typeInfo.label}
            {attachmentsLabel ? ` · ${attachmentsLabel}` : ""}
          </span>
        </span>
      </span>

      <span className="mt-3 line-clamp-2 block text-sm text-muted-foreground">
        {option.description}
      </span>

      <span className="mb-4 mt-2 line-clamp-2 block border-l-2 border-[color-mix(in_oklab,var(--chart-content)_35%,transparent)] pl-2 text-xs italic text-muted-foreground">
        {option.basis}
      </span>

      <span
        className={cn(
          "mt-auto flex items-center gap-1 border-t border-border pt-4 text-sm font-medium transition-colors",
          selected ? "text-primary" : "text-muted-foreground group-hover:text-primary"
        )}
      >
        {selected ? "Angle terpilih" : "Pilih angle ini"}
        {selected ? (
          <Check className="size-4" aria-hidden />
        ) : (
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        )}
      </span>
    </button>
  );
}
