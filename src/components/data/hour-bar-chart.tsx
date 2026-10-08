"use client";

import { useRef, useState, type MouseEvent } from "react";
import { HoverTooltip } from "./hover-tooltip";

export interface HourBarDatum {
  /** Jam tayang 0–23. */
  hour: number;
  value: number;
}

interface HourBarChartProps {
  title: string;
  data: HourBarDatum[];
  /** Format angka tick sumbu-Y (mis. "1,6M" / "20"). */
  formatAxis: (value: number) => string;
  /** Format tooltip & label "Terbaik" (mis. "1,6M" / "12 konten"). */
  formatValue: (value: number) => string;
  /** Warna bar reguler (terang). */
  lightColor: string;
  /** Warna bar 3 jam terbaik (gelap). */
  darkColor: string;
}

/** Pembulatan sumbu-Y ke angka "nice" terdekat. */
function niceMax(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const power = Math.pow(10, Math.floor(Math.log10(value)));
  const mantissa = value / power;
  const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const step = steps.find((x) => mantissa <= x) ?? 10;
  return step * power;
}

interface BarHover {
  hour: number;
  value: number;
  /** Posisi pointer relatif terhadap area bar. */
  x: number;
  y: number;
}

/**
 * Bar chart per jam (00.00–23.00 / 24 jam penuh) bergaya mock kumparanDesk
 * — PRODUCT MVP: sumbu-Y 3 tick + garis dashed, 24 bar (3 jam terbaik warna
 * gelap), label sumbu-X tiap 2 jam, tooltip mengikuti pointer saat hover bar.
 */
export function HourBarChart({
  title,
  data,
  formatAxis,
  formatValue,
  lightColor,
  darkColor,
}: HourBarChartProps) {
  const values = data.map((point) => point.value);
  const top = niceMax(Math.max(...values, 0));
  const sorted = [...values].sort((a, b) => b - a);
  const bestIndex = values.indexOf(sorted[0]);
  const best = data[bestIndex];
  const thirdBest = sorted[2] ?? sorted[sorted.length - 1] ?? 0;

  const areaRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<BarHover | null>(null);

  const trackPointer = (point: HourBarDatum, event: MouseEvent<HTMLDivElement>) => {
    const area = areaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    setHover({
      hour: point.hour,
      value: point.value,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">
          Terbaik{" "}
          {best && (
            <b
              className="font-semibold tabular-nums"
              style={{ color: darkColor }}
            >
              {String(best.hour).padStart(2, "0")}.00 ·{" "}
              {formatValue(best.value)}
            </b>
          )}
        </p>
      </div>

      <div className="grid grid-cols-[44px_minmax(0,1fr)] gap-1.5">
        <div className="flex h-[120px] flex-col justify-between text-right text-[10.5px] leading-none text-muted-foreground">
          <span>{formatAxis(top)}</span>
          <span>{formatAxis(top / 2)}</span>
          <span>0</span>
        </div>
        <div className="relative h-[120px] border-b border-muted-foreground/50">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 border-t border-dashed border-border"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-1/2 border-t border-dashed border-border"
          />
          <div ref={areaRef} className="relative flex h-full items-end gap-[3px]">
            {data.map((point) => {
              const isActive = hover?.hour === point.hour;
              const isDimmed = hover !== null && !isActive;
              return (
                <div
                  key={point.hour}
                  role="img"
                  aria-label={`${String(point.hour).padStart(2, "0")}.00 · ${formatValue(point.value)}`}
                  onMouseEnter={(event) => trackPointer(point, event)}
                  onMouseMove={(event) => trackPointer(point, event)}
                  onMouseLeave={() => setHover(null)}
                  className="min-w-0 flex-1 rounded-t-[3px] transition-[filter,opacity] duration-150"
                  style={{
                    height: `${top > 0 ? Math.max(2, (point.value / top) * 100) : 2}%`,
                    background: point.value >= thirdBest ? darkColor : lightColor,
                    filter: isActive ? "brightness(1.12)" : undefined,
                    opacity: isDimmed ? 0.55 : undefined,
                  }}
                />
              );
            })}
            {hover && (
              <HoverTooltip
                x={hover.x}
                y={hover.y}
                label={`${String(hover.hour).padStart(2, "0")}.00`}
                rows={[
                  {
                    label: title,
                    color: hover.value >= thirdBest ? darkColor : lightColor,
                    value: formatValue(hover.value),
                  },
                ]}
              />
            )}
          </div>
        </div>
      </div>

      <div
        className="grid gap-[3px] text-center text-[10.5px] text-muted-foreground"
        style={{
          gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`,
        }}
        aria-hidden
      >
        {data.map((point, index) => (
          <span key={point.hour}>
            {index % 2 === 0 ? String(point.hour).padStart(2, "0") : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
