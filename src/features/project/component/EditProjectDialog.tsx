"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2, Check, ChevronsUpDown, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { updateProjectDetails } from "@/features/project/action/update-project-details";
import type { ProjectListItem } from "@/app/w/[slug]/(dashboard)/projects/page";

// ─── Schema ───────────────────────────────────────────────────────────────────

const editProjectSchema = z.object({
    title: z
        .string()
        .min(2, "Project name must be at least 2 characters.")
        .max(100, "Project name is too long."),
    description: z.string().optional().nullable(),
    dueDate: z.string().optional().nullable(),
    budget: z.coerce.number().min(0, "Budget cannot be negative.").optional().nullable(),
    clientId: z.string().min(1, "A client must be selected."),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

type EditFormValues = z.infer<typeof editProjectSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditProjectDialogProps {
    project: ProjectListItem;
    slug: string;
    clients: { id: string; name: string }[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditProjectDialog({
    project,
    slug,
    clients,
    open,
    onOpenChange,
}: EditProjectDialogProps) {
    const [clientComboOpen, setClientComboOpen] = useState(false);

    const defaultValues: EditFormValues = {
        title: project.title,
        description: null,
        dueDate: project.dueDate
            ? format(new Date(project.dueDate), "yyyy-MM-dd")
            : null,
        budget: project.budget != null ? project.budget / 100 : null,
        clientId: project.client.id,
        priority: project.priority,
    };

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<EditFormValues>({
        resolver: zodResolver(editProjectSchema) as never,
        defaultValues,
    });

    // Reset defaults whenever the dialog re-opens for a (potentially) different project
    useEffect(() => {
        if (open) reset(defaultValues);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, project.id]);

    const selectedClientId = watch("clientId");
    const selectedClient = clients.find((c) => c.id === selectedClientId);

    // ── Dirty-state close guard ────────────────────────────────────────────────
    function requestClose() {
        if (isDirty) {
            if (window.confirm("You have unsaved changes. Discard them?")) {
                confirmDiscard();
            }
        } else {
            onOpenChange(false);
        }
    }

    function confirmDiscard() {
        reset(defaultValues);
        onOpenChange(false);
    }

    // ── Submit ─────────────────────────────────────────────────────────────────
    async function onSubmit(values: EditFormValues) {
        const result = await updateProjectDetails(slug, {
            projectId: project.id,
            title: values.title,
            description: values.description ?? null,
            dueDate: values.dueDate ?? null,
            budget: values.budget ?? null,
        });

        if (result.success) {
            toast.success("Project updated.");
            onOpenChange(false);
        } else if ("fieldErrors" in result) {
            const first = Object.values(result.fieldErrors)[0]?.[0];
            toast.error(first ?? "Validation error.");
        } else {
            toast.error(result.error ?? "Failed to update project.");
        }
    }

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={(next) => {
                    // Intercept closure (overlay click, Escape) — guard dirty state
                    if (!next) {
                        requestClose();
                    } else {
                        onOpenChange(true);
                    }
                }}
            >
                <DialogContent
                    className="sm:max-w-[520px]"
                    // Override default close behavior to apply dirty guard
                    onInteractOutside={(e) => {
                        e.preventDefault();
                        requestClose();
                    }}
                    onEscapeKeyDown={(e) => {
                        e.preventDefault();
                        requestClose();
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                        <DialogDescription>
                            Update project details. Changes are saved only on submit.
                        </DialogDescription>
                    </DialogHeader>

                    {isDirty && (
                        <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
                            <AlertCircle className="size-3.5 shrink-0" />
                            You have unsaved changes.
                        </div>
                    )}

                    <form
                        id="edit-project-form"
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col gap-4 pt-1"
                    >
                        {/* Title */}
                        <Field>
                            <FieldLabel htmlFor="edit-title">Project Name *</FieldLabel>
                            <Input
                                id="edit-title"
                                {...register("title")}
                                placeholder="e.g. Brand Refresh 2025"
                                aria-invalid={!!errors.title}
                            />
                            {errors.title && (
                                <FieldError>{errors.title.message}</FieldError>
                            )}
                        </Field>

                        {/* Client combobox */}
                        <Field>
                            <FieldLabel>Client *</FieldLabel>
                            <Controller
                                name="clientId"
                                control={control}
                                render={({ field }) => (
                                    <Popover
                                        open={clientComboOpen}
                                        onOpenChange={setClientComboOpen}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={clientComboOpen}
                                                className={cn(
                                                    "w-full justify-between font-normal",
                                                    !selectedClient &&
                                                        "text-muted-foreground",
                                                )}
                                            >
                                                {selectedClient?.name ?? "Select client..."}
                                                <ChevronsUpDown className="ml-2 size-4 opacity-50 shrink-0" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search clients..." />
                                                <CommandList>
                                                    <CommandEmpty>No clients found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {clients.map((c) => (
                                                            <CommandItem
                                                                key={c.id}
                                                                value={c.name}
                                                                onSelect={() => {
                                                                    field.onChange(c.id);
                                                                    setClientComboOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 size-4",
                                                                        field.value === c.id
                                                                            ? "opacity-100"
                                                                            : "opacity-0",
                                                                    )}
                                                                />
                                                                {c.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            {errors.clientId && (
                                <FieldError>{errors.clientId.message}</FieldError>
                            )}
                        </Field>

                        {/* Priority */}
                        <Field>
                            <FieldLabel>Priority</FieldLabel>
                            <Controller
                                name="priority"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger
                                            id="edit-priority"
                                            aria-label="Select priority"
                                        >
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">Low</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="HIGH">High</SelectItem>
                                            <SelectItem value="URGENT">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </Field>

                        {/* Due Date + Budget row */}
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="edit-dueDate">Due Date</FieldLabel>
                                <Input
                                    id="edit-dueDate"
                                    type="date"
                                    {...register("dueDate")}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="edit-budget">Budget ($)</FieldLabel>
                                <Input
                                    id="edit-budget"
                                    type="number"
                                    min={0}
                                    step={1}
                                    placeholder="e.g. 15000"
                                    {...register("budget")}
                                    aria-invalid={!!errors.budget}
                                />
                                {errors.budget && (
                                    <FieldError>{errors.budget.message}</FieldError>
                                )}
                            </Field>
                        </div>

                        {/* Description */}
                        <Field>
                            <FieldLabel htmlFor="edit-description">Description</FieldLabel>
                            <Textarea
                                id="edit-description"
                                {...register("description")}
                                className="resize-none"
                                rows={3}
                                placeholder="Optional project description..."
                            />
                        </Field>
                    </form>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={requestClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="edit-project-form"
                            disabled={isSubmitting || !isDirty}
                            className="gap-2"
                            aria-label="Save project changes"
                        >
                            {isSubmitting && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Discard-changes guard — shown when closing with isDirty=true */}
        </>
    );
}
