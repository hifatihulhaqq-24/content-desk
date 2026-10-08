"use client";

import { Suspense, useEffect } from "react";
import type { ReactNode } from "react";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { TopBar } from "./top-bar";

/** Tablet (768–1023px): sidebar default berupa icon rail sesuai PRD. */
function ResponsiveSidebarBehavior() {
  const { setOpen } = useSidebar();
  useEffect(() => {
    const width = window.innerWidth;
    if (width >= 768 && width < 1024) {
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

/**
 * AppSidebar & TopBar membaca usePathname — di bawah Cache Components
 * itu harus berada dalam <Suspense> agar bisa stream saat request time
 * (lihat: docs/messages/blocking-prerender-client-hook).
 */
function SidebarFallback() {
  return (
    <div
      aria-hidden
      className="hidden h-svh w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:block"
    />
  );
}

function TopBarFallback() {
  return <div aria-hidden className="h-14 shrink-0 border-b" />;
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <ResponsiveSidebarBehavior />
      <Suspense fallback={<SidebarFallback />}>
        <AppSidebar />
      </Suspense>
      <SidebarInset>
        <Suspense fallback={<TopBarFallback />}>
          <TopBar />
        </Suspense>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
