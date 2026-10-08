"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlowStep } from "./use-create-flow";

const STEPS: { n: FlowStep; label: string }[] = [
  { n: 1, label: "Insight & Topik" },
  { n: 2, label: "Angle & Format" },
  { n: 3, label: "Kesiapan Aset" },
  { n: 4, label: "Draf Brief" },
];

interface FlowStepperProps {
  step: FlowStep;
  furthest: FlowStep;
  onSelect: (step: FlowStep) => void;
}

/** Stepper linear yang selalu terlihat (R1); langkah sebelumnya bisa dikunjungi (R2). */
export function FlowStepper({ step, furthest, onSelect }: FlowStepperProps) {
  return (
    <nav aria-label="Langkah alur" className="rounded-xl bg-card p-4 shadow-xs">
      <ol className="flex items-center">
        {STEPS.map((item, index) => {
          const done = item.n < step;
          const current = item.n === step;
          const reachable = item.n <= furthest;
          const circle = (
            <span
              aria-hidden
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium tabular-nums",
                done && "border-primary bg-primary text-primary-foreground",
                current && "border-primary bg-background text-primary",
                !done && !current && "border-border bg-background text-muted-foreground"
              )}
            >
              {done ? <Check className="size-4" /> : item.n}
            </span>
          );
          const label = (
            <span
              className={cn(
                "text-sm",
                current && "font-semibold text-foreground",
                done && "text-foreground",
                !done && !current && "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          );

          return (
            <li key={item.n} className="flex flex-1 items-center gap-2 last:flex-none">
              {reachable && !current ? (
                <button
                  type="button"
                  onClick={() => onSelect(item.n)}
                  aria-current={done ? "step" : undefined}
                  className="flex items-center gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {circle}
                  {label}
                </button>
              ) : (
                <span
                  className="flex items-center gap-2 px-1 py-0.5"
                  aria-current={current ? "step" : undefined}
                >
                  {circle}
                  {label}
                </span>
              )}
              {index < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "mx-1 h-px min-w-6 flex-1",
                    item.n < step ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
