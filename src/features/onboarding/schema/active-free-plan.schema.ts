import { z } from "zod";

// These should match your actual Paddle premium plan identifiers
export const VALID_PLANS = ["pro", "enterprise", "agency"] as const;

export const activateFreeTrialSchema = z.object({
  planId: z.enum(VALID_PLANS, {
    message: `Plan must be one of: ${VALID_PLANS.join(", ")}`,
  }),
  workspaceId: z.string().min(1, "Workspace ID is required"),
});

export type ActivateFreeTrialInput = z.infer<typeof activateFreeTrialSchema>;