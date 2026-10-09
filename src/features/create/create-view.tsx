"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getIdeationService } from "@/services/ideation-service";
import { ComposeBox } from "./compose-box";
import { TopicPills } from "./topic-pills";
import { useCreateFlowContext } from "./create-flow-context";

/**
 * Entry view halaman /create — hero ala Lovable: message box (topik +
 * gambar + link referensi) dan pil topik rekomendasi. Submit → halaman
 * /create/angle.
 *
 * Membaca query param pre-select dari dashboard Workspace:
 * - /create?topic=<topicId> → topik rekomendasi, langsung ke halaman angle
 * - /create?title=<judul>   → topik custom, langsung ke halaman angle
 * Setelah diterapkan, URL dibersihkan (replace) agar tidak diterapkan ulang.
 * Karena memakai useSearchParams, komponen ini wajib dibungkus <Suspense>.
 */
export function CreateView() {
  const searchParams = useSearchParams();
  const { flow } = useCreateFlowContext();

  const topicId = searchParams.get("topic");
  const titleParam = searchParams.get("title");
  const applied = useRef(false);

  const topicsQuery = useQuery({
    queryKey: ["ideation-topics"],
    queryFn: () => getIdeationService().listTopicIdeas(),
    enabled: topicId !== null,
  });

  useEffect(() => {
    if (applied.current) return;
    if (topicId) {
      if (topicsQuery.isPending) return;
      applied.current = true;
      const match = (topicsQuery.data ?? []).find(
        (topic) => topic.id === topicId
      );
      if (match) flow.startFromTopic(match);
      return;
    }
    if (titleParam) {
      applied.current = true;
      flow.startFromTitle(titleParam);
    }
  }, [topicId, titleParam, topicsQuery, flow]);

  return (
    <section className="create-hero-bg relative isolate flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden">
      <div className="m-auto w-full max-w-3xl px-4 py-12 md:py-16">
        <header className="space-y-3 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-5xl">
            Bangun konten dengan ContentDesk
          </h1>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 md:text-base">
            Tulis topik, lampirkan gambar &amp; link referensi, lalu pilih angle
            terbaik.
          </p>
        </header>

        <div className="mt-8">
          <ComposeBox flow={flow} />
          <TopicPills onSelect={flow.setCustomDraft} />
        </div>
      </div>
    </section>
  );
}
