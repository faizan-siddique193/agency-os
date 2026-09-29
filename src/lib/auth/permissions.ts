import { Role } from "@/generated/prisma/client";

//Define all possible actions in the system to prevent typos
export type Permission =
    | "workspace:manage" // For billing, deleting the workspace, managing roles
    | "project:create"
    | "project:view"
    | "project:update"
    | "project:delete"
    | "client:create"
    | "client:view"
    | "client:update"
    | "client:delete";

// The Centralized Dictionary
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    OWNER: [
        "workspace:manage",
        "project:create", "project:view", "project:update", "project:delete",
        "client:create", "client:view", "client:update", "client:delete"
    ],
    ADMIN: [
        "project:create", "project:view", "project:update", "project:delete",
        "client:create", "client:view", "client:update", "client:delete"
    ],
    MEMBER: [
        "project:create", "project:view", "project:update",
        "client:view"
    ],
    FREELANCER: [
        "project:view", "project:update"
    ],
    CLIENT: [
        "project:view"
    ],
};

//The Base Checker Function
export function hasGlobalPermission(role: Role, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role].includes(permission);
}