"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { inviteTeamMembersSchema } from "../schema/invite-team-member.schema";
import { InviteTeamMemberEmailTemplate } from "@/email/InviteTeamMember";
import { generateInviteToken } from "@/lib/generate-invite-token";
import { Resend } from "resend";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Response Types
type ActionResponse =
  | { success: true; data: { invitedCount: number } }
  | { success: false; error: string };

/**
 * **Onboarding Step 2** — Invite team members to a workspace.
 *
 * 1. Validates inputs and normalizes emails.
 * 2. Enforces RBAC (Caller must be OWNER or ADMIN).
 * 3. Uses Promise.all with upsert for fast, idempotent database writes.
 * 4. Dispatches personalized magic links via Resend.
 */
export async function inviteTeamMembers(
  emails: string[],
  workspaceId: string,
): Promise<ActionResponse> {

  // 1. Authentication Guard
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session?.user?.email) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  // 2. Input Validation
  const parsed = inviteTeamMembersSchema.safeParse({ emails, workspaceId });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
    return { success: false, error: firstError };
  }

  const { emails: validatedEmails, workspaceId: validatedWorkspaceId } = parsed.data;

  // 3. Data Sanitization (Deduplicate, lowercase, prevent self-invites)
  const uniqueEmails = [
    ...new Set(validatedEmails.map((e) => e.toLowerCase().trim())),
  ];
  const targetEmails = uniqueEmails.filter((e) => e !== userEmail);

  if (targetEmails.length === 0) {
    // If they only tried to invite themselves, just advance onboarding
    await prisma.user.update({
      where: { id: userId },
      data: { onboardingStep: 3 },
    });
    return { success: true, data: { invitedCount: 0 } };
  }

  // 4. Authorization Guard (RBAC)
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: userId,
        workspaceId: validatedWorkspaceId,
      },
    },
    select: { role: true, workspace: { select: { name: true } } },
  });

  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
    return {
      success: false,
      error: "You do not have permission to invite members to this workspace.",
    };
  }

  const workspaceName = membership.workspace.name;

  try {
    // 5. Setup Token and Expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(process.env.INVITE_TEAM_MEMBER_TOKEN_EXPIERY || 7));

    // Prepare the exact payload for each user
    const invitesToProcess = targetEmails.map((email) => ({
      email,
      workspaceId: validatedWorkspaceId,
      invitedById: userId,
      expiresAt,
      token: generateInviteToken(), // Cryptographically secure token
    }));

    // 6. High-Performance Database Transaction
    await prisma.$transaction(async (tx) => {
      // Map each invite to an upsert query to handle "resends" flawlessly
      const upsertPromises = invitesToProcess.map((invite) =>
        tx.invite.upsert({
          where: {
            email_workspaceId: {
              email: invite.email,
              workspaceId: invite.workspaceId,
            },
          },
          update: {
            token: invite.token,
            expiresAt: invite.expiresAt,
            status: "PENDING", // Reset status if they were previously expired
          },
          create: {
            email: invite.email,
            workspaceId: invite.workspaceId,
            invitedById: invite.invitedById,
            expiresAt: invite.expiresAt,
            token: invite.token,
            status: "PENDING",
          },
        })
      );

      // Execute all upserts in parallel
      await Promise.all(upsertPromises);

      // Advance onboarding step
      await tx.user.update({
        where: { id: userId },
        data: { onboardingStep: 3 },
      });
    });

    // 7. Dispatch Emails via Resend
    try {
      // Create an array of email promises for parallel dispatch
      const emailPromises = invitesToProcess.map((invite) => {
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${invite.token}`;

        return resend.emails.send({
          from: "AgencyOS <invites@your-domain.com>", // Update in production
          to: invite.email,
          subject: `You're invited to join ${workspaceName}`,
          react: InviteTeamMemberEmailTemplate({
            workspaceName: workspaceName,
            inviterName: session.user.name,
            inviterEmail: userEmail,
            inviteLink: inviteLink,
          }),
        });
      });

      // Fire all emails simultaneously
      await Promise.allSettled(emailPromises);

    } catch (emailError) {
      console.error("[inviteTeamMembers] Resend Dispatch Error:", emailError);
      // We do NOT throw here. The DB transaction succeeded, the users exist in the system.
    }

    return {
      success: true,
      data: { invitedCount: targetEmails.length },
    };

  } catch (error) {
    console.error("[inviteTeamMembers] Transaction Failed:", error);
    return {
      success: false,
      error: "An unexpected error occurred while processing invitations.",
    };
  }
}