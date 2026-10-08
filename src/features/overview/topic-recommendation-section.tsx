"use client";

import { ChartCard } from "@/components/data/chart-card";
import { cn } from "@/lib/utils";
import type { QueryUiState } from "@/hooks/use-analytics";
import type { TopicRecommendation } from "@/types/analytics";

interface TopicRecommendationSectionProps {
  status: QueryUiState;
  topics: TopicRecommendation[];
  onRetry: () => void;
}

/**
 * Topic Recommendation — pill berjajar (flex wrap) sesuai mock
 * kumparanDesk — PRODUCT MVP: peringkat · nama · skor (0–100).
 * Skor ≥85 memakai pil hijau, selain itu pil indigo.
 */
export function TopicRecommendationSection({
  status,
  topics,
  onRetry,
}: TopicRecommendationSectionProps) {
  const cardStatus =
    status === "loading" ? "pending" : status === "error" ? "error" : "success";
  const isEmpty = status === "empty" || topics.length === 0;

  return (
    <ChartCard
      title="Topic Recommendation"
      titleClassName="text-[17px] font-bold"
      description="5 topik dengan skor tertinggi (0–100) dari konten di platform & sosial media"
      status={cardStatus}
      isEmpty={isEmpty}
      onRetry={onRetry}
      emptyTitle="Belum ada rekomendasi"
      emptyMessage="Belum ada topik yang bisa direkomendasikan untuk periode ini."
      height="content"
      actions={
        <span className="text-xs text-muted-foreground">Diperbarui tiap hari</span>
      }
    >
      <ol className="flex flex-wrap gap-2">
        {topics.map((topic, index) => {
          const score = Math.max(0, Math.min(100, topic.score));
          const isHigh = score >= 85;
          return (
            <li
              key={topic.id}
              className="flex items-center gap-2 rounded-full border border-[#DCE5F7] bg-[#F7F9FE] py-1.5 pl-3 pr-1.5 text-neutral-900 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-slate-100"
            >
              <span
                className="text-[13px] font-bold tabular-nums text-primary"
                aria-label={`Peringkat ${index + 1}`}
              >
                {index + 1}
              </span>
              <span className="text-[13px] font-semibold">{topic.title}</span>
              <span
                aria-label={`Skor rekomendasi ${score} dari 100`}
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
                  isHigh
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300"
                )}
              >
                {score}
              </span>
            </li>
          );
        })}
      </ol>
    </ChartCard>
  );
}
