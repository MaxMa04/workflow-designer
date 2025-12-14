import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Workflow, WorkflowNode, WorkflowEdge, NodeData, NodeType } from '@/types/workflow'
import type { WorkflowExport } from '@/types/export'

interface WorkflowState {
  workflows: Workflow[]
  currentWorkflowId: string | null

  // Workflow CRUD
  createWorkflow: (name: string) => string
  deleteWorkflow: (id: string) => void
  renameWorkflow: (id: string, name: string) => void
  selectWorkflow: (id: string) => void
  duplicateWorkflow: (id: string) => void

  // Node/Edge Updates
  updateNodes: (nodes: WorkflowNode[]) => void
  updateEdges: (edges: WorkflowEdge[]) => void
  addNode: (type: NodeType, position: { x: number; y: number }) => void

  // Helpers
  getCurrentWorkflow: () => Workflow | null
  exportWorkflow: (id: string) => WorkflowExport | null
  importWorkflow: (data: WorkflowExport) => string | null
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      workflows: [],
      currentWorkflowId: null,

      createWorkflow: (name) => {
        const id = nanoid()
        const newWorkflow: Workflow = {
          id,
          name,
          nodes: [],
          edges: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        set((state) => ({
          workflows: [...state.workflows, newWorkflow],
          currentWorkflowId: id,
        }))

        return id
      },

      deleteWorkflow: (id) => {
        set((state) => {
          const filtered = state.workflows.filter((w) => w.id !== id)
          return {
            workflows: filtered,
            currentWorkflowId:
              state.currentWorkflowId === id
                ? filtered[0]?.id ?? null
                : state.currentWorkflowId,
          }
        })
      },

      renameWorkflow: (id, name) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === id
              ? { ...w, name, updatedAt: new Date().toISOString() }
              : w
          ),
        }))
      },

      selectWorkflow: (id) => {
        set({ currentWorkflowId: id })
      },

      duplicateWorkflow: (id) => {
        const workflow = get().workflows.find((w) => w.id === id)
        if (!workflow) return

        const newId = nanoid()
        const duplicate: Workflow = {
          ...workflow,
          id: newId,
          name: `${workflow.name} (Copy)`,
          nodes: workflow.nodes.map((n) => ({ ...n, id: nanoid() })),
          edges: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        set((state) => ({
          workflows: [...state.workflows, duplicate],
          currentWorkflowId: newId,
        }))
      },

      updateNodes: (nodes) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === state.currentWorkflowId
              ? { ...w, nodes, updatedAt: new Date().toISOString() }
              : w
          ),
        }))
      },

      updateEdges: (edges) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === state.currentWorkflowId
              ? { ...w, edges, updatedAt: new Date().toISOString() }
              : w
          ),
        }))
      },

      addNode: (type, position) => {
        const id = nanoid()
        const labels: Record<NodeType, string> = {
          trigger: 'Trigger',
          action: 'Action',
          transform: 'Transform',
        }
        const descriptions: Record<NodeType, string> = {
          trigger: 'Workflow start point',
          action: 'Execute an action',
          transform: 'Transform data',
        }

        const newNode: WorkflowNode = {
          id,
          type,
          position,
          data: {
            label: `${labels[type]} ${id.slice(0, 4)}`,
            description: descriptions[type],
          },
        }

        set((state) => {
          const workflow = state.workflows.find(
            (w) => w.id === state.currentWorkflowId
          )
          if (!workflow) return state

          return {
            workflows: state.workflows.map((w) =>
              w.id === state.currentWorkflowId
                ? {
                    ...w,
                    nodes: [...w.nodes, newNode],
                    updatedAt: new Date().toISOString(),
                  }
                : w
            ),
          }
        })
      },

      getCurrentWorkflow: () => {
        const { workflows, currentWorkflowId } = get()
        return workflows.find((w) => w.id === currentWorkflowId) ?? null
      },

      exportWorkflow: (id) => {
        const workflow = get().workflows.find((w) => w.id === id)
        if (!workflow) return null

        return {
          version: '1.0' as const,
          name: workflow.name,
          exportedAt: new Date().toISOString(),
          nodes: workflow.nodes.map((n) => ({
            id: n.id,
            type: n.type as 'trigger' | 'action' | 'transform',
            position: n.position,
            data: n.data as NodeData,
          })),
          edges: workflow.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
          })),
        }
      },

      importWorkflow: (data) => {
        try {
          if (!data.nodes || !data.edges || !data.name) {
            return null
          }

          const id = nanoid()
          const nodeIdMap = new Map<string, string>()

          // Create new IDs for nodes to avoid conflicts
          const nodes: WorkflowNode[] = data.nodes.map((n) => {
            const newId = nanoid()
            nodeIdMap.set(n.id, newId)
            return {
              id: newId,
              type: n.type,
              position: n.position,
              data: n.data,
            }
          })

          // Update edge references with new node IDs
          const edges: WorkflowEdge[] = data.edges.map((e) => ({
            id: nanoid(),
            source: nodeIdMap.get(e.source) ?? e.source,
            target: nodeIdMap.get(e.target) ?? e.target,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
          }))

          const newWorkflow: Workflow = {
            id,
            name: data.name,
            nodes,
            edges,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          set((state) => ({
            workflows: [...state.workflows, newWorkflow],
            currentWorkflowId: id,
          }))

          return id
        } catch {
          return null
        }
      },
    }),
    {
      name: 'workflow-designer-storage',
      version: 1,
    }
  )
)
