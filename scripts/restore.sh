#!/bin/bash
# Restore script for SphereShop PostgreSQL DB
if [ -z "$1" ]; then
  echo "Usage: ./restore.sh <path_to_backup.sql>"
  exit 1
fi

BACKUP_FILE=$1

echo "Restoring SphereShop DB from ${BACKUP_FILE}..."
psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-cloudsphere} -d ${DB_NAME:-cloudsphere} < ${BACKUP_FILE}

if [ $? -eq 0 ]; then
  echo "Database restored successfully."
else
  echo "Restore failed!"
  exit 1
fi
