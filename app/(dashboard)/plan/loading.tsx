import { Skeleton } from "@/components/ui/skeleton"

export default function PlanLoading() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col gap-2 mb-8">
        <Skeleton className="h-10 w-64 bg-surface-container" />
        <Skeleton className="h-6 w-96 bg-surface-container" />
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 sm:p-10 mb-8 sticky-note-shadow">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-48 bg-surface-container" />
          <Skeleton className="h-10 w-32 rounded-full bg-surface-container" />
        </div>
        
        <div className="space-y-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-32 bg-surface-container" />
              <div className="space-y-3">
                {[1, 2].map((j) => (
                  <Skeleton key={j} className="h-16 w-full rounded-2xl bg-surface-container-high" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
