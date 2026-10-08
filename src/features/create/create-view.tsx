"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getIdeationService } from "@/services/ideation-service";
import { FlowStepper, FLOW_STEPS } from "./flow-stepper";
import { SelectionSummary } from "./selection-summary";
import { StepAngle } from "./step-angle";
import { StepAsset } from "./step-asset";
import { StepBrief } from "./step-brief";
import { StepTopic } from "./step-topic";
import { useCreateFlow, type CreateFlow, type FlowStep } from "./use-create-flow";
import { useBrief } from "@/hooks/use-brief";

/** Judul & deskripsi tiap langkah — tampil di kepala kolom kanan. */
const STEP_META: Record<FlowStep, { title: string; description: string }> = {
  1: {
    title: "Pilih insight yang mau diangkat",
    description:
      "Mulai dari rekomendasi topik yang sedang tren, atau tulis topik sendiri di bawahnya.",
  },
  2: {
    title: "Tentukan angle & format",
    description:
      "Setiap angle mengunci satu format konten — pilih sudut pandang yang paling pas dengan topikmu.",
  },
  3: {
    title: "Lengkapi materi pendukung",
    description:
      "Unggah materi sendiri atau pilih aset internal — pilih minimal satu supaya bisa lanjut ke draf.",
  },
  4: {
    title: "Tinjau draf brief",
    description:
      "Periksa hasilnya, lalu bagikan ke tim untuk direview sebelum diproduksi.",
  },
};

/** Body view flow — dipakai baik dari fresh flow maupun hasil pre-select. */
function CreateFlowView({ flow }: { flow: CreateFlow }) {
  const pending = flow.pendingChange;
  const brief = useBrief(flow.step === 4, {
    topic: flow.topicTitle,
    scenario: flow.scenario ?? "recommended",
    angle: flow.angle,
    contentType: flow.contentType,
  });

  const meta = STEP_META[flow.step];
  const stepLabel = FLOW_STEPS.find((item) => item.n === flow.step)?.label;

  const summaryProps = {
    scenario: flow.scenario,
    topicTitle: flow.topicTitle,
    angleTitle: flow.angle?.title ?? null,
    contentType: flow.contentType,
    assetSummary: flow.assetSummary,
  };

  return (
    <PageContainer>
      <PageHeader
        title="Buat Konten"
        description="Alur 4 langkah: Insight & Topik → Angle & Format → Kesiapan Aset → Draf Brief · data ilustrasi, pilihan tersimpan selama sesi."
        actions={
          <Button type="button" variant="ghost" size="sm" onClick={flow.restart}>
            <RotateCcw className="size-4" aria-hidden />
            Mulai ulang
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden space-y-4 lg:sticky lg:top-20 lg:block lg:self-start">
          <FlowStepper
            step={flow.step}
            furthest={flow.furthest}
            onSelect={flow.goToStep}
            orientation="vertical"
          />
          <SelectionSummary variant="rail" {...summaryProps} />
        </aside>

        <div className="min-w-0 space-y-6">
          <div className="space-y-4 lg:hidden">
            <FlowStepper
              step={flow.step}
              furthest={flow.furthest}
              onSelect={flow.goToStep}
            />
            <SelectionSummary variant="chip" {...summaryProps} />
          </div>

          <header className="space-y-2">
            <span className="inline-flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                Langkah {flow.step} dari 4
              </span>
              {stepLabel}
            </span>
            <h2 className="text-xl font-semibold tracking-tight">
              {meta.title}
            </h2>
            <p className="text-sm text-muted-foreground">{meta.description}</p>
          </header>

          {flow.step === 1 && <StepTopic flow={flow} />}
          {flow.step === 2 && <StepAngle flow={flow} />}
          {flow.step === 3 && <StepAsset flow={flow} />}
          {flow.step === 4 && <StepBrief flow={flow} brief={brief} />}
        </div>
      </div>

      <Dialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) flow.cancelPending();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pending?.kind === "topic" ? "Ganti topik?" : "Ubah pilihan?"}
            </DialogTitle>
            <DialogDescription>
              {pending?.kind === "topic"
                ? "Mengubah topik akan mengatur ulang angle, aset, dan draf brief yang sudah dibuat."
                : "Mengubah angle akan mengatur ulang pilihan aset dan membuat ulang draf brief."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={flow.cancelPending}>
              Batal
            </Button>
            <Button type="button" onClick={flow.confirmPending}>
              Lanjutkan perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

/**
 * Entry view halaman /create.
 * Membaca query param pre-select dari dashboard Workspace:
 * - /create?topic=<topicId> → topik rekomendasi, langsung ke langkah 2
 * - /create?title=<judul>   → topik custom, langsung ke langkah 2
 * Setelah diterapkan, URL dibersihkan (replace) agar tidak diterapkan ulang.
 * Karena memakai useSearchParams, komponen ini wajib dibungkus <Suspense>.
 */
export function CreateView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const flow = useCreateFlow();

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
      router.replace("/create");
      return;
    }
    if (titleParam) {
      applied.current = true;
      flow.startFromTitle(titleParam);
      router.replace("/create");
    }
  }, [topicId, titleParam, topicsQuery, flow, router]);

  return <CreateFlowView flow={flow} />;
}
