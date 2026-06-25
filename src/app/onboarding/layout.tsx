"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { OnboardingStepper } from "@/features/onboarding/components/onboarding-stepper";
import { OnboardingSidebar } from "@/features/onboarding/components/onboarding-sidebar";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isInvite = pathname.includes("/invite");

  return (
    <div className="h-screen overflow-hidden grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:block h-screen">
        <OnboardingSidebar />
      </div>

      {/* Right Column - White Form Panel */}
      <div className="bg-white h-screen overflow-hidden flex flex-col relative items-center w-full">
        <div className="w-full max-w-[516px] h-full flex flex-col">
          {/* ZONE 1 - Stepper (fixed top) */}
          <div className="shrink-0 pt-[40px] px-[48px] bg-white w-full">
            <OnboardingStepper />
          </div>

          {/* ZONE 2 & 3 - Scrollable Form & Action Buttons */}
          {isInvite ? (
            <div className="flex-1 flex flex-col min-h-0 w-full">
              {children}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-[48px] pt-[24px] pb-[40px] w-full">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
