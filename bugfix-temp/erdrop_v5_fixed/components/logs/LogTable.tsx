'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { Log } from '@/types'
import { format, formatDistanceToNow } from 'date-fns'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  const [logToDelete, setLogToDelete] = useState<Log | null>(null)
  
  const [optimisticLogs, addOptimisticDelete] = useOptimistic(
    logs,
    (state, idToRemove: string) => state.filter((log) => log.id !== idToRemove)
  )
  const [isPending, startTransition] = useTransition()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Wallet copied to clipboard')
  }

  const handleEditClick = (log: Log) => {
    setEditingLog(log)
  }

  const handleDeleteClick = (log: Log) => {
    setLogToDelete(log)
  }

  const handleDelete = () => {
    if (!logToDelete) return
    
    startTransition(async () => {
      addOptimisticDelete(logToDelete.id)
      const result = await deleteLog(logToDelete.id, logToDelete.project_id)
      if (result?.error) {
        toast.error('Failed to delete log: ' + result.error)
      } else {
        toast.success('Log deleted')
      }
    })
    setLogToDelete(null)
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
      default: return 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20' // Pending
    }
  }

  const shortenAddress = (address: string) => {
    if (address.length < 12) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (optimisticLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl border border-dashed border-outline-variant bg-surface-container-lowest">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container mb-4">
          <ScrollText className="h-8 w-8 text-on-surface-variant" />
        </div>
        <h3 className="text-headline-md font-bold text-on-surface mb-2">No activity logs yet</h3>
        <p className="font-label-sm text-on-surface-variant max-w-sm mb-6">
          Belum ada aktivitas farming. Tambahkan log pertama kamu!
        </p>
        {projectId && <CreateLogDialog projectId={projectId} />}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={exportToCSV} variant="outline" size="sm" className="bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high hover:text-on-surface rounded-full squishy-interaction">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      <div className="bg-surface-container-lowest border border-outline-variant sticky-note-shadow overflow-x-auto w-full rounded-3xl">
        <div className="min-w-[800px]">
        <Table>
          <TableHeader className="bg-surface-container border-b border-outline-variant/50">
            <TableRow className="border-b border-outline-variant/50 hover:bg-transparent">
              <TableHead className="text-on-surface-variant font-label-bold uppercase tracking-widest w-[250px]">Task / Description</TableHead>
              <TableHead className="text-on-surface-variant font-label-bold uppercase tracking-widest">Wallet</TableHead>
              <TableHead className="text-on-surface-variant font-label-bold uppercase tracking-widest">Est. Value</TableHead>
              <TableHead className="text-on-surface-variant font-label-bold uppercase tracking-widest">Status</TableHead>
              <TableHead className="text-on-surface-variant font-label-bold uppercase tracking-widest">Date</TableHead>
              <TableHead className="text-right text-on-surface-variant font-label-bold uppercase tracking-widest">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optimisticLogs.map((log) => (
              <TableRow key={log.id} className="border-b border-outline-variant/30 hover:bg-surface-container-lowest transition-colors">
                <TableCell className="font-label-bold text-on-surface">
                  <div className="flex flex-col gap-1">
                    <span>{log.task}</span>
                    {log.notes && (
                      <span className="text-xs text-zinc-600 dark:text-zinc-500 font-normal line-clamp-1">{log.notes}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {log.wallet ? (
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger render={
                          <span className="font-label-sm text-on-surface-variant cursor-default">
                            {shortenAddress(log.wallet)}
                          </span>
                        } />
                        <TooltipContent className="bg-inverse-surface text-inverse-on-surface border-none rounded-lg">
                          {log.wallet}
                        </TooltipContent>
                      </Tooltip>
                      <button 
                        onClick={() => copyToClipboard(log.wallet as string)}
                        className="text-on-surface-variant hover:text-primary transition-colors squishy-interaction p-1"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-outline text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="text-on-surface font-label-bold">
                  {log.estimated_value ? `$${log.estimated_value}` : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`rounded-full border-2 px-3 py-0.5 font-bold ${getStatusColor(log.status)}`}>
                    {log.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-on-surface-variant font-label-sm" suppressHydrationWarning>
                  {formatDistanceToNow(new Date(log.logged_at), { addSuffix: true })}
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
                            className="inline-flex items-center justify-center rounded-full transition-colors hover:bg-surface-container-high h-8 w-8 text-on-surface-variant squishy-interaction"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        } />
                        <TooltipContent className="bg-inverse-surface text-inverse-on-surface border-none rounded-lg">
                          View Transaction
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap h-8 w-8 p-0 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-all squishy-interaction focus:outline-none">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-surface-container-lowest border-outline-variant shadow-md rounded-xl">
                        <DropdownMenuItem 
                          onClick={() => handleEditClick(log)}
                          className="text-on-surface hover:bg-surface-container-high cursor-pointer font-label-bold rounded-lg m-1"
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(log)}
                          className="text-error hover:bg-error-container cursor-pointer font-label-bold rounded-lg m-1"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
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

      <AlertDialog open={!!logToDelete} onOpenChange={(open) => !open && setLogToDelete(null)}>
        <AlertDialogContent className="bg-surface-container-lowest border-outline-variant text-on-surface rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline-md">Delete Log Entry</AlertDialogTitle>
            <AlertDialogDescription className="text-on-surface-variant font-label-sm">
              Are you sure you want to delete this log? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-none hover:bg-surface-container-high text-on-surface rounded-full squishy-interaction">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDelete(); }} className="bg-error text-on-error hover:bg-error/90 rounded-full squishy-interaction">
              Delete Log
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
