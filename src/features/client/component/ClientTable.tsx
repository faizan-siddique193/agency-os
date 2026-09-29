"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, Folder, Pencil, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { EditClientDialog, type ClientForEdit } from "./EditClientDialog";
import { deleteClient } from "@/features/client/action/delete-client";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ClientListItem = {
    id: string;
    name: string;
    contactName: string | null;
    contactEmail: string | null;
    notes: string | null;
    _count: {
        projects: number;
    };
};

interface ClientTableProps {
    slug: string;
    clients: ClientListItem[];
    memberRole: string;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function getStatusBadge(projectCount: number) {
    if (projectCount === 0) {
        return (
            <Badge
                variant="outline"
                className="bg-gray-100 text-gray-600 border-gray-200 font-medium"
            >
                Paused
            </Badge>
        );
    }
    return (
        <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
        >
            Active
        </Badge>
    );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function ClientRow({
    slug,
    client,
    canManage,
    onEdit,
    onDelete,
}: {
    slug: string;
    client: ClientListItem;
    canManage: boolean;
    onEdit: (c: ClientListItem) => void;
    onDelete: (c: ClientListItem) => void;
}) {
    const initials = client.name.slice(0, 2).toUpperCase();
    const projectCount = client._count.projects;

    return (
        <tr className="group hover:bg-muted/40 transition-colors border-b border-border/50 last:border-0">
            {/* Client */}
            <td className="py-3.5 px-4">
                <Link
                    href={`/w/${slug}/clients/${client.id}`}
                    className="flex items-center gap-3 group/link"
                >
                    <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0 group-hover/link:bg-primary/20 transition-colors">
                        {initials}
                    </div>
                    <span className="font-medium text-sm text-foreground group-hover/link:text-primary transition-colors">
                        {client.name}
                    </span>
                </Link>
            </td>

            {/* Primary Contact */}
            <td className="py-3.5 px-4">
                <div className="flex flex-col gap-0.5">
                    {client.contactName ? (
                        <>
                            <span className="text-sm font-medium text-foreground">
                                {client.contactName}
                            </span>
                            {client.contactEmail && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Mail className="size-3" />
                                    {client.contactEmail}
                                </span>
                            )}
                        </>
                    ) : (
                        <span className="text-sm text-muted-foreground italic">—</span>
                    )}
                </div>
            </td>

            {/* Status */}
            <td className="py-3.5 px-4">{getStatusBadge(projectCount)}</td>

            {/* Active Projects */}
            <td className="py-3.5 px-4 text-center">
                {projectCount > 0 ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/60 border border-border rounded-md text-sm text-foreground">
                        <Folder className="size-3.5 text-muted-foreground" />
                        <span className="font-medium">{projectCount}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                )}
            </td>

            {/* Actions */}
            <td className="py-3.5 px-4 text-right">
                <div
                    className={cn(
                        "flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                        !canManage && "hidden",
                    )}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => onEdit(client)}
                        aria-label={`Edit ${client.name}`}
                    >
                        <Pencil className="size-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(client)}
                        aria-label={`Delete ${client.name}`}
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            </td>
        </tr>
    );
}

// ─── Main Table ───────────────────────────────────────────────────────────────

export function ClientTable({ slug, clients, memberRole }: ClientTableProps) {
    const canManage =
        memberRole === "OWNER" || memberRole === "ADMIN";

    const [search, setSearch] = useState("");
    const [editTarget, setEditTarget] = useState<ClientListItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ClientListItem | null>(null);
    const [isPending, startTransition] = useTransition();

    const filtered = clients.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            (c.contactName?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
            (c.contactEmail?.toLowerCase() ?? "").includes(search.toLowerCase()),
    );

    function handleConfirmDelete() {
        if (!deleteTarget) return;
        const target = deleteTarget;
        setDeleteTarget(null);
        startTransition(async () => {
            const result = await deleteClient(slug, { clientId: target.id });
            if (result.success) {
                toast.success(`"${target.name}" has been deleted.`);
            } else {
                toast.error(result.error);
            }
        });
    }

    // ── Stats ──────────────────────────────────────────────────────────────────
    const totalActive = clients.filter((c) => c._count.projects > 0).length;
    const totalPaused = clients.filter((c) => c._count.projects === 0).length;

    return (
        <div className="flex flex-col gap-6">
            {/* ── Metrics Row ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricCard
                    label="Total Clients"
                    value={clients.length}
                    iconClass="text-muted-foreground"
                />
                <MetricCard
                    label="Active Clients"
                    value={totalActive}
                    valueClass="text-primary"
                    iconClass="text-primary"
                />
                <MetricCard
                    label="Paused Clients"
                    value={totalPaused}
                    valueClass="text-muted-foreground"
                    iconClass="text-muted-foreground"
                />
            </div>

            {/* ── Directory Table ─────────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                {/* Toolbar */}
                <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 bg-muted/30">
                    <div className="relative flex-1 max-w-xs">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <svg
                                className="size-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search clients…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition placeholder:text-muted-foreground"
                        />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {filtered.length} of {clients.length} clients
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-muted/20 border-b border-border">
                                <th className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[28%]">
                                    Client
                                </th>
                                <th className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[30%]">
                                    Primary Contact
                                </th>
                                <th className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[15%]">
                                    Status
                                </th>
                                <th className="py-2.5 px-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[15%]">
                                    Active Projects
                                </th>
                                <th className="py-2.5 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[12%]">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-card">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-16 text-center text-sm text-muted-foreground"
                                    >
                                        {search
                                            ? `No clients matching "${search}".`
                                            : "No clients yet. Add your first client to get started."}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((client) => (
                                    <ClientRow
                                        key={client.id}
                                        slug={slug}
                                        client={client}
                                        canManage={canManage}
                                        onEdit={setEditTarget}
                                        onDelete={setDeleteTarget}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-border bg-muted/20">
                    <span className="text-xs text-muted-foreground">
                        Showing {filtered.length} of {clients.length} entries
                    </span>
                </div>
            </div>

            {/* ── Edit Dialog ─────────────────────────────────────────────────── */}
            {editTarget && (
                <EditClientDialog
                    slug={slug}
                    client={editTarget as ClientForEdit}
                    open={!!editTarget}
                    onOpenChange={(open) => {
                        if (!open) setEditTarget(null);
                    }}
                />
            )}

            {/* ── Delete Confirmation ─────────────────────────────────────────── */}
            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="size-5 text-destructive" />
                            Delete Client
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-foreground">
                                {deleteTarget?.name}
                            </span>
                            ? This action cannot be undone and will remove all associated records.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Client
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({
    label,
    value,
    valueClass = "text-foreground",
    iconClass = "text-muted-foreground",
}: {
    label: string;
    value: number;
    valueClass?: string;
    iconClass?: string;
}) {
    return (
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {label}
                </span>
                <div
                    className={cn(
                        "w-8 h-8 rounded-full bg-muted flex items-center justify-center",
                        iconClass,
                    )}
                >
                    <Folder className="size-4" />
                </div>
            </div>
            <span className={cn("text-3xl font-bold tracking-tight", valueClass)}>
                {value}
            </span>
        </div>
    );
}
