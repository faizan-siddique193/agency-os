import { Skeleton } from "@/components/ui/skeleton";

export function ProjectsListSkeleton() {
    return (
        <div className="rounded-lg border border-border overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-4 py-3 flex gap-8">
                {["Name", "Client", "Status", "Health", "Lead", "Due Date", "Budget"].map((h) => (
                    <Skeleton key={h} className="h-3.5 w-16 rounded" />
                ))}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-8 px-4 py-3.5 border-b border-border last:border-0"
                >
                    <Skeleton className="h-4 w-40 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                </div>
            ))}
        </div>
    );
}

export function ProjectWarRoomSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-7 w-72 rounded" />
                    <Skeleton className="h-4 w-48 rounded" />
                </div>
                <Skeleton className="h-9 w-28 rounded-md" />
            </div>
            <div className="flex gap-2 border-b border-border pb-0">
                {["Overview", "People", "Settings"].map((t) => (
                    <Skeleton key={t} className="h-8 w-20 rounded-t-md" />
                ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-lg border border-border p-4 flex flex-col gap-2">
                        <Skeleton className="h-3.5 w-20 rounded" />
                        <Skeleton className="h-6 w-28 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}
