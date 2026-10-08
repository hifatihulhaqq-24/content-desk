"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CircleDashed,
  Loader2,
  RefreshCw,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/data/states";
import { contentTypeLabel } from "@/config/content-types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { BriefController } from "@/hooks/use-brief";
import { ArticlePanel } from "./brief/article-panel";
import { CarouselPanel } from "./brief/carousel-panel";
import { ImagePanel } from "./brief/image-panel";
import { VideoPanel } from "./brief/video-panel";
import { SelectionSummary } from "./selection-summary";
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
        <h2 className="text-sm font-semibold">AI sedang menyusun draf brief…</h2>
      </div>
      <ol className="mt-4 space-y-3">
        {STAGES.map((label, index) => (
          <li key={label} className="flex items-center gap-2 text-sm">
            {index < stage ? (
              <Check className="size-4 text-emerald-600" aria-hidden />
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
        Estimasi beberapa detik — Anda akan masuk ke tahap penyuntingan setelah
        draf siap.
      </p>
    </section>
  );
}

/** Step 3 — generator draf brief (R13/R14) + komentar & regenerate. */
export function StepBrief({ flow, brief }: StepBriefProps) {
  const draft = brief.draft;
  const busy = brief.status === "generating";
  const showSkeleton = busy && !draft;
  const [comment, setComment] = useState("");

  // Regenerate saat draft sudah ada: cukup toast bila gagal, draft tetap tampil.
  useEffect(() => {
    if (brief.status === "error" && draft) {
      toast.error(brief.error ?? "Gagal memperbarui draf. Silakan coba lagi.");
    }
  }, [brief.status, brief.error, draft]);

  if (!draft) {
    return (
      <div className="space-y-6">
        <SelectionSummary
          scenario={flow.scenario}
          topicTitle={flow.topicTitle}
          angleTitle={flow.angle?.title ?? null}
          contentType={flow.contentType}
        />
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
            message="Pilih angle dan tipe konten di step sebelumnya untuk membuat draf brief."
            className="min-h-56"
            action={
              <Button type="button" size="sm" onClick={() => flow.goToStep(2)}>
                Kembali ke Angle & Format
              </Button>
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SelectionSummary
        scenario={flow.scenario}
        topicTitle={flow.topicTitle}
        angleTitle={flow.angle?.title ?? null}
        contentType={flow.contentType}
      />

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">
              Draf Brief · {contentTypeLabel(draft.contentType)}
            </h2>
            <Badge
              variant="secondary"
              className={cn(busy && "bg-amber-500/10 text-amber-600 dark:text-amber-400")}
            >
              {busy ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="size-3 animate-spin" aria-hidden />
                  Memperbarui…
                </span>
              ) : (
                "Siap diedit"
              )}
            </Badge>
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {flow.topicTitle} · angle “{flow.angle?.title}” · skenario{" "}
            {flow.scenario === "custom" ? "topik sendiri" : "rekomendasi"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => flow.goToStep(2)}
            disabled={busy}
          >
            <ArrowLeft className="size-4" aria-hidden /> Ubah pilihan
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => brief.generate()}
            disabled={busy}
          >
            <RefreshCw
              className={cn("size-4", busy && "animate-spin")}
              aria-hidden
            />
            Regenerate seluruh draf
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold">Komentar untuk AI</h3>
            <p className="text-xs text-muted-foreground">
              Arahkan draf, mis. “bahasa lebih santai” — draf akan dibuat ulang
              mengikuti komentar.
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-end gap-2">
          <Textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Tulis komentar / arahan untuk AI…"
            rows={2}
            aria-label="Komentar untuk AI"
            disabled={busy}
            className="resize-y"
          />
          <Button
            type="button"
            disabled={busy || comment.trim().length === 0}
            onClick={() => {
              brief.submitComment(comment.trim());
              setComment("");
            }}
          >
            <Send className="size-4" aria-hidden />
            Kirim & regenerate
          </Button>
        </div>
      </section>

      {draft.contentType === "article" && (
        <ArticlePanel
          data={draft.data}
          busy={busy}
          onPatch={brief.patch}
          onRegenerate={brief.regenerateSection}
        />
      )}
      {draft.contentType === "video" && (
        <VideoPanel
          data={draft.data}
          busy={busy}
          onPatch={brief.patch}
          onRegenerate={brief.regenerateSection}
        />
      )}
      {draft.contentType === "image" && (
        <ImagePanel
          data={draft.data}
          busy={busy}
          onPatch={brief.patch}
          onRegenerate={brief.regenerateSection}
        />
      )}
      {draft.contentType === "carousel" && (
        <CarouselPanel
          data={draft.data}
          busy={busy}
          onPatch={brief.patch}
          onRegenerate={brief.regenerateSection}
        />
      )}

      <p className="text-xs text-muted-foreground">
        Edit manual: {brief.editCount} · Draf hanya tersimpan selama sesi
        prototipe (tanpa penyimpanan permanen).
      </p>
    </div>
  );
}
