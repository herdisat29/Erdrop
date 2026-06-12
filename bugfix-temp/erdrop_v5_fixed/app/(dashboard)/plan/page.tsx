'use client'

import { useState, useTransition, useEffect } from 'react'
import { generateFarmingPlan, getFarmingPlan, deleteFarmingPlan } from '@/app/actions/plan'
import { BrainCircuit, Loader2, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface PlanWeek {
  weekNumber: number
  title: string
  tasks: { projectName: string; actionItem: string }[]
}

export default function FarmingPlanPage() {
  const [isPending, startTransition] = useTransition()
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [plan, setPlan] = useState<PlanWeek[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [remaining, setRemaining] = useState<number>(5)

  useEffect(() => {
    async function loadPlan() {
      const result = await getFarmingPlan()
      if (result.plan) {
        setPlan(result.plan)
      }
      setRemaining(result.remaining ?? 5)
      setIsLoading(false)
    }
    loadPlan()
  }, [])

  const handleGenerate = () => {
    startTransition(async () => {
      setError(null)
      const result = await generateFarmingPlan()
      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else if (result.plan) {
        setPlan(result.plan)
        setRemaining(result.remaining ?? 0)
        toast.success('Masterplan generated!')
      }
    })
  }

  // [NEW] Delete existing plan then regenerate fresh
  const handleRegenerate = async () => {
    setIsRegenerating(true)
    setError(null)
    try {
      const del = await deleteFarmingPlan()
      if (del.error) {
        toast.error(del.error)
        return
      }
      setPlan(null)
      // Now generate fresh
      const result = await generateFarmingPlan()
      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else if (result.plan) {
        setPlan(result.plan)
        setRemaining(result.remaining ?? 0)
        toast.success('Plan regenerated!')
      }
    } finally {
      setIsRegenerating(false)
    }
  }

  const isWorking = isPending || isRegenerating

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 pb-6">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
          Masterplan
        </h1>
        <p className="font-body-md text-on-surface-variant text-sm">
          AI-Generated Weekly Farming Strategy
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      ) : !plan ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant sticky-note-shadow p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/20 mx-auto mb-4">
            <BrainCircuit className="h-8 w-8 text-primary" />
          </div>
          <p className="text-on-surface font-headline-md mb-2">
            Ready to generate your optimal route?
          </p>
          <p className="text-on-surface-variant font-label-sm mb-2 max-w-md mx-auto">
            Our AI will analyze your active projects, difficulty, and deadlines to construct a step-by-step 4-week execution plan.
          </p>

          {/* [NEW] Rate limit indicator */}
          <p className="text-xs text-on-surface-variant/60 mb-8">
            {remaining} generation{remaining !== 1 ? 's' : ''} remaining today
          </p>

          {error && (
            <div className="mb-6 p-4 bg-error-container/50 border border-error/30 text-error rounded-2xl font-label-bold text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isWorking || remaining === 0}
            className="font-label-bold uppercase tracking-widest bg-primary text-on-primary hover:bg-primary/90 rounded-full squishy-interaction gap-2 shadow-md px-8 py-3 text-base"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Pipeline...
              </>
            ) : (
              'Generate Masterplan'
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {plan.map((week, index) => (
            <div key={index} className="relative">
              {index !== plan.length - 1 && (
                <div className="absolute left-8 top-20 bottom-[-1.5rem] w-0.5 bg-outline-variant z-0 hidden md:block" />
              )}

              <div className="relative z-10 bg-surface-container-lowest rounded-3xl border border-outline-variant sticky-note-shadow p-6 md:p-8 hover:scale-[1.01] transition-transform duration-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 shrink-0 rounded-2xl bg-primary-container flex items-center justify-center font-black text-xl text-on-primary-container">
                    {week.weekNumber}
                  </div>
                  <h2 className="font-headline-md text-on-surface">
                    {week.title}
                  </h2>
                </div>

                <div className="space-y-3 pl-0 md:pl-[4.5rem]">
                  {week.tasks.map((task, tIdx) => (
                    <div key={tIdx} className="border-l-2 border-primary pl-4 py-1.5">
                      <h4 className="font-label-bold text-primary uppercase tracking-widest text-xs mb-1">
                        {task.projectName}
                      </h4>
                      <p className="text-on-surface-variant text-sm leading-relaxed">
                        {task.actionItem}
                      </p>
                    </div>
                  ))}
                  {week.tasks.length === 0 && (
                    <p className="text-on-surface-variant italic text-sm">No specific tasks for this week.</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* [NEW] Regenerate section with rate limit info */}
          <div className="pt-4 flex flex-col items-center gap-3">
            <p className="text-xs text-on-surface-variant/60">
              {remaining} generation{remaining !== 1 ? 's' : ''} remaining today
            </p>
            {error && (
              <div className="p-4 bg-error-container/50 border border-error/30 text-error rounded-2xl font-label-bold text-sm text-center max-w-md">
                {error}
              </div>
            )}
            <Button
              onClick={handleRegenerate}
              disabled={isWorking || remaining === 0}
              variant="outline"
              className="font-label-bold uppercase tracking-widest bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high rounded-full squishy-interaction gap-2 px-6"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Regenerate Plan
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
