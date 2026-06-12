'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ProjectInsert, ProjectStatus } from '@/types'
import { predictColumnMapping } from '@/app/actions/import'
import { bulkCreateProjects } from '@/app/actions/logs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ParsedProject {
  Name: string
  Chain?: string
  Website?: string
  Status?: string
  EstimatedReward?: string
}

export function ImportWizard() {
  type MappingState = 'idle' | 'analyzing' | 'reviewing' | 'ready'
  const [mappingState, setMappingState] = useState<MappingState>('idle')
  const [headers, setHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<any[]>([])
  const [mapping, setMapping] = useState<{
    name: string | null
    chain: string | null
    status: string | null
    estimated_reward: string | null
    website: string | null
  }>({ name: null, chain: null, status: null, estimated_reward: null, website: null })

  const [isDragging, setIsDragging] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedProject[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[]
        if (rows.length === 0) {
          toast.error('No valid data found in CSV.')
          return
        }
        
        const extractedHeaders = results.meta.fields || Object.keys(rows[0] || {})
        setHeaders(extractedHeaders)
        setRawRows(rows)
        
        setMappingState('analyzing')
        toast.info('AI is analyzing your columns...')
        
        const res = await predictColumnMapping(extractedHeaders)
        if (res.error || !res.data) {
          toast.error('AI mapping failed, please map manually.')
          setMapping({ name: null, chain: null, status: null, estimated_reward: null, website: null })
        } else {
          toast.success('AI successfully mapped your columns!')
          const ai = res.data
          setMapping({
            name: extractedHeaders.includes(ai.name) ? ai.name : null,
            chain: extractedHeaders.includes(ai.chain) ? ai.chain : null,
            status: extractedHeaders.includes(ai.status) ? ai.status : null,
            estimated_reward: extractedHeaders.includes(ai.estimated_reward) ? ai.estimated_reward : null,
            website: extractedHeaders.includes(ai.website) ? ai.website : null,
          })
        }
        setMappingState('reviewing')
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`)
      }
    })
  }

  const confirmMapping = () => {
    if (!mapping.name || mapping.name === 'none') {
      toast.error('You must select a column for "Name"')
      return
    }

    const data: ParsedProject[] = rawRows.map(row => ({
      Name: row[mapping.name as string],
      Chain: mapping.chain && mapping.chain !== 'none' ? row[mapping.chain] : undefined,
      Status: mapping.status && mapping.status !== 'none' ? row[mapping.status] : undefined,
      EstimatedReward: mapping.estimated_reward && mapping.estimated_reward !== 'none' ? row[mapping.estimated_reward] : undefined,
      Website: mapping.website && mapping.website !== 'none' ? row[mapping.website] : undefined,
    }))

    const validData = data.filter(row => row.Name && row.Name.trim() !== '')
    if (validData.length > 0) {
      setParsedData(validData)
      setMappingState('ready')
      toast.success(`Ready to import ${validData.length} projects`)
    } else {
      toast.error('No valid projects found after mapping.')
    }
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
    if (s === 'vesting') return 'Vesting'
    return 'Not Started'
  }

  const handleImport = async () => {
    if (parsedData.length === 0) return
    setIsImporting(true)

    try {
      const projectsToInsert: ProjectInsert[] = parsedData.map(p => ({
        name: p.Name,
        project_type: 'Token',
        chain: p.Chain || null,
        website: p.Website || null,
        twitter_url: null,
        mint_price: null,
        collection_size: null,
        status: mapStatus(p.Status),
        difficulty: null,
        estimated_reward: p.EstimatedReward || null,
        deadline: null,
        event_type: null,
        notes: 'Imported from CSV',
        logo_url: null
      }))

      const result = await bulkCreateProjects(projectsToInsert)

      if (result.error) throw new Error(result.error)

      toast.success(`Successfully imported ${parsedData.length} projects!`)
      setParsedData([])
      setMappingState('idle')
      setRawRows([])
      setHeaders([])
    } catch (err: any) {
      toast.error(err.message || 'Failed to import projects')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {mappingState === 'analyzing' && (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/20">
          <Loader2 className="h-12 w-12 text-violet-500 animate-spin mb-4" />
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">AI is analyzing columns...</h3>
          <p className="text-zinc-500">Mapping your spreadsheet format to Erdrop...</p>
        </div>
      )}

      {mappingState === 'reviewing' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Review Column Mapping</h2>
            <p className="text-zinc-500 max-w-lg mx-auto">
              Our AI has predicted how your spreadsheet maps to Erdrop. Please review and adjust if necessary.
            </p>
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            {([
              { label: 'Project Name', field: 'name', required: true },
              { label: 'Blockchain / Network', field: 'chain' },
              { label: 'Farming Status', field: 'status' },
              { label: 'Estimated Reward ($)', field: 'estimated_reward' },
              { label: 'Website / Link', field: 'website' }
            ] as { label: string; field: 'name' | 'chain' | 'status' | 'estimated_reward' | 'website'; required?: boolean }[]).map(({ label, field, required }) => (
              <div key={field} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-black/5 dark:border-white/5 rounded-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm gap-4">
                <div className="flex flex-col">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{label}</span>
                  {required && <span className="text-xs text-red-500 font-medium mt-1">Required</span>}
                </div>
                <div className="w-full sm:w-72">
                  <Select 
                    value={mapping[field] || 'none'} 
                    onValueChange={(val) => setMapping(prev => ({ ...prev, [field]: val === 'none' ? null : val }))}
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-zinc-950 border-black/10 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                      <SelectValue placeholder="Select column..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-950 border-black/10 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                      <SelectItem value="none" className="text-zinc-500 italic">-- Ignore (None) --</SelectItem>
                      {headers.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}

            <div className="flex gap-4 justify-end pt-6">
              <Button variant="outline" onClick={() => { setMappingState('idle'); setRawRows([]); setHeaders([]); }} className="bg-transparent border-black/10 dark:border-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-800">
                Cancel
              </Button>
              <Button onClick={confirmMapping} className="bg-violet-600 hover:bg-violet-700 text-white">
                Confirm Mapping
              </Button>
            </div>
          </div>
        </div>
      )}

      {mappingState === 'idle' && (
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
      )}

      {mappingState === 'ready' && (
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
                <Button variant="outline" onClick={() => { setParsedData([]); setMappingState('idle'); }} className="bg-transparent border-black/10 dark:border-white/10 text-zinc-700 dark:text-white hover:bg-black/5 dark:hover:bg-white/5">
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
