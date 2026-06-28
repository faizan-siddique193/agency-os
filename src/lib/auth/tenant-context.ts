import { cache } from "react";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "./auth";
import { getServerSession } from "next-auth";

export const getTenantContext = cache(async (slug: string) => {
    // 1. Authenticate & Clean up stale sessions
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/api/auth/signin?callbackUrl=/login");
    }

    const userId = session.user.id;

    // 2. Resolve Tenant & Membership
    const workspace = await prisma.workspace.findUnique({
        where: { slug },
        include: {
            members: {
                where: { userId: userId },
            },
        },
    });

    // 3. Security Check: Redirect unauthorized traffic to the Root Cop
    if (!workspace || workspace.members.length === 0) {
        redirect("/");
    }

    const membership = workspace.members[0];

    // 4. Return the Golden Context
    return {
        user: {
            id: userId,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image
        },
        workspace: {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
        },
        membership: {
            id: membership.id,
            role: membership.role,
        },
    };
});