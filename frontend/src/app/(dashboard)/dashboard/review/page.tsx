'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FeatureScore } from '@/components/ubid/feature-score'
import { Spinner } from '@/components/ui/spinner'
import { CheckCircle2, XCircle, Clock, HelpCircle, Eye } from 'lucide-react'

interface ReviewTask {
  id: string
  sourceRecord1: string
  sourceRecord2: string
  matchProbability: number
  features: {
    phonetic: number
    nameJW: number
    pan: number
    pincode: number
  }
  status: 'pending' | 'deferred' | 'resolved'
  businessName1: string
  businessName2: string
}

const mockUBIDs: ReviewTask[] = [
  {
    id: '1',
    sourceRecord1: 'Labour Dept Record #4829',
    sourceRecord2: 'GST Database #12847',
    matchProbability: 0.94,
    features: { phonetic: 0.89, nameJW: 0.96, pan: 1.0, pincode: 1.0 },
    status: 'pending',
    businessName1: 'Rajesh Sharma Industries',
    businessName2: 'Rajesh Sharma Industries',
  },
  {
    id: '2',
    sourceRecord1: 'Factory Registry #3421',
    sourceRecord2: 'KSPCB Record #891',
    matchProbability: 0.78,
    features: { phonetic: 0.75, nameJW: 0.82, pan: 0.72, pincode: 1.0 },
    status: 'pending',
    businessName1: 'Tech Solutions Pvt Ltd',
    businessName2: 'Techsolutions Private Limited',
  },
  {
    id: '3',
    sourceRecord1: 'Labour Dept Record #5234',
    sourceRecord2: 'GST Database #13201',
    matchProbability: 0.92,
    features: { phonetic: 0.88, nameJW: 0.94, pan: 1.0, pincode: 0.9 },
    status: 'deferred',
    businessName1: 'Green Packaging Co',
    businessName2: 'Green Packaging Company',
  },
]

export default function ReviewPage() {
  const [tasks, setTasks] = useState<ReviewTask[]>(mockUBIDs)
  const [reasoning, setReasoning] = useState('')
  const [selectedTask, setSelectedTask] = useState<ReviewTask | null>(null)
  const [decidingTask, setDecidingTask] = useState<string | null>(null)

  const handleDecision = async (taskId: string, action: string) => {
    setDecidingTask(taskId)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status:
                  action === 'approve' || action === 'reject' ? 'resolved' : 'deferred',
              }
            : task
        )
      )
      setReasoning('')
    } finally {
      setDecidingTask(null)
    }
  }

  const getTabTasks = (status: string) =>
    tasks.filter((t) => t.status === status)

  const renderTaskCard = (task: ReviewTask) => (
    <Card key={task.id} className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header with Probability */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">{task.businessName1}</h3>
                <Badge
                  variant={
                    task.matchProbability >= 0.85
                      ? 'default'
                      : task.matchProbability >= 0.6
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {(task.matchProbability * 100).toFixed(0)}%
                </Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {task.sourceRecord1}
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTask(task)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Evidence
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{task.businessName1}</DialogTitle>
                  <DialogDescription>Match probability: {(task.matchProbability * 100).toFixed(0)}%</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Feature Breakdown */}
                  <div>
                    <h4 className="font-semibold mb-4">Feature Match Breakdown</h4>
                    <FeatureScore {...task.features} />
                  </div>

                  {/* Decision Reason */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Decision Reason *</label>
                    <Textarea
                      placeholder="Explain why you approve or reject this match..."
                      value={reasoning}
                      onChange={(e) => setReasoning(e.target.value)}
                      required
                    />
                  </div>

                  {/* Decision Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (reasoning.trim()) {
                          handleDecision(task.id, 'approve')
                        }
                      }}
                      disabled={!reasoning.trim() || decidingTask === task.id}
                      className="flex-1"
                    >
                      {decidingTask === task.id && <Spinner  className="mr-2 size-4" />}
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (reasoning.trim()) {
                          handleDecision(task.id, 'reject')
                        }
                      }}
                      disabled={!reasoning.trim() || decidingTask === task.id}
                      className="flex-1"
                    >
                      {decidingTask === task.id && <Spinner  className="mr-2 size-4" />}
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleDecision(task.id, 'defer')
                      }}
                      disabled={decidingTask === task.id}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Defer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Side-by-side Comparison */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Source Record 1</p>
              <p className="font-mono text-sm">{task.sourceRecord1}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Source Record 2</p>
              <p className="font-mono text-sm">{task.sourceRecord2}</p>
            </div>
          </div>

          {/* Feature Scores */}
          <FeatureScore {...task.features} />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Review Queue</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Approve or reject entity matches for UBID creation
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({getTabTasks('pending').length})
          </TabsTrigger>
          <TabsTrigger value="deferred">
            Deferred ({getTabTasks('deferred').length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({getTabTasks('resolved').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {getTabTasks('pending').length > 0 ? (
            getTabTasks('pending').map(renderTaskCard)
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-slate-600 dark:text-slate-400">No pending reviews</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="deferred" className="space-y-4 mt-6">
          {getTabTasks('deferred').length > 0 ? (
            getTabTasks('deferred').map(renderTaskCard)
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-slate-600 dark:text-slate-400">No deferred reviews</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4 mt-6">
          {getTabTasks('resolved').length > 0 ? (
            getTabTasks('resolved').map(renderTaskCard)
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-slate-600 dark:text-slate-400">No resolved reviews</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm text-slate-700 dark:text-slate-200 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              Review the feature scores carefully. Match probability &ge; 85% are recommended for approval, 60-85% need careful review, and &lt; 60% are typically rejected.
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
