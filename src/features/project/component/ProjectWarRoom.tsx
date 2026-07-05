"use client";

import { useState, useTransition, useRef, useOptimistic, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
    CalendarDays,
    DollarSign,
    Activity,
    Users,
    Loader2,
    AlertTriangle,
    ChevronsUpDown,
    MoreHorizontal,
    Pencil,
    Archive,
    Check,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { StatusBadge, HealthBadge, PriorityBadge } from "@/features/project/component/ProjectBadges";
import { updateProjectDetails } from "@/features/project/action/update-project-details";
import { updateProjectState } from "@/features/project/action/update-project-state";
import { archiveProject } from "@/features/project/action/archive-project";
import type { ProjectDetail } from "@/app/w/[slug]/(dashboard)/projects/[projectId]/page";
import type { ProjectStatus, ProjectHealth } from "@/generated/prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectWarRoomProps {
    project: ProjectDetail;
    slug: string;
    memberRole: string;
    currentMemberId: string;
    workspaceMembers: {
        id: string;
        role: string;
        user: { id: string; name: string | null; image: string | null; email: string | null };
    }[];
}

type OptimisticAction =
    | { field: "status"; value: ProjectStatus }
    | { field: "health"; value: ProjectHealth };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const canManage = (role: string) => role === "OWNER" || role === "ADMIN";

const STATUS_CYCLE: ProjectStatus[] = ["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"];

const HEALTH_OPTIONS: { value: ProjectHealth; label: string }[] = [
    { value: "ON_TRACK", label: "On Track" },
    { value: "AT_RISK", label: "At Risk" },
    { value: "BLOCKED", label: "Blocked" },
];

// ─── Root component ───────────────────────────────────────────────────────────

export function ProjectWarRoom({
    project,
    slug,
    memberRole,
    currentMemberId,
    workspaceMembers,
}: ProjectWarRoomProps) {
    const searchParams = useSearchParams();
    // Only allow "overview" and "people" — settings tab is removed
    const rawTab = searchParams.get("tab");
    const defaultTab = rawTab === "people" ? "people" : "overview";

    const manageable = canManage(memberRole);
    const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);

    // ── Optimistic state for status / health mutations in the header ──────────
    const [, startTransition] = useTransition();
    const [optimisticProject, applyOptimistic] = useOptimistic(
        project,
        (state: ProjectDetail, action: OptimisticAction) => ({
            ...state,
            [action.field]: action.value,
        }),
    );

    const handleStatusCycle = useCallback(() => {
        const idx = STATUS_CYCLE.indexOf(optimisticProject.status);
        const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
        startTransition(async () => {
            applyOptimistic({ field: "status", value: next });
            const result = await updateProjectState(slug, {
                projectId: project.id,
                field: "status",
                value: next,
            });
            if (!result.success && "error" in result) {
                toast.error(result.error ?? "Failed to update status.");
            }
        });
    }, [slug, project.id, optimisticProject.status, applyOptimistic]);

    const handleHealthChange = useCallback(
        (next: ProjectHealth) => {
            startTransition(async () => {
                applyOptimistic({ field: "health", value: next });
                const result = await updateProjectState(slug, {
                    projectId: project.id,
                    field: "health",
                    value: next,
                });
                if (!result.success && "error" in result) {
                    toast.error(result.error ?? "Failed to update health.");
                }
            });
        },
        [slug, project.id, applyOptimistic],
    );

    return (
        <div className="flex flex-col gap-6">
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
                            {optimisticProject.title}
                        </h1>
                        {/* Click-to-cycle status badge */}
                        <button
                            onClick={handleStatusCycle}
                            className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full hover:opacity-75 transition-opacity shrink-0"
                            aria-label={`Status: ${optimisticProject.status}. Click to cycle.`}
                            title="Click to cycle status"
                        >
                            <StatusBadge status={optimisticProject.status} />
                        </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {project.client.name}
                        {project.client.contactName ? ` · ${project.client.contactName}` : ""}
                    </p>
                </div>

                {/* Right header cluster: health + priority + actions menu */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Interactive health dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md hover:opacity-75 transition-opacity cursor-pointer"
                                aria-label={`Health: ${optimisticProject.health}. Click to change.`}
                            >
                                <HealthBadge health={optimisticProject.health} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                            {HEALTH_OPTIONS.map((opt) => (
                                <DropdownMenuItem
                                    key={opt.value}
                                    onSelect={() => handleHealthChange(opt.value)}
                                    className={cn(
                                        "text-xs gap-2",
                                        optimisticProject.health === opt.value && "font-semibold",
                                    )}
                                    aria-current={
                                        optimisticProject.health === opt.value ? "true" : undefined
                                    }
                                >
                                    {optimisticProject.health === opt.value && (
                                        <Check className="size-3 shrink-0" aria-hidden="true" />
                                    )}
                                    {opt.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <PriorityBadge priority={optimisticProject.priority} />

                    {/* Project actions menu (replaces the Settings tab) */}
                    {manageable && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8"
                                    aria-label="Project actions"
                                >
                                    <MoreHorizontal className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem onSelect={() => setRenameDialogOpen(true)}>
                                    <Pencil className="size-3.5 mr-2" />
                                    Rename Project
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onSelect={() => setArchiveDialogOpen(true)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Archive className="size-3.5 mr-2" />
                                    Archive Project
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* ── Tabs (Settings removed — actions moved to header menu) ──── */}
            <Tabs defaultValue={defaultTab} className="flex flex-col gap-0">
                <TabsList className="w-fit rounded-none border-b border-border bg-transparent p-0 gap-0 h-auto">
                    <TabsTrigger
                        value="overview"
                        className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium text-muted-foreground data-[state=active]:text-foreground"
                    >
                        <Activity className="size-3.5 mr-1.5" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="people"
                        className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium text-muted-foreground data-[state=active]:text-foreground"
                    >
                        <Users className="size-3.5 mr-1.5" />
                        People
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                    <OverviewTab project={project} slug={slug} />
                </TabsContent>

                <TabsContent value="people" className="mt-6">
                    <PeopleTab
                        project={project}
                        slug={slug}
                        workspaceMembers={workspaceMembers}
                        manageable={manageable}
                    />
                </TabsContent>
            </Tabs>

            {/* ── Dialogs (mounted at root to avoid z-index issues) ──────── */}
            {manageable && (
                <>
                    <RenameDialog
                        project={project}
                        slug={slug}
                        open={renameDialogOpen}
                        onOpenChange={setRenameDialogOpen}
                    />
                    <ArchiveDialog
                        project={project}
                        slug={slug}
                        open={archiveDialogOpen}
                        onOpenChange={setArchiveDialogOpen}
                    />
                </>
            )}
        </div>
    );
}

// ─── Overview Tab — inline-editable cards ─────────────────────────────────────

function OverviewTab({ project, slug }: { project: ProjectDetail; slug: string }) {
    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <BudgetCard project={project} slug={slug} />
                <DateCard
                    project={project}
                    slug={slug}
                    field="startDate"
                    label="Start Date"
                />
                <DateCard
                    project={project}
                    slug={slug}
                    field="dueDate"
                    label="Due Date"
                />
            </div>

            {project.description && (
                <div className="rounded-lg border border-border bg-card p-5">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                        Description
                    </h3>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {project.description}
                    </p>
                </div>
            )}

            <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Timeline
                </h3>
                <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                    <span>Created {format(new Date(project.createdAt), "MMM d, yyyy")}</span>
                    <span>
                        Last updated{" "}
                        {format(new Date(project.updatedAt), "MMM d, yyyy 'at' HH:mm")}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ── Inline Budget Card ────────────────────────────────────────────────────────

function BudgetCard({ project, slug }: { project: ProjectDetail; slug: string }) {
    const [editing, setEditing] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const initialValue = project.budget != null ? project.budget / 100 : "";
    const displayValue =
        project.budget != null
            ? `$${(project.budget / 100).toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
              })}`
            : null;

    function startEdit() {
        setEditing(true);
        setTimeout(() => inputRef.current?.select(), 0);
    }

    function cancelEdit() {
        setEditing(false);
        if (inputRef.current) inputRef.current.value = String(initialValue);
    }

    async function commitEdit() {
        if (!inputRef.current) return;
        const raw = inputRef.current.value.trim();
        
        // Dirty state guard
        if (raw === String(initialValue)) {
            setEditing(false);
            return;
        }

        const parsed = raw === "" ? null : Number(raw);
        if (parsed !== null && (isNaN(parsed) || parsed < 0)) {
            toast.error("Budget must be a positive number.");
            inputRef.current.focus();
            return;
        }

        setEditing(false);
        setIsPending(true);
        try {
            const result = await updateProjectDetails(slug, {
                projectId: project.id,
                title: project.title,
                description: project.description,
                dueDate: project.dueDate
                    ? format(new Date(project.dueDate), "yyyy-MM-dd")
                    : null,
                budget: parsed,
            });
            if (result.success) {
                toast.success("Budget updated.");
            } else {
                toast.error(
                    "error" in result
                        ? result.error
                        : "Failed to update budget.",
                );
            }
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-1.5 group/card">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <DollarSign className="size-3.5" />
                Budget
                {isPending && <Loader2 className="size-3 animate-spin ml-auto" />}
            </div>
            {editing ? (
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="number"
                        min={0}
                        step={1}
                        defaultValue={initialValue}
                        placeholder="e.g. 15000"
                        className="text-lg font-semibold text-foreground bg-transparent border-b border-primary focus:outline-none w-full py-0.5"
                        onBlur={cancelEdit} // Does NOT commit on blur for financial fields
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                commitEdit();
                            }
                            if (e.key === "Escape") {
                                e.preventDefault();
                                cancelEdit();
                            }
                        }}
                        aria-label="Edit budget"
                        autoFocus
                    />
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-7 text-primary hover:text-primary hover:bg-primary/10 shrink-0"
                        onClick={commitEdit}
                        onMouseDown={(e) => e.preventDefault()} // prevent blur
                        aria-label="Save budget"
                    >
                        <Check className="size-4" />
                    </Button>
                </div>
            ) : (
                <button
                    onClick={startEdit}
                    className={cn(
                        "text-lg font-semibold text-left w-full focus:outline-none focus-visible:underline focus-visible:decoration-dotted",
                        displayValue
                            ? "text-foreground hover:text-primary transition-colors"
                            : "text-muted-foreground/50 hover:text-muted-foreground transition-colors",
                    )}
                    aria-label={
                        displayValue ? `Budget: ${displayValue}. Click to edit.` : "Set budget"
                    }
                    title="Click to edit budget"
                >
                    {displayValue ?? "Not set"}
                </button>
            )}
        </div>
    );
}

// ── Inline Date Card ──────────────────────────────────────────────────────────

function DateCard({
    project,
    slug,
    field,
    label,
}: {
    project: ProjectDetail;
    slug: string;
    field: "startDate" | "dueDate";
    label: string;
}) {
    const [editing, setEditing] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const rawDate = project[field];
    const initialValue = rawDate ? format(new Date(rawDate), "yyyy-MM-dd") : "";
    const displayValue = rawDate
        ? format(new Date(rawDate), "MMM d, yyyy")
        : null;

    function startEdit() {
        setEditing(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    }

    function cancelEdit() {
        setEditing(false);
        if (inputRef.current) inputRef.current.value = initialValue;
    }

    async function commitEdit() {
        if (!inputRef.current) return;
        const val = inputRef.current.value; // "YYYY-MM-DD" or ""
        
        // Dirty state guard
        if (val === initialValue) {
            setEditing(false);
            return;
        }

        setEditing(false);
        setIsPending(true);
        try {
            const payload: Parameters<typeof updateProjectDetails>[1] = {
                projectId: project.id,
                title: project.title,
                description: project.description,
                budget: project.budget != null ? project.budget / 100 : null,
                dueDate:
                    field === "dueDate"
                        ? val || null
                        : project.dueDate
                          ? format(new Date(project.dueDate), "yyyy-MM-dd")
                          : null,
            };

            if (field === "startDate") {
                toast.info("Start date editing is coming in a future update.");
                setIsPending(false);
                return;
            }

            const result = await updateProjectDetails(slug, payload);
            if (result.success) {
                toast.success(`${label} updated.`);
            } else {
                toast.error(
                    "error" in result
                        ? result.error
                        : `Failed to update ${label}.`,
                );
            }
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-1.5 group/card">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <CalendarDays className="size-3.5" />
                {label}
                {isPending && <Loader2 className="size-3 animate-spin ml-auto" />}
            </div>
            {editing ? (
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="date"
                        defaultValue={initialValue}
                        className="text-lg font-semibold text-foreground bg-transparent border-b border-primary focus:outline-none w-full py-0.5"
                        onBlur={cancelEdit}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                commitEdit();
                            }
                            if (e.key === "Escape") {
                                e.preventDefault();
                                cancelEdit();
                            }
                        }}
                        aria-label={`Edit ${label}`}
                    />
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-7 text-primary hover:text-primary hover:bg-primary/10 shrink-0"
                        onClick={commitEdit}
                        onMouseDown={(e) => e.preventDefault()} // prevent blur
                        aria-label={`Save ${label}`}
                    >
                        <Check className="size-4" />
                    </Button>
                </div>
            ) : (
                <button
                    onClick={startEdit}
                    className={cn(
                        "text-lg font-semibold text-left w-full focus:outline-none focus-visible:underline focus-visible:decoration-dotted",
                        displayValue
                            ? "text-foreground hover:text-primary transition-colors"
                            : "text-muted-foreground/50 hover:text-muted-foreground transition-colors",
                    )}
                    aria-label={
                        displayValue
                            ? `${label}: ${displayValue}. Click to edit.`
                            : `Set ${label}`
                    }
                    title={`Click to edit ${label}`}
                >
                    {displayValue ?? "Not set"}
                </button>
            )}
        </div>
    );
}

// ─── People Tab ───────────────────────────────────────────────────────────────

function PeopleTab({
    project,
    slug,
    workspaceMembers,
    manageable,
}: {
    project: ProjectDetail;
    slug: string;
    workspaceMembers: {
        id: string;
        role: string;
        user: { id: string; name: string | null; image: string | null; email: string | null };
    }[];
    manageable: boolean;
}) {
    const [comboOpen, setComboOpen] = useState(false);

    const lead = project.projectMembers.find((m) => m.role === "LEAD");
    const contributors = project.projectMembers.filter((m) => m.role === "CONTRIBUTOR");

    const assignedMemberIds = new Set(
        project.projectMembers.map((m) => m.workspaceMember.id),
    );
    const unassignedMembers = workspaceMembers.filter(
        (m) => !assignedMemberIds.has(m.id),
    );

    return (
        <div className="flex flex-col gap-6 max-w-lg">
            <div className="flex flex-col gap-3">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Project Lead
                </h3>
                {lead ? (
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3.5">
                        <Avatar className="size-10">
                            <AvatarImage
                                src={lead.workspaceMember.user.image ?? undefined}
                                alt={lead.workspaceMember.user.name ?? "Lead"}
                            />
                            <AvatarFallback>
                                {lead.workspaceMember.user.name?.charAt(0).toUpperCase() ?? "?"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-foreground">
                                {lead.workspaceMember.user.name ?? "Unknown"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {lead.workspaceMember.user.email}
                            </span>
                        </div>
                        <Badge variant="outline" className="ml-auto text-[10px]">
                            Lead
                        </Badge>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No lead assigned.</p>
                )}
            </div>

            {contributors.length > 0 && (
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Contributors
                    </h3>
                    <div className="flex flex-col gap-2">
                        {contributors.map((m) => (
                            <div
                                key={m.id}
                                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3.5"
                            >
                                <Avatar className="size-9">
                                    <AvatarImage
                                        src={m.workspaceMember.user.image ?? undefined}
                                        alt={m.workspaceMember.user.name ?? "Member"}
                                    />
                                    <AvatarFallback className="text-xs">
                                        {m.workspaceMember.user.name
                                            ?.charAt(0)
                                            .toUpperCase() ?? "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-medium text-foreground">
                                        {m.workspaceMember.user.name ?? "Unknown"}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {m.workspaceMember.user.email}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {manageable && unassignedMembers.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Assign Member
                    </h3>
                    <Popover open={comboOpen} onOpenChange={setComboOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-between font-normal"
                                aria-label="Open member assignment combobox"
                            >
                                Add a team member...
                                <ChevronsUpDown className="ml-2 size-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search members..." />
                                <CommandList>
                                    <CommandEmpty>No unassigned members.</CommandEmpty>
                                    <CommandGroup>
                                        {unassignedMembers.map((m) => (
                                            <CommandItem
                                                key={m.id}
                                                value={m.user.name ?? m.id}
                                                onSelect={() => {
                                                    setComboOpen(false);
                                                    toast.info(
                                                        "Member assignment coming in next iteration.",
                                                    );
                                                }}
                                            >
                                                <Avatar className="size-6 mr-2">
                                                    <AvatarImage
                                                        src={m.user.image ?? undefined}
                                                    />
                                                    <AvatarFallback className="text-[10px]">
                                                        {m.user.name
                                                            ?.charAt(0)
                                                            .toUpperCase() ?? "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {m.user.name ?? m.user.email}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            )}
        </div>
    );
}

// ─── Rename Dialog ────────────────────────────────────────────────────────────

function RenameDialog({
    project,
    slug,
    open,
    onOpenChange,
}: {
    project: ProjectDetail;
    slug: string;
    open: boolean;
    onOpenChange: (v: boolean) => void;
}) {
    const [isPending, setIsPending] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const newTitle = inputRef.current?.value.trim() ?? "";
        if (newTitle.length < 2) return;
        setIsPending(true);
        try {
            const result = await updateProjectDetails(slug, {
                projectId: project.id,
                title: newTitle,
                description: project.description,
                dueDate: project.dueDate
                    ? format(new Date(project.dueDate), "yyyy-MM-dd")
                    : null,
                budget: project.budget != null ? project.budget / 100 : null,
            });
            if (result.success) {
                toast.success("Project renamed.");
                onOpenChange(false);
            } else {
                toast.error(
                    "error" in result ? result.error : "Failed to rename project.",
                );
            }
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle>Rename Project</DialogTitle>
                    <DialogDescription>
                        Enter a new name for this project.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
                    <input
                        ref={inputRef}
                        type="text"
                        defaultValue={project.title}
                        required
                        minLength={2}
                        maxLength={100}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="New project name"
                        autoFocus
                    />
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending} className="gap-2">
                            {isPending && <Loader2 className="size-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Archive Dialog ───────────────────────────────────────────────────────────

function ArchiveDialog({
    project,
    slug,
    open,
    onOpenChange,
}: {
    project: ProjectDetail;
    slug: string;
    open: boolean;
    onOpenChange: (v: boolean) => void;
}) {
    const [confirmTitle, setConfirmTitle] = useState("");
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    async function handleArchive() {
        if (confirmTitle !== project.title) return;
        setIsPending(true);
        try {
            const result = await archiveProject(slug, { projectId: project.id });
            if (result.success) {
                toast.success("Project archived.");
                onOpenChange(false);
                router.push(`/w/${slug}/projects`);
            } else if ("error" in result) {
                toast.error(result.error);
            }
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) setConfirmTitle("");
                onOpenChange(v);
            }}
        >
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle className="text-destructive flex items-center gap-2">
                        <AlertTriangle className="size-4" />
                        Archive Project
                    </DialogTitle>
                    <DialogDescription>
                        This action hides the project from all views. To confirm, type{" "}
                        <span className="font-semibold text-foreground">{project.title}</span>{" "}
                        below.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                    <Input
                        id="archive-confirm"
                        placeholder={project.title}
                        value={confirmTitle}
                        onChange={(e) => setConfirmTitle(e.target.value)}
                        aria-label="Confirm project title to archive"
                        autoFocus
                    />
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setConfirmTitle("");
                            onOpenChange(false);
                        }}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={confirmTitle !== project.title || isPending}
                        onClick={handleArchive}
                        className="gap-2"
                        aria-label="Confirm archive"
                    >
                        {isPending && <Loader2 className="size-4 animate-spin" />}
                        Archive
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
