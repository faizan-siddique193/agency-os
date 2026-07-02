import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import prisma from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { ProjectTable } from "@/features/project/component/ProjectTable";
import { ProjectKanban } from "@/features/project/component/ProjectKanban";
import { CreateProjectModal } from "@/features/project/component/CreateProjectModal";
import { ProjectsToolbar } from "@/features/project/component/ProjectsToolbar";
import { ProjectsListSkeleton } from "@/features/project/component/ProjectSkeleton";
import { ProjectEmptyState } from "@/features/project/component/ProjectEmptyState";
import type { ProjectStatus, ProjectHealth, ProjectPriority } from "@/generated/prisma";

interface ProjectsPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{
        view?: "table" | "kanban";
        search?: string;
        status?: ProjectStatus;
    }>;
}

export type ProjectListItem = {
    id: string;
    title: string;
    status: ProjectStatus;
    health: ProjectHealth;
    priority: ProjectPriority;
    dueDate: Date | null;
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

async function ProjectsContent({
    slug,
    view,
    search,
    status,
    workspaceId,
    memberRole,
}: {
    slug: string;
    view: "table" | "kanban";
    search: string | undefined;
    status: ProjectStatus | undefined;
    workspaceId: string;
    memberRole: string;
}) {
    const projects = await prisma.project.findMany({
        where: {
            workspaceId,
            deletedAt: null,
            ...(status ? { status } : {}),
            ...(search
                ? { title: { contains: search, mode: "insensitive" } }
                : {}),
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
    });

    if (projects.length === 0) {
        return <ProjectEmptyState slug={slug} memberRole={memberRole} />;
    }

    if (view === "kanban") {
        return (
            <ProjectKanban
                projects={projects as ProjectListItem[]}
                slug={slug}
                memberRole={memberRole}
            />
        );
    }

    return (
        <ProjectTable
            projects={projects as ProjectListItem[]}
            slug={slug}
            memberRole={memberRole}
        />
    );
}

export default async function ProjectsPage({
    params,
    searchParams,
}: ProjectsPageProps) {
    const { slug } = await params;
    const { view = "table", search, status } = await searchParams;

    const tenant = await getTenantContext(slug);

    const clients = await prisma.client.findMany({
        where: { workspaceId: tenant.workspace.id },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Projects
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Manage and track all active client work.
                    </p>
                </div>
                <CreateProjectModal
                    slug={slug}
                    clients={clients}
                    memberRole={tenant.membership.role}
                />
            </div>

            <ProjectsToolbar
                slug={slug}
                currentView={view as "table" | "kanban"}
                currentSearch={search}
                currentStatus={status as ProjectStatus | undefined}
            />

            <Suspense fallback={<ProjectsListSkeleton />}>
                <ProjectsContent
                    slug={slug}
                    view={view as "table" | "kanban"}
                    search={search}
                    status={status as ProjectStatus | undefined}
                    workspaceId={tenant.workspace.id}
                    memberRole={tenant.membership.role}
                />
            </Suspense>
        </div>
    );
}
