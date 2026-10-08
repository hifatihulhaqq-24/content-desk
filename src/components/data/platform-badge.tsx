import type { PlatformId } from "@/config/platforms";
import { PLATFORM_MAP } from "@/config/platforms";
import { PlatformIcon } from "@/components/icons/platform-icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlatformBadgeProps {
  platform: PlatformId;
  /** Sembunyikan nama, hanya ikon (mis. di tabel padat). */
  hideName?: boolean;
  className?: string;
}

export function PlatformBadge({
  platform,
  hideName = false,
  className,
}: PlatformBadgeProps) {
  const config = PLATFORM_MAP[platform];
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-medium", className)}
      style={{ color: config.color, borderColor: `${config.color}59` }}
    >
      <PlatformIcon platform={platform} className="size-3.5" />
      {!hideName && <span>{config.name}</span>}
    </Badge>
  );
}
