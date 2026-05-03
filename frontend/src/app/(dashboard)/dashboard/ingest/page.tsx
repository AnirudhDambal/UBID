'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { StepperHeader } from '@/components/ubid/stepper-header'
import { PipelineStep5 } from '@/components/ubid/pipeline-wizard-step'
import { Database, Check, AlertCircle, Eye } from 'lucide-react'

interface DBConnection {
  dbType: 'mongodb' | 'mysql' | 'postgres' | null
  url: string
  isConnecting: boolean
  latency: number | null
  error: string | null
  detectedTables: string[]
}

interface FieldMapping {
  [key: string]: string
}

const dbIcons: { [key: string]: string } = {
  mongodb: '🍃',
  mysql: '🐬',
  postgres: '🐘',
}

const dbDescriptions: { [key: string]: string } = {
  mongodb: 'MongoDB: Document database',
  mysql: 'MySQL: Relational database',
  postgres: 'PostgreSQL: Advanced relational database',
}

const sampleFields = {
  mongodb: [
    { name: 'business_name', type: 'string', pii: false },
    { name: 'pan', type: 'string', pii: true },
    { name: 'pincode', type: 'string', pii: false },
    { name: 'address', type: 'string', pii: true },
    { name: 'gst', type: 'string', pii: true },
  ],
  mysql: [
    { name: 'name', type: 'string', pii: false },
    { name: 'pan_number', type: 'string', pii: true },
    { name: 'postal_code', type: 'string', pii: false },
    { name: 'street_address', type: 'string', pii: true },
    { name: 'gstin', type: 'string', pii: true },
  ],
  postgres: [
    { name: 'business_name', type: 'varchar', pii: false },
    { name: 'pan', type: 'varchar', pii: true },
    { name: 'pincode', type: 'varchar', pii: false },
    { name: 'full_address', type: 'text', pii: true },
    { name: 'gst_number', type: 'varchar', pii: true },
  ],
}

const defaultMappings: FieldMapping = {
  name: 'business_name',
  business_name: 'business_name',
  pan: 'pan',
  pan_number: 'pan',
  pincode: 'pincode',
  postal_code: 'pincode',
  zip: 'pincode',
  address: 'address',
  street_address: 'address',
  full_address: 'address',
  gst: 'gstin',
  gstin: 'gstin',
  gst_number: 'gstin',
}

export default function IngestPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [connection, setConnection] = useState<DBConnection>({
    dbType: null,
    url: '',
    isConnecting: false,
    latency: null,
    error: null,
    detectedTables: [],
  })
  const [fieldMappings, setFieldMappings] = useState<FieldMapping>({})
  const [previewData, setPreviewData] = useState<Array<Record<string, string>>>([])

  const handleSelectDB = (dbType: 'mongodb' | 'mysql' | 'postgres') => {
    setConnection({
      ...connection,
      dbType,
      url: dbType === 'mongodb' ? 'mongodb://localhost:27017' : `${dbType}://localhost`,
      error: null,
      detectedTables: [],
    })
  }

  const handleTestConnection = async () => {
    if (!connection.url) {
      setConnection({ ...connection, error: 'Please enter a connection URL' })
      return
    }

    setConnection({ ...connection, isConnecting: true, error: null })

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200))

      const mockTables: { [key: string]: string[] } = {
        mongodb: ['businesses', 'registrations', 'compliance_records'],
        mysql: ['entities', 'business_data', 'inspection_logs'],
        postgres: ['ubid_source', 'factory_records', 'certification_data'],
      }

      setConnection({
        ...connection,
        isConnecting: false,
        latency: Math.random() * 150 + 50,
        detectedTables: mockTables[connection.dbType || 'mongodb'] || [],
      })
    } catch (error) {
      setConnection({
        ...connection,
        isConnecting: false,
        error: 'Connection failed. Please check your credentials.',
      })
    }
  }

  const handleFieldMapping = (sourceField: string, targetField: string) => {
    setFieldMappings({
      ...fieldMappings,
      [sourceField]: targetField,
    })
  }

  const handleAutoMap = () => {
    const dbType = connection.dbType || 'mongodb'
    const fields = sampleFields[dbType as keyof typeof sampleFields] || []
    const newMappings: FieldMapping = {}

    fields.forEach((field) => {
      newMappings[field.name] = defaultMappings[field.name] || field.name
    })

    setFieldMappings(newMappings)
  }

  const handlePreview = async () => {
    setConnection({ ...connection, isConnecting: true })

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))

      setPreviewData([
        {
          business_name: 'Rajesh Sharma Industries',
          pan_encrypted: '••••••••K',
          pincode: '560001',
        },
        {
          business_name: 'Tech Solutions Pvt Ltd',
          pan_encrypted: '••••••••F',
          pincode: '560034',
        },
        {
          business_name: 'Green Packaging Co',
          pan_encrypted: '••••••••M',
          pincode: '560002',
        },
      ])
    } finally {
      setConnection({ ...connection, isConnecting: false })
    }
  }

  const dbType = connection.dbType || 'mongodb'
  const fields = sampleFields[dbType as keyof typeof sampleFields] || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Data Ingestion Wizard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Connect your database and map fields for entity resolution
        </p>
      </div>

      {/* Progress Stepper */}
      <Card>
        <CardContent className="pt-6">
          <StepperHeader 
            currentStep={currentStep} 
            totalSteps={5}
            steps={['Connect Database', 'Detect Schema', 'Map Fields', 'Preview Data', 'Run Pipeline']}
          />
        </CardContent>
      </Card>

      {/* Step 1: Database Connection */}
      {currentStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Connect Database</CardTitle>
            <CardDescription>Select your database type and enter connection details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* DB Type Selector */}
            <div>
              <label className="text-sm font-medium mb-3 block">Database Type</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['mongodb', 'mysql', 'postgres'] as const).map((db) => (
                  <button
                    key={db}
                    onClick={() => handleSelectDB(db)}
                    className={`p-4 rounded-lg border-2 transition-colors text-left ${
                      connection.dbType === db
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="text-3xl mb-2">{dbIcons[db]}</div>
                    <p className="font-semibold">{dbDescriptions[db]}</p>
                  </button>
                ))}
              </div>
            </div>

            {connection.dbType && (
              <>
                {/* Connection URL */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Connection URL</label>
                  <Input
                    value={connection.url}
                    onChange={(e) =>
                      setConnection({ ...connection, url: e.target.value })
                    }
                    placeholder={`${connection.dbType}://user:password@host:port/database`}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Format: {connection.dbType}://host[:port]/database
                  </p>
                </div>

                {/* Test Connection */}
                <div className="space-y-2">
                  <Button
                    onClick={handleTestConnection}
                    disabled={connection.isConnecting}
                    className="w-full"
                  >
                    {connection.isConnecting ? (
                      <>
                        <Spinner className="mr-2" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>

                  {connection.error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700 dark:text-red-200">{connection.error}</p>
                    </div>
                  )}

                  {connection.latency !== null && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <p className="text-sm font-medium text-green-700 dark:text-green-200">
                          Connection successful
                        </p>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-300">
                        Latency: {connection.latency.toFixed(0)}ms
                      </p>
                    </div>
                  )}

                  {connection.detectedTables.length > 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-200 mb-2">
                        Detected Tables:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {connection.detectedTables.map((table) => (
                          <Badge key={table} variant="secondary" className="text-xs">
                            {table}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setCurrentStep(1)}
                disabled={!connection.latency}
                className="flex-1"
              >
                Next: Field Mapping
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Schema Detection */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Detected Schema</CardTitle>
            <CardDescription>Review fields detected from your database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {fields.map((field) => (
                <div
                  key={field.name}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded border"
                >
                  <div>
                    <p className="font-medium text-sm">{field.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Type: {field.type}</p>
                  </div>
                  {field.pii && (
                    <Badge variant="destructive" className="text-xs">
                      PII
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(0)}
                className="flex-1"
              >
                Back
              </Button>
              <Button onClick={() => setCurrentStep(2)} className="flex-1">
                Next: Field Mapping
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Field Mapping */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Field Mapping</CardTitle>
            <CardDescription>Map source fields to UBID fields</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              onClick={handleAutoMap}
              size="sm"
              className="mb-4"
            >
              Auto-Map Heuristic
            </Button>

            <div className="space-y-3">
              {fields.map((field) => (
                <div key={field.name} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{field.name}</p>
                  </div>
                  <Select
                    value={fieldMappings[field.name] || ''}
                    onChange={(e) => handleFieldMapping(field.name, e.target.value)}
                  >
                    <option value="">Select mapping...</option>
                    <option value="business_name">Business Name</option>
                    <option value="pan">PAN</option>
                    <option value="pincode">Pincode</option>
                    <option value="address">Address</option>
                    <option value="gstin">GSTIN</option>
                    <option value="_skip">Skip this field</option>
                  </Select>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button onClick={() => setCurrentStep(3)} className="flex-1">
                Next: Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Data Preview */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Data Preview</CardTitle>
            <CardDescription>Preview sample records with applied mappings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handlePreview}
              disabled={connection.isConnecting}
              className="w-full"
            >
              {connection.isConnecting ? (
                <>
                  <Spinner className="mr-2" />
                  Loading Preview...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Load Preview Data
                </>
              )}
            </Button>

            {previewData.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(previewData[0]).map((key) => (
                        <th key={key} className="text-left py-2 px-3 font-semibold">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-slate-50 dark:hover:bg-slate-900">
                        {Object.values(row).map((val, i) => (
                          <td key={i} className="py-2 px-3">
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="flex-1"
              >
                Back
              </Button>
              <Button onClick={() => setCurrentStep(4)} className="flex-1">
                Next: Run Pipeline
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Pipeline Execution */}
      {currentStep === 4 && (
        <PipelineStep5 dbType={connection.dbType || 'mongodb'} onComplete={() => {}} />
      )}
    </div>
  )
}
