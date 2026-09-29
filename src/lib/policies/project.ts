import prisma from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { hasGlobalPermission, Permission } from "@/lib/auth/permissions";

export const projectPolicy = {

    async requireEditable(slug: string, projectId: string, requiredPermission: Permission = "project:update") {
        // 1. Authenticate and get Tenant Context
        const tenant = await getTenantContext(slug);
        const { role: workspaceRole, id: workspaceMemberId } = tenant.membership;

        // 2. Global Permission Check
        if (!hasGlobalPermission(workspaceRole, requiredPermission)) {
            throw new Error(`Security Violation: You lack the global permission to perform this action (${requiredPermission}).`);
        }

        // 3. The "Fetch + Auth" Query
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                workspaceId: tenant.workspace.id,
                deletedAt: null, // Ensure we aren't editing a trashed project

                // Resource Ownership Lock: If not Owner/Admin, they MUST be assigned (either LEAD or CONTRIBUTOR)
                ...(workspaceRole !== "OWNER" && workspaceRole !== "ADMIN" && {
                    projectMembers: {
                        some: { workspaceMemberId }
                    }
                })
            }
        });

        if (!project) {
            throw new Error("Not Found or Unauthorized: Project does not exist, is deleted, or you are not assigned.");
        }

        return { tenant, project };
    },

    /**
     * ENGINE 2: The Strict Financial & Destructive Guard (Require Manageable)
     * Use this for Server Actions that touch budgets, due dates, or archive/delete the project.
     * STRICTLY requires the user to be an Owner, Admin, or the explicitly assigned LEAD.
     */
    async requireManageable(slug: string, projectId: string, requiredPermission: Permission = "project:delete") {
        const tenant = await getTenantContext(slug);
        const { role: workspaceRole, id: workspaceMemberId } = tenant.membership;

        // 1. Global Permission Check
        if (!hasGlobalPermission(workspaceRole, requiredPermission)) {
            throw new Error(`Security Violation: You lack the global permission to perform this action (${requiredPermission}).`);
        }

        // 2. The Strict "Fetch + Auth" Query
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                workspaceId: tenant.workspace.id,
                // Notice we do NOT check `deletedAt: null` here. 
                // We need this engine to also fetch deleted projects so the LEAD can Restore them!

                // Strict Resource Ownership Lock: If not Owner/Admin, they MUST be the LEAD.
                ...(workspaceRole !== "OWNER" && workspaceRole !== "ADMIN" && {
                    members: {
                        some: {
                            workspaceMemberId: workspaceMemberId,
                            role: "LEAD" // <-- The critical difference from Engine 1
                        }
                    }
                })
            }
        });

        if (!project) {
            throw new Error("Not Found or Unauthorized: Project does not exist, or you must be the Project Lead to manage it.");
        }

        return { tenant, project };
    }
};