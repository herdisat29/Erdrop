'use client'

import { useState, useTransition, useEffect } from 'react'
import { generateFarmingPlan, getFarmingPlan } from '@/app/actions/plan'
import { BrainCircuit } from 'lucide-react'

interface PlanWeek {
  weekNumber: number
  title: string
  tasks: { projectName: string; actionItem: string }[]
}

export default function FarmingPlanPage() {
  const [isPending, startTransition] = useTransition()
  const [plan, setPlan] = useState<PlanWeek[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadPlan() {
      const result = await getFarmingPlan()
      if (result.plan) {
        setPlan(result.plan)
      }
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
      } else if (result.plan) {
        setPlan(result.plan)
      }
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 border-b-4 border-zinc-900 dark:border-white pb-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white flex items-center gap-3">
          <BrainCircuit className="h-10 w-10" />
          Masterplan
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest text-sm">
          AI-Generated Weekly Farming Strategy
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-white"></div>
        </div>
      ) : !plan ? (
        <div className="bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-8 text-center">
          <p className="text-zinc-900 dark:text-white font-bold text-lg uppercase tracking-tight mb-4">
            Ready to generate your optimal route?
          </p>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-md mx-auto">
            Our AI will analyze your active projects, difficulty, and deadlines to construct a step-by-step 4-week execution plan.
          </p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border-2 border-red-900 dark:border-red-500 text-red-900 dark:text-red-400 font-bold">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isPending}
            className="font-black text-xl uppercase px-8 py-4 border-2 border-zinc-900 dark:border-white bg-violet-200 dark:bg-violet-900 text-violet-900 dark:text-violet-100 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none disabled:opacity-50 disabled:transform-none transition-all"
          >
            {isPending ? 'Generating Pipeline...' : 'Generate Masterplan'}
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {plan.map((week, index) => (
            <div key={index} className="relative">
              {/* Timeline Connector */}
              {index !== plan.length - 1 && (
                <div className="absolute left-8 top-20 bottom-[-3rem] w-1 bg-zinc-900 dark:bg-white z-0 hidden md:block" />
              )}
              
              <div className="relative z-10 bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 shrink-0 border-2 border-zinc-900 dark:border-white bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-black text-2xl text-zinc-900 dark:text-white">
                    {week.weekNumber}
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                    {week.title}
                  </h2>
                </div>

                <div className="space-y-4 pl-0 md:pl-20">
                  {week.tasks.map((task, tIdx) => (
                    <div key={tIdx} className="border-l-4 border-violet-500 pl-4 py-1">
                      <h4 className="font-bold text-zinc-900 dark:text-white uppercase tracking-widest text-sm mb-1">
                        {task.projectName}
                      </h4>
                      <p className="text-zinc-700 dark:text-zinc-300">
                        {task.actionItem}
                      </p>
                    </div>
                  ))}
                  {week.tasks.length === 0 && (
                    <p className="text-zinc-500 italic">No specific tasks for this week.</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="pt-8 text-center flex justify-center">
             <button
              onClick={handleGenerate}
              disabled={isPending}
              className="font-bold uppercase px-6 py-3 border-2 border-zinc-900 dark:border-white bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none disabled:opacity-50 transition-all"
            >
              {isPending ? 'Regenerating...' : 'Regenerate Plan'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
