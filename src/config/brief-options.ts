import type { ContentTypeId } from "@/types/ideation";

/** Opsi pengaturan brief per tipe konten (R15/R19/R21) — dipakai mock & UI. */

export const AVATAR_OPTIONS = [
  "Avatar Raka – Presenter",
  "Avatar Nisa – Santai",
  "Tanpa avatar",
];

export const VIDEO_ASPECT_OPTIONS = ["9:16", "1:1", "16:9"];
export const IMAGE_ASPECT_OPTIONS = ["1:1", "4:5", "16:9"];
export const CAROUSEL_ASPECT_OPTIONS = ["4:5", "1:1"];
export const DURATION_OPTIONS = [30, 45, 60];

export function aspectOptionsFor(type: ContentTypeId): string[] {
  switch (type) {
    case "video":
      return VIDEO_ASPECT_OPTIONS;
    case "image":
      return IMAGE_ASPECT_OPTIONS;
    case "carousel":
      return CAROUSEL_ASPECT_OPTIONS;
    default:
      return [];
  }
}
