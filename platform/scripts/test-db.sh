#!/usr/bin/env bash
# 在本機 Postgres 建一個拋棄式測試庫，套用全部 migration 後跑 supabase/test/*.test.sql。
# 只動名為 jokesonme_test 的本機資料庫，不碰 Supabase 正式庫。
set -euo pipefail
cd "$(dirname "$0")/.."
DB=jokesonme_test
dropdb --if-exists "$DB"
createdb "$DB"
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/test/local-shim.sql
for f in supabase/migrations/*.sql; do
  psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$f"
done
for t in supabase/test/*.test.sql; do
  echo "== $t"
  psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$t"
done
