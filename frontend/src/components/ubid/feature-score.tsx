import React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FeatureScoreProps {
  phonetic: number
  nameJW: number
  pan: number
  pincode: number
  className?: string
}

export function FeatureScore({ phonetic, nameJW, pan, pincode, className }: FeatureScoreProps) {
  const scores = [
    { label: 'Phonetic', value: phonetic, color: 'bg-purple-600' },
    { label: 'Name (J-W)', value: nameJW, color: 'bg-blue-600' },
    { label: 'PAN', value: pan, color: 'bg-orange-600' },
    { label: 'Pincode', value: pincode, color: 'bg-green-600' },
  ]

  return (
    <div className={cn("space-y-2", className)}>
      {scores.map((score) => (
        <div key={score.label} className="flex items-center gap-3">
          <span className="text-xs font-medium w-20">{score.label}</span>
          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all", score.color)}
              style={{ width: `${score.value * 100}%` }}
            />
          </div>
          <span className="text-xs font-semibold w-8 text-right">{(score.value * 100).toFixed(0)}%</span>
        </div>
      ))}
    </div>
  )
}
