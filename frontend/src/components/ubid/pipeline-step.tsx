import React from "react"
import { cn } from "@/lib/utils"

interface PipelineStepProps {
  number: number
  title: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  duration?: number
}

export function PipelineStep({ number, title, status, duration }: PipelineStepProps) {
  const statusColors = {
    pending: 'bg-slate-200 dark:bg-slate-700',
    running: 'bg-blue-500 animate-pulse',
    completed: 'bg-green-600',
    failed: 'bg-red-600',
  }

  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold",
        statusColors[status]
      )}>
        {status === 'completed' && '✓'}
        {status === 'running' && <div className="w-2 h-2 bg-white rounded-full animate-bounce" />}
        {status === 'failed' && '✕'}
        {status === 'pending' && number}
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{title}</p>
        {duration && <p className="text-xs text-slate-500 dark:text-slate-400">{duration}ms</p>}
      </div>
    </div>
  )
}
