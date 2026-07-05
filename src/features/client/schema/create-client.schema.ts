import { z } from "zod";

export const createClientSchema = z.object({
    name: z
        .string()
        .min(2, "Company name must be at least 2 characters.")
        .max(100, "Company name is too long."),
    contactName: z
        .string()
        .max(100)
        .optional()
        .or(z.literal("")),
    contactEmail: z
        .string()
        .email("Please enter a valid email address.")
        .optional()
        .or(z.literal("")),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;