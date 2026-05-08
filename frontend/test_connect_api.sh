#!/bin/bash

# Test 1: Valid MongoDB
echo "\n--- Testing MongoDB Connection ---"
curl -X POST http://localhost:3000/api/ingest/connect \
  -H "Content-Type: application/json" \
  -d '{
    "db_type": "mongodb",
    "url": "mongodb+srv://ubid_reader:demo123@cluster0.karnataka.net/biz_registry",
    "system_label": "ShopEstablishment",
    "environment": "production"
  }'

# Test 2: Valid PostgreSQL
echo "\n\n--- Testing PostgreSQL Connection ---"
curl -X POST http://localhost:3000/api/ingest/connect \
  -H "Content-Type: application/json" \
  -d '{
    "db_type": "postgresql",
    "url": "postgresql://postgres:pass123@localhost:5432/factories_db",
    "system_label": "FactoriesAct",
    "environment": "staging"
  }'

# Test 3: Valid MySQL
echo "\n\n--- Testing MySQL Connection ---"
curl -X POST http://localhost:3000/api/ingest/connect \
  -H "Content-Type: application/json" \
  -d '{
    "db_type": "mysql",
    "url": "mysql://root:root@127.0.0.1:3306/labour_registry",
    "system_label": "LabourDept",
    "environment": "development"
  }'

# Test 4: Invalid URL format rejection
echo "\n\n--- Testing Invalid URL Format ---"
curl -X POST http://localhost:3000/api/ingest/connect \
  -H "Content-Type: application/json" \
  -d '{
    "db_type": "postgresql",
    "url": "mysql://wrong-protocol.com/db",
    "system_label": "Custom",
    "environment": "development"
  }'
