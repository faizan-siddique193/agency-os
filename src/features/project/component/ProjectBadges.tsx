import { cn } from "@/lib/utils";
import type { ProjectStatus, ProjectHealth, ProjectPriority } from "@/generated/prisma";

const STATUS_CONFIG: Record<
    ProjectStatus,
    { label: string; className: string }
> = {
    DRAFT: {
        label: "Draft",
        className: "bg-muted text-muted-foreground border-border",
    },
    ACTIVE: {
        label: "Active",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    },
    COMPLETED: {
        label: "Completed",
        className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
    },
    ARCHIVED: {
        label: "Archived",
        className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
    },
};

const HEALTH_CONFIG: Record<
    ProjectHealth,
    { label: string; className: string; dot: string }
> = {
    ON_TRACK: {
        label: "On Track",
        className: "text-emerald-700 dark:text-emerald-400",
        dot: "bg-emerald-500",
    },
    AT_RISK: {
        label: "At Risk",
        className: "text-amber-700 dark:text-amber-400",
        dot: "bg-amber-500",
    },
    BLOCKED: {
        label: "Blocked",
        className: "text-red-700 dark:text-red-400",
        dot: "bg-red-500",
    },
};

const PRIORITY_CONFIG: Record<
    ProjectPriority,
    { label: string; className: string }
> = {
    LOW: { label: "Low", className: "text-muted-foreground" },
    MEDIUM: { label: "Medium", className: "text-amber-600 dark:text-amber-400" },
    HIGH: { label: "High", className: "text-orange-600 dark:text-orange-400" },
    URGENT: { label: "Urgent", className: "text-red-600 dark:text-red-400 font-semibold" },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
    const config = STATUS_CONFIG[status];
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                config.className,
            )}
        >
            {config.label}
        </span>
    );
}

export function HealthBadge({ health }: { health: ProjectHealth }) {
    const config = HEALTH_CONFIG[health];
    return (
        <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", config.className)}>
            <span className={cn("size-1.5 rounded-full", config.dot)} />
            {config.label}
        </span>
    );
}

export function PriorityBadge({ priority }: { priority: ProjectPriority }) {
    const config = PRIORITY_CONFIG[priority];
    return (
        <span className={cn("text-xs font-medium", config.className)}>
            {config.label}
        </span>
    );
}
