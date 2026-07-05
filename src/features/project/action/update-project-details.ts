"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { projectPolicy } from "@/lib/policies/project";
import { updateProjectDetailsSchema } from "@/features/project/schema/update-project-details.schema";

type UpdateProjectDetailsResult =
    | { success: true }
    | { success: false; error: string }
    | { success: false; fieldErrors: Record<string, string[]> };

export async function updateProjectDetails(
    slug: string,
    rawData: unknown,
): Promise<UpdateProjectDetailsResult> {
    const parsed = updateProjectDetailsSchema.safeParse(rawData);
    if (!parsed.success) {
        return {
            success: false,
            fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    const { projectId, title, description, dueDate, budget } = parsed.data;

    try {
        await projectPolicy.requireManageable(slug, projectId, "project:update");

        await prisma.project.update({
            where: { id: projectId },
            data: {
                title,
                description: description ?? null,
                dueDate: dueDate ? new Date(dueDate) : null,
                budget: budget != null ? Math.round(budget * 100) : null,
            },
            select: { id: true },
        });

        revalidatePath(`/w/${slug}/projects/${projectId}`);
        revalidatePath(`/w/${slug}/projects`);

        return { success: true };
    } catch (error) {
        console.error("[updateProjectDetails]", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred.",
        };
    }
}
