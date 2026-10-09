"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Pencil, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BriefSectionKey } from "@/types/ideation";

interface BriefSectionProps {
  /** Anchor id — dipakai daftar isi untuk scroll & scroll-spy. */
  id: string;
  /** Section key — null bila section tidak bisa di-regenerate. */
  sectionKey?: BriefSectionKey | null;
  title: string;
  description?: string;
  busy?: boolean;
  /** Konten mode tampil. */
  children: ReactNode;
  /** Konten mode edit — bila tidak diberikan, tombol Edit tidak tampil. */
  editContent?: ReactNode;
  onRegenerate?: (section: BriefSectionKey) => void;
  className?: string;
}

/**
 * Section canvas brief: anchor untuk navigasi daftar isi, toggle edit inline,
 * dan aksi regenerate per bagian.
 */
export function BriefSection({
  id,
  sectionKey,
  title,
  description,
  busy,
  children,
  editContent,
  onRegenerate,
  className,
}: BriefSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [editing, setEditing] = useState(false);
  const [flash, setFlash] = useState(false);

  // Sorot singkat saat di-scroll dari daftar isi (sinyal visual navigasi).
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    // Daftar isi mem-broadcast sorotan lewat CustomEvent pada window.
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (detail !== id) return;
      setFlash(true);
      window.setTimeout(() => setFlash(false), 1200);
    };
    window.addEventListener("brief:focus-section", handler);
    return () => window.removeEventListener("brief:focus-section", handler);
  }, [id]);

  return (
    <section
      id={id}
      ref={ref}
      data-section={id}
      className={cn(
        "scroll-mt-24 rounded-xl border border-border bg-card p-4 shadow-xs transition-colors duration-700",
        flash && "border-primary/60 bg-primary/5",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 print:hidden">
          {onRegenerate && sectionKey && (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={`Buat ulang ${title}`}
              title="Buat ulang bagian ini"
              disabled={busy}
              onClick={() => onRegenerate(sectionKey)}
            >
              <RotateCw className={cn("size-3.5", busy && "animate-spin")} aria-hidden />
            </Button>
          )}
          {editContent && (
            <Button
              type="button"
              size="sm"
              variant={editing ? "secondary" : "outline"}
              disabled={busy}
              onClick={() => setEditing((value) => !value)}
            >
              {editing ? (
                <>
                  <Check className="size-3.5" aria-hidden /> Selesai
                </>
              ) : (
                <>
                  <Pencil className="size-3.5" aria-hidden /> Edit
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-3">{editing ? editContent : children}</div>
    </section>
  );
}
