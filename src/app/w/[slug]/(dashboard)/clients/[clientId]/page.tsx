import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Mail,
    Phone,
    StickyNote,
    Clock,
    DollarSign,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { hasGlobalPermission } from "@/lib/auth/permissions";
import { Badge } from "@/components/ui/badge";
import { ClientProfileHeaderActions } from "@/features/client/component/ClientProfileHeaderActions";

export const dynamic = "force-dynamic";

interface ClientProfilePageProps {
    params: Promise<{ slug: string; clientId: string }>;
}

// ─── Status badge for project health ─────────────────────────────────────────

function ProjectStatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; className: string }> = {
        ACTIVE: {
            label: "In Progress",
            className: "bg-amber-50 text-amber-700 border-amber-200",
        },
        DRAFT: {
            label: "Draft",
            className: "bg-muted text-muted-foreground border-border",
        },
        COMPLETED: {
            label: "Completed",
            className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        },
        ARCHIVED: {
            label: "Archived",
            className: "bg-gray-100 text-gray-600 border-gray-200",
        },
    };

    const config = map[status] ?? {
        label: status,
        className: "bg-muted text-muted-foreground border-border",
    };

    return (
        <Badge variant="outline" className={config.className}>
            {config.label}
        </Badge>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ClientProfilePage({ params }: ClientProfilePageProps) {
    const { slug, clientId } = await params;

    const tenant = await getTenantContext(slug);
    if (!tenant) notFound();

    if (!hasGlobalPermission(tenant.membership.role, "client:view")) {
        notFound();
    }

    const canUpdate = hasGlobalPermission(tenant.membership.role, "client:update");

    // Fetch client + all related projects
    const client = await prisma.client.findUnique({
        where: {
            id: clientId,
            workspaceId: tenant.workspace.id,
        },
        select: {
            id: true,
            name: true,
            contactName: true,
            contactEmail: true,
            notes: true,
            createdAt: true,
            projects: {
                where: { deletedAt: null },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    budget: true,
                    startDate: true,
                    dueDate: true,
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!client) notFound();

    // Format date range for each project
    const formatDate = (d: Date | null) =>
        d
            ? new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
                  d,
              )
            : "Present";

    const formatBudget = (cents: number | null) =>
        cents != null
            ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
              }).format(cents / 100)
            : null;

    const clientInitials = client.name.slice(0, 2).toUpperCase();

    return (
        <div className="flex flex-col gap-6 max-w-5xl">
            {/* ── Header ───────────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3">
                <Link
                    href={`/w/${slug}/clients`}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                >
                    <ArrowLeft className="size-4" />
                    Back to Directory
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold flex-shrink-0">
                            {clientInitials}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {client.name}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Client since{" "}
                                {new Intl.DateTimeFormat("en-US", {
                                    month: "long",
                                    year: "numeric",
                                }).format(client.createdAt)}
                            </p>
                        </div>
                    </div>

                    {canUpdate && (
                        <div className="flex-shrink-0">
                            <ClientProfileHeaderActions
                                slug={slug}
                                client={{
                                    id: client.id,
                                    name: client.name,
                                    contactName: client.contactName,
                                    contactEmail: client.contactEmail,
                                    notes: client.notes,
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ── Row 1: Contact Details + Internal Notes ───────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Contact Details */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-4">
                    <h2 className="text-base font-semibold text-foreground">Contact Details</h2>

                    {client.contactName || client.contactEmail ? (
                        <div className="flex flex-col gap-3">
                            {client.contactName && (
                                <div className="flex items-center gap-2.5 text-sm text-foreground">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0">
                                        {client.contactName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium">{client.contactName}</span>
                                </div>
                            )}
                            {client.contactEmail && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="size-4 flex-shrink-0" />
                                    <a
                                        href={`mailto:${client.contactEmail}`}
                                        className="hover:text-foreground transition-colors"
                                    >
                                        {client.contactEmail}
                                    </a>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">
                            No contact information on file.
                        </p>
                    )}

                    {/* Stats */}
                    <div className="pt-3 mt-auto border-t border-border flex items-center gap-6">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Total Projects
                            </span>
                            <span className="text-lg font-bold text-foreground">
                                {client.projects.length}
                            </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Active
                            </span>
                            <span className="text-lg font-bold text-primary">
                                {
                                    client.projects.filter(
                                        (p) => p.status === "ACTIVE",
                                    ).length
                                }
                            </span>
                        </div>
                    </div>
                </div>

                {/* Internal Notes */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <StickyNote className="size-4 text-muted-foreground" />
                        <h2 className="text-base font-semibold text-foreground">Internal Notes</h2>
                    </div>
                    <div className="flex-1 bg-muted/30 rounded-lg p-3 border border-border/50 min-h-[100px]">
                        {client.notes ? (
                            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                {client.notes}
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">
                                No internal notes yet. Edit the profile to add notes.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Row 2: Project History ────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-border bg-muted/20">
                    <h2 className="text-base font-semibold text-foreground">Project History</h2>
                </div>

                {client.projects.length === 0 ? (
                    <div className="py-14 text-center">
                        <Clock className="size-8 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No projects yet for this client.</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Create a project and assign this client to see it here.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {client.projects.map((project) => {
                            const budget = formatBudget(project.budget);
                            const dateRange = `${formatDate(project.startDate)} – ${
                                project.status === "COMPLETED"
                                    ? formatDate(project.dueDate)
                                    : "Present"
                            }`;

                            return (
                                <Link
                                    key={project.id}
                                    href={`/w/${slug}/projects/${project.id}`}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors gap-3 group"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                            {project.title}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {dateRange}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6 sm:gap-8">
                                        {budget && (
                                            <div className="flex flex-col items-end gap-0.5">
                                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Budget
                                                </span>
                                                <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                                                    <DollarSign className="size-3 text-muted-foreground" />
                                                    {budget.replace("$", "")}
                                                </span>
                                            </div>
                                        )}
                                        <ProjectStatusBadge status={project.status} />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
