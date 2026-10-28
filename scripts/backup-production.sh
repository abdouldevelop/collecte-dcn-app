#!/bin/sh
set -eu

APP_DIR="/home/linux-admin/apps/dcn.stats.ci"
BACKUP_DIR="$APP_DIR/backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

docker exec dcn_stats_db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' \
  | gzip > "$BACKUP_DIR/dcn_stats_$TIMESTAMP.sql.gz"

find "$BACKUP_DIR" -type f -name 'dcn_stats_*.sql.gz' -mtime +14 -delete
