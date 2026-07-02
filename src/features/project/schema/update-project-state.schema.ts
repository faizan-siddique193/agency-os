import { z } from "zod"


export const ProjectStatusEnum = z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]);
export const ProjectHealthEnum = z.enum(["ON_TRACK", "AT_RISK", "BLOCKED"]);
export const ProjectPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);


export const updateProjectStateSchema = z.discriminatedUnion("field", [
    z.object({
        field: z.literal("status"),
        value: ProjectStatusEnum,
    }),
    z.object({
        field: z.literal("health"),
        value: ProjectHealthEnum,
    }),
    z.object({
        field: z.literal("priority"),
        value: ProjectPriorityEnum,
    }),
]).and(
    z.object({
        projectId: z.string().min(1, "Project ID is required."),
    })
);