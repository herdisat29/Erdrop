'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ProjectInsert, ProjectStatus } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface ParsedProject {
  Name: string
  Chain?: string
  Website?: string
  Status?: string
  EstimatedReward?: string
}

export function ImportWizard() {
  const [isDragging, setIsDragging] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedProject[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as ParsedProject[]
        const validData = data.filter(row => row.Name && row.Name.trim() !== '')
        if (validData.length > 0) {
          setParsedData(validData)
          toast.success(`Found ${validData.length} projects to import`)
        } else {
          toast.error('No valid projects found in CSV. Make sure you have a "Name" column.')
        }
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`)
      }
    })
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const mapStatus = (statusStr?: string): ProjectStatus => {
    const s = statusStr?.toLowerCase().trim()
    if (s === 'claimed') return 'Claimed'
    if (s === 'eligible') return 'Eligible'
    if (s === 'missed') return 'Missed'
    if (s === 'in progress' || s === 'farming') return 'In Progress'
    return 'Not Started'
  }

  const handleImport = async () => {
    if (parsedData.length === 0) return
    setIsImporting(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Unauthorized')

      const projectsToInsert: ProjectInsert[] = parsedData.map(p => ({
        name: p.Name,
        chain: p.Chain || null,
        website: p.Website || null,
        status: mapStatus(p.Status),
        difficulty: null,
        estimated_reward: p.EstimatedReward || null,
        deadline: null,
        notes: 'Imported from CSV',
        logo_url: null
      }))

      // Batch insert is faster and requires less API calls
      const { error } = await supabase
        .from('projects')
        .insert(projectsToInsert.map(p => ({ ...p, user_id: user.id })))

      if (error) throw error

      toast.success(`Successfully imported ${parsedData.length} projects!`)
      setParsedData([])
    } catch (err: any) {
      toast.error(err.message || 'Failed to import projects')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {!parsedData.length ? (
        <div 
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 p-12 text-center flex flex-col items-center justify-center min-h-[400px] cursor-pointer group ${
            isDragging 
              ? 'border-violet-500 bg-violet-500/10' 
              : 'border-black/10 dark:border-white/10 bg-white/50 dark:bg-zinc-900/30 hover:border-violet-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
          } backdrop-blur-xl`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:30px_30px]" />
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".csv" 
            className="hidden" 
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          />
          
          <div className="h-20 w-20 rounded-full bg-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 relative z-10">
            <UploadCloud className="h-10 w-10 text-violet-400" />
          </div>
          
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 relative z-10">Upload CSV File</h3>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-md relative z-10">
            Drag and drop your Google Sheets / Excel CSV file here, or click to browse.
          </p>
          
          <div className="mt-8 text-xs text-zinc-600 dark:text-zinc-500 bg-zinc-100 dark:bg-black/40 px-4 py-3 rounded-lg border border-black/5 dark:border-white/5 relative z-10 text-left">
            <p className="font-semibold text-zinc-800 dark:text-zinc-400 mb-2">Required format (first row as headers):</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><span className="text-violet-400">Name</span> (Required) - e.g. "Arbitrum"</li>
              <li><span className="text-zinc-600 dark:text-zinc-400">Chain</span> (Optional) - e.g. "Ethereum"</li>
              <li><span className="text-zinc-600 dark:text-zinc-400">Status</span> (Optional) - "Not Started", "In Progress", etc.</li>
              <li><span className="text-zinc-600 dark:text-zinc-400">EstimatedReward</span> (Optional) - e.g. "$500"</li>
              <li><span className="text-zinc-600 dark:text-zinc-400">Website</span> (Optional) - e.g. "https://..."</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="bg-emerald-500/10 border-emerald-500/20">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                <div>
                  <h3 className="text-lg font-semibold text-emerald-400">Ready to Import</h3>
                  <p className="text-sm text-emerald-500/80">Found {parsedData.length} valid projects in your file.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setParsedData([])} className="bg-transparent border-black/10 dark:border-white/10 text-zinc-700 dark:text-white hover:bg-black/5 dark:hover:bg-white/5">
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={isImporting} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all">
                  {isImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 mr-2" />}
                  {isImporting ? 'Importing...' : 'Start Import'}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl overflow-hidden">
            <div className="max-h-[500px] overflow-auto p-0">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-950/50 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-4">Project Name</th>
                    <th className="px-6 py-4">Chain</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Est. Reward</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {parsedData.slice(0, 50).map((row, i) => (
                    <tr key={i} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">{row.Name}</td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{row.Chain || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded bg-black/5 dark:bg-white/5 text-xs border border-black/5 dark:border-white/5 text-zinc-700 dark:text-zinc-300">{row.Status || 'Not Started'}</span>
                      </td>
                      <td className="px-6 py-4 text-emerald-400">{row.EstimatedReward || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedData.length > 50 && (
              <div className="p-4 text-center border-t border-black/5 dark:border-white/5 text-sm text-zinc-500 bg-zinc-50 dark:bg-zinc-950/30">
                Showing first 50 of {parsedData.length} projects...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
