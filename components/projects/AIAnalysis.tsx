'use client'

import { useState } from 'react'
import { AiAnalysis, RecommendationType } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, CheckCircle2, XCircle, Loader2, Target, BrainCircuit } from 'lucide-react'
import { toast } from 'sonner'

interface AIAnalysisProps {
  projectId: string
  initialAnalysis: AiAnalysis | null
}

export function AIAnalysis({ projectId, initialAnalysis }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(initialAnalysis)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      })

      const data = await res.json()

      if (!res.ok) {
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
      case 'SKIP': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'WATCH': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'FARM': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'PRIORITY FARM': return 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 50) return 'text-amber-400'
    return 'text-red-400'
  }

  if (!analysis && !isAnalyzing) {
    return (
      <Card className="bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] overflow-hidden relative group rounded-none">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="flex flex-col items-center justify-center py-12 text-center relative z-10 p-6">
          <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 flex items-center justify-center mb-4">
            <BrainCircuit className="h-8 w-8 text-violet-600 dark:text-violet-400" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white mb-2">Gemini AI Analysis</h3>
          <p className="text-zinc-600 dark:text-zinc-400 font-bold max-w-md mb-6">
            Get an objective assessment of this project's airdrop potential, red flags, and farming recommendations powered by Google Gemini.
          </p>
          <Button 
            onClick={handleAnalyze} 
            className="font-bold uppercase tracking-widest bg-violet-200 dark:bg-violet-900 border-2 border-violet-900 dark:border-violet-500 text-violet-900 dark:text-violet-100 hover:bg-violet-300 dark:hover:bg-violet-800 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all rounded-none"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Analyze with AI
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isAnalyzing) {
    return (
      <Card className="bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-none">
        <CardContent className="flex flex-col items-center justify-center py-16 p-6">
          <Loader2 className="h-10 w-10 text-violet-600 dark:text-violet-500 animate-spin mb-4" />
          <h3 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-200">Analyzing Project</h3>
          <p className="text-sm font-bold text-zinc-600 dark:text-zinc-500 mt-2">Gemini is processing project context...</p>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) return null

  return (
    <Card className="bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-none">
      <CardHeader className="pb-4 border-b-2 border-zinc-900 dark:border-zinc-800 p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            AI Analysis
          </CardTitle>
          <Badge variant="outline" className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${getRecommendationStyle(analysis.recommendation)}`}>
            {analysis.recommendation}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Score & Summary */}
          <div className="md:col-span-1 flex flex-col items-center justify-center p-6 bg-zinc-100 dark:bg-zinc-950 border-2 border-zinc-900 dark:border-zinc-800 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            <div className="relative flex items-center justify-center mb-3">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-300 dark:text-zinc-800" />
                <circle 
                  cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * analysis.potential_score) / 100} 
                  className={getScoreColor(analysis.potential_score)} 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-black tracking-tighter ${getScoreColor(analysis.potential_score)}`}>{analysis.potential_score}</span>
              </div>
            </div>
            <span className="text-xs font-black text-zinc-600 dark:text-zinc-500 uppercase tracking-widest text-center mt-2">Potential Score</span>
          </div>

          <div className="md:col-span-3 space-y-6">
            <div>
              <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-300 mb-2 flex items-center gap-2 uppercase tracking-widest border-b-2 border-zinc-900 dark:border-zinc-800 pb-2 w-fit">
                <Target className="h-4 w-4 text-violet-600 dark:text-violet-400" /> Executive Summary
              </h4>
              <p className="text-zinc-700 dark:text-zinc-400 text-sm leading-relaxed font-medium">{analysis.summary}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-300 mb-2 uppercase tracking-widest border-b-2 border-zinc-900 dark:border-zinc-800 pb-2 w-fit">Reasoning</h4>
              <p className="text-zinc-700 dark:text-zinc-400 text-sm leading-relaxed font-medium">{analysis.reasoning}</p>
            </div>
          </div>
        </div>

        {/* Flags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-emerald-100 dark:bg-emerald-900/20 border-2 border-emerald-900 dark:border-emerald-500 p-4 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-400 mb-3 flex items-center gap-2 uppercase tracking-widest border-b-2 border-emerald-900 dark:border-emerald-500 pb-2">
              <CheckCircle2 className="h-5 w-5" /> Green Flags
            </h4>
            {analysis.green_flags.length > 0 ? (
              <ul className="space-y-3 mt-4">
                {analysis.green_flags.map((flag, idx) => (
                  <li key={idx} className="text-sm font-bold text-emerald-900 dark:text-zinc-300 flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-500 mt-0.5 font-black text-lg leading-none">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm font-bold text-zinc-600 dark:text-zinc-500 italic mt-4">None identified</p>
            )}
          </div>

          <div className="bg-red-100 dark:bg-red-900/20 border-2 border-red-900 dark:border-red-500 p-4 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <h4 className="text-sm font-black text-red-900 dark:text-red-400 mb-3 flex items-center gap-2 uppercase tracking-widest border-b-2 border-red-900 dark:border-red-500 pb-2">
              <XCircle className="h-5 w-5" /> Red Flags
            </h4>
            {analysis.red_flags.length > 0 ? (
              <ul className="space-y-3 mt-4">
                {analysis.red_flags.map((flag, idx) => (
                  <li key={idx} className="text-sm font-bold text-red-900 dark:text-zinc-300 flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-500 mt-0.5 font-black text-lg leading-none">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm font-bold text-zinc-600 dark:text-zinc-500 italic mt-4">None identified</p>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
