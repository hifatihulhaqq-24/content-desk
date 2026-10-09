"use client";

import { useEffect, useState } from "react";
import { Check, CircleDashed, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/data/states";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { BriefController } from "@/hooks/use-brief";
import { BriefCanvas, tocItemsForDraft } from "./brief/brief-canvas";
import { BriefToc } from "./brief/brief-toc";
import { BriefToolbar } from "./brief/brief-toolbar";
import type { BriefMeta } from "./brief/brief-export";
import type { CreateFlow } from "./use-create-flow";

interface StepBriefProps {
  flow: CreateFlow;
  brief: BriefController;
}

const STAGES = [
  "Menganalisis topik & angle terpilih",
  "Menyusun struktur draf",
  "Menyiapkan teks & placeholder media",
];

/** Panel loading bertahap (R13) — di-mount ulang tiap generate. */
function GeneratingPanel() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = STAGES.map((_, index) =>
      window.setTimeout(() => setStage(index + 1), (index + 1) * 900)
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
      <div className="flex items-center gap-2">
        <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
        <h2 className="text-sm font-semibold">Sedang menyusun draf brief…</h2>
      </div>
      <ol className="mt-4 space-y-3">
        {STAGES.map((label, index) => (
          <li key={label} className="flex items-center gap-2 text-sm">
            {index < stage ? (
              <Check className="size-4 text-positive" aria-hidden />
            ) : index === stage ? (
              <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
            ) : (
              <CircleDashed className="size-4 text-muted-foreground/60" aria-hidden />
            )}
            <span
              className={
                index <= stage ? "text-foreground" : "text-muted-foreground"
              }
            >
              {label}
            </span>
          </li>
        ))}
      </ol>
      <Progress
        className="mt-4"
        value={((stage + 0.5) / STAGES.length) * 100}
        aria-label="Progres pembuatan draf"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        Estimasi beberapa detik — kamu akan masuk ke tahap penyuntingan
        setelah draf siap.
      </p>
    </section>
  );
}

/**
 * Host halaman brief: canvas kiri + daftar isi kanan.
 * Mengekspos daftar isi ke halaman lewat `onTocChange` bila diperlukan.
 */
export function StepBrief({ flow, brief }: StepBriefProps) {
  const draft = brief.draft;
  const busy = brief.status === "generating";
  const showSkeleton = busy && !draft;

  // Regenerate saat draft sudah ada: cukup toast bila gagal, draft tetap tampil.
  useEffect(() => {
    if (brief.status === "error" && draft) {
      toast.error(brief.error ?? "Gagal memperbarui draf. Silakan coba lagi.");
    }
  }, [brief.status, brief.error, draft]);

  if (!draft) {
    return (
      <div className="space-y-6">
        {showSkeleton ? (
          <GeneratingPanel />
        ) : brief.status === "error" ? (
          <ErrorState
            title="Gagal membuat draf brief"
            message={brief.error ?? "Terjadi gangguan saat membuat draf."}
            onRetry={() => brief.generate()}
            className="min-h-56"
          />
        ) : (
          <EmptyState
            title="Lengkapi pilihan terlebih dahulu"
            message="Pilih angle di halaman sebelumnya untuk membuat draf brief."
            className="min-h-56"
            action={
              <Button type="button" size="sm" onClick={() => flow.goToAngles()}>
                Kembali ke pilihan angle
              </Button>
            }
          />
        )}
      </div>
    );
  }

  const meta: BriefMeta = {
    topic: flow.topicTitle,
    angle: flow.angle?.title ?? null,
    scenario: flow.scenario === "custom" ? "Topik sendiri" : "Rekomendasi",
    imageCount: flow.images.length,
    links: flow.links,
    savedAt: null,
  };
  const tocItems = tocItemsForDraft(draft);

  return (
    <div className="space-y-4">
      <BriefToolbar meta={meta} draft={draft} busy={busy} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
        <BriefCanvas
          draft={draft}
          brief={brief}
          topic={flow.topicTitle}
          angle={flow.angle?.title ?? null}
          scenario={flow.scenario}
          imageCount={flow.images.length}
          links={flow.links}
        />
        <BriefToc items={tocItems} />
      </div>

      <p className={cn("text-xs text-muted-foreground")}>
        Edit manual: {brief.editCount} · Draf tersimpan lokal di perangkat ini
        (tekan Simpan) — tanpa penyimpanan server.
      </p>
    </div>
  );
}
