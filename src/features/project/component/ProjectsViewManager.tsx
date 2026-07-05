"use client";

import { useState, useMemo, useOptimistic, useTransition, useCallback, useEffect } from "react";
import { Search, LayoutList, Kanban, ChevronDown, X, Columns } from "lucide-react";
import { toast } from "sonner";
import type { VisibilityState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectTable } from "@/features/project/component/ProjectTable";
import { ProjectKanban } from "@/features/project/component/ProjectKanban";
import { ProjectEmptyState } from "@/features/project/component/ProjectEmptyState";
import { EditProjectDialog } from "@/features/project/component/EditProjectDialog";
import { updateProjectState } from "@/features/project/action/update-project-state";
import type { ProjectListItem } from "@/app/w/[slug]/(dashboard)/projects/page";
import type { ProjectStatus, ProjectPriority } from "@/generated/prisma";


// types

interface ProjectsViewManagerProps {
    /** Full sanitized project array from the Server Component. */
    projects: ProjectListItem[];
    /** Clients for the empty-state modal combobox. */
    clients: { id: string; name: string }[];
    slug: string;
    memberRole: string;
}

type ViewMode = "table" | "kanban";

type OptimisticAction = { projectId: string; status: ProjectStatus };

// static data

const STATUS_OPTIONS: { label: string; value: ProjectStatus }[] = [
    { label: "Draft", value: "DRAFT" },
    { label: "Active", value: "ACTIVE" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Archived", value: "ARCHIVED" },
];

const PRIORITY_OPTIONS: { label: string; value: ProjectPriority }[] = [
    { label: "Low", value: "LOW" },
    { label: "Medium", value: "MEDIUM" },
    { label: "High", value: "HIGH" },
    { label: "Urgent", value: "URGENT" },
];

// ─── Optimistic reducer ───────────────────────────────────────────────────────

function projectsOptimisticReducer(
    state: ProjectListItem[],
    action: OptimisticAction,
): ProjectListItem[] {
    return state.map((p) =>
        p.id === action.projectId ? { ...p, status: action.status } : p,
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectsViewManager({
    projects,
    clients,
    slug,
    memberRole,
}: ProjectsViewManagerProps) {
    // ── View state — pure local, zero server round-trips on toggle ─────────────
    const [view, setView] = useState<ViewMode>("table");

    // ── Filter state — drives useMemo, never touches the network ──────────────
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | null>(null);
    const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | null>(null);

    // ── Dialog state ──────────────────────────────────────────────────────────
    const [editingProject, setEditingProject] = useState<ProjectListItem | null>(null);

    // ── Column Visibility State ───────────────────────────────────────────────
    const STORAGE_KEY = "agencyos-projects-col-visibility";
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        lead: false,
        budget: false,
    });

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setColumnVisibility(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to load column preferences", e);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
        }
    }, [columnVisibility]);

    // ── Lifted optimistic state ────────────────────────────────────────────────
    // Lives here so toggling Table ↔ Kanban preserves in-flight optimistic updates.
    const [optimisticProjects, applyOptimistic] = useOptimistic(
        projects,
        projectsOptimisticReducer,
    );
    const [, startTransition] = useTransition();

    // ── In-memory filtering (<5ms for up to 200 projects) ─────────────────────
    const filteredProjects = useMemo<ProjectListItem[]>(() => {
        let result = optimisticProjects;

        if (search.trim().length > 0) {
            const q = search.toLowerCase();
            result = result.filter(
                (p) =>
                    p.title.toLowerCase().includes(q) ||
                    p.client.name.toLowerCase().includes(q),
            );
        }

        if (statusFilter !== null) {
            result = result.filter((p) => p.status === statusFilter);
        }

        if (priorityFilter !== null) {
            result = result.filter((p) => p.priority === priorityFilter);
        }

        return result;
    }, [optimisticProjects, search, statusFilter, priorityFilter]);

    // ── Single mutation handler — both Table and Kanban delegate here ──────────
    const handleStatusChange = useCallback(
        (projectId: string, nextStatus: ProjectStatus): void => {
            startTransition(async () => {
                // 1. Instant DOM update (0ms perceived latency)
                applyOptimistic({ projectId, status: nextStatus });

                // 2. Background server action (PBAC-gated, writes to DB, revalidates cache)
                const result = await updateProjectState(slug, {
                    projectId,
                    field: "status",
                    value: nextStatus,
                });

                // 3. On failure — React automatically rolls back the optimistic update
                //    when the transition ends, so we just surface the error.
                if (!result.success) {
                    const message =
                        "error" in result
                            ? result.error
                            : "Validation failed. Please try again.";
                    toast.error(message ?? "Failed to update project status.");
                }
            });
        },
        [slug, applyOptimistic],
    );

    // ── Derived filter label helpers ───────────────────────────────────────────
    const activeFilterCount =
        (search.trim().length > 0 ? 1 : 0) +
        (statusFilter !== null ? 1 : 0) +
        (priorityFilter !== null ? 1 : 0);

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-[calc(100vh-220px)] overflow-hidden gap-4 min-w-0">
            {/* ── Inline Toolbar ──────────────────────────────────────────── */}
            <div className="flex items-center gap-3 w-full min-w-0 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-0 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                        id="project-search"
                        placeholder="Search by name or client..."
                        value={search}
                        className="pl-9 h-9"
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search projects"
                    />
                    {search.length > 0 && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Clear search"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Status filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 gap-1.5"
                                aria-label="Filter by status"
                            >
                                {statusFilter
                                    ? STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label
                                    : "All Statuses"}
                                <ChevronDown className="size-3.5 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-44">
                            <DropdownMenuCheckboxItem
                                checked={statusFilter === null}
                                onCheckedChange={() => setStatusFilter(null)}
                            >
                                All Statuses
                            </DropdownMenuCheckboxItem>
                            {STATUS_OPTIONS.map((opt) => (
                                <DropdownMenuCheckboxItem
                                    key={opt.value}
                                    checked={statusFilter === opt.value}
                                    onCheckedChange={() =>
                                        setStatusFilter(
                                            statusFilter === opt.value ? null : opt.value,
                                        )
                                    }
                                >
                                    {opt.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Priority filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 gap-1.5"
                                aria-label="Filter by priority"
                            >
                                {priorityFilter
                                    ? PRIORITY_OPTIONS.find((p) => p.value === priorityFilter)?.label
                                    : "All Priorities"}
                                <ChevronDown className="size-3.5 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-44">
                            <DropdownMenuCheckboxItem
                                checked={priorityFilter === null}
                                onCheckedChange={() => setPriorityFilter(null)}
                            >
                                All Priorities
                            </DropdownMenuCheckboxItem>
                            {PRIORITY_OPTIONS.map((opt) => (
                                <DropdownMenuCheckboxItem
                                    key={opt.value}
                                    checked={priorityFilter === opt.value}
                                    onCheckedChange={() =>
                                        setPriorityFilter(
                                            priorityFilter === opt.value ? null : opt.value,
                                        )
                                    }
                                >
                                    {opt.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Clear all filters */}
                    {activeFilterCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                                setSearch("");
                                setStatusFilter(null);
                                setPriorityFilter(null);
                            }}
                        >
                            <X className="size-3.5" />
                            Clear ({activeFilterCount})
                        </Button>
                    )}

                    {view === "table" && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 gap-1.5 ml-2"
                                    aria-label="Toggle columns"
                                >
                                    <Columns className="size-3.5 text-muted-foreground" />
                                    Columns
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuCheckboxItem
                                    checked={columnVisibility.lead !== false}
                                    onCheckedChange={(checked) =>
                                        setColumnVisibility((prev) => ({ ...prev, lead: checked }))
                                    }
                                >
                                    Lead
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={columnVisibility.budget !== false}
                                    onCheckedChange={(checked) =>
                                        setColumnVisibility((prev) => ({ ...prev, budget: checked }))
                                    }
                                >
                                    Budget
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* View toggle — pure local state, zero server calls */}
                    <div className="flex items-center gap-1 rounded-md border border-border p-0.5 ml-auto shrink-0">
                    <Button
                        variant={view === "table" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 px-2.5 gap-1.5"
                        onClick={() => setView("table")}
                        aria-label="Table view"
                        aria-pressed={view === "table"}
                    >
                        <LayoutList className="size-3.5" />
                        <span className="text-xs">Table</span>
                    </Button>
                    <Button
                        variant={view === "kanban" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 px-2.5 gap-1.5"
                        onClick={() => setView("kanban")}
                        aria-label="Kanban view"
                        aria-pressed={view === "kanban"}
                    >
                        <Kanban className="size-3.5" />
                        <span className="text-xs">Kanban</span>
                    </Button>
                </div>
            </div>
        </div>

        {/* ── View Content ─────────────────────────────────────────────── */}
            <div className="flex-1 min-h-0 overflow-hidden min-w-0 flex flex-col">
                {filteredProjects.length === 0 && projects.length === 0 ? (
                    // True empty — no projects exist at all
                    <ProjectEmptyState
                        slug={slug}
                        memberRole={memberRole}
                        clients={clients}
                    />
                ) : filteredProjects.length === 0 ? (
                    // Filter produced zero results — show a lighter "no results" state
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/10 py-16 text-center">
                        <Search className="size-8 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            No projects match your filters
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-3 text-xs"
                            onClick={() => {
                                setSearch("");
                                setStatusFilter(null);
                                setPriorityFilter(null);
                            }}
                        >
                            Clear filters
                        </Button>
                    </div>
                ) : view === "table" ? (
                    <ProjectTable
                        projects={filteredProjects}
                        slug={slug}
                        memberRole={memberRole}
                        onStatusChange={handleStatusChange}
                        onEditProject={setEditingProject}
                        columnVisibility={columnVisibility}
                        setColumnVisibility={setColumnVisibility}
                    />
                ) : (
                    <ProjectKanban
                        projects={filteredProjects}
                        slug={slug}
                        memberRole={memberRole}
                        onStatusChange={handleStatusChange}
                        onEditProject={setEditingProject}
                    />
                )}
            </div>

            {editingProject && (
                <EditProjectDialog
                    project={editingProject}
                    slug={slug}
                    clients={clients}
                    open={!!editingProject}
                    onOpenChange={(v) => !v && setEditingProject(null)}
                />
            )}
        </div>
    );
}
