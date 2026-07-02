"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { projectPolicy } from "@/lib/policies/project";
import { updateProjectStateSchema } from "@/features/project/schema/update-project-state.schema";

type UpdateProjectStateResult =
    | { success: true }
    | { success: false; error: string }
    | { success: false; fieldErrors: Record<string, string[]> };

export async function updateProjectState(
    slug: string,
    rawData: unknown,
): Promise<UpdateProjectStateResult> {
    const parsed = updateProjectStateSchema.safeParse(rawData);
    if (!parsed.success) {
        return {
            success: false,
            fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    const { projectId, field, value } = parsed.data;

    try {
        await projectPolicy.requireEditable(slug, projectId);

        await prisma.project.update({
            where: { id: projectId },
            data: { [field]: value },
            select: { id: true },
        });

        revalidatePath(`/${slug}/projects/${projectId}`);
        revalidatePath(`/${slug}/projects`);

        return { success: true };
    } catch (error) {
        console.error("[updateProjectState]", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred.",
        };
    }
}
