import { Skeleton } from "@/components/ui/skeleton"

export default function CalendarLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col gap-2 mb-8">
        <Skeleton className="h-10 w-64 bg-surface-container" />
        <Skeleton className="h-6 w-96 bg-surface-container" />
      </div>

      <div className="space-y-8">
        {[1, 2, 3].map((month) => (
          <div key={month} className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-32 bg-surface-container" />
              <div className="flex-1 h-[1px] bg-outline-variant/30"></div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((card) => (
                <Skeleton key={card} className="h-32 w-full rounded-2xl bg-surface-container-lowest border border-outline-variant" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
