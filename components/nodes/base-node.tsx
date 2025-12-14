'use client'

import { memo, type ReactNode } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface BaseNodeProps {
  children?: ReactNode
  title: string
  icon: ReactNode
  colorClass: string
  hasInput?: boolean
  hasOutput?: boolean
  selected?: boolean
}

export const BaseNode = memo(function BaseNode({
  children,
  title,
  icon,
  colorClass,
  hasInput = true,
  hasOutput = true,
  selected,
}: BaseNodeProps) {
  return (
    <Card
      className={cn(
        'min-w-[180px] shadow-md transition-shadow',
        selected && 'ring-2 ring-primary'
      )}
    >
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-muted-foreground !w-3 !h-3 !border-2 !border-background"
        />
      )}

      <CardHeader className="p-3 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <div className={cn('p-1.5 rounded', colorClass)}>{icon}</div>
          {title}
        </CardTitle>
      </CardHeader>

      {children && <CardContent className="p-3 pt-0">{children}</CardContent>}

      {hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-muted-foreground !w-3 !h-3 !border-2 !border-background"
        />
      )}
    </Card>
  )
})
