"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format, differenceInHours } from "date-fns";
import { 
    GripVertical, 
    MoreHorizontal, 
    ArrowUpRight, 
    Pencil, 
    Archive,
    Calendar,
    ChevronDown,
    Minus,
    ChevronUp,
    ChevronsUp,
    Plus,
    Trash2
} from "lucide-react";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { archiveProject } from "@/features/project/action/archive-project";
import { updateProjectState } from "@/features/project/action/update-project-state";

import type { ProjectListItem } from "@/app/w/[slug]/(dashboard)/projects/page";
import type { ProjectStatus } from "@/generated/prisma";

interface ProjectKanbanProps {
    projects: ProjectListItem[];
    slug: string;
    memberRole: string;
    onStatusChange: (projectId: string, nextStatus: ProjectStatus) => void;
    onEditProject: (project: ProjectListItem) => void;
}

const COLUMNS: { status: ProjectStatus; label: string }[] = [
    { status: "DRAFT", label: "Draft" },
    { status: "ACTIVE", label: "Active" },
    { status: "COMPLETED", label: "Completed" },
    { status: "ARCHIVED", label: "Archived" },
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

export function ProjectKanban({ projects, slug, memberRole, onStatusChange, onEditProject }: ProjectKanbanProps) {
    const canArchive = memberRole === "ADMIN" || memberRole === "OWNER";
    const [, startTransition] = useTransition();

    const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
    const [archiveProjectId, setArchiveProjectId] = useState<string | null>(null);

    function handleDrop(e: React.DragEvent<HTMLDivElement>, targetStatus: ProjectStatus) {
        e.preventDefault();
        const projectId = e.dataTransfer.getData("projectId");
        if (!projectId) return;
        onStatusChange(projectId, targetStatus);
    }

    function handleDragStart(e: React.DragEvent<HTMLDivElement>, projectId: string) {
        e.dataTransfer.setData("projectId", projectId);
        e.dataTransfer.effectAllowed = "move";
    }

    const handleDelete = async () => {
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
    };

    const handleArchive = async () => {
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
    };

    return (
        <TooltipProvider delayDuration={150}>
            <div className="flex flex-1 h-[calc(100vh-220px)] w-full overflow-x-auto overflow-y-hidden gap-4 pb-4 items-start">
                {COLUMNS.map((col) => {
                    const colProjects = projects.filter((p) => p.status === col.status);
                    return (
                        <div
                            key={col.status}
                            className="flex flex-col w-[320px] shrink-0 max-h-full rounded-xl bg-muted/40 border p-3"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, col.status)}
                        >
                            <div className="flex items-center justify-between shrink-0 border-b pb-3 mb-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-sm text-foreground">{col.label}</h3>
                                    <span className="rounded-full bg-muted text-xs font-medium px-2 py-0.5 text-muted-foreground">
                                        {colProjects.length}
                                    </span>
                                </div>
                                {/* Note: Quick-Add action stubbed. Requires wiring to CreateProjectModal context/state. */}
                                <Button 
                                    className="size-7" 
                                    size="icon" 
                                    variant="ghost" 
                                    aria-label={`Create ${col.label.toLowerCase()} project`}
                                    onClick={() => toast.info("Quick-Add will be wired to the Create Modal in a future update.")}
                                >
                                    <Plus className="size-4" />
                                </Button>
                            </div>

                            <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto pr-1 min-h-0">
                                {colProjects.map((project) => {
                                    const lead = project.projectMembers.find(
                                        (m) => m.role === "LEAD",
                                    );
                                    const priority = PRIORITY_ICON[project.priority];
                                    const PriorityIcon = priority.icon;
                                    
                                    const hoursUntilDue = project.dueDate ? differenceInHours(new Date(project.dueDate), new Date()) : null;
                                    const isUrgentDate = hoursUntilDue !== null && hoursUntilDue <= 48;

                                    return (
                                        <div
                                            key={project.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, project.id)}
                                            className="group rounded-md border border-border bg-card p-3 shadow-xs cursor-grab active:cursor-grabbing hover:border-primary/30 hover:shadow-sm transition-all flex flex-col"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-start gap-1.5 min-w-0">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <PriorityIcon
                                                                className={cn("size-3.5 shrink-0 mt-0.5", priority.className)}
                                                                aria-hidden="true"
                                                            />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="text-xs">
                                                            {priority.label}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={`/w/${slug}/projects/${project.id}`}
                                                            className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug"
                                                        >
                                                            {project.title}
                                                        </Link>
                                                        <p className="text-xs font-medium text-muted-foreground mt-0.5 truncate">
                                                            {project.client.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center shrink-0">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-7 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
                                                                aria-label={`Actions for ${project.title}`}
                                                            >
                                                                <MoreHorizontal className="size-3.5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-44">
                                                            <DropdownMenuItem asChild>
                                                                <Link
                                                                    href={`/w/${slug}/projects/${project.id}`}
                                                                    aria-label={`View details for ${project.title}`}
                                                                >
                                                                    <ArrowUpRight className="size-3.5 mr-2" />
                                                                    View
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={() => onEditProject(project)}>
                                                                <Pencil className="size-3.5 mr-2" />
                                                                Edit Details
                                                            </DropdownMenuItem>
                                                            {canArchive && (
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
                                                    <GripVertical className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 mt-0.5 transition-colors cursor-grab active:cursor-grabbing" />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t mt-2">
                                                <div className="min-w-0 pr-2">
                                                    {project.dueDate ? (
                                                        <span className={cn(
                                                            "flex items-center gap-1 text-xs",
                                                            isUrgentDate ? "text-destructive font-medium" : "text-muted-foreground"
                                                        )}>
                                                            <Calendar className="size-3.5 shrink-0" />
                                                            <span className="truncate">{format(new Date(project.dueDate), "MMM d")}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground/50">No date</span>
                                                    )}
                                                </div>
                                                <div className="shrink-0">
                                                    {lead ? (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Avatar className="size-6">
                                                                    <AvatarImage src={lead.workspaceMember.user.image ?? undefined} />
                                                                    <AvatarFallback className="text-[10px]">
                                                                        {lead.workspaceMember.user.name?.charAt(0).toUpperCase() ?? "?"}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="text-xs">
                                                                {lead.workspaceMember.user.name ?? "Unknown"}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground/50">Unassigned</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {colProjects.length === 0 && (
                                    <div className="flex items-center justify-center h-full min-h-[120px]">
                                        <p className="text-xs text-muted-foreground/40">Drop here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

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
        </TooltipProvider>
    );
}
