"use client";

import { useState } from "react";
import {
  Check,
  Download,
  FileJson,
  FileText,
  Loader2,
  Printer,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { BriefData } from "@/types/ideation";
import { cn } from "@/lib/utils";
import {
  exportJson,
  exportMarkdown,
  exportPdf,
  saveBrief,
  type BriefMeta,
} from "./brief-export";

interface BriefToolbarProps {
  meta: BriefMeta;
  draft: BriefData;
  busy?: boolean;
  /** Dipanggil setelah simpan sukses — untuk kembali ke landing Konten Brief. */
  onSaved?: () => void;
}

/**
 * Aksi halaman brief: Simpan (localStorage, lalu kembali ke landing Konten
 * Brief lewat `onSaved`) dan Ekspor (Markdown / JSON / PDF).
 *
 * Berbentuk bar mengambang (`fixed`) di dasar layar agar tombol aksi selalu
 * terjangkau tanpa scroll ke atas. Lapisan pembungkusnya `pointer-events-none`
 * supaya area kosong di kiri/kanan bar tetap bisa diklik, dan `print:hidden`
 * agar bar tidak ikut tercetak saat ekspor PDF.
 */
export function BriefToolbar({ meta, draft, busy, onSaved }: BriefToolbarProps) {
  const [savedAt, setSavedAt] = useState<string | null>(meta.savedAt);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    const stamp = new Date().toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    try {
      saveBrief({ meta: { ...meta, savedAt: stamp }, draft });
      setSavedAt(stamp);
      toast.success("Draf tersimpan di perangkat ini.");
      if (onSaved) {
        // Jeda agar pesan sukses sempat terbaca sebelum pindah halaman.
        window.setTimeout(onSaved, 700);
      } else {
        window.setTimeout(() => setSaving(false), 400);
      }
    } catch {
      toast.error("Gagal menyimpan draf ke penyimpanan lokal.");
      setSaving(false);
    }
  };

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4 print:hidden"
      )}
    >
      <div
        className={cn(
          "pointer-events-auto flex items-center gap-2 rounded-2xl border border-border/70 bg-background/80 p-1.5 pl-2 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-card/80 dark:shadow-black/40"
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={busy || saving}
        >
          {saving ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : savedAt ? (
            <Check className="size-3.5" aria-hidden />
          ) : (
            <Save className="size-3.5" aria-hidden />
          )}
          {savedAt ? "Tersimpan" : "Simpan"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" size="sm" disabled={busy || saving}>
              <Download className="size-3.5" aria-hidden />
              Ekspor
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="top" className="w-56">
            <DropdownMenuItem onSelect={() => exportMarkdown(meta, draft)}>
              <FileText aria-hidden />
              <span className="flex flex-col">
                <span>Markdown (.md)</span>
                <span className="text-[11px] text-muted-foreground">
                  Ringkas, siap tempel
                </span>
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => exportJson(meta, draft)}>
              <FileJson aria-hidden />
              <span className="flex flex-col">
                <span>JSON (.json)</span>
                <span className="text-[11px] text-muted-foreground">
                  Struktur lengkap
                </span>
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              // Tunda satu tick agar menu Radix sempat tertutup sebelum dialog
              // cetak mengambil alih fokus.
              onSelect={() => window.setTimeout(exportPdf, 0)}
            >
              <Printer aria-hidden />
              <span className="flex flex-col">
                <span>PDF (.pdf)</span>
                <span className="text-[11px] text-muted-foreground">
                  Pilih “Save as PDF” di dialog
                </span>
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {savedAt && (
          <span className="hidden border-l border-border/70 pl-2 pr-1 text-xs text-muted-foreground md:inline">
            Terakhir: {savedAt}
          </span>
        )}
      </div>
    </div>
  );
}
