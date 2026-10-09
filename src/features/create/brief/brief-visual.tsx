"use client";

import { Film, ImageIcon } from "lucide-react";
import { bucketImageFor } from "@/lib/mock-bucket-images";
import { cn } from "@/lib/utils";

type VisualVariant = "single" | "scene" | "slide";

interface BriefVisualProps {
  /** Key deterministik untuk memilih gambar mock. */
  seedKey: string;
  /** Teks overlay besar (mock render — generator media di luar scope). */
  overlayText?: string;
  /** Aspect ratio ("9:16"); kosong = tinggi tetap. */
  aspect?: string;
  variant?: VisualVariant;
  /** Badge kecil di kiri atas, mis. "Adegan 1". */
  badge?: string;
  /**
   * Thumbnail mungil tanpa teks overlay — dipakai section "Pratinjau render"
   * yang sengaja diletakkan paling bawah dan berukuran kecil, karena fase
   * brief berfokus pada teks.
   */
  compact?: boolean;
  className?: string;
}

const VARIANT_STYLE: Record<VisualVariant, { height: string; text: string }> = {
  single: { height: "h-72", text: "text-2xl md:text-3xl" },
  scene: { height: "h-40", text: "text-base md:text-lg" },
  slide: { height: "h-44", text: "text-base md:text-lg" },
};

/**
 * Preview visual brief — mock render memakai gambar dari /public/mock dengan
 * overlay gradien + teks hook/caption besar supaya terlihat seperti hasil
 * render sungguhan saat preview. Generator media asli di luar scope.
 */
export function BriefVisual({
  seedKey,
  overlayText,
  aspect,
  variant = "single",
  badge,
  compact = false,
  className,
}: BriefVisualProps) {
  const src = bucketImageFor(seedKey);
  const style = VARIANT_STYLE[variant];
  const ratioStyle =
    !compact && aspect && aspect.includes(":")
      ? { aspectRatio: aspect.replace(":", " / ") }
      : undefined;
  const showOverlay = !compact && Boolean(overlayText);

  return (
    <div
      role="img"
      aria-label={overlayText ? `Pratinjau visual: ${overlayText}` : "Pratinjau visual"}
      style={ratioStyle}
      className={cn(
        "relative w-full overflow-hidden rounded-lg border border-border bg-muted",
        !ratioStyle && (compact ? "h-16" : style.height),
        compact && "min-w-0",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover"
      />
      {/* Overlay gradien agar teks terbaca di atas foto. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-linear-to-t from-black/80 via-black/35 to-black/10",
          compact && "from-black/55 to-black/15"
        )}
      />

      {badge && (
        <span
          className={cn(
            "absolute rounded-full bg-black/55 px-2 py-0.5 font-medium text-white backdrop-blur-sm",
            compact ? "left-1 top-1 text-[10px]" : "left-3 top-3 text-[11px]"
          )}
        >
          {badge}
        </span>
      )}

      {showOverlay ? (
        <span className="absolute inset-x-0 bottom-0 p-4">
          <span
            className={cn(
              "block font-bold leading-tight text-white drop-shadow-sm",
              style.text
            )}
          >
            {overlayText}
          </span>
        </span>
      ) : (
        !compact && (
          <span className="absolute inset-x-0 bottom-0 p-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-white/85">
              <Film className="size-3.5" aria-hidden />
              Placeholder media render
            </span>
          </span>
        )
      )}

      {!compact && aspect && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          <ImageIcon className="size-3" aria-hidden />
          {aspect}
        </span>
      )}
    </div>
  );
}
