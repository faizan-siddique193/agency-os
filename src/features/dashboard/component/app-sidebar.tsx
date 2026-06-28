"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Folder,
  ClipboardList,
  Users,
  UsersRound,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ─── Types ──────────────────────────────────────────────────────────────────

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface AppSidebarProps {
  workspace: { name: string; slug: string };
  role: string;
  user?: { name?: string | null; image?: string | null; email?: string | null };
}

// ─── Nav builder — pure function, no hooks needed here ──────────────────────

function buildNavItems(slug: string, role: string): NavItem[] {
  const base: NavItem[] = [
    { name: "Dashboard", href: `/w/${slug}/dashboard`, icon: LayoutDashboard },
    { name: "Projects",  href: `/w/${slug}/projects`, icon: Folder },
    { name: "Tasks",     href: `/w/${slug}/tasks`,    icon: ClipboardList },
    { name: "Clients",   href: `/w/${slug}/clients`,  icon: Users },
    { name: "Team",      href: `/w/${slug}/team`,     icon: UsersRound },
  ];

  // Settings is hidden entirely from the DOM for MEMBER role (security mandate)
  if (role !== "MEMBER") {
    base.push({ name: "Settings", href: `/w/${slug}/settings`, icon: Settings });
  }

  return base;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AppSidebar({ workspace, role, user }: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = buildNavItems(workspace.slug, role);

  const userInitials =
    user?.name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "A";

  return (
    <Sidebar>
      {/* ── Brand Header ─────────────────────────────────────────────── */}
      <SidebarHeader className="h-14 flex-row items-center gap-0 border-b border-border px-5 py-0">
        <div className="flex flex-col overflow-hidden leading-tight">
          <span className="truncate text-base font-bold tracking-tight text-sidebar-foreground">
            AgencyOS
          </span>
          <span className="truncate text-[11px] font-medium text-sidebar-foreground/50">
            Management Suite
          </span>
        </div>
      </SidebarHeader>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                // Exact match for the root dashboard, prefix match for nested routes
                // All nav items use prefix-match — no route is the bare /w/slug root anymore
              const isActive = pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground/65 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      }
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4 shrink-0" aria-hidden />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer — versioning + identity ───────────────────────────── */}
      <SidebarFooter className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <Avatar size="default" className="shrink-0">
            {user?.image ? (
              <AvatarImage src={user.image} alt={user.name ?? "User"} />
            ) : (
              <AvatarFallback>{userInitials}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col overflow-hidden leading-tight">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              Admin Terminal
            </span>
            <span className="truncate text-[11px] text-sidebar-foreground/50">
              v2.4.0-stable
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
