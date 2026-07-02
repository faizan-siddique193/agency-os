"use client";

import { useState, useTransition, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
    CalendarDays,
    DollarSign,
    Activity,
    Users,
    Settings2,
    Shield,
    Loader2,
    AlertTriangle,
    Check,
    ChevronsUpDown,
    Trash2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { archiveProject } from "@/features/project/action/archive-project";
import type { ProjectDetail } from "@/app/w/[slug]/(dashboard)/projects/[projectId]/page";

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

const canManage = (role: string) => role === "OWNER" || role === "ADMIN";

export function ProjectWarRoom({
    project,
    slug,
    memberRole,
    currentMemberId,
    workspaceMembers,
}: ProjectWarRoomProps) {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get("tab") ?? "overview";

    const manageable = canManage(memberRole);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {project.title}
                        </h1>
                        <StatusBadge status={project.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {project.client.name}
                        {project.client.contactName
                            ? ` · ${project.client.contactName}`
                            : ""}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <HealthBadge health={project.health} />
                    <PriorityBadge priority={project.priority} />
                </div>
            </div>

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
                    {manageable && (
                        <TabsTrigger
                            value="settings"
                            className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium text-muted-foreground data-[state=active]:text-foreground"
                        >
                            <Settings2 className="size-3.5 mr-1.5" />
                            Settings
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                    <OverviewTab project={project} />
                </TabsContent>

                <TabsContent value="people" className="mt-6">
                    <PeopleTab
                        project={project}
                        slug={slug}
                        workspaceMembers={workspaceMembers}
                        manageable={manageable}
                    />
                </TabsContent>

                {manageable && (
                    <TabsContent value="settings" className="mt-6">
                        <SettingsTab project={project} slug={slug} />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

function OverviewTab({ project }: { project: ProjectDetail }) {
    const metrics = [
        {
            label: "Budget",
            icon: DollarSign,
            value:
                project.budget != null
                    ? `$${(project.budget / 100).toLocaleString("en-US")}`
                    : "Not set",
        },
        {
            label: "Start Date",
            icon: CalendarDays,
            value: project.startDate
                ? format(new Date(project.startDate), "MMM d, yyyy")
                : "Not set",
        },
        {
            label: "Due Date",
            icon: CalendarDays,
            value: project.dueDate
                ? format(new Date(project.dueDate), "MMM d, yyyy")
                : "Not set",
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {metrics.map(({ label, icon: Icon, value }) => (
                    <div
                        key={label}
                        className="rounded-lg border border-border bg-card p-4 flex flex-col gap-1.5"
                    >
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            <Icon className="size-3.5" />
                            {label}
                        </div>
                        <p className="text-lg font-semibold text-foreground">{value}</p>
                    </div>
                ))}
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
                    <span>Last updated {format(new Date(project.updatedAt), "MMM d, yyyy 'at' HH:mm")}</span>
                </div>
            </div>
        </div>
    );
}

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
    const [, startTransition] = useTransition();

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
                                        {m.workspaceMember.user.name?.charAt(0).toUpperCase() ?? "?"}
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
                            <Button variant="outline" className="w-full justify-between font-normal">
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
                                                    <AvatarImage src={m.user.image ?? undefined} />
                                                    <AvatarFallback className="text-[10px]">
                                                        {m.user.name?.charAt(0).toUpperCase() ?? "?"}
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

function SettingsTab({
    project,
    slug,
}: {
    project: ProjectDetail;
    slug: string;
}) {
    const [isPending, setIsPending] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState("");
    const [isArchivePending, setIsArchivePending] = useState(false);

    async function handleDetailsSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setIsPending(true);
        setServerError(null);
        try {
            const result = await updateProjectDetails(slug, {
                projectId: project.id,
                title: fd.get("title") as string,
                description: fd.get("description") as string | null,
                dueDate: (fd.get("dueDate") as string) || null,
                budget: fd.get("budget") ? Number(fd.get("budget")) : null,
            });
            if (result.success) {
                toast.success("Project details updated.");
            } else if ("fieldErrors" in result) {
                const first = Object.values(result.fieldErrors)[0]?.[0];
                setServerError(first ?? "Validation error.");
            } else {
                setServerError(result.error);
            }
        } finally {
            setIsPending(false);
        }
    }

    async function handleArchive() {
        if (confirmTitle !== project.title) return;
        setIsArchivePending(true);
        try {
            const result = await archiveProject(slug, { projectId: project.id });
            if (result.success) {
                toast.success("Project archived.");
                setArchiveDialogOpen(false);
            } else if ("error" in result) {
                toast.error(result.error);
            }
        } finally {
            setIsArchivePending(false);
        }
    }

    return (
        <div className="flex flex-col gap-8 max-w-lg">
            <form onSubmit={handleDetailsSubmit} className="flex flex-col gap-5">
                <h3 className="text-sm font-semibold text-foreground">Project Details</h3>

                {serverError && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                        {serverError}
                    </div>
                )}

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="settings-title">Project Name</Label>
                    <Input
                        id="settings-title"
                        name="title"
                        defaultValue={project.title}
                        required
                        minLength={2}
                        maxLength={100}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="settings-description">Description</Label>
                    <Textarea
                        id="settings-description"
                        name="description"
                        defaultValue={project.description ?? ""}
                        className="resize-none"
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="settings-dueDate">Due Date</Label>
                        <Input
                            id="settings-dueDate"
                            name="dueDate"
                            type="date"
                            defaultValue={
                                project.dueDate
                                    ? format(new Date(project.dueDate), "yyyy-MM-dd")
                                    : ""
                            }
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="settings-budget">Budget ($)</Label>
                        <Input
                            id="settings-budget"
                            name="budget"
                            type="number"
                            min={0}
                            step={1}
                            placeholder="e.g. 15000"
                            defaultValue={
                                project.budget != null ? project.budget / 100 : ""
                            }
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={isPending} className="gap-2">
                        {isPending && <Loader2 className="size-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>

            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-5 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="size-4 text-destructive mt-0.5 shrink-0" />
                    <div>
                        <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Archiving a project hides it from all views. It can be restored
                            later from the archived projects list.
                        </p>
                    </div>
                </div>
                <Button
                    variant="destructive"
                    size="sm"
                    className="w-fit gap-2"
                    onClick={() => setArchiveDialogOpen(true)}
                >
                    <Trash2 className="size-3.5" />
                    Archive Project
                </Button>
            </div>

            <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="text-destructive">Archive Project</DialogTitle>
                        <DialogDescription>
                            This action will soft-delete the project. To confirm, type{" "}
                            <span className="font-semibold text-foreground">
                                {project.title}
                            </span>{" "}
                            below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2 py-2">
                        <Input
                            id="archive-confirm"
                            placeholder={project.title}
                            value={confirmTitle}
                            onChange={(e) => setConfirmTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setArchiveDialogOpen(false);
                                setConfirmTitle("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={confirmTitle !== project.title || isArchivePending}
                            onClick={handleArchive}
                            className="gap-2"
                        >
                            {isArchivePending && <Loader2 className="size-4 animate-spin" />}
                            Archive
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
