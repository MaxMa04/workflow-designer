export interface WorkflowExport {
  version: '1.0'
  exportedAt: string
  name: string
  nodes: ExportedNode[]
  edges: ExportedEdge[]
}

export interface ExportedNode {
  id: string
  type: 'trigger' | 'action' | 'transform'
  position: {
    x: number
    y: number
  }
  data: {
    label: string
    description?: string
    config?: Record<string, unknown>
  }
}

export interface ExportedEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
}
