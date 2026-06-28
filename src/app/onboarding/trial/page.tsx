import { enforceOnboardingStep } from "@/lib/auth/onboarding-guard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { TrialActivationForm } from "@/features/onboarding/components/trial-activation-form";

export const metadata = {
  title: "Activate Free Trial",
  description: "Start your 14-day free trial.",
};

export default async function TrialPage() {
  // Security gate: enforces step === TRIAL, handles auth + redirect internally
  await enforceOnboardingStep("TRIAL");

  // At this point the user is authenticated and on the correct step.
  // We still need their OWNER membership to pass workspaceId to the form.
  const session = await getServerSession(authOptions); // cached — no extra DB hit
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session!.user!.id!, role: "OWNER" },
    select: { workspaceId: true },
  });

  // Guard already ensures onboardingStep === TRIAL which is only set after
  // workspace creation, so a missing OWNER membership is a data integrity error.
  if (!membership) {
    await enforceOnboardingStep("WORKSPACE"); // will redirect
    return null;
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <TrialActivationForm workspaceId={membership.workspaceId} />
    </div>
  );
}
