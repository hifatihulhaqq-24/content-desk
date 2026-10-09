"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DateRangePicker } from "@/components/data/date-range-picker";
import { ThemeToggle } from "./theme-toggle";
import { CURRENT_USER } from "@/config/app";
import { getBreadcrumbs } from "@/config/route-titles";
import { Settings, User } from "lucide-react";

export function TopBar() {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);
  const showDateRange =
    pathname === "/overview" || pathname.startsWith("/analytics");

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-white/55 px-4 backdrop-blur-xl print:hidden dark:bg-sidebar/55">
      <SidebarTrigger aria-label="Buka atau tutup menu sidebar" />
      <Separator orientation="vertical" className="mr-1 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <Fragment key={`${crumb.label}-${index}`}>
                {index > 0 && (
                  <BreadcrumbSeparator className="hidden sm:flex" />
                )}
                <BreadcrumbItem
                  className={!isLast ? "hidden sm:flex" : undefined}
                >
                  {crumb.href && !isLast ? (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="max-w-40 truncate sm:max-w-none">
                      {crumb.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        {showDateRange && <DateRangePicker />}
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Menu profil"
            >
              <Avatar className="size-8">
                <AvatarImage src={CURRENT_USER.image} alt={CURRENT_USER.name} />
                <AvatarFallback className="text-xs">
                  {CURRENT_USER.initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              {CURRENT_USER.name}
              <span className="block text-xs font-normal text-muted-foreground">
                {CURRENT_USER.email}
              </span>
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
