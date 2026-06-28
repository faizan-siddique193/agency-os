import { getTenantContext } from "@/lib/auth/tenant-context";
import { AppSidebar } from "@/features/dashboard/component/app-sidebar";
import { TopHeader } from "@/features/dashboard/component/top-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
    children: React.ReactNode;
    params: Promise<{
        slug: string;
    }>;
}

// Server Component — getTenantContext handles its own auth redirect internally
export default async function DashboardLayout({
    children,
    params,
}: DashboardLayoutProps) {

    const { slug } = await params;

    const tenant = await getTenantContext(slug);

    return (
        <SidebarProvider>
            {/*
        AppSidebar must be a *direct* child of SidebarProvider — do NOT wrap
        it inside another flex container, or mobile sheet positioning breaks.
      */}
            <AppSidebar
                workspace={tenant.workspace}
                role={tenant.membership.role}
                user={tenant.user}
            />

            <SidebarInset>
                <TopHeader user={tenant.user} workspace={tenant.workspace} />

                <main className="flex flex-1 flex-col gap-4 p-6 lg:p-8">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
