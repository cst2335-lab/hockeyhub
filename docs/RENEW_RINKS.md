# Renew Rinks List

How to refresh the `rinks` table. Prefer **CSV import** (avoids SQL escaping and timeout issues).

---

## 推荐：CSV 导入（避免 SQL 报错）

1. 把两个 CSV 放在桌面：
   - `rinks_rows.csv` — 项目完整冰场数据（含 outdoor）
   - `rinks_rows (1).csv` — 同事项目的室内冰场数据（含电话、预订链接）

2. 运行导入脚本：

```bash
# 先预览（dry-run）
node scripts/import-rinks-from-csv.mjs

# 执行 upsert（需 SUPABASE_SERVICE_KEY）
node scripts/import-rinks-from-csv.mjs --apply
```

3. 若需清空后导入，先在 Supabase SQL Editor 执行：

```sql
TRUNCATE rinks CASCADE;
```

再运行 `--apply`。

4. 导入后重建搜索向量（在 Supabase SQL Editor 执行）：

```sql
UPDATE rinks SET search_vector = setweight(to_tsvector('english', coalesce(name,'') || ' ' || coalesce(address,'')), 'A') WHERE search_vector IS NULL;
```

---

## SQL 方式（备选）

若必须用 SQL，先运行 `node scripts/fix-rinks-sql.mjs` 将 `search_vector` 替换为 NULL，再在 Supabase 执行 `scripts/rinks_rows.sql`。SQL 易因 tsvector 转义或单条语句过长报错。

---

## 相关

- [API.md](./API.md) — `/api/sync-ottawa-rinks`
- [SUPABASE_RLS.sql](./SUPABASE_RLS.sql) — RLS policies
