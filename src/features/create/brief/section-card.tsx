"use client";

import type { ReactNode } from "react";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BriefSectionCardProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Kartu bagian brief (R14): judul + aksi regenerate per bagian. */
export function BriefSectionCard({
  title,
  description,
  actions,
  children,
  className,
}: BriefSectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-xs",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {actions}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

interface RegenerateButtonProps {
  onClick: () => void;
  busy?: boolean;
  label?: string;
  disabled?: boolean;
}

export function RegenerateButton({
  onClick,
  busy,
  label = "Regenerate",
  disabled,
}: RegenerateButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={onClick}
      disabled={busy || disabled}
      className="text-muted-foreground hover:text-foreground"
    >
      <RotateCw className={cn("size-3.5", busy && "animate-spin")} aria-hidden />
      {label}
    </Button>
  );
}
