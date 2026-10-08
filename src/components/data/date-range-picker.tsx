"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDateRange } from "@/hooks/use-date-range";
import { useMounted } from "@/hooks/use-mounted";
import { RANGE_PRESETS, toIsoDate, today } from "@/lib/date";
import { formatRange } from "@/lib/format";
import { cn } from "@/lib/utils";

export function DateRangePicker({ className }: { className?: string }) {
  const { range, presetDays, setRange, applyPreset } = useDateRange();
  const [open, setOpen] = useState(false);
  const [maxDate, setMaxDate] = useState<Date | null>(null);
  const mounted = useMounted();

  const label = presetDays
    ? `${presetDays} hari terakhir`
    : formatRange(toIsoDate(range.from), toIsoDate(range.to));

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        // Batas tanggal dibaca di event handler (bukan saat render/prerender).
        if (next && !maxDate) setMaxDate(today());
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", className)}
          aria-label="Ubah rentang tanggal"
        >
          <CalendarIcon className="size-4" />
          {mounted ? (
            <span className="max-w-40 truncate text-sm">{label}</span>
          ) : (
            <span
              aria-hidden
              className="h-4 w-28 animate-pulse rounded bg-muted"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0" collisionPadding={16}>
        <div className="flex flex-col gap-2 border-b p-3 sm:flex-row">
          <div className="flex gap-1 sm:flex-col">
            {RANGE_PRESETS.map((preset) => (
              <Button
                key={preset.days}
                variant={presetDays === preset.days ? "secondary" : "ghost"}
                size="sm"
                className="justify-start"
                onClick={() => {
                  applyPreset(preset.days);
                  setOpen(false);
                }}
              >
                {preset.label} terakhir
              </Button>
            ))}
          </div>
          <Calendar
            mode="range"
            defaultMonth={range.to}
            selected={{ from: range.from, to: range.to }}
            onSelect={(selection) => {
              if (selection?.from && selection?.to && selection.from <= selection.to) {
                setRange({ from: selection.from, to: selection.to });
                setOpen(false);
              }
            }}
            disabled={maxDate ? { after: maxDate } : undefined}
            numberOfMonths={1}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
