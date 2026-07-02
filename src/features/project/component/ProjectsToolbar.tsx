"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, LayoutList, Kanban, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectStatus } from "@/generated/prisma";

interface ProjectsToolbarProps {
    slug: string;
    currentView: "table" | "kanban";
    currentSearch: string | undefined;
    currentStatus: ProjectStatus | undefined;
}

const STATUS_OPTIONS: { label: string; value: ProjectStatus }[] = [
    { label: "Draft", value: "DRAFT" },
    { label: "Active", value: "ACTIVE" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Archived", value: "ARCHIVED" },
];

export function ProjectsToolbar({
    slug,
    currentView,
    currentSearch,
    currentStatus,
}: ProjectsToolbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();

    const updateParam = useCallback(
        (key: string, value: string | null) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value === null) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
            startTransition(() => {
                router.push(`${pathname}?${params.toString()}`, { scroll: false });
            });
        },
        [pathname, router, searchParams],
    );

    return (
        <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                    id="project-search"
                    placeholder="Search projects..."
                    defaultValue={currentSearch ?? ""}
                    className="pl-9 h-9"
                    onChange={(e) => {
                        const val = e.target.value.trim();
                        updateParam("search", val.length > 0 ? val : null);
                    }}
                />
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-1.5">
                        {currentStatus
                            ? STATUS_OPTIONS.find((s) => s.value === currentStatus)?.label
                            : "All Statuses"}
                        <ChevronDown className="size-3.5 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                    <DropdownMenuCheckboxItem
                        checked={!currentStatus}
                        onCheckedChange={() => updateParam("status", null)}
                    >
                        All Statuses
                    </DropdownMenuCheckboxItem>
                    {STATUS_OPTIONS.map((opt) => (
                        <DropdownMenuCheckboxItem
                            key={opt.value}
                            checked={currentStatus === opt.value}
                            onCheckedChange={() =>
                                updateParam(
                                    "status",
                                    currentStatus === opt.value ? null : opt.value,
                                )
                            }
                        >
                            {opt.label}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-1 rounded-md border border-border p-0.5 ml-auto">
                <Button
                    variant={currentView === "table" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-2.5 gap-1.5"
                    onClick={() => updateParam("view", "table")}
                    aria-label="Table view"
                >
                    <LayoutList className="size-3.5" />
                    <span className="text-xs">Table</span>
                </Button>
                <Button
                    variant={currentView === "kanban" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-2.5 gap-1.5"
                    onClick={() => updateParam("view", "kanban")}
                    aria-label="Kanban view"
                >
                    <Kanban className="size-3.5" />
                    <span className="text-xs">Kanban</span>
                </Button>
            </div>
        </div>
    );
}
