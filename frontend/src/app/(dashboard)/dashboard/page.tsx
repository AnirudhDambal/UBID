'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, Database, Clock, TrendingUp, CheckCircle2 } from 'lucide-react'

const activityData = [
  { name: 'Active', value: 1247 },
  { name: 'Dormant', value: 456 },
  { name: 'Closed', value: 144 },
]

const statsData = [
  { label: 'Total UBIDs', value: '1,847', icon: Users, tone: 'bg-sky-500/15 text-sky-700 dark:text-sky-300' },
  { label: 'Source Records', value: '4,921', icon: Database, tone: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300' },
  { label: 'Pending Reviews', value: '12', icon: Clock, tone: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
  { label: 'Match Accuracy', value: '99.2%', icon: TrendingUp, tone: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
]

const adapterStatus = [
  { name: 'Labour Department', status: 'live', lastRun: '2 mins ago' },
  { name: 'KSPCB Records', status: 'delayed', lastRun: '4 hours ago' },
  { name: 'Factory Registry', status: 'live', lastRun: '1 min ago' },
  { name: 'GST Database', status: 'live', lastRun: '15 mins ago' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Real-time UBID platform metrics and status
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary">Live Metrics</Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/80 backdrop-blur shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                    <p className="text-2xl font-semibold mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.tone}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Distribution */}
        <Card className="lg:col-span-2 border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Activity Distribution</CardTitle>
            <CardDescription>UBID status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Adapter Status */}
        <Card className="border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Adapter Status</CardTitle>
            <CardDescription>Data source health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {adapterStatus.map((adapter) => (
              <div key={adapter.name} className="flex items-start justify-between p-3 rounded-lg bg-slate-50/80 dark:bg-slate-900/70">
                <div>
                  <p className="font-medium text-sm">{adapter.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{adapter.lastRun}</p>
                </div>
                <Badge
                  className={`text-xs capitalize ${
                    adapter.status === 'live'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {adapter.status === 'live' ? '●' : '⚠'} {adapter.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Current platform status</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm">Database connection: Healthy</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-sky-500/20 bg-sky-500/5 px-4 py-3">
            <CheckCircle2 className="w-5 h-5 text-sky-600" />
            <span className="text-sm">Pipeline service: Running</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
            <span className="text-sm">Model version: v1.2.3</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
