'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Zap, AlertCircle } from 'lucide-react'

interface TimelineEvent {
  id: string
  ubidId: string
  businessName: string
  eventType: string
  source: string
  timestamp: Date
  rule: string
}

const mockEvents: TimelineEvent[] = [
  {
    id: '1',
    ubidId: 'UBID-2024-001847',
    businessName: 'Rajesh Sharma Industries',
    eventType: 'Labour Department Inspection',
    source: 'Labour Dept',
    timestamp: new Date('2024-05-03'),
    rule: 'Active if inspection passed',
  },
  {
    id: '2',
    ubidId: 'UBID-2024-001846',
    businessName: 'Tech Solutions Pvt Ltd',
    eventType: 'GST Payment Recorded',
    source: 'GST Database',
    timestamp: new Date('2024-05-02'),
    rule: 'Active if payment recent',
  },
  {
    id: '3',
    ubidId: 'UBID-2024-001845',
    businessName: 'Green Packaging Co',
    eventType: 'Safety Audit Completed',
    source: 'KSPCB',
    timestamp: new Date('2024-04-28'),
    rule: 'Compliance check',
  },
]

export default function ActivityPage() {
  const [events] = useState<TimelineEvent[]>(mockEvents)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const stats = [
    { label: 'Active UBIDs', value: '1,247', icon: Zap, color: 'bg-green-500' },
    { label: 'Dormant UBIDs', value: '456', icon: AlertCircle, color: 'bg-yellow-500' },
    { label: 'Recent Events', value: `${events.length}`, icon: Activity, color: 'bg-blue-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Activity Status</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Monitor UBID status and activity events
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity Timeline</CardTitle>
          <CardDescription>Latest events affecting UBID status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {events.map((event, index) => (
              <div key={event.id} className="flex gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900" />
                  {index < events.length - 1 && (
                    <div className="w-1 h-12 bg-slate-200 dark:bg-slate-700 mt-2" />
                  )}
                </div>

                {/* Event content */}
                <div className="flex-1 pb-4">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{event.businessName}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {event.eventType}
                        </p>
                      </div>
                      <Badge variant="secondary">{event.source}</Badge>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      {mounted ? (
                        <>
                          {event.timestamp.toLocaleDateString()} at{' '}
                          {event.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </>
                      ) : (
                        <span>Loading date...</span>
                      )}
                    </p>

                    <div className="mt-3 p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">Rule: </span>
                        {event.rule}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Classification Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge className="mt-1">Active</Badge>
            <p className="text-sm">Recent compliance events, regular activity, or ongoing operations</p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="secondary" className="mt-1">
              Dormant
            </Badge>
            <p className="text-sm">No activity in past 18 months or pending verification</p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="destructive" className="mt-1">
              Closed
            </Badge>
            <p className="text-sm">Officially shut down, deregistered, or merged with another entity</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
