import type { Node, Edge } from '@xyflow/react'

export type NodeType = 'trigger' | 'action' | 'transform'

export interface NodeData extends Record<string, unknown> {
  label: string
  description?: string
  config?: Record<string, unknown>
}

export type WorkflowNode = Node<NodeData, NodeType>

export type WorkflowEdge = Edge

export interface Workflow {
  id: string
  name: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  createdAt: string
  updatedAt: string
}
