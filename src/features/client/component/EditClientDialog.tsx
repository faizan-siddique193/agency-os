"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateClient } from "@/features/client/action/update-client";
import { updateClientSchema } from "@/features/client/schema/update-client.schema";
import type { z } from "zod";

type FormValues = z.infer<typeof updateClientSchema>;

export interface ClientForEdit {
    id: string;
    name: string;
    contactName: string | null;
    contactEmail: string | null;
    notes: string | null;
}

interface EditClientDialogProps {
    slug: string;
    client: ClientForEdit;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditClientDialog({
    slug,
    client,
    open,
    onOpenChange,
}: EditClientDialogProps) {
    const [isPending, setIsPending] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(updateClientSchema) as never,
        defaultValues: {
            clientId: client.id,
            name: client.name,
            contactName: client.contactName ?? "",
            contactEmail: client.contactEmail ?? "",
            notes: client.notes ?? "",
        },
    });

    // Sync form values when the targeted client changes
    useEffect(() => {
        reset({
            clientId: client.id,
            name: client.name,
            contactName: client.contactName ?? "",
            contactEmail: client.contactEmail ?? "",
            notes: client.notes ?? "",
        });
    }, [client, reset]);

    async function onSubmit(values: FormValues) {
        setIsPending(true);
        try {
            const result = await updateClient(slug, values);
            if (result.success) {
                toast.success("Client updated successfully.");
                onOpenChange(false);
            } else if ("fieldErrors" in result) {
                Object.entries(result.fieldErrors).forEach(([field, messages]) => {
                    setError(field as keyof FormValues, { message: messages[0] });
                });
            } else {
                toast.error(result.error);
            }
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Edit Client</DialogTitle>
                    <DialogDescription>
                        Update the details for <span className="font-medium">{client.name}</span>.
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="edit-client-form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-4 pt-2"
                >
                    {/* Hidden clientId */}
                    <input type="hidden" {...register("clientId")} />

                    {/* ── Company Name ── */}
                    <Field data-invalid={!!errors.name || undefined}>
                        <FieldLabel htmlFor="edit-client-name">Company Name</FieldLabel>
                        <Input
                            id="edit-client-name"
                            placeholder="e.g. TechCorp"
                            autoComplete="off"
                            aria-invalid={!!errors.name}
                            {...register("name")}
                        />
                        <FieldError
                            errors={errors.name ? [{ message: errors.name.message }] : undefined}
                        />
                    </Field>

                    {/* ── Contact Name ── */}
                    <Field data-invalid={!!errors.contactName || undefined}>
                        <FieldLabel htmlFor="edit-client-contact-name">
                            Primary Contact{" "}
                            <span className="text-muted-foreground font-normal">(optional)</span>
                        </FieldLabel>
                        <Input
                            id="edit-client-contact-name"
                            placeholder="e.g. Sarah Jenkins"
                            autoComplete="off"
                            aria-invalid={!!errors.contactName}
                            {...register("contactName")}
                        />
                        <FieldError
                            errors={
                                errors.contactName
                                    ? [{ message: errors.contactName.message }]
                                    : undefined
                            }
                        />
                    </Field>

                    {/* ── Contact Email ── */}
                    <Field data-invalid={!!errors.contactEmail || undefined}>
                        <FieldLabel htmlFor="edit-client-contact-email">
                            Contact Email{" "}
                            <span className="text-muted-foreground font-normal">(optional)</span>
                        </FieldLabel>
                        <Input
                            id="edit-client-contact-email"
                            type="email"
                            placeholder="e.g. sarah@techcorp.com"
                            autoComplete="off"
                            aria-invalid={!!errors.contactEmail}
                            {...register("contactEmail")}
                        />
                        <FieldError
                            errors={
                                errors.contactEmail
                                    ? [{ message: errors.contactEmail.message }]
                                    : undefined
                            }
                        />
                    </Field>

                    {/* ── Internal Notes ── */}
                    <Field data-invalid={!!errors.notes || undefined}>
                        <FieldLabel htmlFor="edit-client-notes">
                            Internal Notes{" "}
                            <span className="text-muted-foreground font-normal">(optional)</span>
                        </FieldLabel>
                        <Textarea
                            id="edit-client-notes"
                            placeholder="Add internal notes about this client…"
                            className="resize-none"
                            rows={3}
                            aria-invalid={!!errors.notes}
                            {...register("notes")}
                        />
                        <FieldError
                            errors={
                                errors.notes ? [{ message: errors.notes.message }] : undefined
                            }
                        />
                    </Field>
                </form>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="edit-client-form"
                        disabled={isPending}
                        className="gap-2"
                    >
                        {isPending && <Loader2 className="size-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
