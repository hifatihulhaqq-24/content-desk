"use client";

import { Film, RefreshCw, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MediaPreviewProps {
  label: string;
  /** Nilai aspect ratio ("9:16"); kosong = tinggi tetap. */
  aspect?: string;
  /** Label elemen untuk aksesibilitas. */
  ariaLabel?: string;
  busy?: boolean;
  onReplace?: () => void;
  onRegenerate?: () => void;
  className?: string;
}

/**
 * Placeholder media render dengan aksi ganti & generate ulang (R17/R20/R22).
 * Generator media sungguhan di luar scope — tampil sebagai placeholder mock.
 */
export function MediaPreview({
  label,
  aspect,
  ariaLabel,
  busy,
  onReplace,
  onRegenerate,
  className,
}: MediaPreviewProps) {
  const style =
    aspect && aspect.includes(":")
      ? { aspectRatio: aspect.replace(":", " / ") }
      : undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        role="img"
        aria-label={ariaLabel ?? label}
        style={style}
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/60",
          !style && "h-28"
        )}
      >
        <span className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
          <Film className="size-5" aria-hidden />
          {label}
        </span>
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/60">
            <RefreshCw className="size-4 animate-spin text-primary" aria-hidden />
          </span>
        )}
      </div>
      {(onReplace || onRegenerate) && (
        <div className="flex flex-wrap gap-2">
          {onReplace && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onReplace}
              disabled={busy}
            >
              <Shuffle className="size-3.5" aria-hidden /> Ganti
            </Button>
          )}
          {onRegenerate && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onRegenerate}
              disabled={busy}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw
                className={cn("size-3.5", busy && "animate-spin")}
                aria-hidden
              />
              Generate ulang
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
