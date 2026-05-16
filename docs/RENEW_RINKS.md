# 刷新冰场数据（rinks）

优先使用 **CSV 导入**，避免 SQL 转义与超时问题。

---

## CSV 导入（推荐）

1. 将 CSV 放在桌面或 `scripts/data/`：
   - `rinks_rows.csv` — 完整列表（含 outdoor）
   - `rinks_rows_colleague.csv` 或 `rinks_rows (1).csv` — 室内场馆补充（电话、预订链接）

2. 运行：

```bash
# 预览
node scripts/import-rinks-from-csv.mjs

# 写入（需 SUPABASE_SERVICE_KEY）
npm run db:import-rinks -- --apply
```

3. 若需清空后导入，先在 Supabase SQL Editor：

```sql
TRUNCATE rinks CASCADE;
```

4. 导入后重建搜索向量：

```sql
UPDATE rinks SET search_vector = setweight(to_tsvector('english', coalesce(name,'') || ' ' || coalesce(address,'')), 'A') WHERE search_vector IS NULL;
```

---

## SQL 方式（备选）

```bash
node scripts/fix-rinks-sql.mjs
```

然后在 Supabase 执行 `scripts/sql/rinks-rows.sql`（大文件易报错，仅作备选）。

---

## 图片与 Top 20

- 列迁移与批量标记：`scripts/sql/rinks-images.sql`
- 脚本：`npm run db:mark-top20-images -- --apply`

---

## 相关

- [API.md](./API.md) — `/api/sync-ottawa-rinks`
- [scripts/sql/supabase-rls.sql](../scripts/sql/supabase-rls.sql) — RLS
