"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlowStep } from "./use-create-flow";

export const FLOW_STEPS: { n: FlowStep; label: string }[] = [
  { n: 1, label: "Insight & Topik" },
  { n: 2, label: "Angle & Format" },
  { n: 3, label: "Kesiapan Aset" },
  { n: 4, label: "Draf Brief" },
];

interface FlowStepperProps {
  step: FlowStep;
  furthest: FlowStep;
  onSelect: (step: FlowStep) => void;
  /**
   * `vertical` untuk rail kiri (lg+), `horizontal` untuk fallback mobile.
   * Default tetap horizontal agar pemakaian lama tidak berubah.
   */
  orientation?: "horizontal" | "vertical";
}

function StepCircle({
  n,
  done,
  current,
  size = "md",
}: {
  n: number;
  done: boolean;
  current: boolean;
  size?: "md" | "sm";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border text-sm font-medium tabular-nums",
        size === "sm" ? "size-7" : "size-8",
        done && "border-primary bg-primary text-primary-foreground",
        current && "border-primary bg-background text-primary",
        !done && !current && "border-border bg-background text-muted-foreground"
      )}
    >
      {done ? <Check className="size-4" /> : n}
    </span>
  );
}

/**
 * Stepper linear yang selalu terlihat (R1); langkah sebelumnya bisa
 * dikunjungi (R2). Tersedia orientasi horizontal & vertikal.
 */
export function FlowStepper({
  step,
  furthest,
  onSelect,
  orientation = "horizontal",
}: FlowStepperProps) {
  const items = FLOW_STEPS.map((item) => ({
    ...item,
    done: item.n < step,
    current: item.n === step,
    reachable: item.n <= furthest,
  }));

  if (orientation === "vertical") {
    return (
      <nav
        aria-label="Langkah alur"
        className="rounded-xl border border-border bg-card p-3 shadow-xs"
      >
        <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Langkah
        </p>
        <ol className="space-y-1">
          {items.map((item, index) => {
            const label = (
              <span
                className={cn(
                  "text-sm",
                  item.current && "font-semibold text-foreground",
                  item.done && "text-foreground",
                  !item.done && !item.current && "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            );

            return (
              <li key={item.n} className="flex gap-3">
                <div className="flex flex-col items-center self-stretch">
                  <StepCircle
                    n={item.n}
                    done={item.done}
                    current={item.current}
                    size="sm"
                  />
                  {index < items.length - 1 && (
                    <span
                      className={cn(
                        "my-1 w-px flex-1",
                        item.n < step ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                </div>

                <div className="flex-1 py-1">
                  {item.reachable && !item.current ? (
                    <button
                      type="button"
                      onClick={() => onSelect(item.n)}
                      aria-current={item.done ? "step" : undefined}
                      className="flex w-full items-center gap-3 rounded-md px-1 py-1 text-left transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      {label}
                    </button>
                  ) : (
                    <span
                      className="flex w-full items-center gap-3 px-1 py-1"
                      aria-current={item.current ? "step" : undefined}
                    >
                      {label}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Langkah alur"
      className="@container rounded-xl border border-border bg-card p-4 shadow-xs"
    >
      <ol className="flex items-center">
        {items.map((item) => {
          const state = cn(
            item.current && "font-semibold text-foreground",
            item.done && "text-foreground",
            !item.done && !item.current && "text-muted-foreground"
          );
          const circle = (
            <StepCircle n={item.n} done={item.done} current={item.current} />
          );
          // Label tersembunyi kalau container sempit (tanpa memaksa scroll),
          // tetap terbaca screen reader lewat span sr-only.
          const label = (
            <>
              <span
                className={cn(
                  "hidden min-w-0 truncate text-sm @[540px]:inline",
                  state
                )}
              >
                {item.label}
              </span>
              <span className="sr-only @[540px]:hidden">{item.label}</span>
            </>
          );

          return (
            <li
              key={item.n}
              className="flex min-w-0 flex-1 items-center gap-2 last:flex-none"
            >
              {item.reachable && !item.current ? (
                <button
                  type="button"
                  onClick={() => onSelect(item.n)}
                  aria-current={item.done ? "step" : undefined}
                  className="flex min-w-0 items-center gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {circle}
                  {label}
                </button>
              ) : (
                <span
                  className="flex min-w-0 items-center gap-2 px-1 py-0.5"
                  aria-current={item.current ? "step" : undefined}
                >
                  {circle}
                  {label}
                </span>
              )}
              {item.n < FLOW_STEPS.length && (
                <span
                  aria-hidden
                  className={cn(
                    "mx-1 h-px min-w-4 flex-1",
                    item.done ? "bg-primary" : "bg-border"
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
