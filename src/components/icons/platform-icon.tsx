import type { CSSProperties } from "react";
import type { PlatformId } from "@/config/platforms";
import { BRAND_PATHS } from "./brand-paths";

interface PlatformIconProps {
  platform: PlatformId;
  className?: string;
  style?: CSSProperties;
  /** Nama platform untuk accessibility (disembunyikan bila label tersedia). */
  title?: string;
}

export function PlatformIcon({
  platform,
  className,
  style,
  title,
}: PlatformIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      className={className}
      style={style}
    >
      {title && <title>{title}</title>}
      <path d={BRAND_PATHS[platform]} />
    </svg>
  );
}
