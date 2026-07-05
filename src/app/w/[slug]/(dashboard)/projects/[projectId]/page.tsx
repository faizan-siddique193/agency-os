import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { ProjectWarRoom } from "@/features/project/component/ProjectWarRoom";
import { ProjectWarRoomSkeleton } from "@/features/project/component/ProjectSkeleton";
import type { ProjectStatus, ProjectHealth, ProjectPriority, ProjectAssignmentRole } from "@/generated/prisma";

interface ProjectDetailPageProps {
    params: Promise<{ slug: string; projectId: string }>;
}

export type ProjectDetail = {
    id: string;
    title: string;
    description: string | null;
    status: ProjectStatus;
    health: ProjectHealth;
    priority: ProjectPriority;
    startDate: Date | null;
    dueDate: Date | null;
    budget: number | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    client: { id: string; name: string; contactName: string | null };
    projectMembers: {
        id: string;
        role: ProjectAssignmentRole;
        workspaceMember: {
            id: string;
            role: string;
            user: { id: string; name: string | null; image: string | null; email: string | null };
        };
    }[];
};

async function WarRoomContent({
    slug,
    projectId,
    memberRole,
    workspaceId,
    currentMemberId,
}: {
    slug: string;
    projectId: string;
    memberRole: string;
    workspaceId: string;
    currentMemberId: string;
}) {
    // 1. Execute independent database reads in parallel to eliminate waterfalls
    const [rawProject, workspaceMembers] = await Promise.all([
        prisma.project.findFirst({
            where: {
                id: projectId,
                workspaceId,
                deletedAt: null
            },
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                health: true,
                priority: true,
                startDate: true,
                dueDate: true,
                budget: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
                client: {
                    select: { id: true, name: true, contactName: true },
                },
                projectMembers: {
                    select: {
                        id: true,
                        role: true,
                        workspaceMember: {
                            select: {
                                id: true,
                                role: true,
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        image: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }),
        prisma.workspaceMember.findMany({
            where: { workspaceId },
            select: {
                id: true,
                role: true,
                user: { select: { id: true, name: true, image: true, email: true } },
            },
            orderBy: { joinedAt: "asc" },
        })
    ]);

    if (!rawProject) notFound();

    // 2. Sanitize complex types (like Decimal -> Number) to guarantee clean RSC serialization
    const project: ProjectDetail = {
        ...rawProject,
        budget: rawProject.budget ? Number(rawProject.budget) : null,
    };

    return (
        <ProjectWarRoom
            project={project}
            slug={slug}
            memberRole={memberRole}
            currentMemberId={currentMemberId}
            workspaceMembers={workspaceMembers}
        />
    );
}

export default async function ProjectDetailPage({
    params,
}: ProjectDetailPageProps) {
    const { slug, projectId } = await params;
    const tenant = await getTenantContext(slug);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <Link
                    href={`/w/${slug}/projects`}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <ArrowLeft className="size-3.5" />
                    All Projects
                </Link>
            </div>

            <Suspense fallback={<ProjectWarRoomSkeleton />}>
                <WarRoomContent
                    slug={slug}
                    projectId={projectId}
                    memberRole={tenant.membership.role}
                    workspaceId={tenant.workspace.id}
                    currentMemberId={tenant.membership.id}
                />
            </Suspense>
        </div>
    );
}