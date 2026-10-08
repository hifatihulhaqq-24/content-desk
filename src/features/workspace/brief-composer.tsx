"use client";

import { useState } from "react";
import { ArrowRight, ChevronRight, PenLine, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { BriefProject } from "@/types/brief-project";
import type { BriefStats } from "./brief-hero";

const MIN_TITLE_LENGTH = 4;

interface QuickRow {
  key: string;
  title: string;
  hint: string;
  icon: typeof TrendingUp;
  disabled?: boolean;
  onClick: () => void;
}

interface BriefComposerProps {
  stats: BriefStats;
  /** Draf terakhir (status draft) untuk baris lanjutkan; null bila belum ada. */
  draftProject: BriefProject | null;
  /** Buat brief dari teks di kolom cepat. */
  onCreateWith: (title: string) => void;
  /** Buat brief tanpa topik awal. */
  onStartBlank: () => void;
  onSeeTopics: () => void;
}

/** Rail kiri landing — kolom cepat + jalan pintas + ringkasan data. */
export function BriefComposer({
  stats,
  draftProject,
  onCreateWith,
  onStartBlank,
  onSeeTopics,
}: BriefComposerProps) {
  const [draft, setDraft] = useState("");
  const ready = draft.trim().length >= MIN_TITLE_LENGTH;

  const rows: QuickRow[] = [
    {
      key: "topics",
      title: "Pakai rekomendasi topik",
      hint: "Kurasi harian dari tren & data performa",
      icon: TrendingUp,
      onClick: onSeeTopics,
    },
    {
      key: "draft",
      title: "Lanjutkan draf terakhir",
      hint: draftProject?.topicTitle ?? "Belum ada draf berstatus Draf",
      icon: PenLine,
      disabled: !draftProject,
      onClick: () => {
        if (!draftProject) return;
        onCreateWith(draftProject.topicTitle);
      },
    },
    {
      key: "blank",
      title: "Buat dari nol",
      hint: "Mulai kosong, tentukan topik di langkah pertama",
      icon: Plus,
      onClick: onStartBlank,
    },
  ];

  const summaryRows = [
    { key: "total", label: "Total brief", value: stats.total },
    { key: "draft", label: "Draf", value: stats.draft },
    { key: "review", label: "Review", value: stats.review },
    { key: "published", label: "Terbit", value: stats.published },
  ] as const;

  return (
    <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
      <section className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <h2 className="text-sm font-semibold">Mulai cepat</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Tulis topik singkat — langkah berikutnya menyusun angle dan formatnya.
        </p>

        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Contoh: Tips aman bepergian saat musim hujan"
          rows={3}
          aria-label="Tulis topik singkat"
          className="mt-3 resize-y"
        />

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {ready
              ? "Siap dilanjutkan ke Buat Konten."
              : `Minimal ${MIN_TITLE_LENGTH} karakter.`}
          </span>
          <Button
            type="button"
            size="sm"
            disabled={!ready}
            onClick={() => onCreateWith(draft)}
          >
            Buat brief
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </section>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span aria-hidden className="h-px flex-1 bg-border" />
        atau
        <span aria-hidden className="h-px flex-1 bg-border" />
      </div>

      <nav aria-label="Jalan pintas" className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <button
              key={row.key}
              type="button"
              disabled={row.disabled}
              onClick={row.onClick}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                "focus-visible:outline-2 focus-visible:outline-ring",
                row.disabled
                  ? "cursor-not-allowed opacity-60"
                  : "hover:bg-muted/60"
              )}
            >
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{row.title}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {row.hint}
                </span>
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
            </button>
          );
        })}
      </nav>

      <section className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Ringkasan workspace
        </h2>
        <dl className="mt-3 space-y-2">
          {summaryRows.map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="font-semibold tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
