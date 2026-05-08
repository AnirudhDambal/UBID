import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  SCHEMA_FIXTURES,
  DB_VERSION_MAP,
  validateUrl,
  parseHost,
  parseDatabase,
} from '@/lib/ingest/schema-fixtures'

export async function POST(req: NextRequest) {
  // const session = await getServerSession(authOptions)
  // if (!session) {
  //   return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 })
  // }

  const body = await req.json()
  const { db_type, url, system_label, environment } = body

  // Validate required fields
  if (!db_type || !url || !system_label) {
    return NextResponse.json({
      ok: false,
      error: { code: 'MISSING_FIELD', message: 'db_type, url, and system_label are required' }
    }, { status: 400 })
  }

  // Validate URL format
  const urlError = validateUrl(db_type, url)
  if (urlError) {
    return NextResponse.json({ ok: false, error: urlError }, { status: 400 })
  }

  // Simulate connection latency (never actually connects)
  await new Promise(r => setTimeout(r, 38 + Math.floor(Math.random() * 34)))

  return NextResponse.json({
    ok: true,
    connection: {
      db_type,
      host: parseHost(url),
      database: parseDatabase(url),
      latency_ms: 38 + Math.floor(Math.random() * 34),
      db_version: DB_VERSION_MAP[db_type as keyof typeof DB_VERSION_MAP],
      mode: 'simulated',
    },
    schema: SCHEMA_FIXTURES[db_type as keyof typeof SCHEMA_FIXTURES],
  })
}
