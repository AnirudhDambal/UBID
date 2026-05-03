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
