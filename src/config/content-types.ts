import type { ContentTypeId } from "@/types/ideation";

export interface ContentTypeInfo {
  id: ContentTypeId;
  label: string;
  description: string;
  /** Nama ikon lucide-react. */
  icon: "FileText" | "Video" | "Image" | "GalleryHorizontal";
}

/**
 * Tipe konten Phase 2: Article, Video, Image, Carousel.
 * Audio ditunda (keputusan scope Phase 2).
 */
export const CONTENT_TYPES: ContentTypeInfo[] = [
  {
    id: "article",
    label: "Artikel",
    description: "Draf teks panjang dengan outline dan editor rich text",
    icon: "FileText",
  },
  {
    id: "video",
    label: "Video",
    description: "Ringkasan + daftar adegan berskrip visual",
    icon: "Video",
  },
  {
    id: "image",
    label: "Image",
    description: "Satu visual dengan teks pendukung di atasnya",
    icon: "Image",
  },
  {
    id: "carousel",
    label: "Carousel",
    description: "Rangkaian slide dengan teks per slide",
    icon: "GalleryHorizontal",
  },
];

export const CONTENT_TYPE_MAP = Object.fromEntries(
  CONTENT_TYPES.map((t) => [t.id, t])
) as Record<ContentTypeId, ContentTypeInfo>;

export const contentTypeLabel = (id: ContentTypeId): string =>
  CONTENT_TYPE_MAP[id]?.label ?? id;
