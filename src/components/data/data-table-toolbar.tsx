"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { ReactNode } from "react";

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  hideSearch?: boolean;
  children?: ReactNode;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Cari…",
  hideSearch = false,
  children,
}: DataTableToolbarProps) {
  if (hideSearch && !children) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      {!hideSearch && (
        <div className="relative w-full max-w-64">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-9 pl-8"
          />
        </div>
      )}
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
