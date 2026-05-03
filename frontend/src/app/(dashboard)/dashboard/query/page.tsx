'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Copy, PlayCircle, Clock } from 'lucide-react'

interface Query {
  id: string
  name: string
  description: string
  query: string
  result?: {
    data: Array<Record<string, any>>
    duration: number
  }
  isRunning?: boolean
}

const queries: Query[] = [
  {
    id: 'active-by-pincode',
    name: 'Active UBIDs by Pincode',
    description: 'Count of active UBIDs grouped by pincode',
    query: `SELECT pincode, COUNT(*) as ubid_count, COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM ubids
GROUP BY pincode
ORDER BY active_count DESC
LIMIT 20`,
  },
  {
    id: 'uninspected-factories',
    name: 'Uninspected Factories',
    description: 'Active UBIDs with no Labour Department inspection in 18 months',
    query: `SELECT u.id, u.business_name, u.created_at
FROM ubids u
WHERE u.status = 'active'
AND NOT EXISTS (
  SELECT 1 FROM activity_events ae
  WHERE ae.ubid_id = u.id
  AND ae.event_type = 'Labour Department Inspection'
  AND ae.timestamp > NOW() - INTERVAL 18 MONTH
)`,
  },
  {
    id: 'compliance-gaps',
    name: 'Compliance Gaps',
    description: 'Entities with Labour event but no KSPCB compliance',
    query: `SELECT DISTINCT u.id, u.business_name
FROM ubids u
WHERE EXISTS (
  SELECT 1 FROM activity_events ae
  WHERE ae.ubid_id = u.id AND ae.source = 'Labour Department'
)
AND NOT EXISTS (
  SELECT 1 FROM activity_events ae2
  WHERE ae2.ubid_id = u.id AND ae2.source = 'KSPCB'
)`,
  },
]

export default function QueryPage() {
  const [queryResults, setQueryResults] = useState<Record<string, Query['result']>>({})
  const [runningQueries, setRunningQueries] = useState<Set<string>>(new Set())

  const handleRunQuery = async (query: Query) => {
    setRunningQueries((prev) => new Set(prev).add(query.id))

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setQueryResults((prev) => ({
        ...prev,
        [query.id]: {
          data: [
            { result1: 'Sample result 1', result2: 'Value A' },
            { result1: 'Sample result 2', result2: 'Value B' },
            { result1: 'Sample result 3', result2: 'Value C' },
          ],
          duration: Math.random() * 500 + 100,
        },
      }))
    } finally {
      setRunningQueries((prev) => {
        const next = new Set(prev)
        next.delete(query.id)
        return next
      })
    }
  }

  const handleCopyQuery = (queryText: string) => {
    navigator.clipboard.writeText(queryText)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Query Console</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Run pre-built queries to analyze UBID data
        </p>
      </div>

      {/* Queries */}
      <div className="space-y-4">
        {queries.map((query) => (
          <Card key={query.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{query.name}</CardTitle>
                  <CardDescription className="mt-1">{query.description}</CardDescription>
                </div>
                <Badge variant="secondary">{query.id}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Query Code */}
              <div className="bg-slate-900 dark:bg-black rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400">SQL</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyQuery(query.query)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <pre className="font-mono text-sm text-green-400 overflow-x-auto">
                  <code>{query.query}</code>
                </pre>
              </div>

              {/* Results */}
              {queryResults[query.id] && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Results:</span>
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {queryResults[query.id]?.duration.toFixed(0)}ms
                    </Badge>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="font-mono text-xs">
                      {JSON.stringify(queryResults[query.id]?.data, null, 2)}
                    </div>
                  </div>
                </div>
              )}

              {/* Run Button */}
              <Button
                onClick={() => handleRunQuery(query)}
                disabled={runningQueries.has(query.id)}
                className="w-full"
              >
                {runningQueries.has(query.id) ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Run Query
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            💡 Custom SQL queries are available to admins only. Contact your administrator to
            execute custom queries or create new saved queries.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
