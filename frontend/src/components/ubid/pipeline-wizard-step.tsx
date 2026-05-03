'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { StepperHeader } from '@/components/ubid/stepper-header'
import { PipelineStep } from '@/components/ubid/pipeline-step'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Zap, Activity } from 'lucide-react'

const PIPELINE_STEPS = [
  'Fetch Records',
  'Block & Group',
  'Score Pairs',
  'Match Decision',
  'Merge UBIDs',
  'Audit Log',
]

interface PipelineState {
  isRunning: boolean
  completed: boolean
  failed: boolean
  error: string | null
  currentStep: number
  logs: string[]
  results: {
    autoMerged: number
    queued: number
    newUBIDs: number
    duration: number
  } | null
  stepDurations: Record<number, number>
}

export function PipelineStep5({
  dbType,
  onComplete,
}: {
  dbType: string
  onComplete: () => void
}) {
  const [pipeline, setPipeline] = useState<PipelineState>({
    isRunning: false,
    completed: false,
    failed: false,
    error: null,
    currentStep: -1,
    logs: [],
    results: null,
    stepDurations: {},
  })

  const runPipeline = async () => {
    setPipeline({
      isRunning: true,
      completed: false,
      failed: false,
      error: null,
      currentStep: 0,
      logs: ['Starting pipeline...'],
      results: null,
      stepDurations: {},
    })

    try {
      // Call the pipeline API endpoint
      const response = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ db_type: dbType }),
      })

      if (!response.ok) {
        const error = await response.json()
        setPipeline((p) => ({
          ...p,
          isRunning: false,
          failed: true,
          error: error.error || 'Pipeline failed',
        }))
        return
      }

      const data = await response.json()

      // Simulate step completion with timing
      for (let i = 0; i < PIPELINE_STEPS.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        setPipeline((p) => ({
          ...p,
          currentStep: i + 1,
          logs: [...p.logs, `✓ ${PIPELINE_STEPS[i]} completed`],
          stepDurations: {
            ...p.stepDurations,
            [i]: Math.random() * 2000 + 500,
          },
        }))
      }

      setPipeline((p) => ({
        ...p,
        isRunning: false,
        completed: true,
        currentStep: PIPELINE_STEPS.length,
        results: data,
        logs: [
          ...p.logs,
          ``,
          `Pipeline completed successfully!`,
          `Auto-merged: ${data.auto_merged}`,
          `Queued for review: ${data.queued}`,
          `New UBIDs created: ${data.new_ubids}`,
        ],
      }))
    } catch (err) {
      setPipeline((p) => ({
        ...p,
        isRunning: false,
        failed: true,
        error: err instanceof Error ? err.message : 'Pipeline failed',
      }))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Entity Resolution Pipeline</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Watch the pipeline process your data in real-time
        </p>
      </div>

      {/* Pipeline Steps Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Pipeline Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {PIPELINE_STEPS.map((step, index) => (
              <PipelineStep
                key={index}
                number={index + 1}
                title={step}
                status={
                  index < pipeline.currentStep
                    ? 'completed'
                    : index === pipeline.currentStep && pipeline.isRunning
                      ? 'running'
                      : 'pending'
                }
                duration={pipeline.stepDurations[index]}
              />
            ))}
          </div>

          {/* Logs */}
          <div className="bg-slate-900 dark:bg-black rounded-lg p-4 font-mono text-xs text-green-400 h-48 overflow-y-auto">
            {pipeline.logs.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {log}
              </div>
            ))}
          </div>

          {/* Error */}
          {pipeline.error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-200">Pipeline Error</p>
                <p className="text-sm text-red-800 dark:text-red-300">{pipeline.error}</p>
              </div>
            </div>
          )}

          {/* Results */}
          {pipeline.results && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-200">Pipeline Completed</p>
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Processed successfully in {pipeline.results.duration}ms
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-950 rounded p-3 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Auto-Merged</p>
                  <p className="text-2xl font-bold text-green-600">
                    {pipeline.results.autoMerged}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-950 rounded p-3 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Queued</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {pipeline.results.queued}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-950 rounded p-3 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">New UBIDs</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {pipeline.results.newUBIDs}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={runPipeline}
              disabled={pipeline.isRunning}
              className="flex-1"
            >
              {pipeline.isRunning ? 'Pipeline Running...' : 'Run Pipeline'}
            </Button>
            {pipeline.completed && (
              <Link href="/dashboard/review" className="flex-1">
                <Button variant="outline" className="w-full">
                  Go to Review Queue →
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
