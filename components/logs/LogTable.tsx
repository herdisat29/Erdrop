'use client'

import { useState } from 'react'
import { Log } from '@/types'
import { format } from 'date-fns'
import { MoreHorizontal, Edit2, Trash2, Copy, ExternalLink, ScrollText, Download } from 'lucide-react'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { EditLogDialog } from './EditLogDialog'
import { deleteLog } from '@/app/actions/logs'
import { CreateLogDialog } from './CreateLogDialog'

interface LogTableProps {
  logs: Log[]
  projectId?: string
}

export function LogTable({ logs, projectId }: LogTableProps) {
  const [editingLog, setEditingLog] = useState<Log | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Wallet copied to clipboard')
  }

  const handleDelete = async (logId: string, itemProjectId: string) => {
    if (confirm('Are you sure you want to delete this log?')) {
      setIsDeleting(true)
      const result = await deleteLog(logId, itemProjectId)
      if (result.error) {
        toast.error('Failed to delete log: ' + result.error)
      } else {
        toast.success('Log deleted')
      }
      setIsDeleting(false)
    }
  }

  const exportToCSV = () => {
    try {
      const headers = ['Task', 'Wallet', 'Estimated Value ($)', 'Status', 'Tx Hash', 'Date', 'Notes']
      
      const csvRows = logs.map(log => {
        return [
          `"${(log.task || '').replace(/"/g, '""')}"`,
          `"${log.wallet || ''}"`,
          log.estimated_value || 0,
          `"${log.status}"`,
          `"${log.tx_hash || ''}"`,
          `"${format(new Date(log.logged_at), 'yyyy-MM-dd HH:mm:ss')}"`,
          `"${(log.notes || '').replace(/"/g, '""')}"`
        ].join(',')
      })

      const csvString = [headers.join(','), ...csvRows].join('\n')
      
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `activity_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Logs exported to CSV')
    } catch (err) {
      toast.error('Failed to export CSV')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Claimed': return 'bg-violet-500/10 text-violet-500 border-violet-500/20'
      case 'Completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'Failed': return 'bg-red-500/10 text-red-500 border-red-500/20'
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' // Pending
    }
  }

  const shortenAddress = (address: string) => {
    if (address.length < 12) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/50 mb-4">
          <ScrollText className="h-8 w-8 text-zinc-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No activity logs yet</h3>
        <p className="text-sm text-zinc-500 max-w-sm mb-6">
          Belum ada aktivitas farming. Tambahkan log pertama kamu!
        </p>
        {projectId && <CreateLogDialog projectId={projectId} />}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={exportToCSV} variant="outline" size="sm" className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-x-auto w-full">
        <div className="min-w-[800px]">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 w-[250px]">Task / Description</TableHead>
              <TableHead className="text-zinc-400">Wallet</TableHead>
              <TableHead className="text-zinc-400">Est. Value</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Date</TableHead>
              <TableHead className="text-right text-zinc-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="border-zinc-800 hover:bg-zinc-900/50 transition-colors">
                <TableCell className="font-medium text-zinc-200">
                  <div className="flex flex-col gap-1">
                    <span>{log.task}</span>
                    {log.notes && (
                      <span className="text-xs text-zinc-500 font-normal line-clamp-1">{log.notes}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {log.wallet ? (
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger render={
                          <span className="text-sm text-zinc-400 cursor-default font-mono">
                            {shortenAddress(log.wallet)}
                          </span>
                        } />
                        <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                          {log.wallet}
                        </TooltipContent>
                      </Tooltip>
                      <button 
                        onClick={() => copyToClipboard(log.wallet as string)}
                        className="text-zinc-600 hover:text-zinc-300 transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-zinc-600 text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {log.estimated_value ? (
                    <span className="text-emerald-400 font-medium">${log.estimated_value}</span>
                  ) : (
                    <span className="text-zinc-600">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(log.status)}>
                    {log.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-zinc-400">
                  {format(new Date(log.logged_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {log.tx_hash && (
                      <Tooltip>
                        <TooltipTrigger render={
                          <a 
                            href={`https://etherscan.io/tx/${log.tx_hash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:text-white h-8 w-8 text-zinc-400"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        } />
                        <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                          View Transaction
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger 
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        } 
                      />
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                        <DropdownMenuItem onClick={() => setEditingLog(log)} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(log.id, log.project_id)} disabled={isDeleting} className="text-red-400 focus:text-red-300 hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      {editingLog && (
        <EditLogDialog 
          log={editingLog}
          open={!!editingLog}
          onOpenChange={(open) => !open && setEditingLog(null)}
        />
      )}
    </div>
  )
}
