import { z } from "zod";

export const createWorkspaceSchema = z.object({
  workspaceName: z
    .string()
    .min(1, "Workspace name is required")
    .max(100, "Workspace name must be 100 characters or less")
    .trim(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
