import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

export default async function RootTrafficCop() {
  // 1. Authenticate the User
  const session = await getServerSession(authOptions);

  // 2. If no valid session, redirect them to login
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/");
  }

  const userId = session.user.id;

  // 3. Fetch the user's workspace connections
  // We use `select` instead of `include` to pull the absolute minimum amount of data required from PostgreSQL.
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: userId },
    select: {
      workspace: {
        select: {
          id: true,
          slug: true,
        }
      }
    },
    take: 10, // Safeguard: We only need a handful to find a valid route
  });

  // 4. Edge Case: User has no workspaces
  if (memberships.length === 0) {
    redirect("/onboarding/workspace");   // obviouly it will be the new user.
  }

  // 5. Routing Logic
  // Note: If you add `defaultWorkspaceId` to the User model later, you would query that first.
  // For now, we safely route them to their first available workspace.
  const targetSlug = memberships[0].workspace.slug;

  // 6. Execute the secure redirect
  redirect(`/w/${targetSlug}/dashboard`); // Or `/w/${targetSlug}/dashboard` if that is your exact layout structure
}