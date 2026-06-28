import { enforceOnboardingStep } from "@/lib/auth/onboarding-guard";
import { CreateWorkspaceForm } from "@/features/onboarding/components/create-workspace-form";

export const metadata = {
  title: "Set up your workspace",
  description: "Create a new workspace for your team.",
};

export default async function WorkspacePage() {
  await enforceOnboardingStep("WORKSPACE");

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CreateWorkspaceForm />
    </div>
  );
}
