import {
  findAccount,
  isVisiblePlatform,
  PLATFORM_MAP,
  isPlatformId,
} from "@/config/platforms";

export interface Crumb {
  label: string;
  href?: string;
}

export function getBreadcrumbs(pathname: string): Crumb[] {
  if (pathname === "/overview" || pathname === "/") {
    return [{ label: "Overview" }];
  }
  if (pathname.startsWith("/create")) return [{ label: "Create" }];
  if (pathname.startsWith("/settings")) return [{ label: "Pengaturan" }];
  if (pathname.startsWith("/ui-kit")) return [{ label: "UI Kit" }];

  const analytics = pathname.match(
    /^\/analytics\/([^/]+)(?:\/([^/]+))?/
  );
  if (analytics && isPlatformId(analytics[1]) && isVisiblePlatform(analytics[1])) {
    const platform = PLATFORM_MAP[analytics[1]];
    const crumbs: Crumb[] = [
      { label: "Analytics" },
      { label: platform.name, href: `/analytics/${platform.id}` },
    ];
    if (analytics[2]) {
      const found = findAccount(analytics[2]);
      crumbs.push({
        label: found ? found.account.name : "Akun",
      });
    }
    return crumbs;
  }

  const segment = pathname.split("/").filter(Boolean).pop() ?? "Halaman";
  return [{ label: segment.charAt(0).toUpperCase() + segment.slice(1) }];
}

export function getPageTitle(pathname: string): string {
  const crumbs = getBreadcrumbs(pathname);
  return crumbs[crumbs.length - 1]?.label ?? "ContentDesk";
}
