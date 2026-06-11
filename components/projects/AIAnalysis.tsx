'use client'

import { useState } from 'react'
import { AiAnalysis, RecommendationType } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, CheckCircle2, XCircle, Loader2, Target, BrainCircuit, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { ProBadge } from '@/components/paywall/ProBadge'

interface AIAnalysisProps {
  projectId: string
  initialAnalysis: AiAnalysis | null
}

export function AIAnalysis({ projectId, initialAnalysis }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(initialAnalysis)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async (force = false) => {
    setIsAnalyzing(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, force })
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.upgrade) {
          toast.error(data.error, { action: { label: 'Upgrade', onClick: () => window.location.href = '/pricing' } })
          return
        }
        throw new Error(data.error || 'Failed to analyze project')
      }

      setAnalysis(data)
      toast.success('AI Analysis complete!')
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
      case 'PRIORITY FARM': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
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

  if (!analysis && !isAnalyzing) {
    return (
      <Card className="bg-surface-container-lowest border border-outline-variant rounded-3xl sticky-note-shadow overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="flex flex-col items-center justify-center py-12 text-center relative z-10 p-6">
          <div className="h-16 w-16 bg-primary-container/20 rounded-full flex items-center justify-center mb-4">
            <BrainCircuit className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-headline-md text-on-surface mb-2">Gemini AI Analysis</h3>
          <p className="text-on-surface-variant font-label-sm max-w-md mb-6">
            Get an objective assessment of this project's airdrop potential, red flags, and farming recommendations powered by Google Gemini.
          </p>
          <Button 
            onClick={() => handleAnalyze(false)} 
            className="font-label-bold uppercase tracking-widest bg-primary text-on-primary hover:bg-primary/90 rounded-full squishy-interaction gap-2 shadow-md px-6"
          >
            <Sparkles className="h-4 w-4" />
            Analyze with AI
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isAnalyzing) {
    return (
      <Card className="bg-surface-container-lowest border border-outline-variant rounded-3xl sticky-note-shadow">
        <CardContent className="flex flex-col items-center justify-center py-16 p-6">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <h3 className="font-headline-md text-on-surface">Analyzing Project</h3>
          <p className="text-sm text-on-surface-variant mt-2">Gemini is processing project context...</p>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) return null

  return (
    <Card className="bg-surface-container-lowest border border-outline-variant rounded-3xl sticky-note-shadow">
      <CardHeader className="pb-4 border-b border-outline-variant/50 p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="font-headline-md text-on-surface flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Analysis
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4 h-8 rounded-full border-outline-variant/50 hover:bg-surface-container gap-1.5"
              onClick={() => handleAnalyze(true)}
            >
              <RefreshCw className="h-3 w-3" />
              <span className="text-xs font-label-bold">Re-analyze</span>
              <ProBadge className="ml-1" />
            </Button>
          </CardTitle>
          <Badge variant="outline" className={`px-3 py-1 text-xs font-label-bold uppercase tracking-wider rounded-full ${getRecommendationStyle(analysis.recommendation)}`}>
            {analysis.recommendation}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Score */}
          <div className="md:col-span-1 flex flex-col items-center justify-center p-6 bg-surface-container rounded-2xl border border-outline-variant/50">
            <div className="relative flex items-center justify-center mb-3">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surface-container-highest" />
                <circle 
                  cx="48" cy="48" r="40" strokeWidth="8" fill="transparent" 
                  strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * analysis.potential_score) / 100} 
                  className={getScoreTrackColor(analysis.potential_score)} 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-black tracking-tighter ${getScoreColor(analysis.potential_score)}`}>{analysis.potential_score}</span>
              </div>
            </div>
            <span className="font-label-bold text-on-surface-variant uppercase tracking-widest text-[10px] text-center mt-2">Potential Score</span>
          </div>

          <div className="md:col-span-3 space-y-6">
            <div>
              <h4 className="font-label-bold text-on-surface mb-2 flex items-center gap-2 uppercase tracking-widest text-xs">
                <Target className="h-4 w-4 text-primary" /> Executive Summary
              </h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">{analysis.summary}</p>
            </div>
            
            <div>
              <h4 className="font-label-bold text-on-surface mb-2 uppercase tracking-widest text-xs">Reasoning</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">{analysis.reasoning}</p>
            </div>
          </div>
        </div>

        {/* Flags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 p-5 rounded-2xl">
            <h4 className="font-label-bold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2 uppercase tracking-widest text-xs">
              <CheckCircle2 className="h-4 w-4" /> Green Flags
            </h4>
            {analysis.green_flags.length > 0 ? (
              <ul className="space-y-2.5 mt-3">
                {analysis.green_flags.map((flag, idx) => (
                  <li key={idx} className="text-sm text-on-surface-variant flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-on-surface-variant italic mt-3">None identified</p>
            )}
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 p-5 rounded-2xl">
            <h4 className="font-label-bold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2 uppercase tracking-widest text-xs">
              <XCircle className="h-4 w-4" /> Red Flags
            </h4>
            {analysis.red_flags.length > 0 ? (
              <ul className="space-y-2.5 mt-3">
                {analysis.red_flags.map((flag, idx) => (
                  <li key={idx} className="text-sm text-on-surface-variant flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-on-surface-variant italic mt-3">None identified</p>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
