import React from "react"
import { Badge } from "../ui/badge"
import { cn } from "@/lib/utils"

export interface StepperHeaderProps {
  currentStep: number
  totalSteps: number
  steps: string[]
  className?: string
}

export function StepperHeader({
  currentStep,
  totalSteps,
  steps,
  className,
}: StepperHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isUpcoming = index > currentStep

          return (
            <div key={index} className="flex items-center flex-1">
              {/* Step circle */}
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full font-semibold text-sm transition-all",
                  isCompleted && "bg-green-600 text-white",
                  isCurrent && "bg-blue-600 text-white ring-4 ring-blue-200",
                  isUpcoming && "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                )}
              >
                {isCompleted ? "✓" : index + 1}
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-1 rounded transition-all",
                    index < currentStep ? "bg-green-600" : "bg-slate-200 dark:bg-slate-700"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step labels */}
      <div className="flex justify-between mt-2">
        {steps.map((step, index) => (
          <span
            key={index}
            className={cn(
              "text-xs font-medium text-center flex-1",
              index === currentStep ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
            )}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  )
}
