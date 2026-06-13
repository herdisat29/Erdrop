'use client'

import { useState, useEffect } from 'react'
import { AiAnalysis, RecommendationType } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles, CheckCircle2, XCircle, Loader2, Target,
  BrainCircuit, RefreshCw, TrendingUp, TrendingDown,
  ChevronDown, ChevronUp, Clock, DollarSign, ShieldAlert
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface AIAnalysisProps {
  projectId: string
  analyses: AiAnalysis[]
}

export function AIAnalysis({ projectId, analyses: initialAnalyses }: AIAnalysisProps) {
  const router = useRouter()
  const [analyses, setAnalyses] = useState<AiAnalysis[]>(initialAnalyses)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  useEffect(() => {
    setAnalyses(initialAnalyses)
  }, [initialAnalyses])

  const latest = analyses[0] ?? null
  const history = analyses.slice(1)

  // Detect if analysis uses new format or legacy format
  const isNewFormat = (a: AiAnalysis) => Boolean(a.bull_case)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.upgrade) {
          toast.error(data.error, {
            action: { label: 'Upgrade', onClick: () => window.location.href = '?upgrade=true' }
          })
          return
        }
        throw new Error(data.error || 'Failed to analyze project')
      }

      // Prepend new analysis to local state — no router.refresh() flash
      setAnalyses(prev => [data as AiAnalysis, ...prev].slice(0, 10))
      toast.success('AI Analysis complete!')
      setTimeout(() => router.refresh(), 1500)
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRecommendationStyle = (rec: RecommendationType) => {
    switch (rec) {
      case 'SKIP': return 'bg-error-container/50 text-error border-error/20'
      case 'WATCH': return 'bg-tertiary-container/50 text-tertiary border-tertiary/20'
      case 'FARM': return 'bg-primary-container/50 text-primary border-primary/20'
      case 'PRIORITY FARM': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30'
      default: return 'bg-surface-container-high text-on-surface-variant border-outline-variant'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 dark:text-emerald-400'
    if (score >= 50) return 'text-amber-500 dark:text-amber-400'
    return 'text-red-500 dark:text-red-400'
  }

  const getScoreTrackColor = (score: number) => {
    if (score >= 80) return 'stroke-emerald-500 dark:stroke-emerald-400'
    if (score >= 50) return 'stroke-amber-500 dark:stroke-amber-400'
    return 'stroke-red-500 dark:stroke-red-400'
  }

  const getScoreDelta = (current: AiAnalysis, previous: AiAnalysis) => {
    const delta = current.potential_score - previous.potential_score
    return delta
  }

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (!latest && !isAnalyzing) {
    return (
      <Card className="bg-surface-container-lowest border border-outline-variant rounded-3xl sticky-note-shadow overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="flex flex-col items-center justify-center py-12 text-center relative z-10 p-6">
          <div className="h-16 w-16 bg-primary-container/20 rounded-full flex items-center justify-center mb-4">
            <BrainCircuit className="h-8 w-8 text-primary" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-headline-md text-on-surface">Gemini AI Analysis</h3>
            <Badge variant="outline" className="bg-surface-container-high text-on-surface-variant border-transparent rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest font-black">BETA</Badge>
          </div>
          <p className="text-on-surface-variant font-label-sm max-w-md mb-2">
            Get an objective assessment of this project's airdrop potential, bull & bear case, and farming recommendation powered by Gemini.
          </p>
          <div className="bg-surface-container/50 px-4 py-2 rounded-xl border border-outline-variant/30 mb-6 flex items-center gap-2 text-xs font-medium text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-amber-500">info</span>
            During Beta, AI Analysis is limited to 3 uses total.
          </div>
          <Button
            onClick={handleAnalyze}
            className="font-label-bold uppercase tracking-widest bg-primary text-on-primary hover:bg-primary/90 rounded-full squishy-interaction gap-2 shadow-md px-6"
          >
            <Sparkles className="h-4 w-4" />
            Analyze with AI
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ── Loading state ────────────────────────────────────────────────────────────
  if (isAnalyzing) {
    return (
      <Card className="bg-surface-container-lowest border border-outline-variant rounded-3xl sticky-note-shadow">
        <CardContent className="flex flex-col items-center justify-center py-16 p-6">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <h3 className="font-headline-md text-on-surface">
            {analyses.length > 0 ? 'Generating New Snapshot...' : 'Analyzing Project'}
          </h3>
          <p className="text-sm text-on-surface-variant mt-2">
            {analyses.length > 0
              ? 'Gemini is comparing with your previous analyses...'
              : 'Gemini is processing project context...'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!latest) return null

  const useNew = isNewFormat(latest)

  return (
    <div className="space-y-4">
      {/* ── Main analysis card ─────────────────────────────────────────────── */}
      <Card className="bg-surface-container-lowest border border-outline-variant rounded-3xl sticky-note-shadow">
        <CardHeader className="pb-4 border-b border-outline-variant/50 p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="font-headline-md text-on-surface flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Analysis
              {analyses.length > 1 && (
                <span className="text-xs font-label-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full border border-outline-variant">
                  Snapshot {analyses.length} of {analyses.length}
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`px-3 py-1 text-xs font-label-bold uppercase tracking-wider rounded-full ${getRecommendationStyle(latest.recommendation)}`}>
                {latest.recommendation}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="h-8 rounded-full border-outline-variant/50 hover:bg-surface-container gap-1.5"
              >
                <RefreshCw className="h-3 w-3" />
                <span className="text-xs font-label-bold">Re-analyze</span>
              </Button>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(latest.created_at).toLocaleString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </CardHeader>

        <CardContent className="pt-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Score ring */}
            <div className="md:col-span-1 flex flex-col items-center justify-center p-6 bg-surface-container rounded-2xl border border-outline-variant/50">
              <div className="relative flex items-center justify-center mb-3">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surface-container-highest" />
                  <circle
                    cx="48" cy="48" r="40" strokeWidth="8" fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * latest.potential_score) / 100}
                    className={getScoreTrackColor(latest.potential_score)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-black tracking-tighter ${getScoreColor(latest.potential_score)}`}>
                    {latest.potential_score}
                  </span>
                </div>
              </div>
              <span className="font-label-bold text-on-surface-variant uppercase tracking-widest text-[10px] text-center mt-2">
                Potential Score
              </span>
              {/* Score delta vs previous */}
              {history.length > 0 && (() => {
                const delta = getScoreDelta(latest, history[0])
                if (delta === 0) return null
                return (
                  <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${delta > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {delta > 0 ? '+' : ''}{delta} vs last
                  </div>
                )
              })()}
            </div>

            <div className="md:col-span-3 space-y-5">
              {useNew ? (
                <>
                  {/* New format: Bull & Bear case */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 p-4 rounded-2xl">
                      <h4 className="font-label-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2 uppercase tracking-widest text-xs">
                        <TrendingUp className="h-3.5 w-3.5" /> Bull Case
                      </h4>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{latest.bull_case}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 p-4 rounded-2xl">
                      <h4 className="font-label-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2 uppercase tracking-widest text-xs">
                        <TrendingDown className="h-3.5 w-3.5" /> Bear Case
                      </h4>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{latest.bear_case}</p>
                    </div>
                  </div>

                  {/* Funding status */}
                  {latest.funding_status && (
                    <div className="flex items-start gap-3 bg-surface-container/50 border border-outline-variant/40 rounded-xl p-4">
                      <DollarSign className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-label-bold text-on-surface-variant uppercase tracking-widest mb-1">Funding Status</p>
                        <p className="text-sm text-on-surface">{latest.funding_status}</p>
                      </div>
                    </div>
                  )}

                  {/* Key risks */}
                  {latest.key_risks && latest.key_risks.length > 0 && (
                    <div>
                      <h4 className="font-label-bold text-on-surface mb-2 flex items-center gap-2 uppercase tracking-widest text-xs">
                        <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> Key Risks
                      </h4>
                      <ul className="space-y-1.5">
                        {latest.key_risks.map((risk, idx) => (
                          <li key={idx} className="text-sm text-on-surface-variant flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5 shrink-0">▲</span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Legacy format: summary + reasoning */}
                  <div>
                    <h4 className="font-label-bold text-on-surface mb-2 flex items-center gap-2 uppercase tracking-widest text-xs">
                      <Target className="h-4 w-4 text-primary" /> Summary
                    </h4>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{latest.summary}</p>
                  </div>
                  <div>
                    <h4 className="font-label-bold text-on-surface mb-2 uppercase tracking-widest text-xs">Reasoning</h4>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{latest.reasoning}</p>
                  </div>
                </>
              )}

              {/* Reasoning (new format) */}
              {useNew && latest.reasoning && (
                <div>
                  <h4 className="font-label-bold text-on-surface mb-2 uppercase tracking-widest text-xs">Recommendation Reasoning</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{latest.reasoning}</p>
                </div>
              )}
            </div>
          </div>

          {/* Green / Red flags — shown for both formats */}
          {(latest.green_flags?.length > 0 || latest.red_flags?.length > 0) && !useNew && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 p-5 rounded-2xl">
                <h4 className="font-label-bold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2 uppercase tracking-widest text-xs">
                  <CheckCircle2 className="h-4 w-4" /> Green Flags
                </h4>
                {latest.green_flags?.length > 0 ? (
                  <ul className="space-y-2 mt-2">
                    {latest.green_flags.map((flag, idx) => (
                      <li key={idx} className="text-sm text-on-surface-variant flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">•</span><span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-on-surface-variant italic mt-2">None identified</p>}
              </div>
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 p-5 rounded-2xl">
                <h4 className="font-label-bold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2 uppercase tracking-widest text-xs">
                  <XCircle className="h-4 w-4" /> Red Flags
                </h4>
                {latest.red_flags?.length > 0 ? (
                  <ul className="space-y-2 mt-2">
                    {latest.red_flags.map((flag, idx) => (
                      <li key={idx} className="text-sm text-on-surface-variant flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span><span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-on-surface-variant italic mt-2">None identified</p>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Analysis History Timeline ───────────────────────────────────────── */}
      {history.length > 0 && (
        <div>
          <button
            onClick={() => setHistoryOpen(o => !o)}
            className="flex items-center gap-2 text-sm font-label-bold text-on-surface-variant hover:text-on-surface transition-colors squishy-interaction w-full text-left px-1 py-2"
          >
            {historyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Analysis History ({history.length} previous snapshot{history.length > 1 ? 's' : ''})
          </button>

          {historyOpen && (
            <div className="relative mt-2 pl-4 border-l-2 border-outline-variant/40 space-y-4">
              {history.map((a, idx) => {
                const useNewFmt = isNewFormat(a)
                // Score delta vs the next older snapshot
                const olderIdx = idx + 1
                const older = history[olderIdx]
                const delta = older ? a.potential_score - older.potential_score : null

                return (
                  <div key={a.id} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-[21px] top-4 w-3 h-3 rounded-full bg-surface-container-highest border-2 border-outline-variant" />

                    <Card className="bg-surface-container-lowest border border-outline-variant rounded-2xl">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-on-surface-variant flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(a.created_at).toLocaleString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-black ${getScoreColor(a.potential_score)}`}>
                              {a.potential_score}/100
                            </span>
                            {delta !== null && delta !== 0 && (
                              <span className={`text-xs font-bold flex items-center gap-0.5 ${delta > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {delta > 0 ? '+' : ''}{delta}
                              </span>
                            )}
                            <Badge variant="outline" className={`px-2 py-0.5 text-[10px] font-label-bold uppercase tracking-wider rounded-full ${getRecommendationStyle(a.recommendation)}`}>
                              {a.recommendation}
                            </Badge>
                          </div>
                        </div>

                        {useNewFmt ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {a.bull_case && (
                              <div>
                                <p className="text-[10px] font-label-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Bull</p>
                                <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">{a.bull_case}</p>
                              </div>
                            )}
                            {a.bear_case && (
                              <div>
                                <p className="text-[10px] font-label-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">Bear</p>
                                <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">{a.bear_case}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          a.summary && (
                            <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">{a.summary}</p>
                          )
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
