'use client'

import { memo } from 'react'
import { type NodeProps, type Node } from '@xyflow/react'
import { Shuffle } from 'lucide-react'
import { BaseNode } from './base-node'
import type { NodeData } from '@/types/workflow'

type TransformNodeType = Node<NodeData, 'transform'>

export const TransformNode = memo(function TransformNode({
  data,
  selected,
}: NodeProps<TransformNodeType>) {
  return (
    <BaseNode
      title={data.label || 'Transform'}
      icon={<Shuffle className="w-4 h-4 text-white" />}
      colorClass="bg-purple-500"
      hasInput={true}
      hasOutput={true}
      selected={selected}
    >
      <p className="text-xs text-muted-foreground">
        {data.description || 'Transform data'}
      </p>
    </BaseNode>
  )
})
