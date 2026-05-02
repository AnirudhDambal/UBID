# UBID Platform - Unique Business Identifier System

An end-to-end platform for entity resolution and business activity intelligence, designed to unify fragmented government datasets and generate a single, reliable identifier (UBID) for each business.

Built as part of the AI for Bharat Hackathon (Karnataka Commerce & Industries).

---

## Problem Statement

Government data is siloed across multiple departments (Factories, Labour, Pollution Control, etc.), leading to:

* Duplicate business records
* Inconsistent identifiers
* Poor visibility into business activity
* No unified audit trail

The UBID platform solves this by:

1. Entity Resolution — Linking records across systems
2. Activity Inference — Classifying business status (Active / Dormant / Closed)

---

## Core Principles

* Avoid false merges (precision > recall)
* No raw PII exposure (FPE encryption)
* Fully auditable decisions (append-only logs + reversibility)

---

## Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Frontend   | Next.js 15 (App Router), TypeScript, Tailwind |
| Backend    | FastAPI (Python 3.12), Pydantic               |
| ER Engine  | Splink (Fellegi-Sunter model)                 |
| DB         | PostgreSQL + Apache AGE (graph)               |
| Queue      | Celery + Redis                                |
| Security   | FF3-1 Format Preserving Encryption            |
| Infra      | Docker → Kubernetes                           |
| Monitoring | OpenTelemetry + Grafana                       |

---

## Key Features

### 1. Entity Resolution Engine

* Probabilistic matching using:

  * Jaro-Winkler
  * Token similarity
  * Phonetic encoding

* Confidence-based decisions:

  * ≥ 0.95 → Auto merge
  * 0.70–0.95 → Human review
  * < 0.70 → Ignore

---

### 2. Reviewer Workflow

* Queue of ambiguous matches
* Side-by-side comparison UI
* Evidence-based decision system
* One-click unmerge (full rollback)

---

### 3. Activity Classification

Each business (UBID) is classified:

* Active → recent activity ≤ 6 months
* Dormant → 6–18 months gap
* Closed → >18 months or explicit closure

---

### 4. Query Engine

Supports key analytical queries:

* Active businesses by district
* Factories without inspection
* Compliance gap detection

---

### 5. Security Architecture

* Raw PII stored in isolated database
* All processing uses encrypted data (FPE)
* Key management via KMS/Vault
* Strict access control and audit logging

---

## System Architecture

```
[ Next.js (UI + BFF) ]
          ↓
[ FastAPI (API Layer) ]
          ↓
[ PostgreSQL + Graph (AGE) ]
          ↓
[ Celery Workers + Splink ]
```

* No direct DB access from frontend
* All operations go through API (audit boundary enforced)

---

## Data Model (Core Tables)

* `ubids` → canonical business records
* `source_records` → ingested raw data
* `linkage_edges` → graph relationships
* `review_tasks` → human validation queue
* `audit_log` → immutable system history
* `activity_events` → time-series events

---

## API Overview

| Method | Endpoint                      | Purpose            |
| ------ | ----------------------------- | ------------------ |
| POST   | `/api/ingest/batch`           | Ingest data        |
| GET    | `/api/ubid/{id}`              | Fetch UBID details |
| GET    | `/api/review/queue`           | Reviewer tasks     |
| POST   | `/api/review/{id}/decide`     | Submit decision    |
| GET    | `/api/activity/{id}/timeline` | Activity history   |
| DELETE | `/api/ubid/{id}/merge/{edge}` | Undo merge         |

---

## Performance Targets

* ER Precision ≥ 99%
* Recall ≥ 95%
* API latency < 200ms @ 100 RPS
* Ingestion → 10,000 records/min
* PII leakage → 0 incidents

---

## Deployment Phases

1. Foundation & Infrastructure
2. Data Ingestion + Entity Resolution
3. Reviewer Workflow
4. Activity Inference
5. Active Learning Loop
6. Security Hardening
7. Production Launch

---

## Team Structure

* Backend Engineers (2)
* Frontend Engineer (1)
* Data/ML Engineer (1)
* DevOps Engineer (1)
* Product/QA (1)

---

## Risks & Mitigations

| Risk             | Mitigation              |
| ---------------- | ----------------------- |
| Model drift      | Weekly retraining       |
| Reviewer backlog | Priority scoring        |
| Graph scaling    | Indexing + partitioning |
| PII exposure     | HSM + isolated DB       |

---

## Getting Started (Local)

```bash
# Clone repo
git clone <repo-url>

# Start services
docker-compose up

# Run API
cd apps/api && uvicorn main:app --reload

# Run frontend
cd apps/web && npm run dev
```

---

## Future Improvements

* Survival models for activity prediction
* Real-time streaming ingestion
* Advanced ML-based entity resolution
* Multi-state data integration

---

## License

To be decided (recommended: Proprietary or Apache 2.0 depending on business strategy)

---

## Contributing

PRs are welcome. Follow:

* Trunk-based development
* Mandatory code reviews
* Migration + type updates required
