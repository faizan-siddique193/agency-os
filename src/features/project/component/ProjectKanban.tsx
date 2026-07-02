"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { GripVertical } from "lucide-react";
import { StatusBadge } from "@/features/project/component/ProjectBadges";
import { updateProjectState } from "@/features/project/action/update-project-state";
import type { ProjectListItem } from "@/app/w/[slug]/(dashboard)/projects/page";
import type { ProjectStatus } from "@/generated/prisma";

interface ProjectKanbanProps {
    projects: ProjectListItem[];
    slug: string;
    memberRole: string;
}

const COLUMNS: { status: ProjectStatus; label: string }[] = [
    { status: "DRAFT", label: "Draft" },
    { status: "ACTIVE", label: "Active" },
    { status: "COMPLETED", label: "Completed" },
    { status: "ARCHIVED", label: "Archived" },
];

export function ProjectKanban({ projects, slug, memberRole }: ProjectKanbanProps) {
    const [optimisticProjects, applyOptimistic] = useOptimistic(
        projects,
        (
            state: ProjectListItem[],
            update: { projectId: string; status: ProjectStatus },
        ) =>
            state.map((p) =>
                p.id === update.projectId ? { ...p, status: update.status } : p,
            ),
    );
    const [, startTransition] = useTransition();

    function handleDrop(e: React.DragEvent<HTMLDivElement>, targetStatus: ProjectStatus) {
        e.preventDefault();
        const projectId = e.dataTransfer.getData("projectId");
        if (!projectId) return;
        startTransition(async () => {
            applyOptimistic({ projectId, status: targetStatus });
            await updateProjectState(slug, {
                projectId,
                field: "status",
                value: targetStatus,
            });
        });
    }

    function handleDragStart(e: React.DragEvent<HTMLDivElement>, projectId: string) {
        e.dataTransfer.setData("projectId", projectId);
        e.dataTransfer.effectAllowed = "move";
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-0.5 px-0.5">
            {COLUMNS.map((col) => {
                const colProjects = optimisticProjects.filter(
                    (p) => p.status === col.status,
                );
                return (
                    <div
                        key={col.status}
                        className="flex flex-col gap-3 min-w-[280px] max-w-[280px]"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, col.status)}
                    >
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <StatusBadge status={col.status} />
                                <span className="text-xs font-medium text-muted-foreground">
                                    {colProjects.length}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 min-h-[200px] rounded-lg bg-muted/30 border border-border p-2">
                            {colProjects.map((project) => {
                                const lead = project.projectMembers.find(
                                    (m) => m.role === "LEAD",
                                );
                                return (
                                    <div
                                        key={project.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, project.id)}
                                        className="group rounded-md border border-border bg-card p-3 shadow-xs cursor-grab active:cursor-grabbing hover:border-primary/30 hover:shadow-sm transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <Link
                                                href={`/w/${slug}/projects/${project.id}`}
                                                className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug"
                                            >
                                                {project.title}
                                            </Link>
                                            <GripVertical className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 mt-0.5 transition-colors" />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1.5">
                                            {project.client.name}
                                        </p>
                                        {project.dueDate && (
                                            <p className="text-xs text-muted-foreground/70 mt-2">
                                                Due{" "}
                                                {format(new Date(project.dueDate), "MMM d")}
                                            </p>
                                        )}
                                        {lead && (
                                            <p className="text-xs text-muted-foreground mt-1.5 truncate">
                                                {lead.workspaceMember.user.name ?? "Unknown"}
                                            </p>
                                        )}
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
    );
}
