"use client";

import { useState } from "react";
import { Check, Download, FileJson, FileText, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { BriefData } from "@/types/ideation";
import { exportJson, exportMarkdown, saveBrief, type BriefMeta } from "./brief-export";

interface BriefToolbarProps {
  meta: BriefMeta;
  draft: BriefData;
  busy?: boolean;
}

/**
 * Aksi halaman brief: Simpan (localStorage) dan Ekspor (Markdown / JSON).
 */
export function BriefToolbar({ meta, draft, busy }: BriefToolbarProps) {
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
    } catch {
      toast.error("Gagal menyimpan draf ke penyimpanan lokal.");
    } finally {
      // Beri jeda kecil supaya ikon loading terlihat (mock UX).
      window.setTimeout(() => setSaving(false), 400);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
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
          <Button type="button" size="sm" disabled={busy}>
            <Download className="size-3.5" aria-hidden />
            Ekspor
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
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
        </DropdownMenuContent>
      </DropdownMenu>

      {savedAt && (
        <span className="hidden text-xs text-muted-foreground md:inline">
          Terakhir disimpan {savedAt}
        </span>
      )}
    </div>
  );
}
