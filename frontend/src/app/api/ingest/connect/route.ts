import { NextRequest, NextResponse } from 'next/server'

// Mock schema data for different database types
const mockSchemas: Record<string, { tables: string[] }> = {
  mongodb: {
    tables: [
      'customers',
      'orders',
      'transactions',
      'products',
      'shipments',
    ],
  },
  mysql: {
    tables: [
      'businesses',
      'registrations',
      'licenses',
      'inspections',
      'compliance_records',
    ],
  },
  postgres: {
    tables: [
      'factories',
      'workers',
      'certifications',
      'safety_audits',
      'environmental_reports',
    ],
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { db_type, url } = body

    // Validate input
    if (!db_type || !url) {
      return NextResponse.json(
        { error: 'Missing db_type or url' },
        { status: 400 }
      )
    }

    // Validate db_type
    if (!['mongodb', 'mysql', 'postgres'].includes(db_type)) {
      return NextResponse.json(
        { error: 'Invalid db_type. Must be mongodb, mysql, or postgres' },
        { status: 400 }
      )
    }

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Return mock schema based on db_type
    const schema = mockSchemas[db_type as keyof typeof mockSchemas]

    return NextResponse.json({
      success: true,
      db_type,
      tables: schema.tables,
      connection_time: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Connection failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
