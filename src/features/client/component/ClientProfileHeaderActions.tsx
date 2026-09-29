"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditClientDialog, type ClientForEdit } from "@/features/client/component/EditClientDialog";

interface ClientProfileHeaderActionsProps {
    slug: string;
    client: ClientForEdit;
}

export function ClientProfileHeaderActions({ slug, client }: ClientProfileHeaderActionsProps) {
    const [editOpen, setEditOpen] = useState(false);

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setEditOpen(true)}
            >
                <Pencil className="size-3.5" />
                Edit Profile
            </Button>

            <EditClientDialog
                slug={slug}
                client={client}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </>
    );
}
