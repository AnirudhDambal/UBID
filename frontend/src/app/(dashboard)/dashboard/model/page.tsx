'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingUp, Check, RotateCcw } from 'lucide-react'

interface ModelVersion {
  version: string
  date: Date
  precision: number
  recall: number
  delta: number
  status: 'active' | 'retired' | 'testing'
}

const modelVersions: ModelVersion[] = [
  {
    version: 'v1.2.3',
    date: new Date('2024-05-03'),
    precision: 0.994,
    recall: 0.987,
    delta: 0.012,
    status: 'active',
  },
  {
    version: 'v1.2.2',
    date: new Date('2024-04-28'),
    precision: 0.982,
    recall: 0.975,
    delta: 0.008,
    status: 'retired',
  },
  {
    version: 'v1.2.1',
    date: new Date('2024-04-20'),
    precision: 0.974,
    recall: 0.967,
    delta: -0.005,
    status: 'retired',
  },
]

export default function ModelPage() {
  const [proposal, setProposal] = useState({
    threshold: 0.87,
    proposed: 0.82,
    impact: 'Increase recall by 3.2%, reduce manual review',
    pending: true,
  })

  const metrics = [
    { label: 'Precision', value: '99.4%', trend: '↑ 0.8%' },
    { label: 'Recall', value: '98.7%', trend: '↑ 1.2%' },
    { label: 'Auto-Merge Rate', value: '78.3%', trend: '↑ 2.1%' },
    { label: 'Manual Reviews', value: '1,847', trend: '↓ 12%' },
    { label: 'Reviewer Agreement', value: '96.2%', trend: '↑ 0.5%' },
    { label: 'False Positives', value: '0.6%', trend: '↓ 0.1%' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Model Health</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Monitor and manage entity resolution model performance
        </p>
      </div>

      {/* Current Model */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge>Active</Badge>
            Current Model: v1.2.3
          </CardTitle>
          <CardDescription>Deployed on 3 May 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Precision</p>
              <p className="text-2xl font-bold text-emerald-600">99.4%</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Recall</p>
              <p className="text-2xl font-bold text-emerald-600">98.7%</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Match Threshold</p>
              <p className="text-2xl font-bold text-primary">0.87</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Uptime</p>
              <p className="text-2xl font-bold text-emerald-600">100%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Current model performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{metric.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <span className="text-xs text-emerald-600">{metric.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Threshold Proposal */}
      <Card className="border-amber-200/70 bg-amber-50/70 dark:bg-amber-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Pending Threshold Proposal
          </CardTitle>
          <CardDescription>Review and apply recommended threshold change</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Current Threshold</p>
              <p className="text-2xl font-bold text-primary">{proposal.threshold}</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Proposed Threshold</p>
              <p className="text-2xl font-bold text-emerald-600">{proposal.proposed}</p>
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
            <p className="text-sm font-medium mb-1">Impact</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{proposal.impact}</p>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Apply Proposal
            </Button>
            <Button variant="outline" className="flex-1">
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Model History */}
      <Card>
        <CardHeader>
          <CardTitle>Model Version History</CardTitle>
          <CardDescription>Previous model versions and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {modelVersions.map((version) => (
              <div
                key={version.version}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{version.version}</span>
                    <Badge
                      variant={
                        version.status === 'active'
                          ? 'default'
                          : version.status === 'testing'
                            ? 'secondary'
                            : 'outline'
                      }
                      className="text-xs capitalize"
                    >
                      {version.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {version.date.toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <p className="font-medium">{(version.precision * 100).toFixed(1)}%</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Precision</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{(version.recall * 100).toFixed(1)}%</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Recall</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {version.delta > 0 ? '+' : ''}{(version.delta * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Delta</p>
                  </div>
                </div>

                {version.status === 'retired' && (
                  <Button variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Rollback
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Training Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Model Retraining
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The model is automatically retrained monthly with new verified match pairs and reviewer feedback.
          </p>
          <Button variant="outline" className="w-full">
            Trigger Manual Retrain
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
