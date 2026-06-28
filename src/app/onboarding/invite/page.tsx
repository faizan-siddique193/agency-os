import { enforceOnboardingStep } from "@/lib/auth/onboarding-guard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { InviteTeamForm } from "@/features/onboarding/components/invite-team-form";

export const metadata = {
  title: "Invite your team",
  description: "Collaborate with your team right from the start.",
};

export default async function InviteTeamPage() {
  // Security gate: enforces step === INVITE, handles auth + redirect internally
  await enforceOnboardingStep("INVITE");

  // At this point the user is authenticated and on the correct step.
  // We still need their OWNER membership to pass workspaceId to the form.
  const session = await getServerSession(authOptions); // cached — no extra DB hit
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session!.user!.id!, role: "OWNER" },
    select: { workspaceId: true },
  });

  // Guard already ensures onboardingStep === INVITE which is only set after
  // workspace creation, so a missing OWNER membership is a data integrity error.
  if (!membership) {
    // Shouldn't happen, but fall back safely rather than crash
    await enforceOnboardingStep("WORKSPACE"); // will redirect
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <InviteTeamForm workspaceId={membership.workspaceId} />
    </div>
  );
}
