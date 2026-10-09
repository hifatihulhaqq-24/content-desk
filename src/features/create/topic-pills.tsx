"use client";

import { useQuery } from "@tanstack/react-query";
import { getIdeationService } from "@/services/ideation-service";
import { cn } from "@/lib/utils";

interface TopicPillsProps {
  /** Klik pil → mengisi kolom topik di message box. */
  onSelect: (title: string) => void;
}

/**
 * Pil topik rekomendasi di bawah message box — shortcut mengisi kolom topik.
 * Gaya pil mengikuti Topic Recommendation di Overview (peringkat · judul · skor).
 */
export function TopicPills({ onSelect }: TopicPillsProps) {
  const query = useQuery({
    queryKey: ["ideation-topics"],
    queryFn: () => getIdeationService().listTopicIdeas(),
  });

  const topics = query.data ?? [];
  if (query.isPending || query.isError || topics.length === 0) return null;

  return (
    <section className="mt-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
          Topik rekomendasi — klik untuk mengisi kolom
        </p>
        {query.isFetching && (
          <span className="text-xs text-neutral-500">Memperbarui…</span>
        )}
      </div>

      <ol className="flex flex-wrap gap-2">
        {topics.map((topic, index) => {
          const score = Math.max(0, Math.min(100, topic.score));
          const isHigh = score >= 85;
          return (
            <li key={topic.id}>
              <button
                type="button"
                onClick={() => onSelect(topic.title)}
                title={topic.reason}
                className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 py-1.5 pl-3 pr-1.5 text-neutral-900 shadow-xs backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-ring dark:border-indigo-400/25 dark:bg-neutral-900/60 dark:text-slate-100 dark:hover:bg-neutral-900/80"
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
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
