"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
    MoreHorizontal,
    ArrowUpRight,
    Pencil,
    Archive,
    CalendarDays,
    DollarSign,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge, HealthBadge, PriorityBadge } from "@/features/project/component/ProjectBadges";
import { updateProjectState } from "@/features/project/action/update-project-state";
import type { ProjectListItem } from "@/app/w/[slug]/(dashboard)/projects/page";
import type { ProjectStatus } from "@/generated/prisma";

interface ProjectTableProps {
    projects: ProjectListItem[];
    slug: string;
    memberRole: string;
}

const STATUS_CYCLE: ProjectStatus[] = ["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"];

export function ProjectTable({ projects, slug, memberRole }: ProjectTableProps) {
    const [optimisticProjects, applyOptimistic] = useOptimistic(
        projects,
        (
            state: ProjectListItem[],
            update: { projectId: string; field: "status"; value: ProjectStatus },
        ) =>
            state.map((p) =>
                p.id === update.projectId ? { ...p, [update.field]: update.value } : p,
            ),
    );
    const [, startTransition] = useTransition();

    const canArchive = memberRole === "ADMIN" || memberRole === "OWNER";

    function handleStatusCycle(project: ProjectListItem) {
        const currentIdx = STATUS_CYCLE.indexOf(project.status);
        const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
        startTransition(async () => {
            applyOptimistic({ projectId: project.id, field: "status", value: nextStatus });
            await updateProjectState(slug, {
                projectId: project.id,
                field: "status",
                value: nextStatus,
            });
        });
    }

    return (
        <div className="rounded-lg border border-border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="w-[280px] font-medium text-xs text-muted-foreground uppercase tracking-wide">
                            Name
                        </TableHead>
                        <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
                            Client
                        </TableHead>
                        <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
                            Status
                        </TableHead>
                        <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
                            Health
                        </TableHead>
                        <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
                            Lead
                        </TableHead>
                        <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
                            Due Date
                        </TableHead>
                        <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
                            Budget
                        </TableHead>
                        <TableHead className="w-12" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {optimisticProjects.map((project) => {
                        const lead = project.projectMembers.find((m) => m.role === "LEAD");
                        return (
                            <TableRow key={project.id} className="group">
                                <TableCell>
                                    <Link
                                        href={`/w/${slug}/projects/${project.id}`}
                                        className="font-medium text-sm text-foreground hover:text-primary transition-colors"
                                    >
                                        {project.title}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {project.client.name}
                                </TableCell>
                                <TableCell>
                                    <button
                                        onClick={() => handleStatusCycle(project)}
                                        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full transition-opacity hover:opacity-80"
                                        aria-label={`Status: ${project.status}. Click to cycle.`}
                                        title="Click to cycle status"
                                    >
                                        <StatusBadge status={project.status} />
                                    </button>
                                </TableCell>
                                <TableCell>
                                    <HealthBadge health={project.health} />
                                </TableCell>
                                <TableCell>
                                    {lead ? (
                                        <div className="flex items-center gap-2">
                                            <Avatar className="size-7">
                                                <AvatarImage
                                                    src={lead.workspaceMember.user.image ?? undefined}
                                                    alt={lead.workspaceMember.user.name ?? "Lead"}
                                                />
                                                <AvatarFallback className="text-[10px]">
                                                    {lead.workspaceMember.user.name
                                                        ?.charAt(0)
                                                        .toUpperCase() ?? "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm text-muted-foreground truncate max-w-[100px]">
                                                {lead.workspaceMember.user.name ?? "—"}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground/50">Unassigned</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {project.dueDate ? (
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <CalendarDays className="size-3.5 shrink-0" />
                                            {format(new Date(project.dueDate), "MMM d, yyyy")}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground/50">—</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {project.budget != null ? (
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground font-mono">
                                            <DollarSign className="size-3 shrink-0" />
                                            {(project.budget / 100).toLocaleString("en-US", {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                            })}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground/50">—</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                aria-label="Row actions"
                                            >
                                                <MoreHorizontal className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/w/${slug}/projects/${project.id}`}>
                                                    <ArrowUpRight className="size-3.5 mr-2" />
                                                    View
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    href={`/w/${slug}/projects/${project.id}?tab=settings`}
                                                >
                                                    <Pencil className="size-3.5 mr-2" />
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            {canArchive && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/w/${slug}/projects/${project.id}?tab=settings`}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Archive className="size-3.5 mr-2" />
                                                            Archive
                                                        </Link>
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
