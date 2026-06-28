import { cache } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import type { OnboardingStep } from "@/generated/prisma";

/**
 * Centralized onboarding URL security guard.
 *
 * Wraps React.cache() so that if a layout and a page call this
 * on the same request, Prisma is only queried ONCE.
 *
 * Usage: `await enforceOnboardingStep("INVITE")` at the top of a Server Component.
 *
 * Redirect matrix:
 *   - No session           → /api/auth/signin
 *   - step === COMPLETED   → / (Traffic Cop routes to dashboard)
 *   - step !== expectedStep → /onboarding/<actual-step-lowercase>
 *   - step === expectedStep → (returns void, page renders)
 */
export const enforceOnboardingStep = cache(
  async (expectedStep: Exclude<OnboardingStep, "COMPLETED">) => {
    // ── 1. Authentication ──────────────────────────────────────────────────
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      redirect("/api/auth/signin");
    }

    const userId = session.user.id;

    // ── 2. Minimal DB query — only the single field we need ────────────────
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingStep: true },
    });

    // Should never happen (user deleted mid-session), but guard anyway
    if (!user) {
      redirect("/api/auth/signin");
    }

    const actualStep = user.onboardingStep;

    // ── 3. Completed users have no business in onboarding ──────────────────
    if (actualStep === "COMPLETED") {
      redirect("/"); // Traffic Cop resolves to /w/<slug>/dashboard
    }

    // ── 4. Enforce exact step — prevent backward/forward URL tampering ──────
    if (actualStep !== expectedStep) {
      redirect(`/onboarding/${actualStep.toLowerCase()}`);
    }

    // ── 5. Step matches → allow the page to render ─────────────────────────
    // Explicit void return to make the contract clear to callers
    return;
  }
);
