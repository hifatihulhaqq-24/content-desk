"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "@/components/icons/platform-icon";
import { VISIBLE_PLATFORMS } from "@/config/platforms";
import {
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

const STORAGE_KEY = "contentdesk:sidebar-nav";

interface NavState {
  analyticsOpen: boolean;
  platforms: string[];
}

const DEFAULT_STATE: NavState = { analyticsOpen: true, platforms: [] };

function parseState(raw: string | null): NavState {
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<NavState>;
      return {
        analyticsOpen: parsed.analyticsOpen ?? true,
        platforms: Array.isArray(parsed.platforms) ? parsed.platforms : [],
      };
    } catch {
      /* abaikan storage rusak */
    }
  }
  return DEFAULT_STATE;
}

let cachedRaw: string | undefined;
let cachedState: NavState = DEFAULT_STATE;

function getSnapshot(): NavState {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(STORAGE_KEY);
  } catch {
    /* abaikan storage tidak tersedia */
  }
  const key = raw ?? undefined;
  if (key !== cachedRaw) {
    cachedRaw = key;
    cachedState = parseState(raw);
  }
  return cachedState;
}

function getServerSnapshot(): NavState {
  return DEFAULT_STATE;
}

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function writeState(state: NavState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* abaikan storage penuh */
  }
}

export function AnalyticsNav() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const stored = useSyncExternalStore(
    subscribeStorage,
    getSnapshot,
    getServerSnapshot
  );
  const [override, setOverride] = useState<NavState | null>(null);
  const state = override ?? stored;

  const update = (next: NavState) => {
    setOverride(next);
    writeState(next);
  };

  const togglePlatform = (id: string) => {
    const open = state.platforms.includes(id);
    update({
      ...state,
      platforms: open
        ? state.platforms.filter((p) => p !== id)
        : [...state.platforms, id],
    });
  };

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const analyticsActive = pathname.startsWith("/analytics");

  return (
    <>
      <SidebarMenuButton
        tooltip="Analytics Dashboard"
        isActive={analyticsActive}
        aria-expanded={state.analyticsOpen}
        onClick={() => update({ ...state, analyticsOpen: !state.analyticsOpen })}
      >
        <ChevronRight
          className={cn(
            "size-4 transition-transform duration-200",
            state.analyticsOpen && "rotate-90"
          )}
        />
        <span>Analytics Dashboard</span>
      </SidebarMenuButton>

      {state.analyticsOpen && (
        <SidebarMenuSub>
          {VISIBLE_PLATFORMS.map((platform) => {
            const href = `/analytics/${platform.id}`;
            const platformActive = pathname.startsWith(href);
            const expanded =
              state.platforms.includes(platform.id) || platformActive;
            return (
              <SidebarMenuSubItem key={platform.id}>
                <div className="flex items-center gap-1">
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === href}
                    className="flex-1"
                  >
                    <Link href={href} onClick={closeMobile}>
                      <PlatformIcon
                        platform={platform.id}
                        className="size-4 shrink-0"
                        style={{ color: platform.color }}
                      />
                      <span>{platform.name}</span>
                    </Link>
                  </SidebarMenuSubButton>
                  <button
                    type="button"
                    aria-label={`Tampilkan akun ${platform.name}`}
                    aria-expanded={expanded}
                    onClick={() => togglePlatform(platform.id)}
                    className="flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <ChevronDown
                      className={cn(
                        "size-3.5 transition-transform duration-200",
                        expanded && "rotate-180"
                      )}
                    />
                  </button>
                </div>
                {expanded && (
                  <SidebarMenuSub>
                    {platform.accounts.map((account) => (
                      <SidebarMenuSubItem key={account.id}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={
                            pathname === `${href}/${account.id}`
                          }
                          className="pl-9"
                        >
                          <Link
                            href={`${href}/${account.id}`}
                            onClick={closeMobile}
                          >
                            <span className="truncate">{account.name}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      )}
    </>
  );
}
