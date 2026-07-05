"use client";

import { FolderOpen } from "lucide-react";
import { CreateProjectModal } from "@/features/project/component/CreateProjectModal";

interface ProjectEmptyStateProps {
    slug: string;
    memberRole: string;
    /** Clients to populate the modal combobox. Passed down from the Server Component. */
    clients: { id: string; name: string }[];
}

const canCreate = (role: string) =>
    role === "OWNER" || role === "ADMIN" || role === "MEMBER" || role === "FREELANCER";

export function ProjectEmptyState({ slug, memberRole, clients }: ProjectEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 mb-5">
                <FolderOpen className="size-8 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No projects yet</h3>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
                Create your first project to start tracking client work, budgets, and
                timelines in one place.
            </p>
            {canCreate(memberRole) && (
                <div className="mt-6">
                    {/* Pass real clients instead of an empty array */}
                    <CreateProjectModal slug={slug} clients={clients} memberRole={memberRole} />
                </div>
            )}
        </div>
    );
}
