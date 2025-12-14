'use client'

import { useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import { Zap, Play, Shuffle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useWorkflowStore } from '@/stores/workflow-store'
import { NODE_TYPE_CONFIG } from '@/components/nodes'
import { cn } from '@/lib/utils'
import type { NodeType } from '@/types/workflow'

interface NodePanelProps {
  className?: string
}

const nodeTypeIcons = {
  trigger: Zap,
  action: Play,
  transform: Shuffle,
} as const

export function NodePanel({ className }: NodePanelProps) {
  const { addNode, currentWorkflowId } = useWorkflowStore()
  const reactFlow = useReactFlow()

  const handleAddNode = useCallback(
    (type: NodeType) => {
      if (!currentWorkflowId) return

      // Get the center of the viewport
      const { x, y, zoom } = reactFlow.getViewport()
      const centerX = (-x + window.innerWidth / 2) / zoom
      const centerY = (-y + window.innerHeight / 2) / zoom

      // Add some offset based on existing nodes to avoid overlap
      const existingNodes = reactFlow.getNodes()
      const offset = existingNodes.length * 30

      addNode(type, {
        x: centerX + offset,
        y: centerY + offset,
      })
    },
    [addNode, currentWorkflowId, reactFlow]
  )

  const onDragStart = useCallback(
    (event: React.DragEvent, nodeType: NodeType) => {
      event.dataTransfer.setData('application/reactflow', nodeType)
      event.dataTransfer.effectAllowed = 'move'
    },
    []
  )

  if (!currentWorkflowId) {
    return (
      <aside className={cn('flex flex-col p-4 bg-muted/30', className)}>
        <p className="text-sm text-muted-foreground text-center">
          Select or create a workflow to add nodes
        </p>
      </aside>
    )
  }

  return (
    <aside className={cn('flex flex-col bg-muted/30', className)}>
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Add Nodes</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Click or drag to add
        </p>
      </div>

      <div className="p-4 space-y-3">
        {(
          Object.entries(NODE_TYPE_CONFIG) as [
            NodeType,
            (typeof NODE_TYPE_CONFIG)[NodeType],
          ][]
        ).map(([type, config]) => {
          const Icon = nodeTypeIcons[type]

          return (
            <Card
              key={type}
              className="cursor-pointer hover:bg-muted transition-colors"
              draggable
              onDragStart={(e) => onDragStart(e, type)}
              onClick={() => handleAddNode(type)}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div className={cn('p-2 rounded', config.color)}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">{config.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {config.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </aside>
  )
}
