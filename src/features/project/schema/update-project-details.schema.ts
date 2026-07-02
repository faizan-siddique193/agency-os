import { title } from "process";
import { z } from "zod";


// 4. Update Project Details Schema (The Settings Tab Action)
export const updateProjectDetailsSchema = z.object({
    projectId: z.string().min(1, "Project ID is required."),
    title: z
        .string()
        .min(2, "Project name must be at least 2 characters.")
        .max(100, "Project name is too long."),
    description: z.string().optional().nullable(),
    dueDate: z.string().optional().nullable(),

    // Budget Handling:
    // HTML number inputs pass strings. z.coerce.number() safely converts "1500" to the integer 1500.
    // The Server Action will later multiply this by 100 to store it as cents.
    budget: z.coerce
        .number()
        .min(0, "Budget cannot be negative.")
        .optional()
        .nullable(),
});

