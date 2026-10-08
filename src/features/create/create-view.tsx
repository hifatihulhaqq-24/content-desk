"use client";

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
import { FlowStepper } from "./flow-stepper";
import { StepAngle } from "./step-angle";
import { StepBrief } from "./step-brief";
import { StepTopic } from "./step-topic";
import { useCreateFlow } from "./use-create-flow";
import { useBrief } from "@/hooks/use-brief";

export function CreateView() {
  const flow = useCreateFlow();
  const pending = flow.pendingChange;
  const brief = useBrief(flow.step === 3, {
    topic: flow.topicTitle,
    scenario: flow.scenario ?? "recommended",
    angle: flow.angle,
    contentType: flow.contentType,
  });

  return (
    <PageContainer>
      <PageHeader
        title="Buat Konten"
        description="Alur 3 langkah: Insight & Topik → Angle & Format → Draf Brief · data ilustrasi, pilihan tersimpan selama sesi."
        actions={
          <Button type="button" variant="ghost" size="sm" onClick={flow.restart}>
            <RotateCcw className="size-4" aria-hidden />
            Mulai ulang
          </Button>
        }
      />

      <FlowStepper
        step={flow.step}
        furthest={flow.furthest}
        onSelect={flow.goToStep}
      />

      {flow.step === 1 && <StepTopic flow={flow} />}
      {flow.step === 2 && <StepAngle flow={flow} />}
      {flow.step === 3 && <StepBrief flow={flow} brief={brief} />}

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
                ? "Mengubah topik akan mengatur ulang angle, tipe konten, dan draf brief yang sudah dibuat."
                : "Mengubah angle atau tipe konten akan membuat ulang draf brief."}
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
