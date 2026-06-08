export default function ProjectDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back button skeleton */}
      <div className="h-4 w-32 bg-black/5 dark:bg-zinc-800 rounded"></div>

      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-black/5 dark:bg-zinc-900/50 p-6 rounded-xl border border-black/5 dark:border-zinc-800">
        <div className="space-y-4 w-full">
          <div className="flex items-center gap-3">
            <div className="h-8 w-48 bg-black/10 dark:bg-zinc-800 rounded-md"></div>
            <div className="h-6 w-24 bg-black/10 dark:bg-zinc-800 rounded-full"></div>
          </div>
          <div className="flex gap-4">
            <div className="h-4 w-32 bg-black/10 dark:bg-zinc-800 rounded"></div>
            <div className="h-4 w-32 bg-black/10 dark:bg-zinc-800 rounded"></div>
            <div className="h-4 w-32 bg-black/10 dark:bg-zinc-800 rounded"></div>
          </div>
        </div>
        <div className="w-full md:w-auto flex flex-col gap-4">
          <div className="h-20 w-full md:w-40 bg-black/10 dark:bg-zinc-800 rounded-lg"></div>
          <div className="h-10 w-full md:w-40 bg-black/10 dark:bg-zinc-800 rounded-lg"></div>
        </div>
      </div>

      {/* AI Analysis Skeleton */}
      <div className="h-48 bg-black/5 dark:bg-zinc-900/50 rounded-xl border border-black/5 dark:border-zinc-800"></div>

      {/* Logs Skeleton */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="h-6 w-32 bg-black/10 dark:bg-zinc-800 rounded"></div>
          <div className="h-6 w-20 bg-black/10 dark:bg-zinc-800 rounded-full"></div>
        </div>
        <div className="h-64 bg-black/5 dark:bg-zinc-900/50 rounded-xl border border-black/5 dark:border-zinc-800"></div>
      </div>
    </div>
  )
}
