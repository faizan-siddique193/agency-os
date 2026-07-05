"use server";

import prisma from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { hasGlobalPermission } from "@/lib/auth/permissions";
import { createClientSchema } from "../schema/create-client.schema";
import { revalidatePath } from "next/cache";

export async function createClient(slug: string, rawData: unknown) {
    try {
        // 1. Strict Payload Validation
        const parsed = createClientSchema.safeParse(rawData);
        if (!parsed.success) {
            return { success: false, error: parsed.error.flatten().fieldErrors };
        }

        // 2. Authenticate & Fetch Tenant Context
        const tenant = await getTenantContext(slug);


        // 3. PBAC Global Permission Gate
        if (!hasGlobalPermission(tenant.membership.role, "client:create")) {
            return {
                success: false,
                error: "Security Violation: You lack permission to create clients in this workspace."
            };
        }

        const { name, contactName, contactEmail } = parsed.data;

        // 4. Atomic Entity Creation
        const client = await prisma.client.create({
            data: {
                name,
                contactName: contactName || null,
                contactEmail: contactEmail || null,
                workspaceId: tenant.workspace.id,
            },
        });

        // 5. Invalidate relevant caches (so project dropdowns instantly see the new client)
        revalidatePath(`/w/${slug}/projects`);
        revalidatePath(`/w/${slug}/clients`);

        return { success: true, client };
    } catch (error: any) {
        console.error("[CREATE_CLIENT_ERROR]", error);
        return { success: false, error: "An unexpected error occurred while creating the client." };
    }
}