"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { LogOut, Settings, User } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface TopHeaderProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  workspace: {
    name: string;
    slug: string;
  };
}

// ─── Route → Label map ───────────────────────────────────────────────────────

const ROUTE_LABEL_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  tasks:    "Tasks",
  clients:  "Clients",
  team:     "Team",
  settings: "Settings",
};

function resolvePageLabel(pathname: string, slug: string): string {
  // Strip the workspace prefix, e.g. /w/my-agency/tasks → ["tasks"]
  const base = `/w/${slug}`;
  const relative = pathname.replace(base, "").replace(/^\//, "");
  const segment = relative.split("/")[0];
  return ROUTE_LABEL_MAP[segment] ?? "Dashboard";
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TopHeader({ user, workspace }: TopHeaderProps) {
  const pathname = usePathname();
  const pageLabel = resolvePageLabel(pathname, workspace.slug);

  const userInitials =
    user.name?.charAt(0).toUpperCase() ||
    user.email?.charAt(0).toUpperCase() ||
    "U";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-5">
      {/* ── Left: Trigger + Breadcrumb ──────────────────────────────── */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="mx-1 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink
                asChild
                className="max-w-[140px] truncate text-muted-foreground hover:text-foreground"
              >
                <Link href={`/w/${workspace.slug}`}>{workspace.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-foreground">
                {pageLabel}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ── Right: User Nav ──────────────────────────────────────────── */}
      <div className="ml-auto flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Open user menu"
              className="rounded-full outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Avatar size="default">
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name ?? "User"} />
                ) : (
                  <AvatarFallback>{userInitials}</AvatarFallback>
                )}
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" sideOffset={8} className="w-56">
            {/* Identity block */}
            <DropdownMenuLabel className="flex flex-col gap-0.5 pb-2">
              <span className="truncate text-sm font-semibold text-foreground">
                {user.name ?? "User"}
              </span>
              {user.email && (
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {user.email}
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href={`/w/${workspace.slug}/profile`} className="gap-2">
                <User className="size-4 shrink-0 text-muted-foreground" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/w/${workspace.slug}/settings`} className="gap-2">
                <Settings className="size-4 shrink-0 text-muted-foreground" />
                Settings
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              asChild
              className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <Link href="/api/auth/signout">
                <LogOut className="size-4 shrink-0" />
                Sign out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
