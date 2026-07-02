import type { Role } from "@/generated/prisma";

export type Permission =
    | "project:create"
    | "project:update"
    | "project:delete"
    | "workspace:manage"
    | "member:invite"
    | "member:remove"
    | "billing:manage";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    OWNER: [
        "project:create",
        "project:update",
        "project:delete",
        "workspace:manage",
        "member:invite",
        "member:remove",
        "billing:manage",
    ],
    ADMIN: [
        "project:create",
        "project:update",
        "project:delete",
        "member:invite",
        "member:remove",
    ],
    MEMBER: [
        "project:create",
        "project:update",
    ],
    FREELANCER: [
        "project:update",
    ],
    CLIENT: [],
};

export function hasGlobalPermission(role: Role, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
