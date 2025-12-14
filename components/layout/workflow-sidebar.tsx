'use client'

import { useState, useEffect } from 'react'
import { Plus, MoreVertical, Trash2, Copy, Workflow } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useWorkflowStore } from '@/stores/workflow-store'
import { cn } from '@/lib/utils'

interface WorkflowSidebarProps {
  className?: string
}

export function WorkflowSidebar({ className }: WorkflowSidebarProps) {
  const {
    workflows,
    currentWorkflowId,
    createWorkflow,
    selectWorkflow,
    deleteWorkflow,
    duplicateWorkflow,
  } = useWorkflowStore()

  const [newWorkflowName, setNewWorkflowName] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCreate = () => {
    if (newWorkflowName.trim()) {
      createWorkflow(newWorkflowName.trim())
      setNewWorkflowName('')
      setDialogOpen(false)
    }
  }

  return (
    <aside className={cn('flex flex-col bg-muted/30', className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          <h2 className="font-semibold text-lg">Workflows</h2>
        </div>
      </div>

      {/* Workflow List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {mounted && workflows.map((workflow) => (
          <div
            key={workflow.id}
            className={cn(
              'flex items-center justify-between px-3 py-2 rounded-md cursor-pointer group',
              'hover:bg-muted transition-colors',
              currentWorkflowId === workflow.id && 'bg-muted'
            )}
            onClick={() => selectWorkflow(workflow.id)}
          >
            <span className="text-sm truncate flex-1">{workflow.name}</span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    duplicateWorkflow(workflow.id)
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteWorkflow(workflow.id)
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {mounted && workflows.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No workflows yet
          </p>
        )}

        {!mounted && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Loading...
          </p>
        )}
      </div>

      {/* Create Button */}
      <div className="p-4 border-t">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              New Workflow
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Workflow</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Workflow name"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
              <Button onClick={handleCreate} className="w-full">
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  )
}
