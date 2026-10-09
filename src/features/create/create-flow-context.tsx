"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useBrief, type BriefController } from "@/hooks/use-brief";
import { useCreateFlow, type CreateFlow } from "./use-create-flow";

interface CreateFlowContextValue {
  flow: CreateFlow;
  brief: BriefController;
}

const CreateFlowContext = createContext<CreateFlowContextValue | null>(null);

/**
 * Provider yang dipasang di `app/(dashboard)/create/layout.tsx` — layout
 * segment tetap ter-mount saat berpindah antar /create, /create/angle, dan
 * /create/brief, sehingga seluruh state flow (topik, lampiran, angle, draft
 * brief) bertahan selama navigasi client-side.
 */
export function CreateFlowProvider({ children }: { children: ReactNode }) {
  const flow = useCreateFlow();
  const pathname = usePathname();

  // Draft brief hanya digenerate saat berada di halaman brief.
  const brief = useBrief(pathname === "/create/brief", {
    topic: flow.topicTitle,
    scenario: flow.scenario ?? "recommended",
    angle: flow.angle,
    contentType: flow.contentType,
    context: flow.referenceContext,
  });

  return (
    <CreateFlowContext.Provider value={{ flow, brief }}>
      {children}
    </CreateFlowContext.Provider>
  );
}

export function useCreateFlowContext(): CreateFlowContextValue {
  const value = useContext(CreateFlowContext);
  if (!value) {
    throw new Error(
      "useCreateFlowContext harus dipakai di dalam <CreateFlowProvider>."
    );
  }
  return value;
}
