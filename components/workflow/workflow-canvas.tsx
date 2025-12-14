'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { nodeTypes } from '@/components/nodes'
import { useWorkflowStore } from '@/stores/workflow-store'
import type { NodeType, WorkflowNode, WorkflowEdge } from '@/types/workflow'

const defaultEdgeOptions = {
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
  },
  style: {
    strokeWidth: 2,
  },
}

export function WorkflowCanvas() {
  const { getCurrentWorkflow, updateNodes, updateEdges, addNode, currentWorkflowId } =
    useWorkflowStore()
  const reactFlow = useReactFlow()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const currentWorkflow = mounted ? getCurrentWorkflow() : null

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      if (!currentWorkflow) return
      const newNodes = applyNodeChanges(changes, currentWorkflow.nodes) as WorkflowNode[]
      updateNodes(newNodes)
    },
    [currentWorkflow, updateNodes]
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      if (!currentWorkflow) return
      const newEdges = applyEdgeChanges(changes, currentWorkflow.edges) as WorkflowEdge[]
      updateEdges(newEdges)
    },
    [currentWorkflow, updateEdges]
  )

  const onConnect: OnConnect = useCallback(
    (params) => {
      if (!currentWorkflow) return
      const newEdges = addEdge(params, currentWorkflow.edges) as WorkflowEdge[]
      updateEdges(newEdges)
    },
    [currentWorkflow, updateEdges]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow') as NodeType
      if (!type) return

      const position = reactFlow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      addNode(type, position)
    },
    [addNode, reactFlow]
  )

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (!currentWorkflow) return

        // Only handle if not in an input field
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        ) {
          return
        }

        const selectedNodes = currentWorkflow.nodes.filter((n) => n.selected)
        const selectedNodeIds = new Set(selectedNodes.map((n) => n.id))

        const newNodes = currentWorkflow.nodes.filter((n) => !n.selected)
        const newEdges = currentWorkflow.edges.filter(
          (e) => !selectedNodeIds.has(e.source) && !selectedNodeIds.has(e.target)
        )

        updateNodes(newNodes)
        updateEdges(newEdges)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentWorkflow, updateNodes, updateEdges])

  if (!mounted || !currentWorkflowId) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">
            {!mounted ? 'Loading...' : 'Select or create a workflow to get started'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={currentWorkflow?.nodes ?? []}
        edges={currentWorkflow?.edges ?? []}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        deleteKeyCode={null} // We handle delete ourselves
      >
        <Background gap={15} size={1} />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          className="!bg-background !border-border"
        />
      </ReactFlow>
    </div>
  )
}
