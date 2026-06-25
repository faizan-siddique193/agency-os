import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TrialActivationForm } from "@/features/onboarding/components/trial-activation-form";

export const metadata = {
  title: "Activate Free Trial",
  description: "Start your 14-day free trial.",
};

export default async function TrialPage() {
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
    redirect("/onboarding/workspace");
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <TrialActivationForm workspaceId={membership.workspaceId} />
    </div>
  );
}
