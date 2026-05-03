'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users, Database, Clock, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'

const activityData = [
  { name: 'Active', value: 1247, fill: '#10b981' },
  { name: 'Dormant', value: 456, fill: '#f59e0b' },
  { name: 'Closed', value: 144, fill: '#ef4444' },
]

const statsData = [
  { label: 'Total UBIDs', value: '1,847', icon: Users, color: 'bg-blue-500' },
  { label: 'Source Records', value: '4,921', icon: Database, color: 'bg-purple-500' },
  { label: 'Pending Reviews', value: '12', icon: Clock, color: 'bg-yellow-500' },
  { label: 'Match Accuracy', value: '99.2%', icon: TrendingUp, color: 'bg-green-500' },
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
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Real-time UBID platform metrics and status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat) => {
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

      {/* Charts and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Distribution */}
        <Card className="lg:col-span-2">
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
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Adapter Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Adapter Status</CardTitle>
            <CardDescription>Data source health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {adapterStatus.map((adapter) => (
              <div key={adapter.name} className="flex items-start justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                <div>
                  <p className="font-medium text-sm">{adapter.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{adapter.lastRun}</p>
                </div>
                <Badge
                  variant={adapter.status === 'live' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {adapter.status === 'live' ? '●' : '⚠'} {adapter.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Current platform status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm">Database connection: Healthy</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm">Pipeline service: Running</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm">Model version: v1.2.3</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
