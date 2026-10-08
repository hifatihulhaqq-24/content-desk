"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, PenLine, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, ErrorState } from "@/components/data/states";
import { TopicCard, TopicCardSkeleton } from "@/components/data/topic-card";
import { getIdeationService } from "@/services/ideation-service";
import { cn } from "@/lib/utils";
import type { CreateFlow } from "./use-create-flow";

interface StepTopicProps {
  flow: CreateFlow;
}

const MIN_CUSTOM_LENGTH = 4;

/** Label chips — sumber dipendekkan biar muat di satu baris. */
const SOURCE_LABEL: Record<string, string> = {
  "Media sosial kompetitor": "Kompetitor",
  "Pencarian internal": "Pencarian",
  "Tren kanal (mock)": "Tren kanal",
  "Monitor berita masuk": "Berita",
  "Data performa historis": "Performa",
};

/** Step 1 — landing: rekomendasi topik (R6/R7) atau topik sendiri. */
export function StepTopic({ flow }: StepTopicProps) {
  const [search, setSearch] = useState("");
  const [source, setSource] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["ideation-topics"],
    queryFn: () => getIdeationService().listTopicIdeas(),
  });

  const topics = useMemo(() => query.data ?? [], [query.data]);
  const selectedRecommendedId =
    flow.scenario === "recommended" ? flow.topicIdea?.id : undefined;
  const customSelected = flow.scenario === "custom";
  const customReady = flow.customDraft.trim().length >= MIN_CUSTOM_LENGTH;
  const customMatches =
    customSelected && flow.customDraft.trim() === flow.topicTitle.trim();

  const sources = useMemo(() => {
    const seen = new Set<string>();
    for (const topic of topics) seen.add(topic.source);
    return Array.from(seen);
  }, [topics]);

  const visibleTopics = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return topics.filter((topic) => {
      if (source && topic.source !== source) return false;
      if (!needle) return true;
      return (
        topic.title.toLowerCase().includes(needle) ||
        topic.reason.toLowerCase().includes(needle)
      );
    });
  }, [topics, source, search]);

  return (    <div className="space-y-6">
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

        {!query.isPending && !query.isError && topics.length > 0 && (
          <div className="space-y-2">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari topik… misalnya “hujan” atau “perjalanan”"
                aria-label="Cari rekomendasi topik"
                className="pl-9"
              />
            </div>

            <div
              role="group"
              aria-label="Filter sumber rekomendasi"
              className="flex flex-wrap items-center gap-1.5"
            >
              <button
                type="button"
                aria-pressed={source === null}
                onClick={() => setSource(null)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                  source === null
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/60"
                )}
              >
                Semua
              </button>
              {sources.map((item) => {
                const active = source === item;
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={active}
                    title={item}
                    onClick={() => setSource(active ? null : item)}
                    className={cn(
                      "max-w-40 truncate rounded-full border px-2.5 py-1 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-muted/60"
                    )}
                  >
                    {SOURCE_LABEL[item] ?? item}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {query.isPending ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <TopicCardSkeleton key={index} />
            ))}
          </div>
        ) : query.isError ? (
          <ErrorState onRetry={() => void query.refetch()} className="min-h-40" />
        ) : topics.length === 0 ? (
          <EmptyState
            title="Belum ada rekomendasi"
            message="Belum ada topik yang bisa direkomendasikan. Kamu tetap bisa menulis topik sendiri di bawah."
            className="min-h-40"
          />
        ) : visibleTopics.length === 0 ? (
          <EmptyState
            title="Tidak ada topik yang cocok"
            message="Coba kata kunci lain atau tampilkan semua sumber."
            className="min-h-40"
            action={
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setSource(null);
                }}
              >
                Tampilkan semua
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleTopics.map((topic, index) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                index={index}
                selected={selectedRecommendedId === topic.id}
                actionLabel="Pakai topik ini"
                onSelect={() =>
                  flow.requestTopic({ scenario: "recommended", topic })
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--chart-content)_13%,transparent)] text-[var(--chart-content)] dark:text-chart-1"
            >
              <PenLine className="size-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold">Topik sendiri</h2>
              <p className="text-xs text-muted-foreground">
                Sudah ada ide? Tulis di sini — angle & format disusun di langkah
                berikutnya.
              </p>
            </div>
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
          className="mt-3 resize-y"
        />

        <div className="mt-2 flex items-center justify-between gap-3">
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
