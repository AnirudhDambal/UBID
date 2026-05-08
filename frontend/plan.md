# PRD — Day 1 Morning · Anirudh
## DB Schema + Ingest Connect API

**Owner:** Anirudh  
**Deadline:** EOD Day 1 morning block (4h)  
**Stack:** Drizzle ORM · Neon (serverless Postgres) · Next.js Route Handlers  
**Output files:** `lib/db/schema.ts` · `lib/db/index.ts` · `app/api/ingest/connect/route.ts`

---

## 1. Context

This task is the foundation everything else sits on. Pavan's ingestion wizard UI (Steps 1–4) and all downstream pipeline logic depend on the schema being live on Neon and the connect API returning the correct shape. Nothing else can be wired to real data until this ships.

**Done means:**
- `drizzle-kit push` has run, all 7 tables exist on Neon
- `POST /api/ingest/connect` returns the correct schema fixture for each DB type
- Types are exported from `lib/db/schema.ts` so Pavan and Samarth can import them directly

---

## 2. Database Schema

### 2.1 Design decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| ID type | `uuid` (default `gen_random_uuid()`) | Stable across environments, no integer sequence contention |
| Timestamps | `timestamp` with `defaultNow()` | All times in UTC, Neon handles timezone |
| Soft delete | Not used | Audit log is the paper trail; hard deletes never happen |
| PII in DB | FPE-scrambled values only | Raw PII never written to Neon; agent scrambles before POST |
| `audit_log` | INSERT-only enforced at app layer | No UPDATE/DELETE ever issued by app code |

---

### 2.2 `lib/db/schema.ts` — full Drizzle schema

```typescript
import {
  pgTable, uuid, text, timestamp, numeric,
  integer, boolean, jsonb, pgEnum, index,
} from 'drizzle-orm/pg-core'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const activityStatusEnum = pgEnum('activity_status', [
  'Active', 'Dormant', 'Closed', 'Unclassified',
])

export const sourceSystemEnum = pgEnum('source_system', [
  'ShopEstablishment', 'FactoriesAct', 'LabourDept', 'KSPCB', 'Custom',
])

export const reviewActionEnum = pgEnum('review_action', [
  'Approve', 'Reject', 'Defer', 'RequestData',
])

export const reviewStatusEnum = pgEnum('review_status', [
  'Pending', 'Deferred', 'Resolved',
])

export const auditOpEnum = pgEnum('audit_op', [
  'AUTO_MERGE', 'REVIEW_APPROVE', 'REVIEW_REJECT', 'REVIEW_DEFER',
  'UNMERGE', 'PIPELINE_RUN', 'MODEL_PROMOTE', 'THRESHOLD_EVAL',
  'ADAPTER_WARN', 'AUDIT_READ', 'ACTIVITY_CLASSIFY', 'OVERRIDE_STATUS',
])

export const userRoleEnum = pgEnum('user_role', [
  'Admin', 'Reviewer', 'Auditor',
])

// ─── ubids ────────────────────────────────────────────────────────────────────
// One row per unique business identity. The canonical record.

export const ubids = pgTable('ubids', {
  id:              uuid('id').primaryKey().defaultRandom(),
  ubidCode:        text('ubid_code').notNull().unique(),        // e.g. UBID-00231
  canonicalName:   text('canonical_name').notNull(),            // FPE-scrambled
  pincode:         text('pincode').notNull(),
  activityStatus:  activityStatusEnum('activity_status').notNull().default('Unclassified'),
  mergeConfidence: numeric('merge_confidence', { precision: 4, scale: 3 }), // 0.000–1.000
  sourceCount:     integer('source_count').notNull().default(1),
  createdAt:       timestamp('created_at').notNull().defaultNow(),
  updatedAt:       timestamp('updated_at').notNull().defaultNow(),
  classifiedAt:    timestamp('classified_at'),
}, (t) => ({
  pincodeIdx:   index('ubids_pincode_idx').on(t.pincode),
  statusIdx:    index('ubids_status_idx').on(t.activityStatus),
  ubidCodeIdx:  index('ubids_code_idx').on(t.ubidCode),
}))

// ─── source_records ───────────────────────────────────────────────────────────
// One row per record ingested from a source system.
// ALL string fields are FPE-scrambled before insert.

export const sourceRecords = pgTable('source_records', {
  id:               uuid('id').primaryKey().defaultRandom(),
  ubidId:           uuid('ubid_id').references(() => ubids.id),     // null until merged
  sourceSystem:     sourceSystemEnum('source_system').notNull(),
  externalId:       text('external_id').notNull(),                  // ID in source system
  businessName:     text('business_name').notNull(),                // FPE-scrambled
  pan:              text('pan'),                                    // FPE-scrambled
  gstin:            text('gstin'),                                  // FPE-scrambled
  address:          text('address'),                               // FPE-scrambled
  pincode:          text('pincode').notNull(),                      // plain — not PII
  proprietorName:   text('proprietor_name'),                       // FPE-scrambled
  registrationDate: timestamp('registration_date'),
  category:         text('category'),
  phoneticKey:      text('phonetic_key'),                          // computed at ingest
  normName:         text('norm_name'),                             // normalised form
  rawMetadata:      jsonb('raw_metadata'),                         // source-specific extras
  ingestedAt:       timestamp('ingested_at').notNull().defaultNow(),
}, (t) => ({
  ubidIdx:      index('sr_ubid_idx').on(t.ubidId),
  pincodeIdx:   index('sr_pincode_idx').on(t.pincode),
  systemIdx:    index('sr_system_idx').on(t.sourceSystem),
  panIdx:       index('sr_pan_idx').on(t.pan),
}))

// ─── linkage_edges ────────────────────────────────────────────────────────────
// One row per merge decision (auto or human). Append-only — never deleted.
// Unmerge creates a new row with is_active = false, not a delete.

export const linkageEdges = pgTable('linkage_edges', {
  id:                   uuid('id').primaryKey().defaultRandom(),
  ubidId:               uuid('ubid_id').notNull().references(() => ubids.id),
  sourceRecordA:        uuid('source_record_a').notNull().references(() => sourceRecords.id),
  sourceRecordB:        uuid('source_record_b').notNull().references(() => sourceRecords.id),
  matchScore:           numeric('match_score', { precision: 4, scale: 3 }).notNull(),
  featureScores:        jsonb('feature_scores').notNull(),
  // e.g. { name_jw: 0.94, pan_exact: 1.0, pincode: 1.0, phonetic: 1.0, gstin: 0.0 }
  decisionType:         text('decision_type').notNull(),            // 'auto' | 'human'
  decidedBy:            uuid('decided_by').references(() => users.id), // null if auto
  decidedAt:            timestamp('decided_at').notNull().defaultNow(),
  isActive:             boolean('is_active').notNull().default(true),
  unmergedAt:           timestamp('unmerged_at'),
  unmergedBy:           uuid('unmerged_by').references(() => users.id),
  unmergeReason:        text('unmerge_reason'),
}, (t) => ({
  ubidIdx:  index('le_ubid_idx').on(t.ubidId),
  activeIdx: index('le_active_idx').on(t.isActive),
}))

// ─── review_tasks ─────────────────────────────────────────────────────────────
// Created by pipeline for pairs with score in review band (0.60–0.85).

export const reviewTasks = pgTable('review_tasks', {
  id:              uuid('id').primaryKey().defaultRandom(),
  linkageEdgeId:   uuid('linkage_edge_id').notNull().references(() => linkageEdges.id),
  sourceRecordA:   uuid('source_record_a').notNull().references(() => sourceRecords.id),
  sourceRecordB:   uuid('source_record_b').notNull().references(() => sourceRecords.id),
  matchScore:      numeric('match_score', { precision: 4, scale: 3 }).notNull(),
  featureScores:   jsonb('feature_scores').notNull(),
  status:          reviewStatusEnum('status').notNull().default('Pending'),
  assignedTo:      uuid('assigned_to').references(() => users.id),
  action:          reviewActionEnum('action'),                   // set on decide
  reason:          text('reason'),                              // required on decide
  decidedBy:       uuid('decided_by').references(() => users.id),
  decidedAt:       timestamp('decided_at'),
  createdAt:       timestamp('created_at').notNull().defaultNow(),
  deferredUntil:   timestamp('deferred_until'),
}, (t) => ({
  statusIdx:    index('rt_status_idx').on(t.status),
  assignedIdx:  index('rt_assigned_idx').on(t.assignedTo),
}))

// ─── activity_events ──────────────────────────────────────────────────────────
// Compliance events per UBID. Drives Active/Dormant/Closed classification.

export const activityEvents = pgTable('activity_events', {
  id:           uuid('id').primaryKey().defaultRandom(),
  ubidId:       uuid('ubid_id').notNull().references(() => ubids.id),
  sourceSystem: sourceSystemEnum('source_system').notNull(),
  eventType:    text('event_type').notNull(),
  // e.g. 'ShopRenewal' | 'EsiQuarterly' | 'KspcbInspection' | 'FactoryRenewal'
  eventDate:    timestamp('event_date').notNull(),
  description:  text('description'),
  metadata:     jsonb('metadata'),
  ingestedAt:   timestamp('ingested_at').notNull().defaultNow(),
}, (t) => ({
  ubidIdx:      index('ae_ubid_idx').on(t.ubidId),
  eventDateIdx: index('ae_event_date_idx').on(t.eventDate),
}))

// ─── audit_log ────────────────────────────────────────────────────────────────
// APPEND-ONLY. App code never issues UPDATE or DELETE on this table.
// seq is a serial — gaps indicate tampering.

export const auditLog = pgTable('audit_log', {
  id:         uuid('id').primaryKey().defaultRandom(),
  seq:        integer('seq').notNull().generatedAlwaysAsIdentity(),
  operation:  auditOpEnum('operation').notNull(),
  actorId:    uuid('actor_id').references(() => users.id),  // null = system
  actorLabel: text('actor_label').notNull(),                // 'system' or email
  ubidId:     uuid('ubid_id'),                             // nullable — not all ops have UBID
  ubidCode:   text('ubid_code'),
  detail:     text('detail').notNull(),
  metadata:   jsonb('metadata'),
  createdAt:  timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  seqIdx:     index('al_seq_idx').on(t.seq),
  opIdx:      index('al_op_idx').on(t.operation),
  ubidIdx:    index('al_ubid_idx').on(t.ubidId),
}))

// ─── users ────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  email:        text('email').notNull().unique(),
  name:         text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role:         userRoleEnum('role').notNull().default('Reviewer'),
  isActive:     boolean('is_active').notNull().default(true),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  lastLoginAt:  timestamp('last_login_at'),
})

// ─── Inferred types (used across the app) ─────────────────────────────────────

export type Ubid           = typeof ubids.$inferSelect
export type UbidInsert     = typeof ubids.$inferInsert
export type SourceRecord   = typeof sourceRecords.$inferSelect
export type SourceRecordInsert = typeof sourceRecords.$inferInsert
export type LinkageEdge    = typeof linkageEdges.$inferSelect
export type ReviewTask     = typeof reviewTasks.$inferSelect
export type ActivityEvent  = typeof activityEvents.$inferSelect
export type AuditEntry     = typeof auditLog.$inferSelect
export type User           = typeof users.$inferSelect
export type UserInsert      = typeof users.$inferInsert
```

---

### 2.3 `lib/db/index.ts`

```typescript
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL env var is not set')
}

const sql = neon(process.env.DATABASE_URL)

export const db = drizzle(sql, { schema })

export * from './schema'
```

---

### 2.4 `drizzle.config.ts` (root)

```typescript
import type { Config } from 'drizzle-kit'

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
```

**Run once to create tables on Neon:**
```bash
npx drizzle-kit push
```

---

## 3. API Design — `POST /api/ingest/connect`

### 3.1 Purpose

Accepts a DB type + connection URL from the ingestion wizard Step 1. Returns:
1. A connection test result (simulated — we never actually connect to the user's DB from Vercel serverless)
2. A realistic schema fixture for that DB type so Pavan's Step 2 tree can render immediately

> **Why simulate?** Vercel serverless cannot reach arbitrary private DB hosts. The real connection happens via `ubid-agent` on the user's machine. This endpoint validates URL format and returns the expected schema shape so the UI can proceed.

---

### 3.2 Request

```
POST /api/ingest/connect
Content-Type: application/json
Authorization: Bearer <jwt>
```

```typescript
// Request body
type ConnectRequest = {
  db_type: 'mongodb' | 'mysql' | 'postgresql'
  url: string                  // user-supplied connection URL
  system_label: SourceSystem   // 'ShopEstablishment' | 'FactoriesAct' | 'LabourDept' | 'KSPCB' | 'Custom'
  environment: 'production' | 'staging' | 'development'
}
```

**Example request:**
```json
{
  "db_type": "mongodb",
  "url": "mongodb+srv://ubid_reader:demo123@cluster0.karnataka.net/biz_registry",
  "system_label": "ShopEstablishment",
  "environment": "production"
}
```

---

### 3.3 Response — success `200`

```typescript
type ConnectResponse = {
  ok: true
  connection: {
    db_type: 'mongodb' | 'mysql' | 'postgresql'
    host: string          // parsed from URL, never stored
    database: string      // parsed from URL, never stored
    latency_ms: number    // simulated: 38–72ms random
    db_version: string    // e.g. 'MongoDB 7.0' | 'MySQL 8.0' | 'PostgreSQL 16'
    mode: 'simulated'     // always — tells UI this is a fixture, not a live test
  }
  schema: SchemaFixture
}

type SchemaFixture = {
  collections: Collection[]   // 'collections' for mongo, 'tables' for SQL — same field name
}

type Collection = {
  name: string
  row_count: number
  type: 'collection' | 'table'
  columns: Column[]
}

type Column = {
  name: string
  data_type: string           // e.g. 'String' | 'ObjectId' | 'VARCHAR' | 'TEXT' | 'BIGINT'
  nullable: boolean
  is_pii: boolean             // true for name/pan/gstin/address/proprietor fields
  sample_value: string        // redacted sample for display only
  canonical_hint: string | null  // auto-map suggestion e.g. 'business_name' | 'pan' | null
}
```

**Example response (MongoDB):**
```json
{
  "ok": true,
  "connection": {
    "db_type": "mongodb",
    "host": "cluster0.karnataka.net",
    "database": "biz_registry",
    "latency_ms": 42,
    "db_version": "MongoDB 7.0",
    "mode": "simulated"
  },
  "schema": {
    "collections": [
      {
        "name": "businesses",
        "row_count": 983,
        "type": "collection",
        "columns": [
          { "name": "_id",               "data_type": "ObjectId", "nullable": false, "is_pii": false, "sample_value": "64a1f...", "canonical_hint": null },
          { "name": "business_name",     "data_type": "String",   "nullable": false, "is_pii": true,  "sample_value": "[redacted]",    "canonical_hint": "business_name" },
          { "name": "pan_number",        "data_type": "String",   "nullable": true,  "is_pii": true,  "sample_value": "[redacted]",    "canonical_hint": "pan" },
          { "name": "gstin",             "data_type": "String",   "nullable": true,  "is_pii": true,  "sample_value": "[redacted]",    "canonical_hint": "gstin" },
          { "name": "address",           "data_type": "String",   "nullable": true,  "is_pii": true,  "sample_value": "[redacted]",    "canonical_hint": "address" },
          { "name": "pincode",           "data_type": "String",   "nullable": false, "is_pii": false, "sample_value": "560001",        "canonical_hint": "pincode" },
          { "name": "proprietor_name",   "data_type": "String",   "nullable": true,  "is_pii": true,  "sample_value": "[redacted]",    "canonical_hint": "proprietor_name" },
          { "name": "registration_date", "data_type": "Date",     "nullable": true,  "is_pii": false, "sample_value": "2021-04-12",    "canonical_hint": "registration_date" },
          { "name": "category",          "data_type": "String",   "nullable": true,  "is_pii": false, "sample_value": "Retail",        "canonical_hint": "category" }
        ]
      },
      {
        "name": "compliance_events",
        "row_count": 4210,
        "type": "collection",
        "columns": [
          { "name": "_id",          "data_type": "ObjectId", "nullable": false, "is_pii": false, "sample_value": "64b2c...", "canonical_hint": null },
          { "name": "business_ref", "data_type": "ObjectId", "nullable": false, "is_pii": false, "sample_value": "64a1f...", "canonical_hint": null },
          { "name": "event_type",   "data_type": "String",   "nullable": false, "is_pii": false, "sample_value": "RenewalFiled", "canonical_hint": null },
          { "name": "event_date",   "data_type": "Date",     "nullable": false, "is_pii": false, "sample_value": "2025-03-01", "canonical_hint": null },
          { "name": "status",       "data_type": "String",   "nullable": true,  "is_pii": false, "sample_value": "Approved", "canonical_hint": null }
        ]
      }
    ]
  }
}
```

---

### 3.4 Response — validation error `400`

```typescript
type ErrorResponse = {
  ok: false
  error: {
    code: 'INVALID_URL' | 'MISSING_FIELD' | 'UNSUPPORTED_DB_TYPE'
    message: string
    field?: string
  }
}
```

**Triggered when:**
- URL format doesn't match the selected `db_type`
- `db_type` is not one of the three supported values
- `url` is empty

**Example:**
```json
{
  "ok": false,
  "error": {
    "code": "INVALID_URL",
    "message": "URL does not match expected format for PostgreSQL. Expected: postgresql://<user>:<pass>@<host>/<db>",
    "field": "url"
  }
}
```

---

### 3.5 Route handler implementation

```typescript
// app/api/ingest/connect/route.ts
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
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 })
  }

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
      db_version: DB_VERSION_MAP[db_type],
      mode: 'simulated',
    },
    schema: SCHEMA_FIXTURES[db_type],
  })
}
```

---

### 3.6 `lib/ingest/schema-fixtures.ts`

```typescript
export const DB_VERSION_MAP = {
  mongodb:    'MongoDB 7.0',
  mysql:      'MySQL 8.0',
  postgresql: 'PostgreSQL 16',
} as const

export const URL_PATTERNS = {
  mongodb:    /^mongodb(\+srv)?:\/\/.+\/.+/,
  mysql:      /^mysql(2|(\+pymysql)?):\/\/.+\/.+/,
  postgresql: /^postgres(ql)?(\+asyncpg)?:\/\/.+\/.+/,
}

export const URL_FORMAT_HINTS = {
  mongodb:    'mongodb+srv://<user>:<pass>@<host>/<db>  or  mongodb://<host>:<port>/<db>',
  mysql:      'mysql://<user>:<pass>@<host>:<port>/<db>',
  postgresql: 'postgresql://<user>:<pass>@<host>:<port>/<db>',
}

export function validateUrl(dbType: string, url: string) {
  const pattern = URL_PATTERNS[dbType as keyof typeof URL_PATTERNS]
  if (!pattern) return { code: 'UNSUPPORTED_DB_TYPE', message: `${dbType} is not supported` }
  if (!pattern.test(url)) return {
    code: 'INVALID_URL',
    message: `URL does not match expected format for ${dbType}. Expected: ${URL_FORMAT_HINTS[dbType as keyof typeof URL_FORMAT_HINTS]}`,
    field: 'url',
  }
  return null
}

export function parseHost(url: string): string {
  try { return new URL(url).hostname } catch { return 'unknown' }
}

export function parseDatabase(url: string): string {
  try { return new URL(url).pathname.replace('/', '') } catch { return 'unknown' }
}

// ─── Schema fixtures ──────────────────────────────────────────────────────────
// Realistic schemas that match real Karnataka government system structures.
// PII sample values are always '[redacted]' — never real data.

export const SCHEMA_FIXTURES = {
  mongodb: {
    collections: [
      {
        name: 'businesses', row_count: 983, type: 'collection',
        columns: [
          { name: '_id',               data_type: 'ObjectId', nullable: false, is_pii: false, sample_value: '64a1f2e3b4c5d6e7f8a9b0c1', canonical_hint: null },
          { name: 'business_name',     data_type: 'String',   nullable: false, is_pii: true,  sample_value: '[redacted]',                  canonical_hint: 'business_name' },
          { name: 'pan_number',        data_type: 'String',   nullable: true,  is_pii: true,  sample_value: '[redacted]',                  canonical_hint: 'pan' },
          { name: 'gstin',             data_type: 'String',   nullable: true,  is_pii: true,  sample_value: '[redacted]',                  canonical_hint: 'gstin' },
          { name: 'address',           data_type: 'String',   nullable: true,  is_pii: true,  sample_value: '[redacted]',                  canonical_hint: 'address' },
          { name: 'pincode',           data_type: 'String',   nullable: false, is_pii: false, sample_value: '560001',                      canonical_hint: 'pincode' },
          { name: 'proprietor_name',   data_type: 'String',   nullable: true,  is_pii: true,  sample_value: '[redacted]',                  canonical_hint: 'proprietor_name' },
          { name: 'registration_date', data_type: 'Date',     nullable: true,  is_pii: false, sample_value: '2021-04-12T00:00:00.000Z',    canonical_hint: 'registration_date' },
          { name: 'category',          data_type: 'String',   nullable: true,  is_pii: false, sample_value: 'Retail',                      canonical_hint: 'category' },
        ],
      },
      {
        name: 'compliance_events', row_count: 4210, type: 'collection',
        columns: [
          { name: '_id',          data_type: 'ObjectId', nullable: false, is_pii: false, sample_value: '64b2c...', canonical_hint: null },
          { name: 'business_ref', data_type: 'ObjectId', nullable: false, is_pii: false, sample_value: '64a1f...', canonical_hint: null },
          { name: 'event_type',   data_type: 'String',   nullable: false, is_pii: false, sample_value: 'RenewalFiled', canonical_hint: null },
          { name: 'event_date',   data_type: 'Date',     nullable: false, is_pii: false, sample_value: '2025-03-01T00:00:00.000Z', canonical_hint: null },
          { name: 'status',       data_type: 'String',   nullable: true,  is_pii: false, sample_value: 'Approved', canonical_hint: null },
        ],
      },
      {
        name: 'inspections', row_count: 1840, type: 'collection',
        columns: [
          { name: '_id',             data_type: 'ObjectId', nullable: false, is_pii: false, sample_value: '64c3d...', canonical_hint: null },
          { name: 'business_ref',    data_type: 'ObjectId', nullable: false, is_pii: false, sample_value: '64a1f...', canonical_hint: null },
          { name: 'inspector_id',    data_type: 'String',   nullable: false, is_pii: false, sample_value: 'INSP-0042', canonical_hint: null },
          { name: 'inspection_date', data_type: 'Date',     nullable: false, is_pii: false, sample_value: '2024-11-15T00:00:00.000Z', canonical_hint: null },
          { name: 'findings',        data_type: 'String',   nullable: true,  is_pii: false, sample_value: 'No violations', canonical_hint: null },
        ],
      },
    ],
  },

  mysql: {
    collections: [
      {
        name: 'se_registrations', row_count: 1240, type: 'table',
        columns: [
          { name: 'id',               data_type: 'INT',     nullable: false, is_pii: false, sample_value: '10042',       canonical_hint: null },
          { name: 'establishment_name', data_type: 'VARCHAR', nullable: false, is_pii: true, sample_value: '[redacted]', canonical_hint: 'business_name' },
          { name: 'pan',              data_type: 'VARCHAR', nullable: true,  is_pii: true,  sample_value: '[redacted]',  canonical_hint: 'pan' },
          { name: 'gstin',            data_type: 'VARCHAR', nullable: true,  is_pii: true,  sample_value: '[redacted]',  canonical_hint: 'gstin' },
          { name: 'address_line1',    data_type: 'VARCHAR', nullable: true,  is_pii: true,  sample_value: '[redacted]',  canonical_hint: 'address' },
          { name: 'pincode',          data_type: 'CHAR(6)', nullable: false, is_pii: false, sample_value: '560001',      canonical_hint: 'pincode' },
          { name: 'owner_name',       data_type: 'VARCHAR', nullable: true,  is_pii: true,  sample_value: '[redacted]',  canonical_hint: 'proprietor_name' },
          { name: 'registered_on',    data_type: 'DATE',    nullable: true,  is_pii: false, sample_value: '2020-08-15',  canonical_hint: 'registration_date' },
          { name: 'status',           data_type: 'ENUM',    nullable: false, is_pii: false, sample_value: 'Active',      canonical_hint: 'category' },
        ],
      },
      {
        name: 'annual_renewals', row_count: 3102, type: 'table',
        columns: [
          { name: 'id',              data_type: 'INT',     nullable: false, is_pii: false, sample_value: '5001',       canonical_hint: null },
          { name: 'registration_id', data_type: 'INT',     nullable: false, is_pii: false, sample_value: '10042',      canonical_hint: null },
          { name: 'renewal_year',    data_type: 'YEAR',    nullable: false, is_pii: false, sample_value: '2025',       canonical_hint: null },
          { name: 'paid_on',         data_type: 'DATE',    nullable: true,  is_pii: false, sample_value: '2025-03-10', canonical_hint: null },
          { name: 'amount',          data_type: 'DECIMAL', nullable: true,  is_pii: false, sample_value: '2500.00',    canonical_hint: null },
        ],
      },
    ],
  },

  postgresql: {
    collections: [
      {
        name: 'factory_licenses', row_count: 983, type: 'table',
        columns: [
          { name: 'id',              data_type: 'BIGSERIAL',     nullable: false, is_pii: false, sample_value: '1042',       canonical_hint: null },
          { name: 'factory_name',    data_type: 'TEXT',          nullable: false, is_pii: true,  sample_value: '[redacted]', canonical_hint: 'business_name' },
          { name: 'pan',             data_type: 'VARCHAR(10)',   nullable: true,  is_pii: true,  sample_value: '[redacted]', canonical_hint: 'pan' },
          { name: 'gstin',           data_type: 'VARCHAR(15)',   nullable: true,  is_pii: true,  sample_value: '[redacted]', canonical_hint: 'gstin' },
          { name: 'site_address',    data_type: 'TEXT',          nullable: true,  is_pii: true,  sample_value: '[redacted]', canonical_hint: 'address' },
          { name: 'pincode',         data_type: 'VARCHAR(6)',    nullable: false, is_pii: false, sample_value: '560002',     canonical_hint: 'pincode' },
          { name: 'licensee_name',   data_type: 'TEXT',          nullable: true,  is_pii: true,  sample_value: '[redacted]', canonical_hint: 'proprietor_name' },
          { name: 'license_issued',  data_type: 'TIMESTAMPTZ',  nullable: true,  is_pii: false, sample_value: '2019-06-01T00:00:00+05:30', canonical_hint: 'registration_date' },
          { name: 'category',        data_type: 'TEXT',          nullable: true,  is_pii: false, sample_value: 'CategoryA',  canonical_hint: 'category' },
        ],
      },
      {
        name: 'inspection_records', row_count: 2104, type: 'table',
        columns: [
          { name: 'id',            data_type: 'BIGSERIAL', nullable: false, is_pii: false, sample_value: '8001',        canonical_hint: null },
          { name: 'factory_id',    data_type: 'BIGINT',    nullable: false, is_pii: false, sample_value: '1042',        canonical_hint: null },
          { name: 'inspector',     data_type: 'TEXT',      nullable: false, is_pii: false, sample_value: 'INSP-0019',   canonical_hint: null },
          { name: 'inspected_on',  data_type: 'DATE',      nullable: false, is_pii: false, sample_value: '2024-09-22',  canonical_hint: null },
          { name: 'status',        data_type: 'TEXT',      nullable: true,  is_pii: false, sample_value: 'Passed',      canonical_hint: null },
        ],
      },
    ],
  },
} as const
```

---

## 4. Seed Script

Create `scripts/seed.ts` and run with `npx tsx scripts/seed.ts`:

```typescript
import { db } from '@/lib/db'
import { users, ubids, sourceRecords } from '@/lib/db/schema'
import { hashSync } from 'bcrypt-ts'

async function seed() {
  console.log('Seeding...')

  // Users (3 hardcoded demo accounts)
  await db.insert(users).values([
    { email: 'anirudh@ubid.gov',  name: 'Anirudh',  passwordHash: hashSync('demo1234', 10), role: 'Admin' },
    { email: 'reviewer@ubid.gov', name: 'Reviewer', passwordHash: hashSync('demo1234', 10), role: 'Reviewer' },
    { email: 'auditor@ubid.gov',  name: 'Auditor',  passwordHash: hashSync('demo1234', 10), role: 'Auditor' },
  ]).onConflictDoNothing()

  // 10 UBIDs
  const ubidRows = [
    { ubidCode: 'UBID-00231', canonicalName: 'XKBZQN CMJWDACX IQDENCM ADHDCMK', pincode: '560001', activityStatus: 'Active'   as const, mergeConfidence: '0.970', sourceCount: 3 },
    { ubidCode: 'UBID-00104', canonicalName: 'HBCKN XMBBQ TQZOX',               pincode: '560001', activityStatus: 'Active'   as const, mergeConfidence: '0.950', sourceCount: 2 },
    { ubidCode: 'UBID-00192', canonicalName: 'IZNNDXK INCJM TQZOX',             pincode: '560002', activityStatus: 'Active'   as const, mergeConfidence: '0.880', sourceCount: 2 },
    { ubidCode: 'UBID-00071', canonicalName: 'XBQZQXB YYBX & NKBHDNNCX',       pincode: '560001', activityStatus: 'Dormant'  as const, mergeConfidence: '0.910', sourceCount: 3 },
    { ubidCode: 'UBID-00305', canonicalName: 'ZNCJAQT BQBNMZQINCQJY',           pincode: '560001', activityStatus: 'Active'   as const, mergeConfidence: '0.990', sourceCount: 1 },
    { ubidCode: 'UBID-00388', canonicalName: 'XZD YCQBXK FQBJYZV',             pincode: '560002', activityStatus: 'Active'   as const, mergeConfidence: '0.960', sourceCount: 2 },
    { ubidCode: 'UBID-00441', canonicalName: 'JNZQNCMJN FQZYCB QMY',           pincode: '560002', activityStatus: 'Dormant'  as const, mergeConfidence: '0.930', sourceCount: 2 },
    { ubidCode: 'UBID-00512', canonicalName: 'QNJKXHD MBXMDQBX',               pincode: '560003', activityStatus: 'Active'   as const, mergeConfidence: '0.870', sourceCount: 2 },
    { ubidCode: 'UBID-00428', canonicalName: 'HBMZQ MNJYBZV',                  pincode: '560003', activityStatus: 'Closed'   as const, mergeConfidence: '0.940', sourceCount: 2 },
    { ubidCode: 'UBID-00619', canonicalName: 'WDQNVN XIDQQBZX',                pincode: '560001', activityStatus: 'Active'   as const, mergeConfidence: '0.980', sourceCount: 3 },
  ]

  await db.insert(ubids).values(ubidRows).onConflictDoNothing()
  console.log(`Inserted ${ubidRows.length} UBIDs`)

  // Source records will be seeded by Pavan after adapter fixtures are ready
  console.log('Done. Run npx drizzle-kit push first if tables do not exist.')
}

seed().catch(console.error)
```

---

## 5. Handoff checklist

Before handing off to afternoon block:

- [ ] `npx drizzle-kit push` ran successfully — all 7 tables visible in Neon console
- [ ] `POST /api/ingest/connect` tested in Postman / `curl` for all 3 DB types
- [ ] URL validation rejects bad formats correctly
- [ ] `lib/db/schema.ts` types exported and importable (`import type { Ubid } from '@/lib/db'`)
- [ ] Seed script run — 10 UBIDs and 3 users in Neon
- [ ] Pushed to `main` — Vercel preview build passes

---

## 6. What Pavan needs from this (interface contract)

Pavan's Step 2 component imports and renders directly from the connect API response:

```typescript
// Pavan imports this type for the schema tree component
import type { ConnectResponse } from '@/app/api/ingest/connect/route'

// The shape Pavan renders:
response.schema.collections.forEach(col => {
  // col.name          → table/collection name
  // col.row_count     → "983 rows" badge
  // col.type          → "collection" | "table"
  // col.columns[]     → field list
  //   .name           → column name
  //   .data_type      → type pill
  //   .is_pii         → show PII badge
  //   .canonical_hint → auto-populate the mapping dropdown
})
```

**Do not change the shape of `ConnectResponse` without telling Pavan first.**

---

## 7. Environment variables needed

Add to `.env.local` and to Vercel project settings:

```bash
DATABASE_URL=postgresql://...   # Neon connection string (Samarth provides)
NEXTAUTH_SECRET=...             # any random 32-char string
NEXTAUTH_URL=http://localhost:3000
```