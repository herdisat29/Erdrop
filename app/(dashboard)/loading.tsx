import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Skeleton */}
      <div className="pt-4 mb-8">
        <Skeleton className="h-10 w-48 bg-surface-container mb-2" />
        <Skeleton className="h-5 w-72 bg-surface-container" />
      </div>

      {/* Grid Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl bg-surface-container-lowest border border-outline-variant" />
        ))}
      </div>

      {/* Analytics Skeleton */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 mb-8">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="h-8 w-8 rounded-full bg-surface-container" />
          <Skeleton className="h-8 w-32 bg-surface-container" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-2xl bg-surface-container mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl bg-surface-container" />
          ))}
        </div>
      </div>
    </div>
  )
}
