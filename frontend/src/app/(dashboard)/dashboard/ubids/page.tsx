'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ConfidenceBar } from '@/components/ubid/confidence-bar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Search, Eye, Download } from 'lucide-react'

interface UBID {
  id: string
  ubidNumber: string
  businessName: string
  pan: string
  sourceCount: number
  confidence: number
  status: 'active' | 'dormant' | 'closed'
  lastUpdated: Date
}

const mockUBIDs: UBID[] = [
  {
    id: '1',
    ubidNumber: 'UBID-2024-001847',
    businessName: 'Rajesh Sharma Industries',
    pan: 'AAAPA1234K',
    sourceCount: 3,
    confidence: 0.98,
    status: 'active',
    lastUpdated: new Date('2024-05-03'),
  },
  {
    id: '2',
    ubidNumber: 'UBID-2024-001846',
    businessName: 'Tech Solutions Pvt Ltd',
    pan: 'AABCT5678F',
    sourceCount: 5,
    confidence: 0.94,
    status: 'active',
    lastUpdated: new Date('2024-05-02'),
  },
  {
    id: '3',
    ubidNumber: 'UBID-2024-001845',
    businessName: 'Green Packaging Co',
    pan: 'AACPG1234M',
    sourceCount: 2,
    confidence: 0.87,
    status: 'dormant',
    lastUpdated: new Date('2024-04-28'),
  },
]

export default function UBIDsPage() {
  const [ubids, setUbids] = useState<UBID[]>(mockUBIDs)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'dormant' | 'closed'>('all')
  const [selectedUBID, setSelectedUBID] = useState<UBID | null>(null)

  const filteredUbids = ubids.filter((ubid) => {
    const matchesSearch =
      ubid.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ubid.ubidNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ubid.pan.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || ubid.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">UBID Registry</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Browse and manage Universal Business Identifiers
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, UBID, or PAN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {(['all', 'active', 'dormant', 'closed'] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {filteredUbids.map((ubid) => (
          <Card key={ubid.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{ubid.businessName}</h3>
                      <Badge
                        variant={
                          ubid.status === 'active'
                            ? 'default'
                            : ubid.status === 'dormant'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {ubid.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {ubid.ubidNumber}
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUBID(ubid)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{ubid.businessName}</DialogTitle>
                        <DialogDescription>{ubid.ubidNumber}</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">
                              PAN
                            </p>
                            <p className="font-medium">{ubid.pan}</p>
                          </div>
                          <div>
                            <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">
                              Status
                            </p>
                            <Badge variant="default" className="capitalize">
                              {ubid.status}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">
                              Source Records
                            </p>
                            <p className="font-medium">{ubid.sourceCount}</p>
                          </div>
                          <div>
                            <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">
                              Last Updated
                            </p>
                            <p className="font-medium">
                              {ubid.lastUpdated.toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Confidence */}
                        <div>
                          <p className="text-sm font-medium mb-2">Merge Confidence</p>
                          <ConfidenceBar value={ubid.confidence} max={1} />
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {(ubid.confidence * 100).toFixed(1)}%
                          </p>
                        </div>

                        {/* Linked Records */}
                        <div>
                          <p className="text-sm font-medium mb-2">Linked Source Records</p>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {Array.from({ length: ubid.sourceCount }).map((_, i) => (
                              <div
                                key={i}
                                className="text-xs p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800"
                              >
                                Source Record {i + 1}: {ubid.businessName} (PAN: {ubid.pan})
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">PAN</p>
                    <p className="font-mono font-medium">{ubid.pan}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">Source Records</p>
                    <p className="font-medium">{ubid.sourceCount}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">Last Updated</p>
                    <p className="font-medium">{ubid.lastUpdated.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">Confidence</p>
                    <p className="font-medium">{(ubid.confidence * 100).toFixed(0)}%</p>
                  </div>
                </div>

                {/* Confidence Bar */}
                <ConfidenceBar value={ubid.confidence} max={1} size="sm" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export as CSV
        </Button>
      </div>
    </div>
  )
}
