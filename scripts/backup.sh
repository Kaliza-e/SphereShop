#!/bin/bash
# Backup script for SphereShop PostgreSQL DB (RPO <= 24h)
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/sphereshop_db_${TIMESTAMP}.sql"

mkdir -p ${BACKUP_DIR}

echo "Starting SphereShop DB backup..."
pg_dump -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-cloudsphere} -d ${DB_NAME:-cloudsphere} > ${BACKUP_FILE}

if [ $? -eq 0 ]; then
  echo "Backup successfully created at ${BACKUP_FILE}"
else
  echo "Backup failed!"
  exit 1
fi
