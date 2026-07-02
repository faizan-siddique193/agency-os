"use client";

import { useRef, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
import {
    Field,
    FieldLabel,
    FieldError,
} from "@/components/ui/field";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/features/project/action/create-project";
import { createProjectSchema } from "@/features/project/schema/create-project.schema";
import type { z } from "zod";

type FormValues = z.infer<typeof createProjectSchema>;

interface CreateProjectModalProps {
    slug: string;
    clients: { id: string; name: string }[];
    memberRole: string;
}

const canCreate = (role: string) =>
    role === "OWNER" || role === "ADMIN" || role === "MEMBER" || role === "FREELANCER";

export function CreateProjectModal({
    slug,
    clients,
    memberRole,
}: CreateProjectModalProps) {
    const [open, setOpen] = useState(false);
    const [clientComboOpen, setClientComboOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const titleRef = useRef<HTMLInputElement | null>(null);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setError,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(createProjectSchema),
        defaultValues: {
            title: "",
            description: "",
            clientId: "",
            // priority is handled by Zod schema default
            dueDate: null,
        },
    });

    const selectedClientId = watch("clientId");
    const selectedClient = clients.find((c) => c.id === selectedClientId);

    useEffect(() => {
        if (open) {
            setTimeout(() => titleRef.current?.focus(), 50);
        } else {
            reset();
        }
    }, [open, reset]);

    if (!canCreate(memberRole)) return null;

    async function onSubmit(values) {
        setIsPending(true);
        try {
            const result = await createProject(slug, values);
            if (result.success) {
                toast.success("Project created successfully.");
                setOpen(false);
            } else if ("fieldErrors" in result) {
                Object.entries(result.fieldErrors).forEach(([field, messages]) => {
                    setError(field as keyof FormValues, {
                        message: messages[0],
                    });
                });
            } else {
                toast.error(result.error);
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
                    New Project
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Create Project</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new project.
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="create-project-form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-4 pt-2"
                >
                    {/* ── Project Name ── */}
                    <Field data-invalid={!!errors.title || undefined}>
                        <FieldLabel htmlFor="project-title">Project Name</FieldLabel>
                        <Input
                            id="project-title"
                            placeholder="e.g. Acme Corp Website Redesign"
                            autoComplete="off"
                            aria-invalid={!!errors.title}
                            aria-describedby={errors.title ? "project-title-error" : undefined}
                            {...register("title")}
                            ref={(el) => {
                                register("title").ref(el);
                                titleRef.current = el;
                            }}
                        />
                        <FieldError
                            id="project-title-error"
                            errors={errors.title ? [{ message: errors.title.message }] : undefined}
                        />
                    </Field>

                    {/* ── Client (Combobox) ── */}
                    <Field data-invalid={!!errors.clientId || undefined}>
                        <FieldLabel htmlFor="project-client-trigger">Client</FieldLabel>
                        <Controller
                            control={control}
                            name="clientId"
                            render={({ field }) => (
                                <Popover open={clientComboOpen} onOpenChange={setClientComboOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="project-client-trigger"
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={clientComboOpen}
                                            aria-invalid={!!errors.clientId}
                                            aria-describedby={errors.clientId ? "project-client-error" : undefined}
                                            className={cn(
                                                "w-full justify-between font-normal",
                                                !field.value && "text-muted-foreground",
                                            )}
                                        >
                                            {selectedClient?.name ?? "Select a client..."}
                                            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-[--radix-popover-trigger-width] p-0"
                                        align="start"
                                    >
                                        <Command>
                                            <CommandInput placeholder="Search clients..." />
                                            <CommandList>
                                                <CommandEmpty>No clients found.</CommandEmpty>
                                                <CommandGroup>
                                                    {clients.map((client) => (
                                                        <CommandItem
                                                            key={client.id}
                                                            value={client.name}
                                                            onSelect={() => {
                                                                field.onChange(client.id);
                                                                setClientComboOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 size-4",
                                                                    field.value === client.id
                                                                        ? "opacity-100"
                                                                        : "opacity-0",
                                                                )}
                                                            />
                                                            {client.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                        <FieldError
                            id="project-client-error"
                            errors={errors.clientId ? [{ message: errors.clientId.message }] : undefined}
                        />
                    </Field>

                    {/* ── Priority & Due Date ── */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field data-invalid={!!errors.priority || undefined}>
                            <FieldLabel htmlFor="project-priority-trigger">Priority</FieldLabel>
                            <Controller
                                control={control}
                                name="priority"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger
                                            id="project-priority-trigger"
                                            aria-invalid={!!errors.priority}
                                        >
                                            <SelectValue placeholder="Priority" />
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
                            <FieldError
                                errors={errors.priority ? [{ message: errors.priority.message }] : undefined}
                            />
                        </Field>

                        <Field data-invalid={!!errors.dueDate || undefined}>
                            <FieldLabel htmlFor="project-due-date">Due Date</FieldLabel>
                            <Controller
                                control={control}
                                name="dueDate"
                                render={({ field }) => (
                                    <Input
                                        id="project-due-date"
                                        type="date"
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.target.value || null)}
                                        aria-invalid={!!errors.dueDate}
                                        aria-describedby={errors.dueDate ? "project-due-date-error" : undefined}
                                    />
                                )}
                            />
                            <FieldError
                                id="project-due-date-error"
                                errors={errors.dueDate ? [{ message: errors.dueDate.message }] : undefined}
                            />
                        </Field>
                    </div>

                    {/* ── Description ── */}
                    <Field data-invalid={!!errors.description || undefined}>
                        <FieldLabel htmlFor="project-description">
                            Description{" "}
                            <span className="text-muted-foreground font-normal">(optional)</span>
                        </FieldLabel>
                        <Textarea
                            id="project-description"
                            placeholder="Brief project overview..."
                            className="resize-none"
                            rows={3}
                            aria-invalid={!!errors.description}
                            {...register("description")}
                        />
                        <FieldError
                            errors={errors.description ? [{ message: errors.description.message }] : undefined}
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
                        form="create-project-form"
                        disabled={isPending}
                        className="gap-2"
                    >
                        {isPending && <Loader2 className="size-4 animate-spin" />}
                        Create Project
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
