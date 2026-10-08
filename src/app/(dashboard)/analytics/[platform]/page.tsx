import { notFound } from "next/navigation";
import {
  isPlatformId,
  isVisiblePlatform,
  PLATFORM_MAP,
  VISIBLE_PLATFORMS,
} from "@/config/platforms";
import { PlatformView } from "@/features/platform/platform-view";

export function generateStaticParams() {
  return VISIBLE_PLATFORMS.map((platform) => ({ platform: platform.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await params;
  return {
    title: isPlatformId(platform) ? PLATFORM_MAP[platform].name : "Analytics",
  };
}

export default async function PlatformPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await params;
  if (!isPlatformId(platform) || !isVisiblePlatform(platform)) notFound();
  return <PlatformView platform={platform} />;
}
