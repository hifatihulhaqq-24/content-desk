"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  label: string;
  meta?: string;
}

interface BriefTocProps {
  items: TocItem[];
}

/**
 * Panel kanan — daftar isi canvas brief untuk navigasi cepat.
 * Klik = smooth scroll + broadcast sorotan; item aktif mengikuti scroll
 * (IntersectionObserver).
 */
export function BriefToc({ items }: BriefTocProps) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pilih section yang paling atas yang masih terlihat.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-72px 0px -55% 0px", threshold: [0, 0.25] }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [items]);

  const handleClick = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    window.dispatchEvent(new CustomEvent("brief:focus-section", { detail: id }));
  };

  return (
    <nav
      aria-label="Daftar isi brief"
      className="rounded-xl border border-border bg-card p-3 shadow-xs lg:sticky lg:top-20 print:hidden"
    >
      <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Daftar isi
      </h3>
      <ul className="mt-2 space-y-0.5">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleClick(item.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <span className="min-w-0 truncate">{item.label}</span>
                {item.meta && (
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {item.meta}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
