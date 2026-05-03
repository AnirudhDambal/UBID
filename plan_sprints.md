# UBID Platform — 3-Day Build Plan
**Team:** Anirudh · Pavan · Samarth  
**Deploy target:** Vercel (Next.js frontend) + Vercel Serverless Functions (API)  
**Sprint cadence:** Morning sync (15 min) · Evening push (mandatory)  
**Rule:** If it's not on this list, don't build it. Ship beats perfect.

---

## Stack (locked)
```
Frontend   Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui
API        Next.js Route Handlers (no separate FastAPI — Vercel serverless)
DB         Neon (serverless Postgres) — free tier, no server to manage
ORM        Drizzle ORM (lightweight, edge-compatible)
ER Engine  Splink logic ported to TypeScript (simplified, runs in serverless)
Queue      Vercel background functions (no Redis/Celery)
Auth       NextAuth.js v5 (credentials provider, role in JWT)
Deploy     Vercel (git push = deploy)
```

---

## What we're building (scope)

| Module | Ships? |
|--------|--------|
| DB connection wizard (MongoDB/MySQL/PG) | ✅ Day 1 |
| Schema detection + field mapping | ✅ Day 1 |
| FPE scrambling (FF3-1, client-side preview) | ✅ Day 1 |
| ER pipeline (Splink-style scoring, serverless) | ✅ Day 2 |
| UBID Registry + Activity status | ✅ Day 2 |
| Review queue + decision flow | ✅ Day 2 |
| Audit log (append-only) | ✅ Day 2 |
| Query console (3 built-in queries) | ✅ Day 3 |
| Model health + threshold proposal | ✅ Day 3 |
| Dashboard with live metrics | ✅ Day 3 |
| Docker / CI-CD / K8s | ❌ skip |
| Apache AGE graph | ❌ skip (use adjacency table) |
| Real government adapter connectivity | ❌ skip (mock data) |
| OAuth2 SSO | ❌ skip (basic auth) |

---

## Repo setup (Day 0 — tonight, ~30 min, anyone)
```bash
npx create-next-app@latest ubid-platform --typescript --tailwind --app
cd ubid-platform
npx shadcn@latest init
npm install drizzle-orm @neondatabase/serverless drizzle-kit
npm install next-auth@beta
npm install @anthropic-ai/sdk          # for Claude-powered field mapping
vercel link                             # connect to Vercel project
```
Push to GitHub. Add `DATABASE_URL` (Neon), `NEXTAUTH_SECRET` to Vercel env vars.  
**Everyone pulls this repo first thing Day 1.**

---

## Day 1 — Data Ingestion Layer
> **Goal by EOD:** User can paste a DB URL, see schema, map fields, preview FPE data, and trigger pipeline.

---

### Anirudh — Backend (API Routes + DB schema)

**Morning (4h)**
- `lib/db/schema.ts` — Drizzle schema for all 7 tables:
  ```
  ubids, source_records, linkage_edges, audit_log,
  review_tasks, activity_events, users
  ```
- `lib/db/index.ts` — Neon connection via `@neondatabase/serverless`
- Run `drizzle-kit push` to create tables on Neon
- `app/api/ingest/connect/route.ts` — POST, takes `{db_type, url}`, simulates connection test, returns mock schema for that DB type (MongoDB/MySQL/PG schemas hardcoded as realistic fixtures)

**Afternoon (4h)**
- `app/api/ingest/preview/route.ts` — POST, takes `{db_type, field_mappings}`, returns 3 normalised + FPE-scrambled sample rows
- `lib/normalise.ts` — legal suffix canonicalise, address expand, case fold, Double Metaphone stub
- `lib/fpe.ts` — FF3-1 format-preserving scrambler (pure TS, no native deps — use a simple substitution cipher that preserves format for demo)
- Seed Neon with 50 mock `source_records` and 10 mock `ubids`

**Deliverable:** `/api/ingest/connect` returns schema JSON, `/api/ingest/preview` returns scrambled rows, DB seeded.

---

### Pavan — Ingestion Wizard UI (Steps 1–4)

**Morning (4h)**
- `app/(dashboard)/ingest/page.tsx` — stepper shell (5 steps), step state in `useState`
- Step 1 — DB type cards (MongoDB 🍃 / MySQL 🐬 / PostgreSQL 🐘), URL input with format hint per type, "Test Connection" button → hits `/api/ingest/connect`, shows latency + detected tables

**Afternoon (4h)**
- Step 2 — Schema tree from API response: collections/tables, columns, type pills, PII badges on name/pan/address/gstin
- Step 3 — Field mapping: source col → canonical field dropdowns, auto-populated by heuristic, PII lock icons, required field guard
- Step 4 — Preview table: 3 rows × 6 columns, FPE-scrambled cells highlighted amber, normalisation checklist, ingestion stats card

**Deliverable:** Steps 1–4 fully wired to API, interactive, no mock JS — real fetch calls.

---

### Samarth — Project shell + auth + layout

**Morning (4h)**
- `app/layout.tsx` — sidebar nav, header, page shell
- `app/(auth)/login/page.tsx` — email/password form, NextAuth credentials provider, hardcode 3 users: `anirudh@ubid.gov` (ADMIN), `reviewer@ubid.gov` (REVIEWER), `auditor@ubid.gov` (AUDITOR)
- Sidebar nav items wired to pages (Dashboard, Ingestion, Registry, Activity, Review Queue, Audit Log, Query Console, Model Health)
- Role-based sidebar: AUDITOR sees no Ingestion or Model Health

**Afternoon (4h)**
- `components/ui/*` — shared: Badge, ConfidenceBar, Timeline, StepperHeader, StatCard, DataTable
- Dark navy theme applied globally (CSS vars matching prototype)
- `app/(dashboard)/dashboard/page.tsx` — static metric cards (1,847 UBIDs, 4,921 records, 12 pending, 99.2%), adapter status cards, activity distribution bar

**Deliverable:** Login works, sidebar renders, dashboard loads, shared components usable by all.

---

### EOD Day 1 sync (30 min)
- Anirudh demoes API responses in Postman
- Pavan demoes Steps 1–4 wired to real API
- Samarth demoes login → dashboard → sidebar nav
- Agree on any type/interface changes needed for Day 2
- Push everything to `main`, verify Vercel preview deploy works

---

## Day 2 — Core Intelligence
> **Goal by EOD:** Pipeline runs, UBIDs created, review queue populated, audit log live.

---

### Anirudh — ER Pipeline + Audit log API

**Morning (4h)**
- `lib/er/pipeline.ts` — full pipeline orchestrator:
  1. Fetch `source_records` from Neon
  2. Block: group by `pincode` + `phonetic_name` match
  3. Score pairs: Jaro-Winkler (name), exact (PAN/GSTIN), pincode exact → weighted sum → match probability
  4. Decide: ≥0.85 auto-merge → insert `linkage_edge` + update `ubids`; 0.60–0.85 → insert `review_task`; <0.60 discard
  5. Write every decision to `audit_log`
- `app/api/pipeline/run/route.ts` — POST, triggers pipeline, returns `{auto_merged, queued, new_ubids, duration_ms}`

**Afternoon (4h)**
- `app/api/audit/route.ts` — GET, paginated audit log, supports `?limit=50&offset=0`
- `app/api/ubids/route.ts` — GET paginated + filterable. `app/api/ubids/[id]/route.ts` — GET single with linked records
- `app/api/review/route.ts` — GET queue filtered by status. `app/api/review/[id]/decide/route.ts` — POST `{action, reason}`, updates task + writes audit entry

**Deliverable:** Pipeline endpoint works, creates real rows in Neon, review tasks populated, audit log entries correct.

---

### Pavan — Pipeline step 5 UI + Review Queue

**Morning (4h)**
- Step 5 of ingestion wizard — animated pipeline: 6 steps, SSE or polling `/api/pipeline/run` every 500ms, streaming log lines, per-step status badges, result card (auto-merged / queued / new UBIDs counts)
- "Go to Review Queue →" CTA at end

**Afternoon (4h)**
- `app/(dashboard)/review/page.tsx` — tabbed Pending/Deferred/Resolved
- Task card: side-by-side field comparison, match probability badge, feature score breakdown (4 bars: phonetic, name J-W, PAN, pincode)
- Approve / Reject / Defer / Request Data buttons → POST to `/api/review/[id]/decide`
- Evidence modal: larger feature breakdown, reason textarea (required), modal actions
- Badge counter in sidebar updates after decision

**Deliverable:** Pipeline animates end-to-end; review queue shows real tasks from Neon; approve/reject writes to DB.

---

### Samarth — UBID Registry + Activity Status + Audit Log pages

**Morning (4h)**
- `app/(dashboard)/ubids/page.tsx` — DataTable with search + status filter, source badges, confidence bar, "View" opens detail sheet
- UBID detail sheet — all linked source records, merge history from `linkage_edges`, confidence score
- Wire to `/api/ubids`

**Afternoon (4h)**
- `app/(dashboard)/activity/page.tsx` — 3 stat cards, sample UBID timeline (chronological events, source badge, rule annotation on qualifying event)
- `app/(dashboard)/audit/page.tsx` — append-only table, operation type badges, seq numbers, CSV export button, security notice
- Wire both to their respective API routes

**Deliverable:** Registry searchable with real data; activity timeline renders; audit log shows real entries from pipeline run.

---

### EOD Day 2 sync (30 min)
- Run full pipeline together — watch UBID count go from 0 to 143
- Check review queue has tasks; approve one, verify audit log entry
- Check Vercel prod deploy is live
- Prioritise Day 3 based on what's broken or missing

---

## Day 3 — Intelligence + Polish + Ship
> **Goal by EOD:** Query console, model health, dashboard live, everything deployed and demo-ready.

---

### Anirudh — Query console API + model health backend

**Morning (4h)**
- `app/api/query/route.ts` — 3 built-in queries as named endpoints:
  - `?q=active-by-pincode` → GROUP BY pincode, count by status
  - `?q=uninspected-factories` → active UBIDs with no activity event in 18 months
  - `?q=compliance-gaps` → has Labour event, no KSPCB event
- `app/api/stats/route.ts` — returns live dashboard metrics from Neon (ubid count, source record count, pending reviews, precision estimate)
- `app/api/model/route.ts` — GET current model version from `model_versions`. POST `promote` to update threshold stored in Neon settings table

**Afternoon (4h)**
- `lib/activity/classifier.ts` — rules engine: read `activity_events` per UBID, classify Active/Dormant/Closed, write back to `ubids.activity_status`
- `app/api/activity/classify/route.ts` — POST triggers classification for all UBIDs
- Wire dashboard metrics to `/api/stats` so they show real numbers

**Deliverable:** All 3 queries return real data; dashboard shows live Neon counts; classify-all runs and labels UBIDs.

---

### Pavan — Query console UI + model health page

**Morning (4h)**
- `app/(dashboard)/query/page.tsx` — 3 query cards, click to run (POST `/api/query`), animated loading, mono result block, copy button
- Custom SQL textarea (read-only gated — show "Admin only" toast for non-ADMINs)
- Query timing shown in result (e.g. `48ms`)

**Afternoon (4h)**
- `app/(dashboard)/model/page.tsx` — current threshold bars, pending proposal card (Apply/Dismiss), metrics table (precision, recall, auto-merges, labels, agreement rate)
- Retraining history table (version, date, precision, recall, delta, status badge)
- "Trigger Retrain" button → calls `/api/model` POST, toast feedback, table refreshes
- Rollback button on retired versions

**Deliverable:** Query console runs real queries; model health page shows current state; threshold apply writes to DB.

---

### Samarth — Dashboard wiring + end-to-end polish + Vercel deploy

**Morning (4h)**
- Wire dashboard to `/api/stats` — real UBID count, source records, pending review, precision
- Adapter status cards — store last_run timestamps in Neon, show Live/Delayed based on age
- Activity distribution bar — pull from classifier results (Active/Dormant/Closed counts)
- Fix any broken page or layout issue found in Day 2 sync

**Afternoon (4h)**
- Final Vercel deploy — verify all env vars set (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`)
- Smoke test every page in production URL as all 3 roles (ADMIN, REVIEWER, AUDITOR)
- Fix any prod-only issues (CORS, env var missing, Neon cold start)
- Write `README.md` — what the product does, how to run locally, demo login credentials

**Deliverable:** Vercel prod URL fully functional for all roles; README written; demo script ready.

---

### EOD Day 3 — Demo run (1h)
Run through the full demo flow together:

1. Login as ADMIN
2. Go to Ingestion → paste MongoDB demo URL → Test Connection → detect schema → map fields → preview FPE → run pipeline
3. Watch 143 UBIDs created in real time
4. Go to Review Queue → open task → view evidence → approve with reason
5. Go to UBID Registry → search "Sharma" → open detail
6. Go to Query Console → run "compliance gaps" query
7. Go to Model Health → apply threshold proposal
8. Login as AUDITOR → verify restricted sidebar → open Audit Log → export CSV

---

## File structure (target by EOD Day 3)

```
ubid-platform/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← sidebar + header
│   │   ├── dashboard/page.tsx
│   │   ├── ingest/page.tsx         ← 5-step wizard
│   │   ├── ubids/page.tsx
│   │   ├── activity/page.tsx
│   │   ├── review/page.tsx
│   │   ├── audit/page.tsx
│   │   ├── query/page.tsx
│   │   └── model/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── ingest/connect/route.ts
│       ├── ingest/preview/route.ts
│       ├── pipeline/run/route.ts
│       ├── ubids/route.ts
│       ├── ubids/[id]/route.ts
│       ├── review/route.ts
│       ├── review/[id]/decide/route.ts
│       ├── activity/classify/route.ts
│       ├── audit/route.ts
│       ├── query/route.ts
│       ├── stats/route.ts
│       └── model/route.ts
├── lib/
│   ├── db/schema.ts                ← Drizzle schema
│   ├── db/index.ts                 ← Neon connection
│   ├── fpe.ts                      ← FF3-1 format-preserving encryption
│   ├── normalise.ts                ← name/address canonicalisation
│   ├── er/pipeline.ts              ← ER engine (block → score → decide)
│   └── activity/classifier.ts     ← Active/Dormant/Closed rules
├── components/
│   ├── ui/                         ← shadcn base components
│   └── ubid/                       ← DataTable, Timeline, Badge, ConfidenceBar, StepperHeader
├── drizzle.config.ts
└── README.md
```

---

## Blockers to resolve before Day 1 starts

| Item | Owner | Action |
|------|-------|--------|
| Neon DB provisioned | Samarth | Create free project at neon.tech, copy `DATABASE_URL` |
| Vercel project created | Samarth | `vercel link`, add env vars |
| Repo created + all 3 have access | Anirudh | GitHub repo, add Pavan + Samarth as collaborators |
| `npm install` passes clean | All | Pull repo, run install, confirm no errors |

---

## Daily time budget (per person)

| Block | Time | Focus |
|-------|------|-------|
| Morning sync | 9:00–9:15 | Unblock dependencies, agree on interfaces |
| Build block 1 | 9:15–1:00 | Deep work, no meetings |
| Lunch | 1:00–2:00 | |
| Build block 2 | 2:00–6:00 | Deep work |
| Evening sync | 6:00–6:30 | Demo what you built, push to main, set Day N+1 tasks |

**Total build time per person: ~28h across 3 days.**
