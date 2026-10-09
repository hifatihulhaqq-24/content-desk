"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { contentTypeLabel } from "@/config/content-types";
import { useCreateFlowContext } from "./create-flow-context";
import { StepBrief } from "./step-brief";

/**
 * Halaman /create/brief — tampilan terpisah untuk draf brief, dibuka setelah
 * angle dipilih. Guard: tanpa angle, kembali ke halaman angle.
 */
export function BriefView() {
  const router = useRouter();
  const { flow, brief } = useCreateFlowContext();

  const ready = flow.topicTitle.length > 0 && flow.angle !== null;

  useEffect(() => {
    if (!ready) router.replace("/create/angle");
  }, [ready, router]);

  if (!ready) return null;

  return (
    <PageContainer>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Draf brief siap diedit
          </h1>
          <p className="text-sm text-muted-foreground">
            {flow.topicTitle}
            {flow.angle ? ` · angle “${flow.angle.title}”` : ""}
            {flow.angle ? ` · ${contentTypeLabel(flow.angle.contentType)}` : ""}
            {flow.contextSummary.length
              ? ` · ${flow.contextSummary.join(" & ")}`
              : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={flow.goToAngles}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Kembali ke angle
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={flow.restart}
          >
            <RotateCcw className="size-4" aria-hidden />
            Mulai ulang
          </Button>
        </div>
      </div>

      <StepBrief flow={flow} brief={brief} />
    </PageContainer>
  );
}
