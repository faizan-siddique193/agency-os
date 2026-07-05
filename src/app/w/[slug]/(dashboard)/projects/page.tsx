import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import prisma from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { CreateProjectModal } from "@/features/project/component/CreateProjectModal";
import { ProjectsViewManager } from "@/features/project/component/ProjectsViewManager";
import type { ProjectStatus, ProjectHealth, ProjectPriority } from "@/generated/prisma";

/**
 * Force dynamic rendering — this page reads a session cookie (via getTenantContext)
 * and must never be statically cached, even partially under Next.js PPR.
 */
export const dynamic = "force-dynamic";

// ─── Shared type ──────────────────────────────────────────────────────────────
// Exported so ProjectTable and ProjectKanban can import it without a circular ref.

export type ProjectListItem = {
    id: string;
    title: string;
    status: ProjectStatus;
    health: ProjectHealth;
    priority: ProjectPriority;
    dueDate: Date | null;
    /** budget stored as integer cents in DB; sanitized to plain Number before RSC serialization. */
    budget: number | null;
    client: { id: string; name: string };
    projectMembers: {
        id: string;
        role: "LEAD" | "CONTRIBUTOR";
        workspaceMember: {
            id: string;
            user: { id: string; name: string | null; image: string | null };
        };
    }[];
};

// ─── Page ─────────────────────────────────────────────────────────────────────

interface ProjectsPageProps {
    params: Promise<{ slug: string }>;
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
    const { slug } = await params;

    const tenant = await getTenantContext(slug);
    if (!tenant) notFound();

    // Parallel DB reads — eliminates the sequential waterfall.
    // Both queries run simultaneously against the Neon connection pool.
    const [rawProjects, clients] = await Promise.all([
        prisma.project.findMany({
            where: {
                workspaceId: tenant.workspace.id,
                deletedAt: null,
            },
            select: {
                id: true,
                title: true,
                status: true,
                health: true,
                priority: true,
                dueDate: true,
                budget: true,
                client: { select: { id: true, name: true } },
                projectMembers: {
                    select: {
                        id: true,
                        role: true,
                        workspaceMember: {
                            select: {
                                id: true,
                                user: { select: { id: true, name: true, image: true } },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma.client.findMany({
            where: { workspaceId: tenant.workspace.id },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        }),
    ]);

    /**
     * Decimal sanitization — Prisma returns `budget` as a `Prisma.Decimal` object.
     * React Server Components cannot serialize non-plain objects across the RSC
     * boundary. Convert each to a plain `number` (or null) before passing to
     * any Client Component.
     */
    const projects: ProjectListItem[] = rawProjects.map((p) => ({
        ...p,
        budget: p.budget != null ? Number(p.budget) : null,
    }));

    return (
        <div className="flex flex-col gap-6">
            {/* ── Page Header ───────────────────────────────────────────── */}
            <div className="flex items-center justify-between w-full min-w-0">
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
                        Projects
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                        Manage and track all active client work.
                    </p>
                </div>
                {/* CreateProjectModal stays in the Server Component shell so it
                    always has the freshest client list without client fetching. */}
                <div className="flex-shrink-0 ml-4">
                    <CreateProjectModal
                        slug={slug}
                        clients={clients}
                        memberRole={tenant.membership.role}
                    />
                </div>
            </div>

            {/*
             * ProjectsViewManager is the single client boundary for the entire
             * projects list. It owns:
             *   - view toggle (table / kanban) — pure useState, zero server calls
             *   - search + filter — useMemo on the in-memory array
             *   - useOptimistic — single source of truth for status mutations
             */}
            <ProjectsViewManager
                projects={projects}
                clients={clients}
                slug={slug}
                memberRole={tenant.membership.role}
            />
        </div>
    );
}
