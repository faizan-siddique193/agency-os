import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { CreateClientModal } from "@/features/client/component/CreateClientModal";
import { ClientTable } from "@/features/client/component/ClientTable";

export const dynamic = "force-dynamic";

interface ClientsPageProps {
    params: Promise<{ slug: string }>;
}

export default async function ClientsPage({ params }: ClientsPageProps) {
    const { slug } = await params;

    const tenant = await getTenantContext(slug);
    if (!tenant) notFound();

    const clients = await prisma.client.findMany({
        where: { workspaceId: tenant.workspace.id },
        select: {
            id: true,
            name: true,
            contactName: true,
            contactEmail: true,
            notes: true,
            _count: {
                select: {
                    projects: {
                        where: {
                            deletedAt: null,
                            status: { in: ["ACTIVE", "DRAFT"] },
                        },
                    },
                },
            },
        },
        orderBy: { name: "asc" },
    });

    return (
        <div className="flex flex-col gap-6">
            {/* ── Page Header ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between w-full min-w-0">
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
                        Client Directory
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                        Manage all client relationships and contact details.
                    </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                    <CreateClientModal
                        slug={slug}
                        memberRole={tenant.membership.role}
                    />
                </div>
            </div>

            {/* ── Client Directory ─────────────────────────────────────────────── */}
            <ClientTable
                slug={slug}
                clients={clients}
                memberRole={tenant.membership.role}
            />
        </div>
    );
}
