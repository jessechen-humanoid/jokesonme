#!/usr/bin/env bash
# 本機演練：建拋棄式資料庫 jokesonme_rehearsal → 套全部 migration → 搬家 → 對帳 → 再搬一次（應被拒絕）。
# 只動本機名為 jokesonme_rehearsal 的資料庫。
set -euo pipefail
cd "$(dirname "$0")/.."
XLSX="${1:?請給 xlsx 路徑}"
DB=jokesonme_rehearsal
export DATABASE_URL="postgresql:///$DB"
dropdb --if-exists "$DB"; createdb "$DB"
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/test/local-shim.sql
for f in supabase/migrations/*.sql; do psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$f"; done
node scripts/legacy-oracle.mts "$XLSX" > /tmp/jokesonme-oracle.json 2>/dev/null
echo "== 第一次搬家"; node scripts/migrate-from-sheet.mts "$XLSX" 2>/dev/null
echo "== 對帳"; node scripts/reconcile.mts db /tmp/jokesonme-oracle.json 2>/dev/null
echo "== 再搬一次（應該被拒絕）"
if node scripts/migrate-from-sheet.mts "$XLSX" 2>/dev/null; then echo "FAIL：重複搬家沒被擋"; exit 1; else echo "OK：重複搬家被拒絕"; fi
