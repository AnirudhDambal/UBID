'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileJson } from 'lucide-react'

interface AuditLog {
  id: string
  seqNumber: number
  timestamp: Date
  operation: string
  details: string
  userId: string
  status: 'success' | 'failed'
}

const mockLogs: AuditLog[] = [
  {
    id: '1',
    seqNumber: 10847,
    timestamp: new Date('2024-05-03T14:32:00'),
    operation: 'UBID_MERGED',
    details: 'Merged UBID-2024-001846 with UBID-2024-001847 (match score: 0.92)',
    userId: 'reviewer@ubid.gov',
    status: 'success',
  },
  {
    id: '2',
    seqNumber: 10846,
    timestamp: new Date('2024-05-03T13:15:00'),
    operation: 'DECISION_RECORDED',
    details: 'Approved matching pair for Rajesh Sharma Industries (reason: high confidence)',
    userId: 'reviewer@ubid.gov',
    status: 'success',
  },
  {
    id: '3',
    seqNumber: 10845,
    timestamp: new Date('2024-05-03T12:00:00'),
    operation: 'PIPELINE_RUN',
    details: 'Entity resolution pipeline completed: 143 UBIDs created, 32 matches queued',
    userId: 'system',
    status: 'success',
  },
  {
    id: '4',
    seqNumber: 10844,
    timestamp: new Date('2024-05-03T11:45:00'),
    operation: 'DATA_INGESTED',
    details: 'Imported 500 source records from MongoDB (PostgreSQL connector)',
    userId: 'system',
    status: 'success',
  },
  {
    id: '5',
    seqNumber: 10843,
    timestamp: new Date('2024-05-02T16:20:00'),
    operation: 'ACCESS_DENIED',
    details: 'Unauthorized attempt to export audit log',
    userId: 'unknown',
    status: 'failed',
  },
]

export default function AuditPage() {
  const [logs] = useState<AuditLog[]>(mockLogs)
  const [filterOperation, setFilterOperation] = useState<string>('all')

  const operations = ['all', 'UBID_MERGED', 'DECISION_RECORDED', 'PIPELINE_RUN', 'DATA_INGESTED', 'ACCESS_DENIED']

  const filteredLogs =
    filterOperation === 'all' ? logs : logs.filter((log) => log.operation === filterOperation)

  const handleExport = () => {
    const csv = [
      ['Seq#', 'Timestamp', 'Operation', 'Details', 'User', 'Status'],
      ...filteredLogs.map((log) => [
        log.seqNumber,
        log.timestamp.toISOString(),
        log.operation,
        log.details,
        log.userId,
        log.status,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Immutable record of all platform operations and decisions
        </p>
      </div>

      {/* Security Notice */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            🔒 This audit log is immutable and append-only. All entries are cryptographically signed
            for compliance and forensic analysis.
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Filter by Operation</label>
            <div className="flex flex-wrap gap-2">
              {operations.map((op) => (
                <Button
                  key={op}
                  variant={filterOperation === op ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterOperation(op)}
                  className="capitalize"
                >
                  {op.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing {filteredLogs.length} of {logs.length} entries
              </p>
              <Button size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Seq#</th>
                  <th className="text-left py-3 px-4 font-semibold">Timestamp</th>
                  <th className="text-left py-3 px-4 font-semibold">Operation</th>
                  <th className="text-left py-3 px-4 font-semibold">Details</th>
                  <th className="text-left py-3 px-4 font-semibold">User</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <tr
                    key={log.id}
                    className={`border-b ${
                      idx % 2 === 0 ? 'bg-slate-50 dark:bg-slate-900/30' : ''
                    } hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
                  >
                    <td className="py-3 px-4 font-mono text-xs">{log.seqNumber}</td>
                    <td className="py-3 px-4 text-xs">
                      {log.timestamp.toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="font-mono text-xs">
                        {log.operation.replace(/_/g, '_')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">{log.details}</td>
                    <td className="py-3 px-4 text-xs">{log.userId}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={log.status === 'success' ? 'default' : 'destructive'}
                        className="text-xs capitalize"
                      >
                        {log.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileJson className="w-5 h-5" />
            JSON Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Export logs in JSON format for integration with external compliance systems
          </p>
          <Button variant="outline" size="sm">
            <FileJson className="w-4 h-4 mr-2" />
            Export as JSON
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
