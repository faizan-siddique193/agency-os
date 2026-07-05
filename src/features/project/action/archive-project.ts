"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { projectPolicy } from "@/lib/policies/project";
import { targetProjectSchema } from "@/features/project/schema/target-project.schema";

type ArchiveProjectResult =
    | { success: true }
    | { success: false; error: string }
    | { success: false; fieldErrors: Record<string, string[]> };

export async function archiveProject(
    slug: string,
    rawData: unknown,
): Promise<ArchiveProjectResult> {
    const parsed = targetProjectSchema.safeParse(rawData);
    if (!parsed.success) {
        return {
            success: false,
            fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    const { projectId } = parsed.data;

    try {
        await projectPolicy.requireManageable(slug, projectId, "project:delete");

        await prisma.project.update({
            where: { id: projectId },
            data: { deletedAt: new Date() },
            select: { id: true },
        });

        revalidatePath(`/w/${slug}/projects/${projectId}`);
        revalidatePath(`/w/${slug}/projects`);

        return { success: true };
    } catch (error) {
        console.error("[archiveProject]", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred.",
        };
    }
}
