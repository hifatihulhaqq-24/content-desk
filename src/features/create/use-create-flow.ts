"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AngleOption,
  EntryScenario,
  TopicIdea,
  UploadedMediaItem,
} from "@/types/ideation";
import { trackFlowEvent } from "@/lib/flow-events";
import { toast } from "sonner";

export type FlowStep = 1 | 2 | 3 | 4;

export type TopicSelection =
  | { scenario: "recommended"; topic: TopicIdea }
  | { scenario: "custom"; title: string };

/** Peringatan R2: mengubah pilihan awal mereset hasil step berikutnya. */
export type PendingChange =
  | { kind: "topic"; next: TopicSelection }
  | { kind: "selection"; next: { angle?: AngleOption } };

/** Sumber aset di Step 3 (R8): upload sendiri atau DAM internal. */
export type AssetMode = "upload" | "directory" | null;

const MIN_CUSTOM_LENGTH = 4;
/** Batas ukuran file unggahan (mock, R8). */
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/", "video/", "application/pdf"];

function sameTopic(current: TopicSelection | null, next: TopicSelection): boolean {
  if (!current || current.scenario !== next.scenario) return false;
  if (current.scenario === "recommended" && next.scenario === "recommended") {
    return current.topic.id === next.topic.id;
  }
  if (current.scenario === "custom" && next.scenario === "custom") {
    return (
      current.title.trim().toLowerCase() === next.title.trim().toLowerCase()
    );
  }
  return false;
}

function assetTypeOf(file: File): UploadedMediaItem["type"] | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf") ||
    file.name.toLowerCase().endsWith(".doc") ||
    file.name.toLowerCase().endsWith(".docx")
  ) {
    return "document";
  }
  return null;
}

function isAcceptedFile(file: File): boolean {
  if (assetTypeOf(file) === null) return false;
  return ACCEPTED_TYPES.some((prefix) => file.type.startsWith(prefix)) ||
    file.name.toLowerCase().endsWith(".pdf") ||
    file.name.toLowerCase().endsWith(".doc") ||
    file.name.toLowerCase().endsWith(".docx");
}

export function useCreateFlow() {
  const [step, setStep] = useState<FlowStep>(1);
  const [furthest, setFurthest] = useState<FlowStep>(1);
  const [scenario, setScenario] = useState<EntryScenario | null>(null);
  const [topicIdea, setTopicIdea] = useState<TopicIdea | null>(null);
  const [customTopic, setCustomTopic] = useState("");
  const [customDraft, setCustomDraft] = useState("");
  const [angle, setAngle] = useState<AngleOption | null>(null);
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);
  // Step 3 — kesiapan aset (R8).
  const [assetMode, setAssetModeState] = useState<AssetMode>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedMediaItem[]>([]);
  const [selectedInternalAssetIds, setSelectedInternalAssetIds] = useState<
    string[]
  >([]);

  const stepViewAt = useRef<number | null>(null);

  useEffect(() => {
    trackFlowEvent("flow_start");
  }, []);

  useEffect(() => {
    stepViewAt.current = Date.now();
    trackFlowEvent("step_view", { step });
  }, [step]);

  const currentSelection: TopicSelection | null = useMemo(() => {
    if (scenario === "recommended" && topicIdea) {
      return { scenario: "recommended", topic: topicIdea };
    }
    if (scenario === "custom" && customTopic) {
      return { scenario: "custom", title: customTopic };
    }
    return null;
  }, [scenario, topicIdea, customTopic]);

  const topicTitle =
    scenario === "custom"
      ? customTopic.trim()
      : scenario === "recommended"
        ? topicIdea?.title ?? ""
        : "";

  /** Format konten diturunkan dari angle terpilih — bukan pilihan terpisah. */
  const contentType = angle?.contentType ?? null;

  /** Ringkasan aset terpilih untuk SelectionSummary (Step 3–4). */
  const assetSummary = useMemo(() => {
    if (assetMode === "upload") {
      return uploadedFiles.length > 0
        ? `${uploadedFiles.length} file diunggah`
        : null;
    }
    if (assetMode === "directory") {
      return selectedInternalAssetIds.length > 0
        ? `${selectedInternalAssetIds.length} aset DAM`
        : null;
    }
    return null;
  }, [assetMode, uploadedFiles.length, selectedInternalAssetIds.length]);

  const resetAssets = useCallback(() => {
    setAssetModeState(null);
    setUploadedFiles([]);
    setSelectedInternalAssetIds([]);
  }, []);

  const hasDownstream =
    angle !== null || assetMode !== null || uploadedFiles.length > 0;
  const briefVisited = furthest >= 4;

  const applyTopic = useCallback(
    (next: TopicSelection) => {
      const changed = !sameTopic(currentSelection, next);
      setScenario(next.scenario);
      if (next.scenario === "recommended") {
        setTopicIdea(next.topic);
      } else {
        setTopicIdea(null);
        setCustomTopic(next.title.trim());
        setCustomDraft(next.title.trim());
      }
      if (changed) {
        setAngle(null);
        resetAssets();
        setStep(1);
        setFurthest(1);
        trackFlowEvent("topic_change", { scenario: next.scenario });
      }
    },
    [currentSelection, resetAssets]
  );

  const requestTopic = useCallback(
    (next: TopicSelection) => {
      if (sameTopic(currentSelection, next)) return;
      if (hasDownstream || briefVisited) {
        setPendingChange({ kind: "topic", next });
        return;
      }
      applyTopic(next);
    },
    [applyTopic, currentSelection, hasDownstream, briefVisited]
  );

  const applySelection = useCallback(
    (next: { angle?: AngleOption }) => {
      if (!next.angle || next.angle.id === angle?.id) return;
      setAngle(next.angle);
      trackFlowEvent("angle_select", { angle: next.angle.id });
      trackFlowEvent("content_type_select", { type: next.angle.contentType });
      // Angle baru mengunci format baru → aset yang dipilih jadi tidak relevan.
      resetAssets();
      if (furthest > 2) setFurthest(2);
    },
    [angle, furthest, resetAssets]
  );

  const requestSelection = useCallback(
    (next: { angle?: AngleOption }) => {
      const willResetBrief =
        briefVisited && next.angle && next.angle.id !== angle?.id;
      if (willResetBrief) {
        setPendingChange({ kind: "selection", next });
        return;
      }
      applySelection(next);
    },
    [angle, applySelection, briefVisited]
  );

  const confirmPending = useCallback(() => {
    if (!pendingChange) return;
    if (pendingChange.kind === "topic") applyTopic(pendingChange.next);
    else applySelection(pendingChange.next);
    setPendingChange(null);
  }, [applyTopic, applySelection, pendingChange]);

  const cancelPending = useCallback(() => setPendingChange(null), []);

  const commitCustomTopic = useCallback(() => {
    const title = customDraft.trim();
    if (title.length < MIN_CUSTOM_LENGTH) return;
    requestTopic({ scenario: "custom", title });
  }, [customDraft, requestTopic]);

  /* ---------- Aset (Step 3) ---------- */

  const setAssetMode = useCallback(
    (mode: Exclude<AssetMode, null>) => {
      setAssetModeState((current) => {
        if (current === mode) return current;
        trackFlowEvent("asset_mode_select", { mode });
        return mode;
      });
      // Ganti skenario aset → bersihkan pilihan dari skenario sebelumnya.
      setUploadedFiles([]);
      setSelectedInternalAssetIds([]);
    },
    []
  );

  const addUploadedFiles = useCallback((files: File[]) => {
    const accepted: UploadedMediaItem[] = [];
    let rejected = 0;
    for (const file of files) {
      if (!isAcceptedFile(file) || file.size > MAX_FILE_SIZE) {
        rejected += 1;
        continue;
      }
      accepted.push({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        size: file.size,
        type: assetTypeOf(file) ?? "document",
        previewUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      });
    }
    if (rejected > 0) {
      toast.error(
        `${rejected} file dilewati — hanya gambar/video/dokumen (maks 50 MB).`
      );
    }
    if (accepted.length > 0) {
      setUploadedFiles((current) => [...current, ...accepted]);
      trackFlowEvent("asset_upload", { count: accepted.length });
    }
  }, []);

  const removeUploadedFile = useCallback((id: string) => {
    setUploadedFiles((current) => {
      const target = current.find((file) => file.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return current.filter((file) => file.id !== id);
    });
  }, []);

  const toggleInternalAsset = useCallback((id: string) => {
    setSelectedInternalAssetIds((current) => {
      const next = current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id];
      trackFlowEvent("asset_select", { count: next.length });
      return next;
    });
  }, []);

  /* ---------- Navigasi ---------- */

  const canAdvance =
    step === 1
      ? topicTitle.trim().length > 0
      : step === 2
        ? angle !== null
        : step === 3
          ? assetMode !== null &&
            (assetMode === "upload"
              ? uploadedFiles.length > 0
              : selectedInternalAssetIds.length > 0)
          : true;

  const advance = useCallback(() => {
    if (!canAdvance || step >= 4) return;
    trackFlowEvent("step_done", {
      step,
      ms: Date.now() - (stepViewAt.current ?? Date.now()),
    });
    const next = (step + 1) as FlowStep;
    setStep(next);
    setFurthest((value) => (value < next ? next : value));
  }, [canAdvance, step]);

  const goToStep = useCallback(
    (target: FlowStep) => {
      if (target === step || target > furthest) return;
      trackFlowEvent("step_navigate", { from: step, to: target });
      setStep(target);
    },
    [furthest, step]
  );

  const restart = useCallback(() => {
    trackFlowEvent("flow_restart");
    setStep(1);
    setFurthest(1);
    setScenario(null);
    setTopicIdea(null);
    setCustomTopic("");
    setCustomDraft("");
    setAngle(null);
    resetAssets();
    setPendingChange(null);
  }, [resetAssets]);

  /** Pre-select topik dari dashboard Workspace (/create?topic=<id>). */
  const startFromTopic = useCallback(
    (topic: TopicIdea) => {
      setScenario("recommended");
      setTopicIdea(topic);
      setCustomTopic("");
      setCustomDraft("");
      setAngle(null);
      resetAssets();
      setPendingChange(null);
      setStep(2);
      setFurthest(2);
      trackFlowEvent("topic_change", { scenario: "recommended" });
    },
    [resetAssets]
  );

  /** Pre-fill topik custom dari daftar proyek (/create?title=<judul>). */
  const startFromTitle = useCallback(
    (title: string) => {
      const trimmed = title.trim();
      if (trimmed.length < MIN_CUSTOM_LENGTH) return;
      setScenario("custom");
      setTopicIdea(null);
      setCustomTopic(trimmed);
      setCustomDraft(trimmed);
      setAngle(null);
      resetAssets();
      setPendingChange(null);
      setStep(2);
      setFurthest(2);
      trackFlowEvent("topic_change", { scenario: "custom" });
    },
    [resetAssets]
  );

  return {
    step,
    furthest,
    scenario,
    topicIdea,
    topicTitle,
    customDraft,
    setCustomDraft,
    angle,
    contentType,
    assetSummary,
    pendingChange,
    assetMode,
    uploadedFiles,
    selectedInternalAssetIds,
    hasDownstream,
    canAdvance,
    requestTopic,
    requestSelection,
    confirmPending,
    cancelPending,
    commitCustomTopic,
    setAssetMode,
    addUploadedFiles,
    removeUploadedFile,
    toggleInternalAsset,
    advance,
    goToStep,
    restart,
    startFromTopic,
    startFromTitle,
  };
}

export type CreateFlow = ReturnType<typeof useCreateFlow>;
