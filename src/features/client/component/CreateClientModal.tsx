"use client";

import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/features/client/action/create-client";
import { createClientSchema } from "@/features/client/schema/create-client.schema";
import type { z } from "zod";

type FormValues = z.infer<typeof createClientSchema>;

interface CreateClientModalProps {
    slug: string;
    memberRole: string;
}

const canCreate = (role: string) =>
    role === "OWNER" || role === "ADMIN" || role === "MEMBER";

export function CreateClientModal({ slug, memberRole }: CreateClientModalProps) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const nameRef = useRef<HTMLInputElement | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(createClientSchema) as never,
        defaultValues: {
            name: "",
            contactName: "",
            contactEmail: "",
        },
    });

    useEffect(() => {
        if (open) {
            setTimeout(() => nameRef.current?.focus(), 50);
        } else {
            reset();
        }
    }, [open, reset]);

    if (!canCreate(memberRole)) return null;

    async function onSubmit(values: FormValues) {
        setIsPending(true);
        try {
            const result = await createClient(slug, values);
            if (result.success) {
                toast.success("Client created successfully.");
                setOpen(false);
            } else if (typeof result.error === "object" && result.error !== null) {
                Object.entries(result.error as Record<string, string[]>).forEach(
                    ([field, messages]) => {
                        setError(field as keyof FormValues, { message: messages[0] });
                    },
                );
            } else {
                toast.error(typeof result.error === "string" ? result.error : "An error occurred.");
            }
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                    <Plus className="size-4" />
                    Add Client
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Add Client</DialogTitle>
                    <DialogDescription>
                        Add a new client to your workspace. You can fill in contact details later.
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="create-client-form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-4 pt-2"
                >
                    {/* ── Company Name ── */}
                    <Field data-invalid={!!errors.name || undefined}>
                        <FieldLabel htmlFor="client-name">Company Name</FieldLabel>
                        <Input
                            id="client-name"
                            placeholder="e.g. TechCorp"
                            autoComplete="off"
                            aria-invalid={!!errors.name}
                            aria-describedby={errors.name ? "client-name-error" : undefined}
                            {...register("name")}
                            ref={(el) => {
                                register("name").ref(el);
                                nameRef.current = el;
                            }}
                        />
                        <FieldError
                            id="client-name-error"
                            errors={errors.name ? [{ message: errors.name.message }] : undefined}
                        />
                    </Field>

                    {/* ── Contact Name ── */}
                    <Field data-invalid={!!errors.contactName || undefined}>
                        <FieldLabel htmlFor="client-contact-name">
                            Primary Contact{" "}
                            <span className="text-muted-foreground font-normal">(optional)</span>
                        </FieldLabel>
                        <Input
                            id="client-contact-name"
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
                        <FieldLabel htmlFor="client-contact-email">
                            Contact Email{" "}
                            <span className="text-muted-foreground font-normal">(optional)</span>
                        </FieldLabel>
                        <Input
                            id="client-contact-email"
                            type="email"
                            placeholder="e.g. sarah@techcorp.com"
                            autoComplete="off"
                            aria-invalid={!!errors.contactEmail}
                            aria-describedby={
                                errors.contactEmail ? "client-contact-email-error" : undefined
                            }
                            {...register("contactEmail")}
                        />
                        <FieldError
                            id="client-contact-email-error"
                            errors={
                                errors.contactEmail
                                    ? [{ message: errors.contactEmail.message }]
                                    : undefined
                            }
                        />
                    </Field>
                </form>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="create-client-form"
                        disabled={isPending}
                        className="gap-2"
                    >
                        {isPending && <Loader2 className="size-4 animate-spin" />}
                        Add Client
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
