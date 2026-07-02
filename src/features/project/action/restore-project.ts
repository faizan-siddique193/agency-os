"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { projectPolicy } from "@/lib/policies/project";
import { targetProjectSchema } from "@/features/project/schema/target-project.schema";

type RestoreProjectResult =
    | { success: true }
    | { success: false; error: string }
    | { success: false; fieldErrors: Record<string, string[]> };

export async function restoreProject(
    slug: string,
    rawData: unknown,
): Promise<RestoreProjectResult> {
    const parsed = targetProjectSchema.safeParse(rawData);
    if (!parsed.success) {
        return {
            success: false,
            fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    const { projectId } = parsed.data;

    try {
        await projectPolicy.requireManageable(slug, projectId, "project:update");

        await prisma.project.update({
            where: { id: projectId },
            data: { deletedAt: null },
            select: { id: true },
        });

        revalidatePath(`/${slug}/projects/${projectId}`);
        revalidatePath(`/${slug}/projects`);

        return { success: true };
    } catch (error) {
        console.error("[restoreProject]", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred.",
        };
    }
}
