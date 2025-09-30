#!/bin/bash
set -e
echo "🗄️  Inicialização do Database"
read -p "Database URL: " DATABASE_URL
psql "$DATABASE_URL" < backend/src/config/schema.sql
echo "✅ Schema executado!"