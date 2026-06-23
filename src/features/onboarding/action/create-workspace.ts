"use server";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { createWorkspaceSchema } from "../schema/create-workspace.schema";

type ActionResponse =
    | { success: true; data: { workspaceId: string; slug: string } }
    | { success: false; error: string };

function generateSlug(name: string): string {
    const base = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const suffix = Math.random().toString(36).substring(2, 6);
    return `${base}-${suffix}`;
}

export async function createWorkspace(
    formData: FormData
): Promise<ActionResponse> {
    // Auth
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized. Please sign in." };
    }

    const userId = session.user.id;

    // Input validation 
    const rawName = formData.get("workspaceName");

    if (typeof rawName !== "string") {
        return { success: false, error: "Workspace name is required." };
    }

    const parsed = createWorkspaceSchema.safeParse({
        workspaceName: rawName,
    });

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Invalid input.",
        };
    }

    const workspaceName = parsed.data.workspaceName;
    const slug = generateSlug(workspaceName);

    try {
        const workspace = await prisma.$transaction(async (tx) => {
            // 1. Create workspace
            const newWorkspace = await tx.workspace.create({
                data: {
                    name: workspaceName,
                    slug,
                },
            });

            // 2. Add owner
            await tx.workspaceMember.create({
                data: {
                    userId,
                    workspaceId: newWorkspace.id,
                    role: "OWNER",
                },
            });

            // 3. Update onboarding step
            await tx.user.update({
                where: { id: userId },
                data: { onboardingStep: 2 },
            });

            return newWorkspace;
        });

        return {
            success: true,
            data: {
                workspaceId: workspace.id,
                slug: workspace.slug,
            },
        };
    } catch (error) {
        console.error("[createWorkspace]", error);

        return {
            success: false,
            error: "Failed to create workspace. Please try again.",
        };
    }
}