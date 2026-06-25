"use client";

import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

export function OnboardingSidebar() {
  const pathname = usePathname();

  let headline = "Run your agency. Not spreadsheets.";
  let subtext = "agency-os brings your projects, clients, invoices and team into one command center.";
  let features = [
    "Manage projects and deadlines in one place",
    "Send invoices and track payments instantly",
    "Give clients a portal — no more email chains",
    "Assign tasks and monitor your team's progress",
  ];

  if (pathname.includes("/onboarding/invite")) {
    headline = "Build your dream team.";
    subtext = "Bring the right people in from day one.\nAssign roles and start collaborating immediately.";
    features = [
      "Invite unlimited team members",
      "Control access with role-based permissions",
      "Freelancers only see what they need to",
      "Change roles anytime as your team grows",
    ];
  } else if (pathname.includes("/onboarding/trial")) {
    headline = "Everything you need.\nFrom day one.";
    subtext = "Your trial gives you full access to \nevery feature — no restrictions, no credit card.";
    features = [
      "Unlimited projects and tasks",
      "Full client portal access",
      "Invoice creation and tracking",
      "Team collaboration and roles",
      "Priority support during your trial",
    ];
  }

  return (
    <div className="hidden lg:flex flex-col justify-between bg-primary p-10 py-12 text-white h-full">
      {/* Top: Logo */}
      <div className="shrink-0 relative z-10 flex items-center gap-3">
        <div className="text-xl font-bold tracking-tight text-white">AgencyOS</div>
      </div>

      {/* Middle: Headline & Subtext */}
      <div className="relative flex-1 flex flex-col justify-center my-4">
        <h1 className="text-4xl font-bold leading-tight text-white max-w-lg">
          {headline}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-white/80 whitespace-pre-line max-w-md">
          {subtext}
        </p>
      </div>

      {/* Bottom: Feature List */}
      <div className="shrink-0 relative z-10 max-w-md">
        <div className="flex flex-col gap-4">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3 text-sm font-medium text-white">
              <div className="w-5 h-5 rounded-full bg-indigo-800 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
