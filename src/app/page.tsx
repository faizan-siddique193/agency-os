import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

export default async function RootTrafficCop() {
  // 1. Authenticate
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/");
  }

  const userId = session.user.id;

  // 2. Single query — fetch onboardingStep, defaultWorkspaceId, and first membership slug
  //    in one round-trip. No N+1.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      onboardingStep: true,
      defaultWorkspaceId: true,
      workspaceMembers: {
        select: {
          workspace: { select: { slug: true } },
        },
        take: 1,
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  // 3. Impossible edge-case guard (user deleted mid-session)
  if (!user) {
    redirect("/api/auth/signin");
  }

  // 4. Onboarding Gate — redirect incomplete users to their current step
  if (user.onboardingStep !== "COMPLETED") {
    // e.g. WORKSPACE → /onboarding/workspace | INVITE → /onboarding/invite
    redirect(`/onboarding/${user.onboardingStep.toLowerCase()}`);
  }

  // 5. Onboarding is COMPLETED — route to workspace dashboard
  //    Priority: defaultWorkspaceId → first membership → back to onboarding
  let targetSlug: string | null = null;

  if (user.defaultWorkspaceId) {
    // Fast path: resolve slug from the pinned default workspace
    const defaultWorkspace = await prisma.workspace.findUnique({
      where: { id: user.defaultWorkspaceId },
      select: { slug: true },
    });
    targetSlug = defaultWorkspace?.slug ?? null;
  }

  // Fallback: use whichever workspace they joined first
  if (!targetSlug) {
    targetSlug = user.workspaceMembers[0]?.workspace.slug ?? null;
  }

  // Last resort: if somehow they completed onboarding but have no workspace, send them back
  if (!targetSlug) {
    redirect("/onboarding/workspace");
  }

  redirect(`/w/${targetSlug}/dashboard`);
}