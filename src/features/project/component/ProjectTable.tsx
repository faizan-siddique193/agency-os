"use client";

import { useOptimistic, useTransition, useCallback, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    createColumnHelper,
    VisibilityState,
} from "@tanstack/react-table";
import {
    MoreHorizontal,
    ArrowUpRight,
    Pencil,
    Archive,
    Trash2,
    CalendarDays,
    DollarSign,
    AlertTriangle,
    Minus,
    ChevronUp,
    ChevronsUp,
    ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusBadge, HealthBadge } from "@/features/project/component/ProjectBadges";
import { updateProjectState } from "@/features/project/action/update-project-state";
import { archiveProject } from "@/features/project/action/archive-project";
import type { ProjectListItem } from "@/app/w/[slug]/(dashboard)/projects/page";
import type { ProjectStatus, ProjectHealth } from "@/generated/prisma";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectTableProps {
    projects: ProjectListItem[];
    slug: string;
    memberRole: string;
    onStatusChange: (projectId: string, nextStatus: ProjectStatus) => void;
    onEditProject: (project: ProjectListItem) => void;
    columnVisibility: VisibilityState;
    setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
}

type OptimisticField = "status" | "health";
type OptimisticAction =
    | { projectId: string; field: "status"; value: ProjectStatus }
    | { projectId: string; field: "health"; value: ProjectHealth };

// ─── Static config ────────────────────────────────────────────────────────────

const STATUS_CYCLE: ProjectStatus[] = ["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"];

const HEALTH_OPTIONS: { value: ProjectHealth; label: string }[] = [
    { value: "ON_TRACK", label: "On Track" },
    { value: "AT_RISK", label: "At Risk" },
    { value: "BLOCKED", label: "Blocked" },
];

const PRIORITY_ICON: Record<
    ProjectListItem["priority"],
    { icon: React.ElementType; className: string; label: string }
> = {
    LOW:    { icon: ChevronDown,  className: "text-slate-400",                      label: "Low priority" },
    MEDIUM: { icon: Minus,        className: "text-amber-500",                      label: "Medium priority" },
    HIGH:   { icon: ChevronUp,    className: "text-orange-500",                     label: "High priority" },
    URGENT: { icon: ChevronsUp,   className: "text-red-500",                        label: "Urgent priority" },
};

const canManage = (role: string) => role === "ADMIN" || role === "OWNER";

// ─── Optimistic reducer ───────────────────────────────────────────────────────

function tableOptimisticReducer(
    state: ProjectListItem[],
    action: OptimisticAction,
): ProjectListItem[] {
    return state.map((p) =>
        p.id === action.projectId ? { ...p, [action.field]: action.value } : p,
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectTable({
    projects,
    slug,
    memberRole,
    onStatusChange,
    onEditProject,
    columnVisibility,
    setColumnVisibility,
}: ProjectTableProps) {
    const [optimisticProjects, applyOptimistic] = useOptimistic(
        projects,
        tableOptimisticReducer,
    );
    const [, startTransition] = useTransition();

    const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
    const [archiveProjectId, setArchiveProjectId] = useState<string | null>(null);

    const handleHealthChange = useCallback(
        (projectId: string, nextHealth: ProjectHealth) => {
            startTransition(async () => {
                applyOptimistic({ projectId, field: "health", value: nextHealth });
                const result = await updateProjectState(slug, {
                    projectId,
                    field: "health",
                    value: nextHealth,
                });
                if (!result.success) {
                    const msg = "error" in result ? result.error : "Failed to update health.";
                    toast.error(msg ?? "Failed to update project health.");
                }
            });
        },
        [slug, applyOptimistic],
    );

    const handleDelete = useCallback(async () => {
        if (!deleteProjectId) return;
        startTransition(async () => {
            const result = await archiveProject(slug, { projectId: deleteProjectId });
            if (result.success) {
                toast.success("Project moved to trash.");
            } else {
                toast.error("error" in result ? result.error : "Failed to delete project.");
            }
            setDeleteProjectId(null);
        });
    }, [deleteProjectId, slug]);

    const handleArchive = useCallback(async () => {
        if (!archiveProjectId) return;
        startTransition(async () => {
            const result = await updateProjectState(slug, {
                projectId: archiveProjectId,
                field: "status",
                value: "ARCHIVED",
            });
            if (result.success) {
                toast.success("Project archived.");
            } else {
                toast.error("error" in result ? result.error : "Failed to archive project.");
            }
            setArchiveProjectId(null);
        });
    }, [archiveProjectId, slug]);

    const columnHelper = createColumnHelper<ProjectListItem>();

    const columns = [
        columnHelper.accessor("title", {
            id: "name",
            size: 360,
            minSize: 220,
            header: "Name",
            cell: (info) => {
                const project = info.row.original;
                const priority = PRIORITY_ICON[project.priority];
                const PriorityIcon = priority.icon;
                return (
                    <div className="flex items-center gap-1.5 w-full">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <PriorityIcon
                                    className={cn("size-3.5 shrink-0", priority.className)}
                                    aria-hidden="true"
                                />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                                {priority.label}
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    href={`/w/${slug}/projects/${project.id}`}
                                    className="font-medium text-sm text-foreground hover:text-primary transition-colors truncate block flex-1 text-left"
                                    aria-label={`Open project: ${project.title}`}
                                >
                                    {project.title}
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-[300px] break-words">
                                {project.title}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                );
            },
        }),
        columnHelper.accessor((row) => row.client.name, {
            id: "client",
            size: 140,
            header: "Client",
            cell: (info) => (
                <span className="text-sm text-muted-foreground">{info.getValue()}</span>
            ),
        }),
        columnHelper.accessor("status", {
            id: "status",
            size: 120,
            header: "Status",
            cell: (info) => {
                const project = info.row.original;
                return (
                    <button
                        onClick={() => {
                            const currentIdx = STATUS_CYCLE.indexOf(project.status);
                            const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
                            onStatusChange(project.id, nextStatus);
                        }}
                        className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full transition-opacity hover:opacity-75"
                        aria-label={`Status: ${project.status}. Click to cycle.`}
                        title="Click to cycle status"
                    >
                        <StatusBadge status={project.status} />
                    </button>
                );
            },
        }),
        columnHelper.accessor("health", {
            id: "health",
            size: 120,
            header: "Health",
            cell: (info) => {
                const project = info.row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md transition-all hover:opacity-75 cursor-pointer"
                                aria-label={`Health: ${project.health}. Click to change.`}
                                title="Click to change health"
                            >
                                <HealthBadge health={project.health} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-36">
                            {HEALTH_OPTIONS.map((opt) => (
                                <DropdownMenuItem
                                    key={opt.value}
                                    onSelect={() => handleHealthChange(project.id, opt.value)}
                                    className={cn(
                                        "text-xs gap-2",
                                        project.health === opt.value && "font-semibold",
                                    )}
                                >
                                    {project.health === opt.value && (
                                        <span
                                            className="size-1.5 rounded-full bg-foreground shrink-0"
                                            aria-hidden="true"
                                        />
                                    )}
                                    {opt.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }),
        columnHelper.accessor("lead", {
            id: "lead",
            size: 160,
            header: "Lead",
            cell: (info) => {
                const project = info.row.original;
                const lead = project.projectMembers.find((m) => m.role === "LEAD");
                if (!lead) return <span className="text-sm text-muted-foreground/50">Unassigned</span>;
                return (
                    <div className="flex items-center gap-2">
                        <Avatar className="size-7 shrink-0">
                            <AvatarImage src={lead.workspaceMember.user.image ?? undefined} />
                            <AvatarFallback className="text-[10px]">
                                {lead.workspaceMember.user.name?.charAt(0).toUpperCase() ?? "?"}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{lead.workspaceMember.user.name ?? "—"}</span>
                    </div>
                );
            },
        }),
        columnHelper.accessor("dueDate", {
            id: "dueDate",
            size: 130,
            header: "Due Date",
            cell: (info) => {
                const val = info.getValue();
                if (!val) return <span className="text-sm text-muted-foreground/50">—</span>;
                return (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarDays className="size-3.5 shrink-0" />
                        {format(new Date(val), "MMM d, yyyy")}
                    </div>
                );
            },
        }),
        columnHelper.accessor("budget", {
            id: "budget",
            size: 110,
            header: "Budget",
            cell: (info) => {
                const val = info.getValue();
                if (val == null) return <span className="text-sm text-muted-foreground/50">—</span>;
                return (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground font-mono">
                        <DollarSign className="size-3 shrink-0" />
                        {(val / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </div>
                );
            },
        }),
        columnHelper.display({
            id: "actions",
            size: 50,
            header: "",
            cell: (info) => {
                const project = info.row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
                                aria-label={`Actions for ${project.title}`}
                            >
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem asChild>
                                <Link href={`/w/${slug}/projects/${project.id}`}>
                                    <ArrowUpRight className="size-3.5 mr-2" />
                                    View
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onEditProject(project)}>
                                <Pencil className="size-3.5 mr-2" />
                                Edit Details
                            </DropdownMenuItem>
                            {canManage(memberRole) && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => setArchiveProjectId(project.id)}>
                                        <Archive className="size-3.5 mr-2" />
                                        Archive Project
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={() => setDeleteProjectId(project.id)}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="size-3.5 mr-2" />
                                        Delete Project
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }),
    ];

    const table = useReactTable({
        data: optimisticProjects,
        columns,
        state: {
            columnVisibility,
        },
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <>
            <TooltipProvider delayDuration={150}>
                <div className="w-full overflow-x-auto rounded-md border bg-card">
                    <Table className="w-full table-fixed min-w-[800px]">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="bg-muted/30 hover:bg-muted/30">
                                    {headerGroup.headers.map((header) => {
                                        const isSticky = header.column.id === "name";
                                        return (
                                            <TableHead
                                                key={header.id}
                                                style={{ width: `${header.getSize()}px` }}
                                                className={cn(
                                                    "font-medium text-xs text-muted-foreground uppercase tracking-wide",
                                                    isSticky &&
                                                        "sticky left-0 z-20 bg-muted/30 after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border",
                                                )}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext(),
                                                      )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} className="group">
                                        {row.getVisibleCells().map((cell) => {
                                            const isSticky = cell.column.id === "name";
                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    style={{ width: `${cell.column.getSize()}px` }}
                                                    className={cn(
                                                        isSticky &&
                                                            "sticky left-0 z-10 bg-background group-hover:bg-muted/50 after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border",
                                                    )}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext(),
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No projects found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </TooltipProvider>

            <AlertDialog open={!!deleteProjectId} onOpenChange={(open) => !open && setDeleteProjectId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                            This project will be moved to the trash and removed from your active workspace view. Are you sure you want to continue?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!archiveProjectId} onOpenChange={(open) => !open && setArchiveProjectId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive Project</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will move the project out of your active pipeline. You can restore it later if needed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleArchive}>
                            Archive
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
