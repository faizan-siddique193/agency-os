"use server";

import prisma from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { hasGlobalPermission } from "@/lib/auth/permissions";
import { updateClientSchema } from "../schema/update-client.schema";
import { revalidatePath } from "next/cache";

type UpdateClientResult =
    | { success: true }
    | { success: false; error: string }
    | { success: false; fieldErrors: Record<string, string[]> };

export async function updateClient(
    slug: string,
    rawData: unknown,
): Promise<UpdateClientResult> {
    const parsed = updateClientSchema.safeParse(rawData);
    if (!parsed.success) {
        return {
            success: false,
            fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    const { clientId, name, contactName, contactEmail, notes } = parsed.data;

    try {
        const tenant = await getTenantContext(slug);

        if (!hasGlobalPermission(tenant.membership.role, "client:update")) {
            return {
                success: false,
                error: "Security Violation: You lack permission to update clients in this workspace.",
            };
        }

        // Ownership check — ensure this client belongs to the current workspace
        const existing = await prisma.client.findUnique({
            where: { id: clientId },
            select: { workspaceId: true },
        });

        if (!existing || existing.workspaceId !== tenant.workspace.id) {
            return {
                success: false,
                error: "Security violation: the specified client does not belong to this workspace.",
            };
        }

        await prisma.client.update({
            where: { id: clientId },
            data: {
                name,
                contactName: contactName || null,
                contactEmail: contactEmail || null,
                notes: notes || null,
            },
        });

        revalidatePath(`/w/${slug}/clients`);
        revalidatePath(`/w/${slug}/clients/${clientId}`);

        return { success: true };
    } catch (error) {
        console.error("[UPDATE_CLIENT_ERROR]", error);
        return {
            success: false,
            error: "An unexpected error occurred while updating the client.",
        };
    }
}
