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
}, (t) => [
  index('ubids_pincode_idx').on(t.pincode),
  index('ubids_status_idx').on(t.activityStatus),
  index('ubids_code_idx').on(t.ubidCode),
])

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
}, (t) => [
  index('sr_ubid_idx').on(t.ubidId),
  index('sr_pincode_idx').on(t.pincode),
  index('sr_system_idx').on(t.sourceSystem),
  index('sr_pan_idx').on(t.pan),
])

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
}, (t) => [
  index('le_ubid_idx').on(t.ubidId),
  index('le_active_idx').on(t.isActive),
])

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
}, (t) => [
  index('rt_status_idx').on(t.status),
  index('rt_assigned_idx').on(t.assignedTo),
])

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
}, (t) => [
  index('ae_ubid_idx').on(t.ubidId),
  index('ae_event_date_idx').on(t.eventDate),
])

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
}, (t) => [
  index('al_seq_idx').on(t.seq),
  index('al_op_idx').on(t.operation),
  index('al_ubid_idx').on(t.ubidId),
])


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
