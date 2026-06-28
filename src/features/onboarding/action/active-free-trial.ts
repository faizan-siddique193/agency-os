"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { activateFreeTrialSchema } from "../schema/active-free-plan.schema";
import { Resend } from "resend";
import { TrialActivationEmailTemplate } from "@/email/TrialActivationEmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

// Response Types
type ActionResponse =
  | { success: true; data: { planId: string; trialEndDate: Date } }
  | { success: false; error: string };

// Server Action
export async function activateFreeTrial(
  planId: string,
  workspaceId: string,
): Promise<ActionResponse> {
  // Auth guard
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session?.user?.email) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const userId = session.user.id;
  const userEmail = session.user.email;
  const userName = session.user.name;

  // Input validation
  const parsed = activateFreeTrialSchema.safeParse({ planId, workspaceId });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
    return { success: false, error: firstError };
  }

  const { planId: validatedPlan, workspaceId: validatedWorkspaceId } = parsed.data;

  // Authorization: caller must be OWNER
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: userId,
        workspaceId: validatedWorkspaceId,
      },
    },
    select: {
      role: true,
      workspace: {
        select: { name: true }
      }
    },
  });

  if (!membership || membership.role !== "OWNER") {
    return {
      success: false,
      error: "Only the workspace owner can activate the trial.",
    };
  }

  const workspaceName = membership.workspace.name;

  // 14-Day Trial Provisioning
  try {
    const now = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);

    console.log(
      `[Trial Activation] Starting 14-day trial for workspace ${validatedWorkspaceId} on plan: ${validatedPlan}`,
    );

    await prisma.$transaction(async (tx) => {
      // Upsert a subscription record for this workspace to start the trial
      const placeholderSubscriptionId = `trial_${validatedWorkspaceId}`;

      await tx.subscription.upsert({
        where: {
          paddleSubscriptionId: placeholderSubscriptionId,
        },
        create: {
          workspaceId: validatedWorkspaceId,
          paddleSubscriptionId: placeholderSubscriptionId,
          status: "trialing",
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
        },
        update: {
          status: "trialing",
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
        },
      });

      // Mark onboarding as complete
      await tx.user.update({
        where: { id: userId },
        data: {
          onboardingStep: "COMPLETED",
        },
      });
    });

    // Email Dispatch
    try {
      await resend.emails.send({
        from: "AgencyOS <onboarding@yourdomain.com>", // Ensure this domain is verified in Resend
        to: userEmail,
        subject: `Your 14-day trial is active for ${workspaceName}`,
        react: TrialActivationEmailTemplate({
          userName: userName,
          workspaceName: workspaceName,
          trialEndDate: trialEnd,
          dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        }),
      });
    } catch (emailError) {
      console.error("[updatePricingPlan] Email dispatch failed:", emailError);
    }

    return {
      success: true,
      data: {
        planId: validatedPlan,
        trialEndDate: trialEnd
      },
    };
  } catch (error) {
    console.error("[updatePricingPlan] Transaction failed:", error);
    return {
      success: false,
      error: "Failed to activate free trial. Please try again.",
    };
  }
}