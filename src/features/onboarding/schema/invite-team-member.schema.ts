import { z } from "zod"

export const inviteTeamMembersSchema = z.object({
    emails: z
        .array(z.string().email("Each entry must be a valid email address"))
        .min(1, "At least one email is required")
        .max(50, "You can invite up to 50 members at a time"),
    workspaceId: z.string().min(1, "Workspace ID is required"),
});

export type InviteTeamMembersInput = z.infer<typeof inviteTeamMembersSchema>;
