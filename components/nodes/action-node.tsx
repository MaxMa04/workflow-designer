'use client'

import { memo } from 'react'
import { type NodeProps, type Node } from '@xyflow/react'
import { Play } from 'lucide-react'
import { BaseNode } from './base-node'
import type { NodeData } from '@/types/workflow'

type ActionNodeType = Node<NodeData, 'action'>

export const ActionNode = memo(function ActionNode({
  data,
  selected,
}: NodeProps<ActionNodeType>) {
  return (
    <BaseNode
      title={data.label || 'Action'}
      icon={<Play className="w-4 h-4 text-white" />}
      colorClass="bg-blue-500"
      hasInput={true}
      hasOutput={true}
      selected={selected}
    >
      <p className="text-xs text-muted-foreground">
        {data.description || 'Execute an action'}
      </p>
    </BaseNode>
  )
})
