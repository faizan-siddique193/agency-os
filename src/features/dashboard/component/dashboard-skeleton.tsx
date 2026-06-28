import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar Skeleton */}
      <div className="hidden lg:flex w-64 flex-col border-r border-border bg-sidebar px-4 py-0">
        <div className="flex h-14 flex-col justify-center border-b border-border pt-1">
          <Skeleton className="h-5 w-24 mb-1" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex-1 py-4">
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-md" />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-border py-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Skeleton */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 lg:hidden" />
            <div className="hidden md:flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <span className="text-muted-foreground/30">/</span>
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="ml-auto">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </header>
        
        {/* Main Content Skeleton */}
        <main className="flex-1 p-6 lg:p-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </main>
      </div>
    </div>
  );
}
