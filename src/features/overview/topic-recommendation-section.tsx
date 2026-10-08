"use client";

import { useMemo, useState } from "react";
import { ChartCard } from "@/components/data/chart-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { QueryUiState } from "@/hooks/use-analytics";
import { formatCompact, formatNumber } from "@/lib/format";
import type { TopicRecommendation } from "@/types/analytics";

interface TopicRecommendationSectionProps {
  status: QueryUiState;
  topics: TopicRecommendation[];
  onRetry: () => void;
}

const SLIDE_SIZE = 3;
const BUTTON_PALETTE =
  "bg-[#EEF2FF] text-[#4F46E5] hover:bg-[#E0E7FF] dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25";

export function TopicRecommendationSection({
  status,
  topics,
  onRetry,
}: TopicRecommendationSectionProps) {
  const cardStatus =
    status === "loading" ? "pending" : status === "error" ? "error" : "success";
  const isEmpty = status === "empty" || topics.length === 0;

  const slides = useMemo(() => {
    const groups: TopicRecommendation[][] = [];
    for (let i = 0; i < topics.length; i += SLIDE_SIZE) {
      groups.push(topics.slice(i, i + SLIDE_SIZE));
    }
    return groups;
  }, [topics]);

  const totalSlides = slides.length;
  const [slide, setSlide] = useState(0);
  const activeSlide = Math.min(slide, Math.max(0, totalSlides - 1));
  const canNav = cardStatus === "success" && !isEmpty && totalSlides > 1;

  return (
    <ChartCard
      title="Topic Recommendation"
      titleClassName="text-lg font-semibold"
      description="5 topik dengan skor tertinggi dari konten di platform & sosial media · diperbarui tiap hari."
      status={cardStatus}
      isEmpty={isEmpty}
      onRetry={onRetry}
      emptyTitle="Belum ada rekomendasi"
      emptyMessage="Belum ada topik yang bisa direkomendasikan untuk periode ini."
      height="content"
      actions={
        canNav && (
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Topik sebelumnya"
              className={BUTTON_PALETTE}
              disabled={activeSlide <= 0}
              onClick={() => setSlide((value) => Math.max(0, value - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Topik selanjutnya"
              className={BUTTON_PALETTE}
              disabled={activeSlide >= totalSlides - 1}
              onClick={() =>
                setSlide((value) => Math.min(totalSlides - 1, value + 1))
              }
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )
      }
    >
      <div className="flex flex-1 flex-col overflow-hidden">
        <div
          className="flex"
          style={{
            transform: `translateX(-${activeSlide * 100}%)`,
            transition: "transform 300ms ease",
          }}
        >
          {slides.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className="w-full shrink-0"
              aria-hidden={groupIndex !== activeSlide}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {group.map((topic, index) => {
                  const rank = groupIndex * SLIDE_SIZE + index + 1;
                  const score = Math.max(0, Math.min(100, topic.score));
                  const isHigh = score >= 85;
                  return (
                    <div
                      key={topic.id}
                      className="flex items-start gap-3 rounded-lg border border-[#C7D2FE] bg-[#F5F7FF] p-3 text-neutral-900 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-slate-100"
                    >
                      <span
                        className="text-2xl font-bold leading-none text-primary tabular-nums"
                        aria-label={`Peringkat ${rank}`}
                      >
                        {rank}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug">
                            {topic.title}
                          </p>
                          <Badge
                            aria-label={`Skor rekomendasi ${topic.score} dari 100`}
                            className={
                              isHigh
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
                            }
                          >
                            Skor {topic.score}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatNumber(topic.contentCount)} konten ·{" "}
                          {formatCompact(topic.views)} tayangan
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
