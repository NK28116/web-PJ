#!/bin/bash
# backup-db.sh — GCE PostgreSQL → Cloud Storage 日次バックアップ
# Usage: Run via cron on GCE instance
# Requires: gsutil configured, Docker running with postgres container

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/tmp/wyze_db_${TIMESTAMP}.backup"
GCS_BUCKET="gs://wyze-staging-backups"
RETAIN_DAYS=7

echo "[$(date)] Starting database backup..."

# Dump database
docker exec -e PGPASSWORD=wyze_staging_2026 postgres \
  pg_dump -h localhost -U wyze_app -d wyze_db --no-owner --no-acl -F c -f "/tmp/wyze_db_${TIMESTAMP}.backup"

# Copy dump out of container
docker cp "postgres:/tmp/wyze_db_${TIMESTAMP}.backup" "${BACKUP_FILE}"

# Upload to Cloud Storage
gsutil cp "${BACKUP_FILE}" "${GCS_BUCKET}/wyze_db_${TIMESTAMP}.backup"

# Clean up local file
rm -f "${BACKUP_FILE}"
docker exec postgres rm -f "/tmp/wyze_db_${TIMESTAMP}.backup"

# Remove backups older than RETAIN_DAYS from GCS
CUTOFF_DATE=$(date -d "-${RETAIN_DAYS} days" +%Y%m%d 2>/dev/null || date -v-${RETAIN_DAYS}d +%Y%m%d)
gsutil ls "${GCS_BUCKET}/" | while read -r file; do
  FILE_DATE=$(echo "$file" | grep -oP '\d{8}' | head -1)
  if [ -n "$FILE_DATE" ] && [ "$FILE_DATE" -lt "$CUTOFF_DATE" ]; then
    echo "Removing old backup: $file"
    gsutil rm "$file"
  fi
done

echo "[$(date)] Backup completed: ${GCS_BUCKET}/wyze_db_${TIMESTAMP}.backup"
