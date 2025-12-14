import type { NodeTypes } from '@xyflow/react'
import { TriggerNode } from './trigger-node'
import { ActionNode } from './action-node'
import { TransformNode } from './transform-node'

export const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  transform: TransformNode,
}

export const NODE_TYPE_CONFIG = {
  trigger: {
    label: 'Trigger',
    description: 'Start your workflow',
    icon: 'Zap',
    color: 'bg-green-500',
  },
  action: {
    label: 'Action',
    description: 'Perform an action',
    icon: 'Play',
    color: 'bg-blue-500',
  },
  transform: {
    label: 'Transform',
    description: 'Transform data',
    icon: 'Shuffle',
    color: 'bg-purple-500',
  },
} as const
