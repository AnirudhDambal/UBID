import React from "react"
import { cn } from "@/lib/utils"

export interface ConfidenceBarProps {
  value: number
  max?: number
  className?: string
  size?: "sm" | "default" | "lg"
}

export function ConfidenceBar({
  value,
  max = 100,
  className,
  size = "default",
}: ConfidenceBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  const sizeClasses = {
    sm: "h-2",
    default: "h-3",
    lg: "h-4",
  }

  const getColor = (percent: number) => {
    if (percent >= 85) return "bg-green-600"
    if (percent >= 60) return "bg-yellow-600"
    return "bg-red-600"
  }

  return (
    <div className={cn("w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden", sizeClasses[size], className)}>
      <div
        className={cn("h-full rounded-full transition-all", getColor(percentage))}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
