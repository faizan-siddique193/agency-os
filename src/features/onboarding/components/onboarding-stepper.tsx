"use client";

import { usePathname } from "next/navigation";
import { Building2, Users, Sparkles } from "lucide-react";
import { Stepper, type Step } from "./stepper";

export function OnboardingStepper() {
  const pathname = usePathname();

  const steps: Step[] = [
    {
      id: "workspace",
      title: "Workspace",
      status: "upcoming",
      icon: Building2,
    },
    {
      id: "invite",
      title: "Invite Team",
      status: "upcoming",
      icon: Users,
    },
    {
      id: "trial",
      title: "Trial",
      status: "upcoming",
      icon: Sparkles,
    },
  ];

  if (pathname.includes("/onboarding/workspace")) {
    steps[0].status = "current";
    steps[1].status = "upcoming";
    steps[2].status = "upcoming";
  } else if (pathname.includes("/onboarding/invite")) {
    steps[0].status = "complete";
    steps[1].status = "current";
    steps[2].status = "upcoming";
  } else if (pathname.includes("/onboarding/trial")) {
    steps[0].status = "complete";
    steps[1].status = "complete";
    steps[2].status = "complete";
  }

  return <Stepper steps={steps} />;
}
