# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

Visual workflow designer (n8n-style) - **UI only, no backend**.

### Tech Stack
- Next.js 16 (App Router)
- React Flow (`@xyflow/react`) for canvas
- Zustand with persist middleware for state
- shadcn/ui + Tailwind CSS

### Data Flow

```
useWorkflowStore (Zustand)
    ↓
localStorage (workflow-designer-storage)
    ↓
WorkflowCanvas (React Flow)
```

### Key Files

- **`stores/workflow-store.ts`** - Central state: workflows[], currentWorkflowId, CRUD operations, import/export
- **`components/nodes/`** - Custom React Flow nodes (trigger, action, transform) using `base-node.tsx` wrapper
- **`components/layout/app-layout.tsx`** - Main shell with ReactFlowProvider
- **`types/workflow.ts`** - WorkflowNode, WorkflowEdge, Workflow types
- **`types/export.ts`** - JSON export schema (version 1.0)

### Node Types

| Type | Color | Has Input | Description |
|------|-------|-----------|-------------|
| trigger | green | No | Workflow start point |
| action | blue | Yes | Execute action |
| transform | purple | Yes | Transform data |

### Adding New Node Types

1. Create component in `components/nodes/` extending `BaseNode`
2. Register in `components/nodes/index.ts` (nodeTypes + NODE_TYPE_CONFIG)
3. Add type to `NodeType` union in `types/workflow.ts`

### React Flow Type Casting

When using `applyNodeChanges`/`applyEdgeChanges`, cast results:
```typescript
const newNodes = applyNodeChanges(changes, nodes) as WorkflowNode[]
```
