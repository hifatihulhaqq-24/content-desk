"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  AngleOption,
  EntryScenario,
  ReferenceContext,
  TopicIdea,
  UploadedMediaItem,
} from "@/types/ideation";
import { trackFlowEvent } from "@/lib/flow-events";
import { normalizeLink } from "./link-utils";
import { toast } from "sonner";

/**
 * State flow lintas halaman `/create` → `/create/angle` → `/create/brief`.
 * Hook ini dijalankan sekali di CreateFlowProvider (layout segment /create)
 * agar topik, lampiran, angle, dan draft brief tetap hidup saat pindah rute.
 *
 * Langkah aset terpisah dihapus — materi dilampirkan lewat message box
 * (compose) maupun panel aset di halaman angle.
 */
export type TopicSelection =
  | { scenario: "recommended"; topic: TopicIdea }
  | { scenario: "custom"; title: string };

const MIN_CUSTOM_LENGTH = 4;
/** Batas ukuran file unggahan (mock). */
const MAX_FILE_SIZE = 50 * 1024 * 1024;

function sameTopic(
  current: TopicSelection | null,
  next: TopicSelection
): boolean {
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

function titleOf(selection: TopicSelection | null): string {
  if (!selection) return "";
  return selection.scenario === "recommended"
    ? selection.topic.title
    : selection.title;
}

function newUploadId(): string {
  return `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useCreateFlow() {
  const router = useRouter();
  const [selection, setSelection] = useState<TopicSelection | null>(null);
  const [customDraft, setCustomDraft] = useState("");
  const [angle, setAngle] = useState<AngleOption | null>(null);
  // Lampiran: gambar & link referensi (compose + halaman angle).
  const [images, setImages] = useState<UploadedMediaItem[]>([]);
  const [links, setLinks] = useState<string[]>([]);

  useEffect(() => {
    trackFlowEvent("flow_start");
  }, []);

  const submitted = selection !== null;
  const topicTitle = titleOf(selection);
  const scenario: EntryScenario | null = selection?.scenario ?? null;

  /** Format konten diturunkan dari angle terpilih. */
  const contentType = angle?.contentType ?? null;

  const draftTitle = customDraft.trim();
  const canSubmit = draftTitle.length >= MIN_CUSTOM_LENGTH;
  /** Judul di draft sama dengan yang sudah dikirim. */
  const draftMatchesSelection =
    submitted &&
    draftTitle.toLowerCase() === topicTitle.trim().toLowerCase();

  const referenceContext = useMemo<ReferenceContext>(
    () => ({ imageCount: images.length, links }),
    [images.length, links]
  );

  const contextSummary = useMemo(() => {
    const parts: string[] = [];
    if (images.length > 0) {
      parts.push(`${images.length} gambar`);
    }
    if (links.length > 0) {
      parts.push(`${links.length} link referensi`);
    }
    return parts;
  }, [images.length, links.length]);

  /* ---------- Submit topik → halaman angle ---------- */

  const submit = useCallback(() => {
    const title = customDraft.trim();
    if (title.length < MIN_CUSTOM_LENGTH) {
      toast.error(`Topik minimal ${MIN_CUSTOM_LENGTH} karakter.`);
      return;
    }
    const sameAsCurrent =
      selection !== null &&
      titleOf(selection).trim().toLowerCase() === title.toLowerCase();
    if (!sameAsCurrent) {
      const next: TopicSelection = { scenario: "custom", title };
      const changed = !sameTopic(selection, next);
      setSelection(next);
      if (changed) {
        setAngle(null);
        trackFlowEvent("topic_change", { scenario: "custom" });
      }
    }
    trackFlowEvent("topic_submit", {
      images: images.length,
      links: links.length,
    });
    router.push("/create/angle");
  }, [customDraft, selection, images.length, links.length, router]);

  /* ---------- Lampiran: gambar ---------- */

  const addImages = useCallback((files: File[]) => {
    const accepted: UploadedMediaItem[] = [];
    let rejected = 0;
    for (const file of files) {
      if (!file.type.startsWith("image/") || file.size > MAX_FILE_SIZE) {
        rejected += 1;
        continue;
      }
      accepted.push({
        id: newUploadId(),
        name: file.name,
        size: file.size,
        type: "image",
        previewUrl: URL.createObjectURL(file),
      });
    }
    if (rejected > 0) {
      toast.error(
        `${rejected} file dilewati — hanya gambar yang didukung (maks 50 MB).`
      );
    }
    if (accepted.length > 0) {
      setImages((current) => [...current, ...accepted]);
      trackFlowEvent("asset_upload", { count: accepted.length });
    }
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((current) => {
      const target = current.find((file) => file.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return current.filter((file) => file.id !== id);
    });
  }, []);

  /* ---------- Lampiran: link referensi ---------- */

  const addLink = useCallback((raw: string) => {
    const url = normalizeLink(raw);
    if (!url) {
      toast.error("Link tidak valid — contoh: https://example.com/artikel");
      return;
    }
    setLinks((current) =>
      current.includes(url) ? current : [...current, url]
    );
    trackFlowEvent("link_add");
  }, []);

  const removeLink = useCallback((url: string) => {
    setLinks((current) => current.filter((value) => value !== url));
  }, []);

  /* ---------- Navigasi antar halaman ---------- */

  const selectAngle = useCallback((next: AngleOption) => {
    setAngle(next);
    trackFlowEvent("angle_select", { angle: next.id });
    trackFlowEvent("content_type_select", { type: next.contentType });
  }, []);

  /** Pilih angle lalu langsung ke halaman brief. */
  const pickAngleAndOpenBrief = useCallback(
    (next: AngleOption) => {
      selectAngle(next);
      trackFlowEvent("step_view", { step: 4 });
      router.push("/create/brief");
    },
    [router, selectAngle]
  );

  const goToAngles = useCallback(() => {
    router.push("/create/angle");
  }, [router]);

  const goToBrief = useCallback(() => {
    if (!angle) return;
    trackFlowEvent("step_view", { step: 4 });
    router.push("/create/brief");
  }, [angle, router]);

  const restart = useCallback(() => {
    trackFlowEvent("flow_restart");
    setSelection(null);
    setCustomDraft("");
    setAngle(null);
    setImages((current) => {
      current.forEach((file) => {
        if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
      });
      return [];
    });
    setLinks([]);
    router.push("/create");
  }, [router]);

  /* ---------- Pre-select dari dashboard (/create?topic= | ?title=) ---------- */

  /** Pre-select topik rekomendasi → langsung ke halaman angle. */
  const startFromTopic = useCallback(
    (topic: TopicIdea) => {
      setSelection({ scenario: "recommended", topic });
      setCustomDraft(topic.title);
      setAngle(null);
      trackFlowEvent("topic_change", { scenario: "recommended" });
      trackFlowEvent("topic_submit", { preselect: 1 });
      router.replace("/create/angle");
    },
    [router]
  );

  /** Pre-fill topik custom → langsung ke halaman angle. */
  const startFromTitle = useCallback(
    (title: string) => {
      const trimmed = title.trim();
      if (trimmed.length < MIN_CUSTOM_LENGTH) return;
      setSelection({ scenario: "custom", title: trimmed });
      setCustomDraft(trimmed);
      setAngle(null);
      trackFlowEvent("topic_change", { scenario: "custom" });
      trackFlowEvent("topic_submit", { preselect: 1 });
      router.replace("/create/angle");
    },
    [router]
  );

  return {
    submitted,
    scenario,
    topicTitle,
    customDraft,
    setCustomDraft,
    canSubmit,
    draftMatchesSelection,
    submit,
    images,
    addImages,
    removeImage,
    links,
    addLink,
    removeLink,
    referenceContext,
    contextSummary,
    angle,
    contentType,
    selectAngle,
    pickAngleAndOpenBrief,
    goToAngles,
    goToBrief,
    restart,
    startFromTopic,
    startFromTitle,
  };
}

export type CreateFlow = ReturnType<typeof useCreateFlow>;
