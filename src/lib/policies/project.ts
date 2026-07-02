import prisma from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { hasGlobalPermission, type Permission } from "@/lib/auth/permissions";

export type ProjectPolicyContext = {
    tenant: Awaited<ReturnType<typeof getTenantContext>>;
    project: {
        id: string;
        workspaceId: string;
        title: string;
        deletedAt: Date | null;
    };
};

export const projectPolicy = {
    async requireEditable(
        slug: string,
        projectId: string,
        requiredPermission: Permission = "project:update",
    ): Promise<ProjectPolicyContext> {
        const tenant = await getTenantContext(slug);
        const { role: workspaceRole } = tenant.membership;

        if (!hasGlobalPermission(workspaceRole, requiredPermission)) {
            throw new Error(
                `Permission denied: you need '${requiredPermission}' to perform this action.`,
            );
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: {
                id: true,
                workspaceId: true,
                title: true,
                deletedAt: true,
            },
        });

        if (!project || project.workspaceId !== tenant.workspace.id) {
            throw new Error("Project not found or access denied.");
        }

        if (project.deletedAt !== null) {
            throw new Error("This project has been archived and cannot be modified.");
        }

        return { tenant, project };
    },

    async requireManageable(
        slug: string,
        projectId: string,
        requiredPermission: Permission = "project:update",
    ): Promise<ProjectPolicyContext> {
        const tenant = await getTenantContext(slug);
        const { role: workspaceRole } = tenant.membership;

        if (!hasGlobalPermission(workspaceRole, requiredPermission)) {
            throw new Error(
                `Permission denied: you need '${requiredPermission}' to perform this action.`,
            );
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: {
                id: true,
                workspaceId: true,
                title: true,
                deletedAt: true,
            },
        });

        if (!project || project.workspaceId !== tenant.workspace.id) {
            throw new Error("Project not found or access denied.");
        }

        return { tenant, project };
    },
};
