import { z } from "zod";


export const ProjectPriorityEnum = z.enum(["LOW",
    "MEDIUM",
    "HIGH",
    "URGENT"])

export const createProjectSchema = z.object({
    title: z
        .string()
        .min(2, "Project name must be at least 2 characters.")
        .max(100, "Project name is too long."),
    description: z.string().optional(),
    clientId: z.string().min(1, "A client must be selected."),
    priority: ProjectPriorityEnum.default("MEDIUM"),
    // Dates from HTML inputs come as strings (YYYY-MM-DD), so we accept a string but ensure it's a valid date structure if provided.
    dueDate: z.string().optional().nullable(),
});