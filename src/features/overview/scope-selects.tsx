"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLATFORM_MAP, VISIBLE_PLATFORMS } from "@/config/platforms";
import type { PlatformId } from "@/types/analytics";

interface ScopeSelectsProps {
  platform: PlatformId | "all";
  accountId: string;
  onPlatformChange: (value: PlatformId | "all") => void;
  onAccountChange: (value: string) => void;
  /** Nama section untuk label aria, mis. "publishing time". */
  label: string;
}

/** Pilihan cakupan platform + akun yang dipakai bersama antar section. */
export function ScopeSelects({
  platform,
  accountId,
  onPlatformChange,
  onAccountChange,
  label,
}: ScopeSelectsProps) {
  const accountOptions =
    platform === "all" ? [] : PLATFORM_MAP[platform].accounts;

  const handlePlatformChange = (value: string) => {
    onPlatformChange(value as PlatformId | "all");
    onAccountChange("all");
  };

  return (
    <>
      <Select value={platform} onValueChange={handlePlatformChange}>
        <SelectTrigger
          size="sm"
          className="w-40"
          aria-label={`Filter platform ${label}`}
        >
          <SelectValue placeholder="Semua platform" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua platform</SelectItem>
          {VISIBLE_PLATFORMS.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={accountId}
        onValueChange={onAccountChange}
        disabled={platform === "all"}
      >
        <SelectTrigger
          size="sm"
          className="w-44"
          aria-label={`Filter akun ${label}`}
        >
          <SelectValue placeholder="Semua akun" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua akun</SelectItem>
          {accountOptions.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.handle}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-xs text-muted-foreground">
        {platform === "all"
          ? `Gabungan ${VISIBLE_PLATFORMS.length} platform`
          : accountId === "all"
            ? `Semua akun ${PLATFORM_MAP[platform].name}`
            : accountOptions.find((item) => item.id === accountId)?.handle}
      </span>
    </>
  );
}
