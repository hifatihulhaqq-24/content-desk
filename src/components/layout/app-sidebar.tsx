"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { APP_NAME, CURRENT_USER } from "@/config/app";
import { AnalyticsNav } from "./analytics-nav";

function useCloseOnMobile() {
  const { isMobile, setOpenMobile } = useSidebar();
  return () => {
    if (isMobile) setOpenMobile(false);
  };
}

export function AppSidebar() {
  const pathname = usePathname();
  const closeMobile = useCloseOnMobile();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href="/overview"
          onClick={closeMobile}
          className="flex items-center gap-2 px-2 py-1.5 outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-[11px] font-bold text-sidebar-primary-foreground group-data-[collapsible=icon]:size-7">
            CD
          </span>
          <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
            {APP_NAME}
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Overview"
                  isActive={pathname === "/overview" || pathname === "/"}
                >
                  <Link href="/overview" onClick={closeMobile}>
                    <LayoutDashboard />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <AnalyticsNav />
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Create"
                  isActive={pathname.startsWith("/create")}
                >
                  <Link href="/create" onClick={closeMobile}>
                    <Plus />
                    <span>Create</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Pengaturan"
                  isActive={pathname.startsWith("/settings")}
                >
                  <Link href="/settings" onClick={closeMobile}>
                    <Settings />
                    <span>Pengaturan</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-12 w-full justify-start gap-2 px-2 data-[state=open]:bg-sidebar-accent"
            >
              <Avatar className="size-8">
                <AvatarImage src={CURRENT_USER.image} alt={CURRENT_USER.name} />
                <AvatarFallback className="text-xs">
                  {CURRENT_USER.initials}
                </AvatarFallback>
              </Avatar>
              <span className="flex min-w-0 flex-1 flex-col items-start group-data-[collapsible=icon]:hidden">
                <span className="truncate text-xs font-medium">
                  {CURRENT_USER.name}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {CURRENT_USER.role}
                </span>
              </span>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56">
            <DropdownMenuLabel className="truncate">
              {CURRENT_USER.role}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <User /> Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings /> Pengaturan
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={cn("text-destructive focus:text-destructive")}
              onSelect={(event) => event.preventDefault()}
            >
              <LogOut /> Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
