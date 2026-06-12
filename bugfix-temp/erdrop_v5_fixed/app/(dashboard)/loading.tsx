import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex h-[80vh] items-center justify-center animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
          <Loader2 className="h-10 w-10 animate-spin text-violet-500 relative z-10" />
        </div>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Loading content...</p>
      </div>
    </div>
  )
}
