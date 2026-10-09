"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  BriefData,
  BriefSectionKey,
  ContentTypeId,
  EntryScenario,
  ReferenceContext,
} from "@/types/ideation";
import { getIdeationService } from "@/services/ideation-service";
import { getFlowEvents, trackFlowEvent } from "@/lib/flow-events";

export type BriefStatus = "idle" | "generating" | "ready" | "error";

export interface BriefInput {
  topic: string;
  scenario: EntryScenario;
  angle: { id: string; title: string } | null;
  contentType: ContentTypeId | null;
  /** Konteks lampiran (gambar & link referensi) dari message box. */
  context?: ReferenceContext;
}

export interface BriefGenerateOptions {
  section?: BriefSectionKey;
  comment?: string;
}

/**
 * State draf brief untuk seluruh flow: generate otomatis saat masuk Step 4,
 * regenerate seluruh/per-bagian dengan komentar (R13/R14), patch edit manual,
 * dan instrumen waktu generate (R31). Dipasang di CreateView agar draf
 * bertahan saat user kembali ke step sebelumnya (R2).
 */
export function useBrief(enabled: boolean, input: BriefInput) {
  const [draft, setDraft] = useState<BriefData | null>(null);
  const [status, setStatus] = useState<BriefStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [editCount, setEditCount] = useState(0);
  const [runId, setRunId] = useState(0);

  const angleId = input.angle?.id ?? null;
  const contextKey = JSON.stringify(input.context ?? null);
  const nonceRef = useRef(0);
  const keyRef = useRef<string | null>(null);
  const startRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const key = useMemo(
    () =>
      JSON.stringify({
        topic: input.topic,
        scenario: input.scenario,
        angle: angleId,
        type: input.contentType,
        context: contextKey,
      }),
    [input.topic, input.scenario, angleId, input.contentType, contextKey]
  );

  const complete =
    input.topic.trim().length > 0 &&
    input.angle !== null &&
    input.contentType !== null;

  const generate = useCallback(
    async (options?: BriefGenerateOptions) => {
      if (!input.topic || !input.angle || !input.contentType) return;
      nonceRef.current += 1;
      startRef.current = Date.now();
      setStatus("generating");
      setError(null);
      setRunId((value) => value + 1);
      trackFlowEvent(
        options?.section
          ? "brief_regenerate_section"
          : "brief_generate_start",
        { section: options?.section ?? "all" }
      );
      try {
        const result = await getIdeationService().generateBrief({
          topic: input.topic,
          scenario: input.scenario,
          angle: { id: input.angle.id, title: input.angle.title },
          contentType: input.contentType,
          section: options?.section,
          comment: options?.comment,
          nonce: nonceRef.current,
          context: input.context,
        });
        setDraft(result);
        setStatus("ready");
        trackFlowEvent("brief_ready", {
          ms: Date.now() - (startRef.current ?? Date.now()),
        });
        if (!completedRef.current) {
          completedRef.current = true;
          const first = getFlowEvents()[0];
          trackFlowEvent("flow_complete", {
            ms: first ? Date.now() - first.at : 0,
          });
        }
      } catch (err) {
        setStatus("error");
        setError(
          err instanceof Error
            ? err.message
            : "Gagal membuat draf brief. Silakan coba lagi."
        );
        trackFlowEvent("brief_error");
      }
    },
    [input.topic, input.scenario, input.angle, input.contentType, input.context]
  );

  // Generate otomatis saat input berubah dan user berada di Step 4 (R2/R13).
  useEffect(() => {
    if (!enabled || !complete) return;
    if (keyRef.current === key) return;
    keyRef.current = key;
    setDraft(null);
    setEditCount(0);
    completedRef.current = false;
    nonceRef.current = 0;
    void generate();
  }, [enabled, complete, key, generate]);

  const patch = useCallback(
    (section: BriefSectionKey, updater: (current: BriefData) => BriefData) => {
      setDraft((current) => (current ? updater(current) : current));
      setEditCount((count) => count + 1);
      trackFlowEvent("brief_edit", { section });
    },
    []
  );

  const regenerateAll = useCallback(
    (options?: BriefGenerateOptions) => void generate(options),
    [generate]
  );

  const regenerateSection = useCallback(
    (section: BriefSectionKey) => void generate({ section }),
    [generate]
  );

  const submitComment = useCallback(
    (comment: string) => void generate({ comment }),
    [generate]
  );

  return {
    status,
    draft,
    error,
    editCount,
    runId,
    generate: regenerateAll,
    regenerateSection,
    submitComment,
    patch,
  };
}

export type BriefController = ReturnType<typeof useBrief>;
