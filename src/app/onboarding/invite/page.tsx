import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { InviteTeamForm } from "@/features/onboarding/components/invite-team-form";

export const metadata = {
  title: "Invite your team",
  description: "Collaborate with your team right from the start.",
};

export default async function InviteTeamPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  // Find the workspace this user just created (where they are OWNER)
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId: session.user.id,
      role: "OWNER",
    },
  });

  if (!membership) {
    // If they haven't created a workspace yet, send them back to step 1
    redirect("/onboarding/workspace");
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <InviteTeamForm workspaceId={membership.workspaceId} />
    </div>
  );
}
