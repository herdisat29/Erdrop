'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MoreVertical, Edit2, Trash2, ExternalLink } from 'lucide-react'
import { Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteProject } from '@/app/actions/projects'
import { toast } from 'sonner'
import { EditProjectDialog } from './EditProjectDialog'
import { formatDistanceToNow, parseISO, isValid } from 'date-fns'
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

interface ProjectCardProps {
  project: Project
  onOptimisticDelete?: () => void
}

export function ProjectCard({ project, onOptimisticDelete }: ProjectCardProps) {
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  // Track if a menu action was triggered — prevents card navigation from firing
  const menuActionFired = useRef(false)

  const handleCardClick = () => {
    if (menuActionFired.current) {
      menuActionFired.current = false
      return
    }
    router.push(`/projects/${project.id}`)
  }

  const handleEditSelect = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    menuActionFired.current = true
    setIsEditOpen(true)
  }

  const handleDeleteSelect = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    menuActionFired.current = true
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = () => {
    startTransition(async () => {
      setIsDeleting(true)
      if (onOptimisticDelete) {
        onOptimisticDelete()
      }
      const result = await deleteProject(project.id)
      if (result?.error) {
        toast.error('Failed to delete: ' + result.error)
        setIsDeleting(false)
      } else {
        toast.success('Project deleted')
        setIsDeleteDialogOpen(false)
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Claimed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 font-label-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest'
      case 'Eligible': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 font-label-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest'
      case 'In Progress': return 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-label-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest'
      case 'Vesting': return 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30 font-label-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest'
      case 'Missed': return 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border border-red-200 dark:border-red-500/30 font-label-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest'
      default: return 'bg-surface-container-high text-on-surface-variant border border-outline-variant font-label-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest'
    }
  }

  return (
    <>
      <Card
        className="group relative bg-surface-container-lowest border border-outline-variant sticky-note-shadow squishy-interaction transition-all duration-200 cursor-pointer h-full rounded-2xl overflow-hidden"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3 flex flex-row items-start justify-between relative z-10">
          <div className="space-y-1">
            <CardTitle className="font-headline-md text-on-surface flex items-center gap-2">
              {project.name}
              {project.project_type === 'NFT' && (
                <Badge variant="outline" className="bg-secondary-container text-on-secondary-container border-transparent rounded-sm px-1 py-0 text-[10px]">NFT</Badge>
              )}
              {project.website && (
                <a
                  href={project.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-outline hover:text-primary transition-colors relative z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {project.twitter_url && (
                <a
                  href={project.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-outline hover:text-primary transition-colors relative z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
            </CardTitle>
            <div className="flex gap-2 font-label-sm text-on-surface-variant flex-wrap">
              {project.chain && <span>{project.chain}</span>}
              {project.chain && project.difficulty && project.project_type !== 'NFT' && <span>•</span>}
              {project.difficulty && project.project_type !== 'NFT' && <span>{project.difficulty}</span>}
              {project.chain && project.collection_size && project.project_type === 'NFT' && <span>•</span>}
              {project.collection_size && project.project_type === 'NFT' && <span>{project.collection_size} Supply</span>}
              {project.deadline && (() => {
                const deadlineDate = new Date(project.deadline)
                const isExpired = deadlineDate < new Date() && project.status !== 'Claimed' && project.status !== 'Missed'
                if (isExpired) {
                  return (
                    <Badge variant="outline" className="bg-error-container text-on-error-container border-error-container font-label-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest" suppressHydrationWarning>
                      Expired
                    </Badge>
                  )
                }
                return null
              })()}
            </div>
          </div>

          {/* Stop propagation on the entire actions area so card click never fires from here */}
          <div className="flex items-center gap-2 relative z-10" onClick={(e) => e.stopPropagation()}>
            <span className={getStatusColor(project.status)}>
              {project.status}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-outline hover:text-on-surface focus:outline-none squishy-interaction p-1 rounded-full hover:bg-surface-container-highest">
                <MoreVertical className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-surface-container-lowest border-outline-variant text-on-surface-variant rounded-xl shadow-md"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  onClick={handleEditSelect}
                  className="hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer rounded-lg m-1"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteSelect}
                  disabled={isDeleting}
                  className="text-error focus:text-error hover:bg-error-container focus:bg-error-container cursor-pointer rounded-lg m-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="flex items-end justify-between mt-2">
            {project.project_type === 'NFT' || project.status === 'Claimed' ? (
              <div>
                <p className="font-label-bold text-primary uppercase tracking-wider mb-1">
                  {project.project_type === 'NFT' ? 'Mint Price' : 'Reward'}
                </p>
                <p className="font-display-lg text-on-surface">
                  {project.project_type === 'NFT'
                    ? (project.mint_price || 'TBA')
                    : (project.estimated_reward || 'TBA')}
                </p>
              </div>
            ) : (
              <div />
            )}
            {project.deadline && (
              <div className="text-right">
                <p className="font-label-bold text-secondary uppercase tracking-wider mb-1">
                  {project.project_type === 'NFT' ? 'Mint Date' : 'Deadline'}
                </p>
                <p className="font-headline-md text-on-surface-variant">
                  {(() => {
                    if (!project.deadline) return 'TBA'
                    if (project.deadline.length >= 16) {
                      return project.deadline.substring(0, 16).replace('T', ' ') + ' UTC'
                    }
                    return project.deadline
                  })()}
                </p>
              </div>
            )}
          </div>
          <div className="mt-4">
            <p className="font-label-sm text-outline" suppressHydrationWarning>
              Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edit dialog — rendered outside Card so it's never affected by card click */}
      <EditProjectDialog
        project={project}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-surface-container-lowest border-outline-variant text-on-surface rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline-md">Delete project?</AlertDialogTitle>
            <AlertDialogDescription className="text-on-surface-variant font-label-sm">
              This will permanently delete <strong>"{project.name}"</strong> and all associated logs. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-none hover:bg-surface-container-high text-on-surface rounded-full squishy-interaction"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => { e.preventDefault(); handleDelete() }}
              className="bg-error text-on-error hover:bg-error/90 rounded-full squishy-interaction"
            >
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
