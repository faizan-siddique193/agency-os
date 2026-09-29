import { z } from "zod";

export const updateClientSchema = z.object({
    clientId: z.string().min(1, "Client ID is required."),
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
    notes: z
        .string()
        .max(2000, "Notes are too long.")
        .optional()
        .or(z.literal("")),
});

export type UpdateClientInput = z.infer<typeof updateClientSchema>;
