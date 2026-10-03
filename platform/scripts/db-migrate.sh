#!/usr/bin/env bash
# 把 supabase/migrations/ 裡還沒套用的 migration 依序推到 SUPABASE_DB_URL（每支一個交易）。
# 已套用的記在 _migrations 表；只會新增，不會重跑或刪除。連線字串從 .env.local 讀，不印出來。
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; source .env.local; set +a
: "${SUPABASE_DB_URL:?SUPABASE_DB_URL 未設定}"
applied=$(psql "$SUPABASE_DB_URL" -tA -v ON_ERROR_STOP=1 -c \
  "select coalesce(string_agg(name, ' '), '') from _migrations" 2>/dev/null || echo "")
for f in supabase/migrations/*.sql; do
  name=$(basename "$f" .sql)
  if [[ " $applied " == *" $name "* ]]; then
    echo "略過（已套用）$name"
    continue
  fi
  echo "套用 $name"
  psql "$SUPABASE_DB_URL" -q -v ON_ERROR_STOP=1 -1 -f "$f"
done
