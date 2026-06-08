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
      <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="flex flex-col items-center justify-center py-12 text-center relative z-10">
          <div className="h-16 w-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4 ring-1 ring-white/5">
            <BrainCircuit className="h-8 w-8 text-violet-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Gemini AI Analysis</h3>
          <p className="text-zinc-400 max-w-md mb-6">
            Get an objective assessment of this project's airdrop potential, red flags, and farming recommendations powered by Google Gemini.
          </p>
          <Button 
            onClick={handleAnalyze} 
            className="bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all"
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
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 text-violet-500 animate-spin mb-4" />
          <h3 className="text-lg font-medium text-zinc-200">Analyzing Project</h3>
          <p className="text-sm text-zinc-500 mt-2">Gemini is processing project context...</p>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) return null

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-4 border-b border-zinc-800/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            AI Analysis
          </CardTitle>
          <Badge variant="outline" className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${getRecommendationStyle(analysis.recommendation)}`}>
            {analysis.recommendation}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Score & Summary */}
          <div className="md:col-span-1 flex flex-col items-center justify-center p-6 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
            <div className="relative flex items-center justify-center mb-3">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
                <circle 
                  cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * analysis.potential_score) / 100} 
                  className={getScoreColor(analysis.potential_score)} 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(analysis.potential_score)}`}>{analysis.potential_score}</span>
              </div>
            </div>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Potential Score</span>
          </div>

          <div className="md:col-span-3 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-zinc-300 mb-1 flex items-center gap-2">
                <Target className="h-4 w-4 text-violet-400" /> Executive Summary
              </h4>
              <p className="text-zinc-400 text-sm leading-relaxed">{analysis.summary}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-zinc-300 mb-1">Reasoning</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">{analysis.reasoning}</p>
            </div>
          </div>
        </div>

        {/* Flags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Green Flags
            </h4>
            {analysis.green_flags.length > 0 ? (
              <ul className="space-y-2">
                {analysis.green_flags.map((flag, idx) => (
                  <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500 italic">None identified</p>
            )}
          </div>

          <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
              <XCircle className="h-4 w-4" /> Red Flags
            </h4>
            {analysis.red_flags.length > 0 ? (
              <ul className="space-y-2">
                {analysis.red_flags.map((flag, idx) => (
                  <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500 italic">None identified</p>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
