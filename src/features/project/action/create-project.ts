"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { hasGlobalPermission } from "@/lib/auth/permissions";
import { createProjectSchema } from "@/features/project/schema/create-project.schema";

type CreateProjectResult =
    | { success: true; projectId: string }
    | { success: false; error: string }
    | { success: false; fieldErrors: Record<string, string[]> };

export async function createProject(
    slug: string,
    rawData: unknown,
): Promise<CreateProjectResult> {
    const parsed = createProjectSchema.safeParse(rawData);
    if (!parsed.success) {
        return {
            success: false,
            fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    const { title, description, clientId, priority, dueDate } = parsed.data;

    try {
        const tenant = await getTenantContext(slug);
        const { id: workspaceId } = tenant.workspace;
        const { id: workspaceMemberId, role: workspaceRole } = tenant.membership;

        if (!hasGlobalPermission(workspaceRole, "project:create")) {
            return { success: false, error: "You do not have permission to create projects." };
        }

        const client = await prisma.client.findUnique({
            where: { id: clientId },
            select: { workspaceId: true },
        });

        if (!client || client.workspaceId !== workspaceId) {
            return {
                success: false,
                error: "Security violation: the specified client does not belong to this workspace.",
            };
        }

        const [project] = await prisma.$transaction([
            prisma.project.create({
                data: {
                    title,
                    description: description ?? null,
                    clientId,
                    workspaceId,
                    priority,
                    dueDate: dueDate ? new Date(dueDate) : null,
                    projectMembers: {
                        create: {
                            workspaceMemberId,
                            role: "LEAD",
                        },
                    },
                },
                select: { id: true },
            }),
        ]);

        revalidatePath(`/w/${slug}/projects`);

        return { success: true, projectId: project.id };
    } catch (error) {
        console.error("[createProject]", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred.",
        };
    }
}
