'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Download, Copy, Check, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWorkflowStore } from '@/stores/workflow-store'
import { cn } from '@/lib/utils'
import type { WorkflowExport } from '@/types/export'

interface WorkflowToolbarProps {
  className?: string
}

export function WorkflowToolbar({ className }: WorkflowToolbarProps) {
  const { getCurrentWorkflow, renameWorkflow, exportWorkflow, importWorkflow, workflows } =
    useWorkflowStore()
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Prevent hydration mismatch by only rendering dynamic content after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const currentWorkflow = mounted ? getCurrentWorkflow() : null

  const handleImport = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const data = JSON.parse(content) as WorkflowExport
          const id = importWorkflow(data)
          if (!id) {
            alert('Invalid workflow file format')
          }
        } catch {
          alert('Failed to parse workflow file')
        }
      }
      reader.readAsText(file)

      // Reset input so the same file can be selected again
      event.target.value = ''
    },
    [importWorkflow]
  )

  const downloadExport = useCallback(() => {
    if (!currentWorkflow) return

    const exportData = exportWorkflow(currentWorkflow.id)
    if (!exportData) return

    const filename = `${currentWorkflow.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [currentWorkflow, exportWorkflow])

  const copyToClipboard = useCallback(async () => {
    if (!currentWorkflow) return

    const exportData = exportWorkflow(currentWorkflow.id)
    if (!exportData) return

    try {
      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = JSON.stringify(exportData, null, 2)
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [currentWorkflow, exportWorkflow])

  if (!currentWorkflow) {
    return (
      <header
        className={cn('flex items-center justify-between px-4 bg-background', className)}
      >
        <p className="text-muted-foreground">
          {!mounted
            ? 'Loading...'
            : workflows.length === 0
              ? 'Create a workflow to get started'
              : 'Select a workflow'}
        </p>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      </header>
    )
  }

  return (
    <header
      className={cn(
        'flex items-center justify-between px-4 bg-background',
        className
      )}
    >
      <Input
        value={currentWorkflow.name}
        onChange={(e) => renameWorkflow(currentWorkflow.id, e.target.value)}
        className="max-w-xs font-semibold border-none focus-visible:ring-1 bg-transparent"
      />

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        <Button variant="outline" size="sm" onClick={handleImport}>
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>

        <Button variant="outline" size="sm" onClick={copyToClipboard}>
          {copied ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copied ? 'Copied!' : 'Copy JSON'}
        </Button>

        <Button size="sm" onClick={downloadExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </header>
  )
}
