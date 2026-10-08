"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AngleOption,
  ContentTypeId,
  EntryScenario,
  TopicIdea,
} from "@/types/ideation";
import { trackFlowEvent } from "@/lib/flow-events";

export type FlowStep = 1 | 2 | 3;

export type TopicSelection =
  | { scenario: "recommended"; topic: TopicIdea }
  | { scenario: "custom"; title: string };

/** Peringatan R2: mengubah pilihan awal mereset hasil step berikutnya. */
export type PendingChange =
  | { kind: "topic"; next: TopicSelection }
  | { kind: "selection"; next: { angle?: AngleOption; contentType?: ContentTypeId } };

const MIN_CUSTOM_LENGTH = 4;

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

export function useCreateFlow() {
  const [step, setStep] = useState<FlowStep>(1);
  const [furthest, setFurthest] = useState<FlowStep>(1);
  const [scenario, setScenario] = useState<EntryScenario | null>(null);
  const [topicIdea, setTopicIdea] = useState<TopicIdea | null>(null);
  const [customTopic, setCustomTopic] = useState("");
  const [customDraft, setCustomDraft] = useState("");
  const [angle, setAngle] = useState<AngleOption | null>(null);
  const [contentType, setContentType] = useState<ContentTypeId | null>(null);
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);

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

  const hasDownstream = angle !== null || contentType !== null;
  const briefVisited = furthest >= 3;

  const applyTopic = useCallback((next: TopicSelection) => {
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
      setContentType(null);
      setStep(1);
      setFurthest(1);
      trackFlowEvent("topic_change", { scenario: next.scenario });
    }
  }, [currentSelection]);

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
    (next: { angle?: AngleOption; contentType?: ContentTypeId }) => {
      if (next.angle) {
        setAngle(next.angle);
        trackFlowEvent("angle_select", { angle: next.angle.id });
      }
      if (next.contentType) {
        setContentType(next.contentType);
        trackFlowEvent("content_type_select", { type: next.contentType });
      }
      if (furthest >= 3) setFurthest(2);
    },
    [furthest]
  );

  const requestSelection = useCallback(
    (next: { angle?: AngleOption; contentType?: ContentTypeId }) => {
      const willResetBrief =
        briefVisited &&
        ((next.angle && next.angle.id !== angle?.id) ||
          (next.contentType && next.contentType !== contentType));
      if (willResetBrief) {
        setPendingChange({ kind: "selection", next });
        return;
      }
      applySelection(next);
    },
    [angle, applySelection, briefVisited, contentType]
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

  const canAdvance =
    step === 1
      ? topicTitle.trim().length > 0
      : step === 2
        ? angle !== null && contentType !== null
        : true;

  const advance = useCallback(() => {
    if (!canAdvance || step >= 3) return;
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
    setContentType(null);
    setPendingChange(null);
  }, []);

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
    pendingChange,
    hasDownstream,
    canAdvance,
    requestTopic,
    requestSelection,
    confirmPending,
    cancelPending,
    commitCustomTopic,
    advance,
    goToStep,
    restart,
  };
}

export type CreateFlow = ReturnType<typeof useCreateFlow>;
