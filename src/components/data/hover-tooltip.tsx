"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface HoverTooltipRow {
  /** Warna dot di kiri label (hex / variabel CSS). */
  label: string;
  color?: string;
  value?: ReactNode;
}

interface HoverTooltipProps {
  /** Posisi pointer (px) relatif terhadap container `relative` terdekat. */
  x: number;
  y: number;
  /** Baris judul di atas isi tooltip (mis. "07.00"). */
  label?: string;
  rows: HoverTooltipRow[];
  className?: string;
}

/** Jarak tepi container agar tooltip tidak keluar kartu. */
const EDGE_MARGIN = 4;
/** Jarak tooltip dari pointer (di atas). */
const CURSOR_GAP = 10;

/**
 * Tooltip yang mengikuti pointer untuk chart buatan sendiri (div/SVG),
 * supaya interaksi hover seragam dengan chart recharts (ChartTooltipContent):
 * posisi di atas pointer, otomatis didorong masuk bila melewati tepi container.
 */
export function HoverTooltip({ x, y, label, rows, className }: HoverTooltipProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState({ dx: 0, dy: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    const rect = el.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    // Posisi tanpa koreksi sebelumnya — supaya hitungan tidak "kabur"
    // setiap kali offset diperbarui.
    const baseLeft = rect.left - offset.dx;
    const baseTop = rect.top - offset.dy;
    let dx = 0;
    let dy = 0;
    if (baseLeft < parentRect.left + EDGE_MARGIN) {
      dx = parentRect.left + EDGE_MARGIN - baseLeft;
    } else if (baseLeft + rect.width > parentRect.right - EDGE_MARGIN) {
      dx = parentRect.right - EDGE_MARGIN - (baseLeft + rect.width);
    }
    if (baseTop < parentRect.top + EDGE_MARGIN) {
      dy = parentRect.top + EDGE_MARGIN - baseTop;
    } else if (baseTop + rect.height > parentRect.bottom - EDGE_MARGIN) {
      dy = parentRect.bottom - EDGE_MARGIN - (baseTop + rect.height);
    }
    if (dx !== offset.dx || dy !== offset.dy) {
      setOffset({ dx, dy });
    }
  }, [x, y, label, rows, offset.dx, offset.dy]);

  return (
    <div
      ref={ref}
      role="tooltip"
      className={cn(
        "pointer-events-none absolute z-10 min-w-32 max-w-56 grid gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
      style={{
        left: x,
        top: y - CURSOR_GAP,
        transform: `translate(calc(-50% + ${offset.dx}px), calc(-100% + ${offset.dy}px))`,
      }}
    >
      {label && <div className="font-medium">{label}</div>}
      {rows.map((row, index) => (
        <div
          key={index}
          className="flex w-full flex-wrap items-center justify-between gap-3 leading-none"
        >
          <span className="flex min-w-0 items-center gap-1.5">
            {row.color && (
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: row.color }}
              />
            )}
            <span className="truncate text-muted-foreground">{row.label}</span>
          </span>
          {row.value !== undefined && (
            <span className="font-mono font-medium tabular-nums">{row.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}
