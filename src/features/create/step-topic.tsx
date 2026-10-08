"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, PenLine, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/data/states";
import { getIdeationService } from "@/services/ideation-service";
import { cn } from "@/lib/utils";
import type { CreateFlow } from "./use-create-flow";

interface StepTopicProps {
  flow: CreateFlow;
}

const MIN_CUSTOM_LENGTH = 4;

/** Step 1 — landing: rekomendasi topik (R6/R7) atau topik sendiri. */
export function StepTopic({ flow }: StepTopicProps) {
  const query = useQuery({
    queryKey: ["ideation-topics"],
    queryFn: () => getIdeationService().listTopicIdeas(),
  });

  const topics = query.data ?? [];
  const selectedRecommendedId =
    flow.scenario === "recommended" ? flow.topicIdea?.id : undefined;
  const customSelected = flow.scenario === "custom";
  const customReady = flow.customDraft.trim().length >= MIN_CUSTOM_LENGTH;
  const customMatches =
    customSelected &&
    flow.customDraft.trim() === flow.topicTitle.trim();

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">Rekomendasi topik</h2>
            <p className="text-xs text-muted-foreground">
              Kurasi dari performa historis, tren, dan media sosial kompetitor ·
              diperbarui tiap hari.
            </p>
          </div>
          {query.isFetching && !query.isPending && (
            <span className="text-xs text-muted-foreground">Memperbarui…</span>
          )}
        </div>

        {query.isPending ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-card p-4 shadow-xs"
              >
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-3 h-3 w-full" />
                <Skeleton className="mt-2 h-3 w-2/3" />
                <Skeleton className="mt-4 h-5 w-24" />
              </div>
            ))}
          </div>
        ) : query.isError ? (
          <ErrorState onRetry={() => void query.refetch()} className="min-h-40" />
        ) : topics.length === 0 ? (
          <EmptyState
            title="Belum ada rekomendasi"
            message="Belum ada topik yang bisa direkomendasikan. Anda tetap bisa menulis topik sendiri di bawah."
            className="min-h-40"
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {topics.map((topic) => {
              const selected = selectedRecommendedId === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() =>
                    flow.requestTopic({ scenario: "recommended", topic })
                  }
                  aria-pressed={selected}
                  className={cn(
                    "flex flex-col rounded-xl border bg-card p-4 text-left shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                    selected
                      ? "border-primary ring-1 ring-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold leading-snug">
                      {topic.title}
                    </h3>
                    {selected ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        <Check className="size-3" aria-hidden /> Terpilih
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        Skor {topic.score}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                    {topic.reason}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="inline-flex items-center gap-1 font-medium text-positive">
                      <TrendingUp className="size-3.5" aria-hidden />
                      {topic.trendSignal}
                    </span>
                    <span className="text-muted-foreground">{topic.source}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-xl border border-dashed border-border p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="inline-flex items-center gap-2 text-base font-semibold">
              <PenLine className="size-4" aria-hidden /> Topik sendiri
            </h2>
            <p className="text-xs text-muted-foreground">
              Tidak ada rekomendasi yang cocok? Tulis topik Anda — angle akan
              dibuat AI dari topik tersebut.
            </p>
          </div>
          {customMatches && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              <Check className="size-3" aria-hidden /> Terpilih
            </span>
          )}
        </div>
        <Textarea
          value={flow.customDraft}
          onChange={(event) => flow.setCustomDraft(event.target.value)}
          placeholder="Contoh: Tips aman bepergian saat musim hujan"
          rows={3}
          aria-label="Tulis topik sendiri"
          className="resize-y"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {flow.customDraft.trim().length < MIN_CUSTOM_LENGTH
              ? `Minimal ${MIN_CUSTOM_LENGTH} karakter.`
              : "Klik untuk memakai topik ini."}
          </span>
          <Button
            type="button"
            size="sm"
            variant={customMatches ? "secondary" : "default"}
            disabled={!customReady}
            onClick={flow.commitCustomTopic}
          >
            Gunakan topik ini
          </Button>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        {!flow.canAdvance && (
          <span className="text-xs text-muted-foreground">
            Pilih salah satu topik untuk melanjutkan.
          </span>
        )}
        <Button
          type="button"
          disabled={!flow.canAdvance}
          onClick={flow.advance}
        >
          Lanjut ke Angle & Format
          <ArrowRight className="ml-1 size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
