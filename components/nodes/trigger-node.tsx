'use client'

import { memo } from 'react'
import { type NodeProps, type Node } from '@xyflow/react'
import { Zap } from 'lucide-react'
import { BaseNode } from './base-node'
import type { NodeData } from '@/types/workflow'

type TriggerNodeType = Node<NodeData, 'trigger'>

export const TriggerNode = memo(function TriggerNode({
  data,
  selected,
}: NodeProps<TriggerNodeType>) {
  return (
    <BaseNode
      title={data.label || 'Trigger'}
      icon={<Zap className="w-4 h-4 text-white" />}
      colorClass="bg-green-500"
      hasInput={false}
      hasOutput={true}
      selected={selected}
    >
      <p className="text-xs text-muted-foreground">
        {data.description || 'Workflow start point'}
      </p>
    </BaseNode>
  )
})
