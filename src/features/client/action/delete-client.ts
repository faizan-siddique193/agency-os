"use server";

import prisma from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { hasGlobalPermission } from "@/lib/auth/permissions";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const deleteClientSchema = z.object({
    clientId: z.string().min(1),
});

type DeleteClientResult =
    | { success: true }
    | { success: false; error: string };

export async function deleteClient(
    slug: string,
    rawData: unknown,
): Promise<DeleteClientResult> {
    const parsed = deleteClientSchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: "Invalid request." };
    }

    const { clientId } = parsed.data;

    try {
        const tenant = await getTenantContext(slug);

        if (!hasGlobalPermission(tenant.membership.role, "client:delete")) {
            return {
                success: false,
                error: "Security Violation: You lack permission to delete clients in this workspace.",
            };
        }

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

        await prisma.client.delete({
            where: { id: clientId },
        });

        revalidatePath(`/w/${slug}/clients`);

        return { success: true };
    } catch (error) {
        console.error("[DELETE_CLIENT_ERROR]", error);
        return {
            success: false,
            error: "An unexpected error occurred while deleting the client.",
        };
    }
}
