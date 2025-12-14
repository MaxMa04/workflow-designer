'use client'

import { ReactFlowProvider } from '@xyflow/react'
import { WorkflowSidebar } from './workflow-sidebar'
import { NodePanel } from './node-panel'
import { WorkflowCanvas } from '@/components/workflow/workflow-canvas'
import { WorkflowToolbar } from '@/components/workflow/workflow-toolbar'

export function AppLayout() {
  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex bg-background">
        {/* Left Sidebar: Workflow List */}
        <WorkflowSidebar className="w-64 border-r shrink-0" />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Toolbar */}
          <WorkflowToolbar className="h-14 border-b shrink-0" />

          {/* Canvas */}
          <div className="flex-1 relative">
            <WorkflowCanvas />
          </div>
        </div>

        {/* Right Panel: Add Nodes */}
        <NodePanel className="w-64 border-l shrink-0" />
      </div>
    </ReactFlowProvider>
  )
}
